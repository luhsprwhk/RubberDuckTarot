import {
  ChatAnalyticsService,
  ChatAnalytics,
  InsightImprovement,
} from './chat-analytics';

export interface SystemInsightReport {
  timestamp: Date;
  timeframe: string;
  effectivenessScore: number; // 0-100
  recommendations: ReturnType<
    (typeof InsightImprovementService)['generatePrioritizedRecommendations']
  >;
  trends: {
    userEngagement: 'up' | 'down' | 'stable';
    sentimentTrend: 'positive' | 'negative' | 'neutral';
    conversationLength: 'increasing' | 'decreasing' | 'stable';
  };
  actionItems: string[];
}

export class InsightImprovementService {
  /**
   * Generates a comprehensive report for improving the insight system
   */
  static async generateSystemReport(
    timeframeDays: number = 7
  ): Promise<SystemInsightReport> {
    const analytics = await ChatAnalyticsService.getChatAnalytics(
      timeframeDays * 24
    );
    const improvements = await ChatAnalyticsService.getInsightImprovements(
      timeframeDays * 24
    );

    // Calculate effectiveness score based on multiple factors
    const effectivenessScore = this.calculateEffectivenessScore(analytics);

    const trends = {
      userEngagement: this.analyzeEngagementTrend(analytics),
      sentimentTrend: 'neutral' as const, // Placeholder: 'positive', 'negative', 'neutral'
      conversationLength: this.analyzeConversationLengthTrend(analytics),
    };

    const recommendations =
      this.generatePrioritizedRecommendations(improvements);

    const actionItems = this.generateActionItems(improvements);

    return {
      timestamp: new Date(),
      timeframe: `${timeframeDays} days`,
      effectivenessScore,
      recommendations,
      trends,
      actionItems,
    };
  }

  /**
   * Calculates an overall effectiveness score (0-100)
   */
  private static calculateEffectivenessScore(analytics: ChatAnalytics): number {
    let score = 50; // Base score

    // Sentiment impact (40% of score)
    const { positive, neutral, negative } = analytics.sentimentDistribution;
    const total = positive + neutral + negative;
    if (total > 0) {
      const positiveRatio = positive / total;
      score += (positiveRatio - 0.5) * 80; // -40 to +40 points
    }

    // Engagement impact (30% of score)
    const avgMessages = analytics.avgMessagesPerConversation;
    if (avgMessages >= 3 && avgMessages <= 8) {
      score += 30; // Ideal conversation length
    } else if (avgMessages >= 2 && avgMessages <= 10) {
      score += 15; // Good conversation length
    } else if (avgMessages < 2) {
      score -= 20; // Too short - users not engaged
    } else {
      score -= 10; // Too long - initial insight insufficient
    }

    // Volume impact (20% of score)
    const totalConversations = analytics.totalConversations;
    if (totalConversations > 10) score += 20;
    else if (totalConversations > 5) score += 10;
    else if (totalConversations > 0) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generates prioritized recommendations based on analytics
   */
  private static generatePrioritizedRecommendations(
    improvements: InsightImprovement[]
  ) {
    // TODO: Implement more sophisticated prioritization logic
    return improvements.map((improvement) => {
      let priority: 'high' | 'medium' | 'low';
      if (improvement.frequency > 10) {
        priority = 'high';
      } else if (improvement.frequency > 5) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      return {
        priority,
        category: 'Insight Quality',
        description: `Improve insights for the topic: '${improvement.topic}' which appeared ${improvement.frequency} times.`,
        implementation: `Review and refine the insight for topic: "${improvement.topic}". Consider the following suggestions: ${improvement.suggestions.join(', ')}`,
      };
    });
  }

  /**
   * Analyzes engagement trend (simplified - would need historical data for real implementation)
   */
  private static analyzeEngagementTrend(
    analytics: ChatAnalytics
  ): 'up' | 'down' | 'stable' {
    const avgMessages = analytics.avgMessagesPerConversation;

    if (avgMessages > 5) return 'up';
    if (avgMessages < 2) return 'down';
    return 'stable';
  }

  /**
   * Analyzes conversation length trend
   */
  private static analyzeConversationLengthTrend(
    analytics: ChatAnalytics
  ): 'increasing' | 'decreasing' | 'stable' {
    const avgMessages = analytics.avgMessagesPerConversation;

    if (avgMessages > 6) return 'increasing';
    if (avgMessages < 3) return 'decreasing';
    return 'stable';
  }

  /**
   * Generates actionable items from recommendations
   */
  private static generateActionItems(
    recommendations: InsightImprovement[]
  ): string[] {
    // Placeholder logic
    return recommendations
      .filter((rec) => rec.suggestions.length > 0)
      .map((rec) => rec.suggestions[0]);
  }

  /**
   * Schedules automatic report generation (would integrate with a job scheduler)
   */
  static async scheduleWeeklyReports(): Promise<void> {
    // This would integrate with a scheduling system in production
    console.log('Weekly insight improvement reports scheduled');

    // For now, just generate a report to demonstrate
    const report = await this.generateSystemReport(7);
    console.log('Weekly Insight Improvement Report:', {
      timestamp: report.timestamp,
      effectivenessScore: report.effectivenessScore,
      actionItemCount: report.actionItems.length,
      highPriorityRecommendations: report.recommendations.filter(
        (r) => r.priority === 'high'
      ).length,
    });
  }

  /**
   * Exports analytics data for external analysis (CSV format)
   */
  static async exportAnalyticsData(
    timeframeDays: number = 30
  ): Promise<string> {
    const timeframeHours = timeframeDays * 24;
    const analytics =
      await ChatAnalyticsService.getChatAnalytics(timeframeHours);
    const improvements =
      await ChatAnalyticsService.getInsightImprovements(timeframeHours);

    const csvData = [
      ['Metric', 'Value'],
      ['Total Conversations', analytics.totalConversations.toString()],
      ['Total Messages', analytics.totalMessages.toString()],
      [
        'Avg Messages Per Conversation',
        analytics.avgMessagesPerConversation.toString(),
      ],
      [
        'Positive Sentiment',
        analytics.sentimentDistribution.positive.toString(),
      ],
      ['Neutral Sentiment', analytics.sentimentDistribution.neutral.toString()],
      [
        'Negative Sentiment',
        analytics.sentimentDistribution.negative.toString(),
      ],
      ['Common Topics', analytics.commonTopics.join('; ')],
      [
        'Top Improvement Areas',
        improvements
          .slice(0, 3)
          .map((i) => i.topic)
          .join('; '),
      ],
    ];

    return csvData.map((row) => row.join(',')).join('\n');
  }
}
