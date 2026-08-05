import type { HTMLAttributes, ReactNode } from 'react';
import { color, space, ty, radius } from '../system';
import { Icon } from '../icons';
import { Text, IconBox } from './primitives';

export type StatusTone = 'info' | 'positive' | 'warning' | 'danger';
const TONE_COLOR: Record<StatusTone, string> = {
  info: color('status.default'), positive: color('status.positive'),
  warning: color('status.warning'), danger: color('status.danger'),
};
// Icon-set names, not glyphs — see src/icons.
const TONE_ICON: Record<StatusTone, string> = { info: 'info', positive: 'check', warning: 'warning', danger: 'close' };

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
}

/** Usage meter: a 48px rounded row where a coloured block shows how much of the plan is
 *  left. The amount reads inside the block, the category label sits in the track opposite.
 *  Figma `.plan-usage-bar` 28927:23669. Stack them with a 4px gap for a plan breakdown. */
export function PlanUsageBar({
  label = 'Data', remaining, used, total, unit = 'GB', note, status = 'default', style, ...rest
}: PlanUsageBarProps) {
  const left = remaining ?? (used != null ? total - used : 0);
  // Guard the whole range: a plan with no allowance has nothing to draw (and would divide
  // by zero), and a top-up can leave more than the allowance without overflowing the track.
  const pct = total > 0 ? Math.min(100, Math.max(0, (left / total) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={left}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={`${left} ${unit} left`}
      style={{
        position: 'relative', width: '100%', height: 48, boxSizing: 'border-box',
        background: color('surface.canvas.inverse'), borderRadius: radius('3'), overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div
        data-part="fill"
        style={{
          position: 'absolute', insetBlock: 0, left: 0, width: `${pct}%`,
          background: USAGE_FILL[status], borderRadius: radius('3'),
        }}
      />
      {/* Above the fill, spanning the full track: the value rides over the block while the
          label stays out on the plain background, exactly as the Figma overlay does. */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: space('sm'), padding: `0 ${space('lg')}`,
      }}>
        <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <Text variant="title.xs" as="span">{left} {unit} left</Text>
          {note != null ? <Text variant="body.sm" as="span">{note}</Text> : null}
        </span>
        <Text variant="button.md" as="span" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{label}</Text>
      </div>
    </div>
  );
}

/* ---------------- Status marks (shared by Snackbar + Alert) ---------------- */
/** Self-contained SVG spinner — no CSS keyframes needed (animateTransform). */
function Spinner({ size = 22, stroke = '#ffffff' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: '0 0 auto' }} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={stroke} strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
/** Coloured circle/triangle badge with an icon-set glyph inside (`icon` is an icon name). */
function StatusMark({ bg, icon, fg, shape, size = 22 }: { bg: string; icon: string; fg: string; shape: 'circle' | 'triangle'; size?: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: bg, color: fg, lineHeight: 0,
      ...(shape === 'triangle'
        ? { clipPath: 'polygon(50% 3%, 97% 95%, 3% 95%)', paddingTop: Math.round(size * 0.16) }
        : { borderRadius: '50%' }),
    }}><Icon name={icon} size={Math.round(size * 0.62)} /></span>
  );
}

/* ---------------- Snackbar (transient dark pill) ---------------- */
export type SnackbarTone = 'positive' | 'danger' | 'warning' | 'loading' | 'default';
const SNACK_MARK: Record<'positive' | 'danger' | 'warning', { bg: string; icon: string; fg: string; shape: 'circle' | 'triangle' }> = {
  positive: { bg: '#47cb6c', icon: 'check', fg: '#ffffff', shape: 'circle' },   // Component/IconBox/Positive
  danger:   { bg: '#d05d0a', icon: 'close', fg: '#ffffff', shape: 'circle' },   // Component/IconBox/Negative
  warning:  { bg: '#d5b549', icon: 'warning', fg: '#191329', shape: 'triangle' }, // Component/IconBox/Warning
};
export interface SnackbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: SnackbarTone;
  message: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  onDismiss?: () => void;
}
export function Snackbar({ tone = 'default', message, action, onAction, onDismiss, style, ...rest }: SnackbarProps) {
  const bare = tone === 'default' && !action && !onDismiss;
  const mark = tone === 'loading' ? <Spinner size={22} />
    : tone === 'default' ? null
    : <StatusMark {...SNACK_MARK[tone]} size={22} />;
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', gap: space('md'), width: '100%', boxSizing: 'border-box',
      padding: `${space('md')} ${space('lg')}`, borderRadius: radius('7'), background: color('surface.overlay.floating-inverse'),
      color: '#ffffff', justifyContent: bare ? 'center' : 'flex-start', ...style,
    }} {...rest}>
      {mark}
      <Text variant="body.md" color="#ffffff" style={{ flex: bare ? '0 1 auto' : 1, fontWeight: 600, textAlign: bare ? 'center' : 'left' }}>{message}</Text>
      {action ? <button onClick={onAction} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, ...ty('button.sm'), color: color('text.brand.subtle'), fontWeight: 700 }}>{action}</button> : null}
      {onDismiss ? <button onClick={onDismiss} aria-label="Dismiss" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, opacity: 0.7 }}><IconBox size="sm"><Icon name="close" size={12} /></IconBox></button> : null}
    </div>
  );
}

