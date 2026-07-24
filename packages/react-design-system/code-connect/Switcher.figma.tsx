import figma from '@figma/code-connect';
import { Switcher } from '../src';

// Switcher (node 26215:7141)
figma.connect(Switcher, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26215-7141', {
  props: {
    size: figma.enum('Small', { Yes: 'sm', No: 'lg' }),
    on: figma.enum('Active', { Yes: true, No: false }),
    disabled: figma.enum('disabled', { no: false, yes: true }),
  },
  example: (p) => <Switcher size={p.size} defaultChecked={p.on} disabled={p.disabled} />,
});
