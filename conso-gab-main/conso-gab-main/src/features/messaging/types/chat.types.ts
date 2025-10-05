export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface MessagingState {
  conversations: Conversation[];
  messages: { [convId: string]: Message[] };
  unreadCounts: { [convId: string]: number };
  loading: boolean;
  error: string | null;
}

export type MessagingAction =
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "SET_MESSAGES"; payload: { conversationId: string; messages: Message[] } }
  | { type: "DELETE_MESSAGE"; payload: string };