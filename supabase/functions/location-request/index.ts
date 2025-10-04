import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const locationRequestSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID').optional(),
  target_id: z.string().uuid('Invalid target ID'),
  share_mode: z.enum(['one_time', 'continuous', 'time_limited']).default('one_time'),
  purpose: z.string().max(500, 'Purpose too long').default('general')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();

    // Validate input
    const validationResult = locationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { conversation_id, target_id, share_mode, purpose } = validationResult.data;
    console.log('Creating location request:', { conversation_id, target_id, share_mode, user_id: user.id });

    // Create location request
    const { data: locationRequest, error: requestError } = await supabaseClient
      .from('location_requests')
      .insert({
        conversation_id,
        requester_id: user.id,
        target_id,
        share_mode,
        purpose,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating location request:', requestError);
      throw requestError;
    }

    // Create message in conversation
    if (conversation_id) {
      await supabaseClient
        .from('messages')
        .insert({
          conversation_id,
          sender_id: user.id,
          message_type: 'location',
          content: `Demande de partage de position (${share_mode})`,
          content_json: {
            action_type: 'location_request',
            request_id: locationRequest.id,
            share_mode,
            purpose,
            expires_at: locationRequest.expires_at
          }
        });

      // Create message action
      await supabaseClient
        .from('message_actions')
        .insert({
          message_id: null,
          action_type: 'location_request',
          payload: {
            request_id: locationRequest.id,
            share_mode,
            purpose,
            expires_at: locationRequest.expires_at
          },
          status: 'pending'
        });
    }

    console.log('Location request created successfully:', locationRequest.id);

    return new Response(
      JSON.stringify({ success: true, location_request: locationRequest }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in location-request:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});