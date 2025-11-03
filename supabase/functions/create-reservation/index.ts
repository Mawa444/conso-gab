import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRequest, createReservationSchema, ValidationError } from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const validated = validateRequest(createReservationSchema, body);

    const startDate = new Date(validated.start_datetime);
    const endDate = new Date(startDate.getTime() + validated.duration_minutes * 60000);

    const reservationNumber = `R-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data, error } = await supabaseClient
      .from('reservations')
      .insert({
        business_id: validated.business_id,
        customer_id: validated.customer_id,
        catalog_id: validated.catalog_id,
        service_name: validated.service_name,
        reservation_number: reservationNumber,
        start_datetime: validated.start_datetime,
        end_datetime: endDate.toISOString(),
        duration_minutes: validated.duration_minutes,
        guest_count: validated.guest_count,
        special_requests: validated.special_requests,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, reservation: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: error.errors.errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
