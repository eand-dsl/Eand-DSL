import figma from '@figma/code-connect';
import { FilterPill } from '../src';

// Filter Pill (node 26151:391)
figma.connect(FilterPill, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26151-391', {
  props: {
    text: figma.string('Text'),
    inverse: figma.enum('Color', { Default: false, Inverse: true }),
    selected: figma.enum('State', { Default: false, Focused: true, Disabled: false }),
    disabled: figma.enum('State', { Default: false, Focused: false, Disabled: true }),
  },
  example: (p) => (
    <FilterPill inverse={p.inverse} selected={p.selected} disabled={p.disabled}>{p.text}</FilterPill>
  ),
});
