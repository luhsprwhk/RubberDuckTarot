import { useState, useEffect } from 'react';
import { getDb } from '@/src/lib/database-provider';
import CardsContext from './CardsContext';
import { cardCache } from './cardCache';
import type { Card } from '@/src/interfaces';

interface CardsProviderProps {
  children: React.ReactNode;
}

const CardsProvider = ({ children }: CardsProviderProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = cardCache.get();
        if (cached) {
          setCards(cached.cards);
          setLoading(false);
          return;
        }
      }

      const db = await getDb();
      const allCards = await db.getAllCards();

      // Cache the cards with a simple version based on count and timestamp
      const version = `${allCards.length}-${Date.now()}`;
      cardCache.set(allCards, version);

      setCards(allCards);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const refreshCards = async () => {
    await fetchCards(true);
  };

  const value = {
    cards,
    loading,
    error,
    refreshCards,
  };

  return (
    <CardsContext.Provider value={value}>{children}</CardsContext.Provider>
  );
};

export default CardsProvider;
