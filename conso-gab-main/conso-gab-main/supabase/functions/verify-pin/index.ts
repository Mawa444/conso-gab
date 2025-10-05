import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits')
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

    const requestBody = await req.json();

    // Validate input
    const validationResult = verifyPinSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid PIN format',
          details: validationResult.error.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pin } = validationResult.data;

    // Get user profile with PIN hash
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('pin_hash, pin_enabled, pin_blocked_until')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Check if user is blocked
    if (profile.pin_blocked_until) {
      const blockedUntil = new Date(profile.pin_blocked_until);
      if (blockedUntil > new Date()) {
        return new Response(
          JSON.stringify({ valid: false, error: 'PIN access blocked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!profile.pin_enabled || !profile.pin_hash) {
      return new Response(
        JSON.stringify({ valid: false, error: 'PIN not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the provided PIN
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + user.id); // Salt with user ID
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const providedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const isValid = providedHash === profile.pin_hash;

    // Log security event
    await supabaseClient
      .from('activity_log')
      .insert({
        user_id: user.id,
        action_type: 'pin_verification',
        action_description: isValid ? 'PIN verified successfully' : 'PIN verification failed',
        metadata: {
          success: isValid,
          timestamp: new Date().toISOString(),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    // Clear block if verification successful
    if (isValid && profile.pin_blocked_until) {
      await supabaseClient
        .from('profiles')
        .update({ pin_blocked_until: null })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-pin:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});