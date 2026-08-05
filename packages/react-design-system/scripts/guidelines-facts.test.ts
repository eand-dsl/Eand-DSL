import { describe, it, expect } from 'vitest';
import { collectFacts } from './guidelines-facts';

describe('collectFacts', () => {
  const facts = collectFacts();

  it('names the single published package', () => {
    expect(facts.packageName).toBe('@eand/react-design-system');
  });

  it('finds all 55 exported components', () => {
    expect(facts.exportedComponents).toHaveLength(55);   // +SectionLinkButton (Figma section-link 25440:14243)
    expect(facts.exportedComponents).toContain('Button');
    expect(facts.exportedComponents).toContain('Picker');
    expect(facts.exportedComponents).toContain('CtaFooter');
  });

  it('excludes SCREAMING_SNAKE constants', () => {
    expect(facts.exportedComponents).not.toContain('CARD_BG_TINTS');
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
