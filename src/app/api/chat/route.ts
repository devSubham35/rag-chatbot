import {
  tool,
  streamText,
  UIDataTypes,
  stepCountIs,
  InferUITools,
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
} from "ai";

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { searchDocuments } from "@/lib/search";
import { prisma } from "@/lib/db";

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant information",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
    execute: async ({ query }) => {
      try {
        // Search the vector database
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found in the knowledge base.";
        }

        // Format results for the AI
        const formattedResults = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;


export async function POST(req: Request) {
  try {
    const { userId } = await auth.protect();

    const {
      id,
      chatId,
      messages,
    }: { id?: string; chatId?: string; messages: UIMessage[] } =
      await req.json();
    const activeChatId = chatId ?? id;

    if (!activeChatId) {
      return new Response("Chat id is required", { status: 400 });
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: activeChatId },
      select: { id: true, userId: true },
    });

    if (chat && chat.userId !== userId) {
      return new Response("Chat not found", { status: 404 });
    }

    if (!chat) {
      await prisma.chatSession.create({
        data: {
          id: activeChatId,
          userId,
          title: "New chat",
        },
      });
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: await convertToModelMessages(messages),
      tools,
      maxRetries: 1,
      system: `You are a helpful assistant with access to a knowledge base. 
          When users ask questions, search the knowledge base for relevant information.
          Always search before answering if the question might relate to uploaded documents.
          Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with all the information from the search results.`,
      stopWhen: stepCountIs(2),
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream({
        onError: (error) => {
          console.error("Chat stream error:", error);

          if (
            error instanceof Error &&
            error.message.toLowerCase().includes("quota")
          ) {
            return "The AI provider quota is currently exhausted. Please wait a moment and try again.";
          }

          return "I could not generate a response. Please try again.";
        },
      }),
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);

    return new Response("Failed to stream chat completion", {
      status: 500,
    });
  }
}
