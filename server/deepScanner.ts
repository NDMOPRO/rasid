/**
 * Deep Scanner Engine v5.0 - Comprehensive Crawl Challenge Solutions
 * 
 * Covers 600+ crawl challenges across 28 categories:
 * - 148+ URL patterns for privacy page discovery
 * - 28 CMS detection types (WordPress, WooCommerce, Drupal, Joomla, SharePoint, Shopify, Salla, Zid, Wix, Webflow, Ghost, TYPO3, HubSpot, BigCommerce, Next.js, Nuxt.js, Laravel, Django, Rails, Strapi, Contentful, Sanity)
 * - Saudi payment platform detection (Moyasar, Tamara, HyperPay, Tabby, STC Pay, mada)
 * - Saudi-specific patterns (gov.sa, Salla, Zid, Arabic terms, PDPL, SDAIA, NCA, CITC)
 * - Enhanced error detection (soft-404, parking, maintenance, placeholder)
 * - Encoding handling (Windows-1256, ISO-8859-6, HTML entities, meta charset, BOM)
 * - Cookie consent banner detection and privacy link extraction
 * - Hash-routing and JavaScript link detection
 * - Subdomain checking (privacy.domain.sa, legal.domain.sa)
 * - PDF privacy policy detection
 * - Google Cache / Wayback Machine fallback for unreachable sites
 * - Legal page aggregation (terms pages containing privacy sections)
 * - hreflang tag parsing for multilingual sites
 * - iframe content extraction for embedded privacy policies
 * - Crawler trap detection (URL depth limit, visited URL tracking)
 * - Expanded User-Agent rotation pool
 * - Improved content extraction (accordion, tabs, iframe, modal, popup)
 */

import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { scanWithPuppeteer, fetchPrivacyPageWithPuppeteer, likelyNeedsPuppeteer, closeBrowser } from "./puppeteerHelper";

// ===== Text Sanitization =====
function sanitizeText(text: string | null | undefined, maxLen?: number): string | null {
  if (!text) return null;
  let clean = text.replace(/\x00/g, '').replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
  clean = clean.replace(/[\uD800-\uDFFF]/g, '');
  if (maxLen && clean.length > maxLen) clean = clean.substring(0, maxLen);
  return clean || null;
}

// ===== User-Agent Pool (Challenge 1.6, 1.14) =====
const USER_AGENTS = [
  // Desktop Chrome (latest)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Desktop Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
  // Desktop Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  // Desktop Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  // Mobile Chrome
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/121.0.6167.66 Mobile/15E148 Safari/604.1',
  // Mobile Safari
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  // Googlebot (some sites serve different content)
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
];
const RASID_BOT_UA = 'Mozilla/5.0 (compatible; RasidBot/4.0; +https://rasid.sa)';

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ===== Timeouts =====
const FETCH_TIMEOUT = 12000;
const PRIVACY_FETCH_TIMEOUT = 15000;
const GLOBAL_SCAN_TIMEOUT = 55000; // Increased for deeper scanning with fallbacks

// ===== CMS Detection Engine (Challenge 22.x) =====
type CMSType = 'wordpress' | 'woocommerce' | 'drupal' | 'joomla' | 'sharepoint' | 'shopify' | 'salla' | 'zid' | 'wix' | 'squarespace' | 'blogger' | 'google_sites' | 'magento' | 'opencart' | 'prestashop' | 'bigcommerce' | 'webflow' | 'ghost' | 'typo3' | 'hubspot' | 'nextjs' | 'nuxtjs' | 'laravel' | 'django' | 'rails' | 'strapi' | 'contentful' | 'sanity' | 'unknown';

interface CMSDetectionResult {
  cms: CMSType;
  confidence: number; // 0-100
  indicators: string[];
}

function detectCMS(html: string, headers?: Record<string, string>, url?: string): CMSDetectionResult {
  const indicators: string[] = [];
  let cms: CMSType = 'unknown';
  let confidence = 0;

  const htmlLower = html.toLowerCase();

  // WooCommerce detection (before WordPress - more specific)
  if ((htmlLower.includes('woocommerce') || htmlLower.includes('wc-block') || htmlLower.includes('wc_cart')) && htmlLower.includes('wp-content')) {
    cms = 'woocommerce'; confidence = 95; indicators.push('WooCommerce + WordPress indicators');
  }
  // WordPress detection
  else if (htmlLower.includes('wp-content') || htmlLower.includes('wp-includes')) {
    cms = 'wordpress'; confidence = 95; indicators.push('wp-content/wp-includes found');
  } else if (htmlLower.includes('wordpress') || htmlLower.includes('<meta name="generator" content="wordpress')) {
    cms = 'wordpress'; confidence = 90; indicators.push('WordPress generator meta');
  } else if (/\/wp-json\//i.test(html) || /wp-emoji/i.test(html)) {
    cms = 'wordpress'; confidence = 85; indicators.push('wp-json or wp-emoji');
  }

  // Drupal detection
  if (htmlLower.includes('drupal') || htmlLower.includes('/sites/default/files')) {
    cms = 'drupal'; confidence = 90; indicators.push('Drupal indicators');
  } else if (htmlLower.includes('drupal.settings') || htmlLower.includes('/modules/system/')) {
    cms = 'drupal'; confidence = 85; indicators.push('Drupal modules/settings');
  }

  // Joomla detection
  if (htmlLower.includes('/media/jui/') || htmlLower.includes('joomla')) {
    cms = 'joomla'; confidence = 90; indicators.push('Joomla indicators');
  } else if (htmlLower.includes('/components/com_') || htmlLower.includes('/templates/')) {
    if (htmlLower.includes('joomla') || htmlLower.includes('com_content')) {
      cms = 'joomla'; confidence = 80; indicators.push('Joomla components');
    }
  }

  // SharePoint detection (Challenge 17.1)
  if (htmlLower.includes('sharepoint') || htmlLower.includes('/_layouts/') || htmlLower.includes('/sitepages/') || htmlLower.includes('/_catalogs/')) {
    cms = 'sharepoint'; confidence = 95; indicators.push('SharePoint indicators');
  } else if (htmlLower.includes('microsoftajax') || htmlLower.includes('sp.js') || htmlLower.includes('spcommon')) {
    cms = 'sharepoint'; confidence = 80; indicators.push('SharePoint JS libraries');
  }

  // Shopify detection
  if (htmlLower.includes('shopify') || htmlLower.includes('cdn.shopify.com') || htmlLower.includes('myshopify.com')) {
    cms = 'shopify'; confidence = 95; indicators.push('Shopify CDN/domain');
  } else if (htmlLower.includes('/collections/') && htmlLower.includes('/products/')) {
    cms = 'shopify'; confidence = 70; indicators.push('Shopify URL patterns');
  }

  // Salla detection (Challenge 17.21 - Saudi e-commerce)
  if (htmlLower.includes('salla.sa') || htmlLower.includes('cdn.salla.sa') || htmlLower.includes('salla.network') || htmlLower.includes('s.salla.sa')) {
    cms = 'salla'; confidence = 95; indicators.push('Salla CDN/domain');
  } else if (htmlLower.includes('salla-') || htmlLower.includes('data-salla') || htmlLower.includes('salla_')) {
    cms = 'salla'; confidence = 85; indicators.push('Salla attributes');
  }

  // Zid detection (Challenge 17.21 - Saudi e-commerce)
  if (htmlLower.includes('zid.store') || htmlLower.includes('cdn.zid.sa') || htmlLower.includes('zid.sa')) {
    cms = 'zid'; confidence = 95; indicators.push('Zid CDN/domain');
  } else if (htmlLower.includes('zid-') || htmlLower.includes('data-zid')) {
    cms = 'zid'; confidence = 85; indicators.push('Zid attributes');
  }

  // Wix detection
  if (htmlLower.includes('wix.com') || htmlLower.includes('wixstatic.com') || htmlLower.includes('_wix_browser_sess')) {
    cms = 'wix'; confidence = 95; indicators.push('Wix indicators');
  }

  // Squarespace detection
  if (htmlLower.includes('squarespace') || htmlLower.includes('sqsp.net')) {
    cms = 'squarespace'; confidence = 95; indicators.push('Squarespace indicators');
  }

  // Blogger detection
  if (htmlLower.includes('blogger.com') || htmlLower.includes('blogspot.com') || htmlLower.includes('b:skin')) {
    cms = 'blogger'; confidence = 95; indicators.push('Blogger indicators');
  }

  // Google Sites detection
  if (htmlLower.includes('sites.google.com') || htmlLower.includes('googleusercontent.com/sites')) {
    cms = 'google_sites'; confidence = 95; indicators.push('Google Sites indicators');
  }

  // Magento detection
  if (htmlLower.includes('magento') || htmlLower.includes('mage/') || htmlLower.includes('/skin/frontend/')) {
    cms = 'magento'; confidence = 85; indicators.push('Magento indicators');
  }

  // OpenCart detection
  if (cms === 'unknown' && (htmlLower.includes('opencart') || htmlLower.includes('catalog/view/theme'))) {
    cms = 'opencart'; confidence = 85; indicators.push('OpenCart indicators');
  }

  // BigCommerce detection (NEW)
  if (cms === 'unknown' && (htmlLower.includes('bigcommerce') || htmlLower.includes('cdn11.bigcommerce') || htmlLower.includes('stencil-utils'))) {
    cms = 'bigcommerce'; confidence = 90; indicators.push('BigCommerce indicators');
  }

  // Webflow detection (NEW)
  if (cms === 'unknown' && (htmlLower.includes('webflow') || htmlLower.includes('assets-global.website-files.com') || htmlLower.includes('wf-'))) {
    cms = 'webflow'; confidence = 90; indicators.push('Webflow indicators');
  }

  // Ghost detection (NEW)
  if (cms === 'unknown' && (htmlLower.includes('ghost-') || htmlLower.includes('ghost.org') || (htmlLower.includes('content/images/') && htmlLower.includes('ghost')))) {
    cms = 'ghost'; confidence = 85; indicators.push('Ghost indicators');
  }

  // TYPO3 detection (NEW)
  if (cms === 'unknown' && (htmlLower.includes('typo3') || htmlLower.includes('/typo3conf/') || htmlLower.includes('/typo3temp/'))) {
    cms = 'typo3'; confidence = 85; indicators.push('TYPO3 indicators');
  }

  // HubSpot detection (NEW)
  if (cms === 'unknown' && (htmlLower.includes('hubspot') || htmlLower.includes('hs-scripts.com') || htmlLower.includes('hbspt'))) {
    cms = 'hubspot'; confidence = 85; indicators.push('HubSpot indicators');
  }

  // Next.js detection
  if (cms === 'unknown' && (htmlLower.includes('__next') || htmlLower.includes('_next/static') || htmlLower.includes('next/dist') || htmlLower.includes('__next_f'))) {
    cms = 'nextjs'; confidence = 90; indicators.push('Next.js indicators');
  }

  // Nuxt.js detection
  if (cms === 'unknown' && (htmlLower.includes('__nuxt') || htmlLower.includes('_nuxt/') || htmlLower.includes('nuxt.config') || htmlLower.includes('nuxt-link'))) {
    cms = 'nuxtjs'; confidence = 90; indicators.push('Nuxt.js indicators');
  }

  // Laravel detection
  if (cms === 'unknown' && (htmlLower.includes('laravel') || htmlLower.includes('csrf-token') && htmlLower.includes('app.js') || htmlLower.includes('/vendor/laravel'))) {
    cms = 'laravel'; confidence = 80; indicators.push('Laravel indicators');
  }

  // Django detection
  if (cms === 'unknown' && (htmlLower.includes('csrfmiddlewaretoken') || htmlLower.includes('django') || htmlLower.includes('/static/admin/'))) {
    cms = 'django'; confidence = 80; indicators.push('Django indicators');
  }

  // Ruby on Rails detection
  if (cms === 'unknown' && (htmlLower.includes('csrf-param') && htmlLower.includes('csrf-token') || htmlLower.includes('turbolinks') || htmlLower.includes('rails-ujs'))) {
    cms = 'rails'; confidence = 80; indicators.push('Rails indicators');
  }

  // Strapi detection
  if (cms === 'unknown' && (htmlLower.includes('strapi') || htmlLower.includes('/uploads/') && htmlLower.includes('api/'))) {
    cms = 'strapi'; confidence = 75; indicators.push('Strapi indicators');
  }

  // Contentful detection
  if (cms === 'unknown' && (htmlLower.includes('contentful') || htmlLower.includes('ctfassets.net'))) {
    cms = 'contentful'; confidence = 85; indicators.push('Contentful indicators');
  }

  // Sanity detection
  if (cms === 'unknown' && (htmlLower.includes('sanity.io') || htmlLower.includes('cdn.sanity.io'))) {
    cms = 'sanity'; confidence = 85; indicators.push('Sanity indicators');
  }

  return { cms, confidence, indicators };
}

