/**
 * RAG Engine — Enhanced Retrieval-Augmented Generation for Rasid AI
 * Features:
 * - Intent detection for smart query classification
 * - Fuzzy keyword matching for better retrieval
 * - Context-aware retrieval (2-5 incidents max)
 * - Atlas statistics summarization
 */
import { invokeLLM } from "../_core/llm";

const EMBEDDING_MODEL = "text-embedding-ada-002";
const EMBEDDING_DIMS = 1536;
const TOP_K = 3;

// ═══ Intent Detection Types ═══
type UserIntent =
  | "specific_incident"    // Asking about a specific incident by name/ID
  | "statistics"           // Asking for statistics/numbers
  | "comparison"           // Comparing sectors/periods
  | "pdpl_question"        // Questions about PDPL law
  | "sector_query"         // Questions about a specific sector
  | "general_question"     // General questions
  | "trend_analysis";      // Timeline/trend questions

// ═══ Configuration Constants ═══
const SUMMARY_MESSAGE_PREVIEW_LENGTH = 100; // Characters to include in conversation summary
const MAX_INCIDENTS_FOR_STATS = 2;          // Max incidents to retrieve for statistics queries
const MAX_INCIDENTS_FOR_SPECIFIC = 1;       // Max incidents for specific incident queries
const MAX_INCIDENTS_FOR_COMPARISON = 10;    // Max incidents for comparison queries

interface IncidentDoc {
  index: number;
  text: string;
  data: any;
}

interface VectorEntry {
  vector: number[];
  index: number;
}

// ═══ Simple Vector Search (cosine similarity) ═══
class SimpleVectorSearch {
  private vectors: VectorEntry[] = [];

  initIndex() { /* no-op */ }

  addPoint(vector: number[], index: number) {
    this.vectors.push({ vector, index });
  }

  getCurrentCount(): number {
    return this.vectors.length;
  }

