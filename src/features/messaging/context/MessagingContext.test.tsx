import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MessagingProvider, useMessaging } from "./MessagingContext";

jest.mock("../api/messaging.service", () => ({
  fetchConversations: jest.fn().mockResolvedValue([
    { id: "X", title: "ConvX", unreadCount: 0 }
  ]),
  fetchMessages: jest.fn().mockResolvedValue([
    { id: "mX", conversationId: "X", senderId: "uX", content: "Salut", createdAt: "2022-01-01" }
  ]),
  sendMessage: jest.fn().mockResolvedValue(undefined),
  deleteMessage: jest.fn().mockResolvedValue(undefined),
}));

const DummyComponent = () => {
  const { conversations, messages, fetchConversations, fetchMessages, sendMessage, deleteMessage } = useMessaging();
  return (
    <div>
      <button onClick={() => fetchConversations()} data-testid="fetch-conv">fetch</button>
      <button onClick={() => fetchMessages("X")} data-testid="fetch-msgs">fetch messages</button>
      <button onClick={() => sendMessage("X", "test")} data-testid="send-msg">send</button>
      <button onClick={() => deleteMessage("mX")} data-testid="delete-msg">delete</button>
      <span data-testid="convs-count">{conversations.length}</span>
      <span data-testid="msgs-count">{(messages["X"] || []).length}</span>
    </div>
  );
};

describe("MessagingProvider (concret)", () => {
  it("gère le cycle complet (fetch, send, delete)", async () => {
    render(
      <MessagingProvider>
        <DummyComponent />
      </MessagingProvider>
    );
    // fetch conversations
    await act(async () => {
      screen.getByTestId("fetch-conv").click();
    });
    expect(Number(screen.getByTestId("convs-count").textContent)).toBeGreaterThanOrEqual(1);

    // fetch messages
    await act(async () => {
      screen.getByTestId("fetch-msgs").click();
    });
    expect(Number(screen.getByTestId("msgs-count").textContent)).toBeGreaterThanOrEqual(1);

    // simulate send
    await act(async () => {
      screen.getByTestId("send-msg").click();
    });

    // simulate delete
    await act(async () => {
      screen.getByTestId("delete-msg").click();
    });
  });
});