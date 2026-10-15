import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { T, space, color, icon, radius, rowHeight, scale, ty, PILL } from '../system';
import { Icon } from '../icons';
import { Text, IconBox, Logo } from './primitives';
import { Switcher, type SwitcherProps } from './controls';

/* Glass surfaces carry a Figma GLASS effect (`effects/glass/md/*`, frost 20). CSS cannot
   express refraction or dispersion; a 20px backdrop blur is the agreed approximation. */
const GLASS_BLUR: CSSProperties = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' };

/* Decorative chevron from the icon set (rule 4 — never hand-draw a glyph the set has). */
function Chevron({ size = 20, name = 'chevron-down', flip }: { size?: number; name?: string; flip?: boolean }) {
  return (
    <span aria-hidden data-rtl-flip={flip || undefined} style={{ flex: 'none', display: 'inline-flex', color: 'inherit' }}>
      <Icon name={name} size={size} />
    </span>
  );
}

/* ---------------- TopBar (header) ----------------
   Figma V1.2 `topbar` 38172:12163 (page 22542:13963). Four symbols, surface × scheme:
     brand-red  / inverse  → header scheme glass   (white ink, glass controls, white logo)
     midnight   / inverse  → header scheme glass
     white      / default  → header scheme inverse (midnight ink, #f0f0f5 controls, red logo)
     false      / default  → header scheme default (midnight ink, #fff controls)
   Every one is an inset card: root padding 4/4/0/4 (spacing/xs); `wrapper` radius
   36/36/20/20 (bottom bound border-radius/7, top UNBOUND — there is no 36 token), padding
   bottom 16, clipping. Inside: the 62px iOS status bar, `.topbar-header-schemes`
   38965:82143 (41px, padding 0/16, three equal columns: left · centred middle · right),
   then the `.tobpar-core` 38558:8041 add-ons, each carrying 16px top + side padding. */
export type TopBarSurface = 'brand' | 'midnight' | 'white' | 'none'
  /** @deprecated V1.1 name — use `white`. */
  | 'default';
/** @deprecated V1.0 action-bar sub-card — pass the card via `children` instead. */
export interface TopBarAction { title?: ReactNode; subtitle?: ReactNode; cta?: ReactNode; }
export interface TopBarAccount {
  /** Eyebrow line (Figma `name-string`), body/md. */
  greeting?: ReactNode;
  /** The masked number (Figma `account-number-string`), title/sm + 16px chevron. */
  name?: ReactNode;
  /** 40px round profile picture (Figma `pfp`), e.g. an <img>. */
  avatar?: ReactNode;
}
export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Figma `surface`: `brand` (brand-red), `midnight`, `white` or `none` (Figma `false`,
   *  transparent — for a midnight or light-grey canvas). Defaults to `brand` when an
   *  `account` or `bigTitle` is given, else `white`. `default` is a deprecated alias of `white`. */
  surface?: TopBarSurface;
  /** @deprecated Use `surface`. */
  variant?: TopBarSurface;
  /** Faux iOS status bar (on by default on every surface). */
  statusBar?: boolean;
  /** Left column: custom content (e.g. an avatar). For a back button use `onBack`. */
  leading?: ReactNode;
  /** Left column: renders the 40px back button (Figma `.topbar-body-left-side type=back-button`). */
  onBack?: () => void;
  /** Middle: the etisalat logo (`true`) or a custom node. */
  logo?: boolean | ReactNode;
  /** Middle: page name, centred title/sm (Figma `.topbar-page-name`). Ignored when `logo` is set. */
  title?: ReactNode;
  /** Middle: body/md line under the page name (Figma `description-string`). */
  subtitle?: ReactNode;
  /** Left column: account — optional avatar, greeting over a masked number with a chevron. */
  account?: TopBarAccount;
  /** @deprecated Use `account={{ greeting }}`. Renders the account display. */
  greeting?: ReactNode;
  /** Right column: 40px round controls (Figma `topbar-link`). Pass icons. */
  actions?: ReactNode[];
  /** Right column: a link or button after the controls. */
  trailing?: ReactNode;
  /** Title block (`.topbar-title`): overline above the large title, body/md. */
  eyebrow?: ReactNode;
  /** Title block: 16px chevron after the overline (Figma `overline-chevron`). */
  eyebrowChevron?: boolean;
  /** Title block: the large title (heading/lg text style, 24px). */
  bigTitle?: ReactNode;
  /** Title block: supporting line under the title, body/lg. */
  subtext?: ReactNode;
  /** Chevron after the big title (24px, default off) and the account number (16px, default on). */
  chevron?: boolean;
  /** @deprecated V1.0 sub-card — pass a card via `children` instead. */
  actionBar?: TopBarAction;
  /** Add-ons: search, tabs, chips, stepper, action cards… each gets 16px top padding. */
  children?: ReactNode;
  /** Figma rounds every surface (36 top / 20 bottom). `false` squares the corners. */
  rounded?: boolean;
  /** @deprecated Code-only 56px single-row header with no status bar. Figma has no
   *  compact top bar — every V1.2 surface carries the status bar and header row. */
  compact?: boolean;
}

