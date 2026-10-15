import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { T, color, space, ty, radius, PILL } from '../system';
import { Icon } from '../icons';
import { Text, IconBox, SectionLinkButton } from './primitives';
import { Button } from './Button/Button';
import { Scrim } from './overlays';

export type StatusTone = 'info' | 'positive' | 'warning' | 'danger';
// Used only by the deprecated centred AlertModal dialog below.
const TONE_COLOR: Record<StatusTone, string> = {
  info: color('status.default'), positive: color('status.positive'),
  warning: color('status.warning'), danger: color('status.danger'),
};
// Icon-set names, not glyphs — see src/icons.
const TONE_ICON: Record<StatusTone, string> = { info: 'info', positive: 'check', warning: 'warning', danger: 'close' };

// useLayoutEffect warns under SSR; fall back to useEffect there (the measurement is a
// progressive enhancement either way).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ---------------- PlanUsageBar ---------------- */
/** Figma `Progress status` (28927:22814): the fill is green normally, orange on low data.
 *  Two discrete states, not a gradient — the caller decides when "low" starts, because
 *  the threshold is a product rule (it differs for data, minutes and roaming), not a
 *  property of the bar. `color/green/550` in Figma is `green.600` in our variables export;
 *  same value (#54bc72), different step name. */
export type PlanUsageStatus = 'default' | 'low-data';
const USAGE_FILL: Record<PlanUsageStatus, string> = {
  'default': color('green.600'),
  'low-data': color('orange.500'),
};
/** Figma `state` axis of `.plan-usage/value` 26437:43875, `.plan-usage/label` 26437:43902
 *  and `.plan-usage/content` 28429:50789: `filled` is the ink used where the coloured
 *  block sits under the text. */
export type PlanUsageTextState = 'default' | 'filled';

export interface PlanUsageBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Category name, right-aligned in the track — e.g. "Local Data". */
  label?: ReactNode;
  /** Amount left in the plan. This is what the block shows and measures. */
  remaining?: number;
  /** @deprecated Pass `remaining`. Kept so `used`-based call sites keep working. */
  used?: number;
  /** Plan allowance the block is measured against. */
  total: number;
  unit?: string;
  /** Second line under the value, e.g. "Expires 3 days". */
  note?: ReactNode;
  status?: PlanUsageStatus;
  /** Ink of the value and note. Omit to switch automatically once the fill covers them. */
  valueState?: PlanUsageTextState;
  /** Ink of the category label. Omit to switch automatically once the fill covers it. */
  labelState?: PlanUsageTextState;
}

/* Text on the bar, per the published `.plan-usage-bar-set` 33838:4470 (progress 55 and 65
   put the value on the green block):
     value  default  title/xs (SemiBold 14) on color/button/text/midnight/default #191329
            filled   button/md (Medium 14)   on color/text/default/inverse
     note   default  body/sm, line height 130% on the node, text/default/default
            filled   the same, text/default/inverse
     label  default  button/md on Text/Action/Midnight/Default (legacy name, #191329)
            filled   button/md on text/default/inverse
   `color/button/text/midnight/default` is not in the token export; it and the legacy
   label variable resolve to the same #191329 as text/default/default, which is bound here.
   Figma flips the state by hand per instance. Here it follows the measured geometry: a
   run is `filled` when the fill spans it completely, unless the caller pins the state. */
const valueInk = (s: PlanUsageTextState) => (s === 'filled' ? color('text.default.inverse') : color('text.default.default'));

/** Usage meter: a 48px rounded row where a coloured block shows how much of the plan is
 *  left. The amount reads inside the block, the category label sits in the track opposite.
 *  Figma `.plan-usage-bar` 28927:23669. Stack them with a 4px gap for a plan breakdown. */
