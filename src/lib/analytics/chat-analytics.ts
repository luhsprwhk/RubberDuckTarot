import { ChatPersistenceService } from '../chat/chat-persistence';

export interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  commonTopics: string[];
  sentimentDistribution: Record<string, number>;
  userEngagementMetrics: {
    averageSessionLength: number;
    returnUserRate: number;
    mostActiveHours: number[];
  };
  insightEffectiveness: {
    conversationsWithFollowUp: number;
    averageFollowUpQuestions: number;
    topInsightCategories: string[];
  };
}

export interface InsightImprovement {
  topic: string;
  frequency: number;
  suggestions: string[];
  userQuestionPatterns: string[];
}

export class ChatAnalyticsService {
  /**
   * Gets comprehensive analytics for chat data
   */
  static async getChatAnalytics(
    timeframeHours: number = 24 * 7
  ): Promise<ChatAnalytics> {
    const basicAnalytics =
      await ChatPersistenceService.getAnalyticsData(timeframeHours);

    // TODO: Extend with more sophisticated analytics when we have more data
    const userEngagementMetrics = {
      averageSessionLength: 0, // To be implemented
      returnUserRate: 0, // To be implemented
      mostActiveHours: [], // To be implemented
    };

    const insightEffectiveness = {
      conversationsWithFollowUp: basicAnalytics.totalConversations,
      averageFollowUpQuestions: basicAnalytics.avgMessagesPerConversation,
      topInsightCategories: [], // To be implemented
    };

    return {
      ...basicAnalytics,
      userEngagementMetrics,
      insightEffectiveness,
    };
  }