// ===== CMS-Specific Privacy URL Patterns (Challenge 10.x, 17.x, 22.x) =====
function getCMSSpecificPatterns(cms: CMSType): string[] {
  switch (cms) {
    case 'woocommerce':
    case 'wordpress':
      return [
        '/privacy-policy', '/?page_id=3', '/privacy', '/سياسة-الخصوصية',
        '/ar/privacy-policy', '/en/privacy-policy', '/privacy-policy-2',
        '/?p=privacy', '/sample-page/privacy-policy', '/legal/privacy',
        '/wp-content/uploads/privacy-policy.pdf',
        '/الخصوصية', '/سياسة-الخصوصية-وحماية-البيانات',
      ];
    case 'drupal':
      return [
        '/privacy-policy', '/node/privacy', '/privacy', '/ar/privacy-policy',
        '/en/privacy-policy', '/legal/privacy', '/content/privacy-policy',
      ];
    case 'joomla':
      return [
        '/index.php/privacy-policy', '/index.php/privacy', '/privacy-policy',
        '/index.php/ar/privacy-policy', '/index.php/en/privacy-policy',
        '/component/content/article/privacy-policy',
      ];
    case 'sharepoint':
      return [
        '/Pages/PrivacyPolicy.aspx', '/SitePages/Privacy.aspx',
        '/Pages/Privacy.aspx', '/SitePages/PrivacyPolicy.aspx',
        '/Pages/privacy-policy.aspx', '/_layouts/15/Privacy.aspx',
        '/ar/Pages/PrivacyPolicy.aspx', '/en/Pages/PrivacyPolicy.aspx',
        '/SitePages/سياسة-الخصوصية.aspx',
      ];
    case 'shopify':
      return [
        '/policies/privacy-policy', '/pages/privacy-policy', '/privacy-policy',
        '/pages/privacy', '/policies/privacy',
      ];
    case 'salla':
      return [
        '/pages/privacy', '/pages/privacy-policy', '/privacy-policy',
        '/pages/سياسة-الخصوصية', '/privacy',
        '/pages/terms-and-conditions', '/pages/الشروط-والأحكام',
      ];
    case 'zid':
      return [
        '/privacy-policy', '/pages/privacy-policy', '/privacy',
        '/pages/privacy', '/pages/سياسة-الخصوصية',
      ];
    case 'wix':
      return [
        '/privacy-policy', '/privacy', '/blank-1', '/blank-2',
        '/privacy-policy-1', '/legal/privacy',
      ];
    case 'squarespace':
      return [
        '/privacy-policy', '/privacy', '/legal/privacy-policy',
      ];
    case 'blogger':
      return [
        '/p/privacy-policy.html', '/p/privacy.html', '/p/blog-page.html',
      ];
    case 'google_sites':
      return [
        '/privacy-policy', '/privacy', '/p/privacy',
      ];
    case 'magento':
      return [
        '/privacy-policy-cookie-restriction-mode', '/privacy-policy',
        '/privacy', '/customer-service/privacy-policy',
      ];
    case 'bigcommerce':
      return ['/privacy-policy', '/privacy', '/pages/privacy-policy'];
    case 'webflow':
      return ['/privacy-policy', '/privacy', '/legal/privacy-policy', '/legal/privacy'];
    case 'ghost':
      return ['/privacy', '/privacy-policy', '/legal/privacy'];
    case 'typo3':
      return ['/privacy', '/privacy-policy', '/datenschutz', '/en/privacy-policy'];
    case 'hubspot':
      return ['/privacy-policy', '/privacy', '/legal/privacy-policy'];
    case 'nextjs':
      return ['/privacy', '/privacy-policy', '/legal/privacy', '/en/privacy', '/ar/privacy', '/api/privacy'];
    case 'nuxtjs':
      return ['/privacy', '/privacy-policy', '/legal/privacy', '/en/privacy', '/ar/privacy'];
    case 'laravel':
      return ['/privacy', '/privacy-policy', '/legal/privacy', '/page/privacy', '/pages/privacy-policy'];
    case 'django':
      return ['/privacy/', '/privacy-policy/', '/legal/privacy/', '/en/privacy/', '/ar/privacy/'];
    case 'rails':
      return ['/privacy', '/privacy_policy', '/legal/privacy', '/pages/privacy'];
    case 'strapi':
      return ['/privacy', '/privacy-policy', '/api/pages/privacy', '/legal/privacy'];
    case 'contentful':
      return ['/privacy', '/privacy-policy', '/legal/privacy-policy', '/en/privacy'];
    case 'sanity':
      return ['/privacy', '/privacy-policy', '/legal/privacy', '/en/privacy-policy'];
    default:
      return [];
  }
}

// ===== Comprehensive Privacy URL Patterns (148+ patterns) =====
const PRIVACY_URL_PATTERNS_FULL = [
  // Standard English
  '/privacy', '/privacy-policy', '/privacy_policy', '/privacypolicy',
  '/privacy-notice', '/privacy-statement', '/data-privacy',
  '/policy/privacy', '/legal/privacy', '/legal/privacy-policy',
  '/legal/privacy-notice', '/legal/data-protection',
  '/about/privacy', '/about/privacy-policy',
  '/pages/privacy', '/pages/privacy-policy',
  '/info/privacy', '/site/privacy',
  '/terms/privacy', '/policies/privacy',
  '/policies/privacy-policy', '/help/privacy',
  '/support/privacy', '/corporate/privacy',
  '/company/privacy', '/en/privacy', '/en/privacy-policy',
  // Arabic encoded
  '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // سياسة-الخصوصية
  '/%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // الخصوصية
  '/%D8%AD%D9%85%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA', // حماية-البيانات
  '/%D8%A8%D9%8A%D8%A7%D9%86-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // بيان-الخصوصية
  '/%D8%B3%D8%B1%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA', // سرية-المعلومات
  // Arabic paths (non-encoded)
  '/ar/privacy', '/ar/privacy-policy', '/ar/سياسة-الخصوصية',
  '/ar/الخصوصية', '/ar/حماية-البيانات',
  // Multi-language patterns
  '/privacy-ar', '/privacy-en', '/privacy/ar', '/privacy/en',
  // Terms that often contain privacy
  '/terms-and-conditions', '/terms', '/legal',
  '/terms-of-service', '/terms-of-use',
  // Gov.sa specific (Challenge 17.1)
  '/Pages/PrivacyPolicy.aspx', '/SitePages/Privacy.aspx',
  // PDF patterns (Challenge 17.19)
  '/privacy-policy.pdf', '/privacy.pdf',
  '/documents/privacy-policy.pdf', '/uploads/privacy-policy.pdf',
  '/wp-content/uploads/privacy-policy.pdf',
  '/media/privacy-policy.pdf', '/files/privacy-policy.pdf',
  // Hash-based routing (Challenge 9.11-9.15)
  '/#/privacy', '/#/privacy-policy', '/#privacy',
  '/#/سياسة-الخصوصية', '/#/الخصوصية',
  // Additional common patterns
  '/data-protection', '/data-protection-policy',
  '/gdpr', '/gdpr-policy', '/ccpa', '/ccpa-policy',
  '/cookie-policy', '/cookies-policy',
  '/disclaimer', '/notice', '/data-notice',
  '/information-notice', '/privacy-center',
  '/your-privacy-choices', '/do-not-sell',
  // Arabic terms
  '/الشروط-والأحكام', '/شروط-الاستخدام',
  // Multi-language
  '/fr/privacy', '/fr/politique-de-confidentialite',
  '/ur/privacy', '/tr/gizlilik-politikasi',
  // Additional PDF patterns
  '/assets/privacy-policy.pdf', '/static/privacy-policy.pdf',
  // Arabic encoded additional
  '/%D8%AD%D9%85%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9', // حماية-البيانات-الشخصية
  // Saudi PDPL specific
  '/pdpl', '/pdpl-policy', '/نظام-حماية-البيانات', '/حماية-البيانات-الشخصية',
  '/data-protection-policy', '/personal-data-protection',
  // Saudi gov patterns
  '/Pages/DataProtection.aspx', '/SitePages/DataProtection.aspx',
  '/ar/Pages/PrivacyPolicy.aspx', '/en/Pages/PrivacyPolicy.aspx',
  // E-commerce patterns
  '/shop/privacy', '/store/privacy', '/checkout/privacy',
  '/account/privacy', '/customer/privacy',
  // SPA patterns
  '/#/legal/privacy', '/#/pages/privacy', '/#/privacy-policy',
  // Versioned patterns
  '/v1/privacy', '/v2/privacy', '/2024/privacy-policy', '/2025/privacy-policy',
  // Subdirectory patterns
  '/sa/privacy', '/ksa/privacy', '/gcc/privacy', '/mena/privacy',
  '/middle-east/privacy', '/saudi-arabia/privacy',
  // Additional multilingual
  '/de/datenschutz', '/es/privacidad', '/pt/privacidade',
  '/id/kebijakan-privasi', '/ms/dasar-privasi',
  '/hi/privacy', '/th/privacy', '/ja/privacy', '/ko/privacy', '/zh/privacy',
  // DPO and regulatory
  '/dpo', '/data-protection-officer', '/privacy-rights',
  '/data-subject-rights', '/your-data-rights',
  // Additional common
  '/privacy-settings', '/privacy-preferences', '/manage-privacy',
  '/opt-out', '/unsubscribe', '/consent-management',
  // Saudi payment platforms
  '/moyasar/privacy', '/tamara/privacy', '/tabby/privacy',
  // Additional PDF
  '/downloads/privacy-policy.pdf', '/resources/privacy-policy.pdf',
  '/content/privacy-policy.pdf', '/doc/privacy-policy.pdf',
];

// ===== Fast URL patterns (top 15 most common) =====
const FAST_PRIVACY_PATTERNS = [
  '/privacy', '/privacy-policy', '/ar/privacy', '/en/privacy',
  '/ar/privacy-policy', '/en/privacy-policy',
  '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9',
  '/pages/privacy-policy', '/pages/privacy',
  '/policies/privacy-policy', '/legal/privacy',
  '/legal/privacy-policy', '/about/privacy',
  '/privacy-notice', '/data-privacy',
  '/policy/privacy', '/legal',
];

