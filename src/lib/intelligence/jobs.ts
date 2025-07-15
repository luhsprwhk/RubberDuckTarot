import { runNightlyAnalysis, getAnalysisStatus } from './scheduler';

/**
 * Job management for intelligence analysis
 * This would integrate with your existing job queue system
 */
export class IntelligenceJobs {
  /**
   * Register the nightly analysis job
   * Call this from your app initialization
   */
  static registerJobs() {
    // Example with node-cron (you'd use your actual job system)
    // const cron = require('node-cron');
    //
    // // Run every night at 2 AM
    // cron.schedule('0 2 * * *', async () => {
    //   await runNightlyAnalysis();
    // });

    console.log('Intelligence analysis jobs registered');
  }

  /**
   * Manual job execution for testing/admin
   */
  static async runJobNow(jobType: 'nightly' | 'status'): Promise<unknown> {
    switch (jobType) {
      case 'nightly':
        return await runNightlyAnalysis();
      case 'status':
        return await getAnalysisStatus();
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }
  }

  /**
   * Get job status for admin dashboard
   */
  static async getJobStatus(): Promise<{
    isRunning: boolean;
    lastRun: Date | null;
    nextRun: Date | null;
    stats: Awaited<ReturnType<typeof getAnalysisStatus>>;
  }> {
    const stats = await getAnalysisStatus();

    return {
      isRunning: false, // You'd track this in your job system
      lastRun: stats.lastRunTime,
      nextRun: getNextRunTime(), // Calculate next 2 AM
      stats,
    };
  }
}

function getNextRunTime(): Date {
  const now = new Date();
  const nextRun = new Date(now);

  // Set to 2 AM tomorrow
  nextRun.setHours(2, 0, 0, 0);
  nextRun.setDate(now.getDate() + 1);

  return nextRun;
}

// Export for app initialization
export const registerIntelligenceJobs = IntelligenceJobs.registerJobs;
