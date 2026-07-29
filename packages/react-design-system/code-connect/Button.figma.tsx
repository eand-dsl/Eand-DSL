import figma from '@figma/code-connect';
import { Button } from '../src';

// e& Consumer App DSL V1.1 — Buttons (node 25394:85067)
figma.connect(Button, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=25394-85067', {
  props: {
    label: figma.string('💬 text-content'),
    variant: figma.enum('type', { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', link: 'link', glass: 'glass' }),
    size: figma.enum('📐 size', { lg: 'lg', md: 'md', sm: 'sm' }),
    // The Figma axis is `🎨 scheme`, not `🎨 surface`, and its values are
    // `🔴 default` / `⚪️ inverse` — not `🔴 brand` / `⚪️ white`. With the old key and
    // values this enum resolved to nothing, so `surface` never appeared in Dev Mode.
    // `🔴 default` is the code's `brand` (its default surface); `⚪️ inverse` is `white`.
    surface: figma.enum('🎨 scheme', {
      '🔴 default': 'brand',
      '⚫️ midnight': 'midnight',
      '⚪️ inverse': 'white',
      '⚪️🔴 inverse-brand': 'inverse-brand',
    }),
    disabled: figma.enum('💡 state', { default: false, disabled: true, focus: false }),
  },
  example: (p) => (
    <Button variant={p.variant} size={p.size} surface={p.surface} disabled={p.disabled}>
      {p.label}
    </Button>
  ),
});
