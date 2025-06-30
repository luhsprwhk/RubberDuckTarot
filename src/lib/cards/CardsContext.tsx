import { createContext } from 'react';
import type { Card } from '@/src/interfaces';

interface CardsContextType {
  cards: Card[];
  loading: boolean;
  error: string | null;
  refreshCards: () => Promise<void>;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export default CardsContext;