type TopBarScheme = 'glass' | 'inverse' | 'default';
const TOPBAR_SURFACE: Record<Exclude<TopBarSurface, 'default'>, { bg: string; scheme: TopBarScheme }> = {
  brand: { bg: color('surface.base.brand'), scheme: 'glass' },
  midnight: { bg: color('surface.base.midnight'), scheme: 'glass' },
  white: { bg: color('surface.base.inverse'), scheme: 'inverse' },
  none: { bg: 'transparent', scheme: 'default' },
};
/** `topbar-link` 38792:25385, state=default, as each header scheme instantiates it. */
const TOPBAR_LINK: Record<TopBarScheme, { bg: string; ink: string; glass: boolean }> = {
  glass: { bg: color('section-link.glass.inverse.surface.default'), ink: color('section-link.glass.inverse.icon.default'), glass: true },
  inverse: { bg: color('section-link.solid.inverse.surface.default'), ink: color('section-link.solid.inverse.icon.default'), glass: false },
  default: { bg: color('section-link.solid.default.surface.default'), ink: color('section-link.solid.default.icon.default'), glass: false },
};
/** topbar `wrapper` top-left/right radius. Unbound in Figma (38172:12163) and off the
 *  border-radius scale (/8 = 24, /9 = pill), so it is the symbol's literal. Design question. */
const TOPBAR_TOP_RADIUS = '36px';

function TopBarLink({ scheme, children }: { scheme: TopBarScheme; children: ReactNode }) {
  const l = TOPBAR_LINK[scheme];
  return (
    <span data-part="topbar-link" style={{
      width: scale('40'), height: scale('40'), borderRadius: PILL, flex: 'none', boxSizing: 'border-box',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: l.bg, color: l.ink, ...(l.glass ? GLASS_BLUR : {}),
    }}>{children}</span>
  );
}

/** Faux iOS status bar — Figma's remote `Status bar - iPhone` 26593:21834: 62 tall,
 *  padding 15/24/19/24, SF 17/22 clock. These are the iOS kit's values, not DSL tokens.
 *  The glyphs are monochrome and inherit currentColor so they sit on every surface. */
function StatusBar() {
  return (
    <div data-part="status-bar" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box',
      height: 62, padding: '15px 24px 19px', flex: 'none',
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif', fontSize: 17, lineHeight: '22px', fontWeight: 600,
    }}><span>9:41</span><StatusGlyphs /></div>
  );
}
function StatusGlyphs() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'currentColor' }}>
      <svg aria-hidden width={17} height={11} viewBox="0 0 17 11" fill="currentColor">
        <rect x={0} y={7.5} width={3} height={3.5} rx={1} />
        <rect x={4.7} y={5} width={3} height={6} rx={1} />
        <rect x={9.4} y={2.5} width={3} height={8.5} rx={1} />
        <rect x={14} y={0} width={3} height={11} rx={1} />
      </svg>
      <svg aria-hidden width={15} height={11} viewBox="0 0 15 11" fill="none">
        <path d="M1 3.6a9 9 0 0 1 13 0" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        <path d="M3.6 6.3a5.4 5.4 0 0 1 7.8 0" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        <circle cx={7.5} cy={9.3} r={1.3} fill="currentColor" />
      </svg>
      <svg aria-hidden width={25} height={12} viewBox="0 0 25 12" fill="none">
        <rect x={0.6} y={0.6} width={21} height={10.8} rx={3} stroke="currentColor" strokeOpacity={0.45} strokeWidth={1.2} />
        <rect x={2.2} y={2.2} width={17.8} height={7.6} rx={1.8} fill="currentColor" />
        <path d="M23.2 4.3a2.1 2.1 0 0 1 0 3.4Z" fill="currentColor" fillOpacity={0.45} />
      </svg>
    </span>
  );
}

/* `.topbar-title` 31539:6621 applies the heading/lg TEXT STYLE — 24 / 110% / snug — not the
   28px typography/heading/lg variables the standalone `Big title` symbol 29547:11486 binds.
   The topbar renders `.topbar-title`, so that is what this follows. Set explicitly so the
   value holds whatever ty('heading.lg') resolves to. 110% has no font/line-height token. */
const TOPBAR_TITLE: CSSProperties = {
  ...ty('heading.lg'),
  fontSize: T.font.size['7'], fontWeight: T.font.weight['700'] as any,
  lineHeight: '1.1', letterSpacing: T.font.letterSpacing.snug,
};

