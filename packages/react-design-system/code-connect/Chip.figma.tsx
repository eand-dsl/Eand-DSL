import figma from '@figma/code-connect';
import { Chip } from '../src';

// e& Consumer App DSL V1.2 — chips (node 31539:8725). V1.2 renamed the state `focus` to
// `selected`. The label is the `label-string` TEXT property on the nested `.chips-core`.
figma.connect(Chip, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=31539-8725', {
  props: {
    type: figma.enum('type', { outline: 'outline', filled: 'filled', glass: 'glass', inverse: 'inverse' }),
    selected: figma.enum('state', { default: false, selected: true, disabled: false }),
    disabled: figma.enum('state', { default: false, selected: false, disabled: true }),
    core: figma.nestedProps('.chips-core', {
      label: figma.string('label-string'),
    }),
  },
  example: (p) => (
    <Chip type={p.type} selected={p.selected} disabled={p.disabled}>{p.core.label}</Chip>
  ),
});
