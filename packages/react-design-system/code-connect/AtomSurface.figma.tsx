import figma from '@figma/code-connect';
import { AtomSurface } from '../src';

// e& Consumer App DSL V1.2 — the surface-color atoms.
//
// Two Figma components share one axis named `surface-color`, so both map onto the single
// AtomSurface component and its `surfaceColor` prop. (`brand` comes from the Plans copy
// of the atom, 26003:41829, not from these two sets, so it is not mapped here.)
//
// Figma's labels do not match the tokens they bind (`subtle` binds surface/base/default,
// `default` binds surface/base/inverse). The labels are preserved here because that is
// what designers pick; AtomSurface resolves each to the token verified on its variant node.

// default-surface 26770:100166 — default | subtle | sunken
figma.connect(AtomSurface, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26770-100166', {
  props: {
    surfaceColor: figma.enum('surface-color', {
      default: 'default',
      subtle: 'subtle',
      sunken: 'sunken',
    }),
  },
  example: (p) => <AtomSurface surfaceColor={p.surfaceColor} />,
});

// inverse-surface 26770:100161 — midnight-base | midnight-raised | glass-midnight | glass-white
figma.connect(AtomSurface, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26770-100161', {
  props: {
    surfaceColor: figma.enum('surface-color', {
      'midnight-base': 'midnight-base',
      'midnight-raised': 'midnight-raised',
      'glass-midnight': 'glass-midnight',
      'glass-white': 'glass-white',
    }),
  },
  example: (p) => <AtomSurface surfaceColor={p.surfaceColor} />,
});
