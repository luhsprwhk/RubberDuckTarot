import type { Card } from '../interfaces';

export type DrawnCard = {
  card: Card;
  reversed: boolean;
};

/**
 * Draw a random card from the deck, removing it from the deck, with a 50% chance of being reversed (if reversed meaning exists).
 * @param deck Array of cards to draw from (will be mutated)
 * @returns DrawnCard
 */
export function drawCard(deck: Card[]): DrawnCard | undefined {
  if (deck.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck.splice(randomIndex, 1)[0];
  const reversed = !!card.reversed_meaning && Math.random() < 0.5;
  return { card, reversed };
}