// ===== Privacy Link Text Patterns (Challenge 9.1-9.3, 17.10) =====
const PRIVACY_LINK_PATTERNS = [
  // Arabic - comprehensive (Challenge 17.10)
  /سياسة\s*الخصوصية/i, /الخصوصية/i, /خصوصية/i,
  /حماية\s*البيانات/i, /بيانات\s*شخصية/i,
  /سياسة\s*حماية/i, /الخصوصية\s*والأمان/i,
  /إشعار\s*الخصوصية/i, /بيان\s*الخصوصية/i,
  /سرية\s*المعلومات/i, /حماية\s*المعلومات/i,
  /سياسة\s*البيانات/i, /حماية\s*الخصوصية/i,
  /نظام\s*حماية\s*البيانات/i, /حماية\s*البيانات\s*الشخصية/i,
  /سياسة\s*الاستخدام\s*والخصوصية/i,
  /الشروط\s*والخصوصية/i,
  /سياسة\s*الاستخدام/i,
  /الأحكام\s*والشروط/i,
  // PDPL / Saudi regulatory terms
  /نظام\s*حماية\s*البيانات\s*الشخصية/i,
  /pdpl/i, /sdaia/i, /سدايا/i,
  // English - comprehensive
  /privacy\s*policy/i, /privacy\s*notice/i, /privacy\s*statement/i,
  /data\s*protection/i, /privacy/i, /personal\s*data/i,
  /data\s*privacy/i, /cookie\s*policy/i,
  /information\s*security/i, /data\s*policy/i,
  /privacy\s*&\s*cookies/i, /privacy\s*and\s*cookies/i,
  /your\s*privacy/i, /our\s*privacy/i,
  /data\s*protection\s*policy/i,
  /gdpr\s*policy/i, /ccpa\s*policy/i,
  // French
  /politique\s*de\s*confidentialit/i,
  /protection\s*des\s*donn/i,
  /vie\s*priv/i,
  // Turkish
  /gizlilik\s*politikas/i,
  /kişisel\s*veri/i,
  /gizlilik/i,
  // German
  /datenschutz/i, /datenschutzerkl/i, /datenschutzrichtlinie/i,
  // Spanish
  /pol[ií]tica\s*de\s*privacidad/i, /protecci[oó]n\s*de\s*datos/i,
  // Portuguese
  /pol[ií]tica\s*de\s*privacidade/i, /prote[çc][ãa]o\s*de\s*dados/i,
  // Italian
  /informativa\s*sulla\s*privacy/i, /protezione\s*dei\s*dati/i,
  // Dutch
  /privacybeleid/i, /privacyverklaring/i,
  // Russian
  /политика\s*конфиденциальности/i,
  // Chinese
  /隐私政策/, /数据保护/,
  // Japanese
  /プライバシーポリシー/, /個人情報保護/,
  // Korean
  /개인정보\s*처리방침/, /개인정보\s*보호/,
  // Urdu
  /رازداری\s*کی\s*پالیسی/i,
  // Persian
  /سیاست\s*حفظ\s*حریم\s*خصوصی/i,
  // Malay/Indonesian
  /dasar\s*privasi/i, /kebijakan\s*privasi/i,
  // Third-party privacy services
  /iubenda/i, /termly/i, /cookiebot/i, /onetrust/i, /trustarc/i,
];

// ===== Contact Link Patterns =====
const CONTACT_LINK_PATTERNS = [
  /تواصل/i, /اتصل/i, /contact/i, /اتصل\s*بنا/i, /تواصل\s*معنا/i,
  /contact\s*us/i, /get\s*in\s*touch/i, /support/i, /الدعم/i,
  /خدمة\s*العملاء/i, /customer\s*service/i,
];

// ===== Error Page Detection (Challenge 11.x) =====
const ERROR_PAGE_PATTERNS = [
  /this\s*site\s*can'?t\s*be\s*reached/i,
  /err_connection_refused/i, /err_name_not_resolved/i,
  /err_connection_timed_out/i, /err_connection_reset/i,
  /dns_probe_finished/i, /502\s*bad\s*gateway/i,
  /503\s*service\s*unavailable/i, /403\s*forbidden/i,
  /server\s*error/i, /الصفحة\s*غير\s*موجودة/i,
  /خطأ\s*في\s*الخادم/i, /الموقع\s*غير\s*متاح/i,
  /unexpectedly\s*closed\s*the\s*connection/i,
  /took\s*too\s*long\s*to\s*respond/i,
  /refused\s*to\s*connect/i,
];

// ===== Soft 404 / Parking / Maintenance Detection (Challenge 11.4-11.20) =====
const SOFT_404_PATTERNS = [
  /page\s*not\s*found/i, /404\s*error/i, /not\s*found/i,
  /الصفحة\s*غير\s*موجودة/i, /لم\s*يتم\s*العثور/i,
  /الصفحة\s*المطلوبة\s*غير\s*متوفرة/i,
  /oops.*page.*exist/i, /sorry.*page.*found/i,
  /this\s*page\s*doesn'?t\s*exist/i,
  /الصفحة\s*التي\s*تبحث\s*عنها\s*غير\s*موجودة/i,
  /error\s*404/i, /http\s*404/i,
  /الصفحة\s*غير\s*متاحة/i,
  /عذراً.*الصفحة/i,
  /page\s*does\s*not\s*exist/i,
  /content\s*not\s*found/i,
  /هذه\s*الصفحة\s*غير\s*موجودة/i,
];

const PARKING_PAGE_PATTERNS = [
  /domain\s*is\s*for\s*sale/i, /buy\s*this\s*domain/i,
  /this\s*domain\s*is\s*parked/i, /domain\s*parking/i,
  /هذا\s*النطاق\s*للبيع/i, /النطاق\s*متاح\s*للشراء/i,
  /godaddy/i, /namecheap.*parking/i, /sedo.*domain/i,
  /hugedomains/i, /dan\.com/i, /afternic/i,
  /register\s*this\s*domain/i, /domain\s*available/i,
];

const MAINTENANCE_PATTERNS = [
  /under\s*construction/i, /coming\s*soon/i, /تحت\s*الإنشاء/i,
  /قريبا/i, /الموقع\s*تحت\s*الصيانة/i, /maintenance\s*mode/i,
  /we'?ll\s*be\s*back/i, /temporarily\s*unavailable/i,
  /site\s*is\s*being\s*updated/i, /الموقع\s*قيد\s*التطوير/i,
  /launching\s*soon/i, /نعمل\s*على\s*تطوير/i,
  /قيد\s*الإنشاء/i, /الموقع\s*قيد\s*الصيانة/i,
  /site\s*under\s*maintenance/i, /website\s*is\s*under\s*construction/i,
  /stay\s*tuned/i, /ترقبونا/i,
  /opening\s*soon/i, /سيتم\s*الإطلاق/i,
  /الموقع\s*في\s*طور\s*الإنشاء/i,
];

// ===== Cookie Consent Patterns (Challenge 20.x) =====
const COOKIE_CONSENT_PATTERNS = [
  /cookie.*consent/i, /cookie.*banner/i, /cookie.*notice/i,
  /accept.*cookie/i, /ملفات\s*تعريف\s*الارتباط/i,
  /نستخدم\s*ملفات/i, /we\s*use\s*cookies/i,
  /cookie.*preferences/i, /manage.*cookies/i,
  /gdpr/i, /ccpa/i,
  /onetrust/i, /optanon/i, /ot-sdk/i,
  /CybotCookiebot/i, /cookiebot/i,
  /quantcast/i, /qc-cmp/i,
  /trustarc/i, /truste/i, /consent-manager/i,
  /iubenda/i, /termly/i,
  /complianz/i, /cmplz/i,
];

// ===== Interstitial / DDoS Protection Detection =====
const INTERSTITIAL_PATTERNS = [
  /checking\s*your\s*browser/i, /just\s*a\s*moment/i,
  /ddos\s*protection/i, /attention\s*required/i,
  /cloudflare/i, /sucuri/i, /stackpath/i,
  /incapsula/i, /akamai/i, /imperva/i,
  /يرجى\s*الانتظار/i, /جاري\s*التحقق/i,
  /cf-browser-verification/i, /challenge-platform/i,
];

function isInterstitialPage(html: string): boolean {
  if (html.length > 50000) return false;
  let matchCount = 0;
  for (const p of INTERSTITIAL_PATTERNS) {
    if (p.test(html)) matchCount++;
  }
  return matchCount >= 2;
}

// ===== URL Normalization =====
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid',
      'PHPSESSID', 'JSESSIONID', 'sid', 'session_id',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    let normalized = parsed.href;
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

