import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// --- Global Mocks (Environnement Deno) ---
// Déplacer les mocks Deno ici pour un meilleur contexte Vitest
global.Deno = {
  env: {
    get: vi.fn((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
      return undefined;
    }),
  },
} as any;

// --- Mocking des Dépendances ---
// On utilise vi.hoisted pour isoler les mocks
vi.hoisted(() => {
    // La fonction qui simule la logique de l'Edge Function
    const mockCreateConversationHandler = vi.fn(async (request: Request) => {
        // Logique simplifiée de l'Edge Function pour le test:
        try {
            // Simuler la validation du JWT dans l'en-tête
            const authHeader = request.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
            }
            const token = authHeader.split(' ')[1];
            
            // Simuler la logique de création de client Supabase (avec le token)
            const supabase = createClient('https://test.supabase.co', 'test-anon-key', {
                global: { headers: { 'Authorization': `Bearer ${token}` } }
            });
            
            // Simuler la lecture du corps et la validation Zod
            const body = await request.json();
            
            // Dans le vrai Edge Function, cela validerait le schéma.
            // Ici, on simule l'appel à la DB après validation (si c'est bien mocké).
            
            if (!body.origin_id || !body.participants || body.participants.length < 2) {
                return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
            }
            
            // Simuler l'appel à la DB (doit être mocké)
            const { data, error } = await supabase.from('conversations').insert(body).select();
            
            if (error) {
                return new Response(JSON.stringify({ error: 'DB Error' }), { status: 500 });
            }
            
            return new Response(JSON.stringify({ data }), { status: 201 });
            
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    });
    
    // Mock de serve qui exécute notre fonction de gestion
    const serveMock = vi.fn(async (handler: any) => {
        // En Deno, serve prend un handler. Nous allons exposer le handler pour le tester
        if (!global.edgeHandler) {
            global.edgeHandler = handler;
        }
    });

    return { 
        serveMock,
        mockCreateConversationHandler 
    };
});

// Mock des dépendances pour pointer vers nos mocks
vi.mock('https://deno.land/std@0.168.0/http/server.ts', () => ({
  serve: vi.hoisted(() => vi.fn((handler) => global.edgeHandler = handler)).serveMock,
}));

// Mock de Supabase pour simuler la DB
const mockFrom = vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn(),
}));

vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: vi.fn(() => ({
      from: mockFrom,
  })),
}));

// Mock Zod (vous l'aviez bien fait, mais ici on le rend plus concis)
vi.mock('https://deno.land/x/zod@v3.22.4/mod.ts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Si vous voulez utiliser le vrai Zod pour un test de schéma
    z: {
        object: vi.fn(() => ({ strict: vi.fn().mockReturnThis(), parse: vi.fn() })),
        string: vi.fn(() => ({ uuid: vi.fn().mockReturnThis(), min: vi.fn().mockReturnThis(), max: vi.fn