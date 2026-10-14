import { useState, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { T, ty, space, icon, color, radius, scale, PILL } from '../system';
import { Icon, type IconName } from '../icons';
import { LogoArt, logoArtKey, type LogoVersion, type LogoType } from '../icons/logo';

/* ---------------- Text ---------------- */
export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: string;
  as?: ElementType;
  color?: string;
}
export function Text({ variant = 'body.md', as: As = 'span', color: c, style, children, ...rest }: TextProps) {
  return (
    <As style={{ margin: 0, color: c ?? color('text.default.default'), ...ty(variant), ...style } as CSSProperties} {...rest}>
      {children}
    </As>
  );
}

/* ---------------- IconBox ----------------
   Figma `icon-size` 25408:1190: `category` 2d | logo x `size` xs…5xl, box = icon/<size>
   (8/12/16/20/24/32/40/48/56).
   - 2d: the glyph FILLs the box inside an inset of spacing/2xs (xs–xl) or spacing/xs
     (2xl–5xl), so glyph = box − 4 or box − 8 (xl box 24 → 20 glyph).
   - logo: no inset, clipped, the artwork is the full box.
   Children keep whatever size the caller gives them and stay centred (an oversized child
   overflows the inset evenly, so a hand-sized glyph renders where it always did). Pass
   `icon` instead to get the Figma glyph size for the box. */
export type IconBoxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
const ICON_BOX_WIDE = new Set(['2xl', '3xl', '4xl', '5xl']);
/** Figma's 2d inset for an icon-size step: spacing/2xs up to xl, spacing/xs from 2xl. */
const iconInset = (size: string) => space(ICON_BOX_WIDE.has(size) ? 'xs' : '2xs');
/** Glyph size inside a 2d `icon-size` box of this step, in px (xl → 20). */
export const iconGlyph = (size: IconBoxSize | string): number =>
  (parseInt(icon(size), 10) || 16) - 2 * (parseInt(iconInset(size), 10) || 0);
export interface IconBoxProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconBoxSize | (string & {});
  /** Figma `category`: `2d` insets the glyph; `logo` clips artwork to the full box. */
  category?: '2d' | 'logo';
  /** Icon-set glyph to draw at the Figma size for this box. Ignored when children are given. */
  icon?: IconName | (string & {});
}
export function IconBox({ size = 'md', category = '2d', icon: iconName, style, children, ...rest }: IconBoxProps) {
  const d = icon(size);
  const logo = category === 'logo';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: d, height: d,
      flex: '0 0 auto', boxSizing: 'border-box', padding: logo ? 0 : iconInset(size),
      overflow: logo ? 'hidden' : undefined, ...style,
    }} {...rest}>
      {children ?? (logo ? null : <Icon name={iconName ?? 'placeholder'} size={iconGlyph(size)} />)}
    </span>
  );
}

/* ---------------- Badge ----------------
   Offer badges (New=green, deals/Discount=red, Limited=yellow, Best seller=magenta,
   Exclusive=burgundy, Sold out=grey) + status badges, using the exact badge tokens. */
export type BadgeOffer =
  | 'new-card' | 'new-plan' | 'mega-deals' | 'green-friday' | 'discount'
  | 'limited-stock' | 'validity' | 'limited-time' | 'best-seller'
  | 'online-exclusive' | 'exclusive-for-emirati' | 'sold-out';
export type BadgeStatus =
  | 'neutral' | 'neutral-inverse' | 'disabled' | 'positive' | 'warning' | 'danger'
  /** `brand` is absent from Figma V1.1 — kept pending design confirmation before removal. */
  | 'brand';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  offer?: BadgeOffer;
  status?: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
  /** Figma `.badges-core` `chevron`: a trailing chevron after the label. Every published
   *  badge ships with it off. */
  chevron?: boolean;
}
/* Figma V1.2 badges-offers 12934:864 (all 36 variants) and badges-status 25694:12036:
     sm  h scale/16  min scale/40  py spacing/2xs  px spacing/xs  r border-radius/2 (6)
     md  h scale/20  min scale/56  py spacing/xs   px spacing/sm  r border-radius/2 (6)
     lg  h scale/24  min scale/64  py spacing/xs   px spacing/sm  r border-radius/3 (8)
   badges-status lg/neutral alone binds min scale/56 + border-radius/2; the other 17 status
   variants and every offer agree with the table, so the table wins (design question logged).
   The horizontal padding lives on `.badges-core` 40602:71471. With `chevron` on, the icon
   (icon-size 2d sm → 8px glyph at sm, md → 12px at md/lg) overlaps the end padding through
   a negative gap of the same size, so the badge ends at the icon box. */