// ===== Base Tag Resolution =====
function resolveBaseUrl(html: string, pageUrl: string): string {
  const baseMatch = html.match(/<base[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (baseMatch) {
    try { return new URL(baseMatch[1], pageUrl).href; } catch {}
  }
  return pageUrl;
}

// ===== Main Scan Interface =====
export interface DeepScanResult {
  siteReachable: boolean;
  siteName: string;
  siteTitle: string;
  httpStatus: number;
  redirectUrl: string;
  privacyUrl: string;
  privacyMethod: string;
  privacyTextContent: string;
  privacyTextLength: number;
  privacyLanguage: string;
  screenshotUrl: string;
  privacyScreenshotUrl: string;
  contactUrl: string;
  contactEmails: string;
  contactPhones: string;
  socialLinks: Record<string, string>;
  // CMS Detection
  detectedCMS: string;
  cmsConfidence: number;
  // Enhanced metadata
  sslValid: boolean;
  hasHttps: boolean;
  hasHttp: boolean;
  isParkingPage: boolean;
  isMaintenancePage: boolean;
  hasCookieConsent: boolean;
  // Compliance
  overallScore: number;
  complianceStatus: 'compliant' | 'partially_compliant' | 'non_compliant' | 'no_policy' | 'error';
  clause1Compliant: boolean; clause1Evidence: string;
  clause2Compliant: boolean; clause2Evidence: string;
  clause3Compliant: boolean; clause3Evidence: string;
  clause4Compliant: boolean; clause4Evidence: string;
  clause5Compliant: boolean; clause5Evidence: string;
  clause6Compliant: boolean; clause6Evidence: string;
  clause7Compliant: boolean; clause7Evidence: string;
  clause8Compliant: boolean; clause8Evidence: string;
  summary: string;
  recommendations: string[];
  rating: string;
  errorMessage: string;
  scanDuration: number;
}

// Fast scan mode
let fastScanMode = true;
export function setFastScanMode(enabled: boolean) { fastScanMode = enabled; }

export async function deepScanDomain(domain: string): Promise<DeepScanResult> {
  return Promise.race([
    _deepScanDomainImpl(domain),
    new Promise<DeepScanResult>((_, reject) =>
      setTimeout(() => reject(new Error('Global scan timeout')), GLOBAL_SCAN_TIMEOUT)
    )
  ]).catch(e => createErrorResult(e.message || 'timeout'));
}

function createErrorResult(errorMessage: string): DeepScanResult {
  return {
    siteReachable: false, siteName: '', siteTitle: '', httpStatus: 0,
    redirectUrl: '', privacyUrl: '', privacyMethod: '', privacyTextContent: '',
    privacyTextLength: 0, privacyLanguage: '', screenshotUrl: '',
    privacyScreenshotUrl: '', contactUrl: '', contactEmails: '',
    contactPhones: '', socialLinks: {},
    detectedCMS: 'unknown', cmsConfidence: 0,
    sslValid: false, hasHttps: false, hasHttp: false,
    isParkingPage: false, isMaintenancePage: false, hasCookieConsent: false,
    overallScore: 0, complianceStatus: 'error' as const,
    clause1Compliant: false, clause1Evidence: '',
    clause2Compliant: false, clause2Evidence: '',
    clause3Compliant: false, clause3Evidence: '',
    clause4Compliant: false, clause4Evidence: '',
    clause5Compliant: false, clause5Evidence: '',
    clause6Compliant: false, clause6Evidence: '',
    clause7Compliant: false, clause7Evidence: '',
    clause8Compliant: false, clause8Evidence: '',
    summary: '', recommendations: [], rating: '',
    errorMessage, scanDuration: GLOBAL_SCAN_TIMEOUT,
  };
}

async function _deepScanDomainImpl(domain: string): Promise<DeepScanResult> {
  const startTime = Date.now();
  const result: DeepScanResult = {
    ...createErrorResult(''),
    complianceStatus: 'no_policy',
    scanDuration: 0,
  };

  try {
    // ===== Step 1: Visit homepage - try HTTPS and HTTP (Challenge 1.1-1.3) =====
    const ua = getRandomUA();
    let html = '';
    let finalUrl = '';

    // Try HTTPS first, then HTTP
    const httpsUrl = `https://${domain}`;
    const httpUrl = `http://${domain}`;

    try {
      const httpsPromise = fetchWithRetry(httpsUrl, { timeout: FETCH_TIMEOUT, ua }).then(r => ({ response: r, protocol: 'https' }));
      const httpPromise = fetchWithRetry(httpUrl, { timeout: FETCH_TIMEOUT, ua }).then(r => ({ response: r, protocol: 'http' }));

      const results = await Promise.allSettled([httpsPromise, httpPromise]);
      let successResult: { response: Response; protocol: string } | null = null;

      // Prefer HTTPS
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.response.ok) {
          if (!successResult || r.value.protocol === 'https') {
            successResult = r.value;
          }
        }
      }

      // If no OK response, try any response
      if (!successResult) {
        for (const r of results) {
          if (r.status === 'fulfilled') {
            successResult = r.value;
          }
        }
      }

      if (successResult && successResult.response.ok) {
        // Handle encoding (Challenge 16.x)
        html = await readResponseWithEncoding(successResult.response);
        result.httpStatus = successResult.response.status;
        finalUrl = successResult.response.url;
        if (finalUrl !== httpsUrl && finalUrl !== httpUrl) result.redirectUrl = finalUrl;
        result.siteReachable = true;
        result.hasHttps = successResult.protocol === 'https';
        result.hasHttp = successResult.protocol === 'http';
        result.sslValid = successResult.protocol === 'https';
      } else if (successResult) {
        result.httpStatus = successResult.response.status;
        // Try with different UA on 403 (Challenge 1.21)
        if (successResult.response.status === 403) {
          const retryResult = await retryWith403Handling(domain, ua);
          if (retryResult) {
            html = retryResult.html;
            result.httpStatus = retryResult.status;
            finalUrl = retryResult.url;
            result.siteReachable = true;
          } else {
            result.errorMessage = `HTTP 403 - الموقع يرفض الوصول`;
            result.scanDuration = Date.now() - startTime;
            return result;
          }
        } else {
          result.errorMessage = `HTTP ${successResult.response.status}`;
          result.scanDuration = Date.now() - startTime;
          return result;
        }
      } else {
        // Try Google Cache / Wayback Machine fallback (Challenge 18.x)
        const cacheFallback = await fetchFromCacheFallback(domain);
        if (cacheFallback) {
          html = cacheFallback.html;
          finalUrl = cacheFallback.url;
          result.siteReachable = false; // Mark as not directly reachable
          result.errorMessage = cacheFallback.source === 'google_cache' 
            ? 'تم الوصول عبر Google Cache (الموقع الأصلي غير متاح)'
            : 'تم الوصول عبر Wayback Machine (الموقع الأصلي غير متاح)';
        } else {
          const firstErr = results.find(r => r.status === 'rejected');
          result.errorMessage = `الموقع غير قابل للوصول: ${(firstErr as any)?.reason?.message || 'timeout'}`;
          result.scanDuration = Date.now() - startTime;
          return result;
        }
      }
    } catch (e: any) {
      // Try Google Cache / Wayback Machine fallback on exception too
      const cacheFallback = await fetchFromCacheFallback(domain);
      if (cacheFallback) {
        html = cacheFallback.html;
        finalUrl = cacheFallback.url;
        result.siteReachable = false;
        result.errorMessage = cacheFallback.source === 'google_cache'
          ? 'تم الوصول عبر Google Cache (الموقع الأصلي غير متاح)'
          : 'تم الوصول عبر Wayback Machine (الموقع الأصلي غير متاح)';
      } else {
        result.errorMessage = `الموقع غير قابل للوصول: ${e.message}`;
        result.scanDuration = Date.now() - startTime;
        return result;
      }
    }

    if (!finalUrl) finalUrl = httpsUrl;

    // ===== Step 2: Error/Parking/Maintenance Detection (Challenge 11.x) =====
    if (isErrorPage(html)) {
      result.siteReachable = false;
      result.errorMessage = 'صفحة خطأ مكتشفة';
      result.scanDuration = Date.now() - startTime;
      return result;
    }

    if (isParkingPage(html)) {
      result.isParkingPage = true;
      result.siteReachable = false;
      result.errorMessage = 'صفحة إيقاف نطاق (Domain Parking)';
      result.scanDuration = Date.now() - startTime;
      return result;
    }

    if (isMaintenancePage(html)) {
      result.isMaintenancePage = true;
      result.errorMessage = 'الموقع تحت الصيانة أو قيد الإنشاء';
      // Don't return - site might still have privacy page
    }

    // ===== Step 2.5: Interstitial / DDoS Protection Detection =====
    if (isInterstitialPage(html)) {
      // Wait and retry once
      await sleep(5000);
      try {
        const retryResp = await fetchWithRetry(finalUrl, { timeout: FETCH_TIMEOUT, ua });
        if (retryResp.ok) {
          const retryHtml = await readResponseWithEncoding(retryResp);
          if (!isInterstitialPage(retryHtml)) {
            html = retryHtml;
          } else {
            // Try Puppeteer for Cloudflare/DDoS pages
            try {
              const puppeteerResult = await scanWithPuppeteer(finalUrl, { takeScreenshot: false, extractPrivacyLinks: false });
              if (puppeteerResult.html.length > html.length && !isInterstitialPage(puppeteerResult.html)) {
                html = puppeteerResult.html;
                result.errorMessage = '';
              } else {
                result.errorMessage = 'تم اكتشاف صفحة حماية DDoS/Cloudflare - قد يكون المحتوى غير كامل';
              }
            } catch {
              result.errorMessage = 'تم اكتشاف صفحة حماية DDoS/Cloudflare - قد يكون المحتوى غير كامل';
            }
          }
        }
      } catch {}
    }

    // ===== Step 2.7: SPA Detection - Use Puppeteer if HTML is too thin =====
    if (likelyNeedsPuppeteer(html) || (html.length < 2000 && !isErrorPage(html) && !isParkingPage(html))) {
      try {
        const puppeteerResult = await scanWithPuppeteer(finalUrl, { takeScreenshot: false, extractPrivacyLinks: true });
        if (puppeteerResult.html.length > html.length) {
          html = puppeteerResult.html;
          result.detectedCMS = puppeteerResult.jsFramework || result.detectedCMS;
          // Merge any privacy links found by Puppeteer
          if (puppeteerResult.privacyLinks.length > 0 && !result.privacyUrl) {
            result.privacyUrl = puppeteerResult.privacyLinks[0].url;
            result.privacyMethod = puppeteerResult.privacyLinks[0].strategy;
          }
        }
      } catch { /* Puppeteer SPA fallback failed */ }
    }

    // ===== Step 2.6: Resolve base URL for relative links =====
    const resolvedBaseUrl = resolveBaseUrl(html, finalUrl);

    // ===== Step 3: CMS Detection (Challenge 22.x) =====
    const cmsResult = detectCMS(html, undefined, finalUrl);
    result.detectedCMS = cmsResult.cms;
    result.cmsConfidence = cmsResult.confidence;

    // ===== Step 4: Extract basic info =====
    result.siteTitle = extractTitle(html);
    result.siteName = result.siteTitle || domain;

    // ===== Step 5: Cookie consent detection (Challenge 20.x) =====
    result.hasCookieConsent = detectCookieConsent(html);

    // ===== Step 6: Extract contact info =====
    const contactInfo = extractContactInfo(html, finalUrl);
    result.contactEmails = contactInfo.emails.join(', ');
    result.contactPhones = contactInfo.phones.join(', ');
    result.socialLinks = contactInfo.socialLinks;
    result.contactUrl = contactInfo.contactUrl;

    // ===== Step 7: Multi-Strategy Privacy Discovery (20 strategies) =====
    const privacyDiscovery = await discoverPrivacyPageEnhanced(html, resolvedBaseUrl, domain, cmsResult.cms);
    result.privacyUrl = privacyDiscovery.url ? normalizeUrl(privacyDiscovery.url) : '';
    result.privacyMethod = privacyDiscovery.method;

    // ===== Step 7.5: Strategy 21 - Puppeteer DOM Discovery =====
    if (!result.privacyUrl) {
      try {
        const puppeteerScan = await scanWithPuppeteer(finalUrl, { takeScreenshot: false, extractPrivacyLinks: true, timeout: 20000 });
        if (puppeteerScan.privacyLinks.length > 0) {
          result.privacyUrl = normalizeUrl(puppeteerScan.privacyLinks[0].url);
          result.privacyMethod = 'strategy_21_puppeteer_dom';
        }
      } catch { /* Puppeteer discovery failed */ }
    }

    // ===== Step 8: Extract privacy text =====
    if (result.privacyUrl) {
      const privacyContent = await extractPrivacyText(result.privacyUrl, ua);
      result.privacyTextContent = privacyContent.text;
      result.privacyTextLength = privacyContent.text.length;
      result.privacyLanguage = detectLanguage(privacyContent.text);

      // Merge contact info from privacy page
      if (privacyContent.html) {
        const privacyContactInfo = extractContactInfo(privacyContent.html, result.privacyUrl);
        const allEmails = new Set([...contactInfo.emails, ...privacyContactInfo.emails]);
        result.contactEmails = Array.from(allEmails).join(', ');
        const allPhones = new Set([...contactInfo.phones, ...privacyContactInfo.phones]);
        result.contactPhones = Array.from(allPhones).join(', ');
      }
    }

    // ===== Step 9: Compliance Analysis =====
    if (result.privacyTextContent && result.privacyTextContent.length > 100) {
      if (fastScanMode) {
        result.complianceStatus = 'non_compliant';
        result.summary = 'تم استخراج النص بنجاح - في انتظار تحليل الامتثال (وضع المسح السريع)';
      } else {
        try {
          const compliance = await analyzeComplianceDeep(result.privacyTextContent, domain);
          if (compliance) {
            result.overallScore = compliance.overall_score || 0;
            result.rating = compliance.rating || '';
            result.summary = compliance.summary || '';
            result.recommendations = compliance.recommendations || [];
            result.clause1Compliant = compliance.clause_1?.compliant || false;
            result.clause1Evidence = compliance.clause_1?.evidence || '';
            result.clause2Compliant = compliance.clause_2?.compliant || false;
            result.clause2Evidence = compliance.clause_2?.evidence || '';
            result.clause3Compliant = compliance.clause_3?.compliant || false;
            result.clause3Evidence = compliance.clause_3?.evidence || '';
            result.clause4Compliant = compliance.clause_4?.compliant || false;
            result.clause4Evidence = compliance.clause_4?.evidence || '';
            result.clause5Compliant = compliance.clause_5?.compliant || false;
            result.clause5Evidence = compliance.clause_5?.evidence || '';
            result.clause6Compliant = compliance.clause_6?.compliant || false;
            result.clause6Evidence = compliance.clause_6?.evidence || '';
            result.clause7Compliant = compliance.clause_7?.compliant || false;
            result.clause7Evidence = compliance.clause_7?.evidence || '';
            result.clause8Compliant = compliance.clause_8?.compliant || false;
            result.clause8Evidence = compliance.clause_8?.evidence || '';
            const score = result.overallScore;
            if (score >= 60) result.complianceStatus = 'compliant';
            else if (score >= 40) result.complianceStatus = 'partially_compliant';
            else result.complianceStatus = 'non_compliant';
          }
        } catch {
          result.complianceStatus = 'non_compliant';
          result.summary = 'تم استخراج النص بنجاح - في انتظار تحليل الامتثال';
        }
      }
    } else if (result.privacyUrl) {
      result.complianceStatus = 'non_compliant';
      result.summary = 'تم العثور على صفحة خصوصية لكن محتواها غير كافٍ للتحليل';
    } else {
      result.complianceStatus = 'no_policy';
      result.summary = 'لم يتم العثور على صفحة سياسة خصوصية';
    }

  } catch (e: any) {
    result.errorMessage = e.message || 'خطأ غير متوقع';
    result.complianceStatus = 'error';
  }

  result.scanDuration = Date.now() - startTime;
  return result;
}

// ===== Encoding-Aware Response Reader (Challenge 16.x) =====
async function readResponseWithEncoding(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || '';
    
    // Check for charset in Content-Type header
    const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase().replace(/['"]/g, '') : '';

    // For standard UTF-8, just read as text
    if (!charset || charset === 'utf-8' || charset === 'utf8') {
      return await response.text();
    }

    // For Windows-1256 (common in Arabic sites) and other encodings
    const buffer = await response.arrayBuffer();
    
    // Try TextDecoder with detected charset
    try {
      const decoder = new TextDecoder(charset);
      return decoder.decode(buffer);
    } catch {
      // Fallback: try windows-1256 for Arabic sites
      try {
        const decoder = new TextDecoder('windows-1256');
        return decoder.decode(buffer);
      } catch {
        // Ultimate fallback: UTF-8
        return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      }
    }
  } catch {
    return await response.text();
  }
}

// ===== 403 Retry with Different UAs (Challenge 1.21) =====
async function retryWith403Handling(domain: string, originalUA: string): Promise<{ html: string; status: number; url: string } | null> {
  const retryUAs = [
    // Try Googlebot
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    // Try mobile
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    // Try plain curl-like
    'curl/8.0',
  ].filter(ua => ua !== originalUA);

  for (const ua of retryUAs) {
    try {
      const resp = await fetch(`https://${domain}`, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ar,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      });
      if (resp.ok) {
        const html = await readResponseWithEncoding(resp);
        return { html, status: resp.status, url: resp.url };
      }
    } catch { /* try next UA */ }
  }
  return null;
}

