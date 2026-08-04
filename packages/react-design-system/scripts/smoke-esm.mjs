// Proves dist/index.js is importable and renders. Run after `npm run build`.
import { renderToString } from 'react-dom/server';
import { createElement as h } from 'react';
import * as DS from '../dist/index.js';

// forwardRef/memo components are objects, not functions, so a typeof check
// would report Button — which is a forwardRef — as missing.
const isComponent = (v) =>
  typeof v === 'function' || (typeof v === 'object' && v !== null && '$$typeof' in v);

const required = ['Button', 'Icon', 'TopBar', 'NavBar', 'Section', 'Picker', 'CtaFooter'];
const missing = required.filter((n) => !isComponent(DS[n]));
if (missing.length) {
  console.error(`✗ missing exports: ${missing.join(', ')}`);
  process.exit(1);
}

const html = renderToString(
  h(DS.Section, { title: 'Deals for you' }, h(DS.Button, { variant: 'primary' }, 'Pay now')),
);
if (!html.includes('Pay now') || !html.includes('Deals for you')) {
  console.error(`✗ unexpected render output:\n${html}`);
  process.exit(1);
}

const iconHtml = renderToString(h(DS.Icon, { name: 'wallet' }));
if (!iconHtml.includes('<svg')) {
  console.error(`✗ Icon did not render an svg:\n${iconHtml}`);
  process.exit(1);
}

console.log('✓ ESM smoke: exports resolve and render');