export function TopBar({
  surface, variant, statusBar, leading, onBack, logo, title, subtitle, account, greeting, actions, trailing,
  eyebrow, eyebrowChevron, bigTitle, subtext, chevron, actionBar, rounded, compact, style, children, ...rest
}: TopBarProps) {
  const acct = account ?? (greeting != null ? { greeting } : undefined);
  const asked = surface ?? variant;
  const surf: Exclude<TopBarSurface, 'default'> =
    asked === 'default' ? 'white' : asked ?? (bigTitle != null || acct != null ? 'brand' : 'white');
  const { bg, scheme } = TOPBAR_SURFACE[surf];
  const glass = scheme === 'glass';
  const ink = glass ? color('text.default.inverse') : color('text.default.default');
  const clamp = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const;
  const logoNode = logo === true
    ? <Logo version={glass ? 'white' : 'red'} type="lockup" size={scale('40')} />
    : logo;

  // Deprecated, code-only compact header — a single 56px row, no status bar.
  if (compact) {
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', height: 56, display: 'flex', alignItems: 'center', gap: space('md'), padding: `0 ${space('lg')}`, background: color('surface.canvas.default'), borderBottom: `1px solid ${color('border.surface-based.canvas.default')}`, ...style }} {...rest}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{leading}</div>
        {logo ? <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{logo === true ? <Logo version="red" type="lockup" size={scale('40')} /> : logo}</div>
          : <div style={{ flex: 1, minWidth: 0 }}><Text variant="title.md" style={clamp}>{title}</Text></div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: space('sm') }}>{(actions ?? []).map((a, i) => <TopBarLink key={i} scheme="inverse">{a}</TopBarLink>)}{trailing}</div>
      </header>
    );
  }

  const round = rounded !== false;
  const hasAddons = actionBar != null || children != null;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', boxSizing: 'border-box', padding: `${space('xs')} ${space('xs')} 0`, ...style }} {...rest}>
      <div data-part="topbar-surface" style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden', background: bg, color: ink,
        borderStartStartRadius: round ? TOPBAR_TOP_RADIUS : 0, borderStartEndRadius: round ? TOPBAR_TOP_RADIUS : 0,
        borderEndStartRadius: round ? radius('7') : 0, borderEndEndRadius: round ? radius('7') : 0,
        paddingBottom: space('lg'),
      }}>
        {statusBar !== false ? <StatusBar /> : null}

        {/* .topbar-header-schemes: left · centred middle · right. Equal side tracks keep the
            middle centred whatever the sides hold. */}
        <div data-part="topbar-header" style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center',
          minHeight: scale('40'), paddingInline: space('lg'),
        }}>
          <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: space('sm'), minWidth: 0 }}>
            {onBack ? (
              <button type="button" aria-label="Back" onClick={onBack} style={{
                width: scale('40'), height: scale('40'), flex: 'none', padding: 0, border: 0, borderRadius: PILL,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                // Glass: `button type=glass size=md`. Figma has no back button for the
                // white/none schemes; they reuse the topbar-link look (design question).
                ...(glass
                  ? { background: color('button.glass.surface.default'), color: color('button.glass.text.default'), ...GLASS_BLUR }
                  : { background: TOPBAR_LINK[scheme].bg, color: TOPBAR_LINK[scheme].ink }),
              }}>
                <span aria-hidden data-rtl-flip style={{ display: 'inline-flex' }}><Icon name="chevron-left" size={16} /></span>
              </button>
            ) : null}
            {leading}
            {acct ? (
              <div data-part="topbar-account" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                {acct.avatar != null ? (
                  <span style={{ width: scale('40'), height: scale('40'), borderRadius: PILL, overflow: 'hidden', flex: 'none', display: 'inline-flex', marginInlineEnd: space('sm') }}>{acct.avatar}</span>
                ) : null}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  {acct.greeting != null ? <Text variant="body.md" color={ink} as="div" style={clamp}>{acct.greeting}</Text> : null}
                  {acct.name != null ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('2xs'), minWidth: 0 }}>
                      {/* dir="auto": a digits-and-spaces number has no strong direction, so in an
                          RTL page the bidi algorithm would reverse its groups ("4567 123 050"). */}
                      <Text variant="title.sm" color={ink} style={clamp} dir="auto">{acct.name}</Text>
                      {chevron !== false ? <Chevron size={16} /> : null}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ justifySelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
            {logo ? logoNode : (
              <>
                {title != null ? <Text variant="title.sm" color={ink} as="div" style={clamp}>{title}</Text> : null}
                {subtitle != null ? <Text variant="body.md" color={ink} as="div" style={clamp}>{subtitle}</Text> : null}
              </>
            )}
          </div>

          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: space('sm') }}>
            {(actions ?? []).map((a, i) => <TopBarLink key={i} scheme={scheme}>{a}</TopBarLink>)}
            {trailing}
          </div>
        </div>

        {/* .topbar-title: padding 16/16/0/16 · overline row · title row (gap 4) · description pTop 8 */}
        {bigTitle != null || eyebrow != null ? (
          <div data-part="topbar-title" style={{ padding: `${space('lg')} ${space('lg')} 0` }}>
            {eyebrow != null ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text variant="body.md" color={ink}>{eyebrow}</Text>
                {eyebrowChevron ? <Chevron size={16} /> : null}
              </div>
            ) : null}
            {bigTitle != null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: space('xs') }}>
                <span style={{ ...TOPBAR_TITLE, color: ink, margin: 0 }}>{bigTitle}</span>
                {chevron ? <Chevron size={24} /> : null}
              </div>
            ) : null}
            {subtext != null ? (
              <div style={{ paddingTop: space('sm') }}><Text variant="body.lg" color={ink}>{subtext}</Text></div>
            ) : null}
          </div>
        ) : null}

        {/* add-ons: each `.topbar-*` add-on carries 16px top padding and 16px sides */}
        {hasAddons ? (
          <div data-part="topbar-addons" style={{ display: 'flex', flexDirection: 'column', gap: space('lg'), paddingTop: space('lg'), paddingInline: space('lg') }}>
            {actionBar ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm'), background: 'rgba(0,0,0,0.18)', borderRadius: radius('4'), padding: space('md') }}>
                <div style={{ minWidth: 0 }}>
                  <Text variant="title.sm" color="#fff" as="div">{actionBar.title}</Text>
                  {actionBar.subtitle ? <Text variant="body.sm" color="rgba(255,255,255,0.8)">{actionBar.subtitle}</Text> : null}
                </div>
                <span style={{ background: '#fff', color: color('text.brand.default'), borderRadius: PILL, padding: `8px ${space('lg')}`, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{actionBar.cta ?? 'Start'}</span>
              </div>
            ) : null}
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}

/* ---------------- Row surfaces (action-bar + list-item share them) ----------------
   `.surface-default` 26714:1802 / `.list-item-surface` 34586:21593 (light family) and
   `.surface-inverse` 26714:1796 / `.list-item-surface-inverse` 34586:21587 (inverse family).
   `glass` exists in both families — the scheme decides the ink. */
export type ActionBarSurface =
  | 'default' | 'subtle' | 'sunken' | 'white-transparent'
  | 'glass' | 'midnight-base' | 'midnight-raised' | 'midnight-transparent';
const ROW_SURFACE: Record<ActionBarSurface, { bg: string; blur: boolean; inverse: boolean }> = {
  default: { bg: color('surface.raised.default'), blur: false, inverse: false },
  subtle: { bg: color('surface.base.default'), blur: false, inverse: false },
  sunken: { bg: color('surface.sunken.default'), blur: false, inverse: false },
  glass: { bg: color('surface.glass.white.md'), blur: true, inverse: true },
  'midnight-base': { bg: color('surface.base.midnight'), blur: false, inverse: true },
  'midnight-raised': { bg: color('surface.raised.midnight'), blur: false, inverse: true },
  'midnight-transparent': { bg: color('surface.glass.midnight.md'), blur: false, inverse: true },
  'white-transparent': { bg: color('surface.glass.white.md'), blur: false, inverse: true },
};
const INK = {
  default: { title: color('text.default.default'), subtle: color('text.default.subtle') },
  inverse: { title: color('text.default.inverse'), subtle: color('text.default.inverse-subtle') },
} as const;

/* ---------------- ListRow ----------------
   Figma V1.2 `list-item` 34677:66964 (page 32159:151199). "A single data row" — price or
   info — and explicitly not a tap target ("use action-bar instead"), so it renders a <div>
   unless `onClick` is passed (back-compat), when it is a <button>.
     .list-item-scheme 34586:22409   inverse false|true
     .list-item-padding 34586:22304  padding=true: 16 all round on a surface (radius 20);
                                     padding=false: flat, 16 bottom only, no surface
     .list-item-core 37905:54931     gap 12 · Left-block gap 8 (logo ↔ content)
     .logo 34586:21599               40, radius 12; icon = glass/midnight/sm tile + 32 box
                                     (glass/white/sm on inverse); logo = surface/base/default
     .content 40868:18757            title/xs (+16px info tooltip glyph, gap 2) · body/md
                                     subtle · tertiary md button; gap 2
     .trailing 40868:18756           value title/xs over hint body/md subtle (+ badge), gap 2,
                                     end-aligned; chevron-right 16 in a 20 box; gap 4 */
export type ListRowType = 'info' | 'price';
export type ListRowSurface = ActionBarSurface;
export interface ListRowProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  /** Figma `type`. `info` (default) = padded card on a surface; `price` = flat line item. */
  type?: ListRowType;
  /** Figma `.list-item-scheme inverse` — white ink for dark or glass surroundings. */
  inverse?: boolean;
  /** Card surface (padded rows only). Light: default·subtle·sunken·glass. Inverse:
   *  glass·midnight-base·midnight-raised·midnight-transparent·white-transparent.
   *  Defaults to `default`, or `glass` when `inverse`. */
  surface?: ListRowSurface;
  /** Figma `.list-item-padding`. Defaults to `true` for info, `false` for price. */
  padding?: boolean;
  /** Leading glyph, shown in the 40px icon tile (Figma `.logo type=icon`). */
  icon?: ReactNode;
  /** Leading brand logo / art, 40px on surface/base/default (Figma `.logo type=logo`). */
  logo?: ReactNode;
  /** Title, title/xs. */
  label: ReactNode;
  /** Info glyph after the title (Figma `tooltip`). */
  tooltip?: boolean;
  /** Makes the tooltip glyph a button. Ignored when the row itself has `onClick`. */
  onTooltipClick?: () => void;
  /** Subtitle, body/md subtle. */
  sublabel?: ReactNode;
  /** Under the subtitle — a tertiary md `Button` (Figma `.content button`). */
  action?: ReactNode;
  /** Trailing first line, title/xs (e.g. "AED 20.00"). */
  value?: ReactNode;
  /** Trailing second line, body/md subtle. */
  hint?: ReactNode;
  /** Trailing badge under the value (Figma `badges-offers` md). */
  badge?: ReactNode;
  /** Trailing chevron-right. Default on. */
  chevron?: boolean;
}
export function ListRow({
  type = 'info', inverse, surface, padding, icon: glyph, logo, label, tooltip, onTooltipClick, sublabel, action,
  value, hint, badge, chevron = true, onClick, style, ...rest
}: ListRowProps) {
  const padded = padding ?? type === 'info';
  const s = ROW_SURFACE[surface ?? (inverse ? 'glass' : 'default')];
  const ink = INK[inverse ? 'inverse' : 'default'];
  // The props stay typed for a <button> (back-compat); a <div> is rendered unless onClick is set.
  const Root = (onClick ? 'button' : 'div') as 'div';
  const hasTrailing = value != null || hint != null || badge != null || chevron;
  const tip = tooltip ? (
    <IconBox size="md" style={{ color: ink.title }}><Icon name="info-filled" size={12} /></IconBox>
  ) : null;
  return (
    <Root data-part="list-row" onClick={onClick as HTMLAttributes<HTMLElement>['onClick']} {...(onClick ? { type: 'button' } : {})}
      style={{
        position: 'relative', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'stretch',
        gap: space('md'), margin: 0, border: 0, font: 'inherit', textAlign: 'start', color: ink.title,
        padding: padded ? space('lg') : `0 0 ${space('lg')}`,
        borderRadius: padded ? radius('7') : 0,
        background: padded ? s.bg : 'transparent', ...(padded && s.blur ? GLASS_BLUR : {}),
        cursor: onClick ? 'pointer' : undefined, ...style,
      }} {...(rest as HTMLAttributes<HTMLElement>)}>
      <span data-part="list-row-left" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: space('sm') }}>
        {glyph != null || logo != null ? (
          // `wrapper` stretches to the block and holds the 40px tile at its top.
          <span style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start', flex: 'none', minHeight: scale('40') }}>
            <span data-part="list-row-leading" style={{
              width: scale('40'), height: scale('40'), boxSizing: 'border-box', borderRadius: radius('4'), overflow: 'hidden',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              ...(logo != null
                ? { background: color('surface.base.default') }
                : { background: inverse ? color('surface.glass.white.sm') : color('surface.glass.midnight.sm'), padding: space('xs'), color: ink.title }),
            }}>
              {logo != null ? logo : <IconBox size="2xl">{glyph}</IconBox>}
            </span>
          </span>
        ) : null}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space('2xs') }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('2xs'), maxWidth: '100%' }}>
            <Text variant="title.xs" color={ink.title}>{label}</Text>
            {tip && onTooltipClick && !onClick ? (
              <button type="button" aria-label="More information" onClick={onTooltipClick}
                style={{ display: 'inline-flex', padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>{tip}</button>
            ) : tip}
          </span>
          {sublabel != null ? <Text variant="body.md" color={ink.subtle}>{sublabel}</Text> : null}
          {action != null ? <span style={{ display: 'inline-flex' }}>{action}</span> : null}
        </span>
      </span>
      {hasTrailing ? (
        <span style={{ flex: 'none', display: 'flex', alignItems: 'stretch', gap: space('xs') }}>
          {value != null || hint != null || badge != null ? (
            <span data-part="list-row-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: space('2xs'), textAlign: 'end' }}>
              {value != null ? <Text variant="title.xs" color={ink.title}>{value}</Text> : null}
              {hint != null ? <Text variant="body.md" color={ink.subtle}>{hint}</Text> : null}
              {badge}
            </span>
          ) : null}
          {chevron ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <IconBox size="lg" data-part="list-row-chevron" data-rtl-flip aria-hidden style={{ color: ink.title }}>
                <Icon name="chevron-right" size={16} />
              </IconBox>
            </span>
          ) : null}
        </span>
      ) : null}
    </Root>
  );
}

