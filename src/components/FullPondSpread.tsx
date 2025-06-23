import React from 'react';
import type { Card, BlockType } from '@/src/interfaces';
import type { PersonalizedReading } from '@/src/modules/claude-ai';

interface FullPondSpreadProps {
  drawnCards: Card[];
  selectedBlock: BlockType | null;
  onReset: () => void;
  personalizedReading: PersonalizedReading | null;
  loadingReading: boolean;
}

const FullPondSpread: React.FC<FullPondSpreadProps> = ({
  drawnCards,
  selectedBlock,
  onReset,
  personalizedReading,
  loadingReading,
}) => {
  const renderCard = (card: Card) => {
    const blockAdvice =
      card.block_applications[
        selectedBlock?.id as keyof typeof card.block_applications
      ];

    return (
      <div
        key={card.id}
        className="bg-white rounded-lg shadow-md p-4 transform hover:scale-105 transition-transform duration-300"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{card.emoji}</div>
          <h3 className="text-xl font-semibold text-gray-800">{card.name}</h3>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-semibold text-gray-700 mb-2">
            {selectedBlock?.name} Insight
          </h4>
          <p className="text-sm text-gray-600">{blockAdvice}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-b from-blue-100 to-purple-100 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🌊🦆🌊</div>
        <h1 className="text-3xl font-bold text-gray-800">Full Pond Spread</h1>
        <p className="text-lg text-gray-600">
          A comprehensive look at your situation from multiple angles.
        </p>
      </div>

      {loadingReading ? (
        <div className="bg-blue-50 rounded-lg p-8 text-center shadow-inner">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">
            Rob is consulting the pond spirits for deeper wisdom...
          </p>
        </div>
      ) : personalizedReading ? (
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{selectedBlock?.emoji}</span>
              <h2 className="text-2xl font-bold text-gray-800">
                Rob's Personalized Analysis
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {personalizedReading.interpretation}
            </p>
          </div>

          {personalizedReading.keyInsights.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🔍 Key Insights
              </h3>
              <ul className="space-y-3">
                {personalizedReading.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {personalizedReading.actionSteps.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🎯 Action Steps
              </h3>
              <ol className="space-y-3">
                {personalizedReading.actionSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🦆 Rob's Final Word
            </h3>
            <p className="text-gray-700 italic leading-relaxed">
              "{personalizedReading.robQuip}"
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {drawnCards.map(renderCard)}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300"
        >
          🔄 Start a New Reading 🔄 New Consultation
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

export default FullPondSpread;
