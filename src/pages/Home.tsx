import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import NewReading from '../components/NewReading';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { getDb } from '@/lib/database-provider';
import type { Card, BlockType } from '@/src/shared/interfaces';
import Landing from '../components/Landing';

export default function Home() {
  const { user } = useAuth();
  const isUserLoggedIn = !!user;
  const [step, setStep] = useState<'setup' | 'drawing'>('setup'); // Simplified steps
  const navigate = useNavigate(); // Hook for navigation
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  // const [drawnCards, setDrawnCards] = useState<Card[]>([]); // Removed, not used in Home anymore
  const [selectedSpread, setSelectedSpread] = useState<string>('');
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);

  useEffect(() => {
    // Load block types from database
    const loadBlockTypes = async () => {
      const db = await getDb();
      const loadedBlockTypes = await db.getAllBlockTypes();
      setBlockTypes(loadedBlockTypes);
    };
    loadBlockTypes();
  }, []);

  const handleBlockSelection = (blockId: string) => {
    setSelectedBlockType(blockId);
  };

  const handleDrawCard = async () => {
    if (!selectedBlockType || !selectedSpread) return;

    setStep('drawing');

    setTimeout(async () => {
      const db = await getDb();
      const cardsToDraw: Card[] = [];

      if (selectedSpread === 'quick-draw') {
        const allCards = await db.getAllCards();
        const randomCard =
          allCards[Math.floor(Math.random() * allCards.length)];
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
        const allCards = await db.getAllCards();
        const randomCards = [];
        for (let i = 0; i < 3; i++) {
          randomCards.push(
            allCards[Math.floor(Math.random() * allCards.length)]
          );
        }
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
      return <Landing />;
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
