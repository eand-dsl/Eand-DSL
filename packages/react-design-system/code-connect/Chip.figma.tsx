import figma from '@figma/code-connect';
import { Chip } from '../src';

// Chips (node 31539:8725)
figma.connect(Chip, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=31539-8725', {
  props: {
    type: figma.enum('type', { outline: 'outline', filled: 'filled', glass: 'glass', inverse: 'inverse' }),
    selected: figma.enum('state', { default: false, focus: true, disabled: false }),
    disabled: figma.enum('state', { default: false, focus: false, disabled: true }),
  },
  example: (p) => (
    <Chip type={p.type} selected={p.selected} disabled={p.disabled}>Category</Chip>
  ),
});
