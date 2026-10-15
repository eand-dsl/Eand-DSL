import figma from '@figma/code-connect';
import { Highlight } from '../src';

// e& Consumer App DSL V1.2 — highlight (node 34272:25571)
//
// Retargeted from the V1.1 highlight-banner 28382:19131. V1.2 has no tone axis: the set
// carries `placement` (single | stacked) and wraps `.highlight-sizes` 34218:38232, whose
// `size` (lg 452 · md 224 · sm 148) is now the code's `size` prop. The title and subtitle
// are plain text layers (`title`, `subtitle`) in the lg content, read with textContent;
// md and sm do not show them. `tone`, `background` and the bare `cta` are deprecated in
// code, so they are not mapped.
figma.connect(Highlight, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=34272-25571', {
  props: {
    placement: figma.enum('placement', { single: 'single', stacked: 'stacked' }),
    sizes: figma.nestedProps('.highlight-sizes', {
      size: figma.enum('size', { lg: 'lg', md: 'md', sm: 'sm' }),
    }),
    title: figma.textContent('title'),
    subtitle: figma.textContent('subtitle'),
  },
  example: (p) => (
    <Highlight
      placement={p.placement}
      size={p.sizes.size}
      title={p.title}
      subtitle={p.subtitle}
      action={{ title: 'Smiles Unlimited', subtitle: 'Exclusive venue deals', cta: 'Play now' }}
    />
  ),
});
