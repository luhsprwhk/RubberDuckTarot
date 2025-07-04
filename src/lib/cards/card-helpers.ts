// Helper functions for cards

// Create a slug from a card name
export const createCardSlug = (cardName: string) => {
  return cardName.toLowerCase().replace(/\s+/g, '-');
};
