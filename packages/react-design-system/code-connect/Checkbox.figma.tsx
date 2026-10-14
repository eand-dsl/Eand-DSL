import figma from '@figma/code-connect';
import { Checkbox } from '../src';

// e& Consumer App DSL V1.2 — checkbox (node 27685:5017). Unified mark; radio=true renders
// the round mark. V1.2 renamed the axes to plain booleans: `inverse` (was `color-scheme`),
// `radio` (was `radio (single selection)` yes|no), `selected` and `disabled` (were Yes|No).
figma.connect(Checkbox, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=27685-5017', {
  props: {
    size: figma.enum('size', { sm: 'sm', md: 'md' }),
    inverse: figma.enum('inverse', { false: false, true: true }),
    radio: figma.enum('radio', { false: false, true: true }),
    checked: figma.enum('selected', { false: false, true: true }),
    disabled: figma.enum('disabled', { false: false, true: true }),
  },
  example: (p) => (
    <Checkbox size={p.size} inverse={p.inverse} radio={p.radio} defaultChecked={p.checked} disabled={p.disabled} label="Label" />
  ),
});
