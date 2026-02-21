import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id, tool_calls } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  // Handle assistant messages with tool_calls (content may be null/empty)
  if (role === "assistant" && tool_calls && tool_calls.length > 0) {
    const result: Record<string, unknown> = {
      role,
      tool_calls,
    };
    // Content can be empty string or null when assistant uses tools
    if (message.content && message.content !== "") {
      result.content = typeof message.content === "string" ? message.content : "";
    } else {
      result.content = "";
    }
    if (name) result.name = name;
    return result;
  }

  // Handle messages with empty/null content
  if (!message.content && message.content !== "") {
    return {
      role,
      name,
      content: "",
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () => {
  // If user has their own OpenAI key, use OpenAI API directly
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return "https://api.openai.com/v1/chat/completions";
  }
  return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";
};

const resolveApiKey = () => {
  // Prefer user's OpenAI key, fallback to forge key
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return ENV.openaiApiKey;
  }
  return ENV.forgeApiKey;
};

const resolveModel = () => {
  // Use GPT-4o-mini when using OpenAI API (directly or via forge)
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return "gpt-4o-mini";
  }
  // If forge API URL points to OpenAI, use gpt-4o-mini
  const apiUrl = ENV.forgeApiUrl || "";
  if (apiUrl.includes("openai.com")) {
    return "gpt-4o-mini";
  }
  return "gemini-2.5-flash";
};

