import figma from '@figma/code-connect';
import { Stepper } from '../src';

// Stepper (node 32960:73561)
figma.connect(Stepper, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=32960-73561', {
  props: {
    steps: figma.enum('steps', { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 }),
  },
  example: (p) => <Stepper steps={p.steps} progress={2} />,
});
