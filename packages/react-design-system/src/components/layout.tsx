import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { T, space, color } from '../system';
import { Text, Icon } from './primitives';

/* ---------------- Section: the full-width body container ---------------- */
export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode; // e.g. a "See all" link
  surface?: 'default' | 'inverse' | 'brand' | 'midnight';
  /** body scrolls horizontally and bleeds to the edges (carousels, banners) */
  carousel?: boolean;
}
const SURFACE_BG: Record<string, string> = {
  default: color('surface.canvas.default'), inverse: color('surface.base.default'),
  brand: color('surface.base.brand'), midnight: color('surface.base.midnight'),
};
export function Section({ title, action, surface = 'default', carousel, style, children, ...rest }: SectionProps) {
  const onDark = surface === 'brand' || surface === 'midnight';
  const text = onDark ? color('text.default.inverse') : color('text.default.default');
  return (
    <section style={{ width: '100%', boxSizing: 'border-box', background: SURFACE_BG[surface], paddingBlock: space('lg'), display: 'flex', flexDirection: 'column', gap: space('md'), ...style }} {...rest}>
      {(title || action) && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: space('lg') }}>
          <Text variant="heading.xs" color={text}>{title}</Text>
          {action ? <Text variant="button.sm" color={onDark ? text : color('text.brand.default')}>{action}</Text> : null}
        </header>
      )}
      <div style={carousel
        ? { display: 'flex', gap: space('md'), overflowX: 'auto', paddingInline: space('lg'), scrollbarWidth: 'none' }
        : { display: 'flex', flexDirection: 'column', gap: space('md'), paddingInline: space('lg') }}>
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
