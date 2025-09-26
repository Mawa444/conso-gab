-- Correction des problèmes de sécurité RLS

-- Correction de la fonction cleanup_old_typing_indicators
DROP FUNCTION IF EXISTS cleanup_old_typing_indicators();
CREATE OR REPLACE FUNCTION public.cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Activer RLS sur les tables qui n'en ont pas
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Policies pour message_templates
CREATE POLICY "Users can view message templates" 
ON public.message_templates FOR SELECT 
USING (true); -- Les templates sont publics

-- Activer la réplication temps réel pour les tables messaging existantes
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;
ALTER TABLE public.message_actions REPLICA IDENTITY FULL;