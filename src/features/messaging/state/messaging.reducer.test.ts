import { messagingReducer, initialMessagingState } from "./messaging.reducer";
import { Message, Conversation } from "../types/chat.types";

describe("messagingReducer (concret)", () => {
  it("gère une surcharge massive de conversations", () => {
    const conversations: Conversation[] = Array.from({length: 1000}, (_, i) => ({
      id: String(i),
      title: `Conv ${i}`,
      unreadCount: Math.floor(Math.random() * 10),
    }));
    const state = messagingReducer(initialMessagingState, {
      type: "SET_CONVERSATIONS",
      payload: conversations,
    });
    expect(state.conversations.length).toBe(1000);
    expect(state.conversations[500].title).toBe("Conv 500");
  });

  it("remplace correctement des messages existants", () => {
    const messages1: Message[] = [
      { id: "m1", conversationId: "1", senderId: "u1", content: "Msg1", createdAt: "2022-01-01" },
    ];
    const messages2: Message[] = [
      { id: "m2", conversationId: "1", senderId: "u2", content: "Msg2", createdAt: "2022-01-02" },
    ];
    let state = messagingReducer(initialMessagingState, {
      type: "SET_MESSAGES",
      payload: { conversationId: "1", messages: messages1 }
    });
    state = messagingReducer(state, {
      type: "SET_MESSAGES",
      payload: { conversationId: "1", messages: messages2 }
    });
    expect(state.messages["1"]).toEqual(messages2);
  });

  it("supprime un message sur une conversation volumineuse", () => {
    const messages = Array.from({length: 200}, (_, i) => ({
      id: `m${i}`,
      conversationId: "1",
      senderId: "u1",
      content: `Contenu ${i}`,
      createdAt: "2022-01-01"
    }));
    const stateWithMsgs = { ...initialMessagingState, messages: { "1": messages } };
    const state = messagingReducer(stateWithMsgs, {
      type: "DELETE_MESSAGE",
      payload: "m50"
    });
    expect(state.messages["1"].length).toBe(199);
    expect(state.messages["1"].find(m => m.id === "m50")).toBeUndefined();
  });

  it("ne plante pas avec des actions inconnues", () => {
    // @ts-expect-error
    const state = messagingReducer(initialMessagingState, { type: "UNKNOWN" });
    expect(state).toEqual(initialMessagingState);
  });
}