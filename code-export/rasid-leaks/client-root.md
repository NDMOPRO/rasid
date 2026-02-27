# rasid-leaks - client-root

> Auto-extracted source code documentation

---

## `client/index.html`

```html
<!doctype html>
<html lang="ar" dir="rtl">

  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>راصد — منصة الرصد الذكي الوطنية | مكتب إدارة البيانات الوطنية</title>
    <meta name="theme-color" content="#06b6d4" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="راصد" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Cairo:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script
      defer
      src="%VITE_ANALYTICS_ENDPOINT%/umami"
      data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"></script>
  </body>

</html>

```

---

## `client/public/.gitkeep`

```

```

---

## `client/public/__manus__/debug-collector.js`

```javascript
/**
 * Manus Debug Collector (agent-friendly)
 *
 * Captures:
 * 1) Console logs
 * 2) Network requests (fetch + XHR)
 * 3) User interactions (semantic uiEvents: click/type/submit/nav/scroll/etc.)
 *
 * Data is periodically sent to /__manus__/logs
 * Note: uiEvents are mirrored to sessionEvents for sessionReplay.log
 */
(function () {
  "use strict";

  // Prevent double initialization
  if (window.__MANUS_DEBUG_COLLECTOR__) return;

  // ==========================================================================
  // Configuration
  // ==========================================================================
  const CONFIG = {
    reportEndpoint: "/__manus__/logs",
    bufferSize: {
      console: 500,
      network: 200,
      // semantic, agent-friendly UI events
      ui: 500,
    },
    reportInterval: 2000,
    sensitiveFields: [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "cookie",
      "session",
    ],
    maxBodyLength: 10240,
    // UI event logging privacy policy:
    // - inputs matching sensitiveFields or type=password are masked by default
    // - non-sensitive inputs log up to 200 chars
    uiInputMaxLen: 200,
    uiTextMaxLen: 80,
    // Scroll throttling: minimum ms between scroll events
    scrollThrottleMs: 500,
  };

  // ==========================================================================
  // Storage
  // ==========================================================================
  const store = {
    consoleLogs: [],
    networkRequests: [],
    uiEvents: [],
    lastReportTime: Date.now(),
    lastScrollTime: 0,
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  function sanitizeValue(value, depth) {
    if (depth === void 0) depth = 0;
    if (depth > 5) return "[Max Depth]";
    if (value === null) return null;
    if (value === undefined) return undefined;

    if (typeof value === "string") {
      return value.length > 1000 ? value.slice(0, 1000) + "...[truncated]" : value;
    }

    if (typeof value !== "object") return value;

    if (Array.isArray(value)) {
      return value.slice(0, 100).map(function (v) {
        return sanitizeValue(v, depth + 1);
      });
    }

    var sanitized = {};
    for (var k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        var isSensitive = CONFIG.sensitiveFields.some(function (f) {
          return k.toLowerCase().indexOf(f) !== -1;
        });
        if (isSensitive) {
          sanitized[k] = "[REDACTED]";
        } else {
          sanitized[k] = sanitizeValue(value[k], depth + 1);
        }
      }
    }
    return sanitized;
  }

  function formatArg(arg) {
    try {
      if (arg instanceof Error) {
        return { type: "Error", message: arg.message, stack: arg.stack };
      }
      if (typeof arg === "object") return sanitizeValue(arg);
      return String(arg);
    } catch (e) {
      return "[Unserializable]";
    }
  }

  function formatArgs(args) {
    var result = [];
    for (var i = 0; i < args.length; i++) result.push(formatArg(args[i]));
    return result;
  }

  function pruneBuffer(buffer, maxSize) {
    if (buffer.length > maxSize) buffer.splice(0, buffer.length - maxSize);
  }

  function tryParseJson(str) {
    if (typeof str !== "string") return str;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  }

  // ==========================================================================
  // Semantic UI Event Logging (agent-friendly)
  // ==========================================================================

  function shouldIgnoreTarget(target) {
    try {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest(".manus-no-record");
    } catch (e) {
      return false;
    }
  }

  function compactText(s, maxLen) {
    try {
      var t = (s || "").trim().replace(/\s+/g, " ");
      if (!t) return "";
      return t.length > maxLen ? t.slice(0, maxLen) + "…" : t;
    } catch (e) {
      return "";
    }
  }

  function elText(el) {
    try {
      var t = el.innerText || el.textContent || "";
      return compactText(t, CONFIG.uiTextMaxLen);
    } catch (e) {
      return "";
    }
  }

  function describeElement(el) {
    if (!el || !(el instanceof Element)) return null;

    var getAttr = function (name) {
      return el.getAttribute(name);
    };

    var tag = el.tagName ? el.tagName.toLowerCase() : null;
    var id = el.id || null;
    var name = getAttr("name") || null;
    var role = getAttr("role") || null;
    var ariaLabel = getAttr("aria-label") || null;

    var dataLoc = getAttr("data-loc") || null;
    var testId =
      getAttr("data-testid") ||
      getAttr("data-test-id") ||
      getAttr("data-test") ||
      null;

    var type = tag === "input" ? (getAttr("type") || "text") : null;
    var href = tag === "a" ? getAttr("href") || null : null;

    // a small, stable hint for agents (avoid building full CSS paths)
    var selectorHint = null;
    if (testId) selectorHint = '[data-testid="' + testId + '"]';
    else if (dataLoc) selectorHint = '[data-loc="' + dataLoc + '"]';
    else if (id) selectorHint = "#" + id;
    else selectorHint = tag || "unknown";

    return {
      tag: tag,
      id: id,
      name: name,
      type: type,
      role: role,
      ariaLabel: ariaLabel,
      testId: testId,
      dataLoc: dataLoc,
      href: href,
      text: elText(el),
      selectorHint: selectorHint,
    };
  }

  function isSensitiveField(el) {
    if (!el || !(el instanceof Element)) return false;
    var tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag !== "input" && tag !== "textarea") return false;

    var type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "password") return true;

    var name = (el.getAttribute("name") || "").toLowerCase();
    var id = (el.id || "").toLowerCase();

    return CONFIG.sensitiveFields.some(function (f) {
      return name.indexOf(f) !== -1 || id.indexOf(f) !== -1;
    });
  }

  function getInputValueSafe(el) {
    if (!el || !(el instanceof Element)) return null;
    var tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag !== "input" && tag !== "textarea" && tag !== "select") return null;

    var v = "";
    try {
      v = el.value != null ? String(el.value) : "";
    } catch (e) {
      v = "";
    }

    if (isSensitiveField(el)) return { masked: true, length: v.length };

    if (v.length > CONFIG.uiInputMaxLen) v = v.slice(0, CONFIG.uiInputMaxLen) + "…";
    return v;
  }

  function logUiEvent(kind, payload) {
    var entry = {
      timestamp: Date.now(),
      kind: kind,
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      payload: sanitizeValue(payload),
    };
    store.uiEvents.push(entry);
    pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
  }

  function installUiEventListeners() {
    // Clicks
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("click", {
          target: describeElement(t),
          x: e.clientX,
          y: e.clientY,
        });
      },
      true
    );

    // Typing "commit" events
    document.addEventListener(
      "change",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("change", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    document.addEventListener(
      "focusin",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusin", { target: describeElement(t) });
      },
      true
    );

    document.addEventListener(
      "focusout",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusout", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    // Enter/Escape are useful for form flows & modals
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key !== "Enter" && e.key !== "Escape") return;
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("keydown", { key: e.key, target: describeElement(t) });
      },
      true
    );

    // Form submissions
    document.addEventListener(
      "submit",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("submit", { target: describeElement(t) });
      },
      true
    );

    // Throttled scroll events
    window.addEventListener(
      "scroll",
      function () {
        var now = Date.now();
        if (now - store.lastScrollTime < CONFIG.scrollThrottleMs) return;
        store.lastScrollTime = now;

        logUiEvent("scroll", {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
        });
      },
      { passive: true }
    );

    // Navigation tracking for SPAs
    function nav(reason) {
      logUiEvent("navigate", { reason: reason });
    }

    var origPush = history.pushState;
    history.pushState = function () {
      origPush.apply(this, arguments);
      nav("pushState");
    };

    var origReplace = history.replaceState;
    history.replaceState = function () {
      origReplace.apply(this, arguments);
      nav("replaceState");
    };

    window.addEventListener("popstate", function () {
      nav("popstate");
    });
    window.addEventListener("hashchange", function () {
      nav("hashchange");
    });
  }

  // ==========================================================================
  // Console Interception
  // ==========================================================================

  var originalConsole = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  ["log", "debug", "info", "warn", "error"].forEach(function (method) {
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments);

      var entry = {
        timestamp: Date.now(),
        level: method.toUpperCase(),
        args: formatArgs(args),
        stack: method === "error" ? new Error().stack : null,
      };

      store.consoleLogs.push(entry);
      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

      originalConsole[method].apply(console, args);
    };
  });

  window.addEventListener("error", function (event) {
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UncaughtError",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
        },
      ],
      stack: event.error ? event.error.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    // Mark an error moment in UI event stream for agents
    logUiEvent("error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UnhandledRejection",
          reason: reason && reason.message ? reason.message : String(reason),
          stack: reason && reason.stack ? reason.stack : null,
        },
      ],
      stack: reason && reason.stack ? reason.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    logUiEvent("unhandledrejection", {
      reason: reason && reason.message ? reason.message : String(reason),
    });
  });

  // ==========================================================================
  // Fetch Interception
  // ==========================================================================

  var originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    var startTime = Date.now();
    // Handle string, Request object, or URL object
    var url = typeof input === "string"
      ? input
      : (input && (input.url || input.href || String(input))) || "";
    var method = init.method || (input && input.method) || "GET";

    // Don't intercept internal requests
    if (url.indexOf("/__manus__/") === 0) {
      return originalFetch(input, init);
    }

    // Safely parse headers (avoid breaking if headers format is invalid)
    var requestHeaders = {};
    try {
      if (init.headers) {
        requestHeaders = Object.fromEntries(new Headers(init.headers).entries());
      }
    } catch (e) {
      requestHeaders = { _parseError: true };
    }

    var entry = {
      timestamp: startTime,
      type: "fetch",
      method: method.toUpperCase(),
      url: url,
      request: {
        headers: requestHeaders,
        body: init.body ? sanitizeValue(tryParseJson(init.body)) : null,
      },
      response: null,
      duration: null,
      error: null,
    };

    return originalFetch(input, init)
      .then(function (response) {
        entry.duration = Date.now() - startTime;

        var contentType = (response.headers.get("content-type") || "").toLowerCase();
        var contentLength = response.headers.get("content-length");

        entry.response = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: null,
        };

        // Semantic network hint for agents on failures (sync, no need to wait for body)
        if (response.status >= 400) {
          logUiEvent("network_error", {
            kind: "fetch",
            method: entry.method,
            url: entry.url,
            status: response.status,
            statusText: response.statusText,
          });
        }

        // Skip body capture for streaming responses (SSE, etc.) to avoid memory leaks
        var isStreaming = contentType.indexOf("text/event-stream") !== -1 ||
                          contentType.indexOf("application/stream") !== -1 ||
                          contentType.indexOf("application/x-ndjson") !== -1;
        if (isStreaming) {
          entry.response.body = "[Streaming response - not captured]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // Skip body capture for large responses to avoid memory issues
        if (contentLength && parseInt(contentLength, 10) > CONFIG.maxBodyLength) {
          entry.response.body = "[Response too large: " + contentLength + " bytes]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // Skip body capture for binary content types
        var isBinary = contentType.indexOf("image/") !== -1 ||
                       contentType.indexOf("video/") !== -1 ||
                       contentType.indexOf("audio/") !== -1 ||
                       contentType.indexOf("application/octet-stream") !== -1 ||
                       contentType.indexOf("application/pdf") !== -1 ||
                       contentType.indexOf("application/zip") !== -1;
        if (isBinary) {
          entry.response.body = "[Binary content: " + contentType + "]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // For text responses, clone and read body in background
        var clonedResponse = response.clone();

        // Async: read body in background, don't block the response
        clonedResponse
          .text()
          .then(function (text) {
            if (text.length <= CONFIG.maxBodyLength) {
              entry.response.body = sanitizeValue(tryParseJson(text));
            } else {
              entry.response.body = text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
            }
          })
          .catch(function () {
            entry.response.body = "[Unable to read body]";
          })
          .finally(function () {
            store.networkRequests.push(entry);
            pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          });

        // Return response immediately, don't wait for body reading
        return response;
      })
      .catch(function (error) {
        entry.duration = Date.now() - startTime;
        entry.error = { message: error.message, stack: error.stack };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        logUiEvent("network_error", {
          kind: "fetch",
          method: entry.method,
          url: entry.url,
          message: error.message,
        });

        throw error;
      });
  };

  // ==========================================================================
  // XHR Interception
  // ==========================================================================

  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._manusData = {
      method: (method || "GET").toUpperCase(),
      url: url,
      startTime: null,
    };
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;

    if (
      xhr._manusData &&
      xhr._manusData.url &&
      xhr._manusData.url.indexOf("/__manus__/") !== 0
    ) {
      xhr._manusData.startTime = Date.now();
      xhr._manusData.requestBody = body ? sanitizeValue(tryParseJson(body)) : null;

      xhr.addEventListener("load", function () {
        var contentType = (xhr.getResponseHeader("content-type") || "").toLowerCase();
        var responseBody = null;

        // Skip body capture for streaming responses
        var isStreaming = contentType.indexOf("text/event-stream") !== -1 ||
                          contentType.indexOf("application/stream") !== -1 ||
                          contentType.indexOf("application/x-ndjson") !== -1;

        // Skip body capture for binary content types
        var isBinary = contentType.indexOf("image/") !== -1 ||
                       contentType.indexOf("video/") !== -1 ||
                       contentType.indexOf("audio/") !== -1 ||
                       contentType.indexOf("application/octet-stream") !== -1 ||
                       contentType.indexOf("application/pdf") !== -1 ||
                       contentType.indexOf("application/zip") !== -1;

        if (isStreaming) {
          responseBody = "[Streaming response - not captured]";
        } else if (isBinary) {
          responseBody = "[Binary content: " + contentType + "]";
        } else {
          // Safe to read responseText for text responses
          try {
            var text = xhr.responseText || "";
            if (text.length > CONFIG.maxBodyLength) {
              responseBody = text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
            } else {
              responseBody = sanitizeValue(tryParseJson(text));
            }
          } catch (e) {
            // responseText may throw for non-text responses
            responseBody = "[Unable to read response: " + e.message + "]";
          }
        }

        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: {
            status: xhr.status,
            statusText: xhr.statusText,
            body: responseBody,
          },
          duration: Date.now() - xhr._manusData.startTime,
          error: null,
        };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        if (entry.response && entry.response.status >= 400) {
          logUiEvent("network_error", {
            kind: "xhr",
            method: entry.method,
            url: entry.url,
            status: entry.response.status,
            statusText: entry.response.statusText,
          });
        }
      });

      xhr.addEventListener("error", function () {
        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: null,
          duration: Date.now() - xhr._manusData.startTime,
          error: { message: "Network error" },
        };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        logUiEvent("network_error", {
          kind: "xhr",
          method: entry.method,
          url: entry.url,
          message: "Network error",
        });
      });
    }

    return originalXHRSend.apply(this, arguments);
  };

  // ==========================================================================
  // Data Reporting
  // ==========================================================================

  function reportLogs() {
    var consoleLogs = store.consoleLogs.splice(0);
    var networkRequests = store.networkRequests.splice(0);
    var uiEvents = store.uiEvents.splice(0);

    // Skip if no new data
    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return Promise.resolve();
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      // agent-friendly semantic events
      uiEvents: uiEvents,
    };

    return originalFetch(CONFIG.reportEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      // Put data back on failure (but respect limits)
      store.consoleLogs = consoleLogs.concat(store.consoleLogs);
      store.networkRequests = networkRequests.concat(store.networkRequests);
      store.uiEvents = uiEvents.concat(store.uiEvents);

      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
      pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
      pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
    });
  }

  // Periodic reporting
  setInterval(reportLogs, CONFIG.reportInterval);

  // Report on page unload
  window.addEventListener("beforeunload", function () {
    var consoleLogs = store.consoleLogs;
    var networkRequests = store.networkRequests;
    var uiEvents = store.uiEvents;

    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return;
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      uiEvents: uiEvents,
    };

    if (navigator.sendBeacon) {
      var payloadStr = JSON.stringify(payload);
      // sendBeacon has ~64KB limit, truncate if too large
      var MAX_BEACON_SIZE = 60000; // Leave some margin
      if (payloadStr.length > MAX_BEACON_SIZE) {
        // Prioritize: keep recent events, drop older logs
        var truncatedPayload = {
          timestamp: Date.now(),
          consoleLogs: consoleLogs.slice(-50),
          networkRequests: networkRequests.slice(-20),
          sessionEvents: uiEvents.slice(-100),
          uiEvents: uiEvents.slice(-100),
          _truncated: true,
        };
        payloadStr = JSON.stringify(truncatedPayload);
      }
      navigator.sendBeacon(CONFIG.reportEndpoint, payloadStr);
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================

  // Install semantic UI listeners ASAP
  try {
    installUiEventListeners();
  } catch (e) {
    console.warn("[Manus] Failed to install UI listeners:", e);
  }

  // Mark as initialized
  window.__MANUS_DEBUG_COLLECTOR__ = {
    version: "2.0-no-rrweb",
    store: store,
    forceReport: reportLogs,
  };

  console.debug("[Manus] Debug collector initialized (no rrweb, UI events only)");
})();

```

