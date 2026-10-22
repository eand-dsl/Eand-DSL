import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { color, space, radius, rowHeight, ty, scale, icon as iconSize, PILL, T } from '../system';
import { Text, Badge, cardBgTint } from './primitives';
import { Icon } from '../icons';
import type { CardBgTint } from './primitives';
import { Button } from './Button';
import { ActionBar } from './navigation';
import { VOUCHER_SHAPE_PATH, VOUCHER_SHAPE_SIZE } from './voucher-shape';

/* ---------------- Shared: V1.2 heading text styles (G6 X1) ----------------
   Figma V1.2's published heading TEXT STYLES sit one step below the typography/heading
   variables: heading/lg 24, md 20, sm 18, xs 16, all line height 110% (xs 120%), tracking
   font/letter-spacing/snug (xs none). Each style binds font/size/N directly. Card titles
   apply the style, so they are set explicitly from it here — correct both before and after
   `ty('heading.*')` is moved onto the styles. Family and weight come from the token. */
const headingStyle = (size: string, lineHeight: string, tracking: string): CSSProperties => ({
  ...ty('heading.xs'),
  fontSize: T.font.size[size],
  lineHeight,
  letterSpacing: T.font.letterSpacing[tracking],
});
const H = {
  lg: headingStyle('7', '1.1', 'snug'), // heading/lg 24/110%
  md: headingStyle('6', '1.1', 'snug'), // heading/md 20/110%
  sm: headingStyle('5', '1.1', 'snug'), // heading/sm 18/110%
  xs: headingStyle('4', '1.2', 'none'), // heading/xs 16/120%
};
/** Figma `maxLines` + truncation ENDING. */
const clamp = (lines: number): CSSProperties => ({
  display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
});
/* `Text/Default/Dark/High-emphasis` (#140f21) is a legacy, non-DSL colour variable still
   bound inside several V1.2 cards (G6 X2). It has no V1.2 token; text/default/default is
   #191329, a near match that rule 8 forbids binding. Kept literal — design-questions. */
const LEGACY_HIGH_EMPHASIS = '#140f21';

/* ---------------- Shared: logo-row (Figma 25997:32516) ----------------
   size sm = 24 logos · md = 32 logos, gap spacing/xs; style=glass wraps each logo in a
   48 (md) / 40 (sm) glass-white-lg circle with an 8px margin and a hairline ring, gap
   spacing/sm. `more-items` is the +N bubble: glass/midnight/lg on light cards,
   glass/white/md on inverse ones. `primitives` LogoRow has no size/style axes yet, so
   cards draw the published row here. Without `logos`, Smiles placeholders stand in for
   the Brands image, as the old SmilesRow did. */
