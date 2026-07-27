import figma from '@figma/code-connect';
import { ServiceCard, Badge } from '../src';

// e& Consumer App DSL V1.1 — .quick-action-variants (node 27917:8012)
// Retargeted from `.quick-task-core` (25693:2086): that node is a private (dot-prefixed)
// nested component and does not resolve for Code Connect. `.quick-action-variants` is the
// single quick-task cell — `type` ×13, all 147×148 — and is the correct atom for ServiceCard.
// Label + badge live on the nested `.quick-task-core` instance, so they are read through it.
// The badge is spec'd as Status Badge lg / positive (audit 03-navigation).
// NOT MAPPED — the `type` variant (quick-pay, order-track, sim-activate, sim-replace,
// addon-buy, devices, device-buy, plan-change, live-chat, contact-us, subscriptions,
// mParking, all-services): these glyphs have no counterpart in @eand/icons yet
// (mid-migration gap flagged in audit 01-primitives/03-navigation), so `icon` is left to its
// code default rather than mapped to invented icon names. Revisit once the icon set lands.
figma.connect(ServiceCard, 'https://www.figma.com/design/pzm63BTLfPfT1stcF89ILQ/e--Consumer-App-DSL-V1.1?node-id=27917-8012', {
  props: {
    core: figma.nestedProps('.quick-task-core', {
      label: figma.string('Title-text'),
      badge: figma.boolean('badge', {
        true: <Badge status="positive" size="lg">New</Badge>,
        false: undefined,
      }),
    }),
  },
  example: (p) => <ServiceCard label={p.core.label} badge={p.core.badge} />,
});
