import figma from '@figma/code-connect';
import { Checkbox } from '../src';

// Checkbox (node 27685:5017) — unified mark; radio=yes renders the Radio circle
figma.connect(Checkbox, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=27685-5017', {
  props: {
    size: figma.enum('size', { sm: 'sm', md: 'md' }),
    inverse: figma.enum('color-scheme', { default: false, inverse: true }),
    radio: figma.enum('radio (single selection)', { yes: true, no: false }),
    checked: figma.enum('selected', { No: false, Yes: true }),
    disabled: figma.enum('Disabled', { No: false, Yes: true }),
  },
  example: (p) => (
    <Checkbox size={p.size} inverse={p.inverse} radio={p.radio} defaultChecked={p.checked} disabled={p.disabled} label="Label" />
  ),
});
