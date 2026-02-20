/**
 * Infrastructure — Central export for all infrastructure modules.
 * Import from './_core/infrastructure' for clean server-side imports.
 */

export { cache } from "./cache";
export { logger, aiLogger, dbLogger, authLogger, apiLogger } from "./logger";
export {
  registry,
  metricsMiddleware,
  registerMetricsEndpoint,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  aiRequestsTotal,
  aiResponseDuration,
  aiToolCalls,
  dbQueriesTotal,
  dbQueryDuration,
  cacheHits,
  cacheMisses,
} from "./metrics";
export {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  getUserCredentials,
  removeCredential,
} from "./webauthn";
