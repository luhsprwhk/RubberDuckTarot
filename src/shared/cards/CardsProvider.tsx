import { useState, useEffect } from 'react';
import { getDb } from '@/lib/database-provider';
import CardsContext from './CardsContext';
import { cardCache } from './cardCache';
import type { Card } from '../interfaces';

interface CardsProviderProps {
  children: React.ReactNode;
}

const CardsProvider = ({ children }: CardsProviderProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async (forceRefresh = false) => {
    console.log('Fetching cards...');
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
      console.log('xxx');
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
