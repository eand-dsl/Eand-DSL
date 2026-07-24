import figma from '@figma/code-connect';
import { Button } from '../src';

// e& Consumer App DSL V1.1 — Buttons (node 25394:85067)
figma.connect(Button, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=25394-85067', {
  props: {
    label: figma.string('💬 text-content'),
    variant: figma.enum('type', { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', link: 'link', glass: 'glass' }),
    size: figma.enum('📐 size', { lg: 'lg', md: 'md', sm: 'sm' }),
    surface: figma.enum('🎨 surface', { '🔴 brand': 'brand', '⚪️ white': 'white', '⚫️ midnight': 'midnight', '⚪️🔴 inverse-brand': 'inverse-brand' }),
    disabled: figma.enum('💡 state', { default: false, disabled: true, focus: false }),
  },
  example: (p) => (
    <Button variant={p.variant} size={p.size} surface={p.surface} disabled={p.disabled}>
      {p.label}
    </Button>
  ),
});
