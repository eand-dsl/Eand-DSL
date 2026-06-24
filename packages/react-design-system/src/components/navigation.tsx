import type { HTMLAttributes, ReactNode } from 'react';
import { space, color, icon } from '../system';
import { Text, Icon } from './primitives';

/* ---------------- TopBar (header) ---------------- */
export interface TopBarAction { title?: ReactNode; subtitle?: ReactNode; cta?: ReactNode; }
export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  variant?: 'default' | 'brand';
  leading?: ReactNode;
  title?: ReactNode;
  greeting?: ReactNode;       // brand header: "Hi, Ahmed" above the title (masked number)
  trailing?: ReactNode;
  actions?: ReactNode[];      // circle icon buttons on the right (brand header)
  actionBar?: TopBarAction;   // optional darker-red sub-card (e.g. "Complete your profile")
  statusBar?: boolean;        // faux iOS status row (default true on brand)
}
function CircleBtn({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <span style={{ width: 40, height: 40, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.18)' : color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#fff' : color('text.default.default') }}>{children}</span>;
}
export function TopBar({ variant = 'default', leading, title, greeting, trailing, actions, actionBar, statusBar, style, ...rest }: TopBarProps) {
  if (variant === 'brand') {
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', background: color('surface.base.brand'), color: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: `0 ${space('lg')} ${space('lg')}`, ...style }} {...rest}>
        {statusBar !== false && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44, fontSize: 14, fontWeight: 600 }}><span>9:41</span><span style={{ letterSpacing: 2 }}>▂▄▆ 📶 🔋</span></div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md') }}>
          <div style={{ minWidth: 0 }}>
            {greeting ? <Text variant="body.sm" color="rgba(255,255,255,0.85)" as="div">{greeting}</Text> : null}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Text variant="title.md" color="#fff">{title}</Text><Icon size="xs">⌄</Icon></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>
            {(actions ?? []).map((a, i) => <CircleBtn key={i} dark>{a}</CircleBtn>)}
            {trailing}
          </div>
        </div>
        {actionBar ? (
          <div style={{ marginTop: space('md'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm'), background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: space('md') }}>
            <div style={{ minWidth: 0 }}>
              <Text variant="title.sm" color="#fff" as="div">{actionBar.title}</Text>
              {actionBar.subtitle ? <Text variant="body.sm" color="rgba(255,255,255,0.8)">{actionBar.subtitle}</Text> : null}
            </div>
            <span style={{ background: '#fff', color: color('text.brand.default'), borderRadius: 9999, padding: `8px ${space('lg')}`, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{actionBar.cta ?? 'Start'}</span>
          </div>
        ) : null}
      </header>
    );
  }
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', height: 56, display: 'flex', alignItems: 'center', gap: space('md'), padding: `0 ${space('lg')}`, background: color('surface.canvas.default'), borderBottom: `1px solid ${color('border.solid.subtle')}`, ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{leading}</div>
      <div style={{ flex: 1, minWidth: 0 }}><Text variant="title.md" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Text></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{(actions ?? []).map((a, i) => <CircleBtn key={i}>{a}</CircleBtn>)}{trailing}</div>
    </header>
  );
}

/* ---------------- ListRow (settings / contact / list items) ---------------- */
export interface ListRowProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  icon?: ReactNode;
  label: ReactNode;
  sublabel?: ReactNode;
  value?: ReactNode;
  chevron?: boolean;
}
export function ListRow({ icon, label, sublabel, value, chevron = true, style, ...rest }: ListRowProps) {
  return (
    <button style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: space('md'), padding: space('lg'), borderRadius: 16, background: color('surface.raised.default'), border: 0, cursor: 'pointer', textAlign: 'left', ...style }} {...rest}>
      {icon ? <span style={{ width: 40, height: 40, borderRadius: 12, background: color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><Icon size="md">{icon}</Icon></span> : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <Text variant="title.sm" as="div">{label}</Text>
        {sublabel ? <Text variant="body.sm" color={color('text.default.muted')}>{sublabel}</Text> : null}
      </span>
      {value ? <Text variant="body.md" color={color('text.default.muted')}>{value}</Text> : null}
      {chevron ? <Icon size="sm" style={{ color: color('text.default.muted') }}>›</Icon> : null}
    </button>
  );
}

/* ---------------- NavBar (bottom nav) ---------------- */
export interface NavItem { label: string; icon?: ReactNode; active?: boolean; special?: boolean; onClick?: () => void; }
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  items: NavItem[];
}
const GLASS = { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' } as const;
function NavTab({ it }: { it: NavItem }) {
  const on = it.active;
  return (
    <button onClick={it.onClick}
      style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        height: on ? 56 : 64, margin: on ? '0 2px' : 0, padding: on ? '0 18px' : '0 14px',
        borderRadius: 9999, border: 0, cursor: 'pointer', color: on ? color('text.brand.default') : '#fff',
        background: on ? '#fff' : 'transparent',
      }}>
      <span style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>{it.icon ?? '●'}</span>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{it.label}</span>
    </button>
  );
}
/** Floating glass nav: a frosted white pill over a midnight scrim. Active tab = a
 *  solid WHITE pill with red icon + label; inactive tabs are white on the glass.
 *  A `special` item (e.g. mShop) renders as a detached glass circle left of the pill. */
export function NavBar({ items, style, ...rest }: NavBarProps) {
  const special = items.filter((i) => i.special);
  const tabs = items.filter((i) => !i.special);
  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 44,
      background: 'linear-gradient(to bottom, rgba(25,19,41,0) 0%, rgba(25,19,41,0.4) 48%, rgba(25,19,41,0.7) 100%)',
      ...style,
    }} {...rest}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {special.map((it, i) => (
          <span key={`s${i}`} style={{ ...GLASS, width: 64, height: 64, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <NavTab it={it} />
          </span>
        ))}
        <div style={{ ...GLASS, display: 'inline-flex', alignItems: 'center', height: 64, borderRadius: 9999, padding: '0 4px' }}>
          {tabs.map((it, i) => <NavTab key={i} it={it} />)}
        </div>
      </div>
      <span style={{ width: 144, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.9)', margin: '10px 0 8px' }} />
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
          <span style={{ width: 40, height: 40, borderRadius: 12, background: color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: color('text.default.default') }}>
            {it.icon ?? '●'}
          </span>
          {it.badge ? <span style={{ position: 'absolute', top: 10, right: 10 }}>{it.badge}</span> : null}
          <Text variant="title.xs">{it.label}</Text>
        </button>
      ))}
    </div>
  );
}
