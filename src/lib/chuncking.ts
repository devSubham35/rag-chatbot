const CHUNK_SIZE = 150;
const CHUNK_OVERLAP = 20;

export async function chunkContent(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let start = 0; start < words.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = words.slice(start, start + CHUNK_SIZE).join(" ");

    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}
