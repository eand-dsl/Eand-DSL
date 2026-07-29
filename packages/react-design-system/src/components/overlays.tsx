import type { HTMLAttributes, ReactNode } from 'react';
import { color, space, radius, PILL } from '../system';
import { Text, IconBox } from './primitives';

/* ---------------- Tooltip ----------------
   Figma final component `Tooltip` 33202:6649 — one component carrying every size, built
   from the tooltip atoms (.tooltip-caret, .tooltip-text-title/-body, .tooltip-media-image,
   .tooltip-icon-button, .tooltip-steps, .tooltip-core-surface).

   Each size binds its own radius — a single radius for all three is wrong:
     Simple   33202:6648  115×31   border-radius/1 = 4   body.sm on text/default/subtle
     Standard 33202:6646  200×81   border-radius/3 = 12  body.sm on text/default/default
     Rich     33202:6647  280×333  border-radius/6 = 20  title.xs 14 SB + body.sm + slots

   `.tooltip-core-surface` (32928:269817) has Surface=Default|Dark; Default is white
   (surface/raised/default), which is why `surface` defaults to 'default' here. */
export type TooltipSize = 'simple' | 'standard' | 'rich';
export type TooltipSurface = 'default' | 'dark';
/** Which side of the trigger the tooltip sits on — `.tooltip-core-caret-direction` 32928:269787. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const TOOLTIP_RADIUS: Record<TooltipSize, string> = {
  simple: radius('1'), standard: radius('3'), rich: radius('6'),
};
/** Figma design widths; simple hugs its single line, the others wrap to a max. */
const TOOLTIP_MAX_WIDTH: Record<TooltipSize, number | undefined> = {
  simple: undefined, standard: 200, rich: 280,
};

export interface TooltipProps {
  content: ReactNode;
  /** Rich only — `.tooltip-text-title`. */
  title?: ReactNode;
  /** Rich only — `.tooltip-media-image`. */
  media?: ReactNode;
  /** Rich only — action row (`.tooltip-icon-button` / a Button). */
  action?: ReactNode;
  /** Rich only — `.tooltip-steps`, e.g. "1 of 3". */
  steps?: ReactNode;
  size?: TooltipSize;
  surface?: TooltipSurface;
  visible?: boolean;
  placement?: TooltipPlacement;
  children: ReactNode;
}
export function Tooltip({
  content, title, media, action, steps, size = 'standard', surface = 'default',
  visible = false, placement = 'top', children,
}: TooltipProps) {
  const onDark = surface === 'dark';
  const bg = onDark ? color('surface.overlay.floating-inverse') : color('surface.raised.default');
  // Simple is the muted/subtle treatment; standard + rich use the default ink.
  const fg = onDark ? color('text.default.inverse')
    : size === 'simple' ? color('text.default.subtle') : color('text.default.default');
  const gap = 'calc(100% + 8px)';
  const pos: Record<string, string> =
    placement === 'top' ? { bottom: gap, left: '50%', transform: 'translateX(-50%)' }
    : placement === 'bottom' ? { top: gap, left: '50%', transform: 'translateX(-50%)' }
    : placement === 'left' ? { right: gap, top: '50%', transform: 'translateY(-50%)' }
    : { left: gap, top: '50%', transform: 'translateY(-50%)' };

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {visible ? (
        <span role="tooltip" style={{
          position: 'absolute', ...pos, boxSizing: 'border-box',
          background: bg, color: fg,
          padding: size === 'rich' ? space('lg') : space('md'),
          borderRadius: TOOLTIP_RADIUS[size], maxWidth: TOOLTIP_MAX_WIDTH[size],
          whiteSpace: size === 'simple' ? 'nowrap' : 'normal', zIndex: 50,
          display: 'flex', flexDirection: 'column', gap: space('xs'),
        } as any}>
          {size === 'rich' && media ? <span>{media}</span> : null}
          {size === 'rich' && title ? (
            <Text variant="title.xs" color={fg} as="div">{title}</Text>
          ) : null}
          <Text variant="body.sm" color={fg}>{content}</Text>
          {size === 'rich' && (steps || action) ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm') }}>
              {steps ? <Text variant="body.sm" color={color('text.default.muted')}>{steps}</Text> : <span />}
              {action}
            </span>
          ) : null}
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
