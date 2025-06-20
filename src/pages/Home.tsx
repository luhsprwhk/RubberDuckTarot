import { useState, useEffect } from 'react';
import NewReading from '../components/NewReading';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { cardQueries, blockTypeQueries } from '../../db/sqlite/queries';
import type { Card, BlockType } from '../../db/sqlite/schema';

const Hero = () => {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Rubber Duck Tarot
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Welcome to Rubber Duck Tarot - where debugging meets divination. Draw
        cards to gain insights for your coding journey.
      </p>
    </>
  );
};

export default function Home() {
  const isUserLoggedIn = true;

  const [step, setStep] = useState<'setup' | 'drawing'>('setup'); // Simplified steps
  const navigate = useNavigate(); // Hook for navigation
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  // const [drawnCards, setDrawnCards] = useState<Card[]>([]); // Removed, not used in Home anymore
  const [selectedSpread, setSelectedSpread] = useState<string>('');
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);

  useEffect(() => {
    // Load block types from database
    const loadedBlockTypes = blockTypeQueries.getAll();
    setBlockTypes(loadedBlockTypes);
  }, []);

  const handleBlockSelection = (blockId: string) => {
    setSelectedBlockType(blockId);
  };

  const handleDrawCard = () => {
    if (!selectedBlockType || !selectedSpread) return;

    setStep('drawing');

    setTimeout(() => {
      const cardsToDraw: Card[] = [];

      if (selectedSpread === 'quick-draw') {
        const randomCard = cardQueries.getRandomCard();
        cardsToDraw.push(randomCard);
        // Navigate to Reading page with data
        navigate('/reading', {
          state: {
            drawnCards: cardsToDraw,
            selectedBlockTypeId: selectedBlockType,
            spreadType: 'quick-draw',
          },
        });
        setStep('setup'); // Reset step after navigating
      } else if (selectedSpread === 'full-pond') {
        // Draw 3 cards. For simplicity, allowing duplicates.
        const randomCards = cardQueries.getRandomCards(3);
        cardsToDraw.push(...randomCards);
        // Navigate to Reading page with data
        navigate('/reading', {
          state: {
            drawnCards: cardsToDraw,
            selectedBlockTypeId: selectedBlockType,
            spreadType: 'full-pond',
          },
        });
        setStep('setup'); // Reset step after navigating
      }
    }, 1000); // Simulate drawing time
  };

  // Reset functionality is now handled by navigating to the Reading page and then back to Home,
  // which re-initializes the Home component's state.
  // No explicit handleReset function is needed here anymore.

  const handleSpreadSelection = (spread: string) => {
    setSelectedSpread(spread);
  };

  const renderContent = () => {
    if (!isUserLoggedIn) {
      return <Hero />;
    }

    if (step === 'setup') {
      return (
        <NewReading
          blockTypes={blockTypes}
          selectedBlockType={selectedBlockType}
          userContext={userContext}
          onBlockSelect={handleBlockSelection}
          onUserContextChange={setUserContext}
          onSpreadSelect={handleSpreadSelection}
          onDrawCard={handleDrawCard}
          selectedSpread={selectedSpread}
        />
      );
    }

    if (step === 'drawing') {
      return (
        <div className="text-center py-10">
          <p className="text-2xl text-gray-700 animate-pulse">
            Shuffling the deck and drawing your cards...
          </p>
          {/* You could add a spinner or animation here */}
        </div>
      );
    }

    return (
      <div className="text-center py-10">
        <p>Loading...</p>
      </div>
    );
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
}