/* ---------------- NavBar (bottom nav) ----------------
   Figma V1.2 `navbar` 29317:6983: scrim padding-top 16 (spacing/lg), linear gradient
   midnight 0 → 40% @48% → 70% (unbound); `.navbar-scroll` 31239:84320 padding 0/16 (up) or
   0/48 (down, spacing/5xl — the bar narrows); `.navbar-profile` wrapper padding 0/4 on a
   pill of surface/glass/white/md + glass, no stroke; tabs grow equally with no gap.
   `.navbar-tab` 26593:20395: 32 icon box (24 glyph) over a body/xs 10/140% label, padding
   bottom 4; selected = 4px top/bottom wrapper around a white pill, label still Regular.
   Collapsed: labels hidden, pills 36, tabs stay equal width. Then a 34px home indicator. */
export interface NavItem { label: string; icon?: ReactNode; avatar?: ReactNode; active?: boolean; onClick?: () => void; }
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  items: NavItem[];
  /** Figma `.navbar-scroll` axis. `down` collapses to icons only (scrolled down);
   *  `up` (default) shows icon + label. Transitions are animated. */
  scrollDirection?: 'up' | 'down';
}
function NavTab({ it, collapsed }: { it: NavItem; collapsed?: boolean }) {
  const on = it.active;
  return (
    <button type="button" onClick={it.onClick} aria-current={on ? 'page' : undefined}
      style={{
        flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, alignSelf: 'stretch',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: `${space('xs')} 0`, border: 0, background: 'transparent', cursor: 'pointer',
        color: on ? color('navbar-tab.text.selected') : color('navbar-tab.text.default'),
      }}>
      <span data-part="navbar-pill" style={{
        width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: space('xs'), borderRadius: PILL, color: 'inherit',
        background: on ? color('navbar-tab.surface.selected') : 'transparent',
        transition: 'background 200ms ease',
      }}>
        <span style={{ display: 'inline-flex', width: icon('2xl'), height: icon('2xl'), alignItems: 'center', justifyContent: 'center', color: 'inherit', flex: 'none' }}>
          {it.avatar ?? it.icon ?? <Icon name="placeholder" size={24} />}
        </span>
        <span aria-hidden={collapsed || undefined} style={{
          ...ty('body.xs'), color: 'inherit', whiteSpace: 'nowrap',
          maxHeight: collapsed ? 0 : 14, opacity: collapsed ? 0 : 1, overflow: 'hidden',
          transition: 'max-height 260ms ease, opacity 180ms ease',
        }}>{it.label}</span>
      </span>
    </button>
  );
}
/** Floating glass nav over a midnight scrim: one frosted pill of equal tabs.
 *  Active tab = a solid white pill with red icon + label; inactive tabs are white on
 *  the glass. Collapses to icons only when scrolled down (Figma `scroll-direction`). */