---

## `client/public/atlas_data.json`

> **ملف كبير (2873279 bytes) - تم تضمين أول 500 سطر فقط**

```json
{
  "summary": {
    "totalIncidents": 423,
    "totalRecords": 250585851,
    "totalPiiTypes": 100,
    "totalSectors": 41,
    "totalRegions": 15,
    "severityDistribution": {
      "متوسط": 89,
      "محدود": 58,
      "مرتفع": 144,
      "واسع النطاق": 132
    },
    "sourceDistribution": {
      "مواقع اللصق": {
        "count": 96,
        "records": 78942511
      },
      "دارك ويب": {
        "count": 143,
        "records": 105125470
      },
      "تليجرام": {
        "count": 184,
        "records": 66517870
      }
    }
  },
  "piiAtlas": [
    {
      "name": "Phone",
      "nameAr": "رقم الهاتف",
      "count": 299,
      "sensitivity": "medium",
      "topSectors": [
        {
          "sector": "القطاع الحكومي",
          "count": 36
        },
        {
          "sector": "القطاع المصرفي",
          "count": 30
        },
        {
          "sector": "قطاع الاتصالات",
          "count": 25
        },
        {
          "sector": "قطاع التقنية",
          "count": 23
        },
        {
          "sector": "القطاع الصحي",
          "count": 20
        },
        {
          "sector": "قطاع التجزئة",
          "count": 17
        },
        {
          "sector": "قطاع التأمين",
          "count": 17
        },
        {
          "sector": "توصيل الطعام",
          "count": 12
        },
        {
          "sector": "الرياضة والترفيه",
          "count": 12
        },
        {
          "sector": "النقل والطيران",
          "count": 11
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 63,
        "دارك ويب": 77,
        "تليجرام": 159
      },
      "severityDistribution": {
        "متوسط": 57,
        "محدود": 41,
        "واسع النطاق": 87,
        "مرتفع": 114
      }
    },
    {
      "name": "National ID",
      "nameAr": "الهوية الوطنية",
      "count": 264,
      "sensitivity": "high",
      "topSectors": [
        {
          "sector": "القطاع الحكومي",
          "count": 51
        },
        {
          "sector": "القطاع المصرفي",
          "count": 30
        },
        {
          "sector": "قطاع الاتصالات",
          "count": 25
        },
        {
          "sector": "القطاع الصحي",
          "count": 20
        },
        {
          "sector": "قطاع التأمين",
          "count": 17
        },
        {
          "sector": "التوظيف والموارد البشرية",
          "count": 12
        },
        {
          "sector": "البناء والمشاريع الكبرى",
          "count": 11
        },
        {
          "sector": "التقنية المالية",
          "count": 10
        },
        {
          "sector": "الرياضة والترفيه",
          "count": 10
        },
        {
          "sector": "النقل والطيران",
          "count": 9
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 41,
        "دارك ويب": 87,
        "تليجرام": 136
      },
      "severityDistribution": {
        "مرتفع": 101,
        "محدود": 24,
        "واسع النطاق": 110,
        "متوسط": 29
      }
    },
    {
      "name": "Email",
      "nameAr": "البريد الإلكتروني",
      "count": 213,
      "sensitivity": "medium",
      "topSectors": [
        {
          "sector": "القطاع الحكومي",
          "count": 37
        },
        {
          "sector": "قطاع التقنية",
          "count": 23
        },
        {
          "sector": "القطاع الصحي",
          "count": 20
        },
        {
          "sector": "قطاع التجزئة",
          "count": 17
        },
        {
          "sector": "الرياضة والترفيه",
          "count": 11
        },
        {
          "sector": "الاتصالات",
          "count": 10
        },
        {
          "sector": "التوظيف والموارد البشرية",
          "count": 10
        },
        {
          "sector": "توصيل الطعام",
          "count": 10
        },
        {
          "sector": "التعليم",
          "count": 10
        },
        {
          "sector": "التقنية المالية",
          "count": 9
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 58,
        "دارك ويب": 55,
        "تليجرام": 100
      },
      "severityDistribution": {
        "متوسط": 67,
        "محدود": 30,
        "مرتفع": 62,
        "واسع النطاق": 54
      }
    },
    {
      "name": "Full Name",
      "nameAr": "الاسم الكامل",
      "count": 148,
      "sensitivity": "medium",
      "topSectors": [
        {
          "sector": "البناء والمشاريع الكبرى",
          "count": 12
        },
        {
          "sector": "التعليم",
          "count": 12
        },
        {
          "sector": "التقنية المالية",
          "count": 10
        },
        {
          "sector": "الطاقة والنفط",
          "count": 9
        },
        {
          "sector": "توصيل الطعام",
          "count": 9
        },
        {
          "sector": "العقارات",
          "count": 9
        },
        {
          "sector": "البنوك والتمويل",
          "count": 9
        },
        {
          "sector": "الرياضة والترفيه",
          "count": 9
        },
        {
          "sector": "النقل والطيران",
          "count": 8
        },
        {
          "sector": "الضيافة والسياحة",
          "count": 8
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 45,
        "دارك ويب": 64,
        "تليجرام": 39
      },
      "severityDistribution": {
        "متوسط": 30,
        "مرتفع": 48,
        "واسع النطاق": 36,
        "محدود": 34
      }
    },
    {
      "name": "IBAN",
      "nameAr": "رقم الآيبان",
      "count": 94,
      "sensitivity": "high",
      "topSectors": [
        {
          "sector": "القطاع المصرفي",
          "count": 30
        },
        {
          "sector": "قطاع التجزئة",
          "count": 17
        },
        {
          "sector": "قطاع التأمين",
          "count": 17
        },
        {
          "sector": "العقارات",
          "count": 8
        },
        {
          "sector": "البنوك والتمويل",
          "count": 8
        },
        {
          "sector": "التقنية المالية",
          "count": 8
        },
        {
          "sector": "قطاع المرافق",
          "count": 6
        }
      ],
      "sourceDistribution": {
        "تليجرام": 55,
        "مواقع اللصق": 13,
        "دارك ويب": 26
      },
      "severityDistribution": {
        "واسع النطاق": 35,
        "متوسط": 24,
        "محدود": 14,
        "مرتفع": 21
      }
    },
    {
      "name": "Address",
      "nameAr": "العنوان",
      "count": 89,
      "sensitivity": "medium",
      "topSectors": [
        {
          "sector": "التعليم",
          "count": 12
        },
        {
          "sector": "توصيل الطعام",
          "count": 11
        },
        {
          "sector": "القطاع الحكومي",
          "count": 10
        },
        {
          "sector": "التوظيف والموارد البشرية",
          "count": 10
        },
        {
          "sector": "التجارة الإلكترونية",
          "count": 10
        },
        {
          "sector": "الاتصالات",
          "count": 7
        },
        {
          "sector": "البناء والمشاريع الكبرى",
          "count": 7
        },
        {
          "sector": "الرعاية الصحية",
          "count": 6
        },
        {
          "sector": "الطاقة والنفط",
          "count": 6
        },
        {
          "sector": "البنوك والتمويل",
          "count": 5
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 31,
        "دارك ويب": 40,
        "تليجرام": 18
      },
      "severityDistribution": {
        "مرتفع": 26,
        "واسع النطاق": 21,
        "متوسط": 23,
        "محدود": 19
      }
    },
    {
      "name": "Credit Card",
      "nameAr": "بطاقة الائتمان",
      "count": 35,
      "sensitivity": "high",
      "topSectors": [
        {
          "sector": "توصيل الطعام",
          "count": 12
        },
        {
          "sector": "التجارة الإلكترونية",
          "count": 8
        },
        {
          "sector": "البنوك والتمويل",
          "count": 7
        },
        {
          "sector": "الضيافة والسياحة",
          "count": 5
        },
        {
          "sector": "القطاع الخاص - التجارة الإلكترونية",
          "count": 1
        },
        {
          "sector": "القطاع الصحي - الصيدلة",
          "count": 1
        },
        {
          "sector": "القطاع الصحي - التأمين الطبي",
          "count": 1
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 13,
        "دارك ويب": 15,
        "تليجرام": 7
      },
      "severityDistribution": {
        "محدود": 11,
        "متوسط": 10,
        "مرتفع": 6,
        "واسع النطاق": 8
      }
    },
    {
      "name": "Passport Number",
      "nameAr": "رقم الجواز",
      "count": 31,
      "sensitivity": "high",
      "topSectors": [
        {
          "sector": "النقل والطيران",
          "count": 10
        },
        {
          "sector": "الضيافة والسياحة",
          "count": 10
        },
        {
          "sector": "البناء والمشاريع الكبرى",
          "count": 9
        },
        {
          "sector": "القطاع الخاص - التوظيف",
          "count": 2
        }
      ],
      "sourceDistribution": {
        "دارك ويب": 12,
        "مواقع اللصق": 9,
        "تليجرام": 10
      },
      "severityDistribution": {
        "واسع النطاق": 9,
        "مرتفع": 10,
        "محدود": 6,
        "متوسط": 6
      }
    },
    {
      "name": "Iqama",
      "nameAr": "رقم الإقامة",
      "count": 25,
      "sensitivity": "high",
      "topSectors": [
        {
          "sector": "قطاع الاتصالات",
          "count": 25
        }
      ],
      "sourceDistribution": {
        "تليجرام": 25
      },
      "severityDistribution": {
        "مرتفع": 25
      }
    },
    {
      "name": "Order History",
      "nameAr": "سجل الطلبات",
      "count": 22,
      "sensitivity": "low",
      "topSectors": [
        {
          "sector": "توصيل الطعام",
          "count": 12
        },
        {
          "sector": "التجارة الإلكترونية",
          "count": 10
        }
      ],
      "sourceDistribution": {
        "مواقع اللصق": 10,
        "دارك ويب": 7,
        "تليجرام": 5
      },
      "severityDistribution": {
        "محدود": 8,
        "متوسط": 6,
        "واسع النطاق": 5,
        "مرتفع": 3
      }
    },
    {
      "name": "Salary",

// ... (truncated - file too large)
```

