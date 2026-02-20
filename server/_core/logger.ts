/**
 * Logger — Structured logging with Winston-compatible API.
 * 
 * Uses console-based logging with structured JSON format.
 * Can be upgraded to full Winston when the dependency is available.
 */

type LogLevel = "error" | "warn" | "info" | "debug" | "verbose";

interface LogMeta {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  meta?: LogMeta;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  error: "\x1b[31m",   // Red
  warn: "\x1b[33m",    // Yellow
  info: "\x1b[36m",    // Cyan
  verbose: "\x1b[35m", // Magenta
  debug: "\x1b[90m",   // Gray
};

const RESET = "\x1b[0m";

class Logger {
  private service: string;
  private level: LogLevel;
  private logHistory: LogEntry[] = [];
  private maxHistory = 1000;

  constructor(service = "rasid", level?: LogLevel) {
    this.service = service;
    this.level = level || (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  private formatEntry(level: LogLevel, message: string, meta?: LogMeta): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      meta,
    };
  }

  private output(entry: LogEntry) {
    // Store in history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift();
    }

    // Console output with color
    const color = LOG_COLORS[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET}`;
    const time = `\x1b[90m${entry.timestamp}${RESET}`;
    const svc = `\x1b[90m[${entry.service}]${RESET}`;
    const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";

    const method = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log";
    console[method](`${time} ${prefix} ${svc} ${entry.message}${metaStr}`);
  }

  error(message: string, meta?: LogMeta) {
    if (this.shouldLog("error")) this.output(this.formatEntry("error", message, meta));
  }

  warn(message: string, meta?: LogMeta) {
    if (this.shouldLog("warn")) this.output(this.formatEntry("warn", message, meta));
  }

  info(message: string, meta?: LogMeta) {
    if (this.shouldLog("info")) this.output(this.formatEntry("info", message, meta));
  }

  verbose(message: string, meta?: LogMeta) {
    if (this.shouldLog("verbose")) this.output(this.formatEntry("verbose", message, meta));
  }

  debug(message: string, meta?: LogMeta) {
    if (this.shouldLog("debug")) this.output(this.formatEntry("debug", message, meta));
  }

  /** Create a child logger with a different service name */
  child(service: string): Logger {
    return new Logger(`${this.service}:${service}`, this.level);
  }

  /** Get recent log entries */
  getHistory(count = 100, level?: LogLevel): LogEntry[] {
    let entries = this.logHistory;
    if (level) {
      entries = entries.filter(e => e.level === level);
    }
    return entries.slice(-count);
  }

  /** Clear log history */
  clearHistory() {
    this.logHistory = [];
  }
}

// Singleton logger instances
export const logger = new Logger("rasid");
export const aiLogger = new Logger("rasid:ai");
export const dbLogger = new Logger("rasid:db");
export const authLogger = new Logger("rasid:auth");
export const apiLogger = new Logger("rasid:api");

export default logger;
