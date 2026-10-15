import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { T, color, space, radius, scale, PILL } from '../system';
import { Icon } from '../icons';
import { Text, SectionLinkButton } from './primitives';

/* ---------------- Scrim ----------------
   Figma V1.2 `scrim` 32960:77013 (page 31614:11244): a 375x812 rect filled with
   surface/overlay/scrim (midnight at 50%) under a GLASS effect of radius 20 (effect style
   surface/glass/glass-md). "Used as a background overlay to highlight … modals, popups,
   bottom-sheets or tooltips." Figma's glass is approximated with a 20px backdrop blur, as
   the other glass surfaces in this library are. */
export type ScrimProps = HTMLAttributes<HTMLDivElement>;
export function Scrim({ style, children, ...rest }: ScrimProps) {
  return (
    <div data-part="scrim" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: color('surface.overlay.scrim'),
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      ...style,
    }} {...rest}>{children}</div>
  );
}

/* ---------------- Tooltip ----------------
   Figma final component `Tooltip` 33202:6649 — one component carrying every size, built
   from the tooltip atoms (.tooltip-caret, .tooltip-text-title/-body, .tooltip-media-image,
   .tooltip-icon-button, .tooltip-steps, .tooltip-core-surface).

   Each size binds its own radius and padding:
     Simple   33202:6648  border-radius/1 = 4   padding 4/12 (spacing/xs, spacing/md)
     Standard 33202:6646  border-radius/4 = 12  padding 12
     Rich     33202:6647  border-radius/7 = 20  padding 16
   Every size carries the effect style shadow/md (0 0 44 color/midnight/a10).

   `.tooltip-core-surface` 32928:269817: Default = surface/canvas/default (#fff), Dark =
   surface/canvas/midnight (#140f21). `.tooltip-caret` 29972:2741 is a 12x6 vector
   (scale/12) on surface/raised/default (Dark: surface/canvas/midnight), inset by
   spacing/3xl when it is not centred. `.tooltip-core-caret-direction` 32928:269787 puts
   it on the side facing the trigger; `show-caret` hides it.

   Rich (`.tooltip-core-rich`): title title/xs (padding 4/0) — Figma binds the legacy
   `Text/Dark/Dark 100` #1a1921 there, text/default/default is used; media 248x140 at
   border-radius/7 (block padding 14/0/6/0, unbound); body body/sm on text/default/subtle
   (padding-top 6, unbound); `.tooltip-icon-button` lg (32, border-radius/4, on
   surface/base/default) top-end; action block padding-top 12, steps on text/default/muted. */
export type TooltipSize = 'simple' | 'standard' | 'rich';
export type TooltipSurface = 'default' | 'dark';
/** Which side of the trigger the tooltip sits on. The caret points back at the trigger. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
/** Where the caret sits along the tooltip edge (Figma `caret-placement`; `start`/`end` are
 *  inset by spacing/3xl). Applies to top and bottom placements. */
export type TooltipCaretAlign = 'start' | 'center' | 'end';

const TOOLTIP_RADIUS: Record<TooltipSize, string> = {
  simple: radius('1'), standard: radius('4'), rich: radius('7'),
};
const TOOLTIP_PADDING: Record<TooltipSize, string> = {
  simple: `${space('xs')} ${space('md')}`, standard: space('md'), rich: space('lg'),
};
/** Figma symbol widths (Standard 200, Rich 280); Simple hugs its single line. A fixed
 *  width, not a max: an absolutely placed box would otherwise shrink to the trigger. */
const TOOLTIP_WIDTH: Record<TooltipSize, number | undefined> = {
  simple: undefined, standard: 200, rich: 280,
};
const SHADOW_MD = (() => {
  const s = T.effects.shadow.md;
  return `${s.positionX} ${s.positionY} ${s.blur} ${s.spread} ${s.color}`;
})();

/** 12x6 caret pointing at the trigger. A shape, not an icon-set glyph. */
function Caret({ placement, fill }: { placement: TooltipPlacement; fill: string }) {
  const vertical = placement === 'top' || placement === 'bottom';
  const d = placement === 'top' ? 'M12 0L6 6L0 0Z'      // below the bubble, pointing down
    : placement === 'bottom' ? 'M0 6L6 0L12 6Z'         // above the bubble, pointing up
    : placement === 'left' ? 'M0 0L6 6L0 12Z'           // right of the bubble, pointing right
    : 'M6 0L0 6L6 12Z';                                 // left of the bubble, pointing left
  const w = vertical ? 12 : 6;
  const h = vertical ? 6 : 12;
  return (
    <svg data-part="caret" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block', flex: 'none' }}>
      <path d={d} fill={fill} />
    </svg>
  );
}

