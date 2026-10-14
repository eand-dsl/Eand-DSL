import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { color, space, ty, radius, scale, T, PILL } from '../system';
import { Text, IconBox } from './primitives';
import { Button } from './Button/Button';
import { Checkbox, ConsentCheckbox, type CheckboxProps } from './controls';

/* Everything in this file is reconciled against Figma "e& Consumer App DSL V1.2",
   CTA Bar page 31501:35139 (changelog 27.07.2026: "Added molecules: Price Line,
   Checkbox Line, To Action Block"; 23.07.2026: the `surface` boolean). */

/* Figma's tertiary and link buttons at size md hug their label with no padding
   (`button type=tertiary size=md` 25440:1532 is 44x18, `type=link size=md` 25440:2261 is
   43x20). `Button` still gives every type a fixed 40px height, side padding and a 2px
   transparent border, which turns an inline text action into a 40px box. These buttons
   sit inside text rows here, so reset only the box; colour and type stay Button's. */
const INLINE_BUTTON: CSSProperties = { height: 'auto', padding: 0, border: 0 };

/* ---------------- StatusRibbon ----------------
   `.status-ribbon` 31577:2612 (RTL twin 38351:30443, a mirror: handled by `dir`).
   40px (`scale/40`) strip, SPACE_BETWEEN, padding 4/20 (`spacing/xs` / `spacing/xl`), gap 4.
   Leading `icon-size xl` box (24) + title/xs label, gap 4. Trailing action is a
   `button type=link size=md scheme=midnight`: body/md in button/link/text/midnight, gap 0. */
export type StatusRibbonStatus = 'success' | 'alert' | 'warning' | 'info';
// Figma vars color/alert-message/{surface,text}/<status>.
const RIBBON: Record<StatusRibbonStatus, { bg: string; fg: string }> = {
  success: { bg: color('alert-message.surface.success'), fg: color('alert-message.text.success') },
  alert:   { bg: color('alert-message.surface.alert'), fg: color('alert-message.text.alert') },
  warning: { bg: color('alert-message.surface.warning'), fg: color('alert-message.text.warning') },
  info:    { bg: color('alert-message.surface.info'), fg: color('alert-message.text.info') },
};
export interface StatusRibbonProps extends HTMLAttributes<HTMLDivElement> {
  status?: StatusRibbonStatus;
  /** Leading glyph, drawn in a 24px box (Figma `show-icon`). */
  leadingIcon?: ReactNode;
  /** Trailing action label (Figma `show-action`); the tap target spans the label + icon. */
  action?: ReactNode;
  trailingIcon?: ReactNode;
  onAction?: () => void;
}
export function StatusRibbon({ status = 'info', leadingIcon, action, trailingIcon, onAction, style, children, ...rest }: StatusRibbonProps) {
  const c = RIBBON[status];
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('xs'),
      width: '100%', boxSizing: 'border-box', height: scale('40'),
      paddingBlock: space('xs'), paddingInline: space('xl'), background: c.bg, color: c.fg, ...style,
    }} {...rest}>
      <span style={{ display: 'flex', alignItems: 'center', gap: space('xs'), flex: '1 1 auto', minWidth: 0 }}>
        {leadingIcon ? <IconBox size="xl" style={{ color: c.fg }}>{leadingIcon}</IconBox> : null}
        <Text variant="title.xs" color={c.fg} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</Text>
      </span>
      {action != null ? (
        <button type="button" onClick={onAction} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0px', flex: 'none', border: 0, background: 'transparent',
          cursor: 'pointer', padding: 0, color: color('button.link.text.midnight.default'), ...ty('body.md'),
        }}>
          {action}{trailingIcon ? <IconBox size="lg">{trailingIcon}</IconBox> : null}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- ButtonGroup ----------------
   CTA button arrangements: `.button-group-vertical` 31617:958 (gap 20, `spacing/xl`) and
   `.button-group-horizontal` 31617:1293 (gap 12, `spacing/md`, row and column), wrapped by
   `.button-stack` 31617:1409 whose `horizontal` axis is `orientation`. RTL twins
   (38351:32628 / 32816 / 32935) are mirrors: the flex row follows `dir`.
   Variants map to which slots are filled: Primary / +Secondary / +Tertiary / all three.
   The Figma groups carry 20/20/0/20 padding; in code that is ActionBlock's job. */
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `vertical` stacks the buttons; `horizontal` puts secondary+primary side by side
   *  (Figma `button-stack` horizontal false|true, 31617:1409). */
  orientation?: 'vertical' | 'horizontal';
  primary: ReactNode;
  secondary?: ReactNode;
  /** Tertiary/link action — always renders on its own centered row. */
  tertiary?: ReactNode;
}
export function ButtonGroup({ orientation = 'vertical', primary, secondary, tertiary, style, ...rest }: ButtonGroupProps) {
  const gap = orientation === 'horizontal' ? space('md') : space('xl');
  const stretch: CSSProperties = { display: 'flex', flexDirection: 'column' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%', ...style }} {...rest}>
      {orientation === 'horizontal' && secondary != null ? (
        <div style={{ display: 'flex', gap: space('md') }}>
          <div style={{ ...stretch, flex: 1, minWidth: 0 }}>{secondary}</div>
          <div style={{ ...stretch, flex: 1, minWidth: 0 }}>{primary}</div>
        </div>
      ) : (
        <>
          <div style={stretch}>{primary}</div>
          {secondary != null ? <div style={stretch}>{secondary}</div> : null}
        </>
      )}
      {/* Figma's tertiary row is full width with spacing/sm above and below (37px for a 21px
          label) — it matters now that Button tertiary hugs its text. */}
      {tertiary != null ? <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: space('sm') }}>{tertiary}</div> : null}
    </div>
  );
}

