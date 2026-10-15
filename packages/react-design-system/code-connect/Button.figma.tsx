import figma from '@figma/code-connect';
import { Button, UaePassButton } from '../src';

// e& Consumer App DSL V1.2 — button (node 25394:85067)
//
// V1.2 dropped the emoji axis names: the axes are `type`, `size`, `scheme`
// (default | inverse | midnight) and `state` (default | disabled | pressed — `focus` was
// renamed `pressed`). `scheme` maps 1:1 onto the code's `scheme` prop, which replaces the
// deprecated `surface` / `tone`. The label is the `label-string` TEXT property on the
// nested `button-content` instance.
figma.connect(Button, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=25394-85067', {
  props: {
    content: figma.nestedProps('button-content', {
      label: figma.string('label-string'),
    }),
    variant: figma.enum('type', { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', link: 'link', glass: 'glass' }),
    size: figma.enum('size', { lg: 'lg', md: 'md', sm: 'sm' }),
    scheme: figma.enum('scheme', { default: 'default', inverse: 'inverse', midnight: 'midnight' }),
    // `pressed` is an interaction state, not a prop: it renders as a default button.
    disabled: figma.enum('state', { default: false, disabled: true, pressed: false }),
  },
  example: (p) => (
    <Button variant={p.variant} size={p.size} scheme={p.scheme} disabled={p.disabled}>
      {p.content.label}
    </Button>
  ),
});

// e& Consumer App DSL V1.2 — button-uae-pass (node 39861:22282)
//
// Figma's `type` axis is the code's `variant` (`type` is the HTML button attribute). The
// label is fixed copy per variant, so it is not mapped.
figma.connect(UaePassButton, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=39861-22282', {
  props: {
    variant: figma.enum('type', { login: 'login', continue: 'continue', rtl: 'rtl' }),
    disabled: figma.enum('disabled', { false: false, true: true }),
  },
  example: (p) => <UaePassButton variant={p.variant} disabled={p.disabled} />,
});