export function NavBar({ items, scrollDirection = 'up', style, ...rest }: NavBarProps) {
  const collapsed = scrollDirection === 'down';
  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', paddingTop: space('lg'),
      background: 'linear-gradient(to bottom, rgba(25,19,41,0) 0%, rgba(25,19,41,0.4) 48%, rgba(25,19,41,0.7) 100%)',
      ...style,
    }} {...rest}>
      <div data-part="navbar-scroll" style={{ paddingInline: collapsed ? space('5xl') : space('lg'), transition: 'padding 280ms ease' }}>
        <div data-part="navbar-bar" style={{
          display: 'flex', alignItems: 'center', gap: 0, paddingInline: space('xs'), borderRadius: PILL,
          background: color('surface.glass.white.md'), ...GLASS_BLUR,
        }}>
          {items.map((it, i) => <NavTab key={i} it={it} collapsed={collapsed} />)}
        </div>
      </div>
      {/* .Home Indicator: a 34px block with the 144×5 bar 21px down (8 from the bottom). */}
      <span data-part="home-indicator" style={{ display: 'flex', justifyContent: 'center', boxSizing: 'border-box', height: 34, paddingTop: 21 }}>
        <span style={{ width: scale('144'), height: 5, borderRadius: PILL, background: color('surface.raised.default') }} />
      </span>
    </nav>
  );
}

