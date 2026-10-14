import {
  forwardRef, useRef, useState,
  type ButtonHTMLAttributes, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode,
} from 'react';
import { color, icon, radius, scale, space, ty, T } from '../../system';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link' | 'glass';
/**
 * Colour scheme — the Figma V1.2 `scheme` axis on `button` (25394:85067).
 * `default` = brand red · `inverse` = white (for red / dark backgrounds) · `midnight` = ink.
 * Glass has no scheme axis in Figma (default only), so it ignores this prop.
 */
export type ButtonScheme = 'default' | 'inverse' | 'midnight';
/**
 * @deprecated Use `scheme`. The V1.1 surface axis, kept as a back-compat alias with its
 * original rendering: brand → default · inverse-brand / white → inverse · midnight → midnight
 * (see `scheme` for the one place they differ: secondary).
 */
export type ButtonSurface = 'brand' | 'inverse-brand' | 'white' | 'midnight';
/** @deprecated Back-compat alias for `surface` — 'inverse' maps to inverse-brand / white. */
export type ButtonTone = 'brand' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

// V1.2 renamed the interaction state from `focus` to `pressed` across color/button/*.
type ButtonState = 'default' | 'pressed' | 'disabled';
type TokenKey = 'brand' | 'inverse' | 'midnight';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  /**
   * Colour scheme (Figma V1.2 `scheme`). Takes precedence over `surface` and `tone`.
   * Secondary follows the published symbol, whose bindings are crossed relative to the
   * other types: `scheme="inverse"` is the dark (midnight) outline and `scheme="midnight"`
   * is the white outline. Logged as a design question.
   */
  scheme?: ButtonScheme;
  /** @deprecated Use `scheme`. Kept as a back-compat alias; `scheme` wins when both are set. */
  surface?: ButtonSurface;
  /** @deprecated Use `scheme`. Kept as a back-compat alias. */
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Stretch to fill the container width (block CTA). */
  block?: boolean;
  /** Show a spinner in the leading-icon slot and suppress clicks (Figma `.button-icon loader=true`).
   *  Keeps the default palette — loading is not the disabled state. */
  loading?: boolean;
  /** Leading icon. The slot is 24 / 20 / 16 (lg / md / sm) with 2px inset, so pass an
   *  `<Icon size>` of 20 / 16 / 12. */
  leadingIcon?: ReactNode;
  /** Trailing icon — same slot sizes as `leadingIcon`. */
  trailingIcon?: ReactNode;
}

/* ---------------------------------------------------------------------------------------
 * Geometry — Figma `button` 25394:85067 (published symbol + bound variables).
 * Padded types (primary / secondary / glass):
 *   height = minWidth = scale/48 · 40 · 32
 *   inline inset = outer (spacing/sm lg+md, spacing/xs sm) + button-content (spacing/xs)
 *                + label (spacing/xs lg+md, spacing/2xs sm)  →  16 / 16 / 10
 *   (md: 3 of the 21 md variants bind the label to 2xs instead of xs — 14 vs 16. The
 *    majority value is used; logged as a design question.)
 * Hugging types (tertiary / link): no height, no minWidth, 0 padding at every level.
 * --------------------------------------------------------------------------------------- */
const HEIGHT: Record<ButtonSize, string> = { sm: scale('32'), md: scale('40'), lg: scale('48') };
const OUTER_PAD: Record<ButtonSize, string> = { sm: space('xs'), md: space('sm'), lg: space('sm') };
const CONTENT_PAD = space('xs');
const LABEL_PAD: Record<ButtonSize, string> = { sm: space('2xs'), md: space('xs'), lg: space('xs') };
// `.button-icon` 28266:67126 — an `icon-size` box with spacing/2xs inset: lg icon/xl 24
// (20 glyph), md icon/lg 20 (16 glyph), sm icon/md 16 (12 glyph).
const ICON_BOX: Record<ButtonSize, string> = { sm: icon('md'), md: icon('lg'), lg: icon('xl') };
const ICON_INSET = space('2xs');
const SPINNER: Record<ButtonSize, number> = { sm: 12, md: 16, lg: 20 }; // ICON_BOX − 2 × ICON_INSET

const isHugging = (v: ButtonVariant) => v === 'tertiary' || v === 'link';

