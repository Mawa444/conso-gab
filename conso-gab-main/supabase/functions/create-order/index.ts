// ✅ SÉCURITÉ: VALIDATION ZOD COMPLÈTE + ERROR HANDLING

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ✅ SCHÉMA DE VALIDATION STRICT
const OrderItemSchema = z.object({
  product_id: z.string().uuid('ID produit invalide'),
  quantity: z.number().int().min(1, 'Quantité minimum: 1').max(99, 'Quantité maximum: 99'),
  unit_price: z.number().positive('Prix unitaire doit être positif'),
  notes: z.string().max(500, 'Notes trop longues').optional(),
});

const CreateOrderSchema = z.object({
  business_id: z.string().uuid('ID business invalide'),
  items: z.array(OrderItemSchema).min(1, 'Au moins un article requis').max(50, 'Trop d\'articles'),
  delivery_address: z.string().min(10, 'Adresse trop courte').max(500, 'Adresse trop longue'),
  delivery_latitude: z.number().min(-90).max(90).optional(),
  delivery_longitude: z.number().min(-180).max(180).optional(),
  scheduled_delivery: z.string().datetime().optional(),
  payment_method: z.enum(['cash', 'card', 'mobile_money'], {
    errorMap: () => ({ message: 'Méthode de paiement invalide' })
  }),
  total_amount: z.number().positive('Montant total doit être positif'),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
}).strict(); // Pas de champs supplémentaires autorisés

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://consogab.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // ✅ CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ AUTH: Vérifier utilisateur authentifié
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header manquant' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // ✅ AUTH: Vérifier session valide
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ VALIDATION: Parser et valider le body
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'JSON invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = CreateOrderSchema.safeParse(requestData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Données invalides',
          details: validationResult.error.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = validationResult.data;

    // ✅ BUSINESS: Vérifier que le business existe et est actif
    const { data: business, error: businessError } = await supabaseClient
      .from('business_profiles')
      .select('id, is_active, user_id')
      .eq('id', orderData.business_id)
      .eq('is_active', true)
      .single();

    if (businessError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business introuvable ou inactif' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ PRODUCTS: Vérifier que tous les produits existent et appartiennent au business
    const productIds = orderData.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from('catalog_products')
      .select('id, price, stock_quantity, is_available')
      .in('id', productIds)
      .eq('business_id', orderData.business_id)
      .eq('is_available', true);

    if (productsError || !products || products.length !== productIds.length) {
      return new Response(
        JSON.stringify({ error: 'Un ou plusieurs produits invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ STOCK: Vérifier le stock disponible
    const stockErrors = orderData.items
      .map(item => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) return `Produit ${item.product_id} introuvable`;
        if (product.stock_quantity < item.quantity) {
          return `Stock insuffisant pour ${product.id}: ${product.stock_quantity} disponible`;
        }
        return null;
      })
      .filter(Boolean);

    if (stockErrors.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Problème de stock',
          details: stockErrors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ TRANSACTION: Créer la commande atomiquement
    const { data: order, error: orderError } = await supabaseClient.rpc('create_order_with_items', {
      p_buyer_id: user.id,
      p_business_id: orderData.business_id,
      p_items: orderData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes
      })),
      p_delivery_address: orderData.delivery_address,
      p_delivery_latitude: orderData.delivery_latitude,
      p_delivery_longitude: orderData.delivery_longitude,
      p_scheduled_delivery: orderData.scheduled_delivery,
      p_payment_method: orderData.payment_method,
      p_total_amount: orderData.total_amount,
      p_notes: orderData.notes
    });

    if (orderError) {
      console.error('Erreur création commande:', orderError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la commande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SUCCESS: Retourner la commande créée
    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        message: 'Commande créée avec succès'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ✅ ERROR: Logging sécurisé (pas de données sensibles)
    console.error('Erreur inattendue create-order:', error.message);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});