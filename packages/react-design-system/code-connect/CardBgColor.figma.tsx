import figma from '@figma/code-connect';
import { CardBgColor } from '../src';

// e& Consumer App DSL V1.2 — .card-bg-color (node 25710:20065)
//
// One `color` axis, eight tints, 224x272. The frames bind border-radius/6 (16).
//
// The variant labels are kept verbatim because that is what a designer selects, but two
// of them bind a differently-named token: `cyan` -> atom-surfaces/blue and `blue` ->
// atom-surfaces/purple. CardBgColor resolves that internally, so the enum below is a
// straight label pass-through.
figma.connect(CardBgColor, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=25710-20065', {
  props: {
    tint: figma.enum('color', {
      default: 'default',
      red: 'red',
      orange: 'orange',
      yellow: 'yellow',
      green: 'green',
      cyan: 'cyan',
      blue: 'blue',
      violet: 'violet',
    }),
  },
  example: (p) => <CardBgColor tint={p.tint} />,
});
