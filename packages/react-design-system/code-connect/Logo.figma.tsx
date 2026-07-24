import figma from '@figma/code-connect';
import { Logo } from '../src';

// e& logo (node 27032:50455). The code Logo renders the wordmark; the Figma
// `version` (default|white|midnight|red) has no code prop yet, so it's omitted.
figma.connect(Logo, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=27032-50455', {
  example: () => <Logo />,
});
