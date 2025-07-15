import { IntelligenceScheduler } from './scheduler';
import type { Insight } from '../interfaces';

/**
 * Event-driven triggers for intelligence analysis
 */
export class IntelligenceTriggers {
  /**
   * Trigger when a user creates a new insight
   */
  static async onInsightCreated(insight: Insight): Promise<void> {
    if (!insight.user_id) return;

    try {
      await IntelligenceScheduler.onUserMilestone(
        insight.user_id,
        'insight_created'
      );
    } catch (error) {
      console.error('Failed to trigger analysis on insight creation:', error);
    }
  }

  /**
   * Trigger when a user completes a conversation
   */
  static async onConversationCompleted(
    userId: string,
    messageCount: number
  ): Promise<void> {
    // Only trigger for meaningful conversations
    if (messageCount < 5) return;

    try {
      await IntelligenceScheduler.onUserMilestone(
        userId,
        'conversation_completed'
      );
    } catch (error) {
      console.error(
        'Failed to trigger analysis on conversation completion:',
        error
      );
    }
  }

  /**
   * Trigger when user updates their profile significantly
   */
  static async onProfileUpdated(userId: string): Promise<void> {
    try {
      // Wait a bit to let new profile data settle
      setTimeout(async () => {
        await IntelligenceScheduler.onUserMilestone(userId, 'insight_created');
      }, 30000); // 30 second delay
    } catch (error) {
      console.error('Failed to trigger analysis on profile update:', error);
    }
  }

  /**
   * Trigger when user shows signs of being stuck (low resonance/action rates)
   */
  static async onUserStuckPattern(userId: string): Promise<void> {
    try {
      console.log(
        `🚨 User ${userId} showing stuck pattern - triggering immediate analysis`
      );
      await IntelligenceScheduler.analyzeUsersNow([userId]);
    } catch (error) {
      console.error('Failed to trigger analysis for stuck user:', error);
    }
  }

  /**
   * Trigger when user requests analysis (premium feature)
   */
  static async onUserRequestsAnalysis(userId: string): Promise<void> {
    try {
      console.log(
        `📊 User ${userId} requested analysis - running immediate analysis`
      );
      await IntelligenceScheduler.analyzeUsersNow([userId]);
    } catch (error) {
      console.error('Failed to run user-requested analysis:', error);
    }
  }
}

/**
 * Integration hooks for existing codebase
 */
export const integrationHooks = {
  /**
   * Hook to call from insight creation endpoint
   */
  afterInsightCreated: async (insight: Insight) => {
    await IntelligenceTriggers.onInsightCreated(insight);
  },

  /**
   * Hook to call from chat completion
   */
  afterChatCompleted: async (userId: string, messageCount: number) => {
    await IntelligenceTriggers.onConversationCompleted(userId, messageCount);
  },

  /**
   * Hook to call from profile update
   */
  afterProfileUpdated: async (userId: string) => {
    await IntelligenceTriggers.onProfileUpdated(userId);
  },

  /**
   * Hook to call when detecting stuck patterns
   */
  onStuckPatternDetected: async (userId: string) => {
    await IntelligenceTriggers.onUserStuckPattern(userId);
  },

  /**
   * Hook for premium user analysis requests
   */
  onAnalysisRequested: async (userId: string) => {
    await IntelligenceTriggers.onUserRequestsAnalysis(userId);
  },
};

// Export for easy integration
export { IntelligenceTriggers, integrationHooks as hooks };