/* ---------------- ActionBar ----------------
   Figma V1.2 `action-bar` 28201:38278 → `action-bar-scheme` 25627:23258 (72 tall, padding
   0/16, radius 20) → `.action-bar-core` 37482:10177 (gap 12: 40px `.image-asset` tile ·
   title/xs over body/md, both in the scheme ink · `.action-bar-trigger` 26714:1810
   chevron | button | switcher). `type=multiple` adds two `core/sm` glass layers. */
export type ActionBarColorScheme = 'default' | 'inverse';
export interface ActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'action'> {
  /** Primary line — `title.xs` (Figma limit ~18 chars). */
  title?: ReactNode;
  /** Secondary line — `body.md`, truncates with ellipsis (Figma limit ~21 chars). */
  subtitle?: ReactNode;
  /** Leading visual (icon or image) shown in a 40×40 tile. Omit for text at the leading edge. */
  icon?: ReactNode;
  /** Trailing action — typically a `<Button>`. Only one trailing trigger; do not combine with `chevron` or `switcher`. */
  action?: ReactNode;
  /** Show a trailing chevron instead of a button — the whole bar becomes the tap target. */
  chevron?: boolean;
  /** Trailing switcher (Figma `trigger=switcher`). `true`, or the `Switcher` props. */
  switcher?: boolean | SwitcherProps;
  /** Figma `color-scheme`: the ink. Defaults from `surface` — `inverse` for the dark/glass
   *  surfaces, else `default`. Set `default` with `surface="glass"` for the light-family glass. */
  colorScheme?: ActionBarColorScheme;
  /** Backing surface. Light family: `default`·`subtle`·`sunken`·`glass`; inverse family:
   *  `glass`·`white-transparent`·`midnight-base`·`midnight-raised`·`midnight-transparent`. */
  surface?: ActionBarSurface;
  /** @deprecated Use `colorScheme="inverse"` (or `surface="glass"`). */
  inverse?: boolean;
  /** Multiple-stack — layered "stacked cards" look. Inverse scheme only (Figma `type=multiple`). */
  stack?: boolean;
}
export function ActionBar({
  title, subtitle, icon: leading, action, chevron, switcher, colorScheme, surface, inverse, stack, onClick, style, ...rest
}: ActionBarProps) {
  const key: ActionBarSurface = surface ?? (colorScheme === 'inverse' || inverse ? 'glass' : 'default');
  const s = ROW_SURFACE[key];
  const scheme: ActionBarColorScheme = colorScheme ?? (inverse || s.inverse ? 'inverse' : 'default');
  const onDark = scheme === 'inverse';
  const ink = onDark ? color('text.default.inverse') : color('text.default.default');
  const tappable = chevron || !!onClick;
  const clamp = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;
  const showStack = !!stack && onDark;

  const trigger = chevron
    ? <IconBox size="xl" data-part="action-bar-chevron" data-rtl-flip aria-hidden style={{ color: ink }}><Icon name="chevron-right" size={20} /></IconBox>
    : switcher ? <span style={{ flex: 'none', display: 'inline-flex' }}><Switcher {...(typeof switcher === 'object' ? switcher : {})} /></span>
    : action != null ? <span style={{ flex: 'none', display: 'inline-flex' }}>{action}</span> : null;

  const bar = (
    <div data-part="action-bar" onClick={onClick} style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: space('md'),
      height: scale('72'), padding: `0 ${space('lg')}`, width: '100%', boxSizing: 'border-box',
      borderRadius: radius('7'), overflow: 'hidden', background: s.bg, ...(s.blur ? GLASS_BLUR : {}),
      cursor: tappable ? 'pointer' : undefined, ...(showStack ? {} : style),
    }} {...(showStack ? {} : rest)}>
      {leading != null ? (
        // `.image-asset` 26563:32026: 40, radius 12; white/a15 on inverse, surface/base/default otherwise.
        <span style={{
          flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: scale('40'), height: scale('40'), borderRadius: radius('4'), color: ink,
          background: onDark ? color('white.a15') : color('surface.base.default'),
          overflow: 'hidden', // clip a full-bleed image leading (`.image-asset type=image`)
        }}>{leading}</span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {title != null ? <Text variant="title.xs" color={ink} style={clamp}>{title}</Text> : null}
        {/* The description binds text/default/default | inverse — not subtle (design question:
            list-item binds its subtitle to subtle). */}
        {subtitle != null ? <Text variant="body.md" color={ink} style={clamp}>{subtitle}</Text> : null}
      </span>
      {trigger}
    </div>
  );

  if (!showStack) return bar;
  /* `type=multiple`: two `core/sm` layers — 64 tall, radius border-radius/6 (16), glass
     white/md + glass — inset 6 and 12 per side, auto-layout gap −54 so each peeks 10px
     below the one above (total 92). Reverse z-order: the bar is on top. The 6px inset and
     the offsets are the symbol's geometry, not tokens. */
  const layer = (top: number, inset: string) => (
    <div aria-hidden data-part="action-bar-layer" style={{
      position: 'absolute', top, insetInline: inset, height: scale('64'),
      borderRadius: radius('6'), background: color('surface.glass.white.md'), ...GLASS_BLUR,
    }} />
  );
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: space('xl'), ...style }} {...rest}>
      {layer(28, space('md'))}
      {layer(18, '6px')}
      <div style={{ position: 'relative' }}>{bar}</div>
    </div>
  );
}

