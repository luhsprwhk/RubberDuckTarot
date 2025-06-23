import { useContext } from 'react';
import CardsContext from '../modules/cards/CardsContext';

const useCards = () => {
  const context = useContext(CardsContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
};

export default useCards;
