import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { color, space, ty, radius, T, PILL } from '../system';
import { Text, IconBox } from './primitives';

/* ---------------- StatusRibbon ----------------
   Full-width status strip shown above a CTA footer (Figma V1.1 `status-ribbon`,
   set 31577:2612). 40px tall, message left, optional action right. */
export type StatusRibbonStatus = 'success' | 'alert' | 'warning' | 'info';
// Figma vars color/alert-message/{surface,text}/<status> — not yet in the generated
// tokens.ts (variables.json export predates the alert-message group), values from live Figma.
const RIBBON: Record<StatusRibbonStatus, { bg: string; fg: string }> = {
  success: { bg: '#c1f7d0', fg: '#164025' },
  alert:   { bg: '#ffecab', fg: '#55481d' },
  warning: { bg: '#ffc28b', fg: '#612a05' },
  info:    { bg: '#e4e3ea', fg: '#191329' },
};
export interface StatusRibbonProps extends HTMLAttributes<HTMLDivElement> {
  status?: StatusRibbonStatus;
  leadingIcon?: ReactNode;
  /** Trailing action label (tap target spans the label + icon). */
  action?: ReactNode;
  trailingIcon?: ReactNode;
  onAction?: () => void;
}
export function StatusRibbon({ status = 'info', leadingIcon, action, trailingIcon, onAction, style, children, ...rest }: StatusRibbonProps) {
  const c = RIBBON[status];
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', gap: space('sm'), width: '100%', boxSizing: 'border-box',
      height: T.scale?.['40'] ?? 40, padding: `0 ${space('lg')}`, background: c.bg, color: c.fg, ...style,
    }} {...rest}>
      {leadingIcon ? <IconBox size="lg" style={{ color: c.fg }}>{leadingIcon}</IconBox> : null}
      <Text variant="title.xs" color={c.fg} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</Text>
      {action != null ? (
        <button onClick={onAction} style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs'), border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: c.fg, ...ty('body.md') }}>
          {action}{trailingIcon ? <IconBox size="lg">{trailingIcon}</IconBox> : null}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- ButtonGroup ----------------
   CTA button arrangements (Figma `button-group-vertical` 31617:958 /
   `button-group-horizontal` 31617:1293). Variants map to which slots are filled:
   Primary / Primary+Secondary / Primary+Tertiary / Primary+Secondary+Tertiary. */
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `vertical` stacks the buttons; `horizontal` puts secondary+primary side by side
   *  (Figma `button-stack` vertical<->horizontal axis, 31617:1409). */
  orientation?: 'vertical' | 'horizontal';
  primary: ReactNode;
  secondary?: ReactNode;
  /** Tertiary/link action — always renders on its own centered row. */
  tertiary?: ReactNode;
}
export function ButtonGroup({ orientation = 'vertical', primary, secondary, tertiary, style, ...rest }: ButtonGroupProps) {
  const stretch: CSSProperties = { display: 'flex', flexDirection: 'column' };
  const row: CSSProperties = { display: 'flex', gap: space('md') };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space('md'), width: '100%', ...style }} {...rest}>
      {orientation === 'horizontal' && secondary != null ? (
        <div style={row}>
          <div style={{ ...stretch, flex: 1, minWidth: 0 }}>{secondary}</div>
          <div style={{ ...stretch, flex: 1, minWidth: 0 }}>{primary}</div>
        </div>
      ) : (
        <>
          <div style={stretch}>{primary}</div>
          {secondary != null ? <div style={stretch}>{secondary}</div> : null}
        </>
      )}
      {tertiary != null ? <div style={{ display: 'flex', justifyContent: 'center' }}>{tertiary}</div> : null}
    </div>
  );
}

/* ---------------- PaymentRow ----------------
   Payment-method summary used in the CTA `action-block` (Figma Payment=yes, 31617:1498):
   40px method tile + masked number + change link, with the confirm button beside it. */
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
    <div style={{ display: 'flex', alignItems: 'center', gap: space('sm'), ...style }} {...rest}>
      {icon != null ? (
        <span style={{ width: 40, height: 40, borderRadius: radius('3'), overflow: 'hidden', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: color('surface.base.default') }}>{icon}</span>
      ) : null}
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space('2xs'), minWidth: 0 }}>
        <Text variant="title.xs" style={{ whiteSpace: 'nowrap' }}>{label}</Text>
        {actionLabel != null ? (
          <button onClick={onAction} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: color('text.brand.default'), ...ty('button.md') }}>{actionLabel}</button>
        ) : null}
      </span>
    </div>
  );
}

/* ---------------- CtaFooter ----------------
   Sticky bottom CTA bar (Figma V1.1 CTA footer, page 31501:35139). Slots stack:
   ribbon (full-bleed) → price row → terms row → payment+actions → home indicator.
   20px side padding, 12px button gap per Figma specs. */
export interface CtaFooterPrice { label: ReactNode; value: ReactNode; note?: ReactNode; }
export interface CtaFooterProps extends HTMLAttributes<HTMLElement> {
  /** Status strip across the very top (use <StatusRibbon/>). */
  ribbon?: ReactNode;
  /** Total row: label left, price right (Figma `price` atom). */
  price?: CtaFooterPrice;
  /** Terms row content rendered beside a checkbox slot — pass the checkbox+label
   *  yourself (e.g. <Checkbox label={...}/>) so state stays with the caller. */
  terms?: ReactNode;
  /** Payment-method summary (use <PaymentRow/>); renders beside the actions. */
  payment?: ReactNode;
  /** CTA buttons (use <ButtonGroup/> or a block <Button/>). */
  actions: ReactNode;
  /** iOS home-indicator strip below the actions (Figma footer variants include it). */
  homeIndicator?: boolean;
  /** Round the top corners (when the footer floats over page content). */
  rounded?: boolean;
}
export function CtaFooter({ ribbon, price, terms, payment, actions, homeIndicator, rounded, style, ...rest }: CtaFooterProps) {
  const pad = space('xl'); // 20px side padding per Figma
  return (
    <footer style={{
      position: 'sticky', bottom: 0, zIndex: 10, width: '100%', boxSizing: 'border-box',
      background: color('surface.canvas.default'), overflow: 'hidden',
      borderTopLeftRadius: rounded ? radius('7') : 0, borderTopRightRadius: rounded ? radius('7') : 0,
      ...style,
    }} {...rest}>
      {ribbon}
      {price ? (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space('sm'), padding: `${pad} ${pad} 0` }}>
          <Text variant="body.md" color={color('text.default.subtle')}>{price.label}</Text>
          <span style={{ textAlign: 'right' }}>
            <Text variant="title.sm" as="div">{price.value}</Text>
            {price.note ? <Text variant="body.sm" color={color('text.default.muted')}>{price.note}</Text> : null}
          </span>
        </div>
      ) : null}
      {terms ? <div style={{ display: 'flex', alignItems: 'center', padding: `${pad} ${pad} 0` }}>{terms}</div> : null}
      <div style={payment
        ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), padding: `${space('lg')} ${pad}` }
        : { padding: `${space('lg')} ${pad}` }}>
        {payment}
        <div style={{ flex: payment ? 'none' : undefined, ...(payment ? {} : { width: '100%' }) }}>{actions}</div>
      </div>
      {homeIndicator ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: space('sm') }}>
          <span aria-hidden style={{ width: 144, height: 5, borderRadius: PILL, background: color('surface.base.midnight') }} />
        </div>
      ) : null}
    </footer>
  );
}
