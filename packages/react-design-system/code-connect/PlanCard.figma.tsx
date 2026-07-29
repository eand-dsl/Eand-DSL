import figma from '@figma/code-connect';
import { PlanCard } from '../src';

// e& Consumer App DSL V1.1 — plans-mini (node 26003:40647)
//
// CORRECTED TARGET. This previously pointed at card-features-package 25893:54098, which
// is `card-features-addon` — ProductCard's component, not PlanCard's. The property names
// lined up, so the mapping parsed and published cleanly while describing the wrong
// component. plans-mini is the real Plans card.
//
// Layer names below are the ORIGINAL file's: the core is `plans-mini-core` (undotted here,
// unlike most cores) and the surfaces are `.surface-default` / `.surface-inverse`.
figma.connect(PlanCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26003-40647', {
  props: {
    colorScheme: figma.enum('color-scheme', { default: 'default', inverse: 'inverse' }),
    core: figma.nestedProps('plans-mini-core', {
      category: figma.string('top-line-string'),
      name: figma.string('heading-string'),
      price: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
      discount: figma.boolean('badge'),
      smiles: figma.boolean('logo-row'),
    }),
  },
  example: (p) => (
    <PlanCard
      colorScheme={p.colorScheme}
      category={p.core.category}
      name={p.core.name}
      price={p.core.price}
      period={p.core.period}
      discount={p.core.discount}
      smiles={p.core.smiles}
    />
  ),
});
