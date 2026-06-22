import type { HTMLAttributes, ReactNode } from 'react';
import { space, color, icon } from '../system';
import { Text, Icon } from './primitives';

/* ---------------- TopBar (header) ---------------- */
export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  leading?: ReactNode;
  title?: ReactNode;
  trailing?: ReactNode;
}
export function TopBar({ leading, title, trailing, style, ...rest }: TopBarProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      height: 56, display: 'flex', alignItems: 'center', gap: space('md'),
      padding: `0 ${space('lg')}`, background: color('surface.canvas.default'),
      borderBottom: `1px solid ${color('border.solid.subtle')}`, ...style,
    }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{leading}</div>
      <div style={{ flex: 1, minWidth: 0 }}><Text variant="title.md" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Text></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{trailing}</div>
    </header>
  );
}

/* ---------------- NavBar (bottom nav) ---------------- */
export interface NavItem { label: string; icon?: ReactNode; active?: boolean; onClick?: () => void; }
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  items: NavItem[];
}
/** Floating frosted pill nav. Active item is a red pill (icon + label). */
export function NavBar({ items, style, ...rest }: NavBarProps) {
  return (
    <nav style={{ position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: `${space('sm')} ${space('lg')} ${space('xs')}`, background: 'transparent', ...style }} {...rest}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 6, borderRadius: 9999, background: 'rgba(57,53,62,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(25,19,41,0.28)' }}>
        {items.map((it, i) => {
          const on = it.active;
          return (
            <button key={i} onClick={it.onClick}
              style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: on ? '8px 18px' : '8px 12px', borderRadius: 9999, border: 0, cursor: 'pointer', background: on ? color('surface.base.brand') : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,0.82)' }}>
              <Icon size="sm">{it.icon ?? '●'}</Icon>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
      <span style={{ width: 134, height: 5, borderRadius: 9999, background: 'rgba(25,19,41,0.85)' }} />
    </nav>
  );
}

/* ---------------- ActionBar (sticky footer) ---------------- */
export interface ActionBarProps extends HTMLAttributes<HTMLDivElement> {
  helper?: ReactNode;
}
export function ActionBar({ helper, style, children, ...rest }: ActionBarProps) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, width: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: space('xs'), padding: space('lg'),
      background: color('surface.canvas.default'), borderTop: `1px solid ${color('border.solid.subtle')}`, ...style,
    }} {...rest}>
      {helper ? <Text variant="body.sm" color={color('text.default.muted')}>{helper}</Text> : null}
      <div style={{ display: 'flex', gap: space('md') }}>{children}</div>
    </div>
  );
}

/* ---------------- SectionLink (section header row) ---------------- */
export interface SectionLinkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  link?: ReactNode;
  onLinkClick?: () => void;
}
export function SectionLink({ title, link = 'See all', onLinkClick, style, ...rest }: SectionLinkProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 40, ...style }} {...rest}>
      <Text variant="heading.xs">{title}</Text>
      <button onClick={onLinkClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'transparent', border: 0, cursor: 'pointer', color: color('text.brand.default') }}>
        <Text variant="button.sm" color={color('text.brand.default')}>{link}</Text>
        <Icon size="xs">›</Icon>
      </button>
    </div>
  );
}

/* ---------------- QuickAction (shortcut grid) ---------------- */
export interface QuickActionItem { label: string; icon?: ReactNode; badge?: ReactNode; onClick?: () => void; }
export interface QuickActionProps extends HTMLAttributes<HTMLDivElement> {
  items: QuickActionItem[];
  columns?: number;
}
/** Grid of white shortcut cards: icon in a grey square (top-left), label bottom-left, optional badge. */
export function QuickAction({ items, columns = 3, style, ...rest }: QuickActionProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: space('sm'), width: '100%', ...style }} {...rest}>
      {items.map((it, i) => (
        <button key={i} onClick={it.onClick}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 104, padding: space('md'), borderRadius: 16, border: `1px solid ${color('border.solid.subtle')}`, background: color('surface.canvas.default'), cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size="md">{it.icon ?? '●'}</Icon>
          </span>
          {it.badge ? <span style={{ position: 'absolute', top: 10, right: 10 }}>{it.badge}</span> : null}
          <Text variant="title.xs">{it.label}</Text>
        </button>
      ))}
    </div>
  );
}
