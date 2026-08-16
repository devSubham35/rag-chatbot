"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { PDFParse } from "pdf-parse";
import { chunkContent } from "@/lib/chuncking";
import { generateEmbeddings } from "@/lib/embeddings";

export async function processPdfFile(formData: FormData) {
  try {
    const { sessionClaims } = await auth.protect();

    if (sessionClaims.metadata?.roles !== "admin") {
      return {
        success: false,
        error: "You do not have permission to upload PDFs",
      };
    }

    const file = formData.get("pdf");

    if (!(file instanceof File)) {
      return {
        success: false,
        error: "No PDF file provided",
      };
    }

    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Only PDF files are allowed",
      };
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const parser = new PDFParse({
      data: buffer,
    });

    const data = await parser.getText();
    await parser.destroy();

    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: "No text found in PDF",
      };
    }

    // Chunk the text
    const chunks = await chunkContent(data.text);

    if (chunks.length === 0) {
      return {
        success: false,
        error: "No chunks generated from PDF",
      };
    }

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // Store chunks + embeddings in PostgreSQL
    for (let i = 0; i < chunks.length; i++) {
      await prisma.$executeRaw`
        INSERT INTO "documents" ("id", "content", "embedding")
        VALUES (
          gen_random_uuid(),
          ${chunks[i]},
          ${JSON.stringify(embeddings[i])}::vector
        )
      `;
    }

    return {
      success: true,
      message: "PDF processed successfully",
      chunks: chunks.length,
    };
  } catch (error) {
    console.error("PDF processing error:", error);

    return {
      success: false,
      error: "Failed to process PDF",
    };
  }
}