// Deprecated surface → token group (unchanged since V1.1).
const SURFACE_KEY: Record<ButtonSurface, TokenKey> = {
  brand: 'brand',
  'inverse-brand': 'inverse',
  white: 'inverse',
  midnight: 'midnight',
};
// V1.2 scheme → token group, per the published symbol. Secondary is crossed in Figma:
// scheme=inverse binds `secondary/*/midnight`, scheme=midnight binds `secondary/*/inverse`.
const SCHEME_KEY: Record<ButtonScheme, TokenKey> = { default: 'brand', inverse: 'inverse', midnight: 'midnight' };
const SECONDARY_SCHEME_KEY: Record<ButtonScheme, TokenKey> = { default: 'brand', inverse: 'midnight', midnight: 'inverse' };

function tokenKey(variant: ButtonVariant, scheme?: ButtonScheme, surface?: ButtonSurface, tone?: ButtonTone): TokenKey {
  if (scheme) return (variant === 'secondary' ? SECONDARY_SCHEME_KEY : SCHEME_KEY)[scheme];
  if (surface) return SURFACE_KEY[surface];
  return tone === 'inverse' ? 'inverse' : 'brand';
}

/** Inside stroke (Figma strokeAlign INSIDE) — an inset ring, so it never adds to the box. */
const insideStroke = (c: string) => `inset 0 0 0 ${T.border.sm} ${c}`;

// Figma vars color/button/glass/{surface,text}/{state} — glass button, default scheme only;
// frosted look via a 20px backdrop blur (CSS cannot express the Figma glass effect exactly).
const GLASS: Record<ButtonState, { bg: string; fg: string }> = {
  default:  { bg: color('button.glass.surface.default'), fg: color('button.glass.text.default') },
  pressed:  { bg: color('button.glass.surface.pressed'), fg: color('button.glass.text.pressed') },
  disabled: { bg: color('button.glass.surface.disabled'), fg: color('button.glass.text.disabled') },
};

// Secondary binds exactly what the published symbol binds. In the midnight group the
// symbol uses `secondary/text/midnight/*` as the stroke and `secondary/border/midnight/pressed`
// as the pressed fill (a text var on a stroke, a border var on a fill). Today they resolve to
// the same values as `border/midnight/*` and `surface/midnight/pressed`; binding the published
// names means a Figma re-point follows through.
function secondaryPaths(key: TokenKey, state: ButtonState) {
  return {
    stroke: key === 'midnight' ? `button.secondary.text.midnight.${state}` : `button.secondary.border.${key}.${state}`,
    pressedFill: key === 'midnight' ? 'button.secondary.border.midnight.pressed' : `button.secondary.surface.${key}.pressed`,
    text: `button.secondary.text.${key}.${state}`,
  };
}

function palette(variant: ButtonVariant, key: TokenKey, state: ButtonState): CSSProperties {
  if (variant === 'glass') {
    return {
      background: GLASS[state].bg,
      color: GLASS[state].fg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    };
  }
  if (variant === 'primary') {
    return {
      background: color(`button.primary.surface.${key}.${state}`),
      color: color(`button.primary.text.${key}.${state}`),
    };
  }
  if (variant === 'secondary') {
    const p = secondaryPaths(key, state);
    // Transparent with a 1px (border/sm) inside stroke; pressed = solid fill, NO stroke.
    return state === 'pressed'
      ? { background: color(p.pressedFill), color: color(p.text) }
      : { background: 'transparent', color: color(p.text), boxShadow: insideStroke(color(p.stroke)) };
  }
  // tertiary (text) and link (text, underlined only while pressed — Figma textDecoration).
  return {
    background: 'transparent',
    color: color(`button.${variant}.text.${key}.${state}`),
    textDecoration: variant === 'link' && state === 'pressed' ? 'underline' : 'none',
  };
}

/** Focus ring. Figma has no focus spec for buttons (state = default/pressed/disabled), so
 *  this is a code-side accessibility addition: a 2px (border/lg) ring, offset 2px, in
 *  border/interactive/{default|inverse}/pressed so it reads on either background. */
function focusRing(onDark: boolean): CSSProperties {
  return {
    outlineStyle: 'solid',
    outlineWidth: T.border.lg,
    outlineColor: color(onDark ? 'border.interactive.inverse.pressed' : 'border.interactive.default.pressed'),
    outlineOffset: space('2xs'),
  };
}
const NO_RING: CSSProperties = { outlineStyle: 'none' };

/**
 * Press + focus-visible tracking shared by Button and UaePassButton.
 * - `pressed` follows the pointer (down → up / leave / cancel) and Space / Enter while held;
 *   it never lingers on focus.
 * - `ring` shows on focus that did not come from a pointer (the :focus-visible heuristic —
 *   inline styles cannot use the pseudo-class).
 */
