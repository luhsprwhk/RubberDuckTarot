import { IntelligenceEngine } from './intelligence-engine';
import { DEFAULT_INTELLIGENCE_CONFIG } from './config';
import { supabase } from '../supabase/supabase';
import { analyzeUserBlockers } from './index';

export class IntelligenceScheduler {
  private static engine = new IntelligenceEngine(DEFAULT_INTELLIGENCE_CONFIG);

  /**
   * Get users who need analysis based on activity thresholds
   */
  static async getUsersForAnalysis(): Promise<string[]> {
    try {
      // Get users with recent activity (last 7 days) and sufficient data
      const { data: recentInsights, error } = await supabase
        .from('insights')
        .select('user_id, created_at')
        .not('user_id', 'is', null)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count insights per user
      const userActivity = recentInsights.reduce(
        (acc, insight) => {
          acc[insight.user_id] = (acc[insight.user_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Get users who haven't been analyzed recently
      const { data: recentAnalyses, error: analysisError } = await supabase
        .from('intelligence_analysis_results')
        .select('user_id, created_at')
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (analysisError) throw analysisError;

      const recentlyAnalyzed = new Set(recentAnalyses.map((a) => a.user_id));

      // Return users with sufficient activity who haven't been analyzed recently
      return Object.entries(userActivity)
        .filter(
          ([userId, count]) => count >= 3 && !recentlyAnalyzed.has(userId)
        )
        .map(([userId]) => userId);
    } catch (error) {
      console.error('Failed to get users for analysis:', error);
      return [];
    }
  }

  /**
   * Run analysis for a batch of users with rate limiting
   */
  static async runBatchAnalysis(userIds: string[]): Promise<{
    successful: number;
    failed: string[];
  }> {
    const results = { successful: 0, failed: [] as string[] };

    console.log(`Starting batch analysis for ${userIds.length} users`);

    for (const userId of userIds) {
      try {
        console.log(`Analyzing user ${userId}...`);
        await analyzeUserBlockers(userId);
        results.successful++;
        console.log(`✓ Analysis completed for user ${userId}`);

        // Rate limiting to avoid overwhelming the AI API
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`✗ Analysis failed for user ${userId}:`, error);
        results.failed.push(userId);
      }
    }

    console.log(
      `Batch analysis complete: ${results.successful} successful, ${results.failed.length} failed`
    );
    return results;
  }

  /**
   * Scheduled job to run nightly analysis
   */
  static async runNightlyAnalysis(): Promise<void> {
    console.log('🧠 Starting nightly intelligence analysis...');

    try {
      const usersToAnalyze = await this.getUsersForAnalysis();

      if (usersToAnalyze.length === 0) {
        console.log('No users require analysis at this time');
        return;
      }

      // Process in smaller batches to avoid timeouts
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < usersToAnalyze.length; i += batchSize) {
        batches.push(usersToAnalyze.slice(i, i + batchSize));
      }

      let totalSuccessful = 0;
      let totalFailed: string[] = [];

      for (const batch of batches) {
        const result = await this.runBatchAnalysis(batch);
        totalSuccessful += result.successful;
        totalFailed = [...totalFailed, ...result.failed];

        // Pause between batches
        if (batch !== batches[batches.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }

      console.log(
        `🧠 Nightly analysis complete: ${totalSuccessful} users analyzed successfully`
      );

      if (totalFailed.length > 0) {
        console.warn(
          `⚠️  ${totalFailed.length} users failed analysis:`,
          totalFailed
        );
      }
    } catch (error) {
      console.error('🚨 Nightly analysis failed:', error);
    }
  }

  /**
   * Trigger analysis after user activity milestones
   */
  static async onUserMilestone(
    userId: string,
    milestone: 'insight_created' | 'conversation_completed'
  ): Promise<void> {
    try {
      // Check if user has reached analysis threshold
      const shouldAnalyze = await this.shouldTriggerAnalysis(userId, milestone);

      if (shouldAnalyze) {
        console.log(
          `🎯 Triggering analysis for user ${userId} after ${milestone}`
        );
        await analyzeUserBlockers(userId);
      }
    } catch (error) {
      console.error(`Failed to trigger analysis for user ${userId}:`, error);
    }
  }

  /**
   * Determine if user has reached threshold for analysis
   */
  private static async shouldTriggerAnalysis(
    userId: string,
    milestone: string
  ): Promise<boolean> {
    try {
      // Get user's recent activity
      const { data: insights, error } = await supabase
        .from('insights')
        .select('id, created_at')
        .eq('user_id', userId)
        .gte(
          'created_at',
          new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has enough recent activity
      if (insights.length < 3) return false;

      // Check if user was analyzed recently
      const { data: recentAnalysis, error: analysisError } = await supabase
        .from('intelligence_analysis_results')
        .select('created_at')
        .eq('user_id', userId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .limit(1);

      if (analysisError) throw analysisError;

      // Don't analyze if done recently
      if (recentAnalysis.length > 0) return false;

      // Trigger analysis based on milestone
      switch (milestone) {
        case 'insight_created':
          return insights.length % 5 === 0; // Every 5 insights
        case 'conversation_completed':
          return insights.length >= 3; // After sufficient insights
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking analysis threshold:', error);
      return false;
    }
  }

  /**
   * Emergency analysis for specific users (Rob's override)
   */
  static async analyzeUsersNow(userIds: string[]): Promise<void> {
    console.log(`🚨 Emergency analysis requested for ${userIds.length} users`);
    await this.runBatchAnalysis(userIds);
  }

  /**
   * Get analysis status for admin dashboard
   */
  static async getAnalysisStatus(): Promise<{
    usersAnalyzedToday: number;
    usersAnalyzedThisWeek: number;
    pendingAnalysis: number;
    lastRunTime: Date | null;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [todayCount, weekCount, pendingUsers] = await Promise.all([
        supabase
          .from('intelligence_analysis_results')
          .select('id', { count: 'exact' })
          .gte('created_at', today.toISOString()),
        supabase
          .from('intelligence_analysis_results')
          .select('id', { count: 'exact' })
          .gte('created_at', weekAgo.toISOString()),
        this.getUsersForAnalysis(),
      ]);

      const lastRun = await supabase
        .from('intelligence_analysis_results')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        usersAnalyzedToday: todayCount.count || 0,
        usersAnalyzedThisWeek: weekCount.count || 0,
        pendingAnalysis: pendingUsers.length,
        lastRunTime: lastRun.data?.[0]?.created_at
          ? new Date(lastRun.data[0].created_at)
          : null,
      };
    } catch (error) {
      console.error('Error getting analysis status:', error);
      return {
        usersAnalyzedToday: 0,
        usersAnalyzedThisWeek: 0,
        pendingAnalysis: 0,
        lastRunTime: null,
      };
    }
  }
}

// Export convenience functions
export const runNightlyAnalysis = IntelligenceScheduler.runNightlyAnalysis;
export const analyzeUsersNow = IntelligenceScheduler.analyzeUsersNow;
export const getAnalysisStatus = IntelligenceScheduler.getAnalysisStatus;