export interface TooltipProps {
  content: ReactNode;
  /** Rich only — `.tooltip-text-title`. */
  title?: ReactNode;
  /** Rich only — `.tooltip-media-image`, clipped to border-radius/7. */
  media?: ReactNode;
  /** Rich only — the action block's button. */
  action?: ReactNode;
  /** Rich only — `.tooltip-steps`, e.g. "1 of 3". */
  steps?: ReactNode;
  /** Rich only — shows the `.tooltip-icon-button` close at the top end. */
  onClose?: () => void;
  size?: TooltipSize;
  surface?: TooltipSurface;
  visible?: boolean;
  placement?: TooltipPlacement;
  /** Figma `show-caret`. Default true. */
  caret?: boolean;
  caretAlign?: TooltipCaretAlign;
  children: ReactNode;
}
export function Tooltip({
  content, title, media, action, steps, onClose, size = 'standard', surface = 'default',
  visible = false, placement = 'top', caret = true, caretAlign = 'center', children,
}: TooltipProps) {
  const onDark = surface === 'dark';
  const rich = size === 'rich';
  const bg = onDark ? color('surface.canvas.midnight') : color('surface.canvas.default');
  const caretFill = onDark ? color('surface.canvas.midnight') : color('surface.raised.default');
  const ink = onDark ? color('text.default.inverse') : color('text.default.default');
  // Simple and the Rich body take the subtle ink; Standard and the Rich title the default.
  const bodyInk = onDark ? color('text.default.inverse')
    : size === 'standard' ? color('text.default.default') : color('text.default.subtle');
  const gap = 'calc(100% + 8px)';
  const pos: Record<string, string> =
    placement === 'top' ? { bottom: gap, left: '50%', transform: 'translateX(-50%)' }
    : placement === 'bottom' ? { top: gap, left: '50%', transform: 'translateX(-50%)' }
    : placement === 'left' ? { right: gap, top: '50%', transform: 'translateY(-50%)' }
    : { left: gap, top: '50%', transform: 'translateY(-50%)' };
  const vertical = placement === 'top' || placement === 'bottom';
  const caretFirst = placement === 'bottom' || placement === 'right';

  // Top/bottom: the caret is a row in flow under/over the bubble. Left/right: it is pinned
  // to the physical side facing the trigger — in flow, a row would mirror under dir="rtl"
  // and point the caret away from the trigger.
  const caretRow = caret ? (
    <span style={vertical ? {
      display: 'flex', alignSelf: 'stretch', paddingInline: space('3xl'),
      justifyContent: caretAlign === 'start' ? 'flex-start' : caretAlign === 'end' ? 'flex-end' : 'center',
    } : {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)', display: 'flex',
      ...(placement === 'left' ? { right: 0 } : { left: 0 }),
    }}>
      <Caret placement={placement} fill={caretFill} />
    </span>
  ) : null;

  const bubble = (
    <span data-part="bubble" style={{
      boxSizing: 'border-box', background: bg, color: ink,
      padding: TOOLTIP_PADDING[size], borderRadius: TOOLTIP_RADIUS[size],
      width: TOOLTIP_WIDTH[size],
      whiteSpace: size === 'simple' ? 'nowrap' : 'normal', boxShadow: SHADOW_MD,
      display: 'flex', flexDirection: 'column',
    }}>
      {rich ? (
        <>
          {/* `heading-container`: the text block sits beside the 32px close, but the media
              runs the full 248 under it (it starts below the button), so the close is
              pinned top-end and only the title and body make room for it. */}
          <span style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {title ? (
              <span style={{ display: 'flex', padding: `${space('xs')} 0`, paddingInlineEnd: onClose ? 32 : undefined }}>
                <Text variant="title.xs" color={ink} as="span">{title}</Text>
              </span>
            ) : null}
            {media ? (
              <span style={{ display: 'flex', flexDirection: 'column', padding: '14px 0 6px' }}>
                <span style={{ display: 'block', borderRadius: radius('7'), overflow: 'hidden' }}>{media}</span>
              </span>
            ) : null}
            <span style={{ display: 'flex', paddingTop: 6, paddingInlineEnd: onClose ? 32 : undefined }}>
              <Text variant="body.sm" color={bodyInk}>{content}</Text>
            </span>
            {onClose ? (
              <button type="button" aria-label="Close" onClick={onClose} style={{
                position: 'absolute', top: 0, insetInlineEnd: 0,
                width: 32, height: 32, padding: 0, border: 0, cursor: 'pointer',
                borderRadius: radius('4'), background: color('surface.base.default'),
                color: color('text.default.default'),
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{/* icon-size xl (20) padded 1.67 around a 17px close/filled=true */}<Icon name="close-filled" size={17} /></button>
            ) : null}
          </span>
          {steps || action ? (
            <span style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: space('sm'), paddingTop: space('md') }}>
              {steps ? <Text variant="body.sm" color={onDark ? color('text.default.inverse-muted') : color('text.default.muted')}>{steps}</Text> : <span />}
              {action}
            </span>
          ) : null}
        </>
      ) : (
        <Text variant="body.sm" color={bodyInk}>{content}</Text>
      )}
    </span>
  );

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {visible ? (
        <span role="tooltip" data-size={size} style={{
          position: 'absolute', ...pos, zIndex: 50,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          ...(vertical || !caret ? {} : placement === 'left' ? { paddingRight: 6 } : { paddingLeft: 6 }),
        } as CSSProperties}>
          {vertical && caretFirst ? caretRow : null}
          {bubble}
          {vertical && caretFirst ? null : caretRow}
        </span>
      ) : null}
    </span>
  );
}

