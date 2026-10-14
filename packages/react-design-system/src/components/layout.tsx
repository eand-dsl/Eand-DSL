import { type CSSProperties, type HTMLAttributes, type ReactNode, useId, useState } from 'react';
import { T, space, color, ty, radius, scale } from '../system';
import { Icon } from '../icons';
import { Text, IconBox, SectionLinkButton } from './primitives';
import { Button } from './Button/Button';
import { Chip } from './controls';

/* ---------------- Section: the full-width body container ----------------
   Figma V1.2 `section` 36698:87167 (page 25519:12055): a 24px-radius container with an
   optional `.section-header` 29389:3807 (title · filter pill · trigger, then context)
   and a `.section-body` 26423:41850 slot sized by rows so a given card type fits.
   The surface is a swap of `.section-surface-default` 26423:39325 (default · raised ·
   ai-powered) or `.section-surface-inverse` 26423:39319 (brand · midnight-base ·
   midnight-raised · glass-midnight · glass-white). Trigger = `.section-trigger`
   27110:68969: link (section-link 40) | button (tertiary lg). Optional `gradient`
   32553:58207 type=sunset glow over the body. */
export type SectionSurface =
  | 'default' | 'raised' | 'ai-powered'
  | 'brand' | 'midnight-base' | 'midnight-raised' | 'glass-midnight' | 'glass-white'
  /** Alias of `brand` (V1.1 name). */
  | 'inverse'
  /** Alias of `midnight-base` (V1.1 name). */
  | 'midnight'
  /** Code-only: no V1.2 section surface has it (see design-questions). */
  | 'brand-muted';
export type SectionSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionTrigger = 'chevron' | 'button' | 'none';
// Figma `section/body/height/row-N` — the slot height each size reserves so the
// matching card fits: xs≈list row, sm≈quick-action, md≈deal card (224), lg≈plan
// card (300), xl≈highlight banner (452).
const SECTION_SIZE: Record<SectionSize, number> = { xs: 72, sm: 148, md: 224, lg: 300, xl: 452 };
// `surface-color=ai-powered` 26437:43343 is an UNBOUND linear gradient #ffe4e3 -> #f5f5f7
// (no token). Literal from the symbol's gradientTransform (axis ~128deg, stops projected
// onto the CSS gradient line); logged in design-questions — do not near-match a token.
const AI_POWERED = 'linear-gradient(128deg, #ffe4e3 -50%, #f5f5f7 75%)';
const SECTION_SURFACE: Record<SectionSurface, { bg: string; onDark: boolean }> = {
  default:           { bg: color('surface.base.default'), onDark: false },      // #f0f0f5
  raised:            { bg: color('surface.raised.default'), onDark: false },    // #fff
  'ai-powered':      { bg: AI_POWERED, onDark: false },
  brand:             { bg: color('surface.base.brand'), onDark: true },         // #e00800
  inverse:           { bg: color('surface.base.brand'), onDark: true },         // alias of brand
  'midnight-base':   { bg: color('surface.base.midnight'), onDark: true },      // #191329
  midnight:          { bg: color('surface.base.midnight'), onDark: true },      // alias of midnight-base
  'midnight-raised': { bg: color('surface.raised.midnight'), onDark: true },    // #312c40
  // The glass surface symbols carry no effect (no background blur) — as published.
  'glass-midnight':  { bg: color('surface.glass.midnight.md'), onDark: true },  // midnight 20%
  'glass-white':     { bg: color('surface.glass.white.lg'), onDark: true },     // white 20%
  'brand-muted':     { bg: color('surface.canvas.brand-muted'), onDark: false },
};

/* `gradient` 32553:58207, type=sunset: two layer-blurred ellipses (orange, brand red) at
   27% (md) / 25% (sm), the instance at 96% opacity, scaled to the body (constraints
   SCALE). All values are unbound in Figma, so they are literals here (design question).
   Positions are percentages of the variant frame (md 375x320, sm 375x188). Figma's
   layer-blur radius is twice the CSS blur() standard deviation. The body uses md for
   md/lg/xl and sm for xs/sm. A third peach ellipse in each variant is hidden. */
