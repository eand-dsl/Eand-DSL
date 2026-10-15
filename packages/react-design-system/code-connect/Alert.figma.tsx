import figma from '@figma/code-connect';
import { Alert } from '../src';

// e& Consumer App DSL V1.2 — alert-message (node 40289:34516), "Alert message and snack bar".
//
// Retargeted from 30969:1112, whose frame reads "OUTDATED (do not use)" and whose status
// axis was the misspelled `Staus`. In V1.2 the set's own axis is `Stack` (no | yes); the
// status lives one level down on `.alert-message-core` 37215:9573 as `State`.
//
// The V1.0 `tone` names are NOT a straight relabel of these: Figma's `Alert` is the amber
// step and its `Warning` is the orange one, so tone="warning" corresponds to status
// "alert". The mapping below targets the current `status` prop and sidesteps that.
//
// `Stack=yes` draws the step counter for alerts sharing one slot; 2 is the smallest stack.
figma.connect(Alert, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=40289-34516', {
  props: {
    core: figma.nestedProps('.alert-message-core', {
      status: figma.enum('State', {
        Success: 'success',
        Alert: 'alert',
        Warning: 'warning',
        Info: 'info',
        'Info Midnight': 'info-midnight',
      }),
    }),
    stack: figma.enum('Stack', { yes: 2, no: undefined }),
  },
  example: (p) => (
    <Alert status={p.core.status} stack={p.stack} title="Heads up">
      Something needs your attention
    </Alert>
  ),
});
