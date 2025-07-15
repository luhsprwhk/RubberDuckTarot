import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  createClient,
  SupabaseClient,
} from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧠 Starting nightly intelligence analysis...');

    // Get users who need analysis
    const usersToAnalyze = await getUsersForAnalysis(supabase);

    if (usersToAnalyze.length === 0) {
      console.log('No users require analysis at this time');
      return new Response(
        JSON.stringify({ message: 'No users to analyze', count: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${usersToAnalyze.length} users to analyze`);

    // Process users in batches
    const results = await processBatchAnalysis(supabase, usersToAnalyze);

    console.log(
      `🧠 Analysis complete: ${results.successful} successful, ${results.failed.length} failed`
    );

    return new Response(
      JSON.stringify({
        message: 'Nightly analysis completed',
        successful: results.successful,
        failed: results.failed.length,
        users_analyzed: usersToAnalyze.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('🚨 Nightly analysis failed:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function getUsersForAnalysis(
  supabase: SupabaseClient
): Promise<string[]> {
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
    (acc: Record<string, number>, insight: Record<string, unknown>) => {
      acc[insight.user_id] = (acc[insight.user_id] || 0) + 1;
      return acc;
    },
    {}
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

  const recentlyAnalyzed = new Set(
    recentAnalyses.map((a: Record<string, unknown>) => a.user_id)
  );

  // Return users with sufficient activity who haven't been analyzed recently
  return Object.entries(userActivity)
    .filter(([userId, count]) => count >= 3 && !recentlyAnalyzed.has(userId))
    .map(([userId]) => userId);
}

async function processBatchAnalysis(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<{
  successful: number;
  failed: string[];
}> {
  const results = { successful: 0, failed: [] as string[] };
  const batchSize = 5; // Smaller batches for edge functions

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    for (const userId of batch) {
      try {
        console.log(`Analyzing user ${userId}...`);

        // Call your intelligence analysis function
        await analyzeUserIntelligence(supabase, userId);

        results.successful++;
        console.log(`✓ Analysis completed for user ${userId}`);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`✗ Analysis failed for user ${userId}:`, error);
        results.failed.push(userId);
      }
    }

    // Pause between batches
    if (i + batchSize < userIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return results;
}

async function analyzeUserIntelligence(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // This would call your intelligence engine
  // For now, we'll create a placeholder

  // Get user's recent insights
  const { data: insights, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .gte(
      'created_at',
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  // Mock analysis result for now
  const analysisResult = {
    user_id: userId,
    analysis_summary: `Analysis completed for user with ${insights.length} recent insights`,
    blockers_detected: [],
    recommendations: ['Continue current approach'],
    metadata: {
      insights_analyzed: insights.length,
      conversations_analyzed: 0,
      processing_time_ms: 1000,
      model_version: 'v1.0.0',
    },
  };

  // Store the analysis result
  const { error: insertError } = await supabase
    .from('intelligence_analysis_results')
    .insert({
      user_id: userId,
      analysis_data: JSON.stringify(analysisResult),
      created_at: new Date().toISOString(),
    });

  if (insertError) throw insertError;
}
