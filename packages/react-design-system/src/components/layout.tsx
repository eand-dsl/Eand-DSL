import { type CSSProperties, type HTMLAttributes, type ReactNode, useState } from 'react';
import { T, space, color, ty, radius } from '../system';
import { Icon } from '../icons';
import { Text, IconBox } from './primitives';

/* ---------------- Section: the full-width body container ----------------
   Figma V1.1 Section (page 25519:12055, final 32899:266508): a rounded container
   with a header (title · context · filter-pill · trigger) and a body slot sized by
   the `size` axis so a given card type fits. surface default | inverse; trigger
   chevron | button; optional bottom gradient over the body. */
export type SectionSurface = 'default' | 'inverse' | 'brand' | 'brand-muted' | 'midnight';
export type SectionSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionTrigger = 'chevron' | 'button' | 'none';
// Figma `section/body/height/row-N` — the slot height each size reserves so the
// matching card fits: xs≈list row, sm≈quick-action, md≈deal card (224), lg≈plan
// card (300), xl≈highlight banner (452).
const SECTION_SIZE: Record<SectionSize, number> = { xs: 72, sm: 148, md: 224, lg: 300, xl: 452 };
const SECTION_SURFACE: Record<SectionSurface, { bg: string; onDark: boolean }> = {
  default:        { bg: color('surface.base.default'), onDark: false },   // #f0f0f5 grey
  inverse:        { bg: color('surface.base.brand'), onDark: true },      // #e00800 brand red
  brand:          { bg: color('surface.base.brand'), onDark: true },      // back-compat alias of inverse
  'brand-muted':  { bg: color('surface.canvas.brand-muted'), onDark: false },
  midnight:       { bg: color('surface.base.midnight'), onDark: true },
};

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Subtext under the title (`body.md`, subtle). */
  context?: ReactNode;
  /** Clamp the title to one or two lines (Figma `Title line`). */
  titleLine?: 1 | 2;
  /** Optional filter pill in the header, before the trigger. */
  filterPill?: ReactNode;
  surface?: SectionSurface;
  /** Hide the whole header (Figma `Show header`). */
  showHeader?: boolean;
  /** Header trigger: a chevron circle, a text button, or none (Figma `chevron ↔ button`). */
  trigger?: SectionTrigger;
  /** Label for the button trigger. */
  triggerLabel?: ReactNode;
  onTrigger?: () => void;
  /** Body slot size — reserves the row height for the card type it holds. */
  size?: SectionSize;
  /** Bottom-biased dark gradient over the body (for highlight-style content). */
  gradient?: boolean;
  /** Body scrolls horizontally and bleeds to the edges (carousels). */
  carousel?: boolean;
  /** @deprecated Use `trigger="none"`. */
  hideChevron?: boolean;
  /** @deprecated Use `onTrigger`. */
  onSeeAll?: () => void;
}

function TriggerChevron({ onDark }: { onDark: boolean }) {
  return (
    // 40px rounded button (radius 14); default = white w/ #615d6d chevron, inverse = glass w/ white chevron
    <span style={{
      width: 40, height: 40, flex: 'none', borderRadius: radius('4'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: onDark ? 'rgba(255,255,255,0.20)' : color('surface.raised.default'),
      backdropFilter: onDark ? 'blur(20px)' : undefined, WebkitBackdropFilter: onDark ? 'blur(20px)' : undefined,
      color: onDark ? 'rgba(255,255,255,0.70)' : '#615d6d',
      boxShadow: onDark ? 'none' : '0 1px 4px rgba(25,19,41,0.12)',
    }}>
      <svg aria-hidden width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
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
  const clamp: CSSProperties = {
    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: titleLine,
    overflow: 'hidden', textOverflow: 'ellipsis',
  } as CSSProperties;
  const slotHeight = size ? SECTION_SIZE[size] : undefined;

  return (
    <section style={{ width: '100%', boxSizing: 'border-box', background: s.bg, borderRadius: radius('7'), overflow: 'hidden', ...style }} {...rest}>
      {showHeader && (
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: space('sm'), padding: `${space('2xl')} ${space('lg')} 0` }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Text variant="heading.lg" color={text} style={clamp}>{title}</Text>
            {context != null ? <Text variant="body.md" color={sub} style={{ paddingTop: space('xs') }}>{context}</Text> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space('sm'), flex: 'none' }}>
            {filterPill}
            {trig === 'chevron' ? (
              <button onClick={fire} aria-label="See all" style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}>
                <TriggerChevron onDark={onDark} />
              </button>
            ) : trig === 'button' ? (
              <button onClick={fire} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, border: 0, background: 'transparent', cursor: 'pointer', padding: `0 ${space('xs')}`, color: onDark ? text : color('text.brand.default'), ...ty('button.sm') }}>
                {triggerLabel}<IconBox size="md"><Icon name="chevron-right-sm" size={16} /></IconBox>
              </button>
            ) : null}
          </div>
        </header>
      )}
      {/* body slot: 16px padding, `size` reserves the row height; gradient overlays it */}
      <div style={{ position: 'relative', padding: space('lg') }}>
        {gradient ? <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,15,33,0) 35%, rgba(20,15,33,0.78))', pointerEvents: 'none', borderRadius: radius('7') }} /> : null}
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

/* ---------------- Card (General) ---------------- */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  media?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  /** fixed width for use inside a carousel */
  width?: number | string;
  /** Figma `.card-general` 26825:101736 `surface` axis. */
  surface?: CardSurface;
}
/* Figma `.card-general` 26825:101736 exposes surface (default | inverse) x
   Carousel<->Grid (No | yes); the parent set `General-card` 28463:12391 arranges rows.
   inverse takes surface/raised/midnight #312c40 with inverse ink. The Carousel<->Grid
   axis is expressed here through `width` (fixed for carousel, fill for grid). */
export type CardSurface = 'default' | 'inverse';
export function Card({ media, title, body, action, width, surface = 'default', style, children, ...rest }: CardProps) {
  const onDark = surface === 'inverse';
  return (
    <div style={{
      boxSizing: 'border-box', width: width ?? '100%', flex: width ? '0 0 auto' : undefined,
      background: onDark ? color('surface.raised.midnight') : color('surface.raised.default'),
      color: onDark ? color('text.default.inverse') : undefined,
      // Figma General-card (28463:12391): radius border-radius/6 = 20 (was 16).
      borderRadius: radius('6'), overflow: 'hidden',
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

/* ---------------- Accordion ---------------- */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  defaultOpen?: boolean;
}
export function Accordion({ title, defaultOpen = false, style, children, ...rest }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ width: '100%', borderBottom: `1px solid ${color('border.solid.subtle')}`, ...style }} {...rest}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), padding: `${space('md')} 0`, background: 'transparent', border: 0, cursor: 'pointer' }}>
        <Text variant="title.sm">{title}</Text>
        <IconBox size="sm" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><Icon name="chevron-down-sm" size={16} /></IconBox>
      </button>
      {open ? <div style={{ paddingBottom: space('md') }}>{children}</div> : null}
    </div>
  );
}
