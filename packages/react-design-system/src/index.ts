// e& Consumer App design system — web React components for Figma Make.
import './tokens/tokens.css';

export { tokens } from './tokens/tokens';

export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonTone, ButtonSize } from './components/Button';

export * from './components/primitives';
export * from './components/layout';
export * from './components/navigation';
export * from './components/controls';
export * from './components/feedback';
export * from './components/overlays';
export * from './components/cards';
export * from './components/ctabar';

// e& App Icons — folded in (name-based <Icon name="…" />, named *Icon components,
// the ICONS registry, and ICON_META descriptions/aliases).
export * from './icons';
