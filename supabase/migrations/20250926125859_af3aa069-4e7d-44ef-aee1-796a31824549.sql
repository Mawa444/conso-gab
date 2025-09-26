-- Amélioration du système de messagerie selon le plan

-- Table pour les pièces jointes et médias
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, audio, video, document
  file_size INTEGER,
  file_name TEXT,
  mime_type TEXT,
  width INTEGER, -- pour les images
  height INTEGER, -- pour les images
  duration INTEGER, -- pour audio/video en secondes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_attachments_message_id ON public.attachments(message_id);

-- Table pour les conversations privées (amélioration)
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'private';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Table pour gérer les membres de conversation (si participants n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notifications_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

-- Index pour optimiser les requêtes de membres
CREATE INDEX idx_conversation_members_user_id ON public.conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);

-- Amélioration de la table messages pour supporter plus de types
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';

-- Table pour l'historique de frappe (typing indicators)
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Index pour les indicateurs de frappe
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);

-- Table pour bloquer des utilisateurs
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- RLS Policies pour attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their conversations" 
ON public.attachments FOR SELECT 
USING (
  message_id IN (
    SELECT m.id FROM public.messages m
    JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

CREATE POLICY "Users can create attachments in their messages" 
ON public.attachments FOR INSERT 
WITH CHECK (
  message_id IN (
    SELECT m.id FROM public.messages m
    WHERE m.sender_id = auth.uid()
  )
);

-- RLS Policies pour conversation_members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation members" 
ON public.conversation_members FOR SELECT 
USING (
  conversation_id IN (
    SELECT cm.conversation_id FROM public.conversation_members cm
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

CREATE POLICY "Users can join conversations when invited" 
ON public.conversation_members FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" 
ON public.conversation_members FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies pour typing_indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view typing indicators in their conversations" 
ON public.typing_indicators FOR SELECT 
USING (
  conversation_id IN (
    SELECT cm.conversation_id FROM public.conversation_members cm
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

CREATE POLICY "Users can manage their own typing indicators" 
ON public.typing_indicators FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies pour blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocked list" 
ON public.blocked_users FOR SELECT 
USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others" 
ON public.blocked_users FOR INSERT 
WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others" 
ON public.blocked_users FOR DELETE 
USING (blocker_id = auth.uid());

-- Fonction pour nettoyer les anciens indicateurs de frappe
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer la réplication en temps réel pour toutes les tables
ALTER TABLE public.attachments REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_members REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.blocked_users REPLICA IDENTITY FULL;