const BADGE_GEOMETRY = {
  sm: { height: '16', minWidth: '40', padY: '2xs', padX: 'xs', radius: '2', iconBox: 'sm' },
  md: { height: '20', minWidth: '56', padY: 'xs', padX: 'sm', radius: '2', iconBox: 'md' },
  lg: { height: '24', minWidth: '64', padY: 'xs', padX: 'sm', radius: '3', iconBox: 'md' },
} as const;
export function Badge({ offer, status = 'neutral', size = 'md', chevron = false, style, children, ...rest }: BadgeProps) {
  const key = offer ? `offers.${offer}` : `status.${status}`;
  const g = BADGE_GEOMETRY[size] ?? BADGE_GEOMETRY.md;
  const padY = space(g.padY);
  const padX = space(g.padX);
  return (
    <span
      style={{
        // gap 2xs spaces caller-supplied children (a leading glyph + label); Figma's
        // label-to-chevron gap is 0 once the overlap above is applied.
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: chevron ? 0 : space('2xs'),
        boxSizing: 'border-box', height: scale(g.height), minWidth: scale(g.minWidth),
        ...(chevron
          ? { paddingBlock: padY, paddingInlineStart: padX, paddingInlineEnd: 0 }
          : { padding: `${padY} ${padX}` }),
        borderRadius: radius(g.radius),
        background: color(`badge.surface.${key}`), color: color(`badge.text.${key}`),
        ...ty(`badge.${size}`), whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {children}
      {chevron ? (
        <span aria-hidden data-rtl-flip style={{ display: 'inline-flex' }}>
          <IconBox size={g.iconBox} icon="chevron-right-filled" />
        </span>
      ) : null}
    </span>
  );
}

/* ---------------- StatusIndicator ----------------
   Figma page "Status Indicator" 36840:65099, `status-indicator-type` 37171:3537:
   `type` basic | pill | glass | Glass-dark × `status` neutral | positive | danger | warning.
   Every type wraps `.status-indicator-core` 37840:21741 — h16, padding-start spacing/xs,
   padding-end spacing/sm, gap 0: an icon-size 2d/sm (12px, 2px inset) holding
   `dot/filled=true` (8px), then the label in badge/md. The core's `direction=rtl` variant
   mirrors the ltr one, so logical padding + flex order cover it.
     basic       no surface; label status-indicator/text/<status>
     pill        h24, padding-block spacing/xs, border-radius/9,
                 status-indicator/surface/<status> (.status-indicator-surface-status 36858:109834);
                 label text/default/default
     glass       h32, padding-block spacing/sm, border-radius/9, surface/glass/white/xs + GLASS
                 bound to effects/glass/lg (.status-indicator-surface-glass 36858:109828);
                 label text/default/default
     glass-dark  as glass; label text/default/inverse
   The dot is status-indicator/text/<status> in every type; for neutral Figma binds
   text/default/default instead (the same #191329), including on glass-dark. */
export type StatusIndicatorType = 'basic' | 'pill' | 'glass' | 'glass-dark';
export type StatusIndicatorStatus = 'neutral' | 'positive' | 'danger' | 'warning';
export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma `type`. `glass-dark` is Figma's `Glass-dark`. */
  type?: StatusIndicatorType;
  status?: StatusIndicatorStatus;
  /** Figma `circle` — the leading dot. */
  dot?: boolean;
}
/** CSS backdrop blur for a Figma GLASS effect, from its bound `effects/glass/<size>/frost`. */
const glassBlur = (size: 'md' | 'lg'): CSSProperties => {
  const b = `blur(${T.effects?.glass?.[size]?.frost})`;
  return { backdropFilter: b, WebkitBackdropFilter: b };
};
export function StatusIndicator({ type = 'basic', status = 'positive', dot = true, style, children = 'Status', ...rest }: StatusIndicatorProps) {
  const statusInk = color(`status-indicator.text.${status}`);
  const dotInk = status === 'neutral' ? color('text.default.default') : statusInk;
  const label = type === 'basic' ? statusInk
    : type === 'glass-dark' ? color('text.default.inverse')
    : color('text.default.default');
  const shell: CSSProperties = type === 'pill'
    ? { height: scale('24'), paddingBlock: space('xs'), borderRadius: radius('9'), overflow: 'hidden',
        background: color(`status-indicator.surface.${status}`) }
    : type === 'glass' || type === 'glass-dark'
      ? { height: scale('32'), paddingBlock: space('sm'), borderRadius: radius('9'),
          background: color('surface.glass.white.xs'), ...glassBlur('lg') }
      : { height: scale('16') };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box', flex: 'none', ...shell, ...style }} {...rest}>
      <span style={{ display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box', height: scale('16'),
        paddingInlineStart: space('xs'), paddingInlineEnd: space('sm') }}>
        {dot ? <span aria-hidden style={{ display: 'inline-flex' }}><IconBox size="sm"><Icon name="dot-filled" size={iconGlyph('sm')} color={dotInk} /></IconBox></span> : null}
        <span style={{ ...ty('badge.md'), color: label, whiteSpace: 'nowrap' }}>{children}</span>
      </span>
    </span>
  );
}

