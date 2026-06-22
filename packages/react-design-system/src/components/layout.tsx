import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { T, space, color } from '../system';
import { Text, Icon } from './primitives';

/* ---------------- Section: the full-width body container ---------------- */
export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  context?: ReactNode;     // subtext under the title (e.g. "Cover these with your Smiles Points")
  filterPill?: ReactNode;  // optional Category filter pill in the header
  surface?: 'default' | 'brand' | 'midnight';
  hideChevron?: boolean;
  onSeeAll?: () => void;
  /** body scrolls horizontally and bleeds to the edges (carousels) */
  carousel?: boolean;
}
const SECTION_BG: Record<string, string> = {
  default: color('surface.base.default'), brand: color('surface.base.brand'), midnight: color('surface.base.midnight'),
};
export function Section({ title = 'Section', context, filterPill, surface = 'default', hideChevron, onSeeAll, carousel, style, children, ...rest }: SectionProps) {
  const onDark = surface !== 'default';
  const text = onDark ? color('text.default.inverse') : color('text.default.default');
  const sub = onDark ? 'rgba(255,255,255,0.72)' : color('text.default.muted');
  return (
    <section style={{ width: '100%', boxSizing: 'border-box', background: SECTION_BG[surface], borderRadius: 24, padding: space('lg'), display: 'flex', flexDirection: 'column', gap: space('lg'), ...style }} {...rest}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: space('sm') }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text variant="heading.sm" color={text}>{title}</Text>
          {context ? <Text variant="body.sm" color={sub}>{context}</Text> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm'), flex: '0 0 auto' }}>
          {filterPill}
          {!hideChevron && (
            <button onClick={onSeeAll} aria-label="See all" style={{
              width: 36, height: 36, borderRadius: '50%', border: 0, cursor: 'pointer', flex: '0 0 auto',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              background: onDark ? 'rgba(255,255,255,0.16)' : '#fff',
              boxShadow: onDark ? 'none' : '0 1px 4px rgba(25,19,41,0.12)',
              color: onDark ? '#fff' : color('text.default.default'),
            }}>›</button>
          )}
        </div>
      </header>
      <div style={carousel
        ? { display: 'flex', gap: space('md'), overflowX: 'auto', scrollbarWidth: 'none', margin: `0 -${space('lg')}`, padding: `0 ${space('lg')}` }
        : { display: 'flex', flexDirection: 'column', gap: space('md') }}>
        {children}
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
}
export function Card({ media, title, body, action, width, style, children, ...rest }: CardProps) {
  return (
    <div style={{
      boxSizing: 'border-box', width: width ?? '100%', flex: width ? '0 0 auto' : undefined,
      background: color('surface.raised.default'), border: `1px solid ${color('border.solid.subtle')}`,
      borderRadius: T.borderRadius?.['5'] ?? '16px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', ...style,
    }} {...rest}>
      {media ? <div style={{ width: '100%' }}>{media}</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), padding: space('lg') }}>
        {title ? <Text variant="title.sm">{title}</Text> : null}
        {body ? <Text variant="body.md" color={color('text.default.subtle')}>{body}</Text> : null}
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
        <Icon size="sm" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>⌄</Icon>
      </button>
      {open ? <div style={{ paddingBottom: space('md') }}>{children}</div> : null}
    </div>
  );
}
