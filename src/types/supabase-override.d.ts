// Types manuels pour les tables créées via migration SQL mais pas encore générées
// Permet d'éviter @ts-ignore

import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

declare global {
  type Database = GeneratedDatabase & {
    public: {
      Tables: {
        business_visits: {
          Row: {
            id: string;
            business_id: string;
            visitor_id: string | null;
            visited_at: string;
            source: string | null;
            user_agent: string | null;
            device_type: string | null;
            ip_hash: string | null;
          };
          Insert: {
            id?: string;
            business_id: string;
            visitor_id?: string | null;
            visited_at?: string;
            source?: string | null;
            user_agent?: string | null;
            device_type?: string | null;
            ip_hash?: string | null;
          };
          Update: Partial<Database['public']['Tables']['business_visits']['Insert']>;
        };
        // Add other new tables here if needed
      };
    };
  };
}