function useInteraction(enabled: boolean, h: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pressed, setPressed] = useState(false);
  const [ring, setRing] = useState(false);
  const fromPointer = useRef(false);
  const release = () => setPressed(false);
  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      fromPointer.current = true;
      if (enabled && !(e.button > 0)) setPressed(true);
      h.onPointerDown?.(e);
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => { release(); h.onPointerUp?.(e); },
    onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => { release(); h.onPointerLeave?.(e); },
    onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => { release(); h.onPointerCancel?.(e); },
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      fromPointer.current = false;
      if (enabled && (e.key === ' ' || e.key === 'Enter')) setPressed(true);
      setRing(true);
      h.onKeyDown?.(e);
    },
    onKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') release();
      h.onKeyUp?.(e);
    },
    onFocus: (e: FocusEvent<HTMLButtonElement>) => {
      setRing(!fromPointer.current);
      h.onFocus?.(e);
    },
    onBlur: (e: FocusEvent<HTMLButtonElement>) => {
      setRing(false);
      release();
      fromPointer.current = false;
      h.onBlur?.(e);
    },
  };
  return { pressed: enabled && pressed, ring, handlers };
}

/** Self-contained SVG spinner for the loading state (animateTransform, no keyframes).
 *  Figma uses its `loader/size=lg` component; the icon set has no loader glyph. */
function ButtonSpinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function IconSlot({ size, children }: { size: ButtonSize; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        width: ICON_BOX[size], height: ICON_BOX[size], padding: ICON_INSET, boxSizing: 'border-box',
      }}
    >
      {children}
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary', scheme, surface, tone, size = 'md', block, loading, leadingIcon, trailingIcon,
    children, style, type = 'button', disabled, onClick,
    onFocus, onBlur, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp,
    ...rest
  },
  ref,
) {
  const { pressed, ring, handlers } = useInteraction(!disabled && !loading, {
    onFocus, onBlur, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp,
  });
  const key = tokenKey(variant, scheme, surface, tone);
  const state: ButtonState = disabled ? 'disabled' : pressed ? 'pressed' : 'default';
  const hug = isHugging(variant);
  const lead = loading ? <ButtonSpinner size={SPINNER[size]} /> : leadingIcon;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...handlers}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        height: hug ? undefined : HEIGHT[size], minWidth: hug ? undefined : HEIGHT[size],
        padding: hug ? 0 : `0 ${OUTER_PAD[size]}`, margin: 0, border: 0, borderRadius: radius('9'),
        width: block ? '100%' : undefined, cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer',
        whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
        ...ty(variant === 'link' ? `body.${size}` : `button.${size}`),
        ...palette(variant, key, state),
        ...(ring ? focusRing(key === 'inverse' || variant === 'glass') : NO_RING),
        ...style,
      }}
      {...rest}
    >
      {/* button-content 37840:24007 — gap 0; spacing comes from its own and the label's padding */}
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: hug ? 0 : `0 ${CONTENT_PAD}` }}>
        {lead ? <IconSlot size={size}>{lead}</IconSlot> : null}
        {children != null && children !== false ? (
          <span style={{ padding: hug ? 0 : `0 ${LABEL_PAD[size]}` }}>{children}</span>
        ) : null}
        {trailingIcon ? <IconSlot size={size}>{trailingIcon}</IconSlot> : null}
      </span>
    </button>
  );
});

/* =======================================================================================
 * UAE PASS — Figma `button-uae-pass` 39861:22282 (type login / rtl / continue × disabled).
 * A separate export rather than a Button variant: it is its own published component set
 * with its own anatomy (brand logo, fixed copy, lg only, no scheme or pressed state).
 * ======================================================================================= */

export type UaePassButtonVariant = 'login' | 'continue' | 'rtl';

export interface UaePassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Figma `type`: `login` "Login with UAE PASS" · `continue` "Continue with UAE PASS" ·
   *  `rtl` the Arabic login label, laid out right-to-left (logo after the text). */
  variant?: UaePassButtonVariant;
  /** Stretch to fill the container width. */
  block?: boolean;
  /** Label override. Defaults to the Figma copy for `variant`. */
  children?: ReactNode;
}

const UAE_PASS_LABEL: Record<UaePassButtonVariant, string> = {
  login: 'Login with UAE PASS',
  continue: 'Continue with UAE PASS',
  // The Figma rtl variant outlines this text as vectors ("Group 4"); transcribed from it.
  rtl: 'تسجيل الدخول بالهوية الرقمية',
};