/* ---------------- BottomSheet ----------------
   Figma V1.2 `bottom-sheet` 40299:160405 (axis `type` basic | detailed | system-message)
   around `.bottom-sheet-core` 40283:142315, `.bottom-sheet-header` 40298:154246
   (bools icon, close-button, pills, grabber, text-block, title, text-primary,
   text-secondary × visual-asset), `.bottom-sheet-content-area` and `.bottom-sheet-cta-bar`.

     sheet    surface/sunken/inverse #f0f0f5, border-radius/8 = 24 top corners
     grabber  40x4 surface/glass/midnight/md pill in an 8px frame (padding-top spacing/xs);
              in flow above a visual, laid over the title padding otherwise
     visual   `visual-asset` padding 4/4/0/4, the image at border-radius/6 = 16, and the
              close as a glass inverse `section-link` 20px in from the top end
     title    frame padding 20/20/0/20 (spacing/xl); icon 40x40 at border-radius/4 with 8
              below; title Bold 20 / 110% — the text style is heading/md, but its size is
              bound to font/size/6 = 20, and the bound variable wins (CLAUDE.md §1);
              description body/md text/default/default; the close is a solid 40px
              `section-link` (border-radius/5) at the row end, 12 (spacing/md) from the text
     pills    `.bottom-sheet-tabs`: a 4px-gap row 16 under the title
     header   padding-bottom 20
     body     `.bottom-sheet-content-area` padding 0/20/20/20 on surface/base/default
     type     basic = visual + icon + title + description; detailed = title + body;
              system-message = no grabber, close + body

   The V1.1 `Display` axis (display="dark") has no V1.2 counterpart; kept, deprecated. */
