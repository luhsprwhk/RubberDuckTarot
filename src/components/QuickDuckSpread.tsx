import React, { useEffect, useState } from 'react';
import { getDb } from '@/lib/database-provider';
import {
  generatePersonalizedReading,
  type PersonalizedReading,
} from '@/src/shared/claude-ai';
import type { Card, BlockType } from '@/src/shared/interfaces';
import type { UserProfile } from '@/src/shared/userPreferences';

interface QuickDrawSpreadProps {
  step: 'drawing' | 'revealed';
  drawnCard: Card;
  selectedBlockTypeId: string;
  userContext: string;
  userProfile: UserProfile | null;
  onReset: () => void;
}

const QuickDuckSpread: React.FC<QuickDrawSpreadProps> = ({
  step,
  drawnCard,
  selectedBlockTypeId,
  userContext,
  userProfile,
  onReset,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [personalizedReading, setPersonalizedReading] =
    useState<PersonalizedReading | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);

  useEffect(() => {
    const fetchBlock = async () => {
      const db = await getDb();
      const block = await db.getBlockTypeById(selectedBlockTypeId);
      setSelectedBlock(block);
    };
    fetchBlock();
  }, [selectedBlockTypeId]);

  // Generate personalized reading when card is revealed
  useEffect(() => {
    const generateReading = async () => {
      if (
        step === 'revealed' &&
        drawnCard &&
        selectedBlock &&
        userProfile &&
        !personalizedReading
      ) {
        setLoadingReading(true);
        try {
          const reading = await generatePersonalizedReading({
            cards: [drawnCard],
            blockType: selectedBlock,
            userContext,
            userProfile,
            spreadType: 'quick-draw',
          });
          setPersonalizedReading(reading);
        } catch (error) {
          console.error('Failed to generate personalized reading:', error);
        } finally {
          setLoadingReading(false);
        }
      }
    };

    generateReading();
  }, [
    step,
    drawnCard,
    selectedBlock,
    userProfile,
    userContext,
    personalizedReading,
  ]);

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

          {/* Personalized Reading or Loading */}
          {loadingReading ? (
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">
                Rob is analyzing your situation...
              </p>
            </div>
          ) : personalizedReading ? (
            <>
              {/* AI-Generated Interpretation */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selectedBlock?.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Rob's Personalized Analysis
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {personalizedReading.interpretation}
                </p>
              </div>

              {/* Key Insights */}
              {personalizedReading.keyInsights.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🔍 Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {personalizedReading.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Steps */}
              {personalizedReading.actionSteps.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🎯 Action Steps
                  </h3>
                  <ol className="space-y-2">
                    {personalizedReading.actionSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 font-semibold">
                          {index + 1}.
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Rob's Quip */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  🦆 Rob's Final Word
                </h3>
                <p className="text-gray-700 italic leading-relaxed">
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
                  🦆 Rob's Debugging Wisdom
                </h3>
                <p className="text-gray-700 italic leading-relaxed">
                  "{drawnCard.duck_wisdom}"
                </p>
              </div>

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
            </>
          )}
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
