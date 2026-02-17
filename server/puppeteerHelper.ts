/**
 * Puppeteer Helper Module - Headless Browser for SPA/JavaScript Sites
 * Version: 1.0
 * 
 * Provides headless Chromium browser pool for scanning JavaScript-heavy websites
 * that cannot be properly crawled with simple HTTP fetch (SPA, Next.js, React, Angular, Vue).
 * 
 * Features:
 * - Browser pool management (reuse browsers, limit concurrency)
 * - Stealth mode (random User-Agent, viewport, language)
 * - Cookie consent auto-dismiss
 * - Wait for SPA content to load (networkidle, DOM mutations)
 * - Screenshot capture
 * - Full page HTML extraction after JS execution
 * - Privacy page discovery via rendered DOM
 * - Configurable timeouts and retry logic
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

// ── Browser Pool ──
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
const MAX_PAGES = 5; // Max concurrent pages
let activePages = 0;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
];

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
  browserLaunchPromise = puppeteer.launch({
    headless: true,
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
    ],
    timeout: 30000,
  });
  browserInstance = await browserLaunchPromise;
  browserLaunchPromise = null;
  
  browserInstance.on('disconnected', () => {
    browserInstance = null;
    activePages = 0;
  });
  
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (_) {}
    browserInstance = null;
    activePages = 0;
  }
}

// ── Cookie Consent Auto-Dismiss ──
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
  // Generic patterns
  'button[data-cookiefirst-action="accept"]',
  '[data-testid="cookie-accept"]',
  '.cc-btn.cc-allow',
  '.cc-accept',
  '#accept-cookies',
  '#acceptCookies',
  '.accept-cookies',
  'button:has-text("Accept")',
  'button:has-text("Accept All")',
  'button:has-text("I Agree")',
  'button:has-text("قبول")',
  'button:has-text("موافق")',
];

async function dismissCookieConsent(page: Page): Promise<void> {
  for (const selector of COOKIE_SELECTORS) {
    try {
      const btn = await page.$(selector);
      if (btn) {
        await btn.click();
        await delay(500);
        return;
      }
    } catch (_) {}
  }
  // Try clicking by text content
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const acceptTexts = ['accept', 'agree', 'allow', 'ok', 'got it', 'قبول', 'موافق', 'أوافق'];
      for (const btn of buttons) {
        const text = (btn as HTMLElement).innerText?.toLowerCase().trim();
        if (text && acceptTexts.some(t => text.includes(t))) {
          (btn as HTMLElement).click();
          return;
        }
      }
    });
  } catch (_) {}
}

// ── Privacy Link Discovery in Rendered DOM ──
const PRIVACY_LINK_PATTERNS = [
  /privacy/i, /خصوصية/i, /سياسة.*خصوصية/i, /حماية.*بيانات/i,
  /data.*protect/i, /datenschutz/i, /privacidade/i, /confidentialit/i,
  /riservatezza/i, /privacidad/i, /개인정보/i, /プライバシー/i,
  /隐私/i, /конфиденциальност/i, /gizlilik/i, /privasi/i,
];

export interface PuppeteerScanResult {
  html: string;
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
  error?: string;
}

export async function scanWithPuppeteer(
  url: string,
  options: {
    timeout?: number;
    waitForSelector?: string;
    takeScreenshot?: boolean;
    extractPrivacyLinks?: boolean;
    waitForNetworkIdle?: boolean;
  } = {}
): Promise<PuppeteerScanResult> {
  const {
    timeout = 30000,
    takeScreenshot = true,
    extractPrivacyLinks = true,
    waitForNetworkIdle = true,
  } = options;

  const startTime = Date.now();
  let page: Page | null = null;
  let statusCode = 0;

  // Wait for available slot
  while (activePages >= MAX_PAGES) {
    await new Promise(r => setTimeout(r, 500));
  }
  activePages++;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Stealth setup
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const vp = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
    await page.setUserAgent(ua);
    await page.setViewport(vp);
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    });

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'media', 'font'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Capture status code
    page.on('response', (res) => {
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
      return null;
    });

    const isSPA = !!jsFramework;

    // Extract full rendered HTML
    const html = await page.content();
    const title = await page.title();
    const finalUrl = page.url();

    // Extract text content (main content area preferred)
    const text = await page.evaluate(() => {
      // Try main content areas first
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.main-content'];
      for (const sel of mainSelectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).innerText.length > 200) {
          return (el as HTMLElement).innerText;
        }
      }
      // Fallback to body minus nav/header/footer
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
          
          // Check link text
          if (privacyPatterns.some(p => p.test(text) || p.test(ariaLabel))) {
            links.push({ url: href, text, strategy: 'puppeteer-link-text' });
            continue;
          }
          // Check URL pattern
          if (urlPatterns.some(p => p.test(href))) {
            links.push({ url: href, text: text || href, strategy: 'puppeteer-url-pattern' });
          }
        }

        // Also check footer specifically (common location)
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

    // Take screenshot
    let screenshot: Buffer | undefined;
    if (takeScreenshot) {
      try {
        // Re-enable images for screenshot
        await page.setRequestInterception(false);
        await page.reload({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(1000);
        screenshot = (await page.screenshot({
          type: 'png',
          fullPage: false,
          clip: { x: 0, y: 0, width: vp.width, height: vp.height },
        })) as Buffer;
      } catch (_) {}
    }

    // Get cookies
    const cookies = (await page.cookies()).map(c => ({ name: c.name, domain: c.domain }));

    const loadTime = Date.now() - startTime;

    return {
      html,
      text,
      title,
      url: normalizedUrl,
      finalUrl,
      screenshot,
      privacyLinks,
      isSPA,
      jsFramework,
      loadTime,
      statusCode,
      cookies,
    };
  } catch (err: any) {
    return {
      html: '',
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
      error: err.message || 'Unknown error',
    };
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    activePages--;
  }
}

/**
 * Fetch a specific privacy page URL with Puppeteer to extract rendered content
 */
export async function fetchPrivacyPageWithPuppeteer(
  privacyUrl: string,
  options: { timeout?: number } = {}
): Promise<{ text: string; html: string; title: string; error?: string }> {
  const { timeout = 25000 } = options;
  let page: Page | null = null;

  while (activePages >= MAX_PAGES) {
    await new Promise(r => setTimeout(r, 500));
  }
  activePages++;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(ua);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
    });

    // Block heavy resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
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

    // Dismiss cookie consent
    await dismissCookieConsent(page);

    const html = await page.content();
    const title = await page.title();

    // Extract main content text
    const text = await page.evaluate(() => {
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.main-content', '.privacy-content', '.policy-content'];
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

    return { text, html, title };
  } catch (err: any) {
    return { text: '', html: '', title: '', error: err.message };
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    activePages--;
  }
}

/**
 * Check if a URL likely needs Puppeteer (SPA indicators)
 */
export function likelyNeedsPuppeteer(html: string): boolean {
  // Check for SPA indicators in the initial HTML
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
  ];
  return spaIndicators.some(p => p.test(html));
}