export function PlanUsageBar({
  label = 'Data', remaining, used, total, unit = 'GB', note, status = 'default',
  valueState, labelState, style, ...rest
}: PlanUsageBarProps) {
  const left = remaining ?? (used != null ? total - used : 0);
  // Guard the whole range: a plan with no allowance has nothing to draw (and would divide
  // by zero), and a top-up can leave more than the allowance without overflowing the track.
  const pct = total > 0 ? Math.min(100, Math.max(0, (left / total) * 100)) : 0;

  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [covered, setCovered] = useState({ value: false, label: false });
  const measure = useRef(() => {});
  measure.current = () => {
    const f = fillRef.current?.getBoundingClientRect();
    const covers = (el: HTMLElement | null) => {
      const r = el?.getBoundingClientRect();
      // No layout (SSR, jsdom, display:none) measures as zero: stay on the default ink.
      return !!f && !!r && f.width > 0 && r.width > 0 && f.left <= r.left + 0.5 && f.right >= r.right - 0.5;
    };
    const next = { value: covers(valueRef.current), label: covers(labelRef.current) };
    setCovered((prev) => (prev.value === next.value && prev.label === next.label ? prev : next));
  };
  // Re-measure after every render (copy, unit, fill and weight all move the edges) and on
  // resize. The filled value is Medium, narrower than the SemiBold default, so a run that
  // fits stays covered after it switches — the two states cannot flip-flop.
  useIsoLayoutEffect(() => { measure.current(); });
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return;
    const ro = new ResizeObserver(() => measure.current());
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  const vState: PlanUsageTextState = valueState ?? (covered.value ? 'filled' : 'default');
  const lState: PlanUsageTextState = labelState ?? (covered.label ? 'filled' : 'default');
  const run = (pad: boolean): CSSProperties => (pad ? { paddingInlineEnd: space('2xs') } : {});

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-valuenow={left}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={`${left} ${unit} left`}
      style={{
        position: 'relative', width: '100%', height: 48, boxSizing: 'border-box',
        background: color('surface.canvas.inverse'), borderRadius: radius('4'), overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div
        ref={fillRef}
        data-part="fill"
        style={{
          position: 'absolute', insetBlock: 0, insetInlineStart: 0, width: `${pct}%`,
          background: USAGE_FILL[status], borderRadius: radius('4'),
        }}
      />
      {/* Above the fill, spanning the full track: the value rides over the block while the
          label stays out on the plain background, exactly as the Figma overlay does. */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: space('sm'), padding: `0 ${space('lg')}`,
      }}>
        <span ref={valueRef} data-part="value-block" data-state={vState}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          {/* Three runs — amount, unit, "left" — each spaced by a spacing/2xs pad, not a space. */}
          <span data-part="value" style={{
            display: 'flex', whiteSpace: 'nowrap',
            ...ty(vState === 'filled' ? 'button.md' : 'title.xs'), color: valueInk(vState),
          }}>
            <span style={run(true)}>{left}</span><span style={run(true)}>{unit}</span><span>left</span>
          </span>
          {note != null ? (
            <Text variant="body.sm" as="span" color={valueInk(vState)} style={{ lineHeight: '1.3' }}>{note}</Text>
          ) : null}
        </span>
        <span ref={labelRef} data-part="label" data-state={lState} style={{
          ...ty('button.md'), color: valueInk(lState), textAlign: 'end', whiteSpace: 'nowrap',
        }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------------- Status tile glyphs (shared by Snackbar + Alert) ----------------
   `.icon-status` 37200:6963: filled icon-set glyphs, one per status. Figma's `alert` is the
   amber step and its `warning` the orange one (see Alert below). */
const STATUS_GLYPH = {
  success: 'check-circle-filled', alert: 'warning-filled', warning: 'dismiss-filled', info: 'info-filled',
} as const;

/** Loader for `.icon-status` status=Loader: `Ellipse 35`, 20x20 inside a 24 box, a 3px
 *  inside stroke with round caps, open at one end. animateTransform spins it without CSS
 *  keyframes. Not an icon-set glyph — the set has no loader. */
function Loader({ size = 24, stroke }: { size?: number; stroke: string }) {
  const r = 8.5; // 10 radius, stroke 3 drawn inside -> centreline at 8.5
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: 'block' }}>
      <circle cx="12" cy="12" r={r} stroke={stroke} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${(c * 300) / 360} ${c}`}>
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ---------------- Snackbar ----------------
   Figma V1.2 `Snack-bar` 40278:34192 (axis `back-ground` yes|no) around `.snack-bar-core`
   37211:9193:
     pill   surface/base/midnight, border-radius/6 = 16, padding 2/8/2/2 (spacing/2xs,
            spacing/sm), min 48 tall, gap 10 (unbound on the symbol — used literally)
     tile   `.icon-snackbar-status` 37211:9101: 44x44, border-radius/5 = 14, padding 6,
            status-indicator/surface/<status>, a 24px filled glyph in alert-message/text/info
     text   `text primary` body/md Regular 14/140% on text/default/inverse; `aed-text`
            aed/title/xs SemiBold 14/140%, 3px after it (gap unbound — literal)
     action `button` primary / sm / inverse (bool `Show button`)

   design-questions #6 is resolved by V1.2: the marks no longer use the legacy colour
   styles (#47cb6c / #d05d0a / #d5b549). Status names follow Figma; the V1.0 `tone` names
   map onto them with the same middle swap as Alert:
     positive -> success | warning -> alert (amber) | danger -> warning (orange) | loading -> loader

   Kept from V1.0 although Figma has no counterpart (all @deprecated): `subtitle`,
   `onDismiss`, the mark-less centred `tone="default"`, and centring for `tone="loading"`. */
export type SnackbarStatus = 'success' | 'alert' | 'warning' | 'info' | 'loader';
/** @deprecated V1.0 names. Use `status`; note warning->alert and danger->warning. */
export type SnackbarTone = 'positive' | 'danger' | 'warning' | 'loading' | 'default';

const SNACK_TONE_TO_STATUS: Record<Exclude<SnackbarTone, 'default'>, SnackbarStatus> = {
  positive: 'success', warning: 'alert', danger: 'warning', loading: 'loader',
};
const SNACK_TILE: Record<SnackbarStatus, string> = {
  success: color('status-indicator.surface.positive'),
  alert: color('status-indicator.surface.warning'),
  warning: color('status-indicator.surface.danger'),
  info: color('status-indicator.surface.neutral'),
  loader: color('status-indicator.surface.neutral'),
};
/* `back-ground=yes` 40278:34191: a 15%-opacity linear gradient #3f3f3f -> #ffffff@0
   rising from the bottom edge, under a progressive background blur 0 -> 8. Neither the
   gradient nor its stops are bound to variables, so the symbol's values are used
   literally — see NOTES / design questions. */
const SNACK_BACKDROP = 'linear-gradient(to top, rgba(63, 63, 63, 0.15), rgba(255, 255, 255, 0))';

export interface SnackbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `.icon-snackbar-status` axis. Takes precedence over `tone`. Default `info`. */
  status?: SnackbarStatus;
  /** @deprecated Use `status`. `tone="default"` still renders the old bare, centred message. */
  tone?: SnackbarTone;
  message: ReactNode;
  /** Figma `aed-text` — an amount after the message, e.g. "AED 60.00". */
  aed?: ReactNode;
  /** @deprecated The V1.2 snack bar has no second line. */
  subtitle?: ReactNode;
  /** Label of the primary / sm / inverse button (Figma `Show button`). */
  action?: ReactNode;
  onAction?: () => void;
  /** @deprecated The V1.2 snack bar has no dismiss control. */
  onDismiss?: () => void;
  /** Figma `back-ground=yes`: a blurred gradient scrim behind the pill, for busy content. */
  backdrop?: boolean;
}
export function Snackbar({
  status, tone, message, aed, subtitle, action, onAction, onDismiss, backdrop, style, ...rest
}: SnackbarProps) {
  const bare = !status && tone === 'default';
  const s: SnackbarStatus = status ?? (tone && tone !== 'default' ? SNACK_TONE_TO_STATUS[tone] : 'info');
  const centred = bare || (!status && tone === 'loading');
  const ink = color('text.default.inverse');

  const pill = (
    <div role="status" data-status={bare ? undefined : s} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', boxSizing: 'border-box',
      minHeight: 48,
      padding: bare ? `${space('2xs')} ${space('md')}` : `${space('2xs')} ${space('sm')} ${space('2xs')} ${space('2xs')}`,
      borderRadius: radius('6'), background: color('surface.base.midnight'), color: ink,
      justifyContent: centred ? 'center' : 'flex-start',
      ...(backdrop ? {} : style),
    }} {...(backdrop ? {} : rest)}>
      {bare ? null : (
        <span data-part="status-tile" aria-hidden style={{
          width: 44, height: 44, flex: 'none', boxSizing: 'border-box', padding: 6,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: radius('5'), background: SNACK_TILE[s],
        }}>
          {s === 'loader'
            ? <Loader stroke={color('button.tertiary.text.midnight.default')} />
            : <Icon name={STATUS_GLYPH[s]} size={24} color={color('alert-message.text.info')} />}
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', flex: centred ? '0 1 auto' : 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: centred ? 'center' : 'flex-start' }}>
          <Text as="span" variant="body.md" color={ink} style={{ textAlign: centred ? 'center' : 'start' }}>{message}</Text>
          {aed != null ? (
            <Text as="span" variant="title.xs" color={ink} style={{
              fontSize: T.typography.aed.title.xs.fontSize, fontWeight: T.typography.aed.title.xs.fontWeight,
              lineHeight: '1.4', // 140% on the `aed-text` node
            }}>{aed}</Text>
          ) : null}
        </span>
        {subtitle ? <Text as="div" variant="body.md" color={color('text.default.inverse-subtle')}>{subtitle}</Text> : null}
      </span>
      {action ? (
        <Button variant="primary" size="sm" surface="inverse-brand" onClick={onAction} style={{ flex: 'none' }}>{action}</Button>
      ) : null}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{
          border: 0, background: 'transparent', cursor: 'pointer', color: color('text.default.inverse-subtle'),
          padding: 0, display: 'inline-flex', flex: 'none',
        }}><Icon name="close" size={20} /></button>
      ) : null}
    </div>
  );

  if (!backdrop) return pill;
  return (
    <div data-part="backdrop" style={{
      position: 'relative', width: '100%', boxSizing: 'border-box',
      // padding 0/16/32/16: the sides bind spacing/lg; the 32 bottom is unbound on 40278:34191.
      padding: `0 ${space('lg')} 32px ${space('lg')}`,
      background: SNACK_BACKDROP, ...style,
    }} {...rest}>
      {/* Progressive blur, approximated: full 8px blur masked from half strength at the top. */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), #000)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), #000)',
      } as CSSProperties} />
      <div style={{ position: 'relative' }}>{pill}</div>
    </div>
  );
}

/* ---------------- Alert (inline status message) ----------------
   Figma V1.2 `alert-message` 40289:34516 (axis `Stack` no|yes), built on
   `.alert-message-core` 37215:9573 (axis `State`), `.text-block-core` 37215:9385 and
   `.icon-alertmessage-status` 37211:7997. The previous build tracked 30969:1112, whose
   frame reads "OUTDATED (do not use)".

     box    padding spacing/sm 8, gap spacing/md 12, border-radius/6 16
     State  surface                              tile (32x32, border-radius/4 12)  glyph
     Success  status-indicator/surface/positive  status/positive                  check-circle
     Alert    status-indicator/surface/warning   status/warning                   warning
     Warning  status-indicator/surface/danger    status/danger                    dismiss
     Info     status-indicator/surface/neutral   status/default                   info
     Info Midnight alert-message/surface/midnight surface/glass/white/md          info
     glyph  16px filled, text/default/inverse, on every State
     text   title title/xs, body body/md, both text/default/default (Info Midnight:
            text/default/inverse) — the ink no longer follows the State
     action `button` primary / sm / inverse

   Figma's `Alert` is the amber step and its `Warning` the orange one, which is why the
   V1.0 `tone="warning"` resolves to status `alert`. V1.2 has no red alert (closes
   design-questions 5c): orange "Warning" binds status-indicator/surface/danger.

   Info Midnight: a second published set, `alert-message` 40266:31340, binds
   surface/base/midnight #191329 instead of #140f21. This follows 40289 (see NOTES). */
export type AlertStatus = 'success' | 'alert' | 'warning' | 'info' | 'info-midnight';
/** @deprecated V1.0 names. Use `status`; note warning->alert and danger->warning. */
export type AlertTone = 'positive' | 'warning' | 'danger' | 'default';
/** Where the CTA sits: `end` of a one-line row, or `below` a longer text block
 *  (`.text-block-core` Content=yes). */
export type AlertActionPlacement = 'end' | 'below';

const TONE_TO_STATUS: Record<AlertTone, AlertStatus> = {
  positive: 'success', warning: 'alert', danger: 'warning', default: 'info',
};
const ALERT_STATUS: Record<AlertStatus, { bg: string; tile: string; glyph: string; ink: string }> = {
  success: { bg: color('status-indicator.surface.positive'), tile: color('status.positive'), glyph: STATUS_GLYPH.success, ink: color('text.default.default') },
  alert:   { bg: color('status-indicator.surface.warning'), tile: color('status.warning'), glyph: STATUS_GLYPH.alert, ink: color('text.default.default') },
  warning: { bg: color('status-indicator.surface.danger'), tile: color('status.danger'), glyph: STATUS_GLYPH.warning, ink: color('text.default.default') },
  info:    { bg: color('status-indicator.surface.neutral'), tile: color('status.default'), glyph: STATUS_GLYPH.info, ink: color('text.default.default') },
  'info-midnight': { bg: color('alert-message.surface.midnight'), tile: color('surface.glass.white.md'), glyph: STATUS_GLYPH.info, ink: color('text.default.inverse') },
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `State` axis. Takes precedence over `tone`. */
  status?: AlertStatus;
  /** @deprecated Use `status`; `warning` maps to `alert` and `danger` to `warning`. */
  tone?: AlertTone;
  title?: ReactNode;
  /** Label of the primary / sm / inverse button. One CTA per alert. */
  action?: ReactNode;
  onAction?: () => void;
  /** Default `end`. Use `below` when the body runs to several lines. */
  actionPlacement?: AlertActionPlacement;
  /** Figma `Stack=yes`: how many alerts share this slot (2+ draws the step counter). */
  stack?: number;
  /** Which stacked alert is in view, 0-based. */
  stackIndex?: number;
  children?: ReactNode;
}

/** `alert-step-count-core` 40278:33974: 5px dots on color/midnight/400, 4px apart; the
 *  dot in view is a 5x12 pill holding a 5x5 surface/canvas/midnight head. */
function StepCount({ count, active }: { count: number; active: number }) {
  return (
    <span aria-hidden data-part="step-count" style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), flex: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} data-part="step-dot" style={{
          width: 5, height: i === active ? 12 : 5, borderRadius: PILL, overflow: 'hidden',
          background: color('midnight.400'), display: 'block',
        }}>
          {i === active ? <span style={{ display: 'block', width: 5, height: 5, borderRadius: PILL, background: color('surface.canvas.midnight') }} /> : null}
        </span>
      ))}
    </span>
  );
}

export function Alert({
  status, tone, title, action, onAction, actionPlacement = 'end', stack, stackIndex = 0,
  children, style, ...rest
}: AlertProps) {
  const s: AlertStatus = status ?? (tone ? TONE_TO_STATUS[tone] : 'info');
  const t = ALERT_STATUS[s];
  const below = actionPlacement === 'below';
  const stacked = stack != null && stack > 1;
  const cta = action ? (
    <Button variant="primary" size="sm" surface="inverse-brand" onClick={onAction} style={{ flex: 'none' }}>{action}</Button>
  ) : null;

  const box = (
    <div role="status" data-status={s} style={{
      display: 'flex', alignItems: below ? 'flex-start' : 'center', gap: space('md'),
      width: '100%', boxSizing: 'border-box', flex: stacked ? 1 : undefined, minWidth: 0,
      padding: space('sm'), borderRadius: radius('6'), background: t.bg,
      ...(stacked ? {} : style),
    }} {...(stacked ? {} : rest)}>
      <span style={{ display: 'flex', flex: 'none', paddingBlock: below ? space('sm') : undefined }}>
        <span data-part="status-tile" aria-hidden style={{
          width: 32, height: 32, boxSizing: 'border-box', padding: 6,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: radius('4'), background: t.tile,
        }}>
          <Icon name={t.glyph} size={16} color={color('text.default.inverse')} />
        </span>
      </span>
      <div data-part="text" style={{
        flex: 1, minWidth: 0, display: 'flex',
        flexDirection: below ? 'column' : 'row', alignItems: below ? 'flex-start' : 'center',
        gap: below ? space('sm') : space('md'), paddingBlock: below ? space('sm') : undefined,
      }}>
        <div style={{ flex: below ? undefined : 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {title ? <Text variant="title.xs" color={t.ink} as="div">{title}</Text> : null}
          {children ? <Text variant="body.md" color={t.ink} as="div">{children}</Text> : null}
        </div>
        {cta}
      </div>
    </div>
  );

  if (!stacked) return box;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space('xs'), width: '100%', ...style }} {...rest}>
      {box}
      <StepCount count={stack!} active={Math.min(Math.max(0, stackIndex), stack! - 1)} />
    </div>
  );
}

/* ---------------- AlertModal ----------------
   Figma V1.2 `alert-modal` 32934:67842 (axis `integration` full-screen | bottom-sheet;
   bools `cta-bar`, `ios-home-indicator`). It is a success screen, not a dialog:
     full-screen  32934:67797  surface/base/default; `Visual asset` frame (padding
                  spacing/xs 4/4/0/4) holding `status-banner`, then `alert-title`, then the
                  cta-bar; `top-group` lays a 40px glass `section-link` close over the top
     bottom-sheet 32934:67843  the same on a sheet with border-radius/8 top corners
   `alert-title` 32934:66061: padding 32/16/48/16 (spacing/3xl, lg, 5xl), gap spacing/xs,
   a centred title bound to typography/heading/lg/* (Bold 28 / 120% / -0.65) and a centred
   body/lg description, both text/default/default.

   NOT shipped: `status-banner` 32846:19638 is 3D illustration + outlined display
   lettering on unbound tints. Those assets are not in the repo, so `visual` is a slot.
   Also not drawn: the faux iOS status bar in `top-group` and the home indicator — a web
   page has the real ones.

   The V1.0 centred confirm dialog (design-questions 5d) is kept for existing callers: it
   renders when `integration` is unset and any of `tone`, `body` or `actions` is passed. */
export type AlertModalIntegration = 'full-screen' | 'bottom-sheet';
export interface AlertModalProps {
  open?: boolean;
  /** Figma `integration`. Default `full-screen`. */
  integration?: AlertModalIntegration;
  /** The `status-banner` hero (illustration). Framed with a 4px inset. */
  visual?: ReactNode;
  /** `alert-title` heading. */
  title?: ReactNode;
  /** `alert-title` description. */
  description?: ReactNode;
  /** The cta-bar content — usually one or two block `Button`s. Padded spacing/xl. */
  footer?: ReactNode;
  /** Shows the `top-group` close button. */
  onClose?: () => void;
  /** @deprecated Centred dialog only. */
  tone?: StatusTone;
  /** @deprecated Centred dialog only — use `description`. */
  body?: ReactNode;
  /** @deprecated Centred dialog only — use `footer`. */
  actions?: ReactNode;
  /** @deprecated Use `onClose`. Still dismisses on a scrim click in the centred dialog. */
  onDismiss?: () => void;
}

const HEADING_LG = T.typography.heading.lg;

function AlertTitle({ title, description }: { title?: ReactNode; description?: ReactNode }) {
  if (title == null && description == null) return null;
  return (
    <div data-part="alert-title" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('xs'),
      padding: `${space('3xl')} ${space('lg')} ${space('5xl')}`, textAlign: 'center',
    }}>
      {title != null ? (
        <Text as="h2" variant="heading.lg" style={{
          // Bound straight to the typography/heading/lg/* variables on the node, so these
          // are set explicitly rather than inherited from the heading/lg text style.
          fontSize: HEADING_LG.fontSize, fontWeight: HEADING_LG.fontWeight,
          lineHeight: HEADING_LG.lineHeight, letterSpacing: HEADING_LG.letterSpacing,
          textAlign: 'center', width: '100%',
        }}>{title}</Text>
      ) : null}
      {description != null ? (
        <Text as="p" variant="body.lg" style={{ textAlign: 'center', width: '100%' }}>{description}</Text>
      ) : null}
    </div>
  );
}

/** `top-group` 33166:53096 > `section-close` (end-aligned, padding 20/20/0/20): a glass,
 *  non-inverse `section-link`. The published instance shows `.section-link-action`
 *  type=forward (a chevron); the layer is named section-close, so the close glyph is used
 *  — logged as a design question. */
function GlassClose({ onClose }: { onClose: () => void }) {
  return (
    <SectionLinkButton aria-label="Close" onClick={onClose}
      icon={<Icon name="close" size={24} />}
      style={{
        background: color('section-link.glass.default.surface.default'),
        color: color('section-link.glass.default.icon.default'),
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: 'none',
      }} />
  );
}

export function AlertModal({
  open = true, integration, visual, title, description, footer, onClose,
  tone, body, actions, onDismiss,
}: AlertModalProps) {
  if (!open) return null;

  if (integration === undefined && (tone !== undefined || body !== undefined || actions !== undefined)) {
    const t = tone ?? 'info';
    return (
      <Scrim onClick={onDismiss} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space('lg') }}>
        <div role="dialog" aria-modal="true" data-variant="legacy-dialog" onClick={(e) => e.stopPropagation()} style={{
          width: '100%', maxWidth: 360, boxSizing: 'border-box', background: color('surface.raised.default'),
          borderRadius: radius('7'), padding: space('xl'), display: 'flex', flexDirection: 'column', gap: space('md'),
        }}>
          <span style={{ color: TONE_COLOR[t] }}><IconBox size="xl"><Icon name={TONE_ICON[t]} size={24} /></IconBox></span>
          {title ? <Text variant="heading.sm">{title}</Text> : null}
          {body ? <Text variant="body.md" color={color('text.default.subtle')}>{body}</Text> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm'), marginTop: space('sm') }}>{actions}</div>
        </div>
      </Scrim>
    );
  }

  const mode: AlertModalIntegration = integration ?? 'full-screen';
  const close = onClose ?? onDismiss;
  const content = (
    <>
      <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
        {visual != null ? (
          <div data-part="visual" style={{ padding: `${space('xs')} ${space('xs')} 0`, display: 'flex', flexDirection: 'column' }}>{visual}</div>
        ) : null}
        <AlertTitle title={title} description={description} />
      </div>
      {footer != null ? (
        <div data-part="footer" style={{ padding: space('xl') }}>{footer}</div>
      ) : null}
      {close ? (
        <div data-part="close" style={{ position: 'absolute', top: 0, insetInlineEnd: 0, padding: `${space('xl')} ${space('xl')} 0` }}>
          <GlassClose onClose={close} />
        </div>
      ) : null}
    </>
  );

  if (mode === 'full-screen') {
    return (
      <div role="dialog" aria-modal="true" data-variant="full-screen" style={{
        position: 'fixed', inset: 0, zIndex: 1000, boxSizing: 'border-box', overflowY: 'auto',
        background: color('surface.base.default'), display: 'flex', flexDirection: 'column',
      }}>{content}</div>
    );
  }
  return (
    <Scrim onClick={close} style={{ display: 'flex', alignItems: 'flex-end' }}>
      <div role="dialog" aria-modal="true" data-variant="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{
        position: 'relative', width: '100%', maxHeight: '90%', overflowY: 'auto', boxSizing: 'border-box',
        background: color('surface.base.default'), display: 'flex', flexDirection: 'column',
        borderStartStartRadius: radius('8'), borderStartEndRadius: radius('8'),
      }}>{content}</div>
    </Scrim>
  );
}
