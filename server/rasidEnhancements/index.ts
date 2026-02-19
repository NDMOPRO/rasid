/**
 * Rasid Enhancements v5 — Advanced Intelligence & Automation System
 * Barrel Export for all enhancement modules
 */

// Existing enhancements
export { RAGEngine, ragEngine, ConversationMemory, conversationMemory } from "./ragEngine";
export { CircuitBreaker, circuitBreaker } from "./circuitBreaker";
export { FallbackEngine } from "./fallbackEngine";
export { ChartDataEngine } from "./chartDataEngine";

// Phase 1: Core Enhancements (Issues 7-12)
export { ResponseCache, responseCache } from "./responseCache";
export { PerformanceTracker, type PerformanceMetrics } from "./performanceMetrics";
export { Guardrails, guardrails, type GuardrailResult } from "./guardrails";
export {
  formatResponse,
  convertToArabicNumerals,
  addContextualIcons,
  convertTablesToHTML,
  addSmartActionButtons,
  highlightChartReferences,
} from "./responseFormatter";
export { LearningEngine, learningEngine } from "./learningEngine";
export { EnhancedGreetings, enhancedGreetings } from "./enhancedGreetings";

// Phase 2: Advanced Intelligence
export {
  SmartChartEngine,
  smartChartEngine,
  type ChartType,
  type AdvancedChartConfig,
  type ChartRecommendation,
} from "./smartChartEngine";
export {
  RecommendationEngine,
  recommendationEngine,
  type Recommendation,
  type UserContext,
  type Pattern,
} from "./recommendationEngine";

// Phase 3: Auto-Training & Tutorials (New Requirements)
export {
  AutoTrainingSystem,
  autoTrainingSystem,
} from "./autoTrainingSystem";
export {
  InteractiveTutorialSystem,
  interactiveTutorialSystem,
  type Tutorial,
  type TutorialStep,
} from "./interactiveTutorialSystem";
export {
  ExportAndEmailSystem,
  exportAndEmailSystem,
  type ExportOptions,
  type EmailOptions,
} from "./exportAndEmailSystem";
