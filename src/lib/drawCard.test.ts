import { describe, it, expect } from 'vitest';
import { drawCard } from './drawCard';
import type { Card } from '../interfaces';

describe('drawCard', () => {
  const baseCard: Card = {
    id: 1,
    name: 'Test Card',
    emoji: '🃏',
    traditional_equivalent: 'Joker',
    core_meaning: 'core',
    duck_question: 'question',
    perspective_prompts: [],
    block_applications: {
      creative: 'creative value',
      work: 'work value',
      life: 'life value',
      relationship: 'relationship value',
    },
    duck_wisdom: 'wisdom',
    reversed_meaning: 'reverse',
    tags: [],
  };

  it('draws a card and removes it from the deck', () => {
    const deck: Card[] = [
      { ...baseCard, id: 1 },
      { ...baseCard, id: 2 },
    ];
    const drawn = drawCard(deck);
    expect(drawn).toBeDefined();
    expect(deck.length).toBe(1);
    expect([1, 2]).toContain(drawn!.card.id);
  });

  it('marks card as reversed about half the time (statistically)', () => {
    let reversedCount = 0;
    let normalCount = 0;
    for (let i = 0; i < 1000; i++) {
      const testDeck = [{ ...baseCard }];
      const drawn = drawCard(testDeck);
      if (drawn!.reversed) reversedCount++;
      else normalCount++;
    }
    // Should be roughly 50/50
    expect(reversedCount).toBeGreaterThan(400);
    expect(normalCount).toBeGreaterThan(400);
  });

  it('returns undefined if deck is empty', () => {
    const deck: Card[] = [];
    const drawn = drawCard(deck);
    expect(drawn).toBeUndefined();
  });

  it('never marks reversed if card has no reversed meaning', () => {
    const cardNoReverse: Card = { ...baseCard, reversed_meaning: '' };
    let reversedFound = false;
    for (let i = 0; i < 100; i++) {
      const testDeck = [{ ...cardNoReverse }];
      const drawn = drawCard(testDeck);
      if (drawn!.reversed) reversedFound = true;
    }
    expect(reversedFound).toBe(false);
  });
});