  searchKnn(queryVector: number[], k: number): { neighbors: number[]; distances: number[] } {
    const distances = this.vectors.map((item) => ({
      index: item.index,
      distance: this.cosineSimilarity(queryVector, item.vector),
    }));
    distances.sort((a, b) => b.distance - a.distance);
    const topK = distances.slice(0, k);
    return {
      neighbors: topK.map((d) => d.index),
      distances: topK.map((d) => 1 - d.distance),
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// ═══ RAG Engine ═══
export class RAGEngine {
  private index: SimpleVectorSearch | null = null;
  private incidents: any[] = [];
  private documents: IncidentDoc[] = [];
  public isReady = false;

  private buildDocumentText(incident: any): string {
    const parts = [
      `Title: ${incident.title || ""} / ${incident.titleAr || ""}`,
      `Sector: ${incident.sector || ""} / ${incident.sectorAr || ""}`,
      `Source: ${incident.source || ""}`,
      `Severity: ${incident.severity || ""}`,
      `Victim: ${incident.victimEntity || ""}`,
      `Breach Method: ${incident.breachMethod || ""} / ${incident.breachMethodAr || ""}`,
      `PII Types: ${(incident.piiTypes || []).join(", ")}`,
      `Records: ${incident.recordCount || 0}`,
      `Description: ${(incident.descriptionAr || incident.description || "").substring(0, 500)}`,
      `AI Summary: ${(incident.aiSummaryAr || incident.aiSummary || "").substring(0, 500)}`,
    ];
    return parts.join("\n");
  }

  /**
   * Initialize the vector database by embedding all incidents.
   * Call once at server startup.
   */
  async initialize(incidents: any[]): Promise<void> {
    this.incidents = incidents;
    const numItems = incidents.length;

    if (numItems === 0) {
      console.warn("[RAG] No incidents to index.");
      return;
    }

    this.index = new SimpleVectorSearch();
    this.index.initIndex();

    console.log(`[RAG] Indexing ${numItems} incidents...`);

    const textsToEmbed = incidents.map((inc, idx) => {
      const text = this.buildDocumentText(inc);
      this.documents.push({ index: idx, text, data: inc });
      return text;
    });

    // Batch embedding using the LLM helper (proxied through forge)
    const BATCH_SIZE = 50;
    for (let i = 0; i < textsToEmbed.length; i += BATCH_SIZE) {
      const batch = textsToEmbed.slice(i, i + BATCH_SIZE);
      try {
        // Embedding via forge proxy is not directly supported through invokeLLM
        // Use keyword-based search as the primary retrieval method
        const response: any = null;

        // If embedding fails, use fallback keyword-based search
        if (!response || !(response as any).data) {
          console.warn("[RAG] Embedding API not available, using keyword fallback");
          this.isReady = true;
          return;
        }

        (response as any).data.forEach((item: any, batchIdx: number) => {
          this.index!.addPoint(item.embedding, i + batchIdx);
        });
      } catch (err: any) {
        console.warn(`[RAG] Embedding batch ${i} failed: ${err.message}. Using keyword fallback.`);
        this.isReady = true;
        return;
      }
    }

    console.log(`[RAG] Successfully indexed ${this.index.getCurrentCount()} incidents.`);
    this.isReady = true;
  }

  /**
   * Detect user intent from query
   */
  detectIntent(query: string): UserIntent {
    const queryLower = query.toLowerCase();
    
    // Specific incident patterns
    if (queryLower.match(/حادثة|تفاصيل.*رقم|معرف|real-\d+/i)) {
      return "specific_incident";
    }
    
    // Statistics patterns
    if (queryLower.match(/كم عدد|إجمالي|إحصائ|total|count|number of/i)) {
      return "statistics";
    }
    
    // Comparison patterns
    if (queryLower.match(/مقارنة|قارن|أكثر من|أقل من|compare|vs|versus/i)) {
      return "comparison";
    }
    
    // PDPL patterns
    if (queryLower.match(/pdpl|نظام حماية البيانات|المادة|غرامة|fine|penalty/i)) {
      return "pdpl_question";
    }
    
    // Sector-specific patterns
    if (queryLower.match(/قطاع|sector|الصحي|المالي|الحكومي|التعليمي|health|financial|government|education/i)) {
      return "sector_query";
    }
    
    // Trend analysis patterns
    if (queryLower.match(/اتجاه|trend|تطور|timeline|خلال|أشهر|سنة|شهري|yearly|monthly/i)) {
      return "trend_analysis";
    }
    
    return "general_question";
  }

  /**
   * Retrieve top-K relevant incidents for a query with intent-aware retrieval
   */
  async retrieve(query: string, topK: number = TOP_K): Promise<any[]> {
    const intent = this.detectIntent(query);
    
    // Adjust topK based on intent to optimize context size
    let adjustedK = topK;
    if (intent === "statistics" || intent === "pdpl_question") {
      adjustedK = MAX_INCIDENTS_FOR_STATS; // Return fewer incidents for stats queries
    } else if (intent === "specific_incident") {
      adjustedK = MAX_INCIDENTS_FOR_SPECIFIC; // Only one for specific incident
    } else if (intent === "comparison" || intent === "trend_analysis") {
      adjustedK = MAX_INCIDENTS_FOR_COMPARISON; // More for comparisons
    }
    
    return this.fuzzyKeywordSearch(query, adjustedK);
  }

  /**
   * Enhanced keyword search with fuzzy matching
   * 
   * Performance Note: For the Atlas dataset (~110 incidents), the O(n*m*w) complexity
   * is acceptable. For larger datasets (1000+ documents), consider:
   * - Pre-computing and caching word lists per document during initialization
   * - Using trigram or n-gram indexing for fuzzy matching
   * - Implementing inverted index for exact term matching
   */
  private fuzzyKeywordSearch(query: string, topK: number): any[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    const scored = this.documents.map((doc) => {
      let score = 0;
      const textLower = doc.text.toLowerCase();
      
      // Exact phrase match (highest priority)
      if (textLower.includes(queryLower)) {
        score += 10;
      }
      
      // Individual term matching
      for (const term of queryTerms) {
        if (textLower.includes(term)) {
          score += 2;
        }
        
        // Fuzzy matching for terms >= 4 chars
        if (term.length >= 4) {
          const termPrefix = term.substring(0, 4);
          const words = textLower.split(/\s+/);
          for (const word of words) {
            if (word.length >= 4) {
              const wordPrefix = word.substring(0, 4);
              if (word.includes(termPrefix) || term.includes(wordPrefix)) {
                score += 1;
              }
            }
          }
        }
      }
      
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).filter(s => s.score > 0).map(s => s.doc.data);
  }

  /**
   * Legacy keyword search (kept for backward compatibility)
   */
  private keywordSearch(query: string, topK: number): any[] {
    return this.fuzzyKeywordSearch(query, topK);
  }

  /**
   * Build context string from retrieved incidents for the system prompt
   */
  buildContext(retrievedIncidents: any[]): string {
    if (retrievedIncidents.length === 0) return "";

    let context = "\n\n## السياق المسترجع (RAG):\n";
    retrievedIncidents.forEach((inc, idx) => {
      context += `\n### حادثة ${idx + 1}: ${inc.titleAr || inc.title}\n`;
      context += `- القطاع: ${inc.sectorAr || inc.sector}\n`;
      context += `- الخطورة: ${inc.severity}\n`;
      context += `- السجلات: ${inc.recordCount?.toLocaleString()}\n`;
      context += `- المصدر: ${inc.source}\n`;
      if (inc.descriptionAr) context += `- الوصف: ${inc.descriptionAr.substring(0, 300)}\n`;
      if (inc.aiSummaryAr) context += `- ملخص AI: ${inc.aiSummaryAr.substring(0, 300)}\n`;
    });
    return context;
  }

  /**
   * Build Atlas statistics summary for system prompt
   * Returns concise statistics instead of full incident data
   */
  buildAtlasSummary(): string {
    if (this.incidents.length === 0) return "";
    
    const totalIncidents = this.incidents.length;
    const totalRecords = this.incidents.reduce((sum, inc) => sum + (inc.recordCount || 0), 0);
    
    // Count by severity
    const severityCounts: Record<string, number> = {};
    this.incidents.forEach(inc => {
      const sev = inc.severity || "Unknown";
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });
    
    // Count by sector
    const sectorCounts: Record<string, number> = {};
    this.incidents.forEach(inc => {
      const sector = inc.sectorAr || inc.sector || "غير محدد";
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    const topSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`)
      .join("، ");
    
    return `
## إحصائيات أطلس البيانات (ملخص)
- إجمالي الحوادث: ${totalIncidents}
- إجمالي السجلات المتأثرة: ${totalRecords.toLocaleString()}
- الحوادث الحرجة: ${severityCounts.Critical || 0}
- الحوادث عالية الخطورة: ${severityCounts.High || 0}
- أكثر القطاعات تأثراً: ${topSectors}

**ملاحظة:** استخدم أدوات الأطلس (query_atlas_breaches، get_atlas_stats) للحصول على التفاصيل الكاملة.
`;
  }
}

// ═══ Conversation Memory Manager ═══
export class ConversationMemory {
  private readonly MAX_MESSAGES = 10;
  // Note: SUMMARY_THRESHOLD was removed as it's not currently used
  // Can be added back if implementing tiered summarization
  
  /**
   * Manage conversation history - keep last N messages, summarize old ones
   */
  manageHistory(
    history: Array<{ role: "user" | "assistant"; content: string }>
  ): { messages: Array<{ role: "user" | "assistant"; content: string }>; summary?: string } {
    // If history is within limit, return as is
    if (history.length <= this.MAX_MESSAGES) {
      return { messages: history };
    }
    
    // Split into old and recent
    const oldMessages = history.slice(0, history.length - this.MAX_MESSAGES);
    const recentMessages = history.slice(-this.MAX_MESSAGES);
    
    // Create summary of old messages
    const summary = this.summarizeMessages(oldMessages);
    
    return {
      messages: recentMessages,
      summary,
    };
  }
  
  /**
   * Summarize old messages into a concise format
   */
  private summarizeMessages(messages: Array<{ role: "user" | "assistant"; content: string }>): string {
    if (messages.length === 0) return "";
    
    // Extract key topics from user messages
    const userQueries = messages
      .filter(m => m.role === "user")
      .map(m => m.content.substring(0, SUMMARY_MESSAGE_PREVIEW_LENGTH))
      .join("، ");
    
    return `**ملخص المحادثة السابقة:** تم مناقشة ${messages.length} رسائل حول: ${userQueries}...`;
  }
  
  /**
   * Build conversation window with summary
   */
  buildConversationWindow(
    history: Array<{ role: "user" | "assistant"; content: string }>
  ): Array<{ role: "user" | "assistant" | "system"; content: string }> {
    const managed = this.manageHistory(history);
    const result: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    
    // Add summary as system message if exists
    if (managed.summary) {
      result.push({ role: "system", content: managed.summary });
    }
    
    // Add recent messages
    result.push(...managed.messages);
    
    return result;
  }
}

// Singleton instances
export const ragEngine = new RAGEngine();
export const conversationMemory = new ConversationMemory();
