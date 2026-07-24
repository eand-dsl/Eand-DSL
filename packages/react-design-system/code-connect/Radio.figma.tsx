import figma from '@figma/code-connect';
import { Radio } from '../src';

// Radio (node 26369:775)
figma.connect(Radio, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26369-775', {
  props: {
    size: figma.enum('small', { yes: 'sm', no: 'lg' }),
    inverse: figma.enum('color-scheme', { default: false, inverse: true }),
    checked: figma.enum('selected', { No: false, Yes: true }),
    disabled: figma.enum('Disabled', { No: false, Yes: true }),
  },
  example: (p) => (
    <Radio size={p.size} inverse={p.inverse} defaultChecked={p.checked} disabled={p.disabled} label="Label" />
  ),
});
