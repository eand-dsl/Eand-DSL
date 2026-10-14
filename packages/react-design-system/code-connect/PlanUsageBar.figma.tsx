import figma from '@figma/code-connect';
import { PlanUsageBar } from '../src';

// e& Consumer App DSL V1.2 — .plan-usage-bar (node 28927:23669)
//
// A 48px filled block: the fill shows the share of the allowance still left, the amount
// reads inside it, the category label sits in the track opposite.
//
// V1.2 renamed every property this mapping reads: the boolean is `value-content` (was
// `valueContent`), the bar status is `progress-status` default | low-data (was
// `Progress status` Default | low data), and the nested texts are `content-string` /
// `label-string` (were `text-string`).
//
// NOT MAPPED — the fill fraction. In Figma it is the `bar` layer's right inset, set per
// instance rather than exposed as a component property, so there is nothing to bind to.
// `remaining` and `total` are the code inputs that produce it; callers pass real plan data.
//
// NOT MAPPED — the text `state` (default | filled) on the value, content and label: Figma
// flips it by hand, the code measures it (or pins it with valueState / labelState).
figma.connect(PlanUsageBar, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.2?node-id=28927-23669', {
  props: {
    bar: figma.nestedProps('.progress-bar-status', {
      // No `as const` here: the Code Connect parser reads this object from the AST and a
      // TSAsExpression wrapper stops it resolving the mapping.
      status: figma.enum('progress-status', {
        default: 'default',
        'low-data': 'low-data',
      }),
    }),
    content: figma.nestedProps('.plan-usage/content', {
      note: figma.string('content-string'),
    }),
    showNote: figma.boolean('value-content'),
    label: figma.nestedProps('.plan-usage/label', {
      text: figma.string('label-string'),
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
