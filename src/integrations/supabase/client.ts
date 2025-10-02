// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl = 'https://vflyjeqwvkqnmihncjoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbHlqZXF3dmtxbm1paG5jam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDA4ODIsImV4cCI6MjA3MTQxNjg4Mn0.XTcBDKbC1yLPWwjswkqYJk5MZ_Bw28oSKM3jvsJKGhY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Utilise sessionStorage au lieu de localStorage → effacé à la fermeture de l'onglet
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true, // persiste pendant la session
    detectSessionInUrl: true,
  },
});
