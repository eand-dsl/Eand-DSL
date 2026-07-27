import type { HTMLAttributes, ReactNode } from 'react';
import { space, color, icon, radius } from '../system';
import { Text, IconBox } from './primitives';

/* ---------------- TopBar (header) ----------------
   Figma V1.1 Top bar (page 22542:13963): a slot-based header. A top row
   (left-part · middle · right-part) over a brand or default surface, with an
   optional big-title block (eyebrow · large title · subtext) or account display,
   and a bottom slot for search / tabs / chips / stepper / action cards. */
export type TopBarSurface = 'brand' | 'default';
/** @deprecated V1.0 action-bar sub-card — pass the card via `children` instead. */
export interface TopBarAction { title?: ReactNode; subtitle?: ReactNode; cta?: ReactNode; }
export interface TopBarAccount { greeting?: ReactNode; name?: ReactNode; }
export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  surface?: TopBarSurface;
  /** @deprecated Use `surface`. */
  variant?: TopBarSurface;
  /** Faux iOS status row (default on brand). */
  statusBar?: boolean;
  /** Left-part: back chevron, avatar+text, etc. */
  leading?: ReactNode;
  /** Middle: the centered e& logo (`true`) or a custom node. */
  logo?: boolean | ReactNode;
  /** Middle: page name (used when there's no logo/account/big-title). */
  title?: ReactNode;
  /** Middle: account display — greeting over a masked name with a chevron. */
  account?: TopBarAccount;
  /** @deprecated Use `account={{ greeting }}`. Renders the account display. */
  greeting?: ReactNode;
  /** Right-part: circular icon buttons. */
  actions?: ReactNode[];
  /** Right-part: a link or button after the icon buttons. */
  trailing?: ReactNode;
  /** Big-title block: small overline above the large title. */
  eyebrow?: ReactNode;
  /** Big-title block: the large title (`heading.lg`). */
  bigTitle?: ReactNode;
  /** Big-title block: supporting line under the title. */
  subtext?: ReactNode;
  /** Trailing chevron on the big title / account name. */
  chevron?: boolean;
  /** @deprecated V1.0 sub-card — pass a card via `children` instead. */
  actionBar?: TopBarAction;
  /** Bottom slot: search, tabs, chips, stepper, action cards… */
  children?: ReactNode;
  /** Rounded bottom corners (defaults on brand). */
  rounded?: boolean;
}
function CircleBtn({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <span style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none', background: dark ? color('surface.glass.white.md') : color('surface.base.default'), backdropFilter: dark ? 'blur(20px)' : undefined, WebkitBackdropFilter: dark ? 'blur(20px)' : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#fff' : color('text.default.default') }}>{children}</span>;
}
function Chevron({ size = 20, color: c }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: 'none', color: c }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function TopBar({
  surface, variant, statusBar, leading, logo, title, account, greeting, actions, trailing,
  eyebrow, bigTitle, subtext, chevron, actionBar, rounded, style, children, ...rest
}: TopBarProps) {
  const acct = account ?? (greeting != null ? { greeting } : undefined);
  const surf: TopBarSurface = surface ?? variant ?? (bigTitle != null || acct != null ? 'brand' : 'default');
  const onDark = surf === 'brand';
  const text = onDark ? color('text.default.inverse') : color('text.default.default');
  const sub = onDark ? color('text.default.inverse-subtle') : color('text.default.muted');
  const round = rounded ?? onDark;
  const hero = onDark || bigTitle != null || acct != null || children != null;
  const clamp = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const;

  // Compact default header — single 56px row, no hero content.
  if (!hero) {
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', height: 56, display: 'flex', alignItems: 'center', gap: space('md'), padding: `0 ${space('lg')}`, background: color('surface.canvas.default'), borderBottom: `1px solid ${color('border.solid.subtle')}`, ...style }} {...rest}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{leading}</div>
        {logo ? <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{logo === true ? <LogoMark /> : logo}</div>
          : <div style={{ flex: 1, minWidth: 0 }}><Text variant="title.md" style={clamp}>{title}</Text></div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{(actions ?? []).map((a, i) => <CircleBtn key={i}>{a}</CircleBtn>)}{trailing}</div>
      </header>
    );
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', background: onDark ? color('surface.base.brand') : color('surface.canvas.default'), color: text, borderBottomLeftRadius: round ? radius('6') : 0, borderBottomRightRadius: round ? radius('6') : 0, padding: `0 ${space('lg')} ${space('lg')}`, display: 'flex', flexDirection: 'column', gap: space('md'), ...style }} {...rest}>
      {statusBar !== false && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44, fontSize: 14, fontWeight: 600, color: text }}><span>9:41</span><span style={{ letterSpacing: 2 }}>▂▄▆ 📶 🔋</span></div>
      )}
      {/* header top row: left-part · middle (logo) · right-part */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), minHeight: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{leading}</div>
        {logo ? <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{logo === true ? <LogoMark onDark={onDark} /> : logo}</div> : <div style={{ flex: 1 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{(actions ?? []).map((a, i) => <CircleBtn key={i} dark={onDark}>{a}</CircleBtn>)}{trailing}</div>
      </div>

      {/* account display — greeting over masked name */}
      {acct ? (
        <div style={{ minWidth: 0 }}>
          {acct.greeting != null ? <Text variant="body.md" color={sub} as="div">{acct.greeting}</Text> : null}
          {acct.name != null ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('2xs') }}><Text variant="title.md" color={text}>{acct.name}</Text>{chevron !== false ? <Chevron size={16} color={text} /> : null}</span> : null}
        </div>
      ) : null}

      {/* big-title block: eyebrow · large title · subtext */}
      {bigTitle != null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space('2xs') }}>
          {eyebrow != null ? <Text variant="title.xs" color={text} as="div">{eyebrow}</Text> : null}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm') }}>
            <Text variant="heading.lg" color={text}>{bigTitle}</Text>
            {chevron ? <Chevron size={24} color={text} /> : null}
          </span>
          {subtext != null ? <Text variant="body.lg" color={sub}>{subtext}</Text> : null}
        </div>
      ) : null}

      {/* deprecated action-bar sub-card */}
      {actionBar ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm'), background: 'rgba(0,0,0,0.18)', borderRadius: radius('3'), padding: space('md') }}>
          <div style={{ minWidth: 0 }}>
            <Text variant="title.sm" color="#fff" as="div">{actionBar.title}</Text>
            {actionBar.subtitle ? <Text variant="body.sm" color="rgba(255,255,255,0.8)">{actionBar.subtitle}</Text> : null}
          </div>
          <span style={{ background: '#fff', color: color('text.brand.default'), borderRadius: 9999, padding: `8px ${space('lg')}`, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{actionBar.cta ?? 'Start'}</span>
        </div>
      ) : null}

      {/* bottom slot: search / tabs / chips / stepper / cards */}
      {children != null ? <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm') }}>{children}</div> : null}
    </header>
  );
}
/** White e& wordmark for the header centre on brand; ink on light surfaces. */
function LogoMark({ onDark }: { onDark?: boolean }) {
  return <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: onDark ? '#fff' : color('text.brand.default') }}>e&amp;</span>;
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
      {icon ? <span style={{ width: 40, height: 40, borderRadius: 12, background: color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><IconBox size="md">{icon}</IconBox></span> : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <Text variant="title.sm" as="div">{label}</Text>
        {sublabel ? <Text variant="body.sm" color={color('text.default.muted')}>{sublabel}</Text> : null}
      </span>
      {value ? <Text variant="body.md" color={color('text.default.muted')}>{value}</Text> : null}
      {chevron ? <IconBox size="sm" style={{ color: color('text.default.muted') }}>›</IconBox> : null}
    </button>
  );
}

/* ---------------- NavBar (bottom nav) ---------------- */
export interface NavItem { label: string; icon?: ReactNode; avatar?: ReactNode; active?: boolean; special?: boolean; onClick?: () => void; }
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  items: NavItem[];
  /** Figma `.navbar-scroll` axis. `down` collapses to icons only (scrolled down);
   *  `up` (default) shows icon + label. Transitions are animated. */
  scrollDirection?: 'up' | 'down';
}
const GLASS = { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(19px)', WebkitBackdropFilter: 'blur(19px)', border: '1px solid rgba(255,255,255,0.22)' } as const;
/** One tab. Active = white pill; the icon + label pick up red via currentColor.
 *  When `collapsed`, labels animate away and the active pill widens (icons only). */
function NavTab({ it, collapsed }: { it: NavItem; collapsed?: boolean }) {
  const on = it.active;
  return (
    <button onClick={it.onClick} aria-current={on ? 'page' : undefined}
      style={{
        flexGrow: collapsed ? (on ? 3 : 1) : 1, flexShrink: 1, flexBasis: 0, minWidth: 0,
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, padding: collapsed ? '8px 4px' : '6px 4px 4px', borderRadius: 9999, border: 0, cursor: 'pointer',
        background: on ? '#fff' : 'transparent', color: on ? color('text.brand.default') : '#fff',
        transition: 'flex-grow 280ms ease, padding 220ms ease, background 200ms ease',
      }}>
      <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', color: 'inherit', flex: 'none' }}>
        {it.avatar ?? it.icon ?? '●'}
      </span>
      <span aria-hidden={collapsed || undefined} style={{
        fontSize: 10, lineHeight: 1.4, fontWeight: on ? 700 : 400, color: 'inherit', whiteSpace: 'nowrap',
        maxHeight: collapsed ? 0 : 16, opacity: collapsed ? 0 : 1, overflow: 'hidden',
        transition: 'max-height 260ms ease, opacity 180ms ease',
      }}>{it.label}</span>
    </button>
  );
}
/** Floating glass nav over a midnight scrim: one frosted pill of tabs.
 *  Active tab = a solid WHITE pill with red icon + label; inactive tabs are white on
 *  the glass. Collapses to icons only when scrolled down (Figma `scroll-direction`). */
export function NavBar({ items, scrollDirection = 'up', style, ...rest }: NavBarProps) {
  const collapsed = scrollDirection === 'down';
  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', paddingTop: 44,
      background: 'linear-gradient(to bottom, rgba(25,19,41,0) 0%, rgba(25,19,41,0.4) 48%, rgba(25,19,41,0.7) 100%)',
      ...style,
    }} {...rest}>
      <div style={{ padding: `0 ${space('lg')}` }}>
        <div style={{ ...GLASS, display: 'flex', alignItems: 'center', gap: space('sm'), padding: 4, borderRadius: 9999 }}>
          {items.map((it, i) => <NavTab key={i} it={it} collapsed={collapsed} />)}
        </div>
      </div>
      <span style={{ width: 144, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.9)', margin: '10px auto 8px' }} />
    </nav>
  );
}