type GlowVariant = 'md' | 'sm';
const SUNSET: Record<GlowVariant, { color: string; left: string; top: string; width: string; height: string; blur: number }[]> = {
  md: [
    { color: 'rgba(250, 112, 12, 0.27)', left: '-15.2%', top: '46.25%', width: '68.53%', height: '65.63%', blur: 140 },
    { color: 'rgba(224, 8, 0, 0.27)', left: '45.33%', top: '52.81%', width: '80.53%', height: '59.06%', blur: 110 },
  ],
  sm: [
    { color: 'rgba(250, 112, 12, 0.25)', left: '-3.73%', top: '8.51%', width: '53.33%', height: '109.57%', blur: 72 },
    { color: 'rgba(224, 8, 0, 0.25)', left: '42.67%', top: '16.49%', width: '63.73%', height: '87.23%', blur: 72 },
  ],
};
function SunsetGlow({ variant }: { variant: GlowVariant }) {
  return (
    <div aria-hidden data-section-gradient={variant} style={{ position: 'absolute', inset: 0, opacity: 0.96, pointerEvents: 'none' }}>
      {SUNSET[variant].map((e, i) => (
        <div key={i} style={{
          position: 'absolute', left: e.left, top: e.top, width: e.width, height: e.height,
          borderRadius: '50%', background: e.color, filter: `blur(${e.blur / 2}px)`,
        }} />
      ))}
    </div>
  );
}

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Subtext under the title (`body.md`, subtle). */
  context?: ReactNode;
  /** Clamp the title to one or two lines (Figma `lines`). */
  titleLine?: 1 | 2;
  /** Optional filter pill, inline after the title (Figma `filter-pill`). Pass `inverse` on dark surfaces. */
  filterPill?: ReactNode;
  surface?: SectionSurface;
  /** Hide the whole header (Figma `show-header`). */
  showHeader?: boolean;
  /** Header trigger: the section-link chevron, a tertiary lg button, or none (Figma `.section-trigger` link | button). */
  trigger?: SectionTrigger;
  /** Label for the button trigger. */
  triggerLabel?: ReactNode;
  onTrigger?: () => void;
  /** Body slot size — reserves the row height for the card type it holds. */
  size?: SectionSize;
  /** Sunset glow over the body (Figma `.section-body` `gradient`). Only on the most important section. */
  gradient?: boolean;
  /** Body scrolls horizontally and bleeds to the edges (carousels). */
  carousel?: boolean;
  /** @deprecated Use `trigger="none"`. */
  hideChevron?: boolean;
  /** @deprecated Use `onTrigger`. */
  onSeeAll?: () => void;
}