/* ---------------- Smiles avatars (used on plan/highlight cards) ----------------
   CODE-ONLY: no V1.2 symbol matches these (hardcoded #6C3FD6 / #c0bfc8, 11px text,
   −8 overlaps). Figma draws the same idea as `logo-row` with Brands/type=smiles logos and a
   `more-items` counter. The Brands artwork is not in the repo yet, so these stay. */
/** @deprecated No V1.2 counterpart — use `LogoRow` with a smiles logo (and `more`) instead. */
export function SmilesAvatar({ size = 28, label = 'smiles', bg = '#6C3FD6' }: { size?: number; label?: string; bg?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', fontSize: Math.max(7, size * 0.3), fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', boxSizing: 'border-box' }}>{label}</span>
  );
}
/** @deprecated No V1.2 counterpart — use `LogoRow` with smiles logos and `more={n}` instead. */
export function SmilesRow({ count = 2, plus = 4, size = 28 }: { count?: number; plus?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ marginInlineStart: i ? -8 : 0 }}><SmilesAvatar size={size} /></span>
      ))}
      {plus ? (
        <span style={{ marginInlineStart: -8, width: size, height: size, borderRadius: '50%', background: '#c0bfc8', color: '#fff', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', boxSizing: 'border-box' }}>+{plus}</span>
      ) : null}
    </span>
  );
}

/* ---------------- ProgressBar ---------------- */
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  /** Optional fill override; omit for the Figma V1.1 default (text.positive.subtle green). */
  tone?: 'accent' | 'positive' | 'warning' | 'danger';
}
export function ProgressBar({ value = 50, tone, style, ...rest }: ProgressBarProps) {
  // Figma V1.1 progress-bar-core (26437:43709): a 300x4 clip holding one green fill and
  // nothing else — no track colour and no corner radius on the container or the bar. The
  // pill radius and sunken-grey track here were V1.0 leftovers. Pass `style` to add a track
  // back if a surface needs one.
  const fill = tone === 'accent' ? color('status.accent')
    : tone === 'positive' ? color('status.positive')
    : tone === 'warning' ? color('status.warning')
    : tone === 'danger' ? color('status.danger')
    : color('text.positive.subtle');
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
      style={{ position: 'relative', width: '100%', height: scale('4'), overflow: 'hidden', ...style }} {...rest}>
      <div style={{ position: 'absolute', insetInlineStart: 0, insetBlock: 0, width: `${Math.max(0, Math.min(100, value))}%`, background: fill }} />
    </div>
  );
}

/* ---------------- Stepper ----------------
   Segmented step progress (Figma V1.2 Stepper, page 32960:73423; `stepper` 32960:73561):
   a 6px-tall row of equal pill segments, 2–8 steps, completed segments filled.
   `.stepper-steps-scheme` 32960:73523 spaces them by spacing/xs (4px). Also used as the
   top-bar `.topbar-stepper` bottom element. */
