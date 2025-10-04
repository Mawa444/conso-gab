import { MessagingState, MessagingAction } from "../types/chat.types";

export const initialMessagingState: MessagingState = {
  conversations: [],
  messages: {},
  unreadCounts: {},
  loading: false,
  error: null,
};

export function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };
    case "DELETE_MESSAGE":
      const updated = { ...state.messages };
      for (const convId in updated) {
        updated[convId] = updated[convId].filter(msg => msg.id !== action.payload);
      }
      return { ...state, messages: updated };
    default:
      return state;
  }
}