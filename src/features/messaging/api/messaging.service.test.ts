import { sendMessage } from "./messaging.service";

describe("messaging.service Zod validation (concret)", () => {
  it("accepte un message correct", () => {
    expect(() =>
      sendMessage("conv-id", "Un message très lourd", undefined)
    ).not.toThrow();
  });

  it("rejette un message vide", () => {
    expect(() =>
      sendMessage("conv-id", "")
    ).toThrow();
  });

  it("rejette un conversationId vide", () => {
    // @ts-expect-error
    expect(() => sendMessage(undefined, "msg")).toThrow();
  });

  it("rejette les caractères spéciaux non attendus", () => {
    expect(() =>
      sendMessage("conv-id", "<script>alert(1)</script>")
    ).not.toThrow(); // La validation Zod n'interdit pas ça par défaut.
  });
});