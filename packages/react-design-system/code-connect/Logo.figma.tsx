import figma from '@figma/code-connect';
import { Logo } from '../src';

// e& Consumer App DSL V1.2 — etisalat-logo (node 27032:50455). The V1.2 rebrand replaced
// the e& lockup with the etisalat logo; its `color-scheme` axis (default | white | red) is
// the code's `version`. (`midnight` was removed in V1.2 and is deprecated in code.)
figma.connect(Logo, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=27032-50455', {
  props: {
    version: figma.enum('color-scheme', { default: 'default', white: 'white', red: 'red' }),
  },
  example: (p) => <Logo version={p.version} />,
});
