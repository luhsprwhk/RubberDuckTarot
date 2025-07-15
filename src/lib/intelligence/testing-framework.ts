import { IntelligenceEngine } from './intelligence-engine';
import { DEFAULT_INTELLIGENCE_CONFIG } from './config';
import type { EpistemologicalBlocker, BlockerType } from './types';
import { supabase } from '../supabase/supabase';

/**
 * Testing framework for validating blocker detection accuracy
 */
export class IntelligenceTestingFramework {
  private engine: IntelligenceEngine;

  constructor() {
    // Use more sensitive settings for testing
    const testConfig = {
      ...DEFAULT_INTELLIGENCE_CONFIG,
      confidence_threshold: 0.4, // Lower threshold to catch more patterns
      analysis_window_days: 90, // Longer window for more data
      enabled_blockers: [
        // Test with core patterns first
        'confirmation_bias',
        'avoidant_attachment_block',
        'anxious_attachment_block',
        'all_or_nothing_thinking',
        'mental_filtering',
      ] as BlockerType[],
    };

    this.engine = new IntelligenceEngine(testConfig);
  }

  /**
   * Analyze a sample of users and generate validation data
   */
  async runValidationStudy(
    userIds: string[],
    expertLabels?: ValidationLabels[]
  ) {
    const results: ValidationResult[] = [];

    for (const userId of userIds) {
      try {
        console.log(`Analyzing user ${userId}...`);

        // Run the intelligence engine
        const analysis = await this.engine.analyzeUser(userId);

        // Get manual labels if provided
        const expertLabel = expertLabels?.find(
          (label) => label.userId === userId
        );

        const result: ValidationResult = {
          userId,
          detectedBlockers: analysis.blockers_detected,
          expertLabels: expertLabel?.blockers || [],
          confidence: this.calculateOverallConfidence(
            analysis.blockers_detected
          ),
          analysisMetadata: analysis.metadata,
        };

        results.push(result);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to analyze user ${userId}:`, error);
        results.push({
          userId,
          detectedBlockers: [],
          expertLabels: [],
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          analysisMetadata: {
            insights_analyzed: 0,
            conversations_analyzed: 0,
            processing_time_ms: 0,
            model_version: 'error',
          },
        });
      }
    }

    return this.generateValidationReport(results);
  }

  /**
   * Generate synthetic test cases for specific blocker patterns
   */
  generateSyntheticTestCases(): SyntheticTestCase[] {
    return [
      {
        name: 'Confirmation Bias Example',
        mockInsights: [
          {
            user_context:
              "I know I'm not good with relationships, so this reading about communication probably won't help me.",
            reading: { summary: 'Focus on listening skills and empathy' },
            resonated: false,
            took_action: false,
            block_type_id: 'relationship',
          },
          {
            user_context:
              "This reading confirms what I already know - I'm better off alone.",
            reading: { summary: 'Independence and self-reliance themes' },
            resonated: true,
            took_action: true,
            block_type_id: 'relationship',
          },
        ],
        expectedBlockers: ['confirmation_bias'],
        description:
          'User only resonates with readings that confirm existing negative self-beliefs',
      },

      {
        name: 'Anxious Attachment Example',
        mockInsights: [
          {
            user_context:
              "Are you sure this is the right interpretation? I'm worried I'm doing this wrong.",
            reading: {
              summary: 'Trust your intuition and take small steps forward',
            },
            resonated: false,
            took_action: false,
            block_type_id: 'creative',
          },
        ],
        mockConversations: [
          {
            messages: [
              {
                role: 'user',
                content: 'Is this reading accurate? I need to know for sure.',
              },
              {
                role: 'assistant',
                content: 'The reading offers guidance to consider...',
              },
              {
                role: 'user',
                content:
                  "But what if I'm interpreting it wrong? Can you confirm this is right?",
              },
            ],
          },
        ],
        expectedBlockers: ['anxious_attachment_block'],
        description:
          'User seeks constant validation and doubts their own interpretation',
      },

      {
        name: 'All-or-Nothing Thinking Example',
        mockInsights: [
          {
            user_context:
              "If I can't master this creative project perfectly, there's no point in continuing.",
            reading: {
              summary: 'Embrace the learning process and incremental progress',
            },
            resonated: false,
            took_action: false,
            block_type_id: 'creative',
          },
        ],
        expectedBlockers: ['all_or_nothing_thinking'],
        description:
          'User rejects advice about gradual progress, wants perfection or nothing',
      },
    ];
  }

  /**
   * A/B test different detection algorithms
   */
  async runABTest(userIds: string[]) {
    const configA = {
      ...DEFAULT_INTELLIGENCE_CONFIG,
      confidence_threshold: 0.5,
    };
    const configB = {
      ...DEFAULT_INTELLIGENCE_CONFIG,
      confidence_threshold: 0.7,
    };

    const engineA = new IntelligenceEngine(configA);
    const engineB = new IntelligenceEngine(configB);

    const results = [];

    for (const userId of userIds) {
      const [resultA, resultB] = await Promise.all([
        engineA.analyzeUser(userId).catch(() => null),
        engineB.analyzeUser(userId).catch(() => null),
      ]);

      results.push({
        userId,
        configA_blockers: resultA?.blockers_detected.length || 0,
        configB_blockers: resultB?.blockers_detected.length || 0,
        configA_confidence: resultA
          ? this.calculateOverallConfidence(resultA.blockers_detected)
          : 0,
        configB_confidence: resultB
          ? this.calculateOverallConfidence(resultB.blockers_detected)
          : 0,
      });
    }

    return results;
  }

  /**
   * Get users suitable for testing (active users with sufficient data)
   */
  async getSuitableTestUsers(limit: number = 20): Promise<string[]> {
    try {
      // Get users with multiple insights and recent activity
      const { data: users, error } = await supabase
        .from('insights')
        .select('user_id, created_at')
        .not('user_id', 'is', null)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        ) // Last 90 days
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count insights per user and filter for users with sufficient data
      const userCounts = users.reduce(
        (acc, insight) => {
          acc[insight.user_id] = (acc[insight.user_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Return users with at least 3 insights
      return Object.entries(userCounts)
        .filter(([, count]) => count >= 3)
        .slice(0, limit)
        .map(([userId]) => userId);
    } catch (error) {
      console.error('Failed to get test users:', error);
      return [];
    }
  }

  private calculateOverallConfidence(
    blockers: EpistemologicalBlocker[]
  ): number {
    if (blockers.length === 0) return 0;
    return (
      blockers.reduce((sum, blocker) => sum + blocker.confidence, 0) /
      blockers.length
    );
  }

  private generateValidationReport(
    results: ValidationResult[]
  ): ValidationReport {
    const successfulAnalyses = results.filter((r) => !r.error);
    const totalBlockersDetected = successfulAnalyses.reduce(
      (sum, r) => sum + r.detectedBlockers.length,
      0
    );
    const avgConfidence =
      successfulAnalyses.reduce((sum, r) => sum + r.confidence, 0) /
      successfulAnalyses.length;

    // Calculate precision/recall if expert labels provided
    let precision = 0;
    let recall = 0;
    let hasExpertLabels = false;

    const labeledResults = successfulAnalyses.filter(
      (r) => r.expertLabels.length > 0
    );
    if (labeledResults.length > 0) {
      hasExpertLabels = true;

      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      labeledResults.forEach((result) => {
        const detected = new Set(result.detectedBlockers.map((b) => b.type));
        const expert = new Set(result.expertLabels);

        truePositives += [...detected].filter((b) => expert.has(b)).length;
        falsePositives += [...detected].filter((b) => !expert.has(b)).length;
        falseNegatives += [...expert].filter((b) => !detected.has(b)).length;
      });

      precision = truePositives / (truePositives + falsePositives) || 0;
      recall = truePositives / (truePositives + falseNegatives) || 0;
    }

    return {
      totalUsersAnalyzed: results.length,
      successfulAnalyses: successfulAnalyses.length,
      failedAnalyses: results.length - successfulAnalyses.length,
      totalBlockersDetected,
      averageConfidence: avgConfidence,
      precision: hasExpertLabels ? precision : undefined,
      recall: hasExpertLabels ? recall : undefined,
      f1Score:
        hasExpertLabels && precision + recall > 0
          ? (2 * (precision * recall)) / (precision + recall)
          : undefined,
      detailedResults: results,
    };
  }
}

// Type definitions for testing
interface MockInsight {
  user_context?: string;
  reading: { summary?: string };
  resonated: boolean;
  took_action: boolean;
  block_type_id: string;
}

interface MockConversation {
  messages: { role: string; content: string }[];
}

interface ValidationLabels {
  userId: string;
  blockers: BlockerType[];
  notes?: string;
}

interface ValidationResult {
  userId: string;
  detectedBlockers: EpistemologicalBlocker[];
  expertLabels: BlockerType[];
  confidence: number;
  error?: string;
  analysisMetadata: {
    insights_analyzed: number;
    conversations_analyzed: number;
    processing_time_ms: number;
    model_version: string;
  };
}

interface ValidationReport {
  totalUsersAnalyzed: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalBlockersDetected: number;
  averageConfidence: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  detailedResults: ValidationResult[];
}

interface SyntheticTestCase {
  name: string;
  mockInsights: MockInsight[];
  mockConversations?: MockConversation[];
  expectedBlockers: BlockerType[];
  description: string;
}

// Export convenience function for Rob to run quick tests
export async function runQuickValidation(userCount: number = 10) {
  const framework = new IntelligenceTestingFramework();
  const testUsers = await framework.getSuitableTestUsers(userCount);

  console.log(`Running validation on ${testUsers.length} users...`);
  return framework.runValidationStudy(testUsers);
}
