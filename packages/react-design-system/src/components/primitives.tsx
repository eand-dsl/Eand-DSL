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

/* ---------------- Badge ---------------- */
export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'accent' | 'gold' | 'silver' | 'platinum' | 'bronze';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md' | 'lg';
}
const BADGE_BG: Record<BadgeTone, string> = {
  neutral: color('surface.sunken.default'), accent: color('surface.base.brand'),
  positive: T.color.green?.['600'] ?? '#54bc72', warning: T.color.yellow?.['600'] ?? '#d5b549',
  danger: color('surface.base.brand'), gold: T.color.special?.gold?.['600'] ?? '#e2c668',
  silver: T.color.special?.silver?.['1000'] ?? '#e8e7ea', platinum: T.color.special?.['blue-platinum']?.['300'] ?? '#c2c1e7',
  bronze: T.color.special?.bronze?.['1000'] ?? '#9f5739',
};
export function Badge({ tone = 'neutral', size = 'md', style, children, ...rest }: BadgeProps) {
  const pad = size === 'lg' ? space('sm') : space('xs');
  const dark = tone === 'accent' || tone === 'danger' || tone === 'bronze';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: space('2xs'),
        padding: `2px ${pad}`, borderRadius: PILL, background: BADGE_BG[tone],
        color: dark ? '#fff' : color('text.default.default'),
        ...ty(`badge.${size}`), whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {children}
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
