import figma from '@figma/code-connect';
import { Card } from '../src';

// e& Consumer App DSL V1.1 — .card-general (node 26825:101736)
//
// The General card's cell atom. This node was previously claimed by DealCard.figma.tsx;
// it belongs to Card (layout.tsx), whose parent set is `General-card` 28463:12391.
//
// The title is a plain text layer inside the nested `.card-general-core` instance (not a
// TEXT property), so it is read with textContent scoped to that layer. Layer names are the
// ORIGINAL file's — the copy has these de-dotted, which would not resolve here.
//
// `Carousel<->Grid` drives width: carousel cells are fixed, grid cells fill.
figma.connect(Card, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26825-101736', {
  props: {
    surface: figma.enum('surface', { default: 'default', inverse: 'inverse' }),
    core: figma.nestedProps('.card-general-core', {
      title: figma.textContent('Title'),
    }),
    width: figma.enum('Carousel<->Grid', { yes: 147, No: '100%' }),
  },
  example: (p) => <Card surface={p.surface} title={p.core.title} width={p.width} />,
});
