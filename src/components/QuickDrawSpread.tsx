import React from 'react';
import mockData from '../../data/cards.json';

// Types based on our JSON structure
import type { Card } from '../shared/interfaces';

interface QuickDrawSpreadProps {
  step: 'drawing' | 'revealed';
  drawnCard: Card | null;
  selectedBlockTypeId: string;
  onReset: () => void;
}

const QuickDuckSpread: React.FC<QuickDrawSpreadProps> = ({
  step,
  drawnCard,
  selectedBlockTypeId,
  onReset,
}) => {
  const selectedBlock = mockData.block_types.find(
    (bt) => bt.id === selectedBlockTypeId
  );
  const blockAdvice =
    drawnCard?.block_applications[
      selectedBlockTypeId as keyof typeof drawnCard.block_applications
    ];

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

  // This is the 'revealed' step
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🦆🧙‍♂️</div>
        <h1 className="text-2xl font-bold text-gray-800">
          Rob's Debugging Wisdom
        </h1>
      </div>

      {drawnCard && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{drawnCard.emoji}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {drawnCard.name}
            </h2>
            <p className="text-lg text-gray-600 italic">
              "{drawnCard.duck_question}"
            </p>
          </div>

          {/* Block-Specific Advice */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{selectedBlock?.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedBlock?.name} Insight
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{blockAdvice}</p>
          </div>

          {/* Rob's Wisdom */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🦆 Rob's Debugging Wisdom
            </h3>
            <p className="text-gray-700 italic leading-relaxed">
              "{drawnCard.duck_wisdom}"
            </p>
          </div>

          {/* Perspective Prompts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Reflection Questions:
            </h3>
            <ul className="space-y-2">
              {drawnCard.perspective_prompts
                .slice(0, 3)
                .map((prompt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700">{prompt}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-x-4">
        <button
          onClick={onReset}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔄 New Consultation
        </button>
        <button
          onClick={() => alert('Saved to Duck History! (Premium feature)')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          💾 Save to History
        </button>
      </div>

      {/* Ad Banner Placeholder */}
      <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <p className="text-gray-500 text-sm">
          📺 Friendly Ad Space • Upgrade to Premium Duck for ad-free wisdom
        </p>
      </div>
    </div>
  );
};

export default QuickDuckSpread;
