// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars');
}

// Client public (pour les données publiques)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Client authentifié via cookies (sécurisé)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Désactive le stockage local → tout passe par les cookies
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: true,
  },
});

// Fonction pour appeler les endpoints sécurisés
export async function secureFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    credentials: 'include', // Envoie les cookies httpOnly
  });
  return res;
}