import { type CSSProperties, type HTMLAttributes, type ReactNode, useState } from 'react';
import { T, space, color, ty, radius } from '../system';
import { Icon } from '../icons';
import { Text, IconBox, SectionLinkButton } from './primitives';

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
    <section style={{ width: '100%', boxSizing: 'border-box', background: s.bg, borderRadius: radius('8'), overflow: 'hidden', ...style }} {...rest}>
      {showHeader && (
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: space('sm'), padding: `${space('2xl')} ${space('lg')} 0` }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Text variant="heading.lg" color={text} style={clamp}>{title}</Text>
            {context != null ? <Text variant="body.md" color={sub} style={{ paddingTop: space('xs') }}>{context}</Text> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space('sm'), flex: 'none' }}>
            {filterPill}
            {trig === 'chevron' ? (
              // Figma's published `section-link` button — shared with the export rather
              // than kept as a private copy here.
              <SectionLinkButton surface={onDark ? 'inverse' : 'default'} onClick={fire} />
            ) : trig === 'button' ? (
              <button onClick={fire} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, border: 0, background: 'transparent', cursor: 'pointer', padding: `0 ${space('xs')}`, color: onDark ? text : color('text.brand.default'), ...ty('button.sm') }}>
                {triggerLabel}<IconBox size="md" data-rtl-flip><Icon name="chevron-right-sm" size={16} /></IconBox>
              </button>
            ) : null}
          </div>
        </header>
      )}
      {/* body slot: 16px padding, `size` reserves the row height; gradient overlays it */}
      <div style={{ position: 'relative', padding: space('lg') }}>
        {gradient ? <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,15,33,0) 35%, rgba(20,15,33,0.78))', pointerEvents: 'none', borderRadius: radius('8') }} /> : null}
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

/* ---------------- Accordion ---------------- */
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
        <Heading style={{ margin: 0, ...ty('heading.lg'), display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
