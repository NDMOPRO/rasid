/**
 * Circuit Breaker — Protection against OpenAI API failures
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  recoveryTimeout: number;     // ms to wait before trying again
  successThreshold: number;    // Successes needed to close from HALF_OPEN
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 3,
      recoveryTimeout: config?.recoveryTimeout ?? 30000, // 30 seconds
      successThreshold: config?.successThreshold ?? 2,
    };
  }

  /**
   * Check if requests are allowed through
   */
  isAllowed(): boolean {
    if (this.state === "CLOSED") return true;

    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.recoveryTimeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
        console.log("[CircuitBreaker] Transitioning to HALF_OPEN — testing recovery");
        return true;
      }
      return false;
    }

    // HALF_OPEN — allow limited requests
    return true;
  }

  /**
   * Record a successful API call
   */
  recordSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
        console.log("[CircuitBreaker] Recovery confirmed — CLOSED");
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed API call
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      console.log("[CircuitBreaker] Recovery failed — back to OPEN");
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
      console.log(`[CircuitBreaker] Threshold reached (${this.failureCount} failures) — OPEN`);
    }
  }

  /**
   * Get current state info
   */
  getStatus(): { state: CircuitState; failureCount: number; lastFailure: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailureTime,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<{ result: T; source: "api" | "fallback" }> {
    if (!this.isAllowed()) {
      console.log("[CircuitBreaker] Circuit OPEN — using fallback");
      return { result: fallback(), source: "fallback" };
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return { result, source: "api" };
    } catch (err) {
      this.recordFailure();
      console.warn("[CircuitBreaker] API call failed, using fallback:", (err as Error).message);
      return { result: fallback(), source: "fallback" };
    }
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 30000,
  successThreshold: 2,
});
