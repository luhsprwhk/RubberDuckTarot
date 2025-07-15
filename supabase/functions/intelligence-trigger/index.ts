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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse request body
    const { user_id, trigger_type, force = false } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🎯 Triggering analysis for user ${user_id} (${trigger_type})`);

    // Check if analysis should be triggered
    const shouldAnalyze =
      force || (await shouldTriggerAnalysis(supabase, user_id, trigger_type));

    if (!shouldAnalyze) {
      return new Response(
        JSON.stringify({
          message: 'Analysis not needed at this time',
          user_id,
          trigger_type,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Run the analysis
    const analysisResult = await analyzeUserIntelligence(supabase, user_id);

    console.log(`✓ Analysis completed for user ${user_id}`);

    return new Response(
      JSON.stringify({
        message: 'Analysis completed successfully',
        user_id,
        trigger_type,
        blockers_detected: analysisResult.blockers_detected?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('🚨 Analysis trigger failed:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function shouldTriggerAnalysis(
  supabase: SupabaseClient,
  userId: string,
  triggerType: string
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

    // Trigger analysis based on trigger type
    switch (triggerType) {
      case 'insight_created':
        return insights.length % 5 === 0; // Every 5 insights
      case 'conversation_completed':
        return insights.length >= 3; // After sufficient insights
      case 'user_requested':
        return true; // Always analyze when user requests
      case 'admin_requested':
        return true; // Always analyze when admin requests
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking analysis threshold:', error);
    return false;
  }
}

async function analyzeUserIntelligence(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, unknown>> {
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

  // TODO: Implement actual intelligence analysis here
  // For now, return a mock result

  const analysisResult = {
    user_id: userId,
    analysis_date: new Date(),
    analysis_summary: `Analysis completed for user with ${insights.length} recent insights`,
    blockers_detected: [], // This would be populated by your actual analysis
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

  return analysisResult;
}
