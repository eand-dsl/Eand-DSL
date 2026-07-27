import figma from '@figma/code-connect';
import { Highlight } from '../src';

// e& Consumer App DSL V1.1 — highlight-banner (node 28382:19131)
// title/subtitle are TEXT properties on the nested `.highlight-content` instance
// (text-primary-string / text-secondary-string), reached via nestedProps.
// `carousel=yes` is a fixed-width carousel cell; `no` leaves width unset so the banner keeps
// its full-bleed default (passing '100%' would flip it to flex '0 0 auto' — not the same thing).
// NOT MAPPED — the `size` variant (lg | xl): Highlight derives its min-height from `tone`,
// with no size prop to carry this. Needs a component change before it can be mapped.
figma.connect(Highlight, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=28382-19131', {
  props: {
    content: figma.nestedProps('.highlight-content', {
      title: figma.string('text-primary-string'),
      subtitle: figma.string('text-secondary-string'),
    }),
    width: figma.enum('carousel', { yes: 320, no: undefined }),
  },
  example: (p) => (
    <Highlight
      tone="image"
      title={p.content.title}
      subtitle={p.content.subtitle}
      width={p.width}
    />
  ),
});