---

## `client/public/evidence/REAL_070/note.txt`

```text
Evidence images for NEOM - search manually on:
  - https://www.google.com/search?q=NEOM data breach ransomware leak&tbm=isch
  - https://www.google.com/search?q=NEOM hack ransomware screenshot&tbm=isch
  - https://www.google.com/search?q=NEOM cyber attack evidence&tbm=isch

```

---

## `client/public/evidence/REAL_078/note.txt`

```text
Evidence images for Saudi Healthcare Provider - search manually on:
  - https://www.google.com/search?q=Saudi healthcare data breach leak dark web&tbm=isch
  - https://www.google.com/search?q=Saudi hospital data leak screenshot&tbm=isch
  - https://www.google.com/search?q=healthcare breach Saudi evidence&tbm=isch

```

---

## `client/public/evidence/REAL_079/note.txt`

```text
Evidence images for Multiple Saudi Organizations - search manually on:
  - https://www.google.com/search?q=Saudi organizations data breach multiple leak&tbm=isch
  - https://www.google.com/search?q=Saudi data breach multiple organizations&tbm=isch
  - https://www.google.com/search?q=Saudi cyber attack evidence&tbm=isch

```

---

## `client/public/evidence/REAL_084/note.txt`

```text
Evidence images for Saudi Government Healthcare - search manually on:
  - https://www.google.com/search?q=Saudi government healthcare data breach&tbm=isch
  - https://www.google.com/search?q=Saudi health ministry data breach&tbm=isch
  - https://www.google.com/search?q=Saudi MOH cyber attack&tbm=isch

```

