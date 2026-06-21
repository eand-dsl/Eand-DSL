import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { color, space, ty, PILL } from '../../system';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonTone = 'brand' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Stretch to fill the container width (block CTA). */
  block?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
const PAD: Record<ButtonSize, string> = { sm: 'sm', md: 'lg', lg: 'xl' };

function palette(variant: ButtonVariant, tone: ButtonTone, disabled?: boolean): CSSProperties {
  const st = disabled ? 'disabled' : 'default';
  if (variant === 'primary') {
    return {
      background: color(`button.primary.surface.${tone}.${st}`),
      color: color(`button.primary.text.${tone}.${st}`),
      border: '2px solid transparent',
    };
  }
  // secondary: transparent fill, token border, matching text
  const line = color(`button.secondary.border.${tone}.${st}`);
  return { background: 'transparent', color: line, border: `2px solid ${line}` };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', tone = 'brand', size = 'md', block, leadingIcon, trailingIcon, children, style, type = 'button', disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('2xs'),
        height: HEIGHT[size], padding: `0 ${space(PAD[size])}`, borderRadius: PILL,
        width: block ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', opacity: disabled ? 0.6 : 1,
        ...ty(`button.${size}`), ...palette(variant, tone, disabled), ...style,
      }}
      {...rest}
    >
      {leadingIcon ? <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{trailingIcon}</span> : null}
    </button>
  );
});
