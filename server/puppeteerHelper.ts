/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Puppeteer Helper v2.0 — RASID National Privacy Monitoring             ║
 * ║  المساعد المتقدم للمتصفح بدون واجهة                                    ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Changelog v2.0:                                                       ║
 * ║  - Human Behavior Simulation (mouse, scroll, typing, random delays)    ║
 * ║  - Advanced Stealth (webdriver hide, fingerprint spoof, timezone)       ║
 * ║  - Cookie Dismiss before Screenshot (fix from error analysis)          ║
 * ║  - DOM Stability Check before capture (wait for mutations to settle)   ║
 * ║  - Accordion/Expandable auto-open before capture                       ║
 * ║  - Viewport Enforcement (1920x1080 always for screenshots)             ║
 * ║  - Full Page Screenshot option                                         ║
 * ║  - Lazy Content Scroll Trigger (scroll to load lazy images)            ║
 * ║  - Retry Screenshot after dismiss                                      ║
 * ║  - Shadow DOM scanning for privacy links                               ║
 * ║  - JSON-LD structured data scanning                                    ║
 * ║  - Raw HTML preservation for archival                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// Dynamic import - puppeteer may not be available in all environments
let puppeteer: any;
try {
  puppeteer = await import('puppeteer');
  puppeteer = puppeteer.default || puppeteer;
} catch {
  console.warn('[PuppeteerHelper] puppeteer not available, using fetch fallback');
}
type Browser = any;
type Page = any;

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════════════════
// SECTION 1: Browser Pool Management
// ══════════════════════════════════════════════════════════════════════════

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
const MAX_PAGES = 5;
let activePages = 0;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5',
];

const SCREENSHOT_VIEWPORT = { width: 1920, height: 1080 };

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
];

async function getBrowser(): Promise<Browser> {
  if (!puppeteer) {
    throw new Error('Puppeteer not available in this environment');
  }
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }
  // تحديد مسار Chromium من متغيرات البيئة أو المسار الافتراضي
  const execPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROMIUM_PATH || '/usr/bin/chromium';
  console.log(`[PuppeteerHelper] Launching browser with executablePath: ${execPath}`);
  browserLaunchPromise = puppeteer.launch({
    headless: true,
    executablePath: execPath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--no-first-run',
      '--single-process',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--lang=en-US,en,ar',
      '--window-size=1920,1080',
    ],
  }).then((b: Browser) => {
    browserInstance = b;
    browserLaunchPromise = null;
    b.on('disconnected', () => { browserInstance = null; });
    return b;
  }).catch((err: any) => {
    browserLaunchPromise = null;
    throw err;
  });
  return browserLaunchPromise;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try { await browserInstance.close(); } catch (_) {}
    browserInstance = null;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 2: Advanced Stealth Mode
// ══════════════════════════════════════════════════════════════════════════

async function applyStealthMode(page: Page): Promise<void> {
  // Hide navigator.webdriver
  await page.evaluateOnNewDocument(() => {
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // Fake plugins array
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' },
      ],
    });

    // Fake languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'ar'],
    });

    // Fake hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });

    // Fake device memory
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

    // Override permissions query
    const originalQuery = window.navigator.permissions.query;
    (window.navigator.permissions as any).query = (parameters: any) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission } as any)
        : originalQuery(parameters);

    // Fake Chrome runtime
    (window as any).chrome = {
      runtime: { connect: () => {}, sendMessage: () => {} },
      loadTimes: () => ({
        requestTime: Date.now() / 1000,
        startLoadTime: Date.now() / 1000,
        commitLoadTime: Date.now() / 1000,
        finishDocumentLoadTime: Date.now() / 1000,
        finishLoadTime: Date.now() / 1000,
        firstPaintTime: Date.now() / 1000,
        firstPaintAfterLoadTime: 0,
        navigationType: 'Other',
        wasFetchedViaSpdy: false,
        wasNpnNegotiated: false,
        npnNegotiatedProtocol: 'unknown',
        wasAlternateProtocolAvailable: false,
        connectionInfo: 'h2',
      }),
      csi: () => ({ startE: Date.now(), onloadT: Date.now() }),
    };

    // Spoof canvas fingerprint (add tiny noise)
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type?: string) {
      if (this.width > 16 && this.height > 16) {
        const ctx = this.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, 1, 1);
          imageData.data[0] = imageData.data[0] ^ 1; // tiny noise
          ctx.putImageData(imageData, 0, 0);
        }
      }
      return origToDataURL.apply(this, arguments as any);
    };

    // Spoof WebGL renderer
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter: number) {
      if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
      return getParameter.call(this, parameter);
    };

    // Fake connection info
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        rtt: 50,
        downlink: 10,
        saveData: false,
      }),
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 3: Human Behavior Simulation
// ══════════════════════════════════════════════════════════════════════════

