import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { T, ty, space, icon, color, radius, scale, PILL } from '../system';
import { Icon } from '../icons';
import { LogoArt, type LogoVersion } from '../icons/logo';

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

/* ---------------- IconBox ---------------- */
export interface IconBoxProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | string;
}
export function IconBox({ size = 'md', style, children, ...rest }: IconBoxProps) {
  const d = icon(size);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: d, height: d, flex: '0 0 auto', ...style }} {...rest}>
      {children ?? <Icon name="placeholder" size={parseInt(d, 10) || 16} />}
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
}
export function Badge({ offer, status = 'neutral', size = 'md', style, children, ...rest }: BadgeProps) {
  const key = offer ? `offers.${offer}` : `status.${status}`;
  // Figma V1.1 (12934:864): heights scale/16|20|24, radius border-radius/2.
  // Min-widths: md scale/56 (new-on badge), lg scale/64 (plans-mini badge). lg had none.
  const height = size === 'lg' ? scale('24') : size === 'sm' ? scale('16') : scale('20');
  const minWidth = size === 'lg' ? scale('64') : size === 'md' ? scale('56') : undefined;
  const padY = size === 'sm' ? space('2xs') : space('xs');
  const padX = size === 'sm' ? space('xs') : space('sm');
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('2xs'),
        boxSizing: 'border-box', height, minWidth,
        padding: `${padY} ${padX}`, borderRadius: radius('2'),
        background: color(`badge.surface.${key}`), color: color(`badge.text.${key}`),
        ...ty(`badge.${size}`), whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ---------------- Smiles avatars (used on plan/highlight cards) ---------------- */
export function SmilesAvatar({ size = 28, label = 'smiles', bg = '#6C3FD6' }: { size?: number; label?: string; bg?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', fontSize: Math.max(7, size * 0.3), fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', boxSizing: 'border-box' }}>{label}</span>
  );
}
export function SmilesRow({ count = 2, plus = 4, size = 28 }: { count?: number; plus?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ marginLeft: i ? -8 : 0 }}><SmilesAvatar size={size} /></span>
      ))}
      {plus ? (
        <span style={{ marginLeft: -8, width: size, height: size, borderRadius: '50%', background: '#c0bfc8', color: '#fff', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', boxSizing: 'border-box' }}>+{plus}</span>
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
      style={{ width: '100%', height: scale('4'), overflow: 'hidden', ...style }} {...rest}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: fill }} />
    </div>
  );
}

/* ---------------- Stepper ----------------
   Segmented step progress (Figma V1.1 Stepper, page 31614:11244): a 6px-tall row of
   equal pill segments, 2–8 steps, completed segments filled. Also used as the
   top-bar `.topbar-stepper` bottom element. */
// Figma vars color/stepper/{scheme}/{state}. Hardcoded while the variables.json export
// predated the stepper group; bound now, to the same four values.
const STEPPER = {
  default: { inactive: color('stepper.default.default'), active: color('stepper.default.active') },
  inverse: { inactive: color('stepper.inverse.default'), active: color('stepper.inverse.active') },
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
      style={{ display: 'flex', gap: space('sm'), width: '100%', height: 6, ...style }} {...rest}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ flex: 1, borderRadius: PILL, background: i < done ? scheme.active : scheme.inactive }} />
      ))}
    </div>
  );
}

/* ---------------- AddTrigger ----------------
   Figma `add-trigger` 25973:25405 (default 25752:11486): a 72px glass panel holding a
   tertiary button — not the V1.0 dashed pill. bg surface/glass/midnight/sm, radius
   border-radius/5, px 20 / py spacing/lg, and NO border. The label is button/lg SemiBold
   in text/default/default; only the plus glyph is brand red.
   `surface=inverse` (28917:4269) is a newer variant and is not built here — it needs its
   own read rather than a mirrored guess. */
export interface AddTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}
export function AddTrigger({ label = 'Add', style, onClick, ...rest }: AddTriggerProps) {
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('sm'),
        width: '100%', height: scale('72'), boxSizing: 'border-box', padding: `${space('lg')} 20px`,
        borderRadius: radius('5'), border: 0, background: color('surface.glass.midnight.sm'),
        color: color('text.default.default'), cursor: 'pointer', overflow: 'hidden', ...ty('button.lg'), ...style }} {...rest}>
      <Icon name="add-filled" size={24} color={color('text.brand.default')} />{label}
    </button>
  );
}

/* ---------------- Dismiss ----------------
   Figma V1.1 Dismiss (page 28961:16066): a circular close button — a filled circle
   in the dismiss colour with a white X. surface default | inverse × size md(24) | sm(20). */
