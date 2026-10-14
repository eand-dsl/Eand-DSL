import figma from '@figma/code-connect';
import { GeneralCard, Badge } from '../src';

// e& Consumer App DSL V1.2 — .card-general (node 26825:101736), the cell of `General-card`
// 28463:12391.
//
// Retargeted from `Card`: V1.2 ships a dedicated `GeneralCard` built on this symbol, while
// `Card` has no V1.2 symbol of its own. The surface labels are passed through as
// published — `default` is the DARK card and `inverse` the white one (GeneralCard follows
// the symbol; Card's naming is the reverse).
//
// The title is a plain text layer inside the nested `.card-general-core` instance (not a
// TEXT property), so it is read with textContent scoped to that layer.
figma.connect(GeneralCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=26825-101736', {
  props: {
    surface: figma.enum('surface', { default: 'default', inverse: 'inverse' }),
    carousel: figma.enum('carousel', { true: true, false: false }),
    core: figma.nestedProps('.card-general-core', {
      title: figma.textContent('Title'),
      size: figma.enum('size', { sm: 'sm', md: 'md', lg: 'lg' }),
      topAlignment: figma.enum('top-alignment', { true: true, false: false }),
      badge: figma.boolean('Show badge', {
        true: <Badge offer="discount" size="lg">20% off</Badge>,
        false: undefined,
      }),
    }),
  },
  example: (p) => (
    <GeneralCard
      surface={p.surface}
      carousel={p.carousel}
      title={p.core.title}
      size={p.core.size}
      topAlignment={p.core.topAlignment}
      badge={p.core.badge}
    />
  ),
});
