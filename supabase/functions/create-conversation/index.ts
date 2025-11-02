import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createConversationSchema, validateRequest } from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Validate request body with Zod
    const validatedData = await validateRequest(req, createConversationSchema);
    const { origin_type, origin_id, participants, title } = validatedData;

    console.log('Creating conversation:', { origin_type, origin_id, title, user_id: user.id });

    // Create conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .insert({
        origin_type,
        origin_id,
        title,
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw convError;
    }

    console.log('Conversation created:', conversation);

    // Add participants
    const participantInserts = participants.map((p: any) => ({
      conversation_id: conversation.id,
      user_id: p.user_id,
      role: p.role || 'consumer'
    }));

    const { error: participantError } = await supabaseClient
      .from('participants')
      .insert(participantInserts);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      throw participantError;
    }

    // Create system message
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        message_type: 'system',
        content: 'Conversation créée'
      });

    if (messageError) {
      console.error('Error creating system message:', messageError);
    }

    console.log('Conversation setup complete');

    return new Response(
      JSON.stringify({ success: true, conversation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-conversation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});