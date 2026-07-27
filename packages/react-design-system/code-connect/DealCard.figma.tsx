import figma from '@figma/code-connect';
import { DealCard } from '../src';

// e& Consumer App DSL V1.1 — .card-general (node 26825:101736)
// The title is a plain text layer inside the nested `.card-general-core` instance (it is not
// exposed as a TEXT property), so it is read with textContent scoped to that layer.
// `Carousel<->Grid` drives the width: carousel cells are fixed-width, grid cells fill.
// NOT MAPPED — the `surface` variant (default | inverse): DealCard has no inverse/on-dark
// treatment in code, so mapping it would mean inventing a prop. Needs a component change first.
figma.connect(DealCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=26825-101736', {
  props: {
    core: figma.nestedProps('.card-general-core', {
      title: figma.textContent('Title'),
    }),
    width: figma.enum('Carousel<->Grid', { yes: 240, No: '100%' }),
  },
  example: (p) => <DealCard title={p.core.title} width={p.width} />,
});
