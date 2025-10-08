import { MessagingState, MessagingAction } from "../types/chat.types";

export const initialMessagingState: MessagingState = {
  conversations: [],
  messages: new Map(),
  loading: false,
  error: null,
};

export function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    
    case "SET_MESSAGES": {
      const newMessages = new Map(state.messages);
      newMessages.set(action.payload.conversationId, action.payload.messages);
      return { ...state, messages: newMessages };
    }
    
    case "ADD_MESSAGE": {
      const newMessages = new Map(state.messages);
      const conversationMessages = newMessages.get(action.payload.conversationId) || [];
      newMessages.set(action.payload.conversationId, [...conversationMessages, action.payload]);
      return { ...state, messages: newMessages };
    }
    
    case "DELETE_MESSAGE": {
      const newMessages = new Map(state.messages);
      const conversationMessages = newMessages.get(action.payload.conversationId);
      if (conversationMessages) {
        newMessages.set(
          action.payload.conversationId,
          conversationMessages.filter(msg => msg.id !== action.payload.messageId)
        );
      }
      return { ...state, messages: newMessages };
    }
    
    case "UPDATE_MESSAGE_STATUS": {
      const newMessages = new Map(state.messages);
      const conversationMessages = newMessages.get(action.payload.conversationId);
      if (conversationMessages) {
        newMessages.set(
          action.payload.conversationId,
          conversationMessages.map(msg =>
            msg.id === action.payload.messageId
              ? { ...msg, metadata: { ...msg.metadata, status: action.payload.status } }
              : msg
          )
        );
      }
      return { ...state, messages: newMessages };
    }
    
    case "MARK_CONVERSATION_READ": {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload ? { ...conv, unreadCount: 0 } : conv
        ),
      };
    }
    
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}
