import { tokens } from './tokens';

test('semantic colors resolve to concrete values', () => {
  expect(tokens.color.surface.base.brand).toBe('#e00800');
  expect(tokens.color.text.default.default).toBe('#191329');
});

test('scales carry px units', () => {
  expect(tokens.spacing.lg).toBe('16px');
  expect(tokens.borderRadius['6']).toBe('16px');
});

test('typography resolves with px size and numeric weight', () => {
  expect(tokens.typography.body.md.fontSize).toBe('14px');
  expect(tokens.typography.button.md.fontWeight).toBe('500');
});

/* V1.2 retuned the published TEXT STYLES (what symbols apply) without updating the
   typography/heading/* variables: heading/lg is a 24px/110% style while
   typography/heading/lg/font-size still says 28. Code used to read only the variables, so
   every heading rendered a step too large. text-styles.json (exported from the file's
   local text styles) now generates `textStyle`; the raw variables stay in `typography`. */
test('textStyle carries the published V1.2 text styles', () => {
  expect(tokens.textStyle.heading['2xl']).toMatchObject({ fontSize: '32px', lineHeight: '1', fontWeight: '700' });
  expect(tokens.textStyle.heading.xl).toMatchObject({ fontSize: '28px', lineHeight: '1.1', letterSpacing: '-0.65px' });
  expect(tokens.textStyle.heading.lg).toMatchObject({ fontSize: '24px', lineHeight: '1.1', letterSpacing: '-0.35px' });
  expect(tokens.textStyle.heading.md.fontSize).toBe('20px');
  expect(tokens.textStyle.heading.sm.fontSize).toBe('18px');
  expect(tokens.textStyle.heading.xs).toMatchObject({ fontSize: '16px', lineHeight: '1.2' });
  expect(tokens.textStyle.alerts.md).toMatchObject({ fontSize: '14px', fontWeight: '600', lineHeight: '1.3' });
  expect(tokens.textStyle.body.md).toMatchObject({ fontSize: '14px', lineHeight: '1.4', fontWeight: '400' });
  // AUTO line height on the style falls back to the matching line-height variable (130%).
  expect(tokens.textStyle.button.md.lineHeight).toBe('1.3');
  expect(tokens.textStyle.heading.lg.fontFamily).toBe("Suisse int'l");
});

test('the raw typography variables are kept untouched', () => {
  expect(tokens.typography.heading.lg.fontSize).toBe('28px');
  expect(tokens.typography.heading.lg.lineHeight).toBe('1.2');
});
