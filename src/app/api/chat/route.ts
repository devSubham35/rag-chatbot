import {
  tool,
  streamText,
  UIDataTypes,
  stepCountIs,
  InferUITools,
  type UIMessage,
  toUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
} from "ai";

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { searchDocuments } from "@/lib/search";

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
    await auth.protect();

    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: await convertToModelMessages(messages),
      tools,
      system: `You are a helpful assistant with access to a knowledge base. 
          When users ask questions, search the knowledge base for relevant information.
          Always search before answering if the question might relate to uploaded documents.
          Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with all the information from the search results.`,
      stopWhen: stepCountIs(2),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream(result),
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);

    return new Response("Failed to stream chat completion", {
      status: 500,
    });
  }
}