export function Section({
  title = 'Section', context, titleLine = 1, filterPill, surface = 'default', showHeader = true,
  trigger, triggerLabel = 'See all', onTrigger, size, gradient, carousel,
  hideChevron, onSeeAll, style, children, ...rest
}: SectionProps) {
  const s = SECTION_SURFACE[surface];
  const onDark = s.onDark;
  const text = onDark ? color('text.default.inverse') : color('text.default.default');
  const sub = onDark ? color('text.default.inverse-subtle') : color('text.default.subtle');
  // back-compat: hideChevron → no trigger; onSeeAll → onTrigger
  const trig: SectionTrigger = trigger ?? (hideChevron ? 'none' : 'chevron');
  const fire = onTrigger ?? onSeeAll;
  const twoLines = titleLine === 2;
  // `.section-header` applies the heading/lg TEXT STYLE: 24px (font/size/7) / 110% /
  // font/letter-spacing/snug. The typography/heading/lg variables say 28px / 1.2 / tight
  // and `ty('heading.lg')` may still read them, so the symbol's values are set explicitly.
  // Figma conflict logged in design-questions (heading/lg style vs variables).
  const titleStyle: CSSProperties = {
    fontSize: T.font.size['7'], lineHeight: '1.1', letterSpacing: T.font.letterSpacing.snug,
    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: titleLine,
    overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
    // lines=1: the title hugs, so the filter pill follows it; lines=2: the title fills.
    flex: twoLines ? '1 1 auto' : '0 1 auto',
  } as CSSProperties;
  const slotHeight = size ? SECTION_SIZE[size] : undefined;

  return (
    <section style={{ width: '100%', boxSizing: 'border-box', background: s.bg, borderRadius: radius('8'), overflow: 'hidden', ...style }} {...rest}>
      {showHeader && (
        <header style={{ display: 'flex', flexDirection: 'column', padding: `${space('lg')} ${space('lg')} 0` }}>
          {/* field-row: 40px (scale/40), select + trigger wrapper, 4px apart */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: space('xs'), minHeight: scale('40'),
            alignItems: twoLines ? 'flex-start' : 'center',
          }}>
            {/* select: title, then the filter pill inline after it (spacing/sm) */}
            <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', gap: space('sm'), alignItems: twoLines ? 'flex-start' : 'center' }}>
              <Text variant="heading.lg" color={text} style={titleStyle}>{title}</Text>
              {filterPill}
            </div>
            {trig !== 'none' ? (
              <div style={{ flex: 'none', display: 'flex', alignItems: 'center', paddingInlineStart: space('md') }}>
                {trig === 'chevron' ? (
                  // Figma's published `section-link` button — shared with the export rather
                  // than kept as a private copy here.
                  <SectionLinkButton surface={onDark ? 'inverse' : 'default'} onClick={fire} />
                ) : (
                  // `.section-trigger type=button` = button type=tertiary size=lg scheme=default.
                  <Button variant="tertiary" size="lg" surface={onDark ? 'white' : 'brand'} onClick={fire}>{triggerLabel}</Button>
                )}
              </div>
            ) : null}
          </div>
          {context != null ? <Text variant="body.md" color={sub} style={{ paddingTop: space('xs') }}>{context}</Text> : null}
        </header>
      )}
      {/* body slot: 16px padding, `size` reserves the row height; the glow sits behind
          the slot and the body clips it (.section-body clipsContent). */}
      <div style={{ position: 'relative', padding: space('lg'), overflow: gradient ? 'hidden' : undefined }}>
        {gradient ? <SunsetGlow variant={size === 'xs' || size === 'sm' ? 'sm' : 'md'} /> : null}
        <div style={{
          position: 'relative', minHeight: slotHeight,
          ...(carousel
            ? { display: 'flex', gap: space('md'), overflowX: 'auto', scrollbarWidth: 'none' as const, margin: `0 -${space('lg')}`, padding: `0 ${space('lg')}` }
            : { display: 'flex', flexDirection: 'column', gap: 4 }),
        }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Card (content card) ----------------
   A media-over-text content card: optional full-width media, then a padded title.sm
   title, body.md text, children and an action. It has no V1.2 symbol of its own — Figma's
   `General-card` 28463:12391 is a different, fixed-height tile, built as `GeneralCard`
   below. Kept as it is for existing screens.
   Its `surface` naming predates V1.2: here `default` is white and `inverse` is
   surface/raised/midnight #312c40, while the published `.card-general` 26825:101736
   fills `surface=default` DARK and `inverse` white (logged in design-questions). */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  media?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  /** fixed width for use inside a carousel */
  width?: number | string;
  /** `default` = white, `inverse` = midnight-raised (NOT the GeneralCard / Figma naming). */
  surface?: CardSurface;
}
export type CardSurface = 'default' | 'inverse';
export function Card({ media, title, body, action, width, surface = 'default', style, children, ...rest }: CardProps) {
  const onDark = surface === 'inverse';
  return (
    <div style={{
      boxSizing: 'border-box', width: width ?? '100%', flex: width ? '0 0 auto' : undefined,
      background: onDark ? color('surface.raised.midnight') : color('surface.raised.default'),
      color: onDark ? color('text.default.inverse') : undefined,
      // 20px = border-radius/7, the V1.2 card radius (V1.1 called it /6).
      borderRadius: radius('7'), overflow: 'hidden',
      display: 'flex', flexDirection: 'column', ...style,
    }} {...rest}>
      {media ? <div style={{ width: '100%' }}>{media}</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), padding: space('lg') }}>
        {title ? <Text variant="title.sm" color={onDark ? color('text.default.inverse') : undefined}>{title}</Text> : null}
        {body ? <Text variant="body.md" color={onDark ? color('text.default.inverse-subtle') : color('text.default.subtle')}>{body}</Text> : null}
        {children}
        {action ? <div style={{ marginTop: space('sm') }}>{action}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- GeneralCard ----------------
   Figma V1.2 `General-card` 28463:12391 (page 26760:100129) and its cell `.card-general`
   26825:101736 + `.card-general-core` 28379:3531 (`-rtl` 38532:24255): a fixed 224px
   (rem/14) tile at border-radius/7 with a centred title/sm title (max 2 lines), an
   absolutely positioned image and an optional badge in `.badge-placement` 37806:11255
   (12px padding). Widths: carousel 147 (unbound), grid fills its slot (166 in a
   two-up row, section/body/width/col-12).
   Surface, as published: `default` = `.inverse-surface` midnight-raised #312c40 with
   text/default/inverse; `inverse` = `.default-surface` surface/base/inverse #fff with
   text/default/default. That is the reverse of `Card`'s naming — logged, not flipped.
   `topAlignment` follows the symbol: true puts the title at the bottom (24px below)
   and the badge at the top; the image anchors to the edge opposite the title. (The
   description text says the reverse — logged.) Image per `size`: sm 64 (y 104, or 56
   with topAlignment), md 128 (flush to the far edge), lg 224 full-bleed, centred. */
export type GeneralCardSurface = 'default' | 'inverse';
export type GeneralCardSize = 'sm' | 'md' | 'lg';
export type GeneralCardBadgePlacement = 'start' | 'center' | 'end';
const GENERAL_IMAGE: Record<GeneralCardSize, string> = { sm: scale('64'), md: scale('128'), lg: T.rem['14'] };
const BADGE_JUSTIFY: Record<GeneralCardBadgePlacement, CSSProperties['justifyContent']> = {
  start: 'flex-start', center: 'center', end: 'flex-end',
};
export interface GeneralCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  /** Image URL, or your own node (it is sized to the media box). */
  image?: string | ReactNode;
  imageAlt?: string;
  /** Media size (Figma `size`): sm 64 · md 128 · lg 224 full-bleed. */
  size?: GeneralCardSize;
  /** Figma `top-alignment`: true = image and badge at the top, title at the bottom. */
  topAlignment?: boolean;
  /** Figma `surface`: `default` is the DARK card, `inverse` the white one (as published). */
  surface?: GeneralCardSurface;
  /** Carousel cell (147 wide) instead of a grid cell that fills its slot. */
  carousel?: boolean;
  /** A `Badge` (offer or status), placed 12px in from the corner. */
  badge?: ReactNode;
  /** Badge alignment (Figma `.badge-placement` Left | Center | Right, mirrored in RTL). */
  badgePlacement?: GeneralCardBadgePlacement;
}
export function GeneralCard({
  title, image, imageAlt = '', size = 'sm', topAlignment = false, surface = 'default', carousel = false,
  badge, badgePlacement = 'start', style, ...rest
}: GeneralCardProps) {
  const dark = surface === 'default';
  const px = GENERAL_IMAGE[size];
  // Figma positions the image with constraints, not tokens: sm at y=104 (y=56 with
  // top-alignment), md flush to the edge opposite the title, lg filling the card.
  const imageAlign = size === 'lg' ? 'center' : size === 'md' && !topAlignment ? 'flex-end' : 'flex-start';
  const imageOffset = size === 'sm' ? (topAlignment ? '56px' : '104px') : '0px';
  return (
    <div style={{
      position: 'relative', boxSizing: 'border-box', overflow: 'hidden',
      width: carousel ? '147px' : '100%', flex: carousel ? '0 0 auto' : undefined, height: T.rem['14'],
      borderRadius: radius('7'),
      background: dark ? color('surface.raised.midnight') : color('surface.base.inverse'),
      display: 'flex', flexDirection: 'column', justifyContent: topAlignment ? 'flex-end' : 'flex-start',
      ...style,
    }} {...rest}>
      {image != null ? (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center',
          alignItems: imageAlign, paddingTop: imageOffset, boxSizing: 'border-box', pointerEvents: 'none',
        }}>
          <div style={{ width: px, height: px, flex: 'none', display: 'flex', overflow: 'hidden' }}>
            {typeof image === 'string'
              ? <img src={image} alt={imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : image}
          </div>
        </div>
      ) : null}
      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'center',
        padding: topAlignment ? `0 ${space('md')} ${space('2xl')}` : `${space('2xl')} ${space('md')} 0`,
      }}>
        <Text variant="title.sm" color={dark ? color('text.default.inverse') : color('text.default.default')} style={{
          flex: '1 1 auto', minWidth: 0, textAlign: 'center', overflowWrap: 'break-word',
          display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
        } as CSSProperties}>{title}</Text>
      </div>
      {badge != null ? (
        <div style={{
          position: 'absolute', insetInline: 0, ...(topAlignment ? { top: 0 } : { bottom: 0 }),
          display: 'flex', gap: space('xs'), padding: space('md'), justifyContent: BADGE_JUSTIFY[badgePlacement],
        }}>{badge}</div>
      ) : null}
    </div>
  );
}

