import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRequest, createQuoteSchema, ValidationError } from '../_shared/validation.ts';

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
    const validated = validateRequest(createQuoteSchema, body);

    const subtotal = validated.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discountAmount = subtotal * (validated.discount_percentage / 100);
    const total = subtotal - discountAmount;

    const quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data, error } = await supabaseClient
      .from('quotes')
      .insert({
        business_id: validated.business_id,
        customer_id: validated.customer_id,
        conversation_id: validated.conversation_id,
        items: validated.items,
        quote_number: quoteNumber,
        subtotal,
        discount_percentage: validated.discount_percentage,
        discount_amount: discountAmount,
        total_amount: total,
        valid_until: validated.valid_until,
        notes: validated.notes,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, quote: data }), {
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