const assertApiKey = () => {
  if (!resolveApiKey()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

/**
 * API-15: LLM provider compatibility — timeout, retry with exponential backoff,
 * thinking+tools conflict detection, json_schema provider validation.
 */
const LLM_TIMEOUT_MS = 120_000; // 2 minutes
const LLM_MAX_RETRIES = 3;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = LLM_MAX_RETRIES, timeoutMs: number = LLM_TIMEOUT_MS): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      // Retry on 429 (rate limit) and 5xx server errors
      if (response.status === 429 || (response.status >= 500 && attempt < maxRetries)) {
        const errorText = await response.text();
        console.warn(`[LLM] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${response.status} – ${errorText.substring(0, 200)}`);
        lastError = new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 16000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      return response;
    } catch (err: any) {
      if (err.name === "AbortError") {
        lastError = new Error(`LLM request timed out after ${timeoutMs}ms (attempt ${attempt + 1})`);
      } else {
        lastError = err;
      }
      console.warn(`[LLM] Attempt ${attempt + 1}/${maxRetries + 1} error:`, lastError.message);
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 16000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError || new Error("LLM invocation failed after all retries");
}

function buildPayload(params: InvokeParams, streaming: boolean = false): { payload: Record<string, unknown>; usingOpenAI: boolean } {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const usingOpenAI = !!(ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) || (ENV.forgeApiUrl || "").includes("openai.com");
  const payload: Record<string, unknown> = {
    model: resolveModel(),
    messages: messages.map(normalizeMessage),
  };

  if (streaming) {
    payload.stream = true;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = usingOpenAI ? 16384 : 32768;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  // API-15: Provider compatibility — avoid sending thinking with tools+json_schema on unsupported providers
  const hasTools = !!(tools && tools.length > 0);
  const hasJsonSchema = !!(normalizedResponseFormat && normalizedResponseFormat.type === "json_schema");

  if (!usingOpenAI) {
    // Only add thinking if no json_schema conflict (some providers don't support thinking + json_schema together)
    if (!hasJsonSchema) {
      payload.thinking = { "budget_tokens": 128 };
    }
  }

  if (normalizedResponseFormat) {
    // Some providers don't support json_schema — downgrade to json_object for OpenAI-compatible providers
    if (hasJsonSchema && usingOpenAI) {
      payload.response_format = normalizedResponseFormat;
    } else if (normalizedResponseFormat.type !== "json_schema") {
      payload.response_format = normalizedResponseFormat;
    } else {
      // Non-OpenAI provider with json_schema — downgrade to json_object
      payload.response_format = { type: "json_object" };
    }
  }

  return { payload, usingOpenAI };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const { payload } = buildPayload(params, false);

  const response = await fetchWithRetry(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolveApiKey()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

/**
 * Streaming version of invokeLLM — yields tokens via callback as they arrive.
 * Falls back to non-streaming if the API doesn't support it.
 */
export async function invokeLLMStream(
  params: InvokeParams,
  onToken: (token: string) => void,
): Promise<InvokeResult> {
  assertApiKey();

  const { payload } = buildPayload(params, true);

  const response = await fetchWithRetry(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolveApiKey()}`,
    },
    body: JSON.stringify(payload),
  }, LLM_MAX_RETRIES, LLM_TIMEOUT_MS);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM stream invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  // Parse SSE stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body for streaming");
  }

  const decoder = new TextDecoder();
  let fullContent = "";
  let toolCalls: ToolCall[] = [];
  let finishReason: string | null = null;
  let model = "";
  let id = "";
  let created = 0;
  let buffer = "";

  // Track tool call deltas
  const toolCallMap = new Map<number, ToolCall>();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const chunk = JSON.parse(trimmed.slice(6));
          if (chunk.id) id = chunk.id;
          if (chunk.model) model = chunk.model;
          if (chunk.created) created = chunk.created;

          const delta = chunk.choices?.[0]?.delta;
          const chunkFinish = chunk.choices?.[0]?.finish_reason;

          if (chunkFinish) finishReason = chunkFinish;

          if (delta?.content) {
            fullContent += delta.content;
            onToken(delta.content);
          }

          // Handle streaming tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallMap.has(idx)) {
                toolCallMap.set(idx, {
                  id: tc.id || `call_${Date.now()}_${idx}`,
                  type: "function" as const,
                  function: { name: tc.function?.name || "", arguments: "" },
                });
              }
              const existing = toolCallMap.get(idx)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.function.name = tc.function.name;
              if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
            }
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Convert tool call map to array
  toolCalls = Array.from(toolCallMap.values());

  // Build a standard InvokeResult
  const result: InvokeResult = {
    id,
    created,
    model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: fullContent,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      },
      finish_reason: finishReason,
    }],
  };

  return result;
}

// ============================================
// Vector Embedding Generation
// ============================================

/**
 * Generate vector embeddings for text using OpenAI-compatible embeddings API.
 * Falls back to a simple hash-based embedding if API is unavailable.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) return [];

  const apiKey = resolveApiKey();
  if (!apiKey) return fallbackEmbedding(text);

  try {
    // Determine embeddings endpoint
    let embeddingsUrl: string;
    if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
      embeddingsUrl = "https://api.openai.com/v1/embeddings";
    } else if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
      embeddingsUrl = `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/embeddings`;
    } else {
      embeddingsUrl = "https://forge.manus.im/v1/embeddings";
    }

    const response = await fetch(embeddingsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // Limit input length
        model: "text-embedding-3-small",
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      console.warn(`Embedding API returned ${response.status}, using fallback`);
      return fallbackEmbedding(text);
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
    return fallbackEmbedding(text);
  } catch (error) {
    console.warn("Embedding generation failed, using fallback:", error);
    return fallbackEmbedding(text);
  }
}

/**
 * Fallback: Generate a deterministic pseudo-embedding from text using character-level hashing.
 * This produces a 256-dimensional vector that preserves some lexical similarity.
 */
function fallbackEmbedding(text: string): number[] {
  const dimensions = 256;
  const embedding = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const idx = (charCode * 31 + i * 7) % dimensions;
    embedding[idx] += 1.0 / (1 + Math.floor(i / 10));
    // Spread influence to neighboring dimensions
    embedding[(idx + 1) % dimensions] += 0.5 / (1 + Math.floor(i / 10));
    embedding[(idx + dimensions - 1) % dimensions] += 0.3 / (1 + Math.floor(i / 10));
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }
  return embedding;
}
