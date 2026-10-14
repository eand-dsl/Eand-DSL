import figma from '@figma/code-connect';
import { PlanCard } from '../src';

// e& Consumer App DSL V1.2 — plans-portable (node 26003:40647), renamed from plans-mini.
//
// One axis, `color-scheme`. The content is the nested `.plans-portable-core` 37502:7996,
// whose V1.2 property names changed: `overline-string` (was `top-line-string`),
// `title-string` (was `heading-string`), plus the new `overline` and `price-from` booleans.
figma.connect(PlanCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26003-40647', {
  props: {
    colorScheme: figma.enum('color-scheme', { default: 'default', inverse: 'inverse' }),
    core: figma.nestedProps('.plans-portable-core', {
      category: figma.boolean('overline', {
        true: figma.string('overline-string'),
        false: '',
      }),
      name: figma.string('title-string'),
      price: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
      from: figma.boolean('price-from'),
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
      from={p.core.from}
      discount={p.core.discount}
      smiles={p.core.smiles}
    />
  ),
});
