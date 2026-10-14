import figma from '@figma/code-connect';
import { Badge } from '../src';

// e& Consumer App DSL V1.2 — badges. Both sets wrap `.badges-core` 40602:71471, whose
// `chevron` boolean (new in V1.2) is the code's `chevron` prop.
//
// The status set's inverse option is spelled `neutra-inverse` in the file; figma.enum must
// use that exact key.

// Status badges (node 25694:12036)
figma.connect(Badge, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=25694-12036', {
  props: {
    size: figma.enum('size', { sm: 'sm', md: 'md', lg: 'lg' }),
    status: figma.enum('type', {
      neutral: 'neutral', 'neutra-inverse': 'neutral-inverse', disabled: 'disabled',
      positive: 'positive', warning: 'warning', danger: 'danger',
    }),
    core: figma.nestedProps('.badges-core', {
      chevron: figma.boolean('chevron'),
    }),
  },
  example: (p) => <Badge status={p.status} size={p.size} chevron={p.core.chevron}>Label</Badge>,
});

// Offer badges (node 12934:864)
figma.connect(Badge, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=12934-864', {
  props: {
    size: figma.enum('size', { sm: 'sm', md: 'md', lg: 'lg' }),
    offer: figma.enum('type', {
      'New card': 'new-card', 'New plan': 'new-plan', 'Mega deals': 'mega-deals',
      'Green friday': 'green-friday', Discount: 'discount', 'Limited stock': 'limited-stock',
      'Valid for 2 days': 'validity', 'Limited time offer': 'limited-time', 'Best seller': 'best-seller',
      'Online exclusive': 'online-exclusive', 'Exclusive for Emirati': 'exclusive-for-emirati', 'Sold out': 'sold-out',
    }),
    core: figma.nestedProps('.badges-core', {
      chevron: figma.boolean('chevron'),
    }),
  },
  example: (p) => <Badge offer={p.offer} size={p.size} chevron={p.core.chevron}>Offer</Badge>,
});