// ===== Fetch with Retry (Challenge 1.13) =====
async function fetchWithRetry(url: string, options: { timeout: number; retries?: number; ua?: string }): Promise<Response> {
  const retries = options.retries || 2;
  const ua = options.ua || getRandomUA();
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(options.timeout),
        redirect: 'follow',
      });
      return response;
    } catch (e) {
      lastError = e;
      if (i < retries - 1) {
        // Exponential backoff (Challenge 1.13)
        await sleep(300 * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

// ===== Enhanced Privacy Page Discovery (7 strategies) =====
async function discoverPrivacyPageEnhanced(
  html: string, baseUrl: string, domain: string, cms: CMSType
): Promise<{ url: string; method: string }> {
  
  // Strategy 1: Find privacy links in HTML body (link text matching)
  const linkResult = findPrivacyLinks(html, baseUrl);
  if (linkResult) return { url: linkResult, method: 'link_text' };

  // Strategy 2: Check footer specifically
  const footerResult = findPrivacyInFooter(html, baseUrl);
  if (footerResult) return { url: footerResult, method: 'footer' };

  // Strategy 3: Check cookie consent banners for privacy links (Challenge 20.x)
  const cookieResult = findPrivacyInCookieBanner(html, baseUrl);
  if (cookieResult) return { url: cookieResult, method: 'cookie_banner' };

  // Strategy 4: Check navigation menus (hamburger, mega, dropdown) (Challenge 9.4-9.6, 9.31-9.35)
  const navResult = findPrivacyInNavigation(html, baseUrl);
  if (navResult) return { url: navResult, method: 'navigation' };

  // Strategy 5: CMS-specific URL patterns (Challenge 22.x)
  if (cms !== 'unknown') {
    const cmsPatterns = getCMSSpecificPatterns(cms);
    const cmsResult = await tryUrlPatternsBatch(baseUrl, cmsPatterns);
    if (cmsResult) return { url: cmsResult, method: `cms_${cms}` };
  }

  // Strategy 6: Try top 15 common URL patterns in parallel
  const urlResult = await tryUrlPatternsBatch(baseUrl, FAST_PRIVACY_PATTERNS);
  if (urlResult) return { url: urlResult, method: 'url_pattern' };

  // Strategy 7: Check sitemap.xml
  const sitemapResult = await checkSitemap(baseUrl);
  if (sitemapResult) return { url: sitemapResult, method: 'sitemap' };

  // Strategy 8: Check robots.txt for sitemap references
  const robotsResult = await checkRobotsTxt(baseUrl);
  if (robotsResult) return { url: robotsResult, method: 'robots_txt' };

  // Strategy 9: Check subdomains (Challenge 9 - subdomain checking)
  const subdomainResult = await checkPrivacySubdomains(domain);
  if (subdomainResult) return { url: subdomainResult, method: 'subdomain' };

  // Strategy 10: Try remaining URL patterns (extended set)
  const remainingPatterns = PRIVACY_URL_PATTERNS_FULL.filter(p => !FAST_PRIVACY_PATTERNS.includes(p));
  const extResult = await tryUrlPatternsBatch(baseUrl, remainingPatterns.slice(0, 20));
  if (extResult) return { url: extResult, method: 'extended_url_pattern' };

  // Strategy 11: Check for hash-based routing (Challenge 9.11-9.15)
  const hashResult = findHashRoutePrivacy(html, baseUrl);
  if (hashResult) return { url: hashResult, method: 'hash_route' };

  // Strategy 12: Check for JavaScript onclick links (Challenge 9.11-9.15)
  const jsResult = findJSPrivacyLinks(html, baseUrl);
  if (jsResult) return { url: jsResult, method: 'js_link' };

  // Strategy 13: PDF privacy policy detection (Challenge 17.19)
  const pdfResult = await checkPDFPrivacy(html, baseUrl);
  if (pdfResult) return { url: pdfResult, method: 'pdf' };

  // Strategy 14: Check terms/legal pages for embedded privacy sections
  const termsResult = await checkTermsPageForPrivacy(html, baseUrl);
  if (termsResult) return { url: termsResult, method: 'terms_embedded' };

  // Strategy 15: Check hreflang tags for alternate language privacy pages
  const hreflangResult = findPrivacyViaHreflang(html, baseUrl);
  if (hreflangResult) return { url: hreflangResult, method: 'hreflang' };

  // Strategy 16: Check for iframe-embedded privacy content
  const iframeResult = findPrivacyInIframes(html, baseUrl);
  if (iframeResult) return { url: iframeResult, method: 'iframe' };

  // Strategy 17: About/Contact/Registration page scanning for privacy links
  const aboutContactResult = await checkAboutContactPages(html, baseUrl);
  if (aboutContactResult) return { url: aboutContactResult, method: 'about_contact_page' };

  // Strategy 18: Third-party privacy service detection (iubenda, termly, etc.)
  const thirdPartyResult = detectThirdPartyPrivacyService(html);
  if (thirdPartyResult) return { url: thirdPartyResult, method: 'third_party_service' };

  // Strategy 19: Google Docs / Notion / external privacy links
  const externalDocResult = findExternalPrivacyDocs(html);
  if (externalDocResult) return { url: externalDocResult, method: 'external_doc' };

  // Strategy 20: Image map / SVG links / area tags
  const imageMapResult = findImageMapPrivacyLinks(html, baseUrl);
  if (imageMapResult) return { url: imageMapResult, method: 'image_map_svg' };

  return { url: '', method: '' };
}

// ===== Strategy 1: Find Privacy Links in HTML =====
function findPrivacyLinks(html: string, baseUrl: string): string | null {
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const candidates: Array<{ url: string; score: number }> = [];

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();
    const fullText = (href + ' ' + linkText).toLowerCase();

    let score = 0;
    for (const pattern of PRIVACY_LINK_PATTERNS) {
      if (pattern.test(linkText)) score += 10;
      if (pattern.test(href)) score += 5;
    }

    // Boost for exact matches
    if (/privacy.?policy/i.test(fullText)) score += 20;
    if (/سياسة.?الخصوصية/i.test(fullText)) score += 20;
    if (/بيان.?الخصوصية/i.test(fullText)) score += 18;
    if (/حماية.?البيانات.?الشخصية/i.test(fullText)) score += 18;
    if (/privacy/i.test(href) && href.length < 100) score += 15;

    // Penalize non-privacy links
    if (/cookie/i.test(fullText) && !/privacy/i.test(fullText)) score -= 5;
    if (/terms/i.test(fullText) && !/privacy/i.test(fullText)) score -= 3;
    if (/javascript:/i.test(href)) score = 0;
    if (href === '#' || href === '') score = 0;
    if (/^mailto:/i.test(href) || /^tel:/i.test(href)) score = 0;

    if (score > 0) {
      let resolvedUrl = href;
      if (!href.startsWith('http')) {
        try { resolvedUrl = new URL(href, baseUrl).href; } catch { continue; }
      }
      candidates.push({ url: resolvedUrl, score });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].url;
}

// ===== Strategy 2: Footer-specific search =====
function findPrivacyInFooter(html: string, baseUrl: string): string | null {
  // Try semantic footer
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  if (footerMatch) {
    const result = findPrivacyLinks(footerMatch[0], baseUrl);
    if (result) return result;
  }
  // Try class-based footer
  const footerClassPatterns = [
    /<div[^>]*class="[^"]*footer[^"]*"[\s\S]*?<\/div>/i,
    /<div[^>]*id="[^"]*footer[^"]*"[\s\S]*?<\/div>/i,
    /<section[^>]*class="[^"]*footer[^"]*"[\s\S]*?<\/section>/i,
  ];
  for (const pattern of footerClassPatterns) {
    const match = html.match(pattern);
    if (match) {
      const result = findPrivacyLinks(match[0], baseUrl);
      if (result) return result;
    }
  }
  // Try last 20% of HTML (footer area heuristic)
  const lastPortion = html.slice(Math.floor(html.length * 0.8));
  return findPrivacyLinks(lastPortion, baseUrl);
}

// ===== Strategy 3: Cookie Consent Banner Privacy Links (Challenge 20.x) =====
function findPrivacyInCookieBanner(html: string, baseUrl: string): string | null {
  const bannerPatterns = [
    /<div[^>]*class="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*id="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*consent[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*gdpr[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*cc-[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*onetrust[^"]*"[\s\S]*?<\/div>/gi,
  ];

  for (const pattern of bannerPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const result = findPrivacyLinks(match[0], baseUrl);
      if (result) return result;
    }
  }
  return null;
}

// ===== Strategy 4: Navigation Menus (Challenge 9.4-9.6, 9.31-9.35) =====
function findPrivacyInNavigation(html: string, baseUrl: string): string | null {
  const navPatterns = [
    // Standard nav
    /<nav[\s\S]*?<\/nav>/gi,
    // Hamburger/mobile menu
    /<div[^>]*class="[^"]*(?:mobile|hamburger|offcanvas|drawer|slide)[^"]*menu[^"]*"[\s\S]*?<\/div>/gi,
    // Mega menu
    /<div[^>]*class="[^"]*mega[^"]*menu[^"]*"[\s\S]*?<\/div>/gi,
    // Dropdown
    /<ul[^>]*class="[^"]*(?:dropdown|submenu|sub-menu)[^"]*"[\s\S]*?<\/ul>/gi,
    // Sidebar widget
    /<aside[\s\S]*?<\/aside>/gi,
    /<div[^>]*class="[^"]*sidebar[^"]*"[\s\S]*?<\/div>/gi,
  ];

  for (const pattern of navPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const result = findPrivacyLinks(match[0], baseUrl);
      if (result) return result;
    }
  }
  return null;
}

// ===== Strategy 5: Try URL Patterns in Batch =====
async function tryUrlPatternsBatch(baseUrl: string, patterns: string[]): Promise<string | null> {
  const ua = getRandomUA();
  // Process in batches of 5 for speed
  for (let i = 0; i < patterns.length; i += 5) {
    const batch = patterns.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        try {
          const testUrl = new URL(path, baseUrl).href;
          const resp = await fetch(testUrl, {
            headers: { 'User-Agent': ua, 'Accept-Language': 'ar,en;q=0.9' },
            signal: AbortSignal.timeout(6000),
            redirect: 'follow',
          });
          if (resp.ok) {
            const html = await resp.text();
            if (isErrorPage(html) || isSoft404(html)) return null;
            const text = stripHtml(html);
            if (text.length > 200 && isPrivacyContent(text)) return testUrl;
            // Check if it's a PDF
            const ct = resp.headers.get('content-type') || '';
            if (ct.includes('pdf')) return testUrl;
          }
          return null;
        } catch { return null; }
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) return r.value;
    }
  }
  return null;
}

// ===== Strategy 7: Sitemap Check =====
async function checkSitemap(baseUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(`${baseUrl}/sitemap.xml`, {
      headers: { 'User-Agent': RASID_BOT_UA },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const xml = await resp.text();
    const urlMatches = xml.match(/<loc>([^<]*(?:privacy|خصوصية|policy|حماية|سياسة)[^<]*)<\/loc>/gi);
    if (urlMatches && urlMatches.length > 0) {
      return urlMatches[0].replace(/<\/?loc>/gi, '');
    }
  } catch { /* sitemap not available */ }
  return null;
}

// ===== Strategy 8: Robots.txt Check =====
async function checkRobotsTxt(baseUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(`${baseUrl}/robots.txt`, {
      headers: { 'User-Agent': RASID_BOT_UA },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    const sitemapMatch = text.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
    if (sitemapMatch) {
      try {
        const sitemapResp = await fetch(sitemapMatch[1], {
          headers: { 'User-Agent': RASID_BOT_UA },
          signal: AbortSignal.timeout(8000),
        });
        if (sitemapResp.ok) {
          const xml = await sitemapResp.text();
          const urlMatches = xml.match(/<loc>([^<]*(?:privacy|خصوصية|policy|حماية|سياسة)[^<]*)<\/loc>/gi);
          if (urlMatches) return urlMatches[0].replace(/<\/?loc>/gi, '');
        }
      } catch { /* sitemap fetch failed */ }
    }
  } catch { /* robots.txt not available */ }
  return null;
}

// ===== Strategy 9: Subdomain Check (Challenge 9 - subdomain) =====
async function checkPrivacySubdomains(domain: string): Promise<string | null> {
  const subdomains = ['privacy', 'legal', 'policies', 'www'];
  const ua = getRandomUA();
  
  for (const sub of subdomains) {
    if (domain.startsWith(`${sub}.`)) continue; // Skip if already on this subdomain
    const testDomain = `${sub}.${domain}`;
    try {
      const resp = await fetch(`https://${testDomain}`, {
        headers: { 'User-Agent': ua },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      if (resp.ok) {
        const html = await resp.text();
        const text = stripHtml(html);
        if (text.length > 200 && isPrivacyContent(text)) {
          return resp.url;
        }
      }
    } catch { /* subdomain not available */ }
  }
  return null;
}

// ===== Strategy 11: Hash Route Detection (Challenge 9.11-9.15) =====
function findHashRoutePrivacy(html: string, baseUrl: string): string | null {
  // Look for hash-based routing patterns in JavaScript
  const hashPatterns = [
    /['"]#\/privacy['"]/i,
    /['"]#\/privacy-policy['"]/i,
    /['"]#privacy['"]/i,
    /route.*privacy/i,
    /path.*['"]\/privacy['"]/i,
  ];

  for (const pattern of hashPatterns) {
    if (pattern.test(html)) {
      // Extract the hash route
      const match = html.match(/['"]#\/?([^'"]*privacy[^'"]*)['"]/i);
      if (match) {
        return `${baseUrl}/#/${match[1]}`;
      }
    }
  }
  return null;
}

// ===== Strategy 12: JavaScript onclick Links (Challenge 9.11-9.15) =====
function findJSPrivacyLinks(html: string, baseUrl: string): string | null {
  // Look for onclick handlers that navigate to privacy pages
  const onclickPatterns = [
    /onclick=["'][^"']*(?:location|href|navigate|router)[^"']*(?:privacy|خصوصية)[^"']*/gi,
    /window\.open\s*\(\s*['"]([^'"]*privacy[^'"]*)['"]/gi,
    /location\.href\s*=\s*['"]([^'"]*privacy[^'"]*)['"]/gi,
  ];

  for (const pattern of onclickPatterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      let url = match[1];
      if (!url.startsWith('http')) {
        try { url = new URL(url, baseUrl).href; } catch { continue; }
      }
      return url;
    }
  }
  return null;
}

// ===== Strategy 13: PDF Privacy Detection (Challenge 17.19) =====
async function checkPDFPrivacy(html: string, baseUrl: string): Promise<string | null> {
  // Find PDF links that might be privacy policies
  const pdfRegex = /<a\s+[^>]*href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  
  while ((match = pdfRegex.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();
    const fullText = (href + ' ' + linkText).toLowerCase();
    
    if (/privacy|خصوصية|حماية|سياسة|بيانات/i.test(fullText)) {
      let url = href;
      if (!url.startsWith('http')) {
        try { url = new URL(url, baseUrl).href; } catch { continue; }
      }
      return url;
    }
  }

  // Also check common PDF paths
  const pdfPaths = [
    '/privacy-policy.pdf', '/privacy.pdf',
    '/documents/privacy-policy.pdf', '/uploads/privacy-policy.pdf',
    '/media/privacy-policy.pdf', '/files/privacy-policy.pdf',
  ];

  for (const path of pdfPaths) {
    try {
      const testUrl = new URL(path, baseUrl).href;
      const resp = await fetch(testUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': getRandomUA() },
        signal: AbortSignal.timeout(4000),
      });
      if (resp.ok) {
        const ct = resp.headers.get('content-type') || '';
        if (ct.includes('pdf')) return testUrl;
      }
    } catch { /* not found */ }
  }

  return null;
}

// ===== Privacy Text Extraction (Enhanced) =====
async function extractPrivacyText(privacyUrl: string, ua?: string): Promise<{ text: string; html: string }> {
  try {
    const resp = await fetchWithRetry(privacyUrl, { timeout: PRIVACY_FETCH_TIMEOUT, ua });
    if (!resp.ok) return { text: '', html: '' };
    
    const contentType = resp.headers.get('content-type') || '';
    
    // Handle PDF responses (Challenge 17.19)
    if (contentType.includes('pdf')) {
      // Can't extract PDF text server-side without extra libs, but mark it
      return { text: '[PDF Privacy Policy detected - requires PDF extraction]', html: '' };
    }

    const html = await readResponseWithEncoding(resp);
    
    // Decode HTML entities (Challenge 16.4-16.6)
    let text = stripHtml(html);
    text = decodeHTMLEntities(text);
    
    // Handle paginated content (Challenge 13.5-13.8)
    // Check for "next page" or pagination links
    const nextPageUrl = findNextPageLink(html, privacyUrl);
    if (nextPageUrl) {
      try {
        const nextResp = await fetchWithRetry(nextPageUrl, { timeout: 8000, ua });
        if (nextResp.ok) {
          const nextHtml = await readResponseWithEncoding(nextResp);
          const nextText = stripHtml(nextHtml);
          text += '\n\n' + nextText;
        }
      } catch { /* pagination fetch failed */ }
    }

    // Handle accordion/tab content (Challenge 13.9-13.12)
    // Extract content from data attributes that might contain hidden content
    const hiddenContent = extractHiddenContent(html);
    if (hiddenContent) {
      text += '\n\n' + hiddenContent;
    }

    // If text is too short, it might be a SPA - try Puppeteer
    if (text.length < 100 && likelyNeedsPuppeteer(html)) {
      try {
        const puppeteerResult = await fetchPrivacyPageWithPuppeteer(privacyUrl);
        if (puppeteerResult.text.length > text.length) {
          return { text: puppeteerResult.text.slice(0, 20000), html: puppeteerResult.html };
        }
      } catch { /* Puppeteer fallback failed */ }
    }

    // Limit to 20000 chars for LLM analysis
    return { text: text.slice(0, 20000), html };
  } catch {
    // Try Puppeteer as last resort
    try {
      const puppeteerResult = await fetchPrivacyPageWithPuppeteer(privacyUrl);
      if (puppeteerResult.text.length > 100) {
        return { text: puppeteerResult.text.slice(0, 20000), html: puppeteerResult.html };
      }
    } catch { /* Puppeteer fallback also failed */ }
    return { text: '', html: '' };
  }
}

// ===== Find Next Page Link (Challenge 13.5-13.8) =====
function findNextPageLink(html: string, currentUrl: string): string | null {
  const nextPatterns = [
    /<a[^>]*class="[^"]*next[^"]*"[^>]*href=["']([^"']+)["']/i,
    /<a[^>]*href=["']([^"']+)["'][^>]*class="[^"]*next[^"]*"/i,
    /<a[^>]*rel="next"[^>]*href=["']([^"']+)["']/i,
    /<a[^>]*href=["']([^"']+)["'][^>]*>(?:التالي|Next|›|»|→)/i,
  ];

  for (const pattern of nextPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let url = match[1];
      if (!url.startsWith('http')) {
        try { url = new URL(url, currentUrl).href; } catch { continue; }
      }
      if (url !== currentUrl) return url;
    }
  }
  return null;
}

// ===== Extract Hidden Content (Challenge 13.9-13.12) =====
function extractHiddenContent(html: string): string | null {
  const hiddenPatterns = [
    // Accordion panels
    /<div[^>]*class="[^"]*(?:accordion|collapse|panel)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Tab panels
    /<div[^>]*class="[^"]*tab-?(?:pane|content|panel)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Data attributes with content
    /data-content=["']([^"']+)["']/gi,
  ];

  let content = '';
  for (const pattern of hiddenPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const text = stripHtml(match[1] || match[0]);
      if (text.length > 50 && isPrivacyContent(text)) {
        content += '\n' + text;
      }
    }
  }
  return content || null;
}

// ===== Contact Info Extraction (Enhanced) =====
function extractContactInfo(html: string, baseUrl: string): {
  emails: string[]; phones: string[]; socialLinks: Record<string, string>; contactUrl: string;
} {
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const rawEmails = html.match(emailRegex) || [];
  const emails = Array.from(new Set(rawEmails)).filter(e =>
    !e.includes('example.com') && !e.includes('wixpress') &&
    !e.includes('sentry.io') && !e.includes('webpack') &&
    !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') &&
    !e.includes('cloudflare') && !e.includes('jquery') &&
    !e.includes('bootstrap') && !e.includes('google-analytics') &&
    e.length < 100
  );

  // Extract phone numbers (Saudi + international format)
  const phoneRegex = /(?:\+966|00966|0)[\s\-]?(?:5\d{8}|1[1-9]\d{7}|800[\s\-]?\d{3,7})/g;
  const intlPhoneRegex = /(?:\+\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g;
  const rawPhones = [...(html.match(phoneRegex) || []), ...(html.match(intlPhoneRegex) || [])];
  const phones = Array.from(new Set(rawPhones.map(p => p.replace(/[\s\-]/g, '')))).filter(p => p.length >= 9 && p.length <= 16);

  // Extract social media links
  const socialLinks: Record<string, string> = {};
  const socialPatterns: Record<string, RegExp> = {
    twitter: /href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s]+)["']/i,
    linkedin: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'\s]+)["']/i,
    facebook: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i,
    instagram: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i,
    youtube: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'\s]+)["']/i,
    snapchat: /href=["'](https?:\/\/(?:www\.)?snapchat\.com\/[^"'\s]+)["']/i,
    tiktok: /href=["'](https?:\/\/(?:www\.)?tiktok\.com\/[^"'\s]+)["']/i,
    whatsapp: /href=["'](https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^"'\s]+)["']/i,
  };
  for (const [platform, pattern] of Object.entries(socialPatterns)) {
    const match = html.match(pattern);
    if (match) socialLinks[platform] = match[1];
  }

  // Find contact page link
  let contactUrl = '';
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();
    for (const pattern of CONTACT_LINK_PATTERNS) {
      if (pattern.test(linkText) || pattern.test(href)) {
        contactUrl = href;
        if (!contactUrl.startsWith('http')) {
          try { contactUrl = new URL(contactUrl, baseUrl).href; } catch { contactUrl = ''; }
        }
        break;
      }
    }
    if (contactUrl) break;
  }

  return { emails, phones, socialLinks, contactUrl };
}

// ===== Screenshot Capture =====
async function captureScreenshotForDomain(domain: string, url: string): Promise<string | null> {
  try {
    const screenshotApiUrl = `https://image.thum.io/get/width/1280/crop/900/noanimate/${url}`;
    const response = await fetch(screenshotApiUrl, {
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1000) return null;
    const filename = `deep-scan/${domain.replace(/\./g, '_')}_${Date.now()}.png`;
    const { url: s3Url } = await storagePut(filename, buffer, 'image/png');
    return s3Url;
  } catch {
    return null;
  }
}

// ===== LLM Compliance Analysis =====
async function analyzeComplianceDeep(text: string, domain: string): Promise<any> {
  try {
    const truncated = text.length > 12000 ? text.slice(0, 12000) : text;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `أنت محلل قانوني متخصص في نظام حماية البيانات الشخصية السعودي (PDPL).
حلل نص سياسة الخصوصية وقيّم مدى امتثالها للبنود الثمانية من المادة 12.

البنود الثمانية:
1. تحديد الغرض من جمع البيانات الشخصية
2. تحديد محتوى البيانات الشخصية المطلوب جمعها
3. تحديد طريقة جمع البيانات الشخصية
4. تحديد وسيلة حفظ البيانات الشخصية
5. تحديد كيفية معالجة البيانات الشخصية
6. تحديد كيفية إتلاف البيانات الشخصية
7. تحديد حقوق صاحب البيانات الشخصية فيما يتعلق ببياناته
8. تحديد كيفية ممارسة صاحب البيانات الشخصية لهذه الحقوق

التحليل يجب أن يكون ذكياً - لا يشترط وجود النص حرفياً بل يكفي وجود المعنى.
أجب بصيغة JSON فقط:
{
  "clause_1": {"compliant": true/false, "evidence": "دليل مختصر من النص"},
  "clause_2": {"compliant": true/false, "evidence": "..."},
  "clause_3": {"compliant": true/false, "evidence": "..."},
  "clause_4": {"compliant": true/false, "evidence": "..."},
  "clause_5": {"compliant": true/false, "evidence": "..."},
  "clause_6": {"compliant": true/false, "evidence": "..."},
  "clause_7": {"compliant": true/false, "evidence": "..."},
  "clause_8": {"compliant": true/false, "evidence": "..."},
  "overall_score": 0-100,
  "rating": "ممتاز/جيد/مقبول/ضعيف",
  "summary": "ملخص مختصر للتقييم",
  "recommendations": ["توصية 1", "توصية 2"]
}`
        },
        { role: "user", content: `حلل سياسة الخصوصية للموقع ${domain}:\n\n${truncated}` }
      ],
      response_format: { type: "json_object" as any },
    });
    const content = response.choices[0].message.content;
    return JSON.parse(typeof content === 'string' ? content : '{}');
  } catch (e) {
    console.error(`[DeepScanner] LLM analysis error for ${domain}:`, e);
    return null;
  }
}

// ===== Utility Functions =====
function stripHtml(html: string): string {
  // Try to extract main content area first (article, main, role=main)
  let content = html;
  const mainMatch = content.match(/<main[^>]*>[\s\S]*?<\/main>/i)
    || content.match(/<article[^>]*>[\s\S]*?<\/article>/i)
    || content.match(/<div[^>]*role=["']main["'][^>]*>[\s\S]*?<\/div>/i)
    || content.match(/<div[^>]*class=["'][^"']*(?:content|privacy|policy|main-content|page-content)[^"']*["'][^>]*>[\s\S]*?<\/div>/i);
  if (mainMatch && mainMatch[0].length > 200) {
    content = mainMatch[0];
  }
  // Remove non-content elements
  return content
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHTMLEntities(text: string): string {
  // Decode numeric HTML entities (Challenge 16.4-16.6)
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function isErrorPage(html: string): boolean {
  const htmlLower = html.toLowerCase();
  return ERROR_PAGE_PATTERNS.some(p => p.test(html)) ||
    (html.length < 2000 && (htmlLower.includes('error') || htmlLower.includes('not found') || htmlLower.includes('cannot')));
}

function isSoft404(html: string): boolean {
  return SOFT_404_PATTERNS.some(p => p.test(html));
}

function isParkingPage(html: string): boolean {
  return PARKING_PAGE_PATTERNS.some(p => p.test(html));
}

function isMaintenancePage(html: string): boolean {
  return MAINTENANCE_PATTERNS.some(p => p.test(html));
}

function detectCookieConsent(html: string): boolean {
  return COOKIE_CONSENT_PATTERNS.some(p => p.test(html));
}

function isPrivacyContent(text: string): boolean {
  const privacyKeywords = [
    'خصوصية', 'privacy', 'بيانات شخصية', 'personal data',
    'حماية البيانات', 'data protection', 'معلومات شخصية',
    'جمع البيانات', 'data collection', 'ملفات تعريف الارتباط', 'cookies',
    'سياسة الخصوصية', 'privacy policy', 'بيان الخصوصية',
    'حماية المعلومات', 'سرية المعلومات', 'نظام حماية البيانات',
    'PDPL', 'حقوق صاحب البيانات', 'data subject rights',
    'الأطراف الثالثة', 'third parties', 'الاحتفاظ بالبيانات', 'data retention',
  ];
  let matchCount = 0;
  for (const keyword of privacyKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) matchCount++;
  }
  return matchCount >= 2;
}

function detectLanguage(text: string): string {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabicChars > englishChars * 2) return 'ar';
  if (englishChars > arabicChars * 2) return 'en';
  return 'mixed';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Google Cache / Wayback Machine Fallback (Challenge 18.x) =====
async function fetchFromCacheFallback(domain: string): Promise<{ html: string; url: string; source: string } | null> {
  // Try Google Cache first
  try {
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(domain)}`;
    const resp = await fetch(cacheUrl, {
      headers: { 'User-Agent': getRandomUA() },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });
    if (resp.ok) {
      const html = await resp.text();
      if (html.length > 500 && !html.includes('did not match any documents')) {
        return { html, url: cacheUrl, source: 'google_cache' };
      }
    }
  } catch {}

  // Try Wayback Machine
  try {
    const wbUrl = `https://web.archive.org/web/2/${domain}`;
    const resp = await fetch(wbUrl, {
      headers: { 'User-Agent': getRandomUA() },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });
    if (resp.ok) {
      const html = await resp.text();
      if (html.length > 500) {
        return { html, url: resp.url || wbUrl, source: 'wayback_machine' };
      }
    }
  } catch {}

  return null;
}

// ===== Strategy 14: Check Terms/Legal Pages for Embedded Privacy (Challenge 13.x) =====
async function checkTermsPageForPrivacy(html: string, baseUrl: string): Promise<string | null> {
  const termsPatterns = [
    '/terms', '/terms-and-conditions', '/terms-of-service', '/legal',
    '/\u0627\u0644\u0634\u0631\u0648\u0637-\u0648\u0627\u0644\u0623\u062d\u0643\u0627\u0645', '/\u0634\u0631\u0648\u0637-\u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645',
  ];
  // First check if any terms links exist in the HTML
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const termsUrls: string[] = [];
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (/terms|\u0634\u0631\u0648\u0637|\u0623\u062d\u0643\u0627\u0645|legal|\u0642\u0627\u0646\u0648\u0646/i.test(text + ' ' + href)) {
      try {
        const url = new URL(href, baseUrl).href;
        if (url.startsWith('http')) termsUrls.push(url);
      } catch {}
    }
  }
  // Also try common terms patterns
  for (const p of termsPatterns) {
    try {
      termsUrls.push(new URL(p, baseUrl).href);
    } catch {}
  }
  // Fetch each terms page and check for privacy sections
  for (const url of Array.from(new Set(termsUrls)).slice(0, 3)) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': getRandomUA() },
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      });
      if (resp.ok) {
        const termsHtml = await resp.text();
        if (isPrivacyContent(termsHtml)) {
          return url;
        }
      }
    } catch {}
  }
  return null;
}

