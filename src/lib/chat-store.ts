import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim();
}

export function getChatTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const title = firstUserMessage ? getMessageText(firstUserMessage) : "";

  if (!title) {
    return "New chat";
  }

  return title.length > 48 ? `${title.slice(0, 48).trim()}...` : title;
}

export function parseStoredMessage(content: string): UIMessage | null {
  try {
    return JSON.parse(content) as UIMessage;
  } catch {
    return null;
  }
}