// Figma vars color/stepper/{scheme}/{state}. Hardcoded while the variables.json export
// predated the stepper group; bound now, to the same four values.
const STEPPER = {
  default: { inactive: color('stepper.default.default'), active: color('stepper.default.selected') },
  inverse: { inactive: color('stepper.inverse.default'), active: color('stepper.inverse.selected') },
} as const;
export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** Total segments — Figma defines 2–8. */
  steps?: number;
  /** Completed segments, 0..steps. */
  progress?: number;
  /** Inverse color scheme for dark (midnight/brand) surfaces. */
  inverse?: boolean;
}
export function Stepper({ steps = 4, progress = 0, inverse, style, ...rest }: StepperProps) {
  const n = Math.max(2, Math.min(8, Math.round(steps)));
  const done = Math.max(0, Math.min(n, Math.round(progress)));
  const scheme = STEPPER[inverse ? 'inverse' : 'default'];
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={done}
      style={{ display: 'flex', gap: space('xs'), width: '100%', height: 6, ...style }} {...rest}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ flex: 1, borderRadius: PILL, background: i < done ? scheme.active : scheme.inactive }} />
      ))}
    </div>
  );
}

/* ---------------- AddTrigger ----------------
   Figma `add-trigger` 25973:25405: a 72px (scale/72) glass panel holding a tertiary
   button — not the V1.0 dashed pill. Padding spacing/lg × 20 (the 20 is unbound in Figma),
   radius border-radius/6, NO border (the description's "dashed" and the statesheet's
   "20px icon" are outranked by the symbol). Inside, `.add-trigger-content-ltr` 37884:69847
   is button-content (padding-inline spacing/xs, gap spacing/xs): a 16px disc holding
   icon-size 2d/sm (12, 2px inset) with `add` filled=true (8px), then the button/lg label
   (padding-inline spacing/xs). The rtl variant is the same row mirrored, which flex does.
     default 25752:11486  surface/glass/midnight/sm · label text/default/default ·
                          disc text/brand/default · plus text/default/inverse
     inverse 28917:4269   surface/glass/white/lg · label text/default/inverse ·
                          disc button/tertiary/text/inverse/default · plus surface/canvas/midnight */
const ADD_TRIGGER = {
  default: { bg: 'surface.glass.midnight.sm', label: 'text.default.default', disc: 'text.brand.default', plus: 'text.default.inverse' },
  inverse: { bg: 'surface.glass.white.lg', label: 'text.default.inverse', disc: 'button.tertiary.text.inverse.default', plus: 'surface.canvas.midnight' },
} as const;
export interface AddTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
  /** Figma `surface`: `inverse` for dark surfaces. */
  surface?: 'default' | 'inverse';
}
export function AddTrigger({ label = 'Add', surface = 'default', style, onClick, ...rest }: AddTriggerProps) {
  const s = ADD_TRIGGER[surface] ?? ADD_TRIGGER.default;
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: scale('72'), boxSizing: 'border-box', padding: `${space('lg')} 20px`,
        borderRadius: radius('6'), border: 0, background: color(s.bg),
        color: color(s.label), cursor: 'pointer', overflow: 'hidden', ...ty('button.lg'), ...style }} {...rest}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs'), paddingInline: space('xs'), minWidth: 0 }}>
        <span data-add-disc aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: scale('16'), height: scale('16'), flex: 'none', borderRadius: radius('9'), background: color(s.disc) }}>
          <IconBox size="sm"><Icon name="add-filled" size={iconGlyph('sm')} color={color(s.plus)} /></IconBox>
        </span>
        <span style={{ paddingInline: space('xs') }}>{label}</span>
      </span>
    </button>
  );
}

/* ---------------- Dismiss ----------------
   Figma `dismiss` 28961:19839 (page 28961:16066): surface default | inverse × small.
   The 24 (small: 20) frame is transparent and holds `.dismiss-core` → icon-size 2d xl
   (small: lg) with its 2px inset → a 20 (16) px filled close-circle whose X is knocked
   out, filled color/dismiss/{default,inverse}. That is the icon set's `dismiss-filled`
   (r10 circle, even-odd X) — Figma itself still instances a legacy local
   "close, x, circle, remove" icon of the same geometry (design question logged). The X
   shows the surface underneath; it is not white. */
