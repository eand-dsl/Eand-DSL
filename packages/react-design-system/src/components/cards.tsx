import type { HTMLAttributes, ReactNode } from 'react';
import { color, space, radius, rowHeight, ty, PILL, T } from '../system';
import { Text, Badge, SmilesRow, cardBgTint } from './primitives';
import { Icon } from '../icons';
import type { CardBgTint } from './primitives';
import { Button } from './Button';
import { VOUCHER_SHAPE_PATH, VOUCHER_SHAPE_SIZE } from './voucher-shape';

const mutedOn = (onDark: boolean) => (onDark ? 'rgba(255,255,255,0.72)' : color('text.default.muted'));
const imageBox = (h: number, node?: ReactNode) => (
  <div style={{ width: '100%', height: h, borderRadius: radius('3'), overflow: 'hidden', background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{node ?? <Icon name="image" size={40} />}</div>
);

/* ---------------- PlanCard (plans-mini) ----------------
   Figma `plans-mini` 26003:40647 — one axis, `color-scheme`, two values, both 222x300
   (section/body/height/row-4) at border-radius/5 = 16:
     color-scheme=default 26003:40646  surface/base/inverse   ink text/default/default
     color-scheme=inverse 26003:40648  surface/base/midnight  ink text/default/inverse
   The V1.0 `variant` axis had three values; `brand` has no Figma counterpart and
   `midnight` is Figma's `inverse`. */
export type PlanColorScheme = 'default' | 'inverse';
/** @deprecated Use `colorScheme`. `midnight` is `inverse`; `brand` has no Figma counterpart. */
export type PlanVariant = 'default' | 'brand' | 'midnight';
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  name?: ReactNode; category?: ReactNode; price?: ReactNode; period?: ReactNode;
  discount?: boolean;
  /** Figma `color-scheme` axis. Takes precedence over `variant`. */
  colorScheme?: PlanColorScheme;
  /** @deprecated Use `colorScheme`. */
  variant?: PlanVariant;
  smiles?: boolean; width?: number | string;
}
const PLAN_BG: Record<PlanVariant, string> = {
  // Figma default binds surface/base/inverse (currently opaque via the stale export alias).
  default: color('surface.base.inverse'), brand: color('surface.base.brand'), midnight: color('surface.base.midnight'),
};
const SCHEME_TO_VARIANT: Record<PlanColorScheme, PlanVariant> = { default: 'default', inverse: 'midnight' };
export function PlanCard({ name = 'Entertainment plans', category = 'Postpaid', price = 'AED 1250', period = '/mo', discount = true, colorScheme, variant, smiles = true, width = 222, style, ...rest }: PlanCardProps) {
  const v: PlanVariant = colorScheme ? SCHEME_TO_VARIANT[colorScheme] : (variant ?? 'default');
  const onDark = v !== 'default';
  const text = onDark ? '#fff' : color('text.default.default');
  return (
    /* Figma plans-mini (26003:40647): radius 16, p16, no border on either scheme. */
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: PLAN_BG[v], borderRadius: radius('5'), padding: space('lg'), minHeight: rowHeight('row-4'), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: space('lg'), ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm') }}>
          {/* `.header > wrapper`: body/md in text/default/subtle, with the lg offers badge. */}
          <Text variant="body.md" color={onDark ? mutedOn(onDark) : color('text.default.subtle')}>{category}</Text>
          {discount ? (onDark
            ? <span style={{ background: '#fff', color: color('text.brand.default'), padding: `${space('xs')} ${space('sm')}`, borderRadius: radius('2'), fontWeight: 600, fontSize: 14, minWidth: 64, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>Discount</span>
            : <Badge offer="discount" size="lg">Discount</Badge>) : null}
        </div>
        <Text variant="heading.md" color={text}>{name}</Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        {/* logo-row logos are 32x24 pills in V1.1, not 24-square. */}
        {smiles ? <SmilesRow count={2} plus={4} size={24} /> : null}
        <div>
          <Text variant="body.md" color={onDark ? mutedOn(onDark) : color('text.default.subtle')} as="div">from</Text>
          <Text variant="title.md" color={text}>{price}{period}</Text>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ProductCard / card-features (addon · product · category) ----------------
   Figma publishes three sibling components rather than one variant set, each 229x300
   (section/body/height/row-4) at border-radius/6 = 20 with no resting border:
     card-features-addon    25893:54098  no image; content fills; Smiles pricing
     card-features-product  26522:14492  media panel on top, name below
     card-features-category 26521:1397   full-card tint, category label, centred image
   `type` selects between them; the shared shell is identical. */
export type ProductCardType = 'addon' | 'product' | 'category';
export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode; title?: ReactNode; image?: ReactNode; discount?: ReactNode;
  price?: ReactNode; period?: ReactNode; pts?: boolean;
  /** Which card-features sibling this is. */
  type?: ProductCardType;
  /** A `.card-bg-color` tint name (Figma 25710:20065). A raw CSS colour still works. */
  tint?: CardBgTint | (string & {});
  width?: number | string;
}
const isTintName = (t: string): t is CardBgTint =>
  ['default', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'].includes(t);
export function ProductCard({ eyebrow, title = 'iPhone Clear Case For Safe Use', image, discount, price = 'AED 200', period = '/mo', pts, type, tint, width = 200, style, ...rest }: ProductCardProps) {
  // Back-compat: callers that predate `type` are inferred from whether they pass an image.
  const kind: ProductCardType = type ?? (image ? 'product' : 'addon');
  // category tints the whole card; the other two sit on the raised surface unless tinted.
  const bg = tint != null ? (isTintName(tint) ? cardBgTint(tint) : tint)
    : kind === 'category' ? cardBgTint('orange')
    : color('surface.raised.default');
  return (
    /* Figma card-features (25893:54098): radius border-radius/6 = 20, no resting border,
       height section/body/height/row-4 = 300 across all three siblings. */
    <div data-card-type={kind} style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: bg, borderRadius: radius('6'), padding: space('lg'), minHeight: rowHeight('row-4'), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: space('md'), ...style }} {...rest}>
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
        <Text variant="title.sm">
          {pts ? <><Icon name="smiley" size={16} /> {price} PTS</> : price}{period}
        </Text>
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
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', minHeight: rowHeight('row-3'), background: color('surface.raised.default'), border: `1px solid ${color('border.surface-based.raised.default')}`, borderRadius: radius('5'), overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {/* image fills the remaining height (Figma .card-general: 224 tall, image inset-0, title pinned bottom) */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', padding: space('sm') }}>
        <div style={{ flex: 1, borderRadius: radius('3'), overflow: 'hidden', background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{image ?? <Icon name="image" size={40} />}</div>
        {badge ? <span style={{ position: 'absolute', top: 14, left: 14 }}>{badge}</span> : null}
      </div>
      <div style={{ padding: `0 ${space('lg')} ${space('lg')}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="title.sm">{title}</Text>
        {subtitle ? <Text variant="body.sm" color={color('text.default.muted')}>{subtitle}</Text> : null}
      </div>
    </div>
  );
}

/* ---------------- NewCard ----------------
   Figma `new-on` 26523:22852 — one axis, `selected`, two values, both h 224
   (section/body/height/row-3):
     selected=yes 26523:22851   2px (border/lg) red->green ring + New-card badge
     selected=no  26523:22853   plain tile
   The ring runs Red/100 #e00800 -> Light Green/Base #47cb6c; per the V1.1 rules it
   appears only on the last carousel card, for three days. */
export interface NewCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title?: ReactNode; width?: number | string;
  /** Figma `selected` axis — the gradient ring plus the New-card badge. */
  selected?: boolean;
}
export function NewCard({ image, title = 'New on e&', width = 137, selected, style, ...rest }: NewCardProps) {
  return (
    /* `.new-on-core` 26523:22827 — a Story column, not a card: the tile itself has no
       surface, no border and no radius. Only the picture frame is rounded. */
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('md'),
      width, flex: '0 0 auto', boxSizing: 'border-box', height: rowHeight('row-3'), ...style,
    }} {...rest}>
      <div data-part="frame" style={{
        position: 'relative', flex: '1 1 auto', minHeight: 0, width: '100%', boxSizing: 'border-box',
        padding: space('xs'), borderRadius: radius('7'), overflow: 'hidden',
        ...(selected ? {
          // border/lg = 2. Figma's generated code reports a solid `light-green/base`
          // #47cb6c, while the rendered frame shows a red->green ring; the gradient is
          // kept since that is what the component actually looks like. #47cb6c is a legacy
          // colour style with no variable — see design-questions.md q6.
          // T.border.lg already carries its unit ("2px") — appending px yields "2pxpx",
          // which the browser drops silently.
          border: `${T.border?.lg ?? '2px'} solid transparent`,
          backgroundImage: `linear-gradient(${color('surface.raised.default')}, ${color('surface.raised.default')}), linear-gradient(135deg, ${color('status.accent')}, #47cb6c)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        } : null),
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: radius('6'), overflow: 'hidden', background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {image ?? <Icon name="image" size={40} />}
        </div>
        {selected ? (
          // Inset is 10px on the ringed variant and 12px plain — the 2px border makes up
          // the difference, so both land 12px from the outer edge.
          <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
            <Badge offer="new-card" size="md">New card</Badge>
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${space('md')}`, width: '100%', boxSizing: 'border-box' }}>
        <Text variant="body.md" as="p" style={{ textAlign: 'center', lineHeight: 1.4, margin: 0 }}>{title}</Text>
      </div>
    </div>
  );
}

/* ---------------- ServiceCard ---------------- */
/** Figma `service-card-sizes` 27216:41370 — grid 109x148, carousel 128x148. */
export type ServiceCardSize = 'grid' | 'carousel';
const SERVICE_CARD_WIDTH: Record<ServiceCardSize, number> = { grid: 109, carousel: 128 };
export interface ServiceCardProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode; label: ReactNode; badge?: ReactNode;
  /** Figma `size` axis; omit to let the cell fill its grid track. */
  size?: ServiceCardSize;
}
export function ServiceCard({ icon = <Icon name="placeholder" size={34} />, label, badge, size, style, ...rest }: ServiceCardProps) {
  return (
    <button style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space('sm'), padding: space('md'), width: size ? SERVICE_CARD_WIDTH[size] : undefined, minHeight: rowHeight('row-2'), borderRadius: radius('6'), border: 0, background: color('surface.canvas.default'), cursor: 'pointer', ...style }} {...rest}>
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
  tone?: 'image' | 'brand' | 'purple'; background?: string;
}
export function Highlight({ title = 'Primary Text 2-lines max', subtitle, image, cta, action, width, tone = 'image', background, style, ...rest }: HighlightProps) {
  const bg = background
    ?? (tone === 'brand' ? color('surface.base.brand')
      : tone === 'purple' ? 'linear-gradient(150deg,#7C4DD6,#3A1B6B)'
      : image ? `center/cover no-repeat url(${image})`
      : 'linear-gradient(160deg,#3a3340,#191329)');
  return (
    <div style={{ width: width ?? '100%', flex: width ? '0 0 auto' : undefined, boxSizing: 'border-box', position: 'relative', minHeight: tone === 'image' ? rowHeight('row-6') : 200, borderRadius: radius('7'), overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...style }} {...rest}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,15,33,0) 35%, rgba(20,15,33,0.78))' }} />
      <div style={{ position: 'relative', padding: space('lg'), display: 'flex', flexDirection: 'column', gap: space('sm') }}>
        <SmilesRow count={3} plus={0} size={32} />
        <Text variant="heading.sm" color="#fff">{title}</Text>
        {subtitle ? <Text variant="body.sm" color="rgba(255,255,255,0.85)">{subtitle}</Text> : null}
        {action ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm'), background: 'rgba(25,19,41,0.55)', backdropFilter: 'blur(4px)', borderRadius: radius('3'), padding: space('sm'), marginTop: space('xs') }}>
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
    <div style={{ width: '100%', boxSizing: 'border-box', background: 'linear-gradient(120deg,#e2c668,#d9b14a)', borderRadius: radius('5'), padding: space('lg'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), ...style }} {...rest}>
      <div>
        <Text variant="body.sm" color="rgba(25,19,41,0.7)">Smiles balance</Text>
        <Text variant="heading.sm" as="div">{points}</Text>
      </div>
      <Button size="sm" variant="secondary">{cta}</Button>
    </div>
  );
}

/* ---------------- Voucher ----------------
   Figma `Voucher` 28278:13817 — a fixed 144x144 ticket tile, `Display`(Light|Dark) x
   `State`(Default|Applied). The V1.0 code was a full-width coupon row that faked the
   perforation with a dashed border; the real shape is one exported path whose dash
   subpaths punch holes (see voucher-shape.ts).

   `status` is the V1.0 model and has no clean V1.1 mapping: Figma has only Default and
   Applied. active -> Default and redeemed -> Applied are unambiguous; `expired` has no
   counterpart, so it renders Applied-but-dimmed and is flagged for design
   (tools/audit/v1.1/design-questions.md q9) rather than invented. */
export type VoucherDisplay = 'light' | 'dark';
export type VoucherState = 'default' | 'applied';
export interface VoucherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  /** Second line under the title, e.g. "above AED 60+". */
  description?: ReactNode;
  display?: VoucherDisplay;
  state?: VoucherState;
  onApply?: () => void;
  /** @deprecated V1.0. `active`->Default, `redeemed`->Applied; `expired` dims the tile. */
  status?: 'active' | 'redeemed' | 'expired';
}
export function Voucher({
  title = 'Title with 2 lines', description = 'above AED 60+',
  display = 'light', state, status, onApply, style, ...rest
}: VoucherProps) {
  const st: VoucherState = state ?? (status && status !== 'active' ? 'applied' : 'default');
  const dark = display === 'dark';
  // Dark binds surface/raised/midnight (#312c40), not base/midnight — read off the
  // Dark variants (28278:13836/13845), where base/midnight does not appear at all.
  const ticket = dark ? color('surface.raised.midnight') : color('surface.base.inverse');
  const ink = dark ? color('text.default.inverse') : color('text.default.default');
  const applied = st === 'applied';
  // The Applied green differs per display: subtle (#54bc72) on light, muted (#9ff3b7) on
  // dark. Using one green for both left the dark tile at roughly 1.3:1 — unreadable.
  const appliedInk = dark ? color('text.positive.muted') : color('text.positive.subtle');
  return (
    <div style={{
      position: 'relative', width: VOUCHER_SHAPE_SIZE, height: VOUCHER_SHAPE_SIZE, flex: '0 0 auto',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center',
      borderRadius: radius('5'), overflow: 'hidden', opacity: status === 'expired' ? 0.6 : 1, ...style,
    }} {...rest}>
      {/* Shape 28278:13819 — outline, side notches and perforation in one path. */}
      <svg aria-hidden width={VOUCHER_SHAPE_SIZE} height={VOUCHER_SHAPE_SIZE}
        viewBox={`0 0 ${VOUCHER_SHAPE_SIZE} ${VOUCHER_SHAPE_SIZE}`}
        style={{ position: 'absolute', inset: 0 }}>
        <path d={VOUCHER_SHAPE_PATH} fill={ticket} />
      </svg>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `${space('lg')} ${space('sm')}`, overflow: 'hidden' }}>
        <Text as="div" variant="title.xs" color={ink} style={{ lineHeight: 1.3, width: '100%' }}>{title}</Text>
        {description != null ? <Text as="div" variant="body.md" color={ink} style={{ lineHeight: 1.4, width: '100%' }}>{description}</Text> : null}
      </div>
      <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${space('lg')} ${space('md')}` }}>
        <button type="button" onClick={applied ? undefined : onApply} disabled={applied}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('xs'), border: 0, background: 'transparent', borderRadius: PILL, cursor: applied ? 'default' : 'pointer', padding: `0 ${space('xs')}`, ...ty('button.lg'), color: applied ? appliedInk : (dark ? color('text.default.inverse') : color('button.tertiary.text.midnight.default')) }}>
          {applied ? 'Applied' : 'Apply'}
          <Icon name={applied ? 'check' : 'add-filled'} size={24} />
        </button>
      </div>
    </div>
  );
}
