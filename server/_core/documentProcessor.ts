/**
 * Document Processor - Text chunking and embedding generation for training documents
 * 
 * Provides:
 * 1. Text chunking (split large documents into overlapping chunks)
 * 2. Process documents and generate embeddings for each chunk
 * 3. Store chunks in knowledge base for RAG retrieval
 */

import { getDb } from "../db";
import { knowledgeBase, trainingDocuments } from "../../drizzle/schema";
import { generateEmbedding } from "./llm";
import { eq } from "drizzle-orm";

// ============================================
// Text Chunking
// ============================================
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) return [];
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf(".", end);
      const arabicSentenceEnd = text.lastIndexOf("。", end);
      const newlineEnd = text.lastIndexOf("\n", end);
      
      const breakPoint = Math.max(sentenceEnd, arabicSentenceEnd, newlineEnd);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.substring(start, Math.min(end, text.length)).trim());
    start = end - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter(c => c.length > 50); // Filter out very small chunks
}

// ============================================
// Process Document
// ============================================
export async function processDocument(documentId: number): Promise<{
  success: boolean;
  chunksCount: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { success: false, chunksCount: 0, error: "Database unavailable" };

  try {
    // Get document
    const [doc] = await db.select()
      .from(trainingDocuments)
      .where(eq(trainingDocuments.id, documentId));

    if (!doc) return { success: false, chunksCount: 0, error: "Document not found" };

    // Update status to processing
    await db.update(trainingDocuments).set({
      status: "processing",
    }).where(eq(trainingDocuments.id, documentId));

    const content = doc.extractedContent || "";
    if (!content.trim()) {
      await db.update(trainingDocuments).set({
        status: "failed",
      }).where(eq(trainingDocuments.id, documentId));
      return { success: false, chunksCount: 0, error: "No content to process" };
    }

    // Chunk the text
    const chunks = chunkText(content, 1000, 200);
    let insertedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding
      const embedding = await generateEmbedding(chunk);

      // Insert into knowledge base
      await db.insert(knowledgeBase).values({
        title: `${doc.fileName} - جزء ${i + 1}`,
        type: "document_chunk",
        content: chunk,
        source: doc.fileName,
        category: "training_document",
        embedding: embedding.length > 0 ? embedding : undefined,
        embeddingModel: embedding.length > 0 ? "text-embedding-3-small" : undefined,
        tokenCount: Math.ceil(chunk.length / 4),
        isActive: true,
      });

      insertedCount++;
    }

    // Update document status
    await db.update(trainingDocuments).set({
      status: "completed",
      chunksCount: insertedCount,
    }).where(eq(trainingDocuments.id, documentId));

    return { success: true, chunksCount: insertedCount };
  } catch (error: any) {
    await db.update(trainingDocuments).set({
      status: "failed",
    }).where(eq(trainingDocuments.id, documentId));
    return { success: false, chunksCount: 0, error: error.message };
  }
}

// ============================================
// Estimate Token Count
// ============================================
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for mixed Arabic/English
  return Math.ceil(text.length / 4);
}
