import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonTone = 'brand' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Stretch to fill the container width (block CTA, e.g. in an Action bar). */
  block?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const cb = (p: string) => `var(--eand-color-button-${p})`;

function buttonVars(variant: ButtonVariant, tone: ButtonTone): CSSProperties {
  if (variant === 'primary') {
    return {
      '--btn-surface': cb(`primary-surface-${tone}-default`),
      '--btn-surface-focus': cb(`primary-surface-${tone}-focus`),
      '--btn-surface-disabled': cb(`primary-surface-${tone}-disabled`),
      '--btn-text': cb(`primary-text-${tone}-default`),
      '--btn-text-focus': cb(`primary-text-${tone}-focus`),
      '--btn-text-disabled': cb(`primary-text-${tone}-disabled`),
    } as CSSProperties;
  }
  // secondary: transparent fill, token border + text; focus tints the fill.
  return {
    '--btn-surface': 'transparent',
    '--btn-surface-focus': cb(`secondary-surface-${tone}-focus`),
    '--btn-surface-disabled': 'transparent',
    '--btn-text': cb(`primary-text-inverse-default`),
    '--btn-text-focus': cb(`primary-text-inverse-focus`),
    '--btn-text-disabled': cb(`primary-text-inverse-disabled`),
    '--btn-border': cb(`secondary-border-${tone}-default`),
    '--btn-border-focus': cb(`secondary-border-${tone}-focus`),
    '--btn-border-disabled': cb(`secondary-border-${tone}-disabled`),
  } as CSSProperties;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', tone = 'brand', size = 'md', block, leadingIcon, trailingIcon, children, className, style, type = 'button', ...rest },
  ref,
) {
  const cls = [styles.button, styles[size], block ? styles.block : '', className].filter(Boolean).join(' ');
  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      style={{ ...buttonVars(variant, tone), ...style }}
      {...rest}
    >
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </button>
  );
});
