import React from 'react';
import type { PersonalizedReading } from '@/src/lib/claude-ai';
import type { Card, BlockType } from '@/src/interfaces';
import robEmoji from '@/src/assets/rob-emoji.png';
import AdBanner from './AdBanner';
import { useNavigate } from 'react-router-dom';

interface QuickDrawSpreadProps {
  drawnCard: Card;
  selectedBlock: BlockType | null;
  onReset: () => void;
  personalizedReading: PersonalizedReading | null;
  loadingReading: boolean;
}

const QuickDuckSpread: React.FC<QuickDrawSpreadProps> = ({
  drawnCard,
  selectedBlock,
  personalizedReading,
  loadingReading,
}) => {
  const navigate = useNavigate();
  const blockAdvice =
    drawnCard?.block_applications[
      selectedBlock?.id as keyof typeof drawnCard.block_applications
    ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      {drawnCard && (
        <div className="bg-void-gradient rounded-xl shadow-xl p-6 mb-6">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{drawnCard.emoji}</div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              {drawnCard.name}
            </h2>
            <p className="text-lg text-secondary italic">
              "{drawnCard.duck_question}"
            </p>
          </div>

          {/* Personalized Reading or Loading */}
          {loadingReading ? (
            <div className="bg-void-gradient rounded-lg p-6 mb-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-secondary">
                Rob is analyzing your situation...
              </p>
            </div>
          ) : personalizedReading ? (
            <>
              {/* AI-Generated Interpretation */}
              <div className="bg-liminal-surface rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selectedBlock?.emoji}</span>
                  <h3 className="text-lg font-semibold text-accent">
                    Interpretation
                  </h3>
                </div>
                <p className="text-secondary leading-relaxed whitespace-pre-line">
                  {personalizedReading.interpretation}
                </p>
              </div>

              {/* Key Insights */}
              {personalizedReading.keyInsights.length > 0 && (
                <div className="bg-liminal-surface rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-accent mb-3">
                    🔍 Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {personalizedReading.keyInsights.map(
                      (insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span className="text-primary">{insight}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Action Steps */}
              {personalizedReading.actionSteps.length > 0 && (
                <div className="bg-liminal-surface rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-accent mb-3">
                    🎯 Action Steps
                  </h3>
                  <ol className="space-y-2">
                    {personalizedReading.actionSteps.map(
                      (step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-accent font-semibold">
                            {index + 1}.
                          </span>
                          <span className="text-primary">{step}</span>
                        </li>
                      )
                    )}
                  </ol>
                </div>
              )}

              {/* Ad Banner */}
              <AdBanner />

              {/* Rob's Quip */}
              <div className="bg-liminal-surface rounded-lg p-4 mt-6 mb-6">
                <h3 className="text-lg font-semibold text-accent mb-2">
                  <img
                    src={robEmoji}
                    alt="Rob"
                    className="w-6 h-6 inline-block"
                  />{' '}
                  Rob's Final Word
                </h3>
                <p className="text-primary italic leading-relaxed">
                  "{personalizedReading.robQuip}"
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Fallback to Static Content */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selectedBlock?.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedBlock?.name} Insight
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{blockAdvice}</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  <img
                    src={robEmoji}
                    alt="Rob"
                    className="w-6 h-6 inline-block"
                  />{' '}
                  Rob's Debugging Wisdom
                </h3>
                <p className="text-gray-700 italic leading-relaxed">
                  "{drawnCard.duck_wisdom}"
                </p>
              </div>

              {/* Ad Banner Placeholder */}
              <AdBanner />

              <div className="mb-6 mt-6">
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
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-x-4 mt-4">
        <button
          onClick={() => navigate('/new-reading')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔄 New Consultation
        </button>
      </div>
    </div>
  );
};

export default QuickDuckSpread;
