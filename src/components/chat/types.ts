import type { UIMessage } from "ai";

export type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
};

export type ChatResponse = {
  chat: ChatSummary;
  messages?: UIMessage[];
};
