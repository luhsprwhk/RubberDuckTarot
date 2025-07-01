import React from 'react';
import type { Card, BlockType } from '@/src/interfaces';
import type { PersonalizedReading } from '@/src/lib/claude-ai';
import robEmoji from '@/src/assets/rob-emoji.png';
import AdBanner from './AdBanner';

interface InsightDisplayProps {
  selectedBlock: BlockType | null;
  personalizedReading: PersonalizedReading | null;
  loadingReading: boolean;
  drawnCards: Card[];
  spreadType?: string;
  loadingMessage?: string;
}

const InsightDisplay: React.FC<InsightDisplayProps> = ({
  selectedBlock,
  personalizedReading,
  loadingReading,
  drawnCards,
  loadingMessage = 'Rob is analyzing your situation...',
}) => {
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
              >
                <div className="text-4xl mb-2">{card.emoji}</div>
                <div className="text-lg font-semibold text-primary mb-1">
                  {card.name}
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
        <div className="bg-liminal-overlay rounded-lg p-4 mt-6 mb-6">
          <h3 className="text-lg font-semibold text-accent mb-2">
            <img src={robEmoji} alt="Rob" className="w-6 h-6 inline-block" />{' '}
            Rob's Final Word
          </h3>
          <p className="text-primary italic leading-relaxed">
            "{personalizedReading.robQuip}"
          </p>
        </div>
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
