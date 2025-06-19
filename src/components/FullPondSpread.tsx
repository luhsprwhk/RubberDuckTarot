import React from 'react';
import type { Card } from '../shared/interfaces';

interface FullPondSpreadProps {
  drawnCards: Card[];
  onReset: () => void;
  selectedBlockTypeId: string;
}

const FullPondSpread: React.FC<FullPondSpreadProps> = ({
  drawnCards,
  onReset,
  selectedBlockTypeId,
}) => {
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
