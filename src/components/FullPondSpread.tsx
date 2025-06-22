import React, { useState, useEffect } from 'react';
import { getDb } from '@/lib/database-provider';
import type { Card } from '../shared/interfaces';
import type { UserProfile } from '../shared/userPreferences';

interface FullPondSpreadProps {
  onReset: () => void;
  selectedBlockTypeId: string;
  userContext: string;
  userProfile: UserProfile | null;
}

const FullPondSpread: React.FC<FullPondSpreadProps> = ({
  onReset,
  selectedBlockTypeId,
}) => {
  const [step, setStep] = useState<'drawing' | 'revealed'>('drawing');
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);

  useEffect(() => {
    const drawCards = async () => {
      const db = await getDb();
      const allCards = await db.getAllCards();

      // Simulate drawing time
      setTimeout(() => {
        const cards: Card[] = [];
        for (let i = 0; i < 3; i++) {
          cards.push(allCards[Math.floor(Math.random() * allCards.length)]);
        }
        setDrawnCards(cards);
        setStep('revealed');
      }, 1000);
    };

    drawCards();
  }, [selectedBlockTypeId]);

  if (step === 'drawing') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦆</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Rob is shuffling the deck...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Full Pond Spread
      </h2>
      <p className="text-gray-700 mb-4 text-center">
        You are exploring insights for:{' '}
        <span className="font-semibold">{selectedBlockTypeId}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {drawnCards.map((card, index) => (
          <div
            key={card.id + '-' + index}
            className="border p-6 rounded-lg shadow-md bg-blue-50 hover:shadow-xl transition-shadow"
          >
            <h3 className="font-semibold text-xl text-blue-700 mb-2">
              {card.name} {card.emoji}
            </h3>
            <p className="text-sm text-gray-600 italic mb-1">
              Traditional: {card.traditional_equivalent}
            </p>
            <p className="text-md text-gray-800 font-medium mb-3">
              Core Meaning:
            </p>
            <p className="text-sm text-gray-700 mb-3">{card.core_meaning}</p>
            <p className="text-md text-gray-800 font-medium mb-3">
              Duck Question:
            </p>
            <p className="text-sm text-gray-700">{card.duck_question}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-lg"
        >
          Start New Reading
        </button>
      </div>
    </div>
  );
};

export default FullPondSpread;
