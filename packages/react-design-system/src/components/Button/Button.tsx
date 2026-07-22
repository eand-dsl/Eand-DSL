import { forwardRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { color, space, ty, PILL } from '../../system';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link' | 'glass';
/**
 * Backing surface the button sits on (Figma V1.1 axis).
 * primary: brand | inverse-brand · secondary: brand | white · tertiary/link: brand | white | midnight.
 */
export type ButtonSurface = 'brand' | 'inverse-brand' | 'white' | 'midnight';
/** @deprecated Back-compat alias for `surface` — 'inverse' maps to inverse-brand / white. */
export type ButtonTone = 'brand' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonState = 'default' | 'focus' | 'disabled';
type TokenKey = 'brand' | 'inverse' | 'midnight';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  /** Surface axis per Figma V1.1. Takes precedence over `tone` when both are set. */
  surface?: ButtonSurface;
  /** @deprecated Use `surface` instead. Kept as a back-compat alias. */
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Stretch to fill the container width (block CTA). */
  block?: boolean;
  /** Show a spinner in the leading-icon slot and suppress clicks (Figma `Loader <-> Icon=on`).
   *  Keeps the default palette — loading is not the disabled state. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
const PAD: Record<ButtonSize, string> = { sm: 'sm', md: 'lg', lg: 'xl' };

// Token groups in tokens.ts are keyed brand | inverse | midnight; the Figma surface
// values map onto them (inverse-brand and white both resolve to the `inverse` group).
const TOKEN_KEY: Record<ButtonSurface, TokenKey> = {
  brand: 'brand',
  'inverse-brand': 'inverse',
  white: 'inverse',
  midnight: 'midnight',
};

// Figma vars color/button/glass/{surface,text}/{state} — V1.1 glass button (31511:8011),
// brand surface only. Not yet in the generated tokens.ts (variables.json export predates
// the glass group), values from live Figma; frosted look via a 20px backdrop blur.
const GLASS: Record<ButtonState, { bg: string; fg: string }> = {
  default:  { bg: '#ffffff26', fg: '#ffffff' },
  focus:    { bg: '#bb0700',   fg: '#ffffff' },
  disabled: { bg: '#ffffff1a', fg: '#ffffff80' },
};

function palette(variant: ButtonVariant, key: TokenKey, state: ButtonState): CSSProperties {
  if (variant === 'glass') {
    return {
      background: GLASS[state].bg,
      color: GLASS[state].fg,
      border: '2px solid transparent',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    };
  }
  if (variant === 'primary') {
    return {
      background: color(`button.primary.surface.${key}.${state}`),
      color: color(`button.primary.text.${key}.${state}`),
      border: '2px solid transparent',
    };
  }
  if (variant === 'secondary') {
    // transparent fill (token fill on focus), token border + text
    return {
      background: state === 'focus' ? color(`button.secondary.surface.${key}.focus`) : 'transparent',
      color: color(`button.secondary.text.${key}.${state}`),
      border: `2px solid ${color(`button.secondary.border.${key}.${state}`)}`,
    };
  }
  // tertiary (text-only) and link (underlined text)
  return {
    background: 'transparent',
    color: color(`button.${variant}.text.${key}.${state}`),
    border: '2px solid transparent',
    textDecoration: variant === 'link' ? 'underline' : undefined,
  };
}

/** Self-contained SVG spinner for the loading state (animateTransform, no keyframes). */
function ButtonSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary', surface, tone, size = 'md', block, loading, leadingIcon, trailingIcon,
    children, style, type = 'button', disabled, onFocus, onBlur, onClick, ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const key: TokenKey = surface ? TOKEN_KEY[surface] : tone === 'inverse' ? 'inverse' : 'brand';
  const state: ButtonState = disabled ? 'disabled' : focused ? 'focus' : 'default';
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('2xs'),
        height: HEIGHT[size], padding: `0 ${space(PAD[size])}`, borderRadius: PILL,
        width: block ? '100%' : undefined, cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer',
        whiteSpace: 'nowrap', opacity: disabled ? 0.6 : 1,
        ...ty(`button.${size}`), ...palette(variant, key, state), ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}><ButtonSpinner /></span>
      ) : leadingIcon ? (
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{leadingIcon}</span>
      ) : null}
      {children}
      {trailingIcon ? <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{trailingIcon}</span> : null}
    </button>
  );
});
