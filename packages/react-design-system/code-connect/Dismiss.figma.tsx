import figma from '@figma/code-connect';
import { Dismiss } from '../src';

// e& Consumer App DSL V1.2 — dismiss (node 28961:19839). `small` is false|true in V1.2.
figma.connect(Dismiss, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=28961-19839', {
  props: {
    surface: figma.enum('surface', { default: 'default', inverse: 'inverse' }),
    size: figma.enum('small', { false: 'md', true: 'sm' }),
  },
  example: (p) => <Dismiss surface={p.surface} size={p.size} />,
});
