import figma from '@figma/code-connect';
import { DealCard } from '../src';

// e& Consumer App DSL V1.1 — deals-card (node 25973:22611)
//
// CORRECTED TARGET. This previously pointed at 26825:101736, which is `.card-general` —
// the General card's cell atom, now mapped by Card.figma.tsx. deals-card is the real
// Deals-for-you card: a single symbol 166x224 with NO variant axis, composed of
// `.default-surface/default` + `.deals-card-core` + `.footer/Default`.
//
// Layer names are the ORIGINAL file's (dotted).
//
// NOT MAPPED — `.footer/Default` (discount / discounted-string / price-string) and the
// nested logo-row. DealCard is still the V1.0 image-led card and has no props for a
// struck-through price, logo row or feedback pill; the audit calls for an anatomy rebuild
// before those can map. Mapping them now would mean inventing props.
figma.connect(DealCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=25973-22611', {
  props: {
    core: figma.nestedProps('.deals-card-core', {
      subtitle: figma.string('top-line-string'),
      title: figma.string('item-name-string'),
    }),
  },
  example: (p) => <DealCard title={p.core.title} subtitle={p.core.subtitle} />,
});