/* ---------------- SectionLink (section header row) ----------------
   Code-only: Figma V1.2 publishes no composed title + "See all" row (design question q8).
   Kept as is; inside a Section prefer the Section header + `SectionLinkButton`. */
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
        {/* Was a literal "›" character standing in for a glyph the icon set has. */}
        <span data-rtl-flip style={{ display: 'inline-flex' }}><Icon name="chevron-right-sm" size={16} /></span>
      </button>
    </div>
  );
}

/* ---------------- QuickAction (shortcut grid) ----------------
   Figma `quick-action` 27962:37107 (page 25507:13670): `grid` 2-up or `carousel` (a
   horizontal scroll of 147px cells; 3 visible in a 449 frame), gap 4. Cells are
   `.quick-action-core` 28365:37221: 148 tall, padding 12, radius 20, surface/raised/default;
   header = 40px icon tile (surface/base/default, radius 12, 32 box / 24 glyph) + the badge,
   end-aligned (`badges-status` lg); title/sm label at the bottom. Tasks come from a fixed
   catalogue of 13 types (`.quick-action-variants` 27917:8012). */
export type QuickActionType =
  | 'quick-pay' | 'order-track' | 'sim-activate' | 'sim-replace' | 'addon-buy' | 'devices'
  | 'device-buy' | 'plan-change' | 'live-chat' | 'contact-us' | 'subscriptions' | 'mParking' | 'all-services';
