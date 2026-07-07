import { forwardRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { color, space, ty, PILL } from '../../system';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link';
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

function palette(variant: ButtonVariant, key: TokenKey, state: ButtonState): CSSProperties {
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary', surface, tone, size = 'md', block, leadingIcon, trailingIcon,
    children, style, type = 'button', disabled, onFocus, onBlur, ...rest
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
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('2xs'),
        height: HEIGHT[size], padding: `0 ${space(PAD[size])}`, borderRadius: PILL,
        width: block ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', opacity: disabled ? 0.6 : 1,
        ...ty(`button.${size}`), ...palette(variant, key, state), ...style,
      }}
      {...rest}
    >
      {leadingIcon ? <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{trailingIcon}</span> : null}
    </button>
  );
});
