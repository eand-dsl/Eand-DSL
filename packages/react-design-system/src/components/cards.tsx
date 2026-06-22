import type { HTMLAttributes, ReactNode } from 'react';
import { color, space } from '../system';
import { Text, Badge, SmilesRow } from './primitives';
import { Button } from './Button';

const mutedOn = (onDark: boolean) => (onDark ? 'rgba(255,255,255,0.72)' : color('text.default.muted'));
const imageBox = (h: number, node?: ReactNode) => (
  <div style={{ width: '100%', height: h, borderRadius: 12, overflow: 'hidden', background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{node ?? '📦'}</div>
);

/* ---------------- PlanCard (Plans-mini) ---------------- */
export type PlanVariant = 'default' | 'brand' | 'midnight';
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  name?: ReactNode; category?: ReactNode; price?: ReactNode; period?: ReactNode;
  discount?: boolean; variant?: PlanVariant; smiles?: boolean; width?: number | string;
}
const PLAN_BG: Record<PlanVariant, string> = {
  default: color('surface.raised.default'), brand: color('surface.base.brand'), midnight: color('surface.base.midnight'),
};
export function PlanCard({ name = 'Entertainment plans', category = 'Postpaid', price = 'AED 1250', period = '/mo', discount = true, variant = 'default', smiles = true, width = 210, style, ...rest }: PlanCardProps) {
  const onDark = variant !== 'default';
  const text = onDark ? '#fff' : color('text.default.default');
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: PLAN_BG[variant], border: onDark ? 'none' : `1px solid ${color('border.solid.subtle')}`, borderRadius: 16, padding: space('lg'), minHeight: 224, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: space('lg'), ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm') }}>
          <Text variant="body.sm" color={mutedOn(onDark)}>{category}</Text>
          {discount ? (onDark
            ? <span style={{ background: '#fff', color: color('text.brand.default'), padding: `2px ${space('xs')}`, borderRadius: 8, fontWeight: 600, fontSize: 12 }}>Discount</span>
            : <Badge offer="discount" size="sm">Discount</Badge>) : null}
        </div>
        <Text variant="heading.sm" color={text}>{name}</Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        {smiles ? <SmilesRow count={2} plus={4} size={24} /> : null}
        <div>
          <Text variant="body.sm" color={mutedOn(onDark)} as="div">from</Text>
          <Text variant="title.sm" color={text}>{price}{period}</Text>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ProductCard / card-features (product · addon · category) ---------------- */
export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode; title?: ReactNode; image?: ReactNode; discount?: ReactNode;
  price?: ReactNode; period?: ReactNode; pts?: boolean; tint?: string; width?: number | string;
}
export function ProductCard({ eyebrow, title = 'iPhone Clear Case For Safe Use', image, discount, price = 'AED 200', period = '/mo', pts, tint, width = 200, style, ...rest }: ProductCardProps) {
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: tint ?? color('surface.raised.default'), border: `1px solid ${color('border.solid.subtle')}`, borderRadius: 16, padding: space('lg'), minHeight: image ? 280 : 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: space('md'), ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        {(eyebrow || (discount && !image)) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm') }}>
            {eyebrow ? <Text variant="body.sm" color={color('text.default.muted')}>{eyebrow}</Text> : <span />}
            {discount && !image ? <Badge offer="discount" size="sm">{discount}</Badge> : null}
          </div>
        )}
        {image ? (
          <div style={{ position: 'relative' }}>
            {imageBox(140, image)}
            {discount ? <span style={{ position: 'absolute', top: 8, right: 8 }}><Badge offer="discount" size="sm">{discount}</Badge></span> : null}
          </div>
        ) : null}
        <Text variant="title.sm">{title}</Text>
      </div>
      <div>
        <Text variant="body.sm" color={color('text.default.muted')} as="div">from</Text>
        <Text variant="title.sm">{pts ? `😊 ${price} PTS` : price}{period}</Text>
      </div>
    </div>
  );
}

/* ---------------- DealCard ---------------- */
export interface DealCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title?: ReactNode; subtitle?: ReactNode; badge?: ReactNode; width?: number | string;
}
export function DealCard({ image, title = 'Deal title', subtitle, badge, width = 240, style, ...rest }: DealCardProps) {
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: color('surface.raised.default'), border: `1px solid ${color('border.solid.subtle')}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      <div style={{ position: 'relative', padding: space('sm') }}>
        {imageBox(120, image)}
        {badge ? <span style={{ position: 'absolute', top: 14, left: 14 }}>{badge}</span> : null}
      </div>
      <div style={{ padding: `0 ${space('lg')} ${space('lg')}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="title.sm">{title}</Text>
        {subtitle ? <Text variant="body.sm" color={color('text.default.muted')}>{subtitle}</Text> : null}
      </div>
    </div>
  );
}

