import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { FaSpinner } from 'react-icons/fa';

const insightPanelClass = cn(
  'bg-liminal-surface border-liminal-overlay shadow-breakthrough border border-liminal-border rounded-lg'
);

import type { Card, BlockType, UserBlock } from '@/src/interfaces';
import type { PersonalizedReading } from '@/src/ai';
import robEmoji from '@/src/assets/rob-emoji.png';
import AdBanner from './AdBanner';
import SentimentTracking from './SentimentTracking';
import { updateInsightSentiment } from '@/src/lib/insights/insight-queries';
import { generatePrettyTitle } from '@/src/ai/generate_pretty_title';
import { useNavigate } from 'react-router-dom';
import { createCardSlug } from '@/src/lib/cards/card-helpers';
import { NotionService } from '@/src/lib/notion/notion-service';
import { NotionOperations } from '@/src/lib/notion/notion-operations';
import useAuth from '@/src/lib/hooks/useAuth';
import useAlerts from '@/src/lib/hooks/useAlert';

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
  userBlock?: UserBlock | null;
  isPremium: boolean;
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
  userBlock,
  isPremium,
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
      <div className={cn('max-w-2xl mx-auto p-6', insightPanelClass)}>
        <div className={cn('bg-void-gradient rounded-lg p-6 mb-6 text-center')}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-secondary">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (personalizedReading) {
    return (
      <div className="max-w-2xl mx-auto pb-6 mt-12">
        <div className={cn('max-w-2xl mx-auto p-6', insightPanelClass)}>
          {/* Render drawn cards */}
          {drawnCards && drawnCards.length > 0 && (
            <div
              className={cn(
                'grid gap-4 mb-6',
                drawnCards.length === 1 ? 'grid-cols-1' : 'md:grid-cols-3'
              )}
            >
              {drawnCards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    'bg-void-gradient rounded-lg p-4 text-center shadow-md'
                  )}
                  onClick={() =>
                    navigate(`/cards/${createCardSlug(card.name)}`)
                  }
                >
                  <div
                    className={cn(
                      'text-4xl mb-2',
                      card.reversed && 'transform rotate-180'
                    )}
                  >
                    {card.emoji}
                  </div>
                  <div
                    className={cn('text-lg font-semibold text-primary mb-1')}
                  >
                    {card.name}
                    {card.reversed && (
                      <span className={cn('text-xs text-accent ml-1')}>
                        (Reversed)
                      </span>
                    )}
                  </div>
                  <div className={cn('text-secondary text-sm italic')}>
                    {card.duck_question}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* AI-Generated Interpretation */}
          <div className="bg-liminal-overlay rounded-lg p-4 mb-6 shadow-breakthrough border border-liminal-border">
            <div className={cn('flex items-center gap-2 mb-3')}>
              <span className="text-xl">{selectedBlock?.emoji}</span>
              <h3 className={cn('text-lg font-semibold text-accent')}>
                Interpretation
              </h3>
            </div>
            <p
              className={cn(
                'text-secondary leading-relaxed whitespace-pre-line'
              )}
            >
              {personalizedReading.interpretation}
            </p>
          </div>

          {/* Key Insights */}
          {personalizedReading.keyInsights.length > 0 && (
            <div className="bg-liminal-overlay rounded-lg p-4 mb-6 shadow-breakthrough border border-liminal-border">
              <h3 className="text-lg font-semibold text-accent mb-3">
                🔍 Key Insights
              </h3>
              <ul className={cn('space-y-2')}>
                {personalizedReading.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span className={cn('text-primary')}>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Steps */}
          {personalizedReading.actionSteps.length > 0 && (
            <NextSteps
              actionSteps={personalizedReading.actionSteps}
              isPremium={isPremium}
              personalizedReading={personalizedReading}
              selectedBlock={selectedBlock}
              drawnCards={drawnCards}
            />
          )}

          {/* Ad Banner */}
          <AdBanner />

          {/* Reflection Prompts */}
          {(personalizedReading?.reflectionPrompts ?? []).length > 0 && (
            <div className="bg-liminal-overlay rounded-lg p-4 mt-6 mb-6 shadow-breakthrough border border-liminal-border">
              <h3 className="text-lg font-semibold text-accent mb-2">
                <span className={cn('text-xl mr-2')}>🪞</span>
                Explore Further
              </h3>
              <ul className={cn('space-y-2 bullet-list')}>
                {personalizedReading?.reflectionPrompts?.map(
                  (prompt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span className={cn('text-primary')}>{prompt}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          {/* Rob's Quip */}
          <div className="bg-liminal-overlay rounded-lg p-4 mt-6 mb-6 shadow-breakthrough border border-liminal-border">
            <h3 className="text-lg font-semibold text-accent mb-2">
              <img
                src={robEmoji}
                alt="Rob"
                className={cn('w-6 h-6 inline-block')}
              />{' '}
              Rob's Final Word
            </h3>
            <p className={cn('text-primary italic leading-relaxed')}>
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

        {/* View User Block */}
        {userBlock && (
          <div
            onClick={() => navigate(`/blocks/${userBlock.id}`)}
            className="bg-liminal-overlay cursor-pointer rounded-lg p-4 mt-6 mb-6 shadow-breakthrough border border-liminal-border"
          >
            <div className="flex flex-col">
              <span className="text-primary font-semibold text-lg">
                {userBlock.name}
              </span>
              {userBlock.status && (
                <span className="text-secondary text-xs mb-1">
                  Status: {userBlock.status}
                </span>
              )}
              {userBlock.notes && (
                <span className="text-secondary text-xs italic mt-1">
                  {userBlock.notes}
                </span>
              )}
              <span className="text-accent text-sm mt-2">View User Block</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // No content to display
  return (
    <div className={cn('max-w-2xl mx-auto p-6 text-center')}>
      <p className={cn('text-secondary')}>No insight data available.</p>
    </div>
  );
};

type NextStepsProps = {
  actionSteps: string[];
  isPremium: boolean;
  personalizedReading: PersonalizedReading;
  selectedBlock: BlockType | null;
  drawnCards: Card[] | null;
};

const NextSteps: React.FC<NextStepsProps> = ({
  actionSteps,
  isPremium,
  // personalizedReading,
  selectedBlock,
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlerts();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToNotion = async (stepIndex: number, step: string) => {
    if (!isPremium || !user) return;

    setIsExporting(true);
    try {
      // Check if user has Notion integration
      const integration = await NotionOperations.getNotionIntegration(user.id);

      if (!integration) {
        // Start OAuth flow
        const authUrl = await NotionService.initiateOAuth();
        window.location.href = authUrl;
        return;
      }

      // Create page title using the next step and AI summarizer
      const title = await generatePrettyTitle(step);

      // Export to Notion with the AI-generated title and supporting info as content
      await NotionService.createPage(integration.accessToken, {
        title,
        blockName: selectedBlock?.name,
        insightDate: new Date().toLocaleDateString(),
        insightUrl: window.location.href, // Link back to current insight
        nextStep: true,
        content: {
          actionStep: step,
        },
      });

      showSuccess(`Successfully exported step ${stepIndex + 1} to Notion!`);
    } catch (error) {
      console.error('Export to Notion failed:', error);
      showError('Failed to export to Notion. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-liminal-overlay rounded-lg p-4 mb-6 shadow-breakthrough border border-liminal-border">
      <h3 className="text-lg font-semibold text-accent mb-3">🎯 Next Steps</h3>
      <ol className={cn('space-y-3')}>
        {actionSteps.map((step, index) => (
          <li key={index} className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <span className={cn('text-accent font-semibold')}>
                {index + 1}.
              </span>
              <span className={cn('text-primary')}>{step}</span>
            </div>
            <button
              className={cn(
                'px-2 py-1 cursor-pointer text-xs rounded-md font-medium shadow-sm transition-colors shrink-0',
                isPremium
                  ? 'bg-accent text-void-900 hover:bg-accent/90'
                  : 'bg-muted text-secondary cursor-not-allowed opacity-60'
              )}
              disabled={!isPremium || isExporting}
              title={
                isPremium
                  ? 'Send this step to Notion'
                  : 'Upgrade to Premium to send to Notion'
              }
              onClick={() => handleExportToNotion(index, step)}
            >
              {isExporting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                'Send to Notion'
              )}
            </button>
          </li>
        ))}
      </ol>
      {!isPremium && (
        <div className="mt-3 text-xs text-secondary" title="Premium required">
          Premium required for Notion export
        </div>
      )}
    </div>
  );
};

export default InsightDisplay;
