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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // TODO: Add admin authentication check here
    // const { data: user, error: authError } = await supabase.auth.getUser()

    switch (action) {
      case 'status':
        return await getAnalysisStatus(supabase);

      case 'analyze':
        return await runAdminAnalysis(supabase, req);

      case 'history':
        return await getAnalysisHistory(supabase, req);

      default:
        return new Response(
          JSON.stringify({
            error: 'Invalid action. Use: status, analyze, or history',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }
  } catch (error) {
    console.error('🚨 Admin intelligence function error:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function getAnalysisStatus(supabase: SupabaseClient) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [todayCount, weekCount, lastRun] = await Promise.all([
    supabase
      .from('intelligence_analysis_results')
      .select('id', { count: 'exact' })
      .gte('created_at', today.toISOString()),
    supabase
      .from('intelligence_analysis_results')
      .select('id', { count: 'exact' })
      .gte('created_at', weekAgo.toISOString()),
    supabase
      .from('intelligence_analysis_results')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  // Get pending users
  const pendingUsers = await getUsersForAnalysis(supabase);

  const status = {
    usersAnalyzedToday: todayCount.count || 0,
    usersAnalyzedThisWeek: weekCount.count || 0,
    pendingAnalysis: pendingUsers.length,
    lastRunTime: lastRun.data?.[0]?.created_at || null,
    nextScheduledRun: getNextRunTime(),
  };

  return new Response(JSON.stringify(status), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function runAdminAnalysis(supabase: SupabaseClient, req: Request) {
  const { user_ids, all_pending = false } = await req.json();

  let usersToAnalyze: string[] = [];

  if (all_pending) {
    usersToAnalyze = await getUsersForAnalysis(supabase);
  } else if (user_ids && Array.isArray(user_ids)) {
    usersToAnalyze = user_ids;
  } else {
    return new Response(
      JSON.stringify({
        error: 'Must provide user_ids array or set all_pending=true',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  if (usersToAnalyze.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No users to analyze', count: 0 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  console.log(`🚨 Admin requested analysis for ${usersToAnalyze.length} users`);

  // Process users with rate limiting
  const results = { successful: 0, failed: [] as string[] };

  for (const userId of usersToAnalyze) {
    try {
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

  return new Response(
    JSON.stringify({
      message: 'Admin analysis completed',
      requested: usersToAnalyze.length,
      successful: results.successful,
      failed: results.failed.length,
      failed_users: results.failed,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function getAnalysisHistory(supabase: SupabaseClient, req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = supabase
    .from('intelligence_analysis_results')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return new Response(
    JSON.stringify({
      history: data.map((row: Record<string, unknown>) => ({
        user_id: row.user_id,
        created_at: row.created_at,
        analysis_summary:
          JSON.parse(row.analysis_data).analysis_summary || 'No summary',
        blockers_count:
          JSON.parse(row.analysis_data).blockers_detected?.length || 0,
      })),
      pagination: {
        offset,
        limit,
        count: data.length,
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function getUsersForAnalysis(
  supabase: SupabaseClient
): Promise<string[]> {
  // Get users with recent activity but no recent analysis
  const { data: recentInsights, error } = await supabase
    .from('insights')
    .select('user_id, created_at')
    .not('user_id', 'is', null)
    .gte(
      'created_at',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) throw error;

  const userActivity = recentInsights.reduce(
    (acc: Record<string, number>, insight: Record<string, unknown>) => {
      acc[insight.user_id] = (acc[insight.user_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const { data: recentAnalyses, error: analysisError } = await supabase
    .from('intelligence_analysis_results')
    .select('user_id')
    .gte(
      'created_at',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (analysisError) throw analysisError;

  const recentlyAnalyzed = new Set(
    recentAnalyses.map((a: Record<string, unknown>) => a.user_id)
  );

  return Object.entries(userActivity)
    .filter(([userId, count]) => count >= 3 && !recentlyAnalyzed.has(userId))
    .map(([userId]) => userId);
}

async function analyzeUserIntelligence(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, unknown>> {
  // Mock implementation - replace with actual intelligence analysis
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

  const analysisResult = {
    user_id: userId,
    analysis_date: new Date(),
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

  const { error: insertError } = await supabase
    .from('intelligence_analysis_results')
    .insert({
      user_id: userId,
      analysis_data: JSON.stringify(analysisResult),
      created_at: new Date().toISOString(),
    });

  if (insertError) throw insertError;

  return analysisResult;
}

function getNextRunTime(): string {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(2, 0, 0, 0);
  nextRun.setDate(now.getDate() + 1);
  return nextRun.toISOString();
}