function SmilesPlaceholder({ size }: { size: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: '#6C3FD6', color: '#fff', fontSize: Math.max(7, size * 0.3), fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', boxSizing: 'border-box' }}>smiles</span>;
}
type LogoRowSize = 'sm' | 'md';
function CardLogoRow({ size, glass, inverse, logos, placeholders = 2, more }: {
  size: LogoRowSize; glass?: boolean; inverse?: boolean; logos?: ReactNode[]; placeholders?: number; more?: number;
}) {
  const d = size === 'md' ? 32 : 24;
  const items = logos ?? Array.from({ length: placeholders }, (_, i) => <SmilesPlaceholder key={i} size={d} />);
  const cell = (node: ReactNode, i: number) => glass ? (
    <span key={i} data-part="logo" style={{
      display: 'inline-flex', padding: space('sm'), borderRadius: PILL,
      background: color('surface.glass.white.lg'), backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <span style={{ width: d, height: d, borderRadius: PILL, overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `inset 0 0 0 ${T.border.xs} ${color('border.surface-based.glass.default.sm')}` }}>{node}</span>
    </span>
  ) : (
    <span key={i} data-part="logo" style={{ width: d, height: d, borderRadius: PILL, overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{node}</span>
  );
  return (
    <span data-part="logo-row" style={{ display: 'inline-flex', alignItems: 'center', gap: glass ? space('sm') : space('xs') }}>
      {items.map(cell)}
      {more ? (
        <span style={{
          width: d, height: d, borderRadius: PILL, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: inverse ? color('surface.glass.white.md') : color('surface.glass.midnight.lg'),
          color: color('text.default.inverse'), ...ty('body.xs'),
        }}>+{more}</span>
      ) : null}
    </span>
  );
}

/* ---------------- Shared: the card-features tint panel ----------------
   A frame at border-radius/8 (24) with a 4px (border/xl) INSIDE stroke in
   border/interactive/inverse/pressed (#fff), filled by `.card-bg-color`. That stroke is the
   white ring visible on every card-features sibling. An inset shadow draws it without
   changing the panel's geometry, as an inside stroke does not. */
const tintPanel = (bg: string): CSSProperties => ({
  position: 'relative', boxSizing: 'border-box', borderRadius: radius('8'), overflow: 'hidden', background: bg,
  boxShadow: `inset 0 0 0 ${T.border.xl} ${color('border.interactive.inverse.pressed')}`,
});
const imageWell = (node: ReactNode | undefined, style?: CSSProperties) => (
  <div data-part="image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style }}>
    {node ?? <Icon name="image" size={40} color={color('text.default.subtle')} />}
  </div>
);

/* ---------------- PlanCard (plans-portable) ----------------
   Figma `plans-portable` 26003:40647 (renamed from plans-mini) — one axis, `color-scheme`,
   both 222x300 (section/body/height/row-4) at border-radius/6 = 16, padding 16:
     color-scheme=default 26003:40646  .surface-default  surface/base/inverse
     color-scheme=inverse 26003:40648  .surface-inverse  surface/base/midnight
   `.plans-portable-core` 37502:7996: header (gap spacing/xs) = overline body/md subtle,
   title heading/md style, logo-row md (pTop spacing/sm); footer (bottom-aligned, gap
   spacing/xs) = badges-offers lg Discount, "from" body/md, price title/md. The badge is
   in the FOOTER, and both schemes use the same red Discount badge. Inverse ink binds
   text/default/inverse + inverse-subtle. The V1.0 `variant` axis had three values;
   `brand` has no Figma counterpart and `midnight` is Figma's `inverse`. */
export type PlanColorScheme = 'default' | 'inverse';
/** @deprecated Use `colorScheme`. `midnight` is `inverse`; `brand` has no Figma counterpart. */
export type PlanVariant = 'default' | 'brand' | 'midnight';
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `title-string`. */
  name?: ReactNode;
  /** Figma `overline-string`. `null` hides the overline. */
  category?: ReactNode;
  /** Figma `price-string`. */
  price?: ReactNode;
  /** Figma `price-monthly`. `null` hides it. */
  period?: ReactNode;
  /** Figma `price-from` — the "from" line above the price. */
  from?: boolean;
  /** Figma `badge` — the lg Discount badge in the footer. `true` labels it "Discount". */
  discount?: ReactNode;
  /** Figma `color-scheme` axis. Takes precedence over `variant`. */
  colorScheme?: PlanColorScheme;
  /** @deprecated Use `colorScheme`. */
  variant?: PlanVariant;
  /** Figma `logo-row` (md, 32px logos). Shows Smiles placeholders unless `logos` is given. */
  smiles?: boolean;
  /** Logos for the logo row; implies `smiles`. */
  logos?: ReactNode[];
  /** The +N bubble at the end of the logo row. Default 4 with placeholders. */
  moreLogos?: number;
  width?: number | string;
}
const PLAN_BG: Record<PlanVariant, string> = {
  default: color('surface.base.inverse'), brand: color('surface.base.brand'), midnight: color('surface.base.midnight'),
};
const SCHEME_TO_VARIANT: Record<PlanColorScheme, PlanVariant> = { default: 'default', inverse: 'midnight' };
export function PlanCard({ name = 'Entertainment plans', category = 'Postpaid', price = 'AED 1250', period = '/mo', from = true, discount = true, colorScheme, variant, smiles = true, logos, moreLogos, width = 222, style, ...rest }: PlanCardProps) {
  const v: PlanVariant = colorScheme ? SCHEME_TO_VARIANT[colorScheme] : (variant ?? 'default');
  const onDark = v !== 'default';
  const ink = onDark ? color('text.default.inverse') : color('text.default.default');
  const sub = onDark ? color('text.default.inverse-subtle') : color('text.default.subtle');
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: PLAN_BG[v], borderRadius: radius('6'), padding: space('lg'), height: rowHeight('row-4'), overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      <div data-part="header" style={{ display: 'flex', flexDirection: 'column', gap: space('xs') }}>
        {category != null ? <Text variant="body.md" color={sub} as="div">{category}</Text> : null}
        {/* heading/md style = 20/110% (37502:7996) — one step below the variable (X1). */}
        <Text as="div" color={ink} style={{ ...H.md, ...clamp(2) }}>{name}</Text>
        {smiles || logos ? (
          <div style={{ display: 'flex', paddingTop: space('sm') }}>
            <CardLogoRow size="md" inverse={onDark} logos={logos} more={moreLogos ?? (logos ? undefined : 4)} />
          </div>
        ) : null}
      </div>
      <div data-part="footer" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: space('xs') }}>
        {discount ? <div style={{ display: 'flex' }}><Badge offer="discount" size="lg">{discount === true ? 'Discount' : discount}</Badge></div> : null}
        {from ? <Text variant="body.md" color={sub} as="div">from</Text> : null}
        <Text variant="title.md" color={ink} as="div">{price}{period}</Text>
      </div>
    </div>
  );
}

/* ---------------- ProductCard / card-features (package · product · category) ----------------
   Figma publishes three sibling sets, each `direction` ltr|rtl, 229x300 (row-4) at
   border-radius/7 = 20 on surface/raised/default. Each holds a tint panel (see tintPanel)
   — the tint colours that panel only, never the card:
     card-features-package  37905:18719  header panel 176 (overline, title, logo-row sm)
                                          + footer (badge-or-color, price)
     card-features-product  37905:18753  media panel 144 (image 112, logo-row sm on top)
                                          + footer (title, badge-or-color, price)
     card-features-category 37905:18788  the panel fills the card: title heading/md,
                                          image 128, Discount badge, price
   Footer: padding spacing/sm top, spacing/md sides+bottom, gap spacing/xs, bottom-aligned.
   Price (`.product-card-price` 32477:102451) is body/xl 20 Regular under a body/md subtle
   label (`.product-card-price-label` 32466:90703: From | Pay only | From {n} PTS). */
export type ProductCardType = 'package' | 'product' | 'category' | 'addon';
/** Figma `.product-card-price-label` type. */
export type ProductPriceLabel = 'from' | 'pay-only' | 'smiles-combined' | 'none';
export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `overline-string` (package only). */
  eyebrow?: ReactNode;
  /** Figma `title-string`. */
  title?: ReactNode;
  /** Media for product / category. */
  image?: ReactNode;
  /** Figma `badge-or-color=badge` — the lg Discount badge label, e.g. "20% off". */
  discount?: ReactNode;
  /** Figma `badge-or-color=color-spot` — swatches (CSS colours) shown in place of the badge. */
  colors?: string[];
  /** Figma `price-string`. */
  price?: ReactNode;
  /** Figma `price-monthly`. `null` hides it. */
  period?: ReactNode;
  /** Figma `.product-card-price type=smiles`: Smiley + amount + "PTS". */
  pts?: boolean;
  /** Figma `.product-card-price-label`. Default `from`. */
  priceLabel?: ProductPriceLabel;
  /** Points for `priceLabel="smiles-combined"` ("From {n} PTS"). */
  labelPts?: ReactNode;
  /** Figma `logo-row` (sm). `true` shows placeholders; package and product only. */
  logos?: ReactNode[] | boolean;
  /** Which card-features sibling this is. `addon` is the V1.1 name of `package`. */
  type?: ProductCardType;
  /** A `.card-bg-color` tint name (Figma 25710:20065) for the panel. A raw CSS colour still works. */
  tint?: CardBgTint | (string & {});
  width?: number | string;
}
const isTintName = (t: string): t is CardBgTint =>
  ['default', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'].includes(t);
const PRICE_LABEL: Record<Exclude<ProductPriceLabel, 'none'>, string> = { from: 'From', 'pay-only': 'Pay only', 'smiles-combined': 'From' };
/** Figma `color-spot` 34393:96870 — 12px circles. Its gap binds the legacy `Spacing/Tiny 4`
 *  (no V1.2 variable), so the 4 is literal. The swatch colours are product data. */
function ColorSpots({ colors }: { colors: string[] }) {
  return (
    <span data-part="color-spot" style={{ display: 'inline-flex', gap: 4 }}>
      {colors.map((c, i) => <span key={i} style={{ width: scale('12'), height: scale('12'), borderRadius: PILL, background: c }} />)}
    </span>
  );
}
export function ProductCard({ eyebrow, title = 'iPhone Clear Case For Safe Use', image, discount, colors, price = 'AED 200', period = '/mo', pts, priceLabel = 'from', labelPts = '30', logos, type, tint, width = 229, style, ...rest }: ProductCardProps) {
  // Back-compat: callers that predate `type` are inferred from whether they pass an image;
  // `addon` is the V1.1 name of `package`.
  const kind: Exclude<ProductCardType, 'addon'> = type === 'addon' ? 'package' : type ?? (image ? 'product' : 'package');
  const panelBg = tint != null ? (isTintName(tint) ? cardBgTint(tint) : tint)
    : cardBgTint(kind === 'category' ? 'orange' : 'default');
  const logoRow = logos ? <CardLogoRow size="sm" logos={Array.isArray(logos) ? logos : undefined} more={Array.isArray(logos) ? undefined : 4} /> : null;
  const badgeOrColor = discount ? <div style={{ display: 'flex' }}><Badge offer="discount" size="lg">{discount}</Badge></div>
    : colors?.length ? <div style={{ display: 'flex' }}><ColorSpots colors={colors} /></div> : null;
  const subtle = color('text.default.subtle');
  const priceBlock = (
    <div data-part="price" style={{ display: 'flex', flexDirection: 'column', gap: space('2xs') }}>
      {priceLabel !== 'none' ? (
        <Text variant="body.md" color={subtle} as="div">
          {PRICE_LABEL[priceLabel]}{priceLabel === 'smiles-combined' ? <> {labelPts} PTS</> : null}
        </Text>
      ) : null}
      <Text variant="body.xl" as="div" style={{ display: 'flex', alignItems: 'center' }}>
        {pts ? <span style={{ display: 'inline-flex', paddingInlineEnd: space('xs') }}><Icon name="smiley" size={20} /></span> : null}
        {pts ? <>{price} PTS</> : price}{period}
      </Text>
    </div>
  );
  return (
    <div data-card-type={kind} style={{ width, flex: '0 0 auto', boxSizing: 'border-box', background: color('surface.raised.default'), borderRadius: radius('7'), height: rowHeight('row-4'), overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {kind === 'package' ? (
        <>
          {/* header 25893:54112 — scale/176, padding spacing/lg, gap spacing/sm */}
          <div data-part="panel" style={{ ...tintPanel(panelBg), height: scale('176'), flex: 'none', padding: space('lg'), display: 'flex', flexDirection: 'column', gap: space('sm') }}>
            {eyebrow ? <Text variant="body.md" color={subtle} as="div" style={clamp(1)}>{eyebrow}</Text> : null}
            {/* heading/sm style = 18/110% (25893:54385), max 4 lines. */}
            <Text as="div" style={{ ...H.sm, ...clamp(4) }}>{title}</Text>
            {logoRow}
          </div>
          <div data-part="footer" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: space('xs'), padding: `${space('sm')} ${space('md')} ${space('md')}` }}>
            {badgeOrColor}{priceBlock}
          </div>
        </>
      ) : kind === 'product' ? (
        <>
          {/* block 26522:14493 — scale/144, padding spacing/lg; image body scale/112 */}
          <div data-part="panel" style={{ ...tintPanel(panelBg), height: scale('144'), flex: 'none', padding: space('lg'), display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {imageWell(image, { height: scale('112') })}
            {logoRow ? <span style={{ position: 'absolute', top: space('lg'), insetInlineStart: space('lg') }}>{logoRow}</span> : null}
          </div>
          <div data-part="footer" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: space('xs'), padding: `${space('sm')} ${space('md')} ${space('md')}` }}>
            {/* heading/sm style (26523:18817), 2 lines, bound to the legacy High-emphasis ink. */}
            <div style={{ flex: '1 1 auto', paddingBottom: space('xs') }}>
              <Text as="div" color={LEGACY_HIGH_EMPHASIS} style={{ ...H.sm, ...clamp(2) }}>{title}</Text>
            </div>
            {badgeOrColor}{priceBlock}
          </div>
        </>
      ) : (
        /* block 26521:1398 fills the card — padding spacing/xl top, spacing/lg sides+bottom */
        <div data-part="panel" style={{ ...tintPanel(panelBg), flex: '1 1 auto', display: 'flex', flexDirection: 'column', padding: `${space('xl')} ${space('lg')} ${space('lg')}` }}>
          {/* heading/md style = 20/110% (26521:1402), one line. */}
          {title != null ? <Text as="div" style={{ ...H.md, ...clamp(1) }}>{title}</Text> : null}
          <div style={{ flex: '1 1 auto', paddingTop: space('lg') }}>{imageWell(image, { height: scale('128') })}</div>
          {/* `badge` 34393:93379 sits absolutely at (16,207): directly above the price. */}
          {discount ? <div style={{ position: 'absolute', top: 207, insetInlineStart: space('lg'), display: 'flex' }}><Badge offer="discount" size="lg">{discount}</Badge></div> : null}
          {priceBlock}
        </div>
      )}
    </div>
  );
}

/* ---------------- DealCard (deals-card) ----------------
   Figma `deals-card/ltr` 25973:22611 — 166x224 (section/body/width/col-12 x row-3) at
   border-radius/6 = 16 on `.default-surface` (surface/base/inverse). No image, no border.
   `.deals-card-core` 38952:13352, padding spacing/md: header (gap spacing/xs) = overline
   body/sm subtle + title heading/xs style (2 lines); logo-row sm (48 tall incl. 12 below);
   `.footer` 25928:216907 (80 tall, bottom-aligned, gap spacing/xs) = Discount md badge +
   struck-through old price (body/sm muted) · price title/md (legacy High-emphasis ink) ·
   feedback pill (24 tall, glass/midnight/sm, thumbs-up + count | thumbs-down). The V1.1
   code was an image card; `image`/`subtitle`/`badge` survive as deprecated aliases. */
export interface DealCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `overline-string`. */
  overline?: ReactNode;
  /** Figma `title-string` — two lines max. */
  title?: ReactNode;
  /** Figma `logo-row` (sm). `true` shows placeholders. */
  logos?: ReactNode[] | boolean;
  /** Figma `price-string`, e.g. "AED 400". */
  price?: ReactNode;
  /** Figma `discounted-string` — the struck-through old price, e.g. "AED 500". */
  wasPrice?: ReactNode;
  /** Figma `discount` — the md Discount badge label, e.g. "20% off". */
  discount?: ReactNode;
  /** Like count in the feedback pill, e.g. "120.8k". Setting it (or a handler) shows the pill. */
  likes?: ReactNode;
  onLike?: () => void;
  onDislike?: () => void;
  width?: number | string;
  /** @deprecated V1.1 image card. Rendered in the logo-row slot; Figma's deals card has no image. */
  image?: ReactNode;
  /** @deprecated Use `overline`. */
  subtitle?: ReactNode;
  /** @deprecated Use `discount` (a label). A node passed here renders in the discount row. */
  badge?: ReactNode;
}
export function DealCard({ overline, title = 'Deal title', logos, price, wasPrice, discount, likes, onLike, onDislike, width = T.section.body.width['col-12'], image, subtitle, badge, style, ...rest }: DealCardProps) {
  const top = overline ?? subtitle;
  const subtle = color('text.default.subtle');
  const showPill = likes != null || !!onLike || !!onDislike;
  const thumb = (name: string, label: string, onClick?: () => void) => (
    <button type="button" aria-label={label} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: iconSize('md'), height: iconSize('md'), padding: space('2xs'), boxSizing: 'border-box', border: 0, background: 'transparent', cursor: onClick ? 'pointer' : 'default', color: subtle }}>
      <Icon name={name} size={12} />
    </button>
  );
  return (
    <div style={{ width, flex: '0 0 auto', boxSizing: 'border-box', height: rowHeight('row-3'), background: color('surface.base.inverse'), borderRadius: radius('6'), overflow: 'hidden', padding: space('md'), display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {/* header fills (02.07.26: "header resizing -> fill so removing icon-row doesn't move
          other elements"); logo-row and footer are fixed 48 / 80. */}
      <div data-part="header" style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: space('xs') }}>
        {top != null ? <Text variant="body.sm" color={subtle} as="div" style={clamp(1)}>{top}</Text> : null}
        {/* heading/xs style = 16/120% (25719:34273), 2 lines. */}
        <Text as="div" style={{ ...H.xs, ...clamp(2) }}>{title}</Text>
      </div>
      {logos || image ? (
        <div data-part="logos" style={{ height: scale('48'), flex: 'none', boxSizing: 'border-box', paddingBottom: space('md'), display: 'flex', alignItems: 'flex-start', overflow: 'hidden' }}>
          {logos ? <CardLogoRow size="sm" logos={Array.isArray(logos) ? logos : undefined} more={Array.isArray(logos) ? undefined : 4} /> : image}
        </div>
      ) : null}
      <div data-part="footer" style={{ height: scale('80'), flex: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: space('xs') }}>
        {discount || badge || wasPrice ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: space('xs') }}>
            {discount ? <Badge offer="discount" size="md">{discount}</Badge> : badge}
            {wasPrice != null ? <Text variant="body.sm" color={color('text.default.muted')} style={{ textDecoration: 'line-through' }}>{wasPrice}</Text> : null}
          </div>
        ) : null}
        {price != null ? <Text variant="title.md" color={LEGACY_HIGH_EMPHASIS} as="div">{price}</Text> : null}
        {showPill ? (
          <div data-part="feedback" style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), height: scale('24'), boxSizing: 'border-box', padding: `${space('xs')} ${space('sm')}`, borderRadius: radius('6'), background: color('surface.glass.midnight.sm') }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('2xs') }}>
              {thumb('thumbs-up', 'Like', onLike)}
              {likes != null ? <Text variant="body.sm" color={subtle}>{likes}</Text> : null}
            </span>
            <span aria-hidden style={{ width: T.border.sm, height: scale('16'), background: color('border.surface-based.canvas.inverse') }} />
            {thumb('thumbs-down', 'Dislike', onDislike)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- NewCard (new-on-eand) ----------------
   Figma `.new-on-eand-state` 26523:22852 (`selected` true|false) over `.new-on-core`
   37840:19332 (BOOL `badge`, `title-string`, `direction`) — a Story column 137x224
   (row-3), gap spacing/md:
     Image frame: border-radius/8 (24), padding spacing/xs, a 2px (border/lg) INSIDE
       gradient stroke when selected. The container (border-radius/7 = 20) is 129 wide in
       BOTH states — the ring does not shrink the image.
     Badge: badges-offers md "New card" at (12,12). It is its own boolean, on in both
       states; `selected` only toggles the ring.
     Caption: body/md centred, padding 0 spacing/md, 2 lines.
   The ring's three stops are all legacy styles with no V1.2 token (design-questions q6):
   Light Green/Base #47cb6c @0 -> Text/Default/Dark/High-emphasis #191329 @56% ->
   Red/100 #e00800 @100%, running from the bottom-left to the top-right corner. */
const NEW_ON_RING = 'linear-gradient(37deg, #47cb6c 0%, #191329 56%, #e00800 100%)';
export interface NewCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode; title?: ReactNode; width?: number | string;
  /** Figma `selected` axis — the gradient ring (the last carousel card, for three days). */
  selected?: boolean;
  /** Figma `badge` — the "New card" badge. Independent of `selected`; on by default. */
  badge?: boolean;
}
export function NewCard({ image, title = 'New on e&', width = 137, selected, badge = true, style, ...rest }: NewCardProps) {
  // T.border.lg already carries its unit ("2px") — appending px would yield "2pxpx".
  const ringMask = 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)';
  return (
    /* `.new-on-core` — a Story column, not a card: the tile itself has no surface, no border
       and no radius. Only the picture frame is rounded. */
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('md'),
      width, flex: '0 0 auto', boxSizing: 'border-box', height: rowHeight('row-3'), ...style,
    }} {...rest}>
      <div data-part="frame" style={{
        position: 'relative', flex: '1 1 auto', minHeight: 0, width: '100%', boxSizing: 'border-box',
        padding: space('xs'), borderRadius: radius('8'),
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: radius('7'), overflow: 'hidden', background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {image ?? <Icon name="image" size={40} />}
        </div>
        {selected ? (
          <span data-part="ring" aria-hidden style={{
            position: 'absolute', inset: 0, borderRadius: radius('8'), padding: T.border.lg, boxSizing: 'border-box',
            backgroundImage: NEW_ON_RING, pointerEvents: 'none',
            WebkitMask: ringMask, WebkitMaskComposite: 'xor', mask: ringMask, maskComposite: 'exclude',
          }} />
        ) : null}
        {badge ? (
          <span style={{ position: 'absolute', top: space('md'), insetInlineStart: space('md'), zIndex: 1 }}>
            <Badge offer="new-card" size="md">New card</Badge>
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${space('md')}`, width: '100%', boxSizing: 'border-box' }}>
        <Text variant="body.md" as="p" style={{ textAlign: 'center', margin: 0, ...clamp(2) }}>{title}</Text>
      </div>
    </div>
  );
}

/* ---------------- ServiceCard ----------------
   Figma `.service-card-core` 37840:18370 (BOOL `badge`, `title-string`, `direction`) in
   `.service-card-sizes` 27216:41370 — grid 109 / carousel 128, both 148 (row-2), at
   border-radius/7 = 20. Padding spacing/sm top+sides, spacing/lg bottom, top-aligned:
     card-icon (fills, pTop spacing/2xl) holding a 48 (icon/4xl) 3D icon, centred;
     title title/xs 14/600, centred, fixed 40 tall (scale/40), two lines.
   Badge: badges-offers md at (8,8). The fill is a raw #ffffff with no variable;
   surface/canvas/default is the same value. */
export type ServiceCardSize = 'grid' | 'carousel';
const SERVICE_CARD_WIDTH: Record<ServiceCardSize, number> = { grid: 109, carousel: 128 };
export interface ServiceCardProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode; label: ReactNode;
  /** A badge node, e.g. `<Badge offer="new-plan" size="md">New plan</Badge>`. */
  badge?: ReactNode;
  /** Figma `size` axis; omit to let the cell fill its grid track. */
  size?: ServiceCardSize;
}
export function ServiceCard({ icon = <Icon name="placeholder" size={48} />, label, badge, size, style, ...rest }: ServiceCardProps) {
  return (
    <button type="button" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', padding: `${space('sm')} ${space('sm')} ${space('lg')}`, width: size ? SERVICE_CARD_WIDTH[size] : undefined, height: rowHeight('row-2'), boxSizing: 'border-box', borderRadius: radius('7'), border: 0, background: color('surface.canvas.default'), cursor: 'pointer', ...style }} {...rest}>
      {badge ? <span style={{ position: 'absolute', top: space('sm'), insetInlineStart: space('sm'), zIndex: 1 }}>{badge}</span> : null}
      <span data-part="icon" style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: space('2xl') }}>
        <span style={{ width: iconSize('4xl'), height: iconSize('4xl'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      </span>
      <Text variant="title.xs" as="span" style={{ height: scale('40'), textAlign: 'center', flex: 'none', ...clamp(2) }}>{label}</Text>
    </button>
  );
}

/* ---------------- Highlight (banner) ----------------
   Figma V1.2 `highlight` 34272:25571 — `placement` single | stacked (two 307-wide banners,
   gap spacing/xs, so the next one peeks) over `.highlight-sizes` 34218:38232:
     size lg 452 (row-6) · md 224 (row-3) · sm 148 (row-2).
   `.highlight-core` 25461:61744: border-radius/8 (24), image fill + a midnight gradient
   from transparent at 46% of the height, Midnight 60% at 70%, Midnight 80% at the bottom.
   `.highlight-content` 28382:14364 (bottom-aligned):
     lg: padding spacing/lg top, spacing/md elsewhere — tag (pBottom spacing/md), title
         heading/lg style (24, 2 lines), subtitle body/md (2 lines), then for type=action a
         spacing/lg gap and the `action-bar-scheme` inverse: ActionBar glass + Button md.
     md/sm: padding spacing/md, no title/subtitle — the tag at the top, the action bar at
         the bottom.
   `.highlight-tag` 32074:7811: logo-row md glass, or a Limited-time badge (lg; md/sm sizes
   step it down to md/sm). Design question q2 is settled by V1.2: there is no tone axis and
   the CTA lives only in the action bar, so `tone`, `background` and the bare `cta` are
   deprecated (they still render). */
export type HighlightSize = 'lg' | 'md' | 'sm';
export type HighlightPlacement = 'single' | 'stacked';
/** `.highlight-tag`: the glass logo row, the Limited-time badge, or nothing. */
export type HighlightTag = 'logos' | 'badge' | 'none';
export interface HighlightAction { title?: ReactNode; subtitle?: ReactNode; cta?: ReactNode; onCta?: () => void; }
export interface HighlightItem {
  /** Figma `text-primary-string` (lg only). */
  title?: ReactNode;
  /** Figma `text-secondary-string` (lg only). */
  subtitle?: ReactNode;
  /** Image URL for the banner fill. */
  image?: string;
  /** Figma type=action — the glass action bar. */
  action?: HighlightAction;
  /** Figma `offer-tags`. Default `logos`. */
  tag?: HighlightTag;
  /** Logos for `tag="logos"`; Smiles placeholders otherwise. */
  logos?: ReactNode[];
  /** Label for `tag="badge"`. Default "Limited time offer". */
  badge?: ReactNode;
}
export interface HighlightProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, HighlightItem {
  /** Figma `.highlight-sizes` size. Default `lg`. */
  size?: HighlightSize;
  /** Figma `placement`. `stacked` lays this banner and `items` out as 307-wide peeking cards. */
  placement?: HighlightPlacement;
  /** Further banners for `placement="stacked"`. */
  items?: HighlightItem[];
  width?: number | string;
  /** @deprecated V1.2 has no bare CTA — use `action`. Still renders when no `action` is set. */
  cta?: ReactNode;
  /** @deprecated V1.2 has one surface: image + midnight gradient (design-questions q2). */
  tone?: 'image' | 'brand' | 'purple';
  /** @deprecated V1.2 has one surface: image + midnight gradient. */
  background?: string;
}
const HL_ROW: Record<HighlightSize, string> = { lg: 'row-6', md: 'row-3', sm: 'row-2' };
// 25461:61744 gradient — stop 0 is #191329 at alpha 0 with no variable; 60/80 are tokens.
const HL_SCRIM = `linear-gradient(180deg, rgba(25, 19, 41, 0) 46%, ${color('midnight.a60')} 70%, ${color('midnight.a80')} 100%)`;
/** Figma `.highlight-placement` stacked: two banners at 307 in a 335 slot (no width token). */
const HL_STACKED_WIDTH = 307;
export function Highlight({ title = 'Primary Text 2-lines max', subtitle, image, cta, action, tag = 'logos', logos, badge, size = 'lg', placement = 'single', items, width, tone = 'image', background, style, ...rest }: HighlightProps) {
  const legacy = tone !== 'image' || background != null;
  const banner = (item: HighlightItem, w: number | string | undefined, extra?: HTMLAttributes<HTMLDivElement>, ownStyle?: CSSProperties) => {
    const bg = background
      ?? (tone === 'brand' ? color('surface.base.brand')
        : tone === 'purple' ? 'linear-gradient(150deg,#7C4DD6,#3A1B6B)'
        // Quoted: an unquoted url() breaks on any "(", ")", space or quote in the URL
        // (data URIs, signed URLs) and the whole declaration is dropped silently.
        : item.image ? `center/cover no-repeat url("${item.image.replace(/"/g, '%22')}")`
        : color('surface.raised.midnight')); // no artwork: a placeholder fill, not a Figma surface
    const lg = size === 'lg';
    const itemTag = item.tag ?? 'logos';
    const tagNode = itemTag === 'none' ? null : itemTag === 'badge'
      ? <Badge offer="limited-time" size={size}>{item.badge ?? 'Limited time offer'}</Badge>
      : <CardLogoRow size="md" glass logos={item.logos} placeholders={3} />;
    const bar = item.action ? (
      <ActionBar surface="glass" title={item.action.title ?? 'Smiles Unlimited'} subtitle={item.action.subtitle ?? 'Exclusive venue deals'}
        action={<Button size="md" onClick={item.action.onCta}>{item.action.cta ?? 'Play now'}</Button>} />
    ) : null;
    return (
      <div data-size={size} {...extra} style={{
        width: w ?? '100%', flex: w ? '0 0 auto' : undefined, boxSizing: 'border-box', position: 'relative',
        ...(legacy ? { minHeight: 200 } : { height: rowHeight(HL_ROW[size]) }),
        borderRadius: radius('8'), overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...ownStyle,
      }}>
        <div data-part="scrim" style={{ position: 'absolute', inset: 0, background: HL_SCRIM }} />
        <div style={{ position: 'relative', flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: lg ? 'flex-end' : 'space-between',
          padding: lg ? `${space('lg')} ${space('md')} ${space('md')}` : space('md') }}>
          {tagNode ? (
            <div data-part="tag" style={{ display: 'flex', paddingBottom: space('md'), ...(size === 'md' ? { paddingTop: space('xs'), paddingInlineStart: space('xs') } : null) }}>{tagNode}</div>
          ) : null}
          {lg ? (
            <div data-part="heading" style={{ paddingBottom: bar || (cta && !item.action) ? space('lg') : 0 }}>
              {item.title != null ? (
                <div style={{ paddingBottom: space('xs') }}>
                  {/* heading/lg style = 24/110% (28382:14309), 2 lines. */}
                  <Text as="div" color={color('text.default.inverse')} style={{ ...H.lg, ...clamp(2) }}>{item.title}</Text>
                </div>
              ) : null}
              {item.subtitle != null ? (
                <div style={{ paddingBottom: space('xs') }}>
                  <Text variant="body.md" as="div" color={color('text.default.inverse')} style={clamp(2)}>{item.subtitle}</Text>
                </div>
              ) : null}
            </div>
          ) : null}
          {bar ?? (cta ? <div><Button size="sm" variant="primary" scheme="inverse">{cta}</Button></div> : null)}
        </div>
      </div>
    );
  };
  const own: HighlightItem = { title, subtitle, image, action, tag, logos, badge };
  if (placement === 'stacked') {
    return (
      <div data-placement="stacked" style={{ display: 'flex', gap: space('xs'), overflowX: 'auto', width: width ?? '100%', boxSizing: 'border-box', ...style }} {...rest}>
        {[own, ...(items ?? [])].map((it, i) => <div key={i} style={{ display: 'contents' }}>{banner(it, HL_STACKED_WIDTH)}</div>)}
      </div>
    );
  }
  return banner(own, width, rest, style);
}

