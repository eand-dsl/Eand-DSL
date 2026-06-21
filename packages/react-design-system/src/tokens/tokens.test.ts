import { tokens } from './tokens';

test('semantic colors resolve to concrete values', () => {
  expect(tokens.color.surface.base.brand).toBe('#e00800');
  expect(tokens.color.text.default.default).toBe('#191329');
});

test('scales carry px units', () => {
  expect(tokens.spacing.lg).toBe('16px');
  expect(tokens.borderRadius['5']).toBe('16px');
});

test('typography resolves with px size and numeric weight', () => {
  expect(tokens.typography.body.md.fontSize).toBe('14px');
  expect(tokens.typography.button.md.fontWeight).toBe('500');
});
