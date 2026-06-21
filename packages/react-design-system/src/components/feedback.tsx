import type { HTMLAttributes, ReactNode } from 'react';
import { color, space } from '../system';
import { Text, Icon, ProgressBar } from './primitives';

export type StatusTone = 'info' | 'positive' | 'warning' | 'danger';
const TONE_COLOR: Record<StatusTone, string> = {
  info: color('status.default'), positive: color('status.positive'),
  warning: color('status.warning'), danger: color('status.danger'),
};
const TONE_ICON: Record<StatusTone, string> = { info: 'ℹ', positive: '✓', warning: '!', danger: '✕' };

/* ---------------- PlanUsageBar ---------------- */
export interface PlanUsageBarProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  used: number;
  total: number;
  unit?: string;
}
export function PlanUsageBar({ label = 'Data', used, total, unit = 'GB', style, ...rest }: PlanUsageBarProps) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const tone: StatusTone = pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'positive';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%', ...style }} {...rest}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text variant="title.xs">{label}</Text>
        <Text variant="body.sm" color={color('text.default.muted')}>{used} / {total} {unit}</Text>
      </div>
      <ProgressBar value={pct} tone={tone === 'positive' ? 'accent' : tone} />
    </div>
  );
}

/* ---------------- Snackbar / Alert message ---------------- */
export interface SnackbarProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone;
  message: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}
export function Snackbar({ tone = 'info', message, action, onDismiss, style, ...rest }: SnackbarProps) {
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', gap: space('sm'), width: '100%', boxSizing: 'border-box',
      padding: space('md'), borderRadius: 12, background: color('surface.overlay.floating-inverse'),
      color: color('text.default.inverse'), ...style,
    }} {...rest}>
      <span style={{ color: TONE_COLOR[tone] }}><Icon size="sm">{TONE_ICON[tone]}</Icon></span>
      <Text variant="body.md" color={color('text.default.inverse')} style={{ flex: 1 }}>{message}</Text>
      {action ? <Text variant="button.sm" color={color('text.brand.subtle')}>{action}</Text> : null}
      {onDismiss ? <button onClick={onDismiss} aria-label="Dismiss" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}><Icon size="sm">✕</Icon></button> : null}
    </div>
  );
}

/* ---------------- AlertModal ---------------- */
export interface AlertModalProps {
  open?: boolean;
  tone?: StatusTone;
  title?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}
export function AlertModal({ open = true, tone = 'info', title, body, actions, onDismiss }: AlertModalProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onDismiss}
      style={{ position: 'fixed', inset: 0, background: color('surface.overlay.scrim'), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: space('lg'), zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 360, background: color('surface.raised.default'), borderRadius: 20, padding: space('xl'), display: 'flex', flexDirection: 'column', gap: space('md') }}>
        <span style={{ color: TONE_COLOR[tone] }}><Icon size="xl">{TONE_ICON[tone]}</Icon></span>
        {title ? <Text variant="heading.sm">{title}</Text> : null}
        {body ? <Text variant="body.md" color={color('text.default.subtle')}>{body}</Text> : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space('sm'), marginTop: space('sm') }}>{actions}</div>
      </div>
    </div>
  );
}
