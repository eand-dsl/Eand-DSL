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
export type BadgeStatus = 'neutral' | 'positive' | 'warning' | 'danger' | 'brand';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  offer?: BadgeOffer;
  status?: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
}
export function Badge({ offer, status = 'neutral', size = 'md', style, children, ...rest }: BadgeProps) {
  const key = offer ? `offers.${offer}` : `status.${status}`;
  const padY = size === 'lg' ? 4 : size === 'sm' ? 1 : 2;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: space('2xs'),
        padding: `${padY}px ${size === 'lg' ? space('sm') : space('xs')}`, borderRadius: 8,
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
  tone?: 'accent' | 'positive' | 'warning' | 'danger';
}
export function ProgressBar({ value = 50, tone = 'accent', style, ...rest }: ProgressBarProps) {
  const fill = tone === 'positive' ? color('status.positive') : tone === 'warning' ? color('status.warning')
    : tone === 'danger' ? color('status.danger') : color('status.accent');
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
      style={{ width: '100%', height: 8, borderRadius: PILL, background: color('surface.sunken.default'), overflow: 'hidden', ...style }} {...rest}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: fill, borderRadius: PILL }} />
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
      <Icon size="sm">＋</Icon>{label}
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