export type BottomSheetType = 'basic' | 'detailed' | 'system-message';
/** @deprecated V1.2 has no Display axis. */
export type BottomSheetDisplay = 'light' | 'dark';

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  /** Figma `type`. `system-message` drops the grabber by default. Default `detailed`. */
  type?: BottomSheetType;
  /** @deprecated V1.2 has no Display axis; the sheet is always light. */
  display?: BottomSheetDisplay;
  /** Figma `grabber` boolean. Default: on, except for `system-message`. */
  grabber?: boolean;
  title?: ReactNode;
  /** Figma `text-secondary` — body/md under the title. */
  description?: ReactNode;
  /** Figma `icon` — a 40px logo tile above the title (pass an image or an icon). */
  icon?: ReactNode;
  /** Figma `pills` — a row of `Chip`s under the title. */
  pills?: ReactNode;
  /** @deprecated V1.1 Subheader. Use `pills`; still rendered under the title. */
  subheader?: ReactNode;
  /** Figma `visual-asset` — media above the header, framed with a 4px inset and r16. */
  visual?: ReactNode;
  /** Figma `close-button`. Default: shown whenever `onDismiss` is set. */
  closeButton?: boolean;
  footer?: ReactNode;
  onDismiss?: () => void;
}
export function BottomSheet({
  open = true, type = 'detailed', display = 'light', grabber, title, description, icon, pills,
  subheader, visual, closeButton, footer, onDismiss, style, children, ...rest
}: BottomSheetProps) {
  if (!open) return null;
  const onDark = display === 'dark';
  const sheetBg = onDark ? color('surface.canvas.midnight') : color('surface.sunken.inverse');
  const ink = onDark ? color('text.default.inverse') : color('text.default.default');
  // Light sheet takes the midnight grabber; the deprecated dark sheet the white one.
  const grabberBg = onDark ? color('surface.glass.white.xl') : color('surface.glass.midnight.md');
  const showGrabber = grabber ?? type !== 'system-message';
  const showClose = (closeButton ?? true) && !!onDismiss;
  const closeOnVisual = showClose && visual != null;
  const closeInTitle = showClose && !closeOnVisual;
  const textBlock = icon != null || title != null || description != null;
  const H = T.typography.heading.md;

  const grabberEl = showGrabber ? (
    <div style={{
      display: 'flex', justifyContent: 'center', boxSizing: 'border-box', height: 8, paddingTop: space('xs'),
      ...(visual != null ? {} : { position: 'absolute', top: 0, insetInline: 0 }),
    }}>
      <span data-testid="grabber" style={{ width: scale('40'), height: scale('4'), borderRadius: PILL, background: grabberBg }} />
    </div>
  ) : null;

  const close = (surface: 'default' | 'inverse') => (
    <SectionLinkButton aria-label="Close" surface={surface} onClick={onDismiss}
      icon={<Icon name="close" size={24} />} />
  );

  return (
    <Scrim onClick={onDismiss} style={{ display: 'flex', alignItems: 'flex-end' }}>
      <div role="dialog" aria-modal="true" data-type={type} onClick={(e) => e.stopPropagation()} style={{
        position: 'relative', width: '100%', maxHeight: '90%', boxSizing: 'border-box', background: sheetBg, color: ink,
        borderStartStartRadius: radius('8'), borderStartEndRadius: radius('8'),
        display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style,
      }} {...rest}>
        <div data-part="header" style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 'none', paddingBottom: space('xl') }}>
          {grabberEl}
          {visual != null ? (
            <div data-part="visual" style={{ position: 'relative', padding: `${space('xs')} ${space('xs')} 0` }}>
              <div style={{ borderRadius: radius('6'), overflow: 'hidden' }}>{visual}</div>
              {closeOnVisual ? (
                <div style={{ position: 'absolute', top: space('xl'), insetInlineEnd: space('xl') }}>{close('inverse')}</div>
              ) : null}
            </div>
          ) : null}
          {textBlock || closeInTitle || pills != null || subheader != null ? (
            <div data-part="title" style={{ padding: `${space('xl')} ${space('xl')} 0` }}>
              {textBlock || closeInTitle ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: space('md') }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    {icon != null ? (
                      <div style={{ display: 'flex', paddingBottom: space('sm') }}>
                        <span style={{
                          width: 40, height: 40, flex: 'none', borderRadius: radius('4'), overflow: 'hidden',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>{icon}</span>
                      </div>
                    ) : null}
                    {title != null ? (
                      <div style={{ display: 'flex', padding: `${space('xs')} 0` }}>
                        <Text as="h2" variant="heading.md" color={ink} style={{
                          // font/size/6 (20) is bound on the node; weight and tracking from
                          // the heading/md variables; 110% is held on the symbol.
                          fontSize: T.font.size['6'], fontWeight: H.fontWeight,
                          letterSpacing: H.letterSpacing, lineHeight: '1.1',
                        }}>{title}</Text>
                      </div>
                    ) : null}
                    {description != null ? <Text as="p" variant="body.md" color={ink}>{description}</Text> : null}
                  </div>
                  {closeInTitle ? close(onDark ? 'inverse' : 'default') : null}
                </div>
              ) : null}
              {pills != null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: space('xs'), paddingTop: space('lg'), overflowX: 'auto' }}>{pills}</div>
              ) : null}
              {subheader != null ? <div style={{ paddingTop: space('lg') }}>{subheader}</div> : null}
            </div>
          ) : null}
        </div>
        {children != null ? (
          <div data-part="body" style={{
            flex: '1 1 auto', overflowY: 'auto', padding: `0 ${space('xl')} ${space('xl')}`,
            background: onDark ? undefined : color('surface.base.default'),
          }}>{children}</div>
        ) : null}
        {footer ? <div data-part="footer" style={{ padding: space('xl') }}>{footer}</div> : null}
      </div>
    </Scrim>
  );
}
