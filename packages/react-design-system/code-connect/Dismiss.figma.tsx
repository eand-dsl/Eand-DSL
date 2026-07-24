import figma from '@figma/code-connect';
import { Dismiss } from '../src';

// Dismiss (node 28961:19839)
figma.connect(Dismiss, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=28961-19839', {
  props: {
    surface: figma.enum('surface', { default: 'default', inverse: 'inverse' }),
    size: figma.enum('small', { no: 'md', yes: 'sm' }),
  },
  example: (p) => <Dismiss surface={p.surface} size={p.size} />,
});