/* ---------------- PaymentRow ----------------
   The payment molecule of `.action-block payment=true` 31617:1498: H gap 12 (`spacing/md`).
   `.image-asset` 40x40 (`scale/40`) clipped at radius 8 (`border-radius/3`) on
   `surface/base/default`; text block V gap 4 (`spacing/xs`): body/md masked number in
   text/default/default over a `button type=tertiary size=md` ("Change"). */
export interface PaymentRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Payment method tile (logo/image); clipped to a 40x40 rounded square. */
  icon?: ReactNode;
  /** Masked identifier, e.g. "•••• 4326". */
  label: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
}
export function PaymentRow({ icon, label, actionLabel = 'Change', onAction, style, ...rest }: PaymentRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space('md'), minWidth: 0, ...style }} {...rest}>
      {icon != null ? (
        <span style={{ width: scale('40'), height: scale('40'), borderRadius: radius('3'), overflow: 'hidden', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: color('surface.base.default') }}>{icon}</span>
      ) : null}
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space('xs'), minWidth: 0 }}>
        {/* nowrap: in a CtaFooter the confirm button keeps its half, so this column absorbs
            the squeeze and a masked number must not break mid-token ("••••" over "4326"). */}
        <Text variant="body.md" style={{ whiteSpace: 'nowrap' }}>{label}</Text>
        {actionLabel != null ? (
          <Button variant="tertiary" size="md" onClick={onAction} style={INLINE_BUTTON}>{actionLabel}</Button>
        ) : null}
      </span>
    </div>
  );
}

/* ---------------- PriceLine ----------------
   `price-line` 33496:60459. Padding 0/20 (`spacing/xl`) around a `.list-item-core` with
   top padding 12 (`spacing/md`) and gap 12, top-aligned. Leading: body/md label in
   text/default/subtle over an optional `button type=tertiary size=md` (label + 20px
   trailing icon), gap 2. Trailing: the price in title/xs text/default/default, end-aligned.
   The description mentions an original/strikethrough price, but the symbol has no such
   layer, so none is drawn here. */
