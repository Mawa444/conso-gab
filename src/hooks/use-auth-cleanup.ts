import { supabase } from "@/integrations/supabase/client";

export const useAuthCleanup = () => {
  const cleanupAuthState = () => {
    // Minimal cleanup - don't aggressively remove Supabase tokens
    try {
      localStorage.removeItem('prefillEmail');
    } catch {
      // Ignore
    }
  };

  const secureSignOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  };

  return { cleanupAuthState, secureSignOut };
};
