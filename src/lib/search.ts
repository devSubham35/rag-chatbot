import { prisma } from "./db";
import { generateEmbedding } from "./embeddings";

export async function searchDocuments(
  query: string,
  limit: number = 5,
  threshold: number = 0.5
) {
  // Generate embedding for the user's query
  const embedding = await generateEmbedding(query);

  // Convert embedding array to pgvector format
  const vector = JSON.stringify(embedding);

  const similarDocuments = await prisma.$queryRaw<
    {
      id: string;
      content: string;
      similarity: number;
    }[]
  >`
    SELECT
      "id",
      "content",
      1 - ("embedding" <=> ${vector}::vector) AS similarity
    FROM "documents"
    WHERE 1 - ("embedding" <=> ${vector}::vector) > ${threshold}
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit};
  `;

  return similarDocuments;
}