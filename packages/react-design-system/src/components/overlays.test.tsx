import { render, screen } from '@testing-library/react';
import { Tooltip, BottomSheet } from './overlays';

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

/* ---------------- BottomSheet (Figma 29355:6240) ----------------
   Display axis verified on the Grabber's own variant nodes. */

const sheet = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('dialog');
};

test.each([
  ['light', 'rgba(25, 19, 41, 0.2)'],       // 27907:15999 surface/glass/midnight/md
  ['dark', 'rgba(255, 255, 255, 0.4)'],     // 27907:16041 surface/glass/white/xl
] as const)('BottomSheet display=%s grabber fills with %s', (display, bg) => {
  render(<BottomSheet display={display}>body</BottomSheet>);
  expect(screen.getByTestId('grabber').style.background).toBe(bg);
});

test('BottomSheet grabber is 40x4 and pill-shaped', () => {
  render(<BottomSheet>body</BottomSheet>);
  const g = screen.getByTestId('grabber');
  expect(g.style.width).toBe('40px');
  expect(g.style.height).toBe('4px');
  expect(g.style.borderRadius).toBe('9999px');
});

test('BottomSheet grabber can be hidden (Figma Grabber boolean)', () => {
  render(<BottomSheet grabber={false}>body</BottomSheet>);
  expect(screen.queryByTestId('grabber')).not.toBeInTheDocument();
});

test.each([
  ['light', 'rgb(255, 255, 255)'],  // surface/raised/default
  ['dark', 'rgb(20, 15, 33)'],      // surface/canvas/midnight
] as const)('BottomSheet display=%s sheet surface is %s', (display, bg) => {
  expect(sheet(<BottomSheet display={display}>body</BottomSheet>).style.background).toBe(bg);
});

test('BottomSheet corners bind border-radius/7 = 24', () => {
  const el = sheet(<BottomSheet>body</BottomSheet>);
  expect(el.style.borderTopLeftRadius).toBe('24px');
  expect(el.style.borderTopRightRadius).toBe('24px');
});

test('BottomSheet footer has no divider (Figma has none)', () => {
  render(<BottomSheet footer={<button>Go</button>}>body</BottomSheet>);
  const foot = screen.getByRole('button', { name: 'Go' }).parentElement as HTMLElement;
  expect(foot.style.borderTop).toBe('');
});

test('BottomSheet renders the subheader and visual slots', () => {
  render(<BottomSheet title="T" subheader={<i>sub</i>} visual={<b>vis</b>}>body</BottomSheet>);
  expect(screen.getByText('sub')).toBeInTheDocument();
  expect(screen.getByText('vis')).toBeInTheDocument();
});

test('BottomSheet is absent when closed', () => {
  render(<BottomSheet open={false}>body</BottomSheet>);
  expect(screen.queryByTestId('grabber')).not.toBeInTheDocument();
});
