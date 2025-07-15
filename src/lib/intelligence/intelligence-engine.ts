import type {
  EpistemologicalBlocker,
  BlockerType,
  AnalysisResult,
  IntelligenceEngineConfig,
} from './types';
import { getInsightsByUser } from '../insights/insight-queries';
import { generateBlockerAnalysis } from '../../ai/generate-blocker-analysis';

interface InsightData {
  user_context?: string;
  reading: { summary?: string } | string;
  resonated: boolean;
  took_action: boolean;
  block_type_id: string;
  cards_drawn?: { id: number; reversed: boolean }[];
  created_at: string;
}

interface ConversationData {
  messages?: { role: string; content: string }[];
  last_message_at?: string;
}
import { supabase } from '../supabase/supabase';
import { encryptObject, decryptObject } from '../encryption';

export class IntelligenceEngine {
  private config: IntelligenceEngineConfig;

  constructor(config: IntelligenceEngineConfig) {
    this.config = config;
  }

  /**
   * Main analysis function - detects epistemological blockers for a user
   */
  async analyzeUser(userId: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // Gather data for analysis
      const insights = await this.gatherInsightData(userId);
      const conversations = await this.gatherConversationData();

      // Run AI-powered analysis
      const blockers = await this.detectBlockers(
        userId,
        insights,
        conversations
      );

      // Generate overall recommendations
      const recommendations = await this.generateRecommendations(blockers);

      const result: AnalysisResult = {
        user_id: userId,
        analysis_date: new Date(),
        blockers_detected: blockers,
        analysis_summary: await this.generateAnalysisSummary(blockers),
        recommendations,
        metadata: {
          insights_analyzed: insights.length,
          conversations_analyzed: conversations.length,
          processing_time_ms: Date.now() - startTime,
          model_version: 'v1.0.0',
        },
      };

      // Store results for Rob's review
      await this.storeAnalysisResult(result);

      return result;
    } catch (error) {
      console.error('Intelligence engine analysis failed:', error);
      throw new Error('Failed to analyze user for epistemological blockers');
    }
  }

  /**
   * Gather insight data within analysis window
   */
  private async gatherInsightData(userId: string) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.analysis_window_days);

    const allInsights = await getInsightsByUser(userId);

    return allInsights.filter(
      (insight) => new Date(insight.created_at) >= cutoffDate
    );
  }

  /**
   * Gather conversation data within analysis window
   */
  private async gatherConversationData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.analysis_window_days);

    // This would need to be implemented in ChatPersistenceService
    // For now, return empty array
    return [];
  }

  /**
   * AI-powered blocker detection using Claude
   */
  private async detectBlockers(
    userId: string,
    insights: InsightData[],
    conversations: ConversationData[]
  ): Promise<EpistemologicalBlocker[]> {
    const detectedBlockers: EpistemologicalBlocker[] = [];

    // Analyze each type of blocker we're configured to detect
    for (const blockerType of this.config.enabled_blockers) {
      const blocker = await this.analyzeForBlockerType(
        userId,
        blockerType,
        insights,
        conversations
      );

      if (blocker && blocker.confidence >= this.config.confidence_threshold) {
        detectedBlockers.push(blocker);
      }
    }

    return detectedBlockers;
  }

  /**
   * Analyze for a specific type of epistemological blocker
   */
  private async analyzeForBlockerType(
    userId: string,
    blockerType: BlockerType,
    insights: InsightData[],
    conversations: ConversationData[]
  ): Promise<EpistemologicalBlocker | null> {
    try {
      const analysis = await generateBlockerAnalysis({
        blockerType,
        insights,
        conversations,
        config: this.config,
      });

      if (!analysis.detected) {
        return null;
      }

      const blocker: EpistemologicalBlocker = {
        id: `${userId}_${blockerType}_${Date.now()}`,
        type: blockerType,
        title: analysis.title,
        description: analysis.description,
        severity: analysis.severity,
        confidence: analysis.confidence,
        patterns: analysis.patterns,
        first_detected: new Date(),
        last_detected: new Date(),
        occurrences: analysis.occurrences,
        user_id: userId,
        block_type_ids: analysis.block_type_ids,
        insight_ids: analysis.insight_ids,
        conversation_ids: analysis.conversation_ids,
        recommendations: analysis.recommendations,
        status: 'active',
      };

      return blocker;
    } catch (error) {
      console.error(
        `Failed to analyze for blocker type ${blockerType}:`,
        error
      );
      return null;
    }
  }

  /**
   * Generate overall recommendations based on detected blockers
   */
  private async generateRecommendations(
    blockers: EpistemologicalBlocker[]
  ): Promise<string[]> {
    if (blockers.length === 0) {
      return [
        'No significant epistemological obstacles detected. Continue current approach.',
      ];
    }

    const recommendations: string[] = [];

    // Priority-based recommendations
    const criticalBlockers = blockers.filter((b) => b.severity === 'critical');
    const highBlockers = blockers.filter((b) => b.severity === 'high');

    if (criticalBlockers.length > 0) {
      recommendations.push(
        'Address critical thinking patterns immediately - they may be severely limiting progress'
      );
    }

    if (highBlockers.length > 0) {
      recommendations.push(
        'Focus on high-severity blockers to unlock significant progress'
      );
    }

    // Add specific recommendations from individual blockers
    blockers.forEach((blocker) => {
      recommendations.push(...blocker.recommendations);
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate analysis summary for Rob
   */
  private async generateAnalysisSummary(
    blockers: EpistemologicalBlocker[]
  ): Promise<string> {
    if (blockers.length === 0) {
      return 'No significant epistemological obstacles detected. User appears to have healthy cognitive flexibility.';
    }

    const blockerCounts = blockers.reduce(
      (acc, blocker) => {
        acc[blocker.severity] = (acc[blocker.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const summary = [
      `Detected ${blockers.length} epistemological blocker(s):`,
      blockerCounts.critical && `${blockerCounts.critical} critical`,
      blockerCounts.high && `${blockerCounts.high} high severity`,
      blockerCounts.medium && `${blockerCounts.medium} medium severity`,
      blockerCounts.low && `${blockerCounts.low} low severity`,
    ]
      .filter(Boolean)
      .join(', ');

    const dominantTypes = blockers.reduce(
      (acc, blocker) => {
        acc[blocker.type] = (acc[blocker.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topType = Object.entries(dominantTypes).sort(
      ([, a], [, b]) => b - a
    )[0];

    return `${summary}. Primary pattern: ${topType?.[0] || 'mixed'}.`;
  }

  /**
   * Store analysis results for Rob's dashboard
   */
  private async storeAnalysisResult(result: AnalysisResult): Promise<void> {
    try {
      // Encrypt sensitive data before storing
      const encryptedResult = await encryptObject(result, [
        'blockers_detected',
        'analysis_summary',
        'recommendations',
      ]);

      const { error } = await supabase
        .from('intelligence_analysis_results')
        .insert({
          user_id: result.user_id,
          analysis_data: encryptedResult,
          created_at: result.analysis_date.toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store analysis result:', error);
      // Don't throw - analysis can continue without storage
    }
  }

  /**
   * Get historical analysis results for a user
   */
  async getAnalysisHistory(
    userId: string,
    limit: number = 10
  ): Promise<AnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('intelligence_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Decrypt and return results
      const results: AnalysisResult[] = [];
      for (const row of data) {
        try {
          const decrypted = await decryptObject(row.analysis_data, [
            'blockers_detected',
            'analysis_summary',
            'recommendations',
          ]);
          results.push(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt analysis result:', decryptError);
          continue;
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }

  /**
   * Update blocker status (for Rob to mark as acknowledged/resolved)
   */
  async updateBlockerStatus(
    blockerId: string,
    status: EpistemologicalBlocker['status'],
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('epistemological_blockers')
        .update({
          status,
          updated_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq('id', blockerId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update blocker status:', error);
      throw new Error('Failed to update blocker status');
    }
  }
}