const DISMISS_INK = { default: 'dismiss.default', inverse: 'dismiss.inverse' } as const;
export interface DismissProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  surface?: 'default' | 'inverse';
  /** md = 24 (icon-size xl), sm = 20 (icon-size lg) — Figma `small`. */
  size?: 'md' | 'sm';
  onClick?: () => void;
}
export function Dismiss({ surface = 'default', size = 'md', style, onClick, ...rest }: DismissProps) {
  const box = size === 'sm' ? 'lg' : 'xl';
  return (
    <button type="button" aria-label="Dismiss" onClick={onClick}
      style={{
        width: icon(box), height: icon(box), flex: 'none', border: 0, borderRadius: '50%', padding: space('2xs'),
        background: 'transparent', cursor: 'pointer', boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style,
      }} {...rest}>
      <Icon name="dismiss-filled" size={iconGlyph(box)} color={color(DISMISS_INK[surface] ?? DISMISS_INK.default)} />
    </button>
  );
}

/* ---------------- MoreItems ----------------
   Figma `more-items` 26560:27420 (rtl twin `more-items-rtl` 37905:16028): the "+N"
   overflow circle that closes a logo row. `surface` default = surface/glass/midnight/lg,
   inverse = surface/glass/white/md; border-radius/9; "+" and the count are two text cells
   at typography/body/xs (10px Regular) in text/default/inverse, centred. The rtl twin
   reverses the cells to "N+", which flex order does under dir="rtl". Figma sizes it to
   match the logos beside it (24–56). */
export interface MoreItemsProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma `x-more-integer`. */
  count?: number | string;
  surface?: 'default' | 'inverse';
  /** Circle diameter in px or any CSS length; default icon/xl (24). */
  size?: number | string;
}
const MORE_ITEMS_BG = { default: 'surface.glass.midnight.lg', inverse: 'surface.glass.white.md' } as const;
export function MoreItems({ count = 4, surface = 'default', size = icon('xl'), style, ...rest }: MoreItemsProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      width: size, height: size, borderRadius: radius('9'), overflow: 'hidden',
      background: color(MORE_ITEMS_BG[surface] ?? MORE_ITEMS_BG.default), color: color('text.default.inverse'),
      ...ty('body.xs'), ...style,
    }} {...rest}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}><span>+</span><span>{count}</span></span>
    </span>
  );
}

/* ---------------- LogoRow ----------------
   Figma `logo-row` 25997:32516: `size` sm | md | lg × `style` default | glass ×
   `direction` (flex mirrors it), up to five logos plus an optional `+x-more` item.
              logo (circle, clipped)   gap default   glass tile (padding spacing/sm)   gap glass
     sm       icon/xl  24              spacing/xs     40                                spacing/xs
     md       icon/2xl 32              spacing/xs     48                                spacing/sm
     lg       icon/3xl 40              spacing/sm     56                                spacing/sm
   `.logo-style` 26556:17510 glass-margin: surface/glass/white/lg + GLASS bound to
   effects/glass/md, and the logo inside carries a border/xs (0.5px) INSIDE stroke of
   border/surface-based/glass/default/sm. Every published variant instances `more-items`
   surface=inverse, sized to match the logo items.
   Logos are Figma `Brands` artwork; pass an element (sized to fill) or an image URL. */
