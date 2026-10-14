import figma from '@figma/code-connect';
import { ServiceCard, QuickAction, Badge } from '../src';

// e& Consumer App DSL V1.2 — .service-card-core (node 37840:18370)
//
// Retargeted. This used to point at `.quick-action-variants` 27917:8012, which is the cell
// of the Account-hub `quick-action` grid — V1.2 code models that as `QuickAction` (below),
// whose 13 task types now have icon-set glyphs (`QUICK_ACTION_PRESETS`). The service card
// is its own symbol: BOOL `badge` (a badges-offers md), `title-string`, `direction`.
figma.connect(ServiceCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=37840-18370', {
  props: {
    label: figma.string('title-string'),
    badge: figma.boolean('badge', {
      true: <Badge offer="new-plan" size="md">New plan</Badge>,
      false: undefined,
    }),
  },
  example: (p) => <ServiceCard label={p.label} badge={p.badge} />,
});

// e& Consumer App DSL V1.2 — quick-action (node 27962:37107): `grid` or `carousel`, with
// `rows` for the carousel. Its cells are `.quick-action-variants` (type × 13), which map
// onto QuickAction's `items[].type`; the example shows the three the symbol instances.
// Figma's `rows` labels are swapped on the published symbol (design question 24), so they
// are passed through as named rather than corrected here.
figma.connect(QuickAction, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=27962-37107', {
  props: {
    layout: figma.enum('carousel', { true: 'carousel', false: 'grid' }),
    rows: figma.enum('rows', { '1': 1, '2': 2, '3': 3 }),
  },
  example: (p) => (
    <QuickAction
      layout={p.layout}
      rows={p.rows}
      items={[
        { type: 'quick-pay', badge: <Badge status="positive" size="lg">Active</Badge> },
        { type: 'order-track' },
        { type: 'mParking' },
      ]}
    />
  ),
});
