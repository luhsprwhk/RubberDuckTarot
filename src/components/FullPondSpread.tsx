import React, { useEffect, useState } from 'react';
import { getDb } from '@/lib/database-provider';
import {
  generatePersonalizedReading,
  type PersonalizedReading,
} from '../shared/claude-ai';
import type { Card, BlockType } from '../shared/interfaces';
import type { UserProfile } from '../shared/userPreferences';

interface FullPondSpreadProps {
  drawnCards: Card[];
  onReset: () => void;
  selectedBlockTypeId: string;
  userContext: string;
  userProfile: UserProfile | null;
}

const FullPondSpread: React.FC<FullPondSpreadProps> = ({
  drawnCards,
  onReset,
  selectedBlockTypeId,
  userContext,
  userProfile,
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

  // Generate personalized reading when cards and profile are available
  useEffect(() => {
    const generateReading = async () => {
      if (drawnCards.length === 3 && selectedBlock && userProfile) {
        setLoadingReading(true);
        setPersonalizedReading(null); // Reset previous reading
        try {
          const reading = await generatePersonalizedReading({
            cards: drawnCards,
            blockType: selectedBlock,
            userContext,
            userProfile,
            spreadType: 'full-pond',
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
  }, [drawnCards, selectedBlock, userProfile, userContext]);
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🦆🧙‍♂️</div>
        <h1 className="text-2xl font-bold text-gray-800">
          Rob's Full Pond Spread
        </h1>
      </div>

      {/* Three Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {drawnCards.map((card, index) => (
          <div
            key={card.id + '-' + index}
            className="bg-white rounded-xl shadow-xl p-6"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{card.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800">{card.name}</h3>
              <p className="text-sm text-gray-600 italic">
                "{card.duck_question}"
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Traditional:
                </p>
                <p className="text-sm text-gray-600">
                  {card.traditional_equivalent}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Core Meaning:
                </p>
                <p className="text-sm text-gray-600">{card.core_meaning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Personalized Reading or Loading */}
      {loadingReading ? (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">
            Rob is analyzing your three-card spread...
          </p>
        </div>
      ) : personalizedReading ? (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Rob's Combined Reading
          </h2>

          {/* AI-Generated Interpretation */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{selectedBlock?.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-800">
                Three-Card Analysis
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
                {personalizedReading.keyInsights.map(
                  (insight: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  )
                )}
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
                {personalizedReading.actionSteps.map(
                  (step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 font-semibold">
                        {index + 1}.
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  )
                )}
              </ol>
            </div>
          )}

          {/* Rob's Quip */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🦆 Rob's Final Word
            </h3>
            <p className="text-gray-700 italic leading-relaxed">
              "{personalizedReading.robQuip}"
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Traditional Spread View
          </h2>
          <p className="text-gray-600 text-center">
            View the individual card meanings above for insight into your{' '}
            {selectedBlock?.name} block.
          </p>
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

export default FullPondSpread;
