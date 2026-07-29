import type { HTMLAttributes, ReactNode } from 'react';
import { color, space, radius, PILL } from '../system';
import { Text, IconBox } from './primitives';

/* ---------------- Tooltip ---------------- */
export interface TooltipProps {
  content: ReactNode;
  visible?: boolean;
  placement?: 'top' | 'bottom';
  children: ReactNode;
}
export function Tooltip({ content, visible = false, placement = 'top', children }: TooltipProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {visible ? (
        <span role="tooltip" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 8px)',
          background: color('surface.overlay.floating-inverse'), color: color('text.default.inverse'),
          // Figma Tooltip (30643:2117): radius border-radius/3 = 12 (was 8).
          padding: `${space('xs')} ${space('sm')}`, borderRadius: radius('3'), whiteSpace: 'nowrap', zIndex: 50,
        } as any}>
          <Text variant="body.sm" color={color('text.default.inverse')}>{content}</Text>
        </span>
      ) : null}
    </span>
  );
}

/* ---------------- BottomSheet ---------------- */
export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  title?: ReactNode;
  footer?: ReactNode;
  onDismiss?: () => void;
}
export function BottomSheet({ open = true, title, footer, onDismiss, style, children, ...rest }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div onClick={onDismiss} style={{ position: 'fixed', inset: 0, background: color('surface.overlay.scrim'), display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '90%', boxSizing: 'border-box', background: color('surface.raised.default'),
        borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column', ...style,
      }} {...rest}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${space('sm')} 0` }}>
          <span style={{ width: 40, height: 4, borderRadius: PILL, background: color('border.solid.strong') }} />
        </div>
        {(title || onDismiss) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${space('lg')} ${space('sm')}` }}>
            <Text variant="heading.xs">{title}</Text>
            {onDismiss ? <button onClick={onDismiss} aria-label="Close" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><IconBox size="sm">✕</IconBox></button> : null}
          </div>
        )}
        <div style={{ overflowY: 'auto', padding: `0 ${space('lg')} ${space('lg')}` }}>{children}</div>
        {footer ? <div style={{ padding: space('lg'), borderTop: `1px solid ${color('border.solid.subtle')}` }}>{footer}</div> : null}
      </div>
    </div>
  );
}
