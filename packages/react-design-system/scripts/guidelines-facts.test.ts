import { describe, it, expect } from 'vitest';
import { collectFacts, componentNamesFromSource } from './guidelines-facts';

describe('collectFacts', () => {
  const facts = collectFacts();

  it('names the single published package', () => {
    expect(facts.packageName).toBe('@eand/react-design-system');
  });

  it('finds all 69 exported components', () => {
    // 58 before the V1.2 reconciliation, which added 11: StatusIndicator, MoreItems (primitives),
    // UaePassButton (Button), ConsentCheckbox (controls), GeneralCard, FAQ (layout),
    // Recommendation (cards), Scrim (overlays), PriceLine, CheckboxLine (deprecated), ActionBlock (ctabar).
    expect(facts.exportedComponents).toHaveLength(69);
    for (const name of [
      'Button', 'Picker', 'CtaFooter', 'StatusIndicator', 'MoreItems', 'UaePassButton', 'ConsentCheckbox',
      'GeneralCard', 'FAQ', 'Recommendation', 'Scrim', 'PriceLine', 'CheckboxLine', 'ActionBlock',
    ]) {
      expect(facts.exportedComponents).toContain(name);
    }
  });

  it('excludes SCREAMING_SNAKE constants', () => {
    for (const constant of ['CARD_BG_TINTS', 'QUICK_ACTION_PRESETS', 'VOUCHER_SHAPE_PATH', 'VOUCHER_SHAPE_SIZE']) {
      expect(facts.exportedComponents).not.toContain(constant);
    }
  });

  it('counts an all-caps component (FAQ) but not all-caps constants', () => {
    const src = [
      'export function FAQ({ items }: FAQProps) { return null; }',
      'export function Section() { return null; }',
      'export const CARD = { width: 166 };',
      'export const CARD_BG_TINTS = Object.keys(CARD_BG_TINT) as CardBgTint[];',
      'export const QUICK_ACTION_PRESETS: Record<QuickActionType, { label: string; icon: string }> = {',
      'export const ICON_ALIASES: Record<string, IconName> = {"add-2": "add"};',
      'export const UaePassButton = forwardRef<HTMLButtonElement, UaePassButtonProps>(function UaePassButton() {',
      'export const OTP = memo(function Otp() { return null; });',
      'export const iconGlyph = (size: string): number => 0;',
    ].join('\n');
    expect(componentNamesFromSource(src)).toEqual(['FAQ', 'OTP', 'Section', 'UaePassButton']);
  });

  it('captures the current Button variant axis including glass', () => {
    const variant = facts.components.Button.variant;
    expect(variant.values).toEqual(
      expect.arrayContaining(['primary', 'secondary', 'tertiary', 'link', 'glass']),
    );
  });

  it('captures props the old guidelines never mentioned', () => {
    expect(facts.components.Button).toHaveProperty('loading');
    expect(facts.components.Button).toHaveProperty('surface');
  });

  it('has 396 icons split evenly into base and filled', () => {
    expect(facts.iconNames).toHaveLength(396);
    expect(facts.iconBaseNames).toHaveLength(198);
    expect(facts.iconNames.filter((n) => n.endsWith('-filled'))).toHaveLength(198);
  });

  it('every base icon has a filled twin', () => {
    const all = new Set(facts.iconNames);
    const orphans = facts.iconBaseNames.filter((n) => !all.has(`${n}-filled`));
    expect(orphans).toEqual([]);
  });

  it('knows the 8 phantom names are absent and the real ones present', () => {
    for (const p of ['profile', 'mshop', 'sparkle', 'subscriptions', 'mobile', 'truck', 'plus', 'shield']) {
      expect(facts.iconNames).not.toContain(p);
    }
    for (const r of ['user', 'ai', 'phone-device', 'delivery', 'add', 'security']) {
      expect(facts.iconNames).toContain(r);
    }
  });

  it('carries icon meta for choosing between similar icons', () => {
    expect(facts.iconMeta.ai.aliases).toContain('sparkles');
  });
});