/* ---------------- ActionBar ---------------- */
/** Backing surface (Figma `surface-color`). Two families: light (dark text) and
 *  dark/inverse (white text). Maps to `surface.*` tokens. */
export type ActionBarSurface =
  | 'default' | 'subtle' | 'sunken' | 'white-transparent'
  | 'glass' | 'midnight-base' | 'midnight-raised' | 'midnight-transparent';
const AB_SURFACE: Record<ActionBarSurface, { bg: string; inverse: boolean; blur: boolean }> = {
  default:                { bg: 'surface.base.inverse',      inverse: false, blur: false }, // #ffffff
  subtle:                 { bg: 'surface.base.default',      inverse: false, blur: false }, // #f0f0f5
  sunken:                 { bg: 'surface.sunken.default',    inverse: false, blur: false }, // #e4e3ea
  'white-transparent':    { bg: 'surface.glass.midnight.sm', inverse: false, blur: true  }, // rgba(25,19,41,.07)
  glass:                  { bg: 'surface.glass.white.md',    inverse: true,  blur: true  }, // rgba(255,255,255,.15)
  'midnight-base':        { bg: 'surface.base.midnight',     inverse: true,  blur: false }, // #191329
  'midnight-raised':      { bg: 'surface.raised.midnight',   inverse: true,  blur: false }, // #312c40
  'midnight-transparent': { bg: 'surface.glass.midnight.md', inverse: true,  blur: true  }, // rgba(25,19,41,.20)
};

