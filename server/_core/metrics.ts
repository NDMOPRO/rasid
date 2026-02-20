/**
 * Metrics — Prometheus-compatible metrics collection.
 * 
 * Collects counters, gauges, and histograms for monitoring.
 * Exposes /metrics endpoint in Prometheus text format.
 */

import type { Express, Request, Response } from "express";

// ============================================
// Metric Types
// ============================================

interface CounterMetric {
  type: "counter";
  name: string;
  help: string;
  value: number;
  labels: Record<string, number>;
}

interface GaugeMetric {
  type: "gauge";
  name: string;
  help: string;
  value: number;
}

interface HistogramMetric {
  type: "histogram";
  name: string;
  help: string;
  buckets: number[];
  counts: number[];
  sum: number;
  count: number;
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

// ============================================
// Metrics Registry
// ============================================

class MetricsRegistry {
  private metrics = new Map<string, Metric>();
  private startTime = Date.now();

  /** Create or get a counter */
  counter(name: string, help: string): { inc: (labels?: Record<string, string>, value?: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { type: "counter", name, help, value: 0, labels: {} });
    }
    return {
      inc: (labels?: Record<string, string>, value = 1) => {
        const metric = this.metrics.get(name) as CounterMetric;
        metric.value += value;
        if (labels) {
          const key = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(",");
          metric.labels[key] = (metric.labels[key] || 0) + value;
        }
      },
    };
  }

  /** Create or get a gauge */
  gauge(name: string, help: string): { set: (value: number) => void; inc: (value?: number) => void; dec: (value?: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { type: "gauge", name, help, value: 0 });
    }
    return {
      set: (value: number) => {
        (this.metrics.get(name) as GaugeMetric).value = value;
      },
      inc: (value = 1) => {
        (this.metrics.get(name) as GaugeMetric).value += value;
      },
      dec: (value = 1) => {
        (this.metrics.get(name) as GaugeMetric).value -= value;
      },
    };
  }

  /** Create or get a histogram */
  histogram(name: string, help: string, buckets = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]): { observe: (value: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        type: "histogram",
        name,
        help,
        buckets,
        counts: new Array(buckets.length + 1).fill(0),
        sum: 0,
        count: 0,
      });
    }
    return {
      observe: (value: number) => {
        const metric = this.metrics.get(name) as HistogramMetric;
        metric.sum += value;
        metric.count++;
        for (let i = 0; i < metric.buckets.length; i++) {
          if (value <= metric.buckets[i]) {
            metric.counts[i]++;
          }
        }
        metric.counts[metric.buckets.length]++; // +Inf bucket
      },
    };
  }

  /** Export all metrics in Prometheus text format */
  toPrometheusText(): string {
    const lines: string[] = [];

    // Process uptime
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    lines.push("# HELP rasid_uptime_seconds Process uptime in seconds");
    lines.push("# TYPE rasid_uptime_seconds gauge");
    lines.push(`rasid_uptime_seconds ${uptimeSeconds.toFixed(1)}`);
    lines.push("");

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      if (metric.type === "counter") {
        if (Object.keys(metric.labels).length > 0) {
          for (const [labels, value] of Object.entries(metric.labels)) {
            lines.push(`${metric.name}{${labels}} ${value}`);
          }
        } else {
          lines.push(`${metric.name} ${metric.value}`);
        }
      } else if (metric.type === "gauge") {
        lines.push(`${metric.name} ${metric.value}`);
      } else if (metric.type === "histogram") {
        for (let i = 0; i < metric.buckets.length; i++) {
          lines.push(`${metric.name}_bucket{le="${metric.buckets[i]}"} ${metric.counts[i]}`);
        }
        lines.push(`${metric.name}_bucket{le="+Inf"} ${metric.counts[metric.buckets.length]}`);
        lines.push(`${metric.name}_sum ${metric.sum}`);
        lines.push(`${metric.name}_count ${metric.count}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}

// ============================================
// Global Registry & Pre-defined Metrics
// ============================================

export const registry = new MetricsRegistry();

// HTTP request metrics
export const httpRequestsTotal = registry.counter("rasid_http_requests_total", "Total HTTP requests");
export const httpRequestDuration = registry.histogram("rasid_http_request_duration_seconds", "HTTP request duration in seconds");
export const activeConnections = registry.gauge("rasid_active_connections", "Number of active connections");

// AI metrics
export const aiRequestsTotal = registry.counter("rasid_ai_requests_total", "Total AI chat requests");
export const aiResponseDuration = registry.histogram("rasid_ai_response_duration_seconds", "AI response generation time");
export const aiToolCalls = registry.counter("rasid_ai_tool_calls_total", "Total AI tool invocations");

// Database metrics
export const dbQueriesTotal = registry.counter("rasid_db_queries_total", "Total database queries");
export const dbQueryDuration = registry.histogram("rasid_db_query_duration_seconds", "Database query duration");

// Cache metrics
export const cacheHits = registry.counter("rasid_cache_hits_total", "Cache hit count");
export const cacheMisses = registry.counter("rasid_cache_misses_total", "Cache miss count");

// ============================================
// Express Middleware & Endpoint
// ============================================

/** Express middleware to track request metrics */
export function metricsMiddleware(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  activeConnections.inc();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, status: String(res.statusCode), path: req.route?.path || req.path });
    httpRequestDuration.observe(duration);
    activeConnections.dec();
  });

  next();
}

/** Register /metrics endpoint */
export function registerMetricsEndpoint(app: Express) {
  app.get("/metrics", (_req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(registry.toPrometheusText());
  });
}

export default registry;
