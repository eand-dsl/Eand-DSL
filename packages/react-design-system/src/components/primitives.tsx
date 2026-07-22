import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { T, ty, space, icon, color, PILL } from '../system';

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

/* ---------------- Icon ---------------- */
export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | string;
}
export function Icon({ size = 'md', style, children, ...rest }: IconProps) {
  const d = icon(size);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: d, height: d, flex: '0 0 auto', ...style }} {...rest}>
      {children ?? '◍'}
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
  // Figma V1.1: fixed heights 16/20/24; md = px8 py4, min-width 56; radius 8.
  const height = size === 'lg' ? 24 : size === 'sm' ? 16 : 20;
  const padY = size === 'sm' ? 2 : 4;
  const padX = size === 'sm' ? space('xs') : space('sm');
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('2xs'),
        boxSizing: 'border-box', height, minWidth: size === 'md' ? 56 : undefined,
        padding: `${padY}px ${padX}`, borderRadius: 8,
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
  // Figma V1.1 progress-bar-core: 300x4, fill color/text/positive/subtle.
  const fill = tone === 'accent' ? color('status.accent')
    : tone === 'positive' ? color('status.positive')
    : tone === 'warning' ? color('status.warning')
    : tone === 'danger' ? color('status.danger')
    : color('text.positive.subtle');
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
      style={{ width: '100%', height: 4, borderRadius: PILL, background: color('surface.sunken.default'), overflow: 'hidden', ...style }} {...rest}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: fill, borderRadius: PILL }} />
    </div>
  );
}

/* ---------------- Stepper ----------------
   Segmented step progress (Figma V1.1 Stepper, page 31614:11244): a 6px-tall row of
   equal pill segments, 2–8 steps, completed segments filled. Also used as the
   top-bar `.topbar-stepper` bottom element. */
// Figma vars color/stepper/{scheme}/{state} — not yet in the generated tokens.ts
// (variables.json export predates the stepper group), values from live Figma.
const STEPPER = {
  default: { inactive: '#e4e3ea', active: '#e73933' },
  inverse: { inactive: '#ffffff66', active: '#ffffff' },
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

/* ---------------- AddTrigger ---------------- */
export interface AddTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}
export function AddTrigger({ label = 'Add', style, onClick, ...rest }: AddTriggerProps) {
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs'), height: 40, padding: `0 ${space('lg')}`,
        borderRadius: PILL, border: `1px dashed ${color('border.default')}`, background: 'transparent',
        color: color('text.brand.default'), cursor: 'pointer', ...ty('button.md'), ...style }} {...rest}>
      <Icon size="lg">＋</Icon>{label}
    </button>
  );
}

/* ---------------- Dismiss ----------------
   Figma V1.1 Dismiss (page 28961:16066): a circular close button — a filled circle
   in the dismiss colour with a white X. surface default | inverse × size md(24) | sm(20). */
// color/dismiss/{default,inverse} — not in the generated tokens.ts; values from live Figma.
const DISMISS_BG = { default: '#908e9a', inverse: '#c0bfc8' } as const;
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
      {logos.map((l, i) => <span key={i} style={{ height: 32, display: 'inline-flex', alignItems: 'center' }}>{l}</span>)}
    </div>
  );
}

/* ---------------- AtomSurface ---------------- */
export interface AtomSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  level?: 'canvas' | 'base' | 'raised' | 'sunken';
}
export function AtomSurface({ level = 'base', style, children, ...rest }: AtomSurfaceProps) {
  return (
    <div style={{ background: color(`surface.${level}.default`), borderRadius: T.borderRadius?.['5'] ?? '16px', ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ---------------- Logo ---------------- */
export function Logo({ style, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span style={{ fontWeight: 700, color: color('text.brand.default'), fontSize: 22, letterSpacing: '-0.02em', ...style } as CSSProperties} {...rest}>
      e&amp;
    </span>
  );
}