// UAE PASS logo, exported from Figma (39861:22255, 24×24). A third-party brand mark that is
// not in the icon set, so its own colours are literal (#E82227 / black / #00AC75 are the
// mark's, not e& tokens). Re-export from Figma rather than editing the path data.
const UAE_PASS_LOGO: ReadonlyArray<readonly [string, string]> = [
  ['M8.52925 21.7601C8.49493 21.8472 8.4802 21.9411 8.48615 22.0347C8.4921 22.1284 8.51857 22.2196 8.56363 22.3015L8.57171 22.3324C9.37744 23.4173 10.6583 23.9577 10.6583 23.9577C10.8081 24.0168 10.9747 24.014 11.1225 23.95C11.2703 23.886 11.3878 23.7658 11.4499 23.6149C11.4998 23.4868 11.505 23.345 11.4645 23.2135C11.424 23.0819 11.3403 22.9685 11.2275 22.8923L11.2204 22.8882L11.2002 22.8759C10.5977 22.5362 9.59379 21.5377 9.53111 21.4883L9.52909 21.4852H9.52807C9.48084 21.4474 9.42838 21.4169 9.37239 21.3946C9.21305 21.3301 9.03511 21.3321 8.87725 21.4003C8.71938 21.4686 8.59433 21.5975 8.52925 21.759V21.7601Z', '#E82227'],
  ['M11.8452 0.00102935H11.7411C9.5564 0.00102935 7.51528 0.553778 5.60458 1.60781C5.19312 1.83426 4.80593 2.106 5.11427 2.63405C5.38723 3.10034 5.79262 2.96961 6.18891 2.75757C10.0437 0.681415 13.9005 0.847137 17.7542 2.75757C18.1829 2.96961 18.6236 3.11783 18.8764 2.56817C19.0968 2.08542 18.7662 1.82397 18.3638 1.61502C16.3288 0.565101 14.1734 0 11.8775 0H11.8452V0.00102935Z', 'black'],
  ['M4.28955 20.7164C4.28955 21.0746 4.5807 21.3649 4.93959 21.3649C5.02416 21.3658 5.10809 21.3498 5.18657 21.3177C5.26506 21.2856 5.33658 21.2381 5.39703 21.1779C5.45749 21.1177 5.5057 21.0459 5.53892 20.9668C5.57214 20.8876 5.58972 20.8025 5.59064 20.7164C5.58851 20.5426 5.51878 20.3767 5.39674 20.2551C5.2747 20.1336 5.11031 20.0663 4.93959 20.0679C4.76905 20.0665 4.60491 20.134 4.48309 20.2555C4.36127 20.377 4.29168 20.5427 4.28955 20.7164Z', 'black'],
  ['M12.1094 9.1744C12.1094 9.53157 12.4026 9.82287 12.7594 9.82287C12.9301 9.82452 13.0945 9.75719 13.2166 9.63563C13.3386 9.51407 13.4083 9.34821 13.4105 9.1744C13.4095 9.08829 13.392 9.00321 13.3588 8.92402C13.3255 8.84483 13.2773 8.77307 13.2169 8.71286C13.1564 8.65264 13.0849 8.60514 13.0064 8.57306C12.9279 8.54099 12.844 8.52497 12.7594 8.52592C12.5888 8.52427 12.4245 8.59164 12.3026 8.71322C12.1807 8.83481 12.1112 9.00067 12.1094 9.1744Z', 'black'],
  ['M19.7529 19.2384C19.7529 19.5945 20.0461 19.8858 20.404 19.8858C20.4886 19.8868 20.5725 19.8707 20.651 19.8387C20.7295 19.8066 20.801 19.7591 20.8614 19.6989C20.9219 19.6387 20.9701 19.5669 21.0033 19.4877C21.0365 19.4085 21.0541 19.3234 21.055 19.2373C21.0529 19.0636 20.9831 18.8979 20.8611 18.7765C20.739 18.6551 20.5746 18.588 20.404 18.5899C20.2333 18.5882 20.0689 18.6556 19.9468 18.7771C19.8248 18.8987 19.7551 19.0645 19.7529 19.2384Z', 'black'],
  ['M14.8569 16.608C14.8569 16.9641 15.1491 17.2554 15.507 17.2554C15.6778 17.2571 15.8423 17.1898 15.9645 17.0682C16.0867 16.9467 16.1566 16.7808 16.159 16.6069C16.159 16.2508 15.8659 15.9595 15.507 15.9595C15.3364 15.9581 15.1723 16.0256 15.0505 16.1471C14.9287 16.2686 14.8591 16.4343 14.8569 16.608Z', 'black'],
  ['M22.6987 12.3467C22.6987 12.7029 22.9909 12.9952 23.3498 12.9952C23.5204 12.9969 23.6847 12.9295 23.8066 12.8079C23.9285 12.6863 23.998 12.5205 23.9998 12.3467C23.9977 12.1731 23.9281 12.0074 23.8063 11.8859C23.6845 11.7643 23.5203 11.6969 23.3498 11.6983C23.1791 11.6969 23.0149 11.7643 22.8929 11.8858C22.7709 12.0073 22.7011 12.173 22.6987 12.3467Z', 'black'],
  ['M21.7334 10.2242C21.7334 10.5814 22.0246 10.8727 22.3844 10.8727C22.469 10.8736 22.5529 10.8576 22.6314 10.8255C22.7099 10.7935 22.7814 10.746 22.8419 10.6857C22.9023 10.6255 22.9506 10.5538 22.9838 10.4746C23.017 10.3954 23.0346 10.3103 23.0355 10.2242C23.0334 10.0504 22.9636 9.88452 22.8416 9.76297C22.7196 9.64141 22.5552 9.57408 22.3844 9.57572C22.2999 9.57477 22.216 9.59079 22.1375 9.62287C22.059 9.65494 21.9875 9.70244 21.927 9.76266C21.8666 9.82288 21.8183 9.89463 21.7851 9.97382C21.7519 10.053 21.7343 10.1381 21.7334 10.2242Z', 'black'],
  ['M2.9751 3.96785C2.9751 4.32606 3.26726 4.61633 3.62615 4.61633C3.71067 4.61728 3.79455 4.60125 3.87298 4.56917C3.95141 4.53708 4.02286 4.48956 4.08323 4.42933C4.14361 4.3691 4.19173 4.29734 4.22484 4.21815C4.25795 4.13897 4.2754 4.05391 4.27619 3.96785C4.2754 3.88179 4.25795 3.79674 4.22484 3.71755C4.19173 3.63837 4.14361 3.56661 4.08323 3.50638C4.02286 3.44615 3.95141 3.39863 3.87298 3.36654C3.79455 3.33445 3.71067 3.31842 3.62615 3.31938C3.54158 3.31842 3.45766 3.33444 3.37917 3.36652C3.30068 3.39859 3.22916 3.4461 3.16871 3.50631C3.10825 3.56653 3.06003 3.63828 3.02681 3.71748C2.9936 3.79667 2.97602 3.88175 2.9751 3.96785Z', 'black'],
  ['M0.652063 10.6431L0.651052 10.6411L0.642965 10.6617C0.619383 10.7044 0.601371 10.7501 0.589384 10.7975C0.034372 12.2643 0 13.7857 0 13.7857C0 14.1439 0.292164 14.4341 0.651052 14.4341C0.796131 14.4347 0.937198 14.3857 1.05173 14.295C1.16626 14.2043 1.24764 14.0772 1.2829 13.9339V13.9298C1.29442 13.8826 1.30053 13.8343 1.30109 13.7857C1.30109 13.764 1.29705 13.7414 1.29402 13.7198C1.38197 12.2643 1.81567 11.2134 1.81567 11.2134C1.84996 11.1328 1.86785 11.0459 1.86824 10.9581C1.86745 10.872 1.84996 10.7868 1.81679 10.7076C1.78362 10.6283 1.73541 10.5565 1.67492 10.4963C1.61444 10.436 1.54287 10.3885 1.46432 10.3565C1.38577 10.3245 1.30179 10.3085 1.21718 10.3096C1.10239 10.3098 0.989674 10.3408 0.890315 10.3993C0.790956 10.4578 0.708447 10.5419 0.651052 10.6431H0.652063Z', 'black'],
  ['M8.71657 6.2893C3.36863 8.41486 1.98868 13.4987 3.44243 18.4704C3.47217 18.6207 3.55223 18.7558 3.66894 18.8527C3.78566 18.9495 3.93178 19.0021 4.08236 19.0015C4.19911 19.0009 4.31358 18.9685 4.41395 18.9078C4.50982 18.8516 4.58956 18.7708 4.64524 18.6735C4.70093 18.5761 4.73063 18.4657 4.73139 18.353C4.73133 18.3115 4.72726 18.2702 4.71926 18.2295L4.71016 18.1986C4.57756 17.7304 4.46223 17.2572 4.36442 16.7802C3.32516 11.5028 6.80789 6.97689 11.9203 6.97689C16.6162 6.97689 19.7734 9.89606 19.7734 14.2903C19.7734 16.036 19.0738 16.9078 17.8323 16.8821H17.7515C17.7483 16.8843 17.7455 16.8871 17.7434 16.8903C17.589 16.9086 17.4464 16.9834 17.3422 17.1008C17.238 17.2183 17.1794 17.3703 17.1772 17.5285C17.1772 17.8281 17.3814 18.0772 17.6574 18.1513C17.6682 18.1559 17.6793 18.1594 17.6908 18.1616L17.6938 18.1626C17.6992 18.1635 17.7046 18.1646 17.71 18.1657L17.7605 18.1698C17.7828 18.1729 17.805 18.177 17.8283 18.177C17.8364 18.1769 17.8445 18.1762 17.8525 18.1749C17.984 18.1791 18.1407 18.177 18.1407 18.177C20.1787 18.0164 20.9107 16.3252 20.9107 13.8847C20.9107 9.0129 16.7395 5.62744 12.1609 5.62744C10.9827 5.62787 9.81487 5.85234 8.71758 6.2893H8.71657Z', 'black'],
  ['M8.79027 3.2896C8.7421 3.30365 8.69424 3.31875 8.64671 3.33489C7.60341 3.65398 6.73601 4.0863 5.84839 4.61743C4.62514 5.34826 3.64957 6.17378 2.62144 7.49132C2.47485 7.67969 2.21301 7.92569 2.03913 8.19229C1.95037 8.29121 1.89479 8.41629 1.88041 8.54947C1.84502 8.72651 1.88546 8.90356 2.05732 9.07031L2.07552 9.08781C2.09877 9.10942 2.12304 9.12898 2.15134 9.15162L2.16044 9.1578C2.85193 9.66732 3.2917 8.7049 3.60004 8.30758C5.2216 6.21907 6.78858 5.13004 9.01672 4.54126L9.06221 4.52994C9.19933 4.49861 9.32188 4.42069 9.40971 4.309C9.49754 4.19732 9.54541 4.05851 9.54545 3.91543C9.54545 3.87426 9.5414 3.83309 9.53433 3.79397L9.52523 3.76309C9.48932 3.62386 9.40894 3.50074 9.29673 3.41315C9.18453 3.32556 9.0469 3.27847 8.90551 3.27931C8.86687 3.27921 8.8283 3.28265 8.79027 3.2896Z', 'black'],
  ['M11.4581 2.92437C11.3736 2.92342 11.2898 2.93945 11.2113 2.97153C11.1329 3.00362 11.0614 3.05114 11.0011 3.11137C10.9407 3.1716 10.8926 3.24336 10.8595 3.32255C10.8263 3.40173 10.8089 3.48679 10.8081 3.57285C10.8081 3.92899 11.0993 4.21926 11.4581 4.21926C14.7963 4.04222 18.1587 5.41946 20.4324 8.39216L20.4566 8.42304C20.5173 8.50456 20.5957 8.57061 20.6857 8.61598C20.7757 8.66136 20.8748 8.68481 20.9753 8.68449C21.3321 8.68449 21.6223 8.39525 21.6223 8.0391C21.6178 7.86578 21.5484 7.70077 21.4282 7.57796C19.0595 4.49409 15.8952 3.0026 12.1021 2.92334H11.4571L11.4581 2.92437Z', 'black'],
  ['M15.8576 9.89788C15.8607 9.91023 15.8647 9.91949 15.8667 9.93081C15.8919 10.0645 15.8755 10.2028 15.8197 10.3265C15.7638 10.4501 15.6714 10.5529 15.5554 10.6205C15.4534 10.6827 15.3366 10.7154 15.2177 10.7152V10.7162C15.0912 10.7166 14.9673 10.6797 14.8608 10.6102C15.9011 11.4892 16.7816 12.9426 16.9373 14.4084C16.9869 14.8788 17.0344 15.3585 17.6197 15.3399C18.2839 15.3173 18.2576 14.7717 18.2334 14.29C18.222 14.0861 18.197 13.8832 18.1586 13.6827C17.8522 12.0049 16.905 10.4877 15.6352 9.54688C15.7443 9.63671 15.8222 9.75971 15.8576 9.89788Z', 'black'],
  ['M14.5547 10.0563C14.5542 10.1412 14.5707 10.2252 14.6032 10.3034C14.6366 10.3829 14.6847 10.4552 14.7448 10.5164C14.7832 10.5463 14.8216 10.5782 14.86 10.6101C15.0001 10.7019 15.1693 10.7357 15.3331 10.7048C15.4115 10.6904 15.4867 10.6622 15.5555 10.6214C15.6535 10.5645 15.7351 10.4823 15.7919 10.3831C15.8487 10.2839 15.8787 10.1712 15.8791 10.0563C15.8789 10.0142 15.8749 9.97212 15.8669 9.93075L15.8578 9.89781C15.8224 9.75935 15.7441 9.63624 15.6344 9.54681L15.6101 9.52828C15.4965 9.4429 15.3591 9.39674 15.2179 9.39652C15.044 9.3946 14.8766 9.46301 14.7522 9.58672C14.6279 9.71043 14.5568 9.87933 14.5547 10.0563Z', 'black'],
  ['M15.6548 9.56132C15.6403 9.54991 15.6255 9.53891 15.6104 9.52832C15.6245 9.53832 15.6387 9.55032 15.6548 9.56032V9.56132Z', 'black'],
  ['M14.9499 10.6844C14.8819 10.6276 14.8131 10.5716 14.7437 10.5166C14.8073 10.5794 14.8751 10.636 14.9499 10.6844Z', 'black'],
  ['M12.6198 11.3594L12.6178 11.3584L12.6128 11.3574C12.6148 11.3574 12.6168 11.3574 12.6188 11.3594H12.6198Z', 'black'],
  ['M11.73 11.3308C10.0741 11.4378 8.74061 12.6483 8.52326 14.2911C8.03497 17.9936 11.1871 22.429 14.8356 23.1732C15.2501 23.2566 15.6262 23.235 15.7536 22.7573C15.8658 22.3394 15.6121 22.1027 15.237 21.9679C14.8791 21.8392 14.5041 21.7383 14.1634 21.5716C11.4146 20.2231 9.93455 18.0183 9.79402 14.9715C9.73033 13.6097 10.6159 12.6535 11.8523 12.6051L11.8695 12.5979C11.9431 12.5861 12.0142 12.5618 12.0798 12.5258C12.1804 12.4726 12.2648 12.3924 12.324 12.2939C12.3831 12.1954 12.4148 12.0824 12.4154 11.9669C12.4146 11.8523 12.3833 11.74 12.3249 11.642C12.2666 11.544 12.1833 11.4638 12.0838 11.41C11.9951 11.36 11.8961 11.3318 11.7947 11.3277L11.7714 11.3267C11.7583 11.3267 11.7431 11.3308 11.73 11.3308Z', 'black'],
  ['M13.4414 12.879C13.4414 12.947 13.4545 13.0118 13.4748 13.0725L13.4717 13.0746L13.4818 13.0983C13.6431 13.4844 13.7835 13.8792 13.9024 14.281C13.9314 14.4416 14.0147 14.5869 14.1379 14.6916C14.261 14.7963 14.4163 14.8539 14.5767 14.8543C14.6916 14.8539 14.8045 14.8241 14.9053 14.7678C15.0123 14.7108 15.1022 14.6252 15.1652 14.5203C15.2282 14.4153 15.2621 14.2949 15.2631 14.1719C15.2635 14.094 15.2491 14.0167 15.2207 13.9444C15.0994 13.4709 14.9123 12.9171 14.6444 12.5424C14.6247 12.5098 14.602 12.4791 14.5767 12.4508C14.5727 12.4457 14.5696 12.4395 14.5646 12.4354L14.5615 12.4323C14.5006 12.3684 14.4277 12.3175 14.3471 12.2826C14.2666 12.2478 14.18 12.2298 14.0925 12.2295C13.9217 12.2279 13.7573 12.2952 13.6353 12.4168C13.5133 12.5383 13.4435 12.7042 13.4414 12.878V12.879Z', 'black'],
  ['M8.33337 19.8196C8.31345 19.7783 8.29082 19.7384 8.26562 19.7002L8.33337 19.8196Z', 'black'],
  ['M7.23425 20.5074L7.16349 20.3829L7.12305 20.3149C7.15439 20.3829 7.19179 20.4488 7.23425 20.5074Z', 'black'],
  ['M10.1025 8.77712C7.41944 9.57999 5.6068 12.0473 5.63409 15.0416C5.6897 16.915 6.49441 19.1929 7.02921 20.146C7.05347 20.1955 7.09694 20.2706 7.12323 20.3149L7.14648 20.3529L7.18591 20.4219C7.30419 20.5907 7.4993 20.6998 7.71868 20.6998C7.8319 20.6998 7.93805 20.6689 8.03207 20.6175C8.13373 20.563 8.21899 20.4815 8.2788 20.3816C8.33861 20.2818 8.37073 20.1673 8.37175 20.0503C8.37175 19.9474 8.34648 19.8527 8.30402 19.7662C8.29088 19.7456 8.27875 19.722 8.2656 19.6993C7.3446 18.1547 6.88937 16.3687 6.95642 14.563C7.02415 12.3654 8.55878 10.5877 10.521 9.98967C10.5594 9.98229 10.5969 9.97126 10.6333 9.95673C10.6919 9.93923 10.8638 9.82909 10.8799 9.78174C10.9865 9.66588 11.0461 9.51329 11.0467 9.35457C11.0459 9.26851 11.0285 9.18346 10.9954 9.10427C10.9623 9.02509 10.9142 8.95333 10.8538 8.89309C10.7934 8.83286 10.722 8.78535 10.6435 8.75326C10.5651 8.72117 10.4812 8.70514 10.3967 8.70609C10.2926 8.70609 10.1045 8.77712 10.1035 8.77712H10.1025Z', '#00AC75'],
  ['M11.9304 14.1638C11.3188 14.2091 11.3138 14.8215 11.3441 15.3063C11.5483 18.4417 14.195 20.8647 17.4027 20.8987C17.613 20.8987 17.8233 20.8771 18.0346 20.8482L18.1589 20.8307C18.2145 20.8162 18.2682 20.7948 18.3186 20.7669C18.4209 20.7125 18.5067 20.6307 18.5669 20.5305C18.6271 20.4302 18.6594 20.3152 18.6603 20.1977C18.6593 20.0809 18.6273 19.9665 18.5677 19.8667C18.5081 19.7668 18.4231 19.6853 18.3217 19.6305C18.231 19.5797 18.1299 19.5515 18.0265 19.5482L17.9163 19.5564C15.1281 19.7983 12.8615 17.9342 12.6199 15.1581C12.5795 14.697 12.5926 14.1597 12.0083 14.1597C11.983 14.1597 11.9577 14.1617 11.9304 14.1638Z', 'black'],
];

