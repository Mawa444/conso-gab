import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const validatePaymentSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  receipt_qr: z.string().min(1, 'Receipt QR required').max(500, 'Receipt QR too long'),
  pin_hash: z.string().optional()
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
    const validationResult = validatePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, receipt_qr, pin_hash } = validationResult.data;
    console.log('Validating payment:', { order_id, user_id: user.id });

    // Get order and verify seller
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        seller:business_profiles!seller_id(user_id)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Verify user is the seller
    if (order.seller.user_id !== user.id) {
      throw new Error('Not authorized to validate this payment');
    }

    // Verify PIN if provided (simplified - in production, hash and compare)
    if (pin_hash) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('pin_hash, pin_enabled')
        .eq('user_id', user.id)
        .single();

      if (profile?.pin_enabled && profile.pin_hash !== pin_hash) {
        throw new Error('Invalid PIN');
      }
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'locked') {
      throw new Error('Payment is not in locked state');
    }

    // Verify QR code matches
    if (payment.receipt_qr !== receipt_qr) {
      throw new Error('Invalid receipt QR');
    }

    // Release payment
    const { error: releaseError } = await supabaseClient
      .from('payments')
      .update({ status: 'released' })
      .eq('id', payment.id);

    if (releaseError) {
      console.error('Error releasing payment:', releaseError);
      throw releaseError;
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order_id);

    console.log('Payment validated and released:', payment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment released successfully',
        order_status: 'paid',
        payment_status: 'released'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});