export interface PriceLineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  value: ReactNode;
  /** Tertiary button under the label (Figma `button type=tertiary size=md`). */
  actionLabel?: ReactNode;
  onAction?: () => void;
  /** Trailing icon inside the tertiary button (Figma's 20px `.button-icon`). */
  actionIcon?: ReactNode;
  /** @deprecated Code-only: `price-line` 33496:60459 has no note under the value. Still
   *  renders (body.sm, muted) so existing screens keep working; prefer `actionLabel`. */
  note?: ReactNode;
}
export function PriceLine({ label, value, actionLabel, onAction, actionIcon, note, style, ...rest }: PriceLineProps) {
  return (
    <div data-slot="price-line" style={{
      display: 'flex', alignItems: 'flex-start', gap: space('md'), width: '100%', boxSizing: 'border-box',
      paddingTop: space('md'), paddingInline: space('xl'), ...style,
    }} {...rest}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space('2xs'), flex: '1 1 auto', minWidth: 0 }}>
        <Text variant="body.md" color={color('text.default.subtle')}>{label}</Text>
        {actionLabel != null ? (
          <Button variant="tertiary" size="md" onClick={onAction} trailingIcon={actionIcon} style={INLINE_BUTTON}>{actionLabel}</Button>
        ) : null}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: space('2xs'), flex: 'none', textAlign: 'end' }}>
        <Text variant="title.xs">{value}</Text>
        {note ? <Text variant="body.sm" color={color('text.default.muted')}>{note}</Text> : null}
      </span>
    </div>
  );
}

/* ---------------- CheckboxLine ----------------
   The "checkbox line" of the action block: `checkbox-variants` 33489:12153 (inverse ×
   selected × disabled) over `.checkbox-core-variants-core` 38351:31883 (ltr|rtl mirror).
   A md checkbox, gap 8, then one wrapping body/md run: title ("Agree to") → link-1 →
   "and" → link-2 → description ("before proceeding"). Links are `button type=link size=md`.
   Copy ink: text/default/{default,disabled}; inverse text/default/inverse-{subtle,disabled}.
   Links: button/link/text/brand/*; inverse button/link/text/inverse/*. */
export interface CheckboxLineLink {
  label: ReactNode;
  onClick?: () => void;
}
export interface CheckboxLineProps extends Omit<CheckboxProps, 'label' | 'radio' | 'size'> {
  /** Lead-in copy before the links (Figma `title-string`, e.g. "Agree to the"). */
  label?: ReactNode;
  /** One or two inline link buttons (Figma `link-1`, `link-2`), e.g. Terms, Privacy Policy. */
  links?: CheckboxLineLink[];
  /** Word placed between links (Figma's "and"). */
  conjunction?: ReactNode;
  /** Trailing copy after the links (Figma `description-string`, e.g. "before proceeding"). */
  description?: ReactNode;
}
/** @deprecated Use `ConsentCheckbox` from the controls — the same Figma `checkbox-variants`
 *  33489:12153 consent row, built twice in parallel during the V1.2 sync. This keeps the
 *  `label` / `description` names and renders the one implementation. */
export function CheckboxLine({ label, links = [], conjunction = 'and', description, ...rest }: CheckboxLineProps) {
  return <ConsentCheckbox prefix={label} links={links} conjunction={conjunction} suffix={description} {...rest} />;
}

/* ---------------- ActionBlock ----------------
   `.action-block` 31617:1499. Axes: show-status-ribbon, price-line, checkbox-line
   (booleans → the `ribbon`, `price`, `terms` slots), payment false|true (→ `payment`), and
   direction ltr|rtl (→ the document `dir`; every row is a flex row or symmetric padding).
   Order: status ribbon → price-line → checkbox line → actions. No bottom padding of its
   own: in `cta-bar` the 34px home indicator supplies it.
   - checkbox line: padding 16/20/0/20 (`spacing/lg`, `spacing/xl`)
   - actions, payment=false: `.button-group-vertical` padding 20/20/0/20
   - actions, payment=true (`Actions` row): padding 16/20/0/20, gap 2 (`spacing/2xs`), the
     payment frame and the lg primary button each take half (168 / 166 of 335). */
