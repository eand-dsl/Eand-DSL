import figma from '@figma/code-connect';
import { Radio } from '../src';

// e& Consumer App DSL V1.2 — radio-button (node 26369:775). `small`, `selected` and
// `disabled` are false|true in V1.2 (were yes|no / Yes|No).
figma.connect(Radio, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26369-775', {
  props: {
    size: figma.enum('small', { true: 'sm', false: 'lg' }),
    inverse: figma.enum('color-scheme', { default: false, inverse: true }),
    checked: figma.enum('selected', { false: false, true: true }),
    disabled: figma.enum('disabled', { false: false, true: true }),
  },
  example: (p) => (
    <Radio size={p.size} inverse={p.inverse} defaultChecked={p.checked} disabled={p.disabled} label="Label" />
  ),
});
