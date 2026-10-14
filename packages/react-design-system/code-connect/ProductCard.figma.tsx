import figma from '@figma/code-connect';
import { ProductCard } from '../src';

// e& Consumer App DSL V1.2 — card-features, three sibling component sets (not one variant
// set), each 229×300 (section/body/height/row-4) with a `direction` ltr | rtl axis. `type`
// selects the sibling, so each node gets its own connect() with the type fixed.
//
// Retargeted from the V1.1 nodes (card-features-addon 25893:54098, -product 26522:14492,
// -category 26521:1397). V1.2 renamed `addon` to `package` (the code keeps `addon` as a
// deprecated alias). The price is the `price-string` / `price-monthly` pair on the nested
// `.product-card-price`.
//
// `badge-or-color` shows the footer badge slot; the badge label is plain text, so the
// example passes Figma's default copy.

// card-features-package 37905:18719 — tint panel with overline, 4-line title and logo row.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=37905-18719', {
  props: {
    eyebrow: figma.string('overline-string'),
    title: figma.string('title-string'),
    logos: figma.boolean('logo-row'),
    discount: figma.boolean('badge-or-color', { true: '20% off', false: undefined }),
    price: figma.nestedProps('.product-card-price', {
      value: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
    }),
  },
  example: (p) => (
    <ProductCard
      type="package"
      eyebrow={p.eyebrow}
      title={p.title}
      logos={p.logos}
      discount={p.discount}
      price={p.price.value}
      period={p.price.period}
    />
  ),
});

// card-features-product 37905:18753 — product image in the tint panel, title below.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=37905-18753', {
  props: {
    title: figma.string('title-string'),
    logos: figma.boolean('logo-row'),
    discount: figma.boolean('badge-or-color', { true: '20% off', false: undefined }),
    price: figma.nestedProps('.product-card-price', {
      value: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
    }),
  },
  example: (p) => (
    <ProductCard
      type="product"
      image={null}
      title={p.title}
      logos={p.logos}
      discount={p.discount}
      price={p.price.value}
      period={p.price.period}
    />
  ),
});

// card-features-category 37905:18788 — full-card tint, category label, centred image.
figma.connect(ProductCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=37905-18788', {
  props: {
    title: figma.boolean('title', {
      true: figma.string('title-string'),
      false: undefined,
    }),
    discount: figma.boolean('badge', { true: '20% off', false: undefined }),
    price: figma.nestedProps('.product-card-price', {
      value: figma.string('price-string'),
      period: figma.boolean('price-monthly', { true: '/mo', false: '' }),
    }),
  },
  example: (p) => (
    <ProductCard
      type="category"
      title={p.title}
      discount={p.discount}
      price={p.price.value}
      period={p.price.period}
    />
  ),
});
