import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const finalizeUploadSchema = z.object({
  storage_path: z.string().min(1, 'Storage path required').max(500, 'Path too long'),
  entity_type: z.enum(['catalog', 'business', 'product', 'user']),
  entity_id: z.string().uuid('Invalid entity ID'),
  is_cover: z.boolean().optional()
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
    const validationResult = finalizeUploadSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { storage_path, entity_type, entity_id, is_cover } = validationResult.data;
    console.log('Finalizing upload:', { storage_path, entity_type, entity_id, user_id: user.id });

    // Get file from staging
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('catalog-images')
      .download(storage_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error('Failed to download file from staging');
    }

    // Process image (resize, compress, convert to WebP)
    const arrayBuffer = await fileData.arrayBuffer();
    const processedImageBuffer = await processImage(arrayBuffer);

    // Generate final storage path
    const finalPath = `processed/${entity_type}/${entity_id}/${Date.now()}.webp`;

    // Upload processed image to final location
    const { error: uploadError } = await supabaseClient.storage
      .from('catalog-images')
      .upload(finalPath, processedImageBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading processed image:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('catalog-images')
      .getPublicUrl(finalPath);

    // Create media record
    const { data: mediaRecord, error: mediaError } = await supabaseClient
      .from('media')
      .insert({
        owner_id: user.id,
        entity_type,
        entity_id,
        storage_path: finalPath,
        url: publicUrl,
        format: 'webp',
        is_cover: is_cover || false,
        size_bytes: processedImageBuffer.byteLength
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Error creating media record:', mediaError);
      throw mediaError;
    }

    // Clean up staging file
    await supabaseClient.storage
      .from('catalog-images')
      .remove([storage_path]);

    console.log('Upload finalized successfully:', mediaRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        media: mediaRecord,
        url: publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in finalize-upload:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Image processing function (simplified)
async function processImage(buffer: ArrayBuffer): Promise<Uint8Array> {
  // In a real implementation, you would use a library like Sharp or ImageMagick
  // For now, we'll just return the original buffer as Uint8Array
  // This would normally:
  // 1. Resize to max 1300x731 maintaining aspect ratio
  // 2. Convert to WebP format
  // 3. Compress to target size <2MB
  // 4. Apply any needed cropping (16:9 center crop)
  
  return new Uint8Array(buffer);
}