// Disabled logo: the published symbol dims the logo group to opacity 0.34 — an unbound
// literal (no opacity token). Used as published; logged as a design question.
const UAE_PASS_LOGO_DISABLED_OPACITY = 0.34;

function UaePassLogo({ disabled }: { disabled?: boolean }) {
  const box = scale('24');
  return (
    <svg
      width={parseFloat(box)} height={parseFloat(box)} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"
      style={{ display: 'block', flexShrink: 0, opacity: disabled ? UAE_PASS_LOGO_DISABLED_OPACITY : undefined }}
    >
      {UAE_PASS_LOGO.map(([d, fill], i) => <path key={i} d={d} fill={fill} />)}
    </svg>
  );
}

export const UaePassButton = forwardRef<HTMLButtonElement, UaePassButtonProps>(function UaePassButton(
  {
    variant = 'login', block, children, style, type = 'button', disabled,
    onFocus, onBlur, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp,
    ...rest
  },
  ref,
) {
  // No pressed state in Figma; the hook is used for the focus ring only.
  const { ring, handlers } = useInteraction(false, {
    onFocus, onBlur, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp,
  });
  const rtl = variant === 'rtl';
  // Stroke: button/secondary/text/midnight/default (enabled) · button/secondary/border/brand/disabled.
  // Label: button/secondary/text/midnight/{default|disabled}. Bound exactly as published.
  const stroke = color(disabled ? 'button.secondary.border.brand.disabled' : 'button.secondary.text.midnight.default');
  const fg = color(disabled ? 'button.secondary.text.midnight.disabled' : 'button.secondary.text.midnight.default');
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      dir={rtl ? 'rtl' : undefined}
      lang={rtl ? 'ar' : undefined}
      {...handlers}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        height: scale('48'), minWidth: scale('48'), padding: `0 ${space('md')}`, margin: 0,
        border: 0, borderRadius: radius('9'), background: 'transparent', color: fg,
        boxShadow: insideStroke(stroke), width: block ? '100%' : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
        ...ty('button.lg'),
        ...(ring ? focusRing(false) : NO_RING),
        ...style,
      }}
      {...rest}
    >
      {/* DOM order logo → text; under dir="rtl" the logo lands after the text, as in Figma. */}
      <UaePassLogo disabled={disabled} />
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0 ${CONTENT_PAD}` }}>
        <span style={{ padding: `0 ${LABEL_PAD.lg}` }}>{children ?? UAE_PASS_LABEL[variant]}</span>
      </span>
    </button>
  );
});