// ===== Strategy 15: Check hreflang Tags for Privacy Pages (Challenge 9.x) =====
function findPrivacyViaHreflang(html: string, baseUrl: string): string | null {
  const hreflangRegex = /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = hreflangRegex.exec(html)) !== null) {
    const href = match[2];
    if (/privacy|\u062e\u0635\u0648\u0635\u064a\u0629|\u062d\u0645\u0627\u064a\u0629/i.test(href)) {
      try {
        return new URL(href, baseUrl).href;
      } catch {}
    }
  }
  // Also check reverse pattern: href before hreflang
  const hreflangRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
  while ((match = hreflangRegex2.exec(html)) !== null) {
    const href = match[1];
    if (/privacy|\u062e\u0635\u0648\u0635\u064a\u0629|\u062d\u0645\u0627\u064a\u0629/i.test(href)) {
      try {
        return new URL(href, baseUrl).href;
      } catch {}
    }
  }
  return null;
}

// ===== Strategy 16: Check for iframe-embedded Privacy Content =====
function findPrivacyInIframes(html: string, baseUrl: string): string | null {
  const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = iframeRegex.exec(html)) !== null) {
    const src = match[1];
    if (/privacy|\u062e\u0635\u0648\u0635\u064a\u0629|\u062d\u0645\u0627\u064a\u0629|legal|policy/i.test(src)) {
      try {
        return new URL(src, baseUrl).href;
      } catch {}
    }
  }
  return null;
}

