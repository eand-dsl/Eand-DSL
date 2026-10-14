import figma from '@figma/code-connect';
import { Switcher } from '../src';

// e& Consumer App DSL V1.2 — switcher (node 26215:7141). Axes `inverse`, `small`, `active`
// and `disabled`, all false|true. `small=false` is the 40×24 `md` (the code's `lg` is a
// deprecated alias of it); `small=true` is the 32×20 `sm`.
figma.connect(Switcher, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26215-7141', {
  props: {
    size: figma.enum('small', { true: 'sm', false: 'md' }),
    inverse: figma.enum('inverse', { false: false, true: true }),
    on: figma.enum('active', { true: true, false: false }),
    disabled: figma.enum('disabled', { false: false, true: true }),
  },
  example: (p) => <Switcher size={p.size} inverse={p.inverse} defaultChecked={p.on} disabled={p.disabled} />,
});
