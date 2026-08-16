import { embed, embedMany } from "ai";
import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";

const embeddingModel = google.embedding("gemini-embedding-001");

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const input = text.replaceAll("\n", " ");

  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
        taskType: "RETRIEVAL_DOCUMENT",
      } satisfies GoogleEmbeddingModelOptions,
    },
  });

  return embedding;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: inputs,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
        taskType: "RETRIEVAL_DOCUMENT",
      } satisfies GoogleEmbeddingModelOptions,
    },
  });

  return embeddings;
}