// ===== Strategy 17: About/Contact/Registration page scanning =====
async function checkAboutContactPages(html: string, baseUrl: string): Promise<string | null> {
  const pagePatterns = [
    /href=["']([^"']*(?:about|contact|عن|اتصل|تواصل|من-نحن|التسجيل|register|signup|sign-up)[^"']*)["']/gi,
  ];
  const pageUrls = new Set<string>();
  for (const pattern of pagePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url === '#' || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) continue;
      if (!url.startsWith('http')) {
        try { url = new URL(url, baseUrl).href; } catch { continue; }
      }
      try {
        const pageHost = new URL(url).hostname;
        const baseHost = new URL(baseUrl).hostname;
        if (pageHost !== baseHost && !pageHost.endsWith('.' + baseHost)) continue;
      } catch { continue; }
      pageUrls.add(url);
    }
  }
  for (const pageUrl of Array.from(pageUrls).slice(0, 3)) {
    try {
      const resp = await fetchWithRetry(pageUrl, { timeout: 6000, retries: 1 });
      if (resp && resp.ok) {
        const text = await resp.text();
        const privacyLink = findPrivacyLinks(text, baseUrl);
        if (privacyLink) return privacyLink;
      }
    } catch {}
  }
  return null;
}

// ===== Strategy 18: Third-party privacy service detection =====
function detectThirdPartyPrivacyService(html: string): string | null {
  const services: Array<{ pattern: RegExp; extract: (m: RegExpMatchArray) => string | null }> = [
    { pattern: /iubenda\.com\/privacy-policy\/([\d]+)/i, extract: (m) => `https://www.iubenda.com/privacy-policy/${m[1]}` },
    { pattern: /termly\.io\/(?:policy-viewer|embed)\/([a-zA-Z0-9-]+)/i, extract: (m) => `https://app.termly.io/policy-viewer/${m[1]}` },
    { pattern: /securiti\.ai\/privacycenter\/([^"'\s]+)/i, extract: (m) => `https://securiti.ai/privacycenter/${m[1]}` },
    { pattern: /getterms\.io\/view\/([^"'\s]+)/i, extract: (m) => `https://getterms.io/view/${m[1]}` },
  ];
  for (const { pattern, extract } of services) {
    const match = html.match(pattern);
    if (match) {
      const url = extract(match);
      if (url) return url;
    }
  }
  const iubEmbed = html.match(/data-iub-privacy-policy-url=["']([^"']+)["']/i);
  if (iubEmbed) return iubEmbed[1];
  const termlyEmbed = html.match(/data-termly-embed=["']([^"']+)["']/i);
  if (termlyEmbed) return termlyEmbed[1];
  return null;
}

// ===== Strategy 19: Google Docs / Notion / external privacy docs =====
function findExternalPrivacyDocs(html: string): string | null {
  const patterns = [
    /href=["'](https:\/\/docs\.google\.com\/document\/d\/[^"']+)["'][^>]*>([^<]*(?:privacy|خصوصية|حماية|سياسة)[^<]*)/gi,
    /href=["'](https:\/\/drive\.google\.com\/file\/d\/[^"']+)["'][^>]*>([^<]*(?:privacy|خصوصية|حماية|سياسة)[^<]*)/gi,
    /href=["'](https:\/\/[^"']*\.notion\.site\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    /href=["'](https:\/\/www\.notion\.so\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    /href=["'](https:\/\/[^"']*\.gitbook\.io\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
      if (hrefMatch) return hrefMatch[1];
    }
  }
  // Check Google Docs links near privacy text
  const docsLinks = html.match(/href=["'](https:\/\/docs\.google\.com\/document\/d\/[^"']+)["']/gi);
  if (docsLinks) {
    for (const link of docsLinks) {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const idx = html.indexOf(link);
        const ctx = html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 500));
        if (/privacy|خصوصية|حماية|سياسة/i.test(ctx)) return hrefMatch[1];
      }
    }
  }
  return null;
}

// ===== Strategy 20: Image map / SVG links / area tags =====
function findImageMapPrivacyLinks(html: string, baseUrl: string): string | null {
  const areaRegex = /<area[^>]*href=["']([^"']+)["'][^>]*(?:alt|title)=["']([^"']*)["'][^>]*>/gi;
  const areaRegex2 = /<area[^>]*(?:alt|title)=["']([^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = areaRegex.exec(html)) !== null) {
    if (/privacy|خصوصية|حماية|سياسة/i.test(match[1] + ' ' + match[2])) {
      try { return new URL(match[1], baseUrl).href; } catch {}
    }
  }
  while ((match = areaRegex2.exec(html)) !== null) {
    if (/privacy|خصوصية|حماية|سياسة/i.test(match[1] + ' ' + match[2])) {
      try { return new URL(match[2], baseUrl).href; } catch {}
    }
  }
  // SVG <a> tags
  const svgRegex = /<svg[\s\S]*?<a[^>]*(?:href|xlink:href)=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>[\s\S]*?<\/svg>/gi;
  while ((match = svgRegex.exec(html)) !== null) {
    if (/privacy|خصوصية|حماية|سياسة/i.test(match[1])) {
      try { return new URL(match[1], baseUrl).href; } catch {}
    }
  }
  // data-href attributes
  const dataHrefRegex = /data-href=["']([^"']*(?:privacy|خصوصية|حماية|سياسة)[^"']*)["']/gi;
  while ((match = dataHrefRegex.exec(html)) !== null) {
    try { return new URL(match[1], baseUrl).href; } catch {}
  }
  return null;
}

// ===== Batch Processing Engine (Worker-based) =====
import { fork, ChildProcess } from 'child_process';
import path from 'path';

let activeScanJobId: number | null = null;
let scanPaused = false;
let scanCancelled = false;
let activeWorkers: ChildProcess[] = [];

export function getActiveScanJobId() { return activeScanJobId; }
export function isScanPaused() { return scanPaused; }
export function isScanCancelled() { return scanCancelled; }

export function pauseScan() { scanPaused = true; }
export function resumeScan() { scanPaused = false; }
export function cancelScan() {
  scanCancelled = true;
  for (const w of activeWorkers) {
    try { w.kill('SIGTERM'); } catch {}
  }
  activeWorkers = [];
}

export function forceResetScanState() {
  activeScanJobId = null;
  scanPaused = false;
  scanCancelled = false;
  for (const w of activeWorkers) {
    try { w.kill('SIGTERM'); } catch {}
  }
  activeWorkers = [];
}

// Save scan result to DB
async function saveResultToDB(item: { id: number; domain: string }, result: DeepScanResult) {
  const validStatuses = ['compliant', 'partially_compliant', 'non_compliant', 'no_policy', 'error'];
  let safeStatus = result.complianceStatus;
  if (!validStatuses.includes(safeStatus)) safeStatus = 'no_policy';

  try {
    await db.updateDeepScanQueueItem(item.id, {
      status: result.siteReachable ? 'completed' : (result.errorMessage ? 'failed' : 'completed'),
      siteReachable: result.siteReachable,
      siteName: sanitizeText(result.siteName, 500),
      siteTitle: sanitizeText(result.siteTitle, 500),
      httpStatus: result.httpStatus,
      redirectUrl: sanitizeText(result.redirectUrl, 2000),
      privacyUrl: sanitizeText(result.privacyUrl, 2000),
      privacyMethod: sanitizeText(result.privacyMethod, 100),
      privacyTextContent: sanitizeText(result.privacyTextContent, 60000),
      privacyTextLength: result.privacyTextLength,
      privacyLanguage: sanitizeText(result.privacyLanguage, 10),
      screenshotUrl: sanitizeText(result.screenshotUrl, 2000),
      privacyScreenshotUrl: sanitizeText(result.privacyScreenshotUrl, 2000),
      contactUrl: sanitizeText(result.contactUrl, 2000),
      contactEmails: sanitizeText(result.contactEmails, 2000),
      contactPhones: sanitizeText(result.contactPhones, 2000),
      socialLinks: Object.keys(result.socialLinks || {}).length > 0 ? result.socialLinks : null,
      overallScore: result.overallScore,
      complianceStatus: safeStatus as any,
      clause1Compliant: result.clause1Compliant,
      clause1Evidence: sanitizeText(result.clause1Evidence, 5000),
      clause2Compliant: result.clause2Compliant,
      clause2Evidence: sanitizeText(result.clause2Evidence, 5000),
      clause3Compliant: result.clause3Compliant,
      clause3Evidence: sanitizeText(result.clause3Evidence, 5000),
      clause4Compliant: result.clause4Compliant,
      clause4Evidence: sanitizeText(result.clause4Evidence, 5000),
      clause5Compliant: result.clause5Compliant,
      clause5Evidence: sanitizeText(result.clause5Evidence, 5000),
      clause6Compliant: result.clause6Compliant,
      clause6Evidence: sanitizeText(result.clause6Evidence, 5000),
      clause7Compliant: result.clause7Compliant,
      clause7Evidence: sanitizeText(result.clause7Evidence, 5000),
      clause8Compliant: result.clause8Compliant,
      clause8Evidence: sanitizeText(result.clause8Evidence, 5000),
      summary: sanitizeText(result.summary, 5000),
      recommendations: (result.recommendations || []).length > 0 ? result.recommendations : null,
      rating: sanitizeText(result.rating, 50),
      errorMessage: sanitizeText(result.errorMessage, 2000),
      scanDuration: result.scanDuration,
      scannedAt: new Date(),
    });
  } catch (saveErr: any) {
    console.error(`[DeepScanner] Full save failed for ${item.domain}:`, saveErr.message?.substring(0, 150));
    try {
      await db.updateDeepScanQueueItem(item.id, {
        status: result.siteReachable ? 'completed' : 'failed',
        siteReachable: result.siteReachable,
        httpStatus: result.httpStatus,
        complianceStatus: safeStatus as any,
        overallScore: result.overallScore,
        errorMessage: sanitizeText(`Save error: ${saveErr.message}`, 500),
        scannedAt: new Date(),
      });
    } catch {
      try {
        await db.updateDeepScanQueueItem(item.id, {
          status: 'failed',
          errorMessage: 'DB save error',
          scannedAt: new Date(),
        });
      } catch {}
    }
  }
}

// Create a worker process
function createWorker(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(process.cwd(), 'server', 'scanWorker.ts');
    const tsxPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');
    const worker = fork(workerPath, [], {
      execPath: tsxPath,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    const timeout = setTimeout(() => {
      worker.kill('SIGTERM');
      reject(new Error('Worker startup timeout'));
    }, 10000);

    worker.once('message', (msg: any) => {
      if (msg.type === 'ready') {
        clearTimeout(timeout);
        resolve(worker);
      }
    });

    worker.once('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    worker.stdout?.on('data', () => {});
    worker.stderr?.on('data', () => {});
  });
}

// Scan with worker and recycle stuck workers
async function scanWithWorkerAndRecycle(
  workers: ChildProcess[],
  workerIdx: number,
  domain: string,
  id: number
): Promise<DeepScanResult> {
  const worker = workers[workerIdx];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(async () => {
      console.log(`[DeepScanner] Worker ${workerIdx} stuck on ${domain}, killing and replacing...`);
      worker.removeAllListeners('message');
      try { worker.kill('SIGKILL'); } catch {}

      const awIdx = activeWorkers.indexOf(worker);
      if (awIdx >= 0) activeWorkers.splice(awIdx, 1);

      try {
        const newWorker = await createWorker();
        workers[workerIdx] = newWorker;
        activeWorkers.push(newWorker);
        console.log(`[DeepScanner] Replacement worker ${workerIdx} ready`);
      } catch (e: any) {
        console.error(`[DeepScanner] Failed to create replacement worker:`, e.message);
      }

      reject(new Error('Worker killed (stuck)'));
    }, 50000); // Increased from 25s to 50s for deeper scanning

    const handler = (msg: any) => {
      if (msg.type === 'result' && msg.id === id) {
        clearTimeout(timeout);
        worker.removeListener('message', handler);
        resolve(msg.result);
      }
    };

    worker.on('message', handler);
    try {
      worker.send({ type: 'scan', domain, id });
    } catch (e) {
      clearTimeout(timeout);
      reject(new Error('Worker send failed'));
    }
  });
}

export async function startDeepScanJob(jobId: number, concurrency: number = 3) {
  if (activeScanJobId) {
    console.log(`[DeepScanner] Force-resetting previous scan job ${activeScanJobId}`);
    forceResetScanState();
  }

  const numWorkers = Math.min(Math.max(concurrency, 1), 10);
  activeScanJobId = jobId;
  scanPaused = false;
  scanCancelled = false;

  try {
    await db.resetStuckScanningItems(jobId);
    const stats0 = await db.getDeepScanQueueStats(jobId);
    console.log(`[DeepScanner v3.0] Starting job ${jobId} with ${numWorkers} workers. Pending: ${stats0?.pending || 0}, Completed: ${stats0?.completed || 0}, Failed: ${stats0?.failed || 0}`);

    await db.updateBatchScanJob(jobId, { status: 'running', startedAt: new Date() });

    const workers: ChildProcess[] = [];
    for (let i = 0; i < numWorkers; i++) {
      try {
        const w = await createWorker();
        workers.push(w);
        activeWorkers.push(w);
        console.log(`[DeepScanner] Worker ${i + 1}/${numWorkers} ready`);
      } catch (e: any) {
        console.error(`[DeepScanner] Failed to create worker ${i + 1}:`, e.message);
      }
    }

    if (workers.length === 0) {
      console.error('[DeepScanner] No workers could be created, aborting');
      await db.updateBatchScanJob(jobId, { status: 'failed' });
      return;
    }

    let totalProcessed = 0;
    const startTime = Date.now();

    while (true) {
      if (scanCancelled) {
        await db.updateBatchScanJob(jobId, { status: 'cancelled' });
        break;
      }

      if (scanPaused) {
        await db.updateBatchScanJob(jobId, { status: 'pending' });
        await sleep(2000);
        continue;
      }

      const items = await db.getNextPendingItems(jobId, workers.length);

      if (items.length === 0) {
        const stats = await db.getDeepScanQueueStats(jobId);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[DeepScanner v3.0] Job ${jobId} completed in ${elapsed}s! Total: ${stats?.total || 0}, Completed: ${stats?.completed || 0}, Failed: ${stats?.failed || 0}`);
        await db.updateBatchScanJob(jobId, {
          status: 'completed',
          completedAt: new Date(),
          completedUrls: stats?.completed || 0,
          failedUrls: stats?.failed || 0,
        });

        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: 'اكتمل المسح العميق v3.0',
            content: `تم الانتهاء من مسح ${stats?.total || 0} موقع. ناجح: ${stats?.completed || 0}، فاشل: ${stats?.failed || 0}`,
          });
        } catch {}
        break;
      }

      for (const item of items) {
        try {
          await db.updateDeepScanQueueItem(item.id, { status: 'scanning' });
        } catch {}
      }

      const scanPromises = items.map(async (item, idx) => {
        const workerIdx = idx % workers.length;
        try {
          const result = await scanWithWorkerAndRecycle(workers, workerIdx, item.domain, item.id);
          await saveResultToDB(item, result);
        } catch (e: any) {
          console.error(`[DeepScanner] Worker error for ${item.domain}:`, e.message?.substring(0, 100));
          try {
            await db.updateDeepScanQueueItem(item.id, {
              status: 'failed',
              errorMessage: sanitizeText(e.message || 'worker error', 500),
              scannedAt: new Date(),
            });
          } catch {}
        }
      });

      await Promise.allSettled(scanPromises);
      totalProcessed += items.length;

      if (totalProcessed % 20 === 0 || totalProcessed <= 5) {
        const stats = await db.getDeepScanQueueStats(jobId);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const rate = elapsed > 0 ? (totalProcessed / (elapsed / 60)).toFixed(0) : '0';
        console.log(`[DeepScanner v3.0] Progress: ${totalProcessed} processed (${rate}/min). Pending: ${stats?.pending || 0}, Completed: ${stats?.completed || 0}, Failed: ${stats?.failed || 0}`);

        if (stats) {
          await db.updateBatchScanJob(jobId, {
            completedUrls: stats.completed,
            failedUrls: stats.failed,
          });
        }
      }

      await sleep(200);
    }

    for (const w of workers) {
      try { w.send({ type: 'exit' }); } catch {}
      setTimeout(() => { try { w.kill('SIGTERM'); } catch {} }, 3000);
    }
  } catch (e: any) {
    console.error(`[DeepScanner v3.0] Job ${jobId} crashed:`, e.message);
  } finally {
    activeScanJobId = null;
    scanPaused = false;
    scanCancelled = false;
    for (const w of activeWorkers) {
      try { w.kill('SIGTERM'); } catch {}
    }
    activeWorkers = [];
  }
}
