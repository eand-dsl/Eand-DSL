import { render, screen } from '@testing-library/react';
import { Tooltip } from './overlays';

/* ---------------- Tooltip V1.1 (Figma final component 33202:6649) ----------------
   Each size binds its own radius token, so a single radius across all three is wrong. */

const tip = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('tooltip');
};

test.each([
  ['simple', '4px'],   // 33202:6648 border-radius/1
  ['standard', '12px'], // 33202:6646 border-radius/3
  ['rich', '20px'],     // 33202:6647 border-radius/6
] as const)('Tooltip size=%s uses radius %s', (size, r) => {
  expect(tip(<Tooltip visible size={size} content="c"><b>t</b></Tooltip>).style.borderRadius).toBe(r);
});

test('Tooltip default surface is white with dark ink, not the inverse overlay', () => {
  const el = tip(<Tooltip visible content="c"><b>t</b></Tooltip>);
  expect(el.style.background).toBe('rgb(255, 255, 255)');
});

test('Tooltip surface=dark flips to the floating-inverse overlay', () => {
  const el = tip(<Tooltip visible surface="dark" content="c"><b>t</b></Tooltip>);
  expect(el.style.background).not.toBe('rgb(255, 255, 255)');
});

test.each([
  ['top', 'bottom'], ['bottom', 'top'], ['left', 'right'], ['right', 'left'],
] as const)('Tooltip placement=%s anchors from %s', (placement, anchored) => {
  const el = tip(<Tooltip visible placement={placement} content="c"><b>t</b></Tooltip>);
  expect(el.style[anchored as 'top']).toBe('calc(100% + 8px)');
});

test('Tooltip renders rich-only slots only at size=rich', () => {
  render(<Tooltip visible size="rich" title="T" steps="1 of 3" action={<button>Next</button>} content="c"><b>t</b></Tooltip>);
  expect(screen.getByText('T')).toBeInTheDocument();
  expect(screen.getByText('1 of 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
});

test('Tooltip ignores rich slots at size=standard', () => {
  render(<Tooltip visible size="standard" title="T" steps="1 of 3" content="c"><b>t</b></Tooltip>);
  expect(screen.queryByText('T')).not.toBeInTheDocument();
  expect(screen.queryByText('1 of 3')).not.toBeInTheDocument();
});

test('Tooltip is absent until visible', () => {
  render(<Tooltip content="c"><b>t</b></Tooltip>);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
