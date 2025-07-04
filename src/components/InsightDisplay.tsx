import React from 'react';
import type { Card, BlockType } from '@/src/interfaces';
import type { PersonalizedReading } from '@/src/ai';
import robEmoji from '@/src/assets/rob-emoji.png';
import AdBanner from './AdBanner';
import SentimentTracking from './SentimentTracking';
import { updateInsightSentiment } from '@/src/lib/insights/insight-queries';
import { useNavigate } from 'react-router-dom';
import { createCardSlug } from '@/src/lib/cards/card-helpers';

interface InsightDisplayProps {
  selectedBlock: BlockType | null;
  personalizedReading: PersonalizedReading | null;
  loadingReading: boolean;
  drawnCards: (Card & { reversed?: boolean })[];
  spreadType?: string;
  loadingMessage?: string;
  insightId?: number;
  initialResonated?: boolean;
  initialTookAction?: boolean;
}

const InsightDisplay: React.FC<InsightDisplayProps> = ({
  selectedBlock,
  personalizedReading,
  loadingReading,
  drawnCards,
  loadingMessage = 'Rob is analyzing your situation...',
  insightId,
  initialResonated,
  initialTookAction,
}) => {
  const navigate = useNavigate();
  const handleSentimentChange = async (
    insightId: number,
    resonated?: boolean,
    tookAction?: boolean
  ) => {
    try {
      await updateInsightSentiment(insightId, resonated, tookAction);
    } catch (error) {
      console.error('Failed to update insight sentiment:', error);
    }
  };
  if (loadingReading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-void-gradient rounded-lg p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-secondary">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (personalizedReading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-liminal-surface">
        {/* Render drawn cards */}
        {drawnCards && drawnCards.length > 0 && (
          <div
            className={`grid gap-4 mb-6 ${drawnCards.length === 1 ? 'grid-cols-1' : 'md:grid-cols-3'}`}
          >
            {drawnCards.map((card) => (
              <div
                key={card.id}
                className="bg-void-gradient rounded-lg p-4 text-center shadow-md"
                onClick={() => navigate(`/cards/${createCardSlug(card.name)}`)}
              >
                <div
                  className={`text-4xl mb-2 ${card.reversed ? 'transform rotate-180' : ''}`}
                >
                  {card.emoji}
                </div>
                <div className="text-lg font-semibold text-primary mb-1">
                  {card.name}
                  {card.reversed && (
                    <span className="text-xs text-accent ml-1">(Reversed)</span>
                  )}
                </div>
                <div className="text-secondary text-sm italic">
                  {card.duck_question}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* AI-Generated Interpretation */}
        <div className="bg-liminal-overlay rounded-lg p-4 mb-6">
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
          <div className="bg-liminal-overlay rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-accent mb-3">
              🔍 Key Insights
            </h3>
            <ul className="space-y-2">
              {personalizedReading.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-primary">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Steps */}
        {personalizedReading.actionSteps.length > 0 && (
          <div className="bg-liminal-overlay rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-accent mb-3">
              🎯 Next Steps
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

        {/* Reflection Prompts */}
        {(personalizedReading?.reflectionPrompts ?? []).length > 0 && (
          <div className="bg-liminal-overlay rounded-lg p-4 mt-6 mb-6">
            <h3 className="text-lg font-semibold text-accent mb-2">
              <span className="text-xl mr-2">🪞</span>
              Explore Further
            </h3>
            <ul className="space-y-2 bullet-list">
              {personalizedReading?.reflectionPrompts?.map((prompt, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-primary">{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Rob's Quip */}
        <div className="bg-liminal-overlay rounded-lg p-4 mt-6 mb-6">
          <h3 className="text-lg font-semibold text-accent mb-2">
            <img src={robEmoji} alt="Rob" className="w-6 h-6 inline-block" />{' '}
            Rob's Final Word
          </h3>
          <p className="text-primary italic leading-relaxed">
            "{personalizedReading.robQuip}"
          </p>
        </div>

        {/* Sentiment Tracking */}
        {insightId && (
          <SentimentTracking
            insightId={insightId}
            initialResonated={initialResonated}
            initialTookAction={initialTookAction}
            onSentimentChange={handleSentimentChange}
          />
        )}
      </div>
    );
  }

  // No content to display
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <p className="text-secondary">No insight data available.</p>
    </div>
  );
};

export default InsightDisplay;
