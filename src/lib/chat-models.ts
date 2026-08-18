export type ChatModelProvider = "google" | "openai";

export type ChatModel = {
  id: string;
  name: string;
  provider: ChatModelProvider;
  providerName: string;
  providerSlug: "google" | "openai";
};

export const chatModels = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    providerName: "Google",
    providerSlug: "google",
  },
  // {
  //   id: "gpt-4o-mini",
  //   name: "GPT-4o Mini",
  //   provider: "openai",
  //   providerName: "OpenAI",
  //   providerSlug: "openai",
  // },
  // {
  //   id: "gpt-4o",
  //   name: "GPT-4o",
  //   provider: "openai",
  //   providerName: "OpenAI",
  //   providerSlug: "openai",
  // },
] satisfies ChatModel[];

export const defaultChatModel = chatModels[0];

export function getChatModel(modelId?: string) {
  return chatModels.find((model) => model.id === modelId) ?? defaultChatModel;
}