---

## `client/public/evidence/REAL_086/note.txt`

```text
Evidence images for Saudi Government Postal System - search manually on:
  - https://www.google.com/search?q=Saudi postal system data breach SPL&tbm=isch
  - https://www.google.com/search?q=Saudi post SPL data breach&tbm=isch
  - https://www.google.com/search?q=Saudi postal hack evidence&tbm=isch

```

---

## `client/public/evidence/REAL_087/note.txt`

```text
Evidence images for Riyadh Airports Company - search manually on:
  - https://www.google.com/search?q=Riyadh airports RAC data breach cyber attack&tbm=isch
  - https://www.google.com/search?q=Riyadh airport cyber attack&tbm=isch
  - https://www.google.com/search?q=RAC Saudi airport breach&tbm=isch

```

---

## `client/public/evidence/REAL_093/note.txt`

```text
Evidence images for Ministry of Foreign Affairs - search manually on:
  - https://www.google.com/search?q=Saudi MOFA Ministry Foreign Affairs data breach&tbm=isch
  - https://www.google.com/search?q=Saudi foreign ministry hack&tbm=isch
  - https://www.google.com/search?q=MOFA Saudi cyber attack&tbm=isch

```

---

## `client/public/evidence/REAL_094/note.txt`

```text
Evidence images for Ministry of Industry - search manually on:
  - https://www.google.com/search?q=Saudi Ministry Industry Mineral Resources breach&tbm=isch
  - https://www.google.com/search?q=Saudi industry ministry breach&tbm=isch
  - https://www.google.com/search?q=MIM Saudi hack&tbm=isch

```

