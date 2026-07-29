import figma from '@figma/code-connect';
import { ProductCard } from '../src';

// e& Consumer App DSL V1.1 — card-features, three sibling components (not a variant set).
// Each is 229x300 (section/body/height/row-4) at border-radius/6 = 20, no resting border.
// `type` selects the sibling, so each node gets its own connect() with the type fixed.
//
// card-features-addon 25893:54098 — no image; content fills; Smiles pricing.
// This node was previously claimed by PlanCard.figma.tsx.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=25893-54098', {
  props: {
    eyebrow: figma.string('top-line-string'),
    title: figma.string('addon-name'),
    discount: figma.boolean('badge'),
    price: figma.nestedProps('.product-card-price', {
      value: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
    }),
  },
  example: (p) => (
    <ProductCard
      type="addon"
      eyebrow={p.eyebrow}
      title={p.title}
      discount={p.discount}
      price={p.price.value}
      period={p.price.period}
    />
  ),
});

// card-features-product 26522:14492 — media panel on top, product name below.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26522-14492', {
  example: () => <ProductCard type="product" image={null} />,
});

// card-features-category 26521:1397 — full-card tint, category label, centred image.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26521-1397', {
  example: () => <ProductCard type="category" />,
});