/* ---------------- NewCard ---------------- */
export interface NewCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title?: ReactNode; width?: number | string;
}
export function NewCard({ image, title = 'New on e&', width = 200, style, ...rest }: NewCardProps) {
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: color('surface.raised.default'), border: `1px solid ${color('border.solid.subtle')}`, borderRadius: 16, overflow: 'hidden', ...style }} {...rest}>
      {imageBox(140, image)}
      <div style={{ padding: space('md') }}><Text variant="title.sm">{title}</Text></div>
    </div>
  );
}

/* ---------------- ServiceCard ---------------- */
export interface ServiceCardProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode; label: ReactNode; badge?: ReactNode;
}
export function ServiceCard({ icon = '◍', label, badge, style, ...rest }: ServiceCardProps) {
  return (
    <button style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space('sm'), padding: space('md'), minHeight: 116, borderRadius: 16, border: `1px solid ${color('border.solid.subtle')}`, background: color('surface.canvas.default'), cursor: 'pointer', ...style }} {...rest}>
      {badge ? <span style={{ position: 'absolute', top: 8, left: 8 }}>{badge}</span> : null}
      <span style={{ fontSize: 34, lineHeight: 1 }}>{icon}</span>
      <Text variant="body.sm" style={{ textAlign: 'center' }}>{label}</Text>
    </button>
  );
}

/* ---------------- Highlight (banner) ---------------- */
export interface HighlightAction { title?: ReactNode; subtitle?: ReactNode; cta?: ReactNode; }
export interface HighlightProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode; subtitle?: ReactNode; image?: string; cta?: ReactNode;
  action?: HighlightAction; width?: number | string;
}
export function Highlight({ title = 'Primary Text 2-lines max', subtitle, image, cta, action, width, style, ...rest }: HighlightProps) {
  return (
    <div style={{ width: width ?? '100%', flex: width ? '0 0 auto' : undefined, boxSizing: 'border-box', position: 'relative', minHeight: 340, borderRadius: 20, overflow: 'hidden', background: image ? `center/cover no-repeat url(${image})` : 'linear-gradient(160deg,#3a3340,#191329)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...style }} {...rest}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,15,33,0) 35%, rgba(20,15,33,0.78))' }} />
      <div style={{ position: 'relative', padding: space('lg'), display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        <SmilesRow count={3} plus={0} size={32} />
        <Text variant="heading.sm" color="#fff">{title}</Text>
        {subtitle ? <Text variant="body.sm" color="rgba(255,255,255,0.85)">{subtitle}</Text> : null}
        {action ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm'), background: 'rgba(25,19,41,0.55)', backdropFilter: 'blur(4px)', borderRadius: 12, padding: space('sm'), marginTop: space('xs') }}>
            <div style={{ minWidth: 0 }}>
              <Text variant="title.xs" color="#fff" as="div">{action.title ?? 'Smiles Unlimited'}</Text>
              <Text variant="body.sm" color="rgba(255,255,255,0.75)">{action.subtitle ?? 'Exclusive venue deals'}</Text>
            </div>
            <Button size="sm">{action.cta ?? 'Play now'}</Button>
          </div>
        ) : cta ? <div style={{ marginTop: space('xs') }}><Button size="sm" variant="primary" tone="inverse">{cta}</Button></div> : null}
      </div>
    </div>
  );
}

/* ---------------- SmilesBalance ---------------- */
export interface SmilesBalanceProps extends HTMLAttributes<HTMLDivElement> {
  points?: ReactNode; cta?: ReactNode;
}
export function SmilesBalance({ points = '12,450 Smiles', cta = 'Redeem', style, ...rest }: SmilesBalanceProps) {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: 'linear-gradient(120deg,#e2c668,#d9b14a)', borderRadius: 16, padding: space('lg'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), ...style }} {...rest}>
      <div>
        <Text variant="body.sm" color="rgba(25,19,41,0.7)">Smiles balance</Text>
        <Text variant="heading.sm" as="div">{points}</Text>
      </div>
      <Button size="sm" variant="secondary">{cta}</Button>
    </div>
  );
}

/* ---------------- Voucher ---------------- */
export interface VoucherProps extends HTMLAttributes<HTMLDivElement> {
  value?: ReactNode; code?: ReactNode; validity?: ReactNode; status?: 'active' | 'redeemed' | 'expired';
}
export function Voucher({ value = 'AED 50 off', code = 'EAND50', validity, status = 'active', style, ...rest }: VoucherProps) {
  const s = status === 'active' ? 'positive' : status === 'expired' ? 'danger' : 'neutral';
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: color('surface.raised.default'), border: `1px dashed ${color('border.solid.default')}`, borderRadius: 16, padding: space('lg'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: space('md'), opacity: status === 'expired' ? 0.6 : 1, ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="heading.xs">{value}</Text>
        <Text variant="body.sm" color={color('text.default.muted')}>Code: {code}{validity ? ` · ${validity}` : ''}</Text>
      </div>
      <Badge status={s as any} size="sm">{status}</Badge>
    </div>
  );
}
