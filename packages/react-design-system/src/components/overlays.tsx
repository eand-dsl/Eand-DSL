import type { HTMLAttributes, ReactNode } from 'react';
import { color, space, radius, scale, PILL } from '../system';
import { Icon } from '../icons';
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
/* Figma `Bottom sheet` 29355:6240, assembled from Grabber 27907:16040, Header
   27907:16054 (Title 28980:6141), Subheader 27928:11034, a Slot, and Footer 27907:20590.

   The sheet carries a `Display` axis (Light | Dark), verified on the Grabber's own
   variant nodes — the fill flips, it is not one colour:
     Display=Light 27907:15999  surface/glass/midnight/md  rgba(25,19,41,.20)
     Display=Dark  27907:16041  surface/glass/white/xl     rgba(255,255,255,.40)
   Both 40x4 (scale/40 x scale/4) at border-radius/8 (pill).

   Sheet corners bind border-radius/7 = 24; the title is heading/md 24 Bold
   (was heading.xs); Figma has no divider above the footer. */
export type BottomSheetDisplay = 'light' | 'dark';

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  /** Figma `Display` axis — the sheet surface. */
  display?: BottomSheetDisplay;
  /** Figma `Grabber` boolean. */
  grabber?: boolean;
  title?: ReactNode;
  /** Figma Subheader 27928:11034 — search / filters under the title. */
  subheader?: ReactNode;
  /** Figma Visual asset 29355:9189 — media strip above the header. */
  visual?: ReactNode;
  footer?: ReactNode;
  onDismiss?: () => void;
}
export function BottomSheet({
  open = true, display = 'light', grabber = true, title, subheader, visual,
  footer, onDismiss, style, children, ...rest
}: BottomSheetProps) {
  if (!open) return null;
  const onDark = display === 'dark';
  const sheetBg = onDark ? color('surface.canvas.midnight') : color('surface.raised.default');
  const ink = onDark ? color('text.default.inverse') : color('text.default.default');
  // Light sheet takes the midnight grabber; dark sheet takes the white one.
  const grabberBg = onDark ? color('surface.glass.white.xl') : color('surface.glass.midnight.md');
  return (
    <div onClick={onDismiss} style={{ position: 'fixed', inset: 0, background: color('surface.overlay.scrim'), display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '90%', boxSizing: 'border-box', background: sheetBg, color: ink,
        borderTopLeftRadius: radius('7'), borderTopRightRadius: radius('7'),
        display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style,
      }} {...rest}>
        {grabber ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: `${space('xs')} 0` }}>
            <span data-testid="grabber" style={{ width: scale('40'), height: scale('4'), borderRadius: PILL, background: grabberBg }} />
          </div>
        ) : null}
        {visual ? <div>{visual}</div> : null}
        {(title || onDismiss) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('md'), padding: `0 ${space('lg')} ${space('sm')}` }}>
            <Text variant="heading.md" color={ink}>{title}</Text>
            {onDismiss ? <button onClick={onDismiss} aria-label="Close" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: ink }}><IconBox size="sm"><Icon name="close" size={12} /></IconBox></button> : null}
          </div>
        )}
        {subheader ? <div style={{ padding: `0 ${space('lg')} ${space('sm')}` }}>{subheader}</div> : null}
        <div style={{ overflowY: 'auto', padding: `0 ${space('lg')} ${space('lg')}` }}>{children}</div>
        {footer ? <div style={{ padding: space('lg') }}>{footer}</div> : null}
      </div>
    </div>
  );
}
