import figma from '@figma/code-connect';
import { Alert } from '../src';

// e& Consumer App DSL V1.1 — alert-message (node 30969:1112)
//
// The Figma property is spelled `Staus` — a typo in the file. figma.enum must use that
// exact key; 'Status' silently returns nothing.
//
// The V1.0 `tone` names are NOT a straight relabel of these: Figma's `Alert` is the amber
// step and its `Warning` is the orange one, so tone="warning" corresponds to status
// "alert". The mapping below targets the current `status` prop and sidesteps that.
figma.connect(Alert, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=30969-1112', {
  props: {
    status: figma.enum('Staus', {
      Success: 'success',
      Alert: 'alert',
      Warning: 'warning',
      Info: 'info',
    }),
  },
  example: (p) => <Alert status={p.status} title="Heads up">Something needs your attention</Alert>,
});