/* ---------------- Alert (inline tinted banner) ----------------
   Figma `alert-message` 30969:1112, built from alert-message-container -> icon-status +
   text-block + alert-action. The axis is `Staus` (Figma's own typo, kept here only as a
   note — Code Connect mappings must use that exact key) with four values:

     Staus=Success 30969:1111   surface #c1f7d0  text #164025
     Staus=Alert   30969:1113   surface #ffecab  text #55481d
     Staus=Warning 30971:1160   surface #ffc28b  text #612a05
     Staus=Info    30971:1182   surface #e4e3ea  text #191329

   The V1.0 `tone` names map onto these, and the middle two SWAP meaning:
     positive -> success | warning -> ALERT | danger -> WARNING | default -> info
   Figma's `Alert` is the amber step and its `Warning` is the orange one, which is why
   `tone="warning"` resolves to status `alert`. Every previous colour also differed from
   Figma, so all four surfaces/inks move here.

   Values are inlined because color/alert-message/* exists in Figma but is absent from
   variables.json (zero matches), so tokens.ts has no alertMessage group. Same situation
   and same treatment as STEPPER in primitives.tsx; swap these for color() calls once the
   export carries the group. */
export type AlertStatus = 'success' | 'alert' | 'warning' | 'info';
/** @deprecated V1.0 names. Use `status`; note warning->alert and danger->warning. */
export type AlertTone = 'positive' | 'warning' | 'danger' | 'default';

const TONE_TO_STATUS: Record<AlertTone, AlertStatus> = {
  positive: 'success', warning: 'alert', danger: 'warning', default: 'info',
};
// Bound to Figma's `color/alert-message/{surface,text}/<status>`. These were hardcoded hex
// because the token export predated that family, not because Figma lacked it; the values
// below resolve to exactly what the hardcodes were, so this is a rebind, not a restyle.
const ALERT_STATUS: Record<AlertStatus, { bg: string; strong: string; mark: string; icon: string; shape: 'circle' | 'triangle'; action: string }> = {
  success: { bg: color('alert-message.surface.success'), strong: color('alert-message.text.success'), mark: color('alert-message.text.success'), icon: 'check', shape: 'circle', action: color('alert-message.text.success') },
  alert:   { bg: color('alert-message.surface.alert'), strong: color('alert-message.text.alert'), mark: color('alert-message.text.alert'), icon: 'warning', shape: 'triangle', action: color('alert-message.text.alert') },
  warning: { bg: color('alert-message.surface.warning'), strong: color('alert-message.text.warning'), mark: color('alert-message.text.warning'), icon: 'close', shape: 'circle', action: color('alert-message.text.warning') },
  info:    { bg: color('alert-message.surface.info'), strong: color('alert-message.text.info'), mark: color('alert-message.text.info'), icon: 'info', shape: 'circle', action: color('text.brand.default') },
};
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `Staus` axis. Takes precedence over `tone`. */
  status?: AlertStatus;
  /** @deprecated Use `status`; `warning` maps to `alert` and `danger` to `warning`. */
  tone?: AlertTone;
  title?: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  children?: ReactNode;
}
export function Alert({ status, tone, title, action, onAction, children, style, ...rest }: AlertProps) {
  const t = ALERT_STATUS[status ?? (tone ? TONE_TO_STATUS[tone] : 'info')];
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: space('md'), width: '100%', boxSizing: 'border-box',
      padding: space('lg'), borderRadius: radius('6'), background: t.bg, ...style,
    }} {...rest}>
      <StatusMark bg={t.mark} icon={t.icon} fg="#ffffff" shape={t.shape} size={24} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: space('2xs') }}>
        {title ? <Text variant="title.sm" color={t.strong} as="div" style={{ fontWeight: 700 }}>{title}</Text> : null}
        {children ? <Text variant="body.sm" color={t.strong} style={{ opacity: 0.85 }}>{children}</Text> : null}
      </div>
      {action ? <button onClick={onAction} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, textDecoration: 'underline', ...ty('button.sm'), color: t.action, whiteSpace: 'nowrap', fontWeight: 700 }}>{action}</button> : null}
    </div>
  );
}

/* ---------------- AlertModal ---------------- */
export interface AlertModalProps {
  open?: boolean;
  tone?: StatusTone;
  title?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}
export function AlertModal({ open = true, tone = 'info', title, body, actions, onDismiss }: AlertModalProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onDismiss}
      style={{ position: 'fixed', inset: 0, background: color('surface.overlay.scrim'), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space('lg'), zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 360, background: color('surface.raised.default'), borderRadius: radius('6'), padding: space('xl'), display: 'flex', flexDirection: 'column', gap: space('md') }}>
        <span style={{ color: TONE_COLOR[tone] }}><IconBox size="xl"><Icon name={TONE_ICON[tone]} size={24} /></IconBox></span>
        {title ? <Text variant="heading.sm">{title}</Text> : null}
        {body ? <Text variant="body.md" color={color('text.default.subtle')}>{body}</Text> : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm'), marginTop: space('sm') }}>{actions}</div>
      </div>
    </div>
  );
}