/* ---------------- FAQ ----------------
   Figma V1.2 `faq` 38563:27574 (page 38563:27249): a page-end block of questions and
   answers, mainly on level-2 and level-3 pages; at least 3 items (never for 1–2).
   - Optional category row (`body`, padding spacing/lg): outline `Chip`s, 40px, 8px apart,
     scrolling horizontally. Selecting a chip filters to that category; items without a
     category show under every chip.
   - Then a 0/16-padded stack (gap spacing/xs) of accordion cards: surface/base/inverse,
     20px radius. Header padding spacing/lg, gap spacing/md; the question is title/xs
     text/default/default in a 40px (scale/40) block, max 2 lines, while collapsed (72px
     card); a 24px icon box holds a 20px chevron-down / chevron-up. Answer: body/md
     text/default/subtle, container padding 0/4/4/4, text padding 0/12/16/12.
   - One item open at a time (the Accordion description).
   Built from the remote Accordion (33219:2167) the FAQ instances; the local Accordion
   page is [Not Finalized], so `Accordion` below is unchanged. The faq frame has no fill
   and no header: place it in a `Section` (or on the page canvas) for a title. */
export interface FAQEntry {
  question: ReactNode;
  answer: ReactNode;
  /** One of `categories`. Omit to show the item under every category. */
  category?: string;
}
export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items: FAQEntry[];
  /** Category chip labels. Omit for no chip row. */
  categories?: string[];
  /** Selected category index (controlled). */
  value?: number;
  defaultValue?: number;
  onCategoryChange?: (index: number) => void;
  /** Index into `items` of the item open at first. Default: none. */
  defaultOpen?: number;
}
export function FAQ({
  items, categories, value, defaultValue = 0, onCategoryChange, defaultOpen, style, ...rest
}: FAQProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);
  const uid = useId();
  const hasCats = !!categories && categories.length > 0;
  const selected = value ?? internal;
  const active = hasCats ? categories![selected] : undefined;
  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !hasCats || item.category == null || item.category === active);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box', ...style }} {...rest}>
      {hasCats ? (
        <div style={{ padding: space('lg') }}>
          <div style={{ display: 'flex', gap: space('sm'), overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories!.map((label, i) => (
              <Chip key={label} type="outline" selected={i === selected}
                onClick={() => { setInternal(i); onCategoryChange?.(i); }}
                style={{ flexShrink: 0, minWidth: scale('72'), justifyContent: 'center', boxSizing: 'border-box' }}>
                {label}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), padding: `0 ${space('lg')}` }}>
        {visible.map(({ item, index }) => {
          const isOpen = open === index;
          const panel = `${uid}-faq-${index}`;
          return (
            <div key={index} style={{
              background: color('surface.base.inverse'), borderRadius: radius('7'), overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              <button type="button" aria-expanded={isOpen} aria-controls={isOpen ? panel : undefined}
                onClick={() => setOpen(isOpen ? null : index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: space('md'), padding: space('lg'),
                  width: '100%', boxSizing: 'border-box', border: 0, background: 'transparent',
                  cursor: 'pointer', textAlign: 'start', font: 'inherit',
                }}>
                <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', height: isOpen ? undefined : scale('40') }}>
                  <Text variant="title.xs" color={color('text.default.default')} style={isOpen ? undefined : {
                    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
                  } as CSSProperties}>{item.question}</Text>
                </span>
                <IconBox size="xl" aria-hidden>
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={color('text.default.default')} />
                </IconBox>
              </button>
              {isOpen ? (
                <div id={panel} role="region" style={{ padding: `0 ${space('xs')} ${space('xs')}` }}>
                  <Text as="p" variant="body.md" color={color('text.default.subtle')}
                    style={{ padding: `0 ${space('md')} ${space('lg')}` }}>{item.answer}</Text>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Accordion ----------------
   Figma's Accordion page (27465:29326) is [Not Finalized]: neither its dead V1.0
   `Accordion header` nor the "latest exploration" card (32753:390) is a final spec, so
   this flat row is unchanged. The FAQ above uses the card style the exploration shows. */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  defaultOpen?: boolean;
}
export function Accordion({ title, defaultOpen = false, style, children, ...rest }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ width: '100%', borderBottom: `1px solid ${color('border.surface-based.raised.default')}`, ...style }} {...rest}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), padding: `${space('md')} 0`, background: 'transparent', border: 0, cursor: 'pointer' }}>
        <Text variant="title.sm">{title}</Text>
        <IconBox size="sm" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><Icon name="chevron-down-sm" size={16} /></IconBox>
      </button>
      {open ? <div style={{ paddingBottom: space('md') }}>{children}</div> : null}
    </div>
  );
}

/* ---------------- StatusIcon ----------------
   Figma V1.2 status-icon (page 37140:111844, set 40283:145559): a 56px tile at
   border-radius/7 holding a 40px icon box (4px padding, so a 32px glyph). Surface and
   glyph bind status-icon/{surface,icon}/<type>. The glyph is a filled icon-set mark;
   brand and neutral carry Figma's wallet placeholder, so `icon` swaps it. */
export type StatusIconType = 'positive' | 'danger' | 'warning' | 'brand' | 'neutral';
const STATUS_GLYPH: Record<StatusIconType, string> = {
  positive: 'check-circle-filled',
  danger: 'dismiss-filled',
  warning: 'warning-filled',
  brand: 'wallet-filled',
  neutral: 'wallet-filled',
};
export interface StatusIconProps extends HTMLAttributes<HTMLDivElement> {
  type?: StatusIconType;
  /** An icon-set name to replace the default glyph for this type. */
  icon?: string;
}
export function StatusIcon({ type = 'positive', icon, style, ...rest }: StatusIconProps) {
  return (
    <div style={{
      width: T.scale['56'], height: T.scale['56'], flexShrink: 0, borderRadius: radius('7'),
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      background: color(`status-icon.surface.${type}`), ...style,
    }} {...rest}>
      <div style={{ width: 40, height: 40, padding: space('xs'), boxSizing: 'border-box', display: 'flex' }}>
        <Icon name={icon ?? STATUS_GLYPH[type]} size={32} color={color(`status-icon.icon.${type}`)} />
      </div>
    </div>
  );
}

/* ---------------- PageTitle ----------------
   Figma V1.2 page-title (page 37140:111844, set 40283:145186): concludes an activity —
   a status icon (lg and md only), a bold title of at most two lines, and an optional
   body/md description. Not for introducing a page: that is PageHeader.
   The title size is bound per variant to font/size/7·6·5 and heading/xs, a step below
   the heading/<size> styles of the same name. Line height 110% is held on the symbol
   (Figma cannot bind line height), except xs at 120%. */
export type PageTitleType = 'lg' | 'md' | 'sm' | 'xs';
const PAGE_TITLE: Record<PageTitleType, { size: string; lineHeight: string; tracking: string; icon: boolean }> = {
  lg: { size: T.font.size['7'], lineHeight: '1.1', tracking: T.font.letterSpacing.snug, icon: true },
  md: { size: T.font.size['6'], lineHeight: '1.1', tracking: T.typography.heading.md.letterSpacing, icon: true },
  sm: { size: T.font.size['5'], lineHeight: '1.1', tracking: T.typography.heading.sm.letterSpacing, icon: false },
  xs: { size: T.typography.heading.xs.fontSize, lineHeight: T.font.lineHeight['120'], tracking: T.typography.heading.xs.letterSpacing, icon: false },
};
export interface PageTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  type?: PageTitleType;
  alignment?: 'center' | 'left';
  /** Outcome the status icon reflects (lg and md only). */
  status?: StatusIconType;
  /** Replaces the status icon's default glyph. */
  statusIcon?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Heading level for the title. */
  as?: 'h1' | 'h2' | 'h3';
}
export function PageTitle({
  type = 'lg', alignment = 'center', status = 'positive', statusIcon, title, description,
  as: Heading = 'h2', style, ...rest
}: PageTitleProps) {
  const t = PAGE_TITLE[type];
  const center = alignment === 'center';
  const textAlign = center ? 'center' : 'start';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: space('md'), paddingBottom: space('xl'),
      alignItems: center ? 'center' : 'flex-start', width: '100%', ...style,
    }} {...rest}>
      {t.icon ? <StatusIcon type={status} icon={statusIcon} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%' }}>
        <Heading style={{
          margin: 0, ...ty('heading.lg'), fontSize: t.size, lineHeight: t.lineHeight, letterSpacing: t.tracking,
          color: color('text.default.default'), textAlign, overflowWrap: 'break-word',
          display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
        }}>{title}</Heading>
        {description ? (
          <p style={{ margin: 0, ...ty('body.md'), color: color('text.default.default'), textAlign }}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- PageHeader ----------------
   Figma V1.2 page-header (page 37140:111844, set 37390:28734): opens a page — a 56px
   icon slot, a heading/lg title of up to two lines (each a muted word + a strong word),
   a body/md subtitle and a row of 48px tab pills. One per screen, directly below the
   top bar. Not for outcomes: that is PageTitle.
   Two things are as the published symbol has them, not as its description says, and
   are logged in tools/audit/v1.1/design-questions.md: the default surface is 20px
   (border-radius/7) while the inverse one is 24px (/8); and the selected pill on the
   default card is white (tab/inverse/surface/selected), not the light-red tint. */
// `.title-block` 37291:112320 binds the typography/heading/lg VARIABLES (28px / 120% /
// tight), unlike Section, which applies the heading/lg text style (24px / 110%). Read
// the variables directly so this stays 28/1.2 whatever `ty('heading.lg')` resolves to.
const PAGE_HEADER_TITLE: CSSProperties = {
  fontFamily: ty('heading.lg').fontFamily,
  fontSize: T.typography.heading.lg.fontSize,
  fontWeight: T.typography.heading.lg.fontWeight,
  lineHeight: T.typography.heading.lg.lineHeight,
  letterSpacing: T.typography.heading.lg.letterSpacing,
};
export interface PageHeaderLine {
  muted?: ReactNode;
  strong?: ReactNode;
}
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Up to two lines; each pairs a muted word with a strong word. */
  title: PageHeaderLine[];
  subtitle?: ReactNode;
  /** 56px icon slot — typically a 3D illustration. Do not resize. */
  icon?: ReactNode;
  tabs?: string[];
  value?: number;
  defaultValue?: number;
  onTabChange?: (index: number) => void;
  /** For dark or glass backgrounds (Figma `State=Inverse`). */
  inverse?: boolean;
  as?: 'h1' | 'h2';
}
export function PageHeader({
  title, subtitle, icon, tabs, value, defaultValue = 0, onTabChange, inverse = false,
  as: Heading = 'h1', style, ...rest
}: PageHeaderProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const muted = color(inverse ? 'text.default.inverse-muted' : 'text.default.subtle');
  const strong = color(inverse ? 'text.default.inverse' : 'text.default.default');
  return (
    <header style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('md'),
      padding: `${space('2xl')} ${space('lg')}`, boxSizing: 'border-box', width: '100%', overflow: 'hidden',
      borderRadius: inverse ? radius('8') : radius('7'),
      background: color(inverse ? 'surface.glass.white.lg' : 'surface.base.inverse'),
      ...(inverse ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : null),
      ...style,
    }} {...rest}>
      {icon ? (
        <div style={{ width: T.scale['56'], height: T.scale['56'], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%' }}>
        <Heading style={{ margin: 0, ...PAGE_HEADER_TITLE, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {title.slice(0, 2).map((line, i) => (
            <span key={i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 5 }}>
              {i > 0 ? ' ' : null}
              {line.muted ? <span style={{ color: muted }}>{line.muted}</span> : null}
              {line.muted && line.strong ? ' ' : null}
              {line.strong ? <span style={{ color: strong }}>{line.strong}</span> : null}
            </span>
          ))}
        </Heading>
        {subtitle ? (
          <p style={{
            margin: 0, padding: `0 ${space('2xl')}`, ...ty('body.md'), textAlign: 'center',
            color: color(inverse ? 'text.default.inverse-subtle' : 'text.default.subtle'),
          }}>{subtitle}</p>
        ) : null}
      </div>
      {tabs && tabs.length ? (
        <div role="tablist" style={{ display: 'flex', gap: space('xs'), width: '100%', overflowX: 'auto' }}>
          {tabs.map((label, i) => {
            const on = i === selected;
            // Selected pills bind tab/inverse/*/selected in both states; the rest follow
            // the header's scheme. Labels are title/xs, single line.
            const bg = on ? color('tab.inverse.surface.selected') : color(inverse ? 'tab.inverse.surface.default' : 'tab.default.surface.default');
            const fg = on ? color('tab.inverse.text.selected') : color(inverse ? 'tab.inverse.text.default' : 'tab.default.text.default');
            return (
              <button key={i} type="button" role="tab" aria-selected={on}
                onClick={() => { setInternal(i); onTabChange?.(i); }}
                style={{
                  height: 48, minWidth: 72, padding: `0 ${space('lg')}`, flexShrink: 0, boxSizing: 'border-box',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: radius('9'), border: 0, cursor: 'pointer', whiteSpace: 'nowrap',
                  ...ty('title.xs'), background: bg, color: fg,
                }}>
                <span style={{ padding: `0 ${space('2xs')}` }}>{label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