---

## `client/public/evidence/REAL_103/note.txt`

```text
Evidence images for Saudi Aramco - search manually on:
  - https://www.google.com/search?q=Saudi Aramco data breach leak ZeroX&tbm=isch
  - https://www.google.com/search?q=Saudi Aramco data breach 1TB ZeroX&tbm=isch
  - https://www.google.com/search?q=Aramco hack dark web&tbm=isch

```

---

## `client/public/manifest.json`

```json
{
  "name": "منصة راصد الذكي",
  "short_name": "راصد",
  "description": "منصة راصد الذكي لرصد التسريبات ومراقبة امتثال الخصوصية - الهيئة الوطنية لإدارة الطوارئ",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0a0e1a",
  "theme_color": "#06b6d4",
  "lang": "ar",
  "dir": "rtl",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "utilities", "government"],
  "screenshots": [],
  "prefer_related_applications": false
}

```

---

## `client/public/sw.js`

```javascript
/**
 * Service Worker for Rasid Smart Platform PWA
 * Provides offline caching and background sync capabilities.
 */

const CACHE_NAME = "rasid-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

// Install: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may fail, continue anyway
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls
  if (request.method !== "GET") return;
  if (request.url.includes("/api/") || request.url.includes("/trpc/")) return;
  if (request.url.includes("/metrics")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return the cached index page
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// Background sync for pending AI chat messages
self.addEventListener("sync", (event) => {
  if (event.tag === "rasid-chat-sync") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Retrieve pending messages from IndexedDB and send them
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_COMPLETE" });
    });
  } catch (err) {
    console.error("[SW] Sync failed:", err);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || "إشعار جديد من راصد",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      dir: "rtl",
      lang: "ar",
      data: data.url || "/",
      actions: data.actions || [],
    };
    event.waitUntil(
      self.registration.showNotification(data.title || "راصد الذكي", options)
    );
  } catch {
    // Ignore malformed push data
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

```

---

