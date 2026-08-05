import figma from '@figma/code-connect';
import { PlanUsageBar } from '../src';

// e& Consumer App DSL V1.1 — .plan-usage-bar (node 28927:23669)
//
// A 48px filled block: the fill shows the share of the allowance still left, the amount
// reads inside it, the category label sits in the track opposite.
//
// `valueContent` is the boolean that reveals the `.plan-usage/content` subline; the copy
// itself lives on that nested instance, so it is read through nestedProps. Figma's master
// says "Expires 3 days".
//
// NOT MAPPED — the fill fraction. In Figma it is the `bar` layer's right inset, set per
// instance rather than exposed as a component property, so there is nothing to bind to.
// `remaining` and `total` are the code inputs that produce it; callers pass real plan data.
//
// NOT MAPPED — `.plan-usage/value` item and value (`GB`, `2`). They are text properties on
// a grandchild instance that nestedProps cannot reach through the `.progress-bar-status`
// wrapper, and they are data rather than design anyway.
figma.connect(PlanUsageBar, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=28927-23669', {
  props: {
    // `Progress status` lives on the nested .progress-bar-status instance (28927:22814):
    // Default is green #54bc72, "low data" is orange #ff9f52.
    bar: figma.nestedProps('.progress-bar-status', {
      // No `as const` here: the Code Connect parser reads this object from the AST and a
      // TSAsExpression wrapper stops it resolving the mapping.
      status: figma.enum('Progress status', {
        'Default': 'default',
        'low data': 'low-data',
      }),
    }),
    content: figma.nestedProps('.plan-usage/content', {
      note: figma.string('text-string'),
    }),
    showNote: figma.boolean('valueContent'),
    label: figma.nestedProps('.plan-usage/label', {
      text: figma.string('text-string'),
    }),
  },
  example: (p) => (
    <PlanUsageBar
      label={p.label.text}
      remaining={2}
      total={40}
      unit="GB"
      status={p.bar.status}
      note={p.showNote ? p.content.note : undefined}
    />
  ),
});
