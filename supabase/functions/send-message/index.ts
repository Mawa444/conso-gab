import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { conversation_id, message_type, content, content_json, attachment_url, action_payload } = await req.json();

    console.log('Sending message:', { conversation_id, message_type, user_id: user.id });

    // Verify user is participant
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('id')
      .eq('conversation_id', conversation_id)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      throw new Error('Not authorized to send message to this conversation');
    }

    // Insert message
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        message_type: message_type || 'text',
        content,
        content_json,
        attachment_url,
        status: 'sent'
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      throw messageError;
    }

    // If action payload provided, create message action
    if (action_payload && message_type === 'action') {
      const { error: actionError } = await supabaseClient
        .from('message_actions')
        .insert({
          message_id: message.id,
          action_type: action_payload.action_type,
          payload: action_payload,
          status: 'pending'
        });

      if (actionError) {
        console.error('Error creating message action:', actionError);
      }
    }

    // Update conversation last_activity
    await supabaseClient
      .from('conversations')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', conversation_id);

    console.log('Message sent successfully:', message.id);

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-message:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});