/* ---------------- Recommendation ----------------
   Figma `Recommendation` 36698:108342 — one axis, `carousel` (true: two 338-wide cards,
   gap spacing/xs, the second peeking; false: one card, fill). Each card is 224 tall
   (row-3), border-radius/7 = 20, over `.recommendation-core` 36698:86494 (`inverse`):
     inverse=true   .surface-inverse glass: surface/glass/white/md + glass blur;
                    title text/default/inverse, description inverse-subtle;
                    button primary md scheme=inverse
     inverse=false  .surface-default: surface/base/inverse (#fff);
                    title text/default/default, description subtle;
                    button primary md scheme=midnight
   Content `.recommendation-core` 37905:28731: padding spacing/lg, everything centred —
   a 32 (icon/2xl) logo at border-radius/3, a column (pTop spacing/md, gap spacing/xs) of
   title/md (2 lines) and body/md (fills), then the button (pTop spacing/md), hugging. */
export interface RecommendationItem {
  /** Figma `visual-asset` — a 32px logo. Smiles placeholder by default; `null` hides it. */
  icon?: ReactNode;
  /** Figma `title-string` — two lines max. */
  title?: ReactNode;
  /** Figma `description-string`. */
  description?: ReactNode;
  /** Figma `button` label. `null` hides the button. */
  cta?: ReactNode;
  onCta?: () => void;
}
export interface RecommendationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, RecommendationItem {
  /** Figma `inverse` — glass on a dark backdrop (default) vs white. */
  inverse?: boolean;
  /** Figma `carousel` — this card and `items` as 338-wide peeking cards. */
  carousel?: boolean;
  /** Further cards for `carousel`. */
  items?: RecommendationItem[];
  width?: number | string;
}
/** Figma carousel=true: two cores at 338 in a 353 slot (no width token). */
const REC_CAROUSEL_WIDTH = 338;
/** The Brands placeholder is a square logo clipped at border-radius/3 — the Smiles purple
 *  is the same placeholder literal SmilesPlaceholder uses (design-questions q7). */