export interface ActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'action'> {
  /** Primary line — `title.xs` (Figma limit ~18 chars). */
  title?: ReactNode;
  /** Secondary line — `body.md`, truncates with ellipsis (Figma limit ~21 chars). */
  subtitle?: ReactNode;
  /** Leading visual (icon or image) shown in a 40×40 tile. Omit for text at the leading edge. */
  icon?: ReactNode;
  /** Trailing action — typically a `<Button>`. Only one trailing action; do not combine with `chevron`. */
  action?: ReactNode;
  /** Show a trailing chevron instead of a button — the whole bar becomes the tap target. */
  chevron?: boolean;
  /** Backing surface. Light family: `default`·`subtle`·`sunken`·`white-transparent`;
   *  dark family: `glass`·`midnight-base`·`midnight-raised`·`midnight-transparent`. */
  surface?: ActionBarSurface;
  /** @deprecated Use `surface="glass"`. Kept as a back-compat alias for the inverse scheme. */
  inverse?: boolean;
  /** Multiple-stack — layered "stacked cards" look. Inverse/dark surfaces only (Figma). */
  stack?: boolean;
}
export function ActionBar({ title, subtitle, icon: leading, action, chevron, surface, inverse, stack, onClick, style, ...rest }: ActionBarProps) {
  const key: ActionBarSurface = surface ?? (inverse ? 'glass' : 'default');
  const s = AB_SURFACE[key];
  const tappable = chevron || !!onClick;
  const titleColor = s.inverse ? color('text.default.inverse') : color('text.default.default');
  const subtitleColor = s.inverse ? color('text.default.inverse-subtle') : color('text.default.subtle');
  const tileBg = s.inverse ? color('surface.glass.white.md') : color('surface.base.default');
  const glass = s.blur ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as const : {};
  const clamp = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;
  const showStack = !!stack && s.inverse; // multiple-stack is inverse/glass only

  const bar = (
    <div onClick={onClick} style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: space('md'),
      height: 72, padding: `0 ${space('lg')}`, width: '100%', boxSizing: 'border-box',
      borderRadius: radius('6'), overflow: 'hidden', background: color(s.bg), ...glass,
      cursor: tappable ? 'pointer' : undefined, ...(showStack ? {} : style),
    }} {...(showStack ? {} : rest)}>
      {leading != null ? (
        <span style={{
          flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: radius('3'), background: tileBg, color: titleColor,
          overflow: 'hidden', // clip a full-bleed image leading (`.image-asset type=image`)
        }}>{leading}</span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {title != null ? <Text variant="title.xs" color={titleColor} style={clamp}>{title}</Text> : null}
        {subtitle != null ? <Text variant="body.md" color={subtitleColor} style={clamp}>{subtitle}</Text> : null}
      </span>
      {chevron
        ? <svg aria-hidden width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ flex: 'none', color: titleColor }}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        : action != null ? <span style={{ flex: 'none', display: 'inline-flex' }}>{action}</span> : null}
    </div>
  );

  if (!showStack) return bar;
  // Stacked-card layers peeking out below the bar (same surface, narrower + offset down).
  const ghost = (top: number, inset: number, opacity: number) => (
    <div aria-hidden style={{
      position: 'absolute', top, left: inset, right: inset, height: 72,
      borderRadius: radius('6'), background: color(s.bg), ...glass, opacity,
      border: `1px solid ${color('surface.glass.white.md')}`,
    }} />
  );
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: 12, ...style }} {...rest}>
      {ghost(12, 16, 0.6)}
      {ghost(6, 8, 0.85)}
      <div style={{ position: 'relative' }}>{bar}</div>
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
        <IconBox size="md">›</IconBox>
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
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 4, width: '100%', ...style }} {...rest}>
      {items.map((it, i) => (
        <button key={i} onClick={it.onClick}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 148, padding: space('md'), borderRadius: 20, border: 0, background: color('surface.canvas.default'), cursor: 'pointer', textAlign: 'left' }}>
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