/** Random delay between min and max ms */
function randomDelay(min: number, max: number): Promise<void> {
  return delay(min + Math.random() * (max - min));
}

/** Simulate natural mouse movement using Bezier curves */
async function simulateMouseMovement(page: Page): Promise<void> {
  try {
    const width = 1920;
    const height = 1080;
    // Move to 3-5 random points with natural curves
    const points = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < points; i++) {
      const x = 100 + Math.random() * (width - 200);
      const y = 100 + Math.random() * (height - 200);
      await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 20) });
      await randomDelay(100, 400);
    }
  } catch (_) {}
}

/** Simulate natural scrolling behavior */
async function simulateNaturalScroll(page: Page): Promise<void> {
  try {
    // Scroll down gradually like a human reading
    const scrollSteps = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < scrollSteps; i++) {
      const scrollAmount = 200 + Math.floor(Math.random() * 400);
      await page.evaluate((amount: number) => {
        window.scrollBy({ top: amount, behavior: 'smooth' });
      }, scrollAmount);
      await randomDelay(500, 1500);
    }
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await delay(500);
  } catch (_) {}
}

/** Trigger lazy loading by scrolling through the page */
async function triggerLazyContent(page: Page): Promise<void> {
  try {
    await page.evaluate(async () => {
      const totalHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      let scrolled = 0;
      while (scrolled < totalHeight) {
        window.scrollBy(0, viewportHeight / 2);
        scrolled += viewportHeight / 2;
        await new Promise(r => setTimeout(r, 200));
      }
      // Scroll back to top
      window.scrollTo(0, 0);
    });
    await delay(1000);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 4: Cookie Consent Auto-Dismiss (Enhanced)
// ══════════════════════════════════════════════════════════════════════════

const COOKIE_SELECTORS = [
  // Common cookie consent buttons
  '[id*="cookie"] button[class*="accept"]',
  '[id*="cookie"] button[class*="agree"]',
  '[class*="cookie"] button[class*="accept"]',
  '[class*="cookie"] button[class*="agree"]',
  '[id*="consent"] button[class*="accept"]',
  '[class*="consent"] button[class*="accept"]',
  // OneTrust
  '#onetrust-accept-btn-handler',
  '.onetrust-close-btn-handler',
  // CookieBot
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '#CybotCookiebotDialogBodyButtonAccept',
  // Quantcast
  '.qc-cmp2-summary-buttons button[mode="primary"]',
  // Osano
  '.osano-cm-accept-all',
  '.osano-cm-dialog__close',
  // Termly
  '.t-acceptAllButton',
  '[data-tid="banner-accept"]',
  // Iubenda
  '.iubenda-cs-accept-btn',
  // Didomi
  '#didomi-notice-agree-button',
  // Complianz
  '.cmplz-accept',
  '.cmplz-btn.cmplz-accept',
  // Generic patterns
  'button[data-cookiefirst-action="accept"]',
  '[data-testid="cookie-accept"]',
  '.cc-btn.cc-allow',
  '.cc-accept',
  '#accept-cookies',
  '#acceptCookies',
  '.accept-cookies',
  '#cookie-accept',
  '.cookie-accept-btn',
  '.cookie-notice-accept',
  '.gdpr-accept',
  '#gdpr-accept',
  // Close buttons for cookie banners
  '[class*="cookie"] [class*="close"]',
  '[id*="cookie"] [class*="close"]',
  '[class*="consent"] [class*="close"]',
  // Arabic patterns
  'button:has-text("قبول")',
  'button:has-text("موافق")',
  'button:has-text("أوافق")',
  'button:has-text("قبول الكل")',
  'button:has-text("موافقة")',
];

/** Dismiss cookie consent banners - enhanced with multiple strategies */
async function dismissCookieConsent(page: Page): Promise<boolean> {
  let dismissed = false;

  // Strategy 1: Try CSS selectors
  for (const selector of COOKIE_SELECTORS) {
    try {
      const btn = await page.$(selector);
      if (btn) {
        const isVisible = await page.evaluate((el: any) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 &&
                 style.display !== 'none' && style.visibility !== 'hidden' &&
                 style.opacity !== '0';
        }, btn);
        if (isVisible) {
          await btn.click();
          await delay(500);
          dismissed = true;
          break;
        }
      }
    } catch (_) {}
  }

  // Strategy 2: Try clicking by text content
  if (!dismissed) {
    try {
      dismissed = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"], span[onclick], div[onclick]'));
        const acceptTexts = [
          'accept', 'agree', 'allow', 'ok', 'got it', 'i understand', 'continue',
          'dismiss', 'close', 'accept all', 'allow all', 'accept cookies',
          'قبول', 'موافق', 'أوافق', 'قبول الكل', 'موافقة', 'إغلاق',
        ];
        for (const btn of buttons) {
          const text = (btn as HTMLElement).innerText?.toLowerCase().trim();
          if (text && text.length < 50 && acceptTexts.some(t => text.includes(t))) {
            (btn as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
    } catch (_) {}
  }

  // Strategy 3: Remove cookie overlays via DOM manipulation
  if (!dismissed) {
    try {
      await page.evaluate(() => {
        const overlaySelectors = [
          '[class*="cookie-overlay"]', '[class*="cookie-banner"]', '[class*="cookie-notice"]',
          '[class*="consent-overlay"]', '[class*="consent-banner"]', '[class*="gdpr-overlay"]',
          '[class*="privacy-overlay"]', '#cookie-law-info-bar', '.cc-window', '.cc-banner',
          '[id*="cookie-notice"]', '[id*="cookie-banner"]', '[id*="consent-banner"]',
        ];
        for (const sel of overlaySelectors) {
          document.querySelectorAll(sel).forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
        // Also remove any full-screen overlays blocking content
        document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]').forEach(el => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.3) {
            const text = (el as HTMLElement).innerText?.toLowerCase() || '';
            if (text.includes('cookie') || text.includes('consent') || text.includes('privacy') || text.includes('كوكي') || text.includes('موافق')) {
              (el as HTMLElement).style.display = 'none';
            }
          }
        });
      });
      dismissed = true;
    } catch (_) {}
  }

  if (dismissed) {
    await delay(500);
  }
  return dismissed;
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 5: DOM Stability Check
// ══════════════════════════════════════════════════════════════════════════

/** Wait for DOM to stabilize (no more mutations) before taking screenshot */
async function waitForDOMStability(page: Page, timeout: number = 3000): Promise<void> {
  try {
    await page.evaluate((timeoutMs: number) => {
      return new Promise<void>((resolve) => {
        let timer: any;
        let settled = false;
        const observer = new MutationObserver(() => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            settled = true;
            observer.disconnect();
            resolve();
          }, 500); // 500ms of no mutations = stable
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        // Start the initial timer
        timer = setTimeout(() => {
          if (!settled) {
            observer.disconnect();
            resolve();
          }
        }, timeoutMs);
      });
    }, timeout);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 6: Accordion/Expandable Auto-Open
// ══════════════════════════════════════════════════════════════════════════

/** Expand all accordion/collapsible sections before screenshot */
async function expandAllSections(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      // Expand <details> elements
      document.querySelectorAll('details:not([open])').forEach(el => {
        el.setAttribute('open', '');
      });

      // Click accordion triggers
      const accordionSelectors = [
        '[class*="accordion"] [class*="header"]',
        '[class*="accordion"] [class*="trigger"]',
        '[class*="accordion"] button',
        '[class*="collapse"] [class*="header"]',
        '[class*="expand"] button',
        '[data-toggle="collapse"]',
        '[aria-expanded="false"]',
        '.faq-question',
        '.toggle-header',
        '.expandable-header',
      ];
      for (const sel of accordionSelectors) {
        document.querySelectorAll(sel).forEach(el => {
          try {
            (el as HTMLElement).click();
            if (el.getAttribute('aria-expanded') === 'false') {
              el.setAttribute('aria-expanded', 'true');
            }
          } catch (_) {}
        });
      }

      // Show hidden content
      document.querySelectorAll('[style*="display: none"], [style*="display:none"]').forEach(el => {
        const parent = el.parentElement;
        if (parent && (
          parent.className.toLowerCase().includes('accordion') ||
          parent.className.toLowerCase().includes('collapse') ||
          parent.className.toLowerCase().includes('expand') ||
          parent.className.toLowerCase().includes('faq')
        )) {
          (el as HTMLElement).style.display = 'block';
        }
      });

      // Expand elements with max-height: 0
      document.querySelectorAll('[style*="max-height: 0"], [style*="max-height:0"]').forEach(el => {
        (el as HTMLElement).style.maxHeight = 'none';
        (el as HTMLElement).style.overflow = 'visible';
      });
    });
    await delay(500);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 7: Shadow DOM Scanning
// ══════════════════════════════════════════════════════════════════════════

/** Scan Shadow DOM for privacy links */
async function scanShadowDOM(page: Page): Promise<Array<{ url: string; text: string; strategy: string }>> {
  try {
    return await page.evaluate(() => {
      const links: Array<{ url: string; text: string; strategy: string }> = [];
      const privacyPatterns = [/privacy/i, /خصوصية/i, /سياسة.*خصوصية/i, /حماية.*بيانات/i, /data.*protect/i];
      const urlPatterns = [/privacy/i, /data-protection/i, /pdpl/i];

      function scanShadowRoot(root: ShadowRoot | Document) {
        const allLinks = root.querySelectorAll('a[href]');
        allLinks.forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLElement).innerText?.trim() || '';
          if (privacyPatterns.some(p => p.test(text)) || urlPatterns.some(p => p.test(href))) {
            links.push({ url: href, text: text || href, strategy: 'shadow-dom' });
          }
        });
      }

      // Recursively scan all shadow roots
      function walkDOM(node: Element) {
        if (node.shadowRoot) {
          scanShadowRoot(node.shadowRoot);
          node.shadowRoot.querySelectorAll('*').forEach(child => walkDOM(child));
        }
        node.querySelectorAll('*').forEach(child => walkDOM(child));
      }

      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          scanShadowRoot(el.shadowRoot);
          el.shadowRoot.querySelectorAll('*').forEach(child => walkDOM(child));
        }
      });

      return links;
    });
  } catch (_) {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 8: JSON-LD Structured Data Scanning
// ══════════════════════════════════════════════════════════════════════════

/** Extract privacy-related URLs from JSON-LD structured data */
async function scanJSONLD(page: Page): Promise<Array<{ url: string; text: string; strategy: string }>> {
  try {
    return await page.evaluate(() => {
      const links: Array<{ url: string; text: string; strategy: string }> = [];
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const privacyKeys = ['privacyPolicy', 'privacy', 'dataProtection', 'termsOfService'];

      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          function searchObj(obj: any, depth: number = 0) {
            if (depth > 5 || !obj || typeof obj !== 'object') return;
            for (const [key, value] of Object.entries(obj)) {
              if (typeof value === 'string' && privacyKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase()))) {
                if (value.startsWith('http')) {
                  links.push({ url: value, text: `JSON-LD: ${key}`, strategy: 'json-ld' });
                }
              }
              if (typeof value === 'object') {
                searchObj(value, depth + 1);
              }
            }
          }
          if (Array.isArray(data)) {
            data.forEach(item => searchObj(item));
          } else {
            searchObj(data);
          }
        } catch (_) {}
      });

      return links;
    });
  } catch (_) {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 9: Enhanced Screenshot Capture
// ══════════════════════════════════════════════════════════════════════════

interface ScreenshotOptions {
  fullPage?: boolean;
  dismissCookies?: boolean;
  expandAccordions?: boolean;
  triggerLazy?: boolean;
  waitForStability?: boolean;
  retryAfterDismiss?: boolean;
}

/** Take a high-quality screenshot with all fixes applied */
async function takeEnhancedScreenshot(
  page: Page,
  options: ScreenshotOptions = {}
): Promise<Buffer | undefined> {
  const {
    fullPage = false,
    dismissCookies = true,
    expandAccordions = true,
    triggerLazy = true,
    waitForStability = true,
    retryAfterDismiss = true,
  } = options;

  try {
    // Step 1: Enforce viewport for consistent screenshots
    await page.setViewport(SCREENSHOT_VIEWPORT);

    // Step 2: Re-enable images (they may have been blocked for speed)
    try {
      await page.setRequestInterception(false);
    } catch (_) {}

    // Step 3: Trigger lazy content loading by scrolling
    if (triggerLazy) {
      await triggerLazyContent(page);
    }

    // Step 4: Dismiss cookie banners
    if (dismissCookies) {
      await dismissCookieConsent(page);
      await delay(300);
    }

    // Step 5: Expand accordions/collapsibles
    if (expandAccordions) {
      await expandAllSections(page);
    }

    // Step 6: Wait for DOM to stabilize
    if (waitForStability) {
      await waitForDOMStability(page, 3000);
    }

    // Step 7: Wait a bit more for any animations to complete
    await delay(500);

    // Step 8: Take the screenshot
    let screenshot: Buffer;
    if (fullPage) {
      screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
      });
    } else {
      screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: SCREENSHOT_VIEWPORT.width, height: SCREENSHOT_VIEWPORT.height },
      });
    }

    // Step 9: Retry if screenshot might have cookie overlay
    if (retryAfterDismiss) {
      const hasOverlay = await page.evaluate(() => {
        const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        for (const el of fixedElements) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width > window.innerWidth * 0.4 && rect.height > window.innerHeight * 0.2) {
            return true;
          }
        }
        return false;
      });

      if (hasOverlay) {
        // Force remove overlays and retry
        await page.evaluate(() => {
          document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]').forEach(el => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            if (rect.width > window.innerWidth * 0.4 && rect.height > window.innerHeight * 0.2) {
              (el as HTMLElement).style.display = 'none';
            }
          });
        });
        await delay(300);

        // Retake screenshot
        if (fullPage) {
          screenshot = await page.screenshot({ type: 'png', fullPage: true });
        } else {
          screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            clip: { x: 0, y: 0, width: SCREENSHOT_VIEWPORT.width, height: SCREENSHOT_VIEWPORT.height },
          });
        }
      }
    }

    return screenshot;
  } catch (err) {
    console.warn('[PuppeteerHelper] Screenshot failed:', (err as any)?.message);
    return undefined;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 10: Privacy Link Discovery in Rendered DOM (Enhanced)
// ══════════════════════════════════════════════════════════════════════════

const PRIVACY_LINK_PATTERNS = [
  /privacy/i, /خصوصية/i, /سياسة.*خصوصية/i, /حماية.*بيانات/i,
  /data.*protect/i, /datenschutz/i, /privacidade/i, /confidentialit/i,
  /riservatezza/i, /privacidad/i, /개인정보/i, /プライバシー/i,
  /隐私/i, /конфиденциальност/i, /gizlilik/i, /privasi/i,
];

export interface PuppeteerScanResult {
  html: string;
  rawHtml: string;  // Raw HTML preserved for archival
  text: string;
  title: string;
  url: string;
  finalUrl: string;
  screenshot?: Buffer;
  privacyLinks: Array<{ url: string; text: string; strategy: string }>;
  isSPA: boolean;
  jsFramework: string | null;
  loadTime: number;
  statusCode: number;
  cookies: Array<{ name: string; domain: string }>;
  jsonLdData: Array<{ url: string; text: string; strategy: string }>;
  shadowDomLinks: Array<{ url: string; text: string; strategy: string }>;
  error?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 11: Main Scan Function (Enhanced)
// ══════════════════════════════════════════════════════════════════════════

export async function scanWithPuppeteer(
  url: string,
  options: {
    timeout?: number;
    waitForSelector?: string;
    takeScreenshot?: boolean;
    extractPrivacyLinks?: boolean;
    waitForNetworkIdle?: boolean;
    simulateHuman?: boolean;
    fullPageScreenshot?: boolean;
  } = {}
): Promise<PuppeteerScanResult> {
  const {
    timeout = 30000,
    takeScreenshot = true,
    extractPrivacyLinks = true,
    waitForNetworkIdle = true,
    simulateHuman = true,
    fullPageScreenshot = false,
  } = options;

  let page: Page | null = null;
  const startTime = Date.now();
  let statusCode = 0;

  // Wait for available slot
  while (activePages >= MAX_PAGES) {
    await new Promise(r => setTimeout(r, 500));
  }
  activePages++;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Apply stealth mode
    await applyStealthMode(page);

    // Set random UA and viewport
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const vp = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
    await page.setUserAgent(ua);
    await page.setViewport(vp);
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    });

    // Set timezone to match Saudi Arabia
    await page.emulateTimezone('Asia/Riyadh');

    // Block heavy resources for faster loading (except when taking screenshots)
    if (!takeScreenshot) {
      await page.setRequestInterception(true);
      page.on('request', (req: any) => {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    // Track status code
    page.on('response', (res: any) => {
      if (res.url() === url || res.url().replace(/\/$/, '') === url.replace(/\/$/, '')) {
        statusCode = res.status();
      }
    });

    // Navigate
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await page.goto(normalizedUrl, {
      waitUntil: waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded',
      timeout,
    });

    if (response) {
      statusCode = response.status();
    }

    // Wait for SPA content to render
    await delay(2000);

    // Simulate human behavior
    if (simulateHuman) {
      await simulateMouseMovement(page);
      await randomDelay(300, 800);
    }

    // Dismiss cookie consent
    await dismissCookieConsent(page);

    // Detect JS framework
    const jsFramework = await page.evaluate(() => {
      if ((window as any).__NEXT_DATA__) return 'Next.js';
      if ((window as any).__NUXT__) return 'Nuxt.js';
      if (document.querySelector('[ng-version]')) return 'Angular';
      if (document.querySelector('[data-reactroot]') || document.querySelector('#__next')) return 'React';
      if ((window as any).__VUE__) return 'Vue.js';
      if (document.querySelector('[data-v-]')) return 'Vue.js';
      if ((window as any).Ember) return 'Ember.js';
      if ((window as any).Svelte) return 'Svelte';
      if ((window as any).gatsby) return 'Gatsby';
      if ((window as any).__remixContext) return 'Remix';
      return null;
    });

    const isSPA = !!jsFramework;

    // Extract full rendered HTML
    const html = await page.content();
    const rawHtml = html; // Preserve raw HTML for archival
    const title = await page.title();
    const finalUrl = page.url();

    // Extract text content (main content area preferred)
    const text = await page.evaluate(() => {
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.main-content'];
      for (const sel of mainSelectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).innerText.length > 200) {
          return (el as HTMLElement).innerText;
        }
      }
      const body = document.body.cloneNode(true) as HTMLElement;
      body.querySelectorAll('nav, header, footer, script, style, noscript, svg, [role="navigation"], [role="banner"], [role="contentinfo"]').forEach(el => el.remove());
      return body.innerText || '';
    });

    // Discover privacy links in rendered DOM
    let privacyLinks: Array<{ url: string; text: string; strategy: string }> = [];
    if (extractPrivacyLinks) {
      privacyLinks = await page.evaluate(() => {
        const links: Array<{ url: string; text: string; strategy: string }> = [];
        const allLinks = Array.from(document.querySelectorAll('a[href]'));
        const privacyPatterns = [
          /privacy/i, /خصوصية/i, /سياسة.*خصوصية/i, /حماية.*بيانات/i,
          /data.*protect/i, /datenschutz/i, /privacidade/i, /confidentialit/i,
        ];
        const urlPatterns = [
          /privacy/i, /datenschutz/i, /confidentialite/i, /privacidade/i,
          /riservatezza/i, /privacidad/i, /pdpl/i, /data-protection/i,
        ];

        for (const link of allLinks) {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLElement).innerText?.trim() || '';
          const ariaLabel = link.getAttribute('aria-label') || '';

          if (privacyPatterns.some(p => p.test(text) || p.test(ariaLabel))) {
            links.push({ url: href, text, strategy: 'puppeteer-link-text' });
            continue;
          }
          if (urlPatterns.some(p => p.test(href))) {
            links.push({ url: href, text: text || href, strategy: 'puppeteer-url-pattern' });
          }
        }

        // Check footer specifically
        const footerLinks = Array.from(document.querySelectorAll('footer a[href], [role="contentinfo"] a[href]'));
        for (const link of footerLinks) {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLElement).innerText?.trim() || '';
          if (privacyPatterns.some(p => p.test(text)) || urlPatterns.some(p => p.test(href))) {
            if (!links.some(l => l.url === href)) {
              links.push({ url: href, text: text || href, strategy: 'puppeteer-footer' });
            }
          }
        }

        return links;
      });
    }

    // Scan Shadow DOM for privacy links
    const shadowDomLinks = await scanShadowDOM(page);

    // Scan JSON-LD structured data
    const jsonLdData = await scanJSONLD(page);

    // Merge all discovered links
    const allDiscoveredLinks = [...privacyLinks];
    for (const link of [...shadowDomLinks, ...jsonLdData]) {
      if (!allDiscoveredLinks.some(l => l.url === link.url)) {
        allDiscoveredLinks.push(link);
      }
    }

    // Take enhanced screenshot
    let screenshot: Buffer | undefined;
    if (takeScreenshot) {
      screenshot = await takeEnhancedScreenshot(page, {
        fullPage: fullPageScreenshot,
        dismissCookies: true,
        expandAccordions: true,
        triggerLazy: true,
        waitForStability: true,
        retryAfterDismiss: true,
      });
    }

    // Get cookies
    const cookies = (await page.cookies()).map((c: any) => ({ name: c.name, domain: c.domain }));

    const loadTime = Date.now() - startTime;

    return {
      html,
      rawHtml,
      text,
      title,
      url: normalizedUrl,
      finalUrl,
      screenshot,
      privacyLinks: allDiscoveredLinks,
      isSPA,
      jsFramework,
      loadTime,
      statusCode,
      cookies,
      jsonLdData,
      shadowDomLinks,
    };
  } catch (err: any) {
    return {
      html: '',
      rawHtml: '',
      text: '',
      title: '',
      url,
      finalUrl: url,
      privacyLinks: [],
      isSPA: false,
      jsFramework: null,
      loadTime: Date.now() - startTime,
      statusCode,
      cookies: [],
      jsonLdData: [],
      shadowDomLinks: [],
      error: err.message || 'Unknown error',
    };
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    activePages--;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 12: Fetch Privacy Page with Puppeteer (Enhanced)
// ══════════════════════════════════════════════════════════════════════════

export async function fetchPrivacyPageWithPuppeteer(
  privacyUrl: string,
  options: { timeout?: number; takeScreenshot?: boolean } = {}
): Promise<{ text: string; html: string; rawHtml: string; title: string; screenshot?: Buffer; error?: string }> {
  const { timeout = 25000, takeScreenshot = false } = options;
  let page: Page | null = null;

  while (activePages >= MAX_PAGES) {
    await new Promise(r => setTimeout(r, 500));
  }
  activePages++;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Apply stealth
    await applyStealthMode(page);

    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(ua);
    await page.setViewport(SCREENSHOT_VIEWPORT);
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
    });
    await page.emulateTimezone('Asia/Riyadh');

    // Block heavy resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      const type = req.resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const normalizedUrl = privacyUrl.startsWith('http') ? privacyUrl : `https://${privacyUrl}`;
    await page.goto(normalizedUrl, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Wait for content to render
    await delay(2000);

    // Simulate human behavior briefly
    await simulateMouseMovement(page);

    // Dismiss cookie consent
    await dismissCookieConsent(page);

    // Expand all sections (privacy pages often have accordions)
    await expandAllSections(page);

    const html = await page.content();
    const rawHtml = html;
    const title = await page.title();

    // Extract main content text with enhanced selectors
    const text = await page.evaluate(() => {
      const mainSelectors = [
        'main', 'article', '[role="main"]', '.content', '#content',
        '.main-content', '.privacy-content', '.policy-content',
        '.privacy-policy', '.terms-content', '.legal-content',
        '[class*="privacy"]', '[class*="policy"]',
      ];
      for (const sel of mainSelectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).innerText.length > 200) {
          return (el as HTMLElement).innerText;
        }
      }
      // Fallback: remove nav/header/footer
      const body = document.body.cloneNode(true) as HTMLElement;
      body.querySelectorAll('nav, header, footer, script, style, noscript, svg, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').forEach(el => el.remove());
      return body.innerText || '';
    });

    // Take screenshot if requested
    let screenshot: Buffer | undefined;
    if (takeScreenshot) {
      screenshot = await takeEnhancedScreenshot(page, {
        fullPage: true,
        dismissCookies: true,
        expandAccordions: true,
        triggerLazy: false,
        waitForStability: true,
        retryAfterDismiss: true,
      });
    }

    return { text, html, rawHtml, title, screenshot };
  } catch (err: any) {
    return { text: '', html: '', rawHtml: '', title: '', error: err.message };
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    activePages--;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 13: SPA Detection
// ══════════════════════════════════════════════════════════════════════════

export function likelyNeedsPuppeteer(html: string): boolean {
  const spaIndicators = [
    /<div id="__next">/i,
    /<div id="app">/i,
    /<div id="root">\s*<\/div>/i,
    /__NEXT_DATA__/i,
    /__NUXT__/i,
    /ng-version/i,
    /data-reactroot/i,
    /window\.__INITIAL_STATE__/i,
    /noscript.*enable javascript/i,
    /This app works best with JavaScript enabled/i,
    /يرجى تفعيل الجافاسكربت/i,
    /__remixContext/i,
    /gatsby-/i,
    /data-gatsby/i,
  ];
  return spaIndicators.some(p => p.test(html));
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION 14: Utility Exports
// ══════════════════════════════════════════════════════════════════════════

export {
  dismissCookieConsent,
  waitForDOMStability,
  expandAllSections,
  scanShadowDOM,
  scanJSONLD,
  takeEnhancedScreenshot,
  simulateMouseMovement,
  simulateNaturalScroll,
  triggerLazyContent,
  applyStealthMode,
  randomDelay,
};
