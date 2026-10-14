import figma from '@figma/code-connect';
import { FilterPill } from '../src';

// e& Consumer App DSL V1.2 — filter-pill (node 26151:391). V1.2 axes are `state`
// (default | disabled | selected — `Focused` was renamed `selected`) and `inverse`
// (false | true, was `Color` Default|Inverse). The label is a plain text layer in
// `.filter-pill-body`, no longer a `Text` property, so the example uses fixed copy.
// NOT MAPPED — `has-loader`: orphaned in Figma, and the pill has no loader in code.
figma.connect(FilterPill, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26151-391', {
  props: {
    inverse: figma.enum('inverse', { false: false, true: true }),
    selected: figma.enum('state', { default: false, selected: true, disabled: false }),
    disabled: figma.enum('state', { default: false, selected: false, disabled: true }),
  },
  example: (p) => (
    <FilterPill inverse={p.inverse} selected={p.selected} disabled={p.disabled}>Filter</FilterPill>
  ),
});
