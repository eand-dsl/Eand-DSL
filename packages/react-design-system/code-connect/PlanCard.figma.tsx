import figma from '@figma/code-connect';
import { PlanCard } from '../src';

// e& Consumer App DSL V1.1 — card-features-package (node 25893:54098)
// `price`/`period` come from the nested `.product-card-price` instance, which owns the
// price-string + price-monthly properties (they are not lifted to the top level).
// Unmapped by design: `.card-bg-color`.color and `.product-card-price`.type each expose a
// single option at this node ("default" / "smiles"), so there is nothing to switch on —
// `variant` and `smiles` keep their code defaults.
figma.connect(PlanCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=25893-54098', {
  props: {
    name: figma.string('addon-name'),
    category: figma.string('top-line-string'),
    discount: figma.boolean('badge'),
    price: figma.nestedProps('.product-card-price', {
      value: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
    }),
  },
  example: (p) => (
    <PlanCard
      name={p.name}
      category={p.category}
      discount={p.discount}
      price={p.price.value}
      period={p.price.period}
    />
  ),
});
