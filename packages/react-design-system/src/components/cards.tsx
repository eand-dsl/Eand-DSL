import type { HTMLAttributes, ReactNode } from 'react';
import { color, space } from '../system';
import { Text, Badge } from './primitives';
import { Button } from './Button';

const media = (h: number, node?: ReactNode) => (
  <div style={{ width: '100%', height: h, background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: color('text.default.muted') }}>{node ?? '🖼'}</div>
);
const shell = (extra?: any): any => ({
  boxSizing: 'border-box', background: color('surface.raised.default'), border: `1px solid ${color('border.solid.subtle')}`,
  borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...extra,
});

/* ---------------- ProductCard ---------------- */
export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title: ReactNode; price: ReactNode; badge?: ReactNode; cta?: ReactNode; width?: number | string;
}
export function ProductCard({ image, title, price, badge, cta = 'Add', width = 170, style, ...rest }: ProductCardProps) {
  return (
    <div style={shell({ width, flex: '0 0 auto', ...style })} {...rest}>
      <div style={{ position: 'relative' }}>{media(120, image)}{badge ? <span style={{ position: 'absolute', top: 8, left: 8 }}><Badge tone="accent" size="sm">{badge}</Badge></span> : null}</div>
      <div style={{ padding: space('md'), display: 'flex', flexDirection: 'column', gap: space('xs') }}>
        <Text variant="title.xs">{title}</Text>
        <Text variant="heading.xs">{price}</Text>
        <Button size="sm" block style={{ marginTop: space('xs') }}>{cta}</Button>
      </div>
    </div>
  );
}

/* ---------------- DealCard ---------------- */
export interface DealCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title: ReactNode; subtitle?: ReactNode; badge?: ReactNode; width?: number | string;
}
export function DealCard({ image, title, subtitle, badge = 'Limited', width = 240, style, ...rest }: DealCardProps) {
  return (
    <div style={shell({ width, flex: '0 0 auto', ...style })} {...rest}>
      <div style={{ position: 'relative' }}>{media(120, image)}<span style={{ position: 'absolute', top: 8, left: 8 }}><Badge tone="warning" size="sm">{badge}</Badge></span></div>
      <div style={{ padding: space('md'), display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="title.sm">{title}</Text>
        {subtitle ? <Text variant="body.sm" color={color('text.default.muted')}>{subtitle}</Text> : null}
      </div>
    </div>
  );
}

/* ---------------- PlanCard ---------------- */
export interface PlanCardProps extends HTMLAttributes<HTMLDivElement> {
  name: ReactNode; price: ReactNode; period?: ReactNode; features?: ReactNode[]; recommended?: boolean; cta?: ReactNode; width?: number | string;
}
export function PlanCard({ name, price, period = '/mo', features = [], recommended, cta = 'Choose', width = 240, style, ...rest }: PlanCardProps) {
  return (
    <div style={shell({ width, flex: '0 0 auto', border: recommended ? `2px solid ${color('border.focus')}` : `1px solid ${color('border.solid.subtle')}`, ...style })} {...rest}>
      <div style={{ padding: space('lg'), display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="title.md">{name}</Text>{recommended ? <Badge tone="accent" size="sm">Recommended</Badge> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><Text variant="heading.md">{price}</Text><Text variant="body.sm" color={color('text.default.muted')}>{period}</Text></div>
        <ul style={{ margin: 0, paddingLeft: space('lg'), display: 'flex', flexDirection: 'column', gap: 2 }}>
          {features.map((f, i) => <li key={i}><Text variant="body.sm">{f}</Text></li>)}
        </ul>
        <Button block style={{ marginTop: space('xs') }}>{cta}</Button>
      </div>
    </div>
  );
}

/* ---------------- NewCard ---------------- */
export interface NewCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title: ReactNode; width?: number | string;
}
export function NewCard({ image, title, width = 200, style, ...rest }: NewCardProps) {
  return (
    <div style={shell({ width, flex: '0 0 auto', ...style })} {...rest}>
      {media(140, image)}
      <div style={{ padding: space('md') }}><Text variant="title.sm">{title}</Text></div>
    </div>
  );
}

/* ---------------- ServiceCard ---------------- */
export interface ServiceCardProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode; label: ReactNode;
}
export function ServiceCard({ icon = '◍', label, style, ...rest }: ServiceCardProps) {
  return (
    <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('xs'), padding: space('md'), borderRadius: 16, border: `1px solid ${color('border.solid.subtle')}`, background: color('surface.raised.default'), cursor: 'pointer', ...style }} {...rest}>
      <span style={{ fontSize: 28 }}>{icon}</span><Text variant="body.sm" style={{ textAlign: 'center' }}>{label}</Text>
    </button>
  );
}

/* ---------------- Highlight (banner, full-bleed) ---------------- */
export interface HighlightProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode; subtitle?: ReactNode; cta?: ReactNode; background?: string;
}
export function Highlight({ title, subtitle, cta, background, style, ...rest }: HighlightProps) {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: background ?? color('surface.base.brand'), color: color('text.default.inverse'), padding: space('xl'), borderRadius: 16, display: 'flex', flexDirection: 'column', gap: space('sm'), ...style }} {...rest}>
      <Text variant="heading.sm" color={color('text.default.inverse')}>{title}</Text>
      {subtitle ? <Text variant="body.md" color={color('text.default.inverse')} style={{ opacity: 0.9 }}>{subtitle}</Text> : null}
      {cta ? <div style={{ marginTop: space('xs') }}><Button variant="primary" tone="inverse" size="sm">{cta}</Button></div> : null}
    </div>
  );
}

/* ---------------- SmilesBalance ---------------- */
export interface SmilesBalanceProps extends HTMLAttributes<HTMLDivElement> {
  points: ReactNode; cta?: ReactNode;
}
export function SmilesBalance({ points, cta = 'Redeem', style, ...rest }: SmilesBalanceProps) {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: color('special.gold.600') || '#e2c668', borderRadius: 16, padding: space('lg'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...style }} {...rest}>
      <div>
        <Text variant="body.sm" color={color('text.default.default')}>Smiles balance</Text>
        <Text variant="heading.md" as="div">{points}</Text>
      </div>
      <Button size="sm" variant="secondary">{cta}</Button>
    </div>
  );
}

/* ---------------- Voucher ---------------- */
export interface VoucherProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode; code: ReactNode; validity?: ReactNode; status?: 'active' | 'redeemed' | 'expired';
}
export function Voucher({ value, code, validity, status = 'active', style, ...rest }: VoucherProps) {
  const tone = status === 'active' ? 'positive' : status === 'expired' ? 'danger' : 'neutral';
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: color('surface.raised.default'), border: `1px dashed ${color('border.solid.default')}`, borderRadius: 16, padding: space('lg'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: status === 'expired' ? 0.6 : 1, ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="heading.sm">{value}</Text>
        <Text variant="body.sm" color={color('text.default.muted')}>Code: {code}{validity ? ` · ${validity}` : ''}</Text>
      </div>
      <Badge tone={tone as any} size="sm">{status}</Badge>
    </div>
  );
}
