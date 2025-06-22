import { useState, useEffect } from 'react';
import { getDb } from '@/lib/database-provider';
import CardsContext from './CardsContext';
import type { Card } from '../interfaces';

interface CardsProviderProps {
  children: React.ReactNode;
}

const CardsProvider = ({ children }: CardsProviderProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await getDb();
      const allCards = await db.getAllCards();

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
    await fetchCards();
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
