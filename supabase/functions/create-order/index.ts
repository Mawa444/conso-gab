import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  price_cents: z.number().int().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be positive').max(1000, 'Quantity too large')
});

const createOrderSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID').optional(),
  seller_id: z.string().uuid('Invalid seller ID'),
  items: z.array(orderItemSchema).min(1, 'At least one item required').max(100, 'Too many items'),
  currency: z.enum(['XAF', 'EUR', 'USD']).default('XAF')
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
    const validationResult = createOrderSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { conversation_id, seller_id, items, currency } = validationResult.data;
    console.log('Creating order:', { conversation_id, seller_id, items, user_id: user.id });

    // Calculate total with validation
    const total_cents = items.reduce((sum, item) => 
      sum + (item.price_cents * item.quantity), 0
    );

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id,
        items,
        total_cents,
        currency,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Generate escrow_id (simple implementation)
    const escrow_id = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Update order with escrow_id
    await supabaseClient
      .from('orders')
      .update({ escrow_id })
      .eq('id', order.id);

    // Create payment record (locked)
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id: order.id,
        amount_cents: total_cents,
        method: 'escrow',
        status: 'locked',
        receipt_qr: `QR-${order.id}` // Simple QR generation
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw paymentError;
    }

    // Create order message in conversation
    if (conversation_id) {
      await supabaseClient
        .from('messages')
        .insert({
          conversation_id,
          sender_id: user.id,
          message_type: 'action',
          content: `Nouvelle commande: ${total_cents / 100} ${currency}`,
          content_json: {
            action_type: 'order',
            order_id: order.id,
            total_cents,
            currency,
            items
          }
        });

      // Create message action
      await supabaseClient
        .from('message_actions')
        .insert({
          message_id: null, // Will be populated after message creation
          action_type: 'order',
          payload: {
            order_id: order.id,
            total_cents,
            currency,
            items,
            escrow_id
          },
          status: 'pending'
        });
    }

    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: { ...order, escrow_id },
        payment,
        receipt_qr_url: `data:text/plain;base64,${btoa(payment.receipt_qr)}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});