  /**
   * Analyzes chat patterns to identify areas for insight improvement
   */
  static async getInsightImprovements(
    timeframeHours: number = 24 * 30
  ): Promise<InsightImprovement[]> {
    const analytics = await this.getChatAnalytics(timeframeHours);
    const improvements: InsightImprovement[] = [];

    // Analyze common topics for improvement opportunities
    for (const topic of analytics.commonTopics) {
      const topicFrequency = analytics.commonTopics.indexOf(topic) + 1;

      improvements.push({
        topic,
        frequency: topicFrequency,
        suggestions: this.generateTopicSuggestions(topic),
        userQuestionPatterns: this.identifyQuestionPatterns(topic),
      });
    }

    return improvements.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Generates suggestions for improving insights based on topic analysis
   */
  private static generateTopicSuggestions(topic: string): string[] {
    const suggestions: Record<string, string[]> = {
      career: [
        'Include more specific actionable steps for career transitions',
        'Add guidance on networking and professional relationship building',
        'Provide frameworks for career decision-making',
      ],
      relationships: [
        'Offer communication templates for difficult conversations',
        'Include boundary-setting strategies',
        'Add guidance on conflict resolution techniques',
      ],
      creativity: [
        'Suggest specific creative exercises and prompts',
        'Include advice on overcoming creative blocks',
        'Provide frameworks for creative project management',
      ],
      personal_growth: [
        'Add more concrete goal-setting strategies',
        'Include mindfulness and self-reflection techniques',
        'Provide habit formation frameworks',
      ],
      decision_making: [
        'Offer decision-making frameworks and tools',
        'Include pros/cons analysis techniques',
        'Add guidance on trusting intuition vs. logic',
      ],
    };

    // Match topic to suggestion category (simple keyword matching)
    for (const [category, categorySuggestions] of Object.entries(suggestions)) {
      if (
        topic.toLowerCase().includes(category) ||
        category.includes(topic.toLowerCase())
      ) {
        return categorySuggestions;
      }
    }

    // Default suggestions for unmatched topics
    return [
      'Provide more specific, actionable guidance',
      'Include real-world examples and case studies',
      'Add follow-up questions to deepen understanding',
    ];
  }

  /**
   * Identifies common question patterns for a topic
   */
  private static identifyQuestionPatterns(topic: string): string[] {
    const patterns: Record<string, string[]> = {
      career: [
        'How do I know if I should change careers?',
        'What steps should I take to advance professionally?',
        'How do I handle workplace conflict?',
      ],
      relationships: [
        'How do I improve communication with my partner?',
        'What should I do about a difficult relationship?',
        'How do I set healthy boundaries?',
      ],
      creativity: [
        'How do I overcome creative blocks?',
        'What should I do when I feel uninspired?',
        'How do I make time for creative projects?',
      ],
      personal_growth: [
        'How do I build better habits?',
        'What should I focus on for self-improvement?',
        'How do I overcome self-doubt?',
      ],
      decision_making: [
        'How do I make better decisions?',
        'What should I consider when facing a big choice?',
        'How do I trust my instincts?',
      ],
    };

    // Match topic to question patterns
    for (const [category, categoryPatterns] of Object.entries(patterns)) {
      if (
        topic.toLowerCase().includes(category) ||
        category.includes(topic.toLowerCase())
      ) {
        return categoryPatterns;
      }
    }

    return [
      'What specific steps should I take?',
      'How do I handle this situation?',
      'What am I missing in my approach?',
    ];
  }

  /**
   * Generates a report on chat effectiveness for improving Rob's responses
   */
  static async generateEffectivenessReport(
    timeframeHours: number = 24 * 7
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dataPoints: ChatAnalytics;
  }> {
    const analytics = await this.getChatAnalytics(timeframeHours);
    const improvements = await this.getInsightImprovements(timeframeHours);

    const summary = `Analysis of ${analytics.totalConversations} conversations with ${analytics.totalMessages} total messages over the past ${Math.round(timeframeHours / 24)} days.`;

    const keyFindings = [
      `Average conversation length: ${analytics.avgMessagesPerConversation} messages`,
      `Most common topics: ${analytics.commonTopics.slice(0, 3).join(', ')}`,
      `Sentiment distribution: ${Math.round((analytics.sentimentDistribution.positive / (analytics.sentimentDistribution.positive + analytics.sentimentDistribution.neutral + analytics.sentimentDistribution.negative)) * 100)}% positive`,
    ];

    const recommendations = [
      'Focus on providing more actionable, specific guidance',
      'Develop template responses for common question patterns',
      'Include more follow-up questions to encourage deeper exploration',
      ...improvements
        .slice(0, 2)
        .map(
          (imp) => `Improve guidance for ${imp.topic}: ${imp.suggestions[0]}`
        ),
    ];

    return {
      summary,
      keyFindings,
      recommendations,
      dataPoints: analytics,
    };
  }

  /**
   * Monitors sentiment trends to identify when insights might be missing the mark
   */
  static async monitorSentimentTrends(
    timeframeHours: number = 24 * 7
  ): Promise<{
    overallTrend: 'improving' | 'declining' | 'stable';
    alertLevel: 'low' | 'medium' | 'high';
    insights: string[];
  }> {
    const analytics = await this.getChatAnalytics(timeframeHours);
    const { positive, neutral, negative } = analytics.sentimentDistribution;
    const total = positive + neutral + negative;

    if (total === 0) {
      return {
        overallTrend: 'stable',
        alertLevel: 'low',
        insights: ['No sentiment data available for analysis'],
      };
    }

    const positiveRatio = positive / total;
    const negativeRatio = negative / total;

    let overallTrend: 'improving' | 'declining' | 'stable';
    let alertLevel: 'low' | 'medium' | 'high';
    const insights: string[] = [];

    // Determine trend and alert level
    if (positiveRatio > 0.7) {
      overallTrend = 'improving';
      alertLevel = 'low';
      insights.push('Users are responding very positively to insights');
    } else if (positiveRatio > 0.5) {
      overallTrend = 'stable';
      alertLevel = 'low';
      insights.push('User sentiment is generally positive');
    } else if (negativeRatio > 0.4) {
      overallTrend = 'declining';
      alertLevel = 'high';
      insights.push(
        'High negative sentiment detected - insights may need improvement'
      );
    } else {
      overallTrend = 'stable';
      alertLevel = 'medium';
      insights.push('Mixed sentiment - monitor for patterns');
    }

    // Add specific insights based on data
    if (analytics.avgMessagesPerConversation < 2) {
      insights.push(
        'Short conversations may indicate users are not getting what they need'
      );
      alertLevel = 'medium';
    }

    if (analytics.avgMessagesPerConversation > 10) {
      insights.push(
        'Long conversations may indicate initial insights are not comprehensive enough'
      );
      alertLevel = 'medium';
    }

    return {
      overallTrend,
      alertLevel,
      insights,
    };
  }
}
