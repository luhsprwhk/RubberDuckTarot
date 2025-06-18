import { useState } from 'react';
import NewReading from '../components/NewReading';
import QuickDrawSpread from '../components/QuickDrawSpread';
import mockData from '../../data/cards.json';
import { Card } from '../shared/interfaces';

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

  const [step, setStep] = useState<'setup' | 'drawing' | 'revealed'>('setup');
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);

  const handleBlockSelection = (blockId: string) => {
    setSelectedBlockType(blockId);
  };

  const handleDrawCard = () => {
    if (!selectedBlockType || !userContext.trim()) return;

    setStep('drawing');

    // Simulate card shuffle/draw animation
    setTimeout(() => {
      const randomCard =
        mockData.cards[Math.floor(Math.random() * mockData.cards.length)];
      setDrawnCard(randomCard);
      setStep('revealed');
    }, 2000);
  };

  const handleReset = () => {
    setStep('setup');
    setSelectedBlockType('');
    setUserContext('');
    setDrawnCard(null);
  };

  const renderContent = () => {
    if (!isUserLoggedIn) {
      return <Hero />;
    }

    if (step === 'setup') {
      return (
        <NewReading
          blockTypes={mockData.block_types}
          selectedBlockType={selectedBlockType}
          userContext={userContext}
          onBlockSelect={handleBlockSelection}
          onUserContextChange={setUserContext}
          onDrawCard={handleDrawCard}
        />
      );
    }

    return (
      <QuickDrawSpread
        step={step}
        drawnCard={drawnCard}
        selectedBlockTypeId={selectedBlockType}
        onReset={handleReset}
      />
    );
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
}