/** Figma `.quick-action-variants` 27917:8012 → label + `.quick-action-icons` 27915:4453 glyph (filled). */
export const QUICK_ACTION_PRESETS: Record<QuickActionType, { label: string; icon: string }> = {
  'quick-pay': { label: 'Quick Pay & Recharge', icon: 'card-filled' },
  'order-track': { label: 'Track Your Order', icon: 'delivery-filled' },
  'sim-activate': { label: 'Activate SIM', icon: 'sim-filled' },
  'sim-replace': { label: 'Replace SIM', icon: 'sim-filled' },
  'addon-buy': { label: 'Buy Add-ons', icon: 'puzzle-filled' },
  devices: { label: 'My Devices', icon: 'devices-filled' },
  'device-buy': { label: 'Buy Devices', icon: 'shop-filled' },
  'plan-change': { label: 'Change Plan', icon: 'swap-filled' },
  'live-chat': { label: 'Live Chat', icon: 'chat-typing-filled' },
  'contact-us': { label: 'Contact us', icon: 'support-agent-filled' },
  subscriptions: { label: 'Subscriptions', icon: 'refresh-filled' },
  mParking: { label: 'mParking', icon: 'car-filled' },
  'all-services': { label: 'All Services', icon: 'grid-filled' },
};
export interface QuickActionItem {
  /** A catalogue task; fills `label` and `icon` unless you pass them. */
  type?: QuickActionType;
  label?: string;
  icon?: ReactNode;
  /** Typically `<Badge status="positive" size="lg">` (Figma `badges-status` lg). */
  badge?: ReactNode;
  onClick?: () => void;
}
export interface QuickActionProps extends HTMLAttributes<HTMLDivElement> {
  items: QuickActionItem[];
  /** Figma `grid` (default) or `carousel` (horizontal scroll, 147px cells). */
  layout?: 'grid' | 'carousel';
  /** Grid columns (Figma `grid` is 2-up). */
  columns?: number;
  /** Carousel rows (Figma `rows`). */
  rows?: number;
}
/** Figma carousel cell width (`.quick-action-core carousel=true`); off the scale, so literal. */
const QA_CAROUSEL_CELL = '147px';
export function QuickAction({ items, layout = 'grid', columns = 2, rows = 1, style, ...rest }: QuickActionProps) {
  const carousel = layout === 'carousel';
  return (
    <div style={{
      display: 'grid', gap: space('xs'), width: '100%',
      ...(carousel
        ? { gridAutoFlow: 'column', gridAutoColumns: QA_CAROUSEL_CELL, gridTemplateRows: `repeat(${rows}, auto)`, overflowX: 'auto' }
        : { gridTemplateColumns: `repeat(${columns}, 1fr)` }),
      ...style,
    }} {...rest}>
      {items.map((it, i) => {
        const preset = it.type ? QUICK_ACTION_PRESETS[it.type] : undefined;
        const label = it.label ?? preset?.label;
        const glyph = it.icon ?? (preset ? <Icon name={preset.icon} size={24} /> : <Icon name="placeholder" size={24} />);
        return (
          <button key={i} type="button" onClick={it.onClick}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minHeight: rowHeight('row-2'), padding: space('md'), borderRadius: radius('7'), border: 0, background: color('surface.raised.default'), cursor: 'pointer', textAlign: 'start', font: 'inherit' }}>
            {/* Header row: icon tile with the status badge beside it, in flow. */}
            <span data-part="qa-badge" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: space('sm'), width: '100%' }}>
              <span style={{ width: scale('40'), height: scale('40'), flex: 'none', borderRadius: radius('4'), background: color('surface.base.default'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: color('text.default.default') }}>
                {glyph}
              </span>
              {it.badge ?? null}
            </span>
            <Text variant="title.sm">{label}</Text>
          </button>
        );
      })}
    </div>
  );
}