// color/dismiss/{default,inverse}. Hardcoded while the variables.json export predated the
// dismiss group; bound now, to the same values.
const DISMISS_BG = { default: color('dismiss.default'), inverse: color('dismiss.inverse') } as const;
export interface DismissProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  surface?: 'default' | 'inverse';
  size?: 'md' | 'sm';
  onClick?: () => void;
}
export function Dismiss({ surface = 'default', size = 'md', style, onClick, ...rest }: DismissProps) {
  const dim = size === 'sm' ? 20 : 24;
  return (
    <button type="button" aria-label="Dismiss" onClick={onClick}
      style={{
        width: dim, height: dim, flex: 'none', border: 0, borderRadius: '50%', padding: space('2xs'),
        background: DISMISS_BG[surface], color: '#ffffff', cursor: 'pointer', boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style,
      }} {...rest}>
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* ---------------- LogoRow ---------------- */
export interface LogoRowProps extends HTMLAttributes<HTMLDivElement> {
  logos?: ReactNode[];
}
export function LogoRow({ logos = [], style, ...rest }: LogoRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space('lg'), flexWrap: 'wrap', ...style }} {...rest}>
      {/* Figma logo-row (25997:32516): logo box scale/32 (= icon/2xl). */}
      {logos.map((l, i) => <span key={i} style={{ height: scale('32'), display: 'inline-flex', alignItems: 'center' }}>{l}</span>)}
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
   each maps to the token verified per variant node. */
export type SurfaceColor =
  | 'default' | 'subtle' | 'sunken'
  | 'midnight-base' | 'midnight-raised' | 'glass-midnight' | 'glass-white';

/** surface-color -> token path, verified one variant node at a time. */
const SURFACE_COLOR: Record<SurfaceColor, string> = {
  subtle: 'surface.base.default',            // 26770:100167  #f0f0f5
  default: 'surface.base.inverse',           // 26770:100168  #ffffff99
  sunken: 'surface.sunken.default',          // 26770:100169  #e4e3ea
  'midnight-base': 'surface.base.midnight',  // 26770:100162  #191329
  'midnight-raised': 'surface.raised.midnight', // 26770:100163  #312c40
  'glass-midnight': 'surface.glass.midnight.md', // 26770:100164  rgba(25,19,41,.20)
  'glass-white': 'surface.glass.white.lg',   // 26770:100165  rgba(255,255,255,.20)
};

export interface AtomSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma `surface-color` axis — all seven values across both surface atoms. */
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
    <div style={{ background: bg, borderRadius: radius('5'), ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ---------------- CardBgColor ----------------
   Figma final component `.card-bg-color` 25710:20065 — the tint panel that backs the
   card-features media area. One `color` axis, eight values, each 224x272
   (card/width/lg x card/height/lg) at radius border-radius/5 = 16.

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
        background: cardBgTint(tint), borderRadius: radius('5'), boxSizing: 'border-box',
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
   still open with design. */
export interface SectionLinkButtonProps extends HTMLAttributes<HTMLButtonElement> {
  surface?: 'default' | 'inverse';
  /** Glyph to show; Figma's default is a right chevron. */
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
export function SectionLinkButton({ surface = 'default', icon, disabled, style, ...rest }: SectionLinkButtonProps) {
  const onDark = surface === 'inverse';
  return (
    <button type="button" aria-label="See all" disabled={disabled}
      style={{
        width: 40, height: 40, flex: 'none', padding: `0 ${space('md')}`, border: 0,
        borderRadius: radius('4'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: onDark ? color('surface.glass.white.lg') : color('surface.raised.default'),
        backdropFilter: onDark ? 'blur(20px)' : undefined, WebkitBackdropFilter: onDark ? 'blur(20px)' : undefined,
        color: onDark ? color('text.default.inverse-subtle') : color('text.default.subtle'),
        boxShadow: onDark ? 'none' : '0 1px 4px rgba(25,19,41,0.12)',
        opacity: disabled ? 0.4 : 1, cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box',
        ...style,
      }} {...rest}>
      {icon ?? <Icon name="chevron-right" size={24} />}
    </button>
  );
}

/* ---------------- Logo ----------------
   Figma `e&-logo` 27032:50455, 96x96, `version` = default | white | midnight | red.
   `default` is the red app tile with a white lockup; the other three are the bare
   lockup and take their colour from CSS, so they inherit a surface's `color`.

   The artwork is generated into src/icons/logo.tsx by scripts/build-logo.py from the
   exported SVGs in src/icons/logo-raw/ — this used to be a styled text span reading
   "e&", which is not the mark. */
export interface LogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  version?: LogoVersion;
  /** Rendered size in px; the artwork is a square. */
  size?: number | string;
  /** Overrides the version's ink. Pass `currentColor` to inherit from CSS instead. */
  color?: string;
}
export function Logo({ version = 'default', size = 32, color: colorOverride, style, ...rest }: LogoProps) {
  return (
    <span role="img" aria-label="e&"
      style={{ display: 'inline-flex', flex: 'none', lineHeight: 0, ...style } as CSSProperties} {...rest}>
      <LogoArt version={version} size={size} color={colorOverride} />
    </span>
  );
}
