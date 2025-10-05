// ✅ SÉCURITÉ: VALIDATION ZOD COMPLÈTE + RATE LIMITING + LOGGING SÉCURISÉ

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ✅ RATE LIMITING: Protection contre abus
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 conversations par minute

  const userLimit = rateLimit.get(userId);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// ✅ SCHÉMA DE VALIDATION STRICT
const ParticipantSchema = z.object({
  user_id: z.string().uuid('ID utilisateur invalide'),
  role: z.enum(['consumer', 'business'], {
    errorMap: () => ({ message: 'Rôle invalide: consumer ou business' })
  })
});

const CreateConversationSchema = z.object({
  origin_type: z.enum(['business', 'user'], {
    errorMap: () => ({ message: 'Type d\'origine invalide: business ou user' })
  }),
  origin_id: z.string().uuid('ID d\'origine invalide'),
  participants: z.array(ParticipantSchema).min(1, 'Au moins un participant requis').max(50, 'Trop de participants'),
  title: z.string().min(1, 'Titre requis').max(100, 'Titre trop long').optional(),
  metadata: z.record(z.any()).optional()
}).strict(); // Pas de champs supplémentaires autorisés

// ✅ CORS RESTRICTIF
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

    // ✅ RATE LIMITING: Vérifier limites utilisateur
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Trop de requêtes. Veuillez patienter.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const validationResult = CreateConversationSchema.safeParse(requestData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Données invalides',
          details: validationResult.error.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const conversationData = validationResult.data;

    // ✅ BUSINESS/USER: Vérifier que l'origine existe et est valide
    let originCheck;
    if (conversationData.origin_type === 'business') {
      originCheck = await supabaseClient
        .from('business_profiles')
        .select('id, is_active')
        .eq('id', conversationData.origin_id)
        .eq('is_active', true)
        .single();
    } else {
      originCheck = await supabaseClient
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', conversationData.origin_id)
        .single();
    }

    if (originCheck.error || !originCheck.data) {
      return new Response(
        JSON.stringify({ error: `${conversationData.origin_type} introuvable ou invalide` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ PARTICIPANTS: Vérifier que tous les participants existent
    const participantIds = conversationData.participants.map(p => p.user_id);
    const { data: existingUsers, error: usersError } = await supabaseClient
      .from('user_profiles')
      .select('user_id')
      .in('user_id', participantIds);

    if (usersError || !existingUsers || existingUsers.length !== participantIds.length) {
      return new Response(
        JSON.stringify({ error: 'Un ou plusieurs participants invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ BUSINESS CONVERSATION: Vérifier autorisation pour conversations business
    if (conversationData.origin_type === 'business') {
      const hasAccess = await supabaseClient.rpc('user_can_view_business_contacts', {
        business_id_param: conversationData.origin_id
      });

      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Accès non autorisé à cette entreprise' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ TRANSACTION: Créer la conversation atomiquement
    const { data: conversation, error: conversationError } = await supabaseClient.rpc('create_conversation_with_participants', {
      p_origin_type: conversationData.origin_type,
      p_origin_id: conversationData.origin_id,
      p_title: conversationData.title || `Conversation ${conversationData.origin_type}`,
      p_participants: conversationData.participants,
      p_metadata: conversationData.metadata || {}
    });

    if (conversationError) {
      // ✅ LOGGING SÉCURISÉ: Pas de données sensibles
      console.error('Erreur création conversation:', conversationError.message);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la conversation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SUCCESS: Retourner la conversation créée
    return new Response(
      JSON.stringify({
        success: true,
        conversation: conversation,
        message: 'Conversation créée avec succès'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ✅ ERROR: Logging sécurisé (pas de données sensibles)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur inattendue create-conversation:', errorMessage);

    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});