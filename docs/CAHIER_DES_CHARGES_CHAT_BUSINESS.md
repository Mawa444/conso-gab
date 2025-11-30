// --- ENUMS DE BASE (Sécurité et Clarté) ---
export enum ConversationOriginType {
BUSINESS = 'business',
GROUP = 'group',
// etc.
}

export enum ParticipantRole {
CONSUMER = 'consumer',
BUSINESS = 'business',
}

export enum MessageType {
TEXT = 'text',
IMAGE = 'image',
FILE = 'file',
AUDIO = 'audio',
VIDEO = 'video',
LOCATION = 'location',
ACTION = 'action', // Pour les messages systèmes (ex: "utilisateur a rejoint")
}

// --- Interface BusinessConversation Améliorée ---
interface BusinessConversation {
id: string;
origin_type: ConversationOriginType.BUSINESS;
origin_id: string; // business_id
title: string; // Nom du business
type: 'private' | 'group'; // Sera 'private' pour ce MVP
last_activity: string;
is_archived: boolean; // Ajout pour gestion future
participants: Array<{ user_id: string; role: ParticipantRole }>;
}

// --- Interface BusinessMessage Améliorée ---
interface BusinessMessage {
id: string;
conversation_id: string;
sender_id: string;
message_type: MessageType; // Utilisation de l'enum
content: string; // Le texte ou le chemin de l'objet si média
metadata: { // Utilisation d'un champ JSONB pour les détails
url?: string;
filename?: string;
size_bytes?: number;
mime_type?: string;
// Pour localisation
latitude?: number;
longitude?: number;
};
status: 'sent' | 'delivered' | 'read';
created_at: string;
}export const useTypingIndicator = (conversationId: string) => {
// Gère l'état d'écriture via une table de signalisation Supabase/Realtime
// Envoie un signal 'typing' onKeyDown/onChange (débouncé)
// Reçoit des signaux 'typing' des autres participants
// Retourne { isTyping: boolean, startTyping: () => void, stopTyping: () => void }
}export const useSupabaseUploader = () => {
// ... (Upload vers Supabase Storage)
// Ajout : Gestion des Tokens d'autorisation de Supabase
// Ajout : Logique de Mime-Type check stricte côté client
// Retourner { uploadFile, progress, isUploading, error }
}-- Bucket 'chat-media'
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'chat-media'  
 -- S'assurer que le chemin d'upload inclut l'UID de l'utilisateur
AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Utilisation d'une fonction de sécurité pour vérifier la participation
-- (Nécessite une fonction PostgreSQL qui vérifie si l'objet appartient à une conversation de l'utilisateur)
CREATE POLICY "Users can view chat media only if participant"
ON storage.objects FOR SELECT
USING (
bucket_id = 'chat-media'
AND EXISTS (
SELECT 1 FROM public.messages AS msg
WHERE msg.sender_id = auth.uid() -- Peut récupérer ses propres médias
OR EXISTS (
SELECT 1 FROM participants AS p
-- Jointure indirecte: Le chemin de l'objet (name) doit être dans un message
WHERE p.conversation_id = msg.conversation_id
AND p.user_id = auth.uid()
AND msg.message_type != 'text' -- On ne vérifie que les messages avec media
-- Nécessite que le chemin du média soit stocké dans le champ 'content' ou 'metadata' du message.
)
)
);
