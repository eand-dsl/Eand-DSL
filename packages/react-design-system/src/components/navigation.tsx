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
export function NavBar({ items, style, ...rest }: NavBarProps) {
  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', height: 64,
      display: 'flex', background: color('surface.canvas.default'),
      borderTop: `1px solid ${color('border.solid.subtle')}`, ...style,
    }} {...rest}>
      {items.map((it, i) => {
        const c = it.active ? color('text.brand.default') : color('text.default.muted');
        return (
          <button key={i} onClick={it.onClick}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'transparent', border: 0, cursor: 'pointer', color: c }}>
            <Icon size="md">{it.icon ?? '●'}</Icon>
            <Text variant="body.xs" color={c}>{it.label}</Text>
          </button>
        );
      })}
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
export interface QuickActionItem { label: string; icon?: ReactNode; onClick?: () => void; }
export interface QuickActionProps extends HTMLAttributes<HTMLDivElement> {
  items: QuickActionItem[];
  columns?: number;
}
export function QuickAction({ items, columns = 4, style, ...rest }: QuickActionProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: space('md'), width: '100%', ...style }} {...rest}>
      {items.map((it, i) => (
        <button key={i} onClick={it.onClick}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space('xs'), background: 'transparent', border: 0, cursor: 'pointer' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: color('surface.base.default') }}>
            <Icon size="lg">{it.icon ?? '●'}</Icon>
          </span>
          <Text variant="body.sm" style={{ textAlign: 'center' }}>{it.label}</Text>
        </button>
      ))}
    </div>
  );
}
