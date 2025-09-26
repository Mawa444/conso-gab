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

    const { file_name, file_type, entity_type, entity_id } = await req.json();

    console.log('Initiating upload:', { file_name, file_type, entity_type, entity_id, user_id: user.id });

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const file_extension = file_name.split('.').pop();
    const storage_path = `${entity_type}/${entity_id}/${timestamp}_${randomId}.${file_extension}`;

    // Generate signed URL for upload (staging bucket)
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('catalog-images') // Using existing bucket as staging
      .createSignedUploadUrl(storage_path);

    if (uploadError) {
      console.error('Error creating signed URL:', uploadError);
      throw uploadError;
    }

    // Store metadata for processing
    const { data: media, error: mediaError } = await supabaseClient
      .from('media')
      .insert({
        owner_id: user.id,
        entity_type,
        entity_id,
        storage_path,
        url: uploadData.signedUrl, // Temporary until processed
        format: file_type,
        is_cover: false
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Error creating media record:', mediaError);
      throw mediaError;
    }

    console.log('Upload initiated successfully:', media.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        upload_url: uploadData.signedUrl,
        media_id: media.id,
        storage_path 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initiate-upload:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});