const LOGO_ROW = {
  sm: { logo: 'xl', gap: 'xs', glassGap: 'xs' },
  md: { logo: '2xl', gap: 'xs', glassGap: 'sm' },
  lg: { logo: '3xl', gap: 'sm', glassGap: 'sm' },
} as const;
export interface LogoRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Logo artwork: elements sized to fill their circle, or image URLs. */
  logos?: (ReactNode | string)[];
  /** Figma `size`. Defaults to md (32px), the size this component rendered before V1.2. */
  size?: 'sm' | 'md' | 'lg';
  /** Figma `style=glass`: each logo sits on a glass tile. */
  glass?: boolean;
  /** Figma `+x-more`: append a "+N" `more-items` circle. */
  more?: number | string;
  /** The `more-items` surface; every Figma logo-row uses `inverse`. */
  moreSurface?: 'default' | 'inverse';
}
export function LogoRow({ logos = [], size = 'md', glass = false, more, moreSurface = 'inverse', style, ...rest }: LogoRowProps) {
  const s = LOGO_ROW[size] ?? LOGO_ROW.md;
  const logoPx = icon(s.logo);
  const pad = space('sm');
  const item = glass ? `${(parseInt(logoPx, 10) || 0) + 2 * (parseInt(pad, 10) || 0)}px` : logoPx;
  const art = (l: ReactNode | string) => typeof l === 'string'
    ? <img src={l} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    : l;
  const circle: CSSProperties = {
    position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flex: 'none', borderRadius: radius('9'), overflow: 'hidden', boxSizing: 'border-box',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space(glass ? s.glassGap : s.gap), ...style }} {...rest}>
      {logos.map((l, i) => glass ? (
        <span key={i} style={{ ...circle, width: item, height: item, padding: pad,
          background: color('surface.glass.white.lg'), ...glassBlur('md') }}>
          <span style={{ ...circle, width: logoPx, height: logoPx }}>
            {art(l)}
            <span data-logo-ring aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: radius('9'), pointerEvents: 'none',
              border: `${T.border?.xs} solid ${color('border.surface-based.glass.default.sm')}` }} />
          </span>
        </span>
      ) : (
        <span key={i} style={{ ...circle, width: item, height: item }}>{art(l)}</span>
      ))}
      {more != null && more !== '' ? <MoreItems count={more} surface={moreSurface} size={item} /> : null}
    </div>
  );
}

/* ---------------- AtomSurface ----------------
   The Figma surface-color atoms: `default-surface` 26770:100166 (default | subtle |
   sunken) and `inverse-surface` 26770:100161 (midnight-base | midnight-raised |
   glass-midnight | glass-white). Both expose one axis named `surface-color`, so they
   are one component here — seven values, the way a designer picks them.

   The previous `level` axis (canvas|base|raised|sunken) matched none of these names and
   offered none of the four inverse/glass values.

   Figma's variant labels do NOT match its own token names — `surface-color=subtle`
   binds color/surface/base/default, and `surface-color=default` binds
   color/surface/base/inverse. Labels below follow Figma (that is what designers see);
   each maps to the token verified per variant node.

   V1.2: both shared atoms clip at border-radius/7 = 20px (the code had 16), and
   glass-white carries a GLASS effect bound to effects/glass/lg. `brand` comes from the
   Plans-page copy `.surface-inverse` 25973:27593 (variant 26003:41829) — the shared atom has
   no brand value. The page-local copies disagree with the shared one (Plans: radius 0;
   Recommendation: white glass at md with glass md); this follows the shared atom. */
export type SurfaceColor =
  | 'default' | 'subtle' | 'sunken'
  | 'midnight-base' | 'midnight-raised' | 'glass-midnight' | 'glass-white' | 'brand';

/** surface-color -> token path, verified one variant node at a time. */
const SURFACE_COLOR: Record<SurfaceColor, string> = {
  subtle: 'surface.base.default',            // 26770:100167  #f0f0f5
  default: 'surface.base.inverse',           // 26770:100168  #ffffff99
  sunken: 'surface.sunken.default',          // 26770:100169  #e4e3ea
  'midnight-base': 'surface.base.midnight',  // 26770:100162  #191329
  'midnight-raised': 'surface.raised.midnight', // 26770:100163  #312c40
  'glass-midnight': 'surface.glass.midnight.md', // 26770:100164  rgba(25,19,41,.20)
  'glass-white': 'surface.glass.white.lg',   // 26770:100165  rgba(255,255,255,.20) + GLASS lg
  brand: 'surface.base.brand',               // 26003:41829 (Plans copy)  #e00800
};

