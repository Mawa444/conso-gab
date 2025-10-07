// --- 1. Types de Base (Conversion en camelCase standard) ---

export interface Message {
  id: string;
  conversationId: string; // anciennement conversationId (maintenu)
  senderId: string; // anciennement senderId (maintenu)
  content: string;
  createdAt: string; // anciennement createdAt (maintenu)
  attachmentUrl?: string;
  // Ajout de métadonnées pour plus de flexibilité (optionnel)
  metadata?: Record<string, any>;
}

// L'objet Message entier est stocké dans Conversation.lastMessage
export interface Conversation {
  id: string;
  title: string;
  lastMessage?: Message;
  // Le champ 'unreadCount' est gardé ici et sera la source unique de vérité.
  unreadCount: number;
  // Ajout de l'ID du business pour le contexte (comme vu dans le cahier des charges)
  businessId?: string;
}

// --- 2. État Global de la Messagerie (Simplifié et Robuste) ---

export interface MessagingState {
  // Liste des conversations (Contient le lastMessage et unreadCount)
  conversations: Conversation[];

  // Cache des messages, indexé par l'ID de la conversation
  // Utilisation de Map<string, Message[]> pour une meilleure performance et typage que { [convId: string]: Message[] }
  messages: Map<string, Message[]>;

  // La structure unreadCounts est retirée car elle est redondante avec Conversation.unreadCount

  // Gestion de l'état asynchrone
  loading: boolean;
  error: string | null;
}

// --- 3. Actions (Correction des bugs et ajout de l'essentiel) ---

export type MessagingAction =
  // Initialisation ou rafraîchissement
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }

  // Remplacer l'historique d'une conversation (chargement initial)
  | { type: "SET_MESSAGES"; payload: { conversationId: string; messages: Message[] } }

  // **AJOUT CRUCIAL** : Ajout d'un nouveau message (temps réel)
  | { type: "ADD_MESSAGE"; payload: Message }

  // **CORRECTION DE BUG** : La suppression nécessite l'ID de la conversation
  | { type: "DELETE_MESSAGE"; payload: { conversationId: string; messageId: string } }

  // **AMÉLIORATION** : Mise à jour du statut (lu, envoyé, etc.)
  | {
      type: "UPDATE_MESSAGE_STATUS";
      payload: {
        conversationId: string;
        messageId: string;
        status: "sent" | "delivered" | "read";
      };
    }

  // **AMÉLIORATION** : Marquer la conversation comme lue
  | { type: "MARK_CONVERSATION_READ"; payload: string } // payload est conversationId

  // **AJOUTS D'ÉTAT**
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
