import figma from '@figma/code-connect';
import { DealCard } from '../src';

// e& Consumer App DSL V1.2 — deals-card/ltr (node 25973:22611)
//
// A single 166×224 symbol with NO variant axis: `.default-surface/default` +
// `.deals-card-core` (overline, title, logo row) + `.footer` (discount badge, struck-through
// price, price). V1.2 renamed the core's text properties (`top-line-string` →
// `overline-string`, `item-name-string` → `title-string`), and DealCard was rebuilt to
// match: `overline` replaces the deprecated `subtitle`, and the footer now maps.
//
// Prices are split in Figma ("AED" is a fixed layer before each string), so the mapped
// value is the number only; Code Connect examples cannot concatenate the prefix back, so
// a caller writes "AED 400" in code. NOT MAPPED — the feedback pill's like count: it is plain text, not a
// property.
figma.connect(DealCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=25973-22611', {
  props: {
    core: figma.nestedProps('.deals-card-core', {
      overline: figma.boolean('overline', {
        true: figma.string('overline-string'),
        false: undefined,
      }),
      title: figma.string('title-string'),
      logos: figma.boolean('logo-row'),
    }),
    footer: figma.nestedProps('.footer', {
      discount: figma.boolean('discount', { true: 'Discount', false: undefined }),
      wasPrice: figma.string('discounted-string'),
      price: figma.string('price-string'),
    }),
  },
  example: (p) => (
    <DealCard
      overline={p.core.overline}
      title={p.core.title}
      logos={p.core.logos}
      discount={p.footer.discount}
      wasPrice={p.footer.wasPrice}
      price={p.footer.price}
    />
  ),
});