export interface AtomSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma `surface-color` axis — the seven shared-atom values plus `brand`. */
  surfaceColor?: SurfaceColor;
  /** @deprecated V1.0 elevation axis with no Figma counterpart; use `surfaceColor`.
   *  Retained so existing call sites keep their current fill. */
  level?: 'canvas' | 'base' | 'raised' | 'sunken';
}
export function AtomSurface({ surfaceColor, level, style, children, ...rest }: AtomSurfaceProps) {
  const bg = surfaceColor
    ? color(SURFACE_COLOR[surfaceColor])
    : color(`surface.${level ?? 'base'}.default`);
  return (
    <div style={{ background: bg, borderRadius: radius('7'), overflow: 'hidden',
      ...(surfaceColor === 'glass-white' ? glassBlur('lg') : null), ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ---------------- CardBgColor ----------------
   Figma final component `.card-bg-color` 25710:20065 — the tint panel that backs the
   card-features media area. One `color` axis, eight values, each 224x272
   (card/width/lg x card/height/lg) at radius border-radius/6 = 16 (V1.2 numbering).
   Open: in V1.2 the frame binds border-radius/6 but is unclipped with its fill hidden, and
   the tint is a child rectangle at r0 — so the swatches *render* square. Cards that use
   it clip it themselves. Kept at 16 pending a design ruling (design question logged).

   The prop is named `tint` rather than `color` so it does not shadow the `color()`
   token helper used throughout this file.

   Figma's variant labels are shifted against its own token names for two entries:
   variant `cyan` binds atom-surfaces/blue and variant `blue` binds
   atom-surfaces/purple. There is no atom-surfaces/cyan token, and no variant named
   purple. The labels below follow Figma (what a designer picks); each was read off its
   own variant node. */
export type CardBgTint =
  | 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'violet';

const CARD_BG_TINT: Record<CardBgTint, string> = {
  default: 'atom-surfaces.default', // 26522:14527  #e4e3ea
  red: 'atom-surfaces.red',         // 25710:20060  #fcebeb
  orange: 'atom-surfaces.orange',   // 25710:20063  #fcf3eb
  yellow: 'atom-surfaces.yellow',   // 25710:20059  #fcfceb
  green: 'atom-surfaces.green',     // 25710:20058  #ecfce8
  cyan: 'atom-surfaces.blue',       // 25710:20064  #ebf7fc  <- label/token shift
  blue: 'atom-surfaces.purple',     // 25710:20061  #ebebfc  <- label/token shift
  violet: 'atom-surfaces.violet',   // 25710:20062  #f9ebfc
};

/** Resolve a Figma card-bg-color variant name to its fill. */
export const cardBgTint = (tint: CardBgTint): string => color(CARD_BG_TINT[tint]);
/** Every tint a designer can pick, in Figma's own order. */
export const CARD_BG_TINTS = Object.keys(CARD_BG_TINT) as CardBgTint[];

export interface CardBgColorProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma `color` axis. */
  tint?: CardBgTint;
  /** Render at the Figma swatch footprint (card/width/lg x card/height/lg). */
  fixedSize?: boolean;
}
export function CardBgColor({ tint = 'default', fixedSize, style, children, ...rest }: CardBgColorProps) {
  return (
    <div
      style={{
        background: cardBgTint(tint), borderRadius: radius('6'), boxSizing: 'border-box',
        width: fixedSize ? T.card?.width?.lg : undefined,
        height: fixedSize ? T.card?.height?.lg : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ---------------- SectionLinkButton ----------------
   Figma's published `section-link` (25440:14243, 9 symbols) is this: an icon-only 40x40
   link button that sits top-right of a Section header. It is NOT the composed header row
   that `SectionLink` exports — that name was taken first, so this ships alongside it
   rather than renaming an export out from under callers. See design-questions.md q8.

   Size: every published symbol and the `section-link/lg` variable say 40. The statesheet
   prose says Lg 48 / Md 36 / Sm 32. Two sources against one, so 40 — but the conflict is
   still open with design.

   V1.2 (23.07.2026 revamp): `glass` × `inverse` × `state` default | pressed | disabled,
   every colour bound to color/section-link/{solid,glass}/{default,inverse}/{surface,icon}/*.
   No symbol carries an effect — no shadow, and no blur even on glass. Radius
   border-radius/5 (14). The glyph is `.section-link-action` 33137:15635: icon-size xl
   (24, 2px inset) holding a 20px forward (chevron-right) | backwards (chevron-left) | close.
     solid/default   light sections            glass/default   light sections over imagery
     solid/inverse   solid dark / midnight     glass/inverse   dark imagery
   Pressed is tracked from the pointer, since inline styles have no :active. */
export interface SectionLinkButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Figma `glass`. */
  glass?: boolean;
  /** Figma `inverse`. */
  inverse?: boolean;
  /** Figma `.section-link-action` type. */
  action?: 'forward' | 'backwards' | 'close';
  /** @deprecated V1.1 axis. `default` = solid default; `inverse` = glass + inverse (what it
   *  rendered). Use `glass` / `inverse`. */
  surface?: 'default' | 'inverse';
  /** Custom glyph; overrides `action`. */
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
const SECTION_LINK_GLYPH = { forward: 'chevron-right', backwards: 'chevron-left', close: 'close' } as const;
export function SectionLinkButton({ glass, inverse, action = 'forward', surface, icon: glyph, disabled, style,
  onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, ...rest }: SectionLinkButtonProps) {
  const [pressed, setPressed] = useState(false);
  const legacyDark = surface === 'inverse';
  const isGlass = glass ?? legacyDark;
  const isInverse = inverse ?? legacyDark;
  const state = disabled ? 'disabled' : pressed ? 'pressed' : 'default';
  const base = `section-link.${isGlass ? 'glass' : 'solid'}.${isInverse ? 'inverse' : 'default'}`;
  const name = SECTION_LINK_GLYPH[action] ?? SECTION_LINK_GLYPH.forward;
  return (
    <button type="button" aria-label="See all" disabled={disabled}
      onPointerDown={(e) => { if (!disabled) setPressed(true); onPointerDown?.(e); }}
      onPointerUp={(e) => { setPressed(false); onPointerUp?.(e); }}
      onPointerLeave={(e) => { setPressed(false); onPointerLeave?.(e); }}
      onPointerCancel={(e) => { setPressed(false); onPointerCancel?.(e); }}
      style={{
        width: scale('40'), height: scale('40'), flex: 'none', padding: 0, border: 0,
        borderRadius: radius('5'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: color(`${base}.surface.${state}`), color: color(`${base}.icon.${state}`),
        cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box',
        ...style,
      }} {...rest}>
      {glyph ?? (
        <span data-rtl-flip={action === 'close' ? undefined : true} style={{ display: 'inline-flex' }}>
          <IconBox size="xl" icon={name} />
        </span>
      )}
    </button>
  );
}

/* ---------------- Logo ----------------
   Figma V1.2 "Etisalat Logo" (page 27020:6155). With no `type` this is the published
   `etisalat-logo` 27032:50455: a 96x96 symbol, color-scheme default | white | red, where
   default is the red square tile and the lockup spans 136/192 of the width
   (`.etisalat-logo-core`). With a `type` it is a `.etisalat-logo-variations` 42176:33598
   frame — lockup, logomark, wordmark or bilingual — with the art edge to edge; `rtl`
   switches the lockup and wordmark to Arabic.

   V1.1's "e&" lockup and its `midnight` version are gone from Figma. `midnight` still
   renders (in midnight ink) so existing callers don't break, but is deprecated.
   The artwork is generated into src/icons/logo.tsx by scripts/build-logo.py from the
   exported SVGs in src/icons/logo-raw/. */
export interface LogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Figma color-scheme. `midnight` is deprecated (removed in V1.2). */
  version?: LogoVersion;
  /** A `.etisalat-logo-variations` artwork. Omit for the `etisalat-logo` symbol. */
  type?: LogoType;
  /** Arabic lockup / wordmark. Logomark and bilingual are direction-free. */
  rtl?: boolean;
  /** Rendered size in px; the symbol is a square. */
  size?: number | string;
  /** Overrides the version's ink. Pass `currentColor` to inherit from CSS instead. */
  color?: string;
}
export function Logo({ version = 'default', type, rtl = false, size = 32, color: colorOverride, style, ...rest }: LogoProps) {
  const arabic = logoArtKey(type ?? 'lockup', rtl).endsWith('-rtl');
  return (
    <span role="img" aria-label={arabic ? 'اتصالات' : 'etisalat'}
      style={{ display: 'inline-flex', flex: 'none', lineHeight: 0, ...style } as CSSProperties} {...rest}>
      <LogoArt version={version} type={type} rtl={rtl} size={size} color={colorOverride} />
    </span>
  );
}