export interface CtaFooterPrice {
  label: ReactNode;
  value: ReactNode;
  /** Tertiary button under the label (Figma `price-line`). */
  actionLabel?: ReactNode;
  onAction?: () => void;
  actionIcon?: ReactNode;
  /** @deprecated Code-only; `price-line` has no note under the value. */
  note?: ReactNode;
}
export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Status strip across the very top (use <StatusRibbon/>). */
  ribbon?: ReactNode;
  /** Price summary, rendered as a <PriceLine/>. */
  price?: CtaFooterPrice;
  /** Checkbox line — pass a <CheckboxLine/> (or a <Checkbox/>) so state stays with the caller. */
  terms?: ReactNode;
  /** Payment-method summary (use <PaymentRow/>); renders beside the actions, half each. */
  payment?: ReactNode;
  /** CTA buttons (use <ButtonGroup/> or a block <Button/>). */
  actions: ReactNode;
}
export function ActionBlock({ ribbon, price, terms, payment, actions, style, ...rest }: ActionBlockProps) {
  const inline = space('xl');
  return (
    <div data-slot="action-block" style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }} {...rest}>
      {ribbon}
      {price ? <PriceLine {...price} /> : null}
      {terms ? <div style={{ display: 'flex', alignItems: 'center', padding: `${space('lg')} ${inline} 0` }}>{terms}</div> : null}
      {payment ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: space('2xs'), padding: `${space('lg')} ${inline} 0` }}>
          <div style={{ flex: '1 1 0px', minWidth: 0, display: 'flex', alignItems: 'center' }}>{payment}</div>
          <div style={{ flex: '1 1 0px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>{actions}</div>
        </div>
      ) : (
        <div style={{ padding: `${space('xl')} ${inline} 0` }}>{actions}</div>
      )}
    </div>
  );
}

/* ---------------- CtaFooter ----------------
   `cta-bar` 31617:1007: radius 24/24/0/0 (`border-radius/8`), an absolute `surface`
   32934:71710 (fill surface/base/inverse, `shadow/md` effect style bound to
   effects/shadow/md/* + color/midnight/a10), the `.action-block`, then `.Home Indicator`.
   Props: `surface` (default true; false = no fill, no shadow, for a bar sitting on a surface
   that already separates it) and `home-indicator` (default true). No top border. */
const SHADOW_MD = (() => {
  const s = T.effects.shadow.md;
  return `${s.positionX} ${s.positionY} ${s.blur} ${s.spread} ${s.color}`;
})();
export interface CtaFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>, Pick<ActionBlockProps, 'ribbon' | 'price' | 'terms' | 'payment' | 'actions'> {
  /** iOS home-indicator block below the actions (Figma `home-indicator`, default true).
   *  It is also the bar's only bottom spacing: with it off the actions sit flush, as in
   *  the symbol. */
  homeIndicator?: boolean;
  /** Round the top corners (24px). Figma's `cta-bar` always does; pass `false` for a flush edge. */
  rounded?: boolean;
  /** White card + `shadow/md` (Figma `surface`, default true). `false` = transparent, no shadow. */
  surface?: boolean;
}
export function CtaFooter({ ribbon, price, terms, payment, actions, homeIndicator = true, rounded = true, surface = true, style, ...rest }: CtaFooterProps) {
  const r = rounded ? radius('8') : 0;
  return (
    <footer style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: surface ? color('surface.base.inverse') : 'transparent',
      boxShadow: surface ? SHADOW_MD : 'none',
      borderStartStartRadius: r, borderStartEndRadius: r,
      ...style,
    }} {...rest}>
      <ActionBlock ribbon={ribbon} price={price} terms={terms} payment={payment} actions={actions} />
      {homeIndicator ? (
        /* `.Home Indicator` 31617:975 is the iOS kit's 375x34 block with a 144x5 bar 8px off
           the bottom. 34 and 5 are unbound kit values (no `scale/*` step), and the bar fill is
           the kit's `Labels/Primary` #000, which is not a DSL token, so both are literal. */
        <div data-slot="home-indicator" aria-hidden style={{
          height: 34, flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', paddingBottom: space('sm'),
        }}>
          <span style={{ width: scale('144'), height: 5, borderRadius: PILL, background: '#000000' }} />
        </div>
      ) : null}
    </footer>
  );
}