const BrandPlaceholder = () => (
  <span style={{ width: '100%', height: '100%', background: '#6C3FD6', color: '#fff', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>smiles</span>
);
export function Recommendation({ icon, title = 'Recommended for you', description = 'Handpicked offers based on how you use etisalat.', cta = 'Explore', onCta, inverse = true, carousel = false, items, width, style, ...rest }: RecommendationProps) {
  const card = (it: RecommendationItem, w: number | string | undefined, extra?: HTMLAttributes<HTMLDivElement>, ownStyle?: CSSProperties) => (
    <div data-inverse={inverse || undefined} {...extra} style={{
      width: w ?? '100%', flex: w != null ? '0 0 auto' : undefined, boxSizing: 'border-box', height: rowHeight('row-3'),
      borderRadius: radius('7'), overflow: 'hidden', padding: space('lg'),
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      background: inverse ? color('surface.glass.white.md') : color('surface.base.inverse'),
      ...(inverse ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : null),
      ...ownStyle,
    }}>
      {it.icon !== null ? (
        <span data-part="icon" style={{ width: iconSize('2xl'), height: iconSize('2xl'), borderRadius: radius('3'), overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          {it.icon ?? <BrandPlaceholder />}
        </span>
      ) : null}
      <div style={{ flex: '1 1 auto', minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: space('xs'), paddingTop: space('md') }}>
        {it.title != null ? <Text variant="title.md" as="div" color={inverse ? color('text.default.inverse') : color('text.default.default')} style={{ textAlign: 'center', ...clamp(2) }}>{it.title}</Text> : null}
        {it.description != null ? <Text variant="body.md" as="div" color={inverse ? color('text.default.inverse-subtle') : color('text.default.subtle')} style={{ textAlign: 'center', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>{it.description}</Text> : null}
      </div>
      {it.cta != null ? (
        <div style={{ paddingTop: space('md'), display: 'flex', justifyContent: 'center', flex: 'none' }}>
          <Button variant="primary" size="md" scheme={inverse ? 'inverse' : 'midnight'} onClick={it.onCta}>{it.cta}</Button>
        </div>
      ) : null}
    </div>
  );
  const own: RecommendationItem = { icon, title, description, cta, onCta };
  if (carousel) {
    return (
      <div data-carousel style={{ display: 'flex', gap: space('xs'), overflowX: 'auto', width: width ?? '100%', height: rowHeight('row-3'), ...style }} {...rest}>
        {[own, ...(items ?? [])].map((it, i) => <div key={i} style={{ display: 'contents' }}>{card(it, REC_CAROUSEL_WIDTH)}</div>)}
      </div>
    );
  }
  return card(own, width, rest, style);
}

/* ---------------- SmilesBalance (smiles-balance-card) ----------------
   Figma `smiles-balance-card` 27131:101113 (`states` points-activated | points-not-active)
   over `.smiles-balance-card-core` 26610:3492 — a white card, 353 wide (fill) x 148
   (row-2), border-radius/6 = 16, surface/base/inverse:
     header (padding spacing/lg, none at the bottom): the points total (bound to the
       typography/heading/lg VARIABLES: 28/120%, tight) over "Points" (heading/lg STYLE,
       24/110%) with a 20 info icon (the tooltip trigger); a tier pill on the right
       (activated only): 40 tall, pill, a 32 medal and the tier name.
     footer (padding spacing/sm top, spacing/lg sides, bottom-aligned, gap spacing/xs): a
       12 pill progress bar (track surface/sunken/inverse, fill text/positive/subtle) and
       "Just {n} points to your {tier}" in body/md, the tier in title/xs with a gradient.
   Several bindings are LEGACY (no V1.2 token) and are kept as the symbol's literal values —
   rule 8, design-questions: Text/Action/Midnight/Default #191329 (points ink),
   BG/Component/Light Gray #f4f3f5 (tier pill), Text/Default/Dark/Low-emphasis #191329@50%
   (tier name, Suisse Book 12/16), Text/Default/Dark/High-emphasis #140f21 (footer line),
   the Gradients/{Silver,Gold,Platinum} paint styles and the remote Badge medal. */
export type SmilesTier = 'silver' | 'gold' | 'platinum';
const LEGACY_ACTION_MIDNIGHT = '#191329';    // Text/Action/Midnight/Default
const LEGACY_LIGHT_GRAY = '#f4f3f5';         // BG/Component/Light Gray
const LEGACY_LOW_EMPHASIS = 'rgba(25, 19, 41, 0.5)'; // Text/Default/Dark/Low-emphasis
/** Local paint styles Gradients/Silver, Gradients (NEW)/Gold, Gradients/Platinum
 *  (`.next-tier` 26663:89987) — radial, centred near the top-left corner. */
const TIER_GRADIENT: Record<SmilesTier, [string, string]> = {
  silver: ['#e8e7ea', '#8c8994'], gold: ['#e2c668', '#b78d3b'], platinum: ['#c2c1e7', '#595779'],
};
const TIER_NAME: Record<SmilesTier, string> = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
/* The Silver medal is the remote `Badge[Property 1=Silver]` (26610:3448): two discs with
   linear gradients and the `Smiles loyality` star mark, path data exported from
   I27131:101087;26610:3448;4567:2331. Gold and Platinum medals are not in this file, so
   they reuse the tier's paint style — flagged in design-questions. */
const SMILES_STAR = 'M10.94 24.45C10.79 24.45 10.65 24.41 10.52 24.32C10.3 24.16 10.2 23.89 10.24 23.62L11.07 18.77C11.12 18.51 11.03 18.24 10.84 18.06L7.32 14.62C7.13 14.43 7.06 14.15 7.14 13.89C7.22 13.64 7.45 13.46 7.71 13.41L12.59 12.7C12.85 12.67 13.07 12.5 13.2 12.27L15.36 7.86C15.49 7.62 15.72 7.47 15.99 7.47C16.26 7.47 16.51 7.62 16.62 7.86L18.8 12.28C18.91 12.51 19.14 12.68 19.41 12.71L24.28 13.42C24.55 13.46 24.76 13.65 24.85 13.91C24.93 14.16 24.86 14.44 24.67 14.64L21.15 18.07C20.96 18.25 20.88 18.52 20.91 18.78L21.74 23.63C21.79 23.9 21.67 24.16 21.46 24.33C21.24 24.48 20.96 24.51 20.72 24.38L20.1 24.06C19.84 23.92 19.74 23.61 19.88 23.35C20.01 23.09 20.33 22.99 20.59 23.13L19.87 18.96C19.77 18.36 19.97 17.75 20.39 17.32L23.43 14.37L19.25 13.76C18.64 13.67 18.13 13.29 17.86 12.75L15.98 8.95L14.11 12.75C13.84 13.3 13.32 13.67 12.71 13.76L8.53 14.37L11.57 17.32C12 17.75 12.21 18.35 12.09 18.96L11.38 23.13L15.12 21.16C15.65 20.88 16.3 20.88 16.83 21.16L18.66 22.13C18.92 22.26 19.02 22.57 18.89 22.83C18.75 23.09 18.44 23.18 18.18 23.06L16.35 22.09C16.12 21.97 15.83 21.97 15.61 22.09L11.25 24.38C11.15 24.44 11.04 24.46 10.93 24.46L10.94 24.45Z M18.86 21.22C18.6 21.22 18.38 21.03 18.34 20.76L18.06 18.69C17.96 17.93 18.21 17.16 18.75 16.61L19.97 15.33C20.17 15.12 20.5 15.12 20.71 15.32C20.93 15.52 20.93 15.85 20.72 16.06L19.5 17.34C19.19 17.67 19.04 18.11 19.11 18.55L19.39 20.62C19.42 20.91 19.22 21.17 18.94 21.2C18.92 21.2 18.89 21.2 18.87 21.2L18.86 21.22Z';
const MEDAL: Record<SmilesTier, { outer: [string, string]; inner: [string, string] }> = {
  silver: { outer: ['#e6e7e8', '#939598'], inner: ['#f1f2f2', '#bcbec0'] },
  gold: { outer: TIER_GRADIENT.gold, inner: TIER_GRADIENT.gold },
  platinum: { outer: TIER_GRADIENT.platinum, inner: TIER_GRADIENT.platinum },
};
function SmilesMedal({ tier }: { tier: SmilesTier }) {
  const m = MEDAL[tier];
  const id = `smiles-medal-${tier}`;
  return (
    <svg aria-hidden width={32} height={32} viewBox="0 0 32 32" style={{ flex: 'none', display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-o`} x1="0.33" y1="0.13" x2="0.7" y2="0.94"><stop offset="0" stopColor={m.outer[0]} /><stop offset="1" stopColor={m.outer[1]} /></linearGradient>
        <linearGradient id={`${id}-i`} x1="0.27" y1="0.12" x2="0.94" y2="1.23"><stop offset="0" stopColor={m.inner[0]} /><stop offset="1" stopColor={m.inner[1]} /></linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={m.outer[0]} /><stop offset="1" stopColor={m.outer[1]} /></linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill={`url(#${id}-o)`} />
      <circle cx="16" cy="16" r="12.74" fill={`url(#${id}-i)`} stroke={`url(#${id}-s)`} strokeWidth="0.59" />
      <path d={SMILES_STAR} fill="#ffffff" />
    </svg>
  );
}
export interface SmilesBalanceProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma `points-total-string`. */
  points?: ReactNode;
  /** The unit line under the total. */
  label?: ReactNode;
  /** Figma `states`: points-activated (default) | points-not-active. */
  active?: boolean;
  /** The member's current tier (pill, activated only). `null` hides the pill. */
  tier?: SmilesTier | null;
  /** The tier the footer line points to. */
  nextTier?: SmilesTier;
  /** Figma `points-left-string`. */
  pointsToNext?: ReactNode;
  /** Progress towards the next tier, 0–100. */
  progress?: number;
  /** Replaces the footer line. */
  message?: ReactNode;
  /** Figma `tooltip` — the info icon beside "Points". */
  tooltip?: boolean;
  onInfo?: () => void;
  /** @deprecated V1.0 gold strip's Redeem button — absent in V1.2. Renders only when set. */
  cta?: ReactNode;
}
export function SmilesBalance({ points = '40,340', label = 'Points', active = true, tier = 'silver', nextTier = 'gold', pointsToNext = '2,500', progress = 5, message, tooltip = true, onInfo, cta, style, ...rest }: SmilesBalanceProps) {
  const pct = Math.max(0, Math.min(100, progress));
  const hlVar = T.typography.heading.lg; // the total binds the variables, not the style
  const [g0, g1] = TIER_GRADIENT[nextTier];
  const tierInk: CSSProperties = {
    // backgroundImage, not the `background` shorthand: re-setting the shorthand on update
    // resets background-clip and the text turns into a solid block.
    ...ty('title.xs'), backgroundImage: `radial-gradient(150% 150% at 6% 10%, ${g0} 0%, ${g1} 100%)`,
    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  };
  const line = message ?? (active
    ? <>Just {pointsToNext} points to your <span data-part="next-tier" style={tierInk}>{TIER_NAME[nextTier]} Tier</span></>
    : <>Get {pointsToNext} points for activating</>);
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', height: rowHeight('row-2'), background: color('surface.base.inverse'), borderRadius: radius('6'), overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      <div data-part="header" style={{ display: 'flex', alignItems: 'flex-start', padding: `${space('lg')} ${space('lg')} 0` }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Text as="div" color={LEGACY_ACTION_MIDNIGHT} style={{ fontSize: hlVar.fontSize, lineHeight: hlVar.lineHeight, letterSpacing: hlVar.letterSpacing, fontWeight: hlVar.fontWeight }}>{points}</Text>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* heading/lg style = 24/110% (26610:3443). */}
            <Text color={LEGACY_ACTION_MIDNIGHT} style={H.lg}>{label}</Text>
            {tooltip ? (
              <span style={{ display: 'inline-flex', paddingTop: space('2xs'), paddingInlineStart: space('xs') }}>
                <button type="button" aria-label="About Smiles points" onClick={onInfo} style={{ display: 'inline-flex', width: iconSize('lg'), height: iconSize('lg'), padding: space('2xs'), boxSizing: 'border-box', border: 0, background: 'transparent', cursor: onInfo ? 'pointer' : 'default', color: color('text.default.default') }}>
                  <Icon name="info" size={16} />
                </button>
              </span>
            ) : null}
          </div>
        </div>
        {active && tier ? (
          <span data-part="tier" style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs'), height: scale('40'), boxSizing: 'border-box', paddingBlock: space('xs'), paddingInlineStart: space('xs'), paddingInlineEnd: space('sm'), borderRadius: PILL, background: LEGACY_LIGHT_GRAY, flex: 'none' }}>
            <SmilesMedal tier={tier} />
            {/* Suisse Int'l Book 12/16 — no V1.2 text style. */}
            <span style={{ ...ty('body.sm'), fontWeight: 450, lineHeight: '16px', color: LEGACY_LOW_EMPHASIS }}>{TIER_NAME[tier]}</span>
          </span>
        ) : null}
        {cta ? <span style={{ flex: 'none', marginInlineStart: space('sm') }}><Button size="sm" variant="secondary">{cta}</Button></span> : null}
      </div>
      <div data-part="footer" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: space('xs'), padding: `${space('sm')} ${space('lg')} 0` }}>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: scale('12'), borderRadius: PILL, overflow: 'hidden', background: color('surface.sunken.inverse') }}>
          <div data-part="bar" style={{ width: `${pct}%`, height: '100%', borderRadius: PILL, background: color('text.positive.subtle') }} />
        </div>
        <div style={{ paddingBlock: space('xs'), paddingInlineEnd: space('sm') }}>
          <Text variant="body.md" as="div" color={LEGACY_HIGH_EMPHASIS} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line}</Text>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Voucher ----------------
   Figma `Voucher` 28278:13817 — a fixed 144x144 ticket tile, `display` (light|dark) x
   `state` (default|applied); re-read against V1.2 (G5): every value below still matches,
   and the page's flow sign 28278:13777 reads WIP. The V1.0 code was a full-width coupon row
   that faked the perforation with a dashed border; the real shape is one exported path
   whose dash subpaths punch holes (see voucher-shape.ts).

   `status` is the V1.0 model and has no clean mapping: Figma has only default and applied.
   active -> default and redeemed -> applied are unambiguous; `expired` has no counterpart,
   so it renders applied-but-dimmed and is flagged for design
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
      borderRadius: radius('6'), overflow: 'hidden', opacity: status === 'expired' ? 0.6 : 1, ...style,
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
          <Icon name={applied ? 'check' : 'add-content-filled'} size={24} />
        </button>
      </div>
    </div>
  );
}
