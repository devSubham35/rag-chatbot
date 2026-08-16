import { auth } from "@clerk/nextjs/server";
import { google } from "@ai-sdk/google";
import { 
    streamText,
    type UIMessage,
    toUIMessageStream, 
    convertToModelMessages, 
    createUIMessageStreamResponse, 
} from "ai";

export async function POST(req: Request) {
  try {
    await auth.protect();

    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: await convertToModelMessages(messages),
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
