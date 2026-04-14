/**
 * Deep Scan Worker v5.0 - Comprehensive Crawl Challenge Solutions
 * 
 * Covers 600+ crawl challenges across 28 categories:
 * - 148+ URL patterns for privacy page discovery
 * - 28 CMS detection types (WordPress, Drupal, Joomla, SharePoint, Shopify, Salla, Zid, Wix, Next.js, Nuxt.js, Laravel, Django, Rails, Strapi, Contentful, Sanity, etc.)
 * - Saudi-specific patterns (gov.sa, Salla, Zid, Arabic terms, PDPL, SDAIA, NCA, CITC)
 * - Enhanced error detection (soft-404, parking, maintenance, placeholder, under construction)
 * - Encoding handling (Windows-1256, ISO-8859-6, HTML entities, meta charset, BOM)
 * - Cookie consent banner detection and privacy link extraction
 * - Hash-routing and JavaScript link detection
 * - Subdomain checking (privacy.domain.sa, legal.domain.sa)
 * - PDF privacy policy detection
 * - Expanded User-Agent rotation pool
 * - Improved content extraction (accordion, tabs, iframe, modal, popup)
 * - Google Cache / Wayback Machine fallback for unreachable sites
 * - Legal page aggregation (terms pages containing privacy sections)
 * - hreflang tag parsing for multilingual sites
 * - Crawler trap detection (URL depth limit, visited URL tracking)
 * - Meta charset detection from HTML <meta> tags
 * - iframe content extraction for embedded privacy policies
 * - Enhanced Saudi regulatory patterns (PDPL, SDAIA, NCA, CITC)
 * - PrestaShop, BigCommerce, WooCommerce CMS detection
 * - Redirect chain following with loop detection
 * - Connection diagnostics (DNS, SSL, HTTP)
 */

// ===== Configuration =====
const USER_AGENTS = [
  // Desktop Chrome (latest versions)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Desktop Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:124.0) Gecko/20100101 Firefox/124.0',
  // Desktop Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  // Desktop Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  // Mobile Chrome
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
  // Mobile Safari
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
  // Googlebot (some sites serve different content)
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
];
const RASID_BOT_UA = 'Mozilla/5.0 (compatible; RasidBot/4.0; +https://rasid.sa)';
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1';
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const FETCH_TIMEOUT = 15000;
const PRIVACY_FETCH_TIMEOUT = 12000;
const GLOBAL_SCAN_TIMEOUT = 55000; // Increased for deeper scanning with fallbacks

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ===== CMS Types (Enhanced with more platforms) =====
type CMSType = 'wordpress' | 'woocommerce' | 'drupal' | 'joomla' | 'sharepoint' | 'shopify' | 'salla' | 'zid' |
  'wix' | 'squarespace' | 'blogger' | 'google_sites' | 'magento' | 'opencart' | 'prestashop' | 'bigcommerce' |
  'webflow' | 'ghost' | 'typo3' | 'hubspot' | 'nextjs' | 'nuxtjs' | 'laravel' | 'django' | 'rails' | 'strapi' | 'contentful' | 'sanity' | 'unknown';

// ===== CMS Detection (Enhanced - Challenge 22.x) =====
function detectCMS(html: string, headers?: Headers, url?: string): { cms: CMSType; confidence: number; indicators: string[] } {
  const htmlLower = html.toLowerCase();
  let cms: CMSType = 'unknown';
  let confidence = 0;
  const indicators: string[] = [];

  // WooCommerce (before WordPress - more specific)
  if ((htmlLower.includes('woocommerce') || htmlLower.includes('wc-block') || htmlLower.includes('wc_cart')) && htmlLower.includes('wp-content')) {
    cms = 'woocommerce'; confidence = 95; indicators.push('WooCommerce + WordPress indicators');
  }
  // WordPress
  else if (htmlLower.includes('wp-content') || htmlLower.includes('wp-includes') || htmlLower.includes('wordpress')) {
    cms = 'wordpress'; confidence = 95; indicators.push('WordPress indicators');
  } else if (/\/wp-json\//i.test(html) || /wp-emoji/i.test(html)) {
    cms = 'wordpress'; confidence = 85; indicators.push('wp-json or wp-emoji');
  }
  // Drupal
  if (cms === 'unknown' && (htmlLower.includes('drupal') || htmlLower.includes('/sites/default/files') || htmlLower.includes('drupal.settings'))) {
    cms = 'drupal'; confidence = 90; indicators.push('Drupal indicators');
  }
  // Joomla
  if (cms === 'unknown' && (htmlLower.includes('joomla') || htmlLower.includes('/media/system/js') || htmlLower.includes('com_content'))) {
    cms = 'joomla'; confidence = 90; indicators.push('Joomla indicators');
  }
  // SharePoint
  if (cms === 'unknown' && (htmlLower.includes('sharepoint') || htmlLower.includes('/_layouts/') || htmlLower.includes('microsoftonline') || htmlLower.includes('spfx') || htmlLower.includes('/_catalogs/'))) {
    cms = 'sharepoint'; confidence = 90; indicators.push('SharePoint indicators');
  }
  // Shopify
  if (cms === 'unknown' && (htmlLower.includes('shopify') || htmlLower.includes('cdn.shopify.com') || htmlLower.includes('myshopify.com'))) {
    cms = 'shopify'; confidence = 95; indicators.push('Shopify indicators');
  }
  // Salla (Saudi e-commerce)
  if (cms === 'unknown' && (htmlLower.includes('salla.sa') || htmlLower.includes('cdn.salla.sa') || htmlLower.includes('salla.network') || htmlLower.includes('salla-') || htmlLower.includes('"salla"'))) {
    cms = 'salla'; confidence = 95; indicators.push('Salla indicators');
  }
  // Zid (Saudi e-commerce)
  if (cms === 'unknown' && (htmlLower.includes('zid.sa') || htmlLower.includes('zid.store') || htmlLower.includes('cdn.zid.sa') || htmlLower.includes('web.zid'))) {
    cms = 'zid'; confidence = 95; indicators.push('Zid indicators');
  }
  // Wix
  if (cms === 'unknown' && (htmlLower.includes('wix.com') || htmlLower.includes('wixstatic.com') || htmlLower.includes('_wix_browser_sess'))) {
    cms = 'wix'; confidence = 95; indicators.push('Wix indicators');
  }
  // Squarespace
  if (cms === 'unknown' && (htmlLower.includes('squarespace') || htmlLower.includes('sqsp.net'))) {
    cms = 'squarespace'; confidence = 95; indicators.push('Squarespace indicators');
  }
  // Blogger
  if (cms === 'unknown' && (htmlLower.includes('blogger.com') || htmlLower.includes('blogspot.com') || htmlLower.includes('b:skin'))) {
    cms = 'blogger'; confidence = 95; indicators.push('Blogger indicators');
  }
  // Google Sites
  if (cms === 'unknown' && (htmlLower.includes('sites.google.com') || htmlLower.includes('googleusercontent.com/sites'))) {
    cms = 'google_sites'; confidence = 95; indicators.push('Google Sites indicators');
  }
  // Magento
  if (cms === 'unknown' && (htmlLower.includes('magento') || htmlLower.includes('mage/') || htmlLower.includes('/skin/frontend/'))) {
    cms = 'magento'; confidence = 85; indicators.push('Magento indicators');
  }
  // OpenCart
  if (cms === 'unknown' && (htmlLower.includes('opencart') || htmlLower.includes('catalog/view/theme'))) {
    cms = 'opencart'; confidence = 85; indicators.push('OpenCart indicators');
  }
  // PrestaShop (NEW)
  if (cms === 'unknown' && (htmlLower.includes('prestashop') || htmlLower.includes('presta-') || htmlLower.includes('/modules/ps_'))) {
    cms = 'prestashop'; confidence = 85; indicators.push('PrestaShop indicators');
  }
  // BigCommerce (NEW)
  if (cms === 'unknown' && (htmlLower.includes('bigcommerce') || htmlLower.includes('cdn11.bigcommerce') || htmlLower.includes('stencil-utils'))) {
    cms = 'bigcommerce'; confidence = 90; indicators.push('BigCommerce indicators');
  }
  // Webflow (NEW)
  if (cms === 'unknown' && (htmlLower.includes('webflow') || htmlLower.includes('assets-global.website-files.com') || htmlLower.includes('wf-'))) {
    cms = 'webflow'; confidence = 90; indicators.push('Webflow indicators');
  }
  // Ghost (NEW)
  if (cms === 'unknown' && (htmlLower.includes('ghost-') || htmlLower.includes('ghost.org') || htmlLower.includes('content/images/') && htmlLower.includes('ghost'))) {
    cms = 'ghost'; confidence = 85; indicators.push('Ghost indicators');
  }
  // TYPO3 (NEW)
  if (cms === 'unknown' && (htmlLower.includes('typo3') || htmlLower.includes('/typo3conf/') || htmlLower.includes('/typo3temp/'))) {
    cms = 'typo3'; confidence = 85; indicators.push('TYPO3 indicators');
  }
  // HubSpot (NEW)
  if (cms === 'unknown' && (htmlLower.includes('hubspot') || htmlLower.includes('hs-scripts.com') || htmlLower.includes('hbspt'))) {
    cms = 'hubspot'; confidence = 85; indicators.push('HubSpot indicators');
  }
  // Next.js
  if (cms === 'unknown' && (htmlLower.includes('__next') || htmlLower.includes('_next/static') || htmlLower.includes('next/dist') || htmlLower.includes('__next_f'))) {
    cms = 'nextjs'; confidence = 90; indicators.push('Next.js indicators');
  }
  // Nuxt.js
  if (cms === 'unknown' && (htmlLower.includes('__nuxt') || htmlLower.includes('_nuxt/') || htmlLower.includes('nuxt.config') || htmlLower.includes('nuxt-link'))) {
    cms = 'nuxtjs'; confidence = 90; indicators.push('Nuxt.js indicators');
  }
  // Laravel
  if (cms === 'unknown' && (htmlLower.includes('laravel') || htmlLower.includes('csrf-token') && htmlLower.includes('app.js') || htmlLower.includes('/vendor/laravel'))) {
    cms = 'laravel'; confidence = 80; indicators.push('Laravel indicators');
  }
  // Django
  if (cms === 'unknown' && (htmlLower.includes('csrfmiddlewaretoken') || htmlLower.includes('django') || htmlLower.includes('/static/admin/'))) {
    cms = 'django'; confidence = 80; indicators.push('Django indicators');
  }
  // Rails
  if (cms === 'unknown' && (htmlLower.includes('csrf-param') && htmlLower.includes('csrf-token') || htmlLower.includes('turbolinks') || htmlLower.includes('rails-ujs'))) {
    cms = 'rails'; confidence = 80; indicators.push('Rails indicators');
  }
  // Strapi
  if (cms === 'unknown' && (htmlLower.includes('strapi') || htmlLower.includes('/uploads/') && htmlLower.includes('api/'))) {
    cms = 'strapi'; confidence = 75; indicators.push('Strapi indicators');
  }
  // Contentful
  if (cms === 'unknown' && (htmlLower.includes('contentful') || htmlLower.includes('ctfassets.net'))) {
    cms = 'contentful'; confidence = 85; indicators.push('Contentful indicators');
  }
  // Sanity
  if (cms === 'unknown' && (htmlLower.includes('sanity.io') || htmlLower.includes('cdn.sanity.io'))) {
    cms = 'sanity'; confidence = 85; indicators.push('Sanity indicators');
  }

  return { cms, confidence, indicators };
}

// ===== CMS-Specific Privacy URL Patterns (Enhanced) =====
function getCMSSpecificPatterns(cms: CMSType): string[] {
  switch (cms) {
    case 'wordpress':
    case 'woocommerce':
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
        '/taxonomy/term/privacy',
      ];
    case 'joomla':
      return [
        '/index.php/privacy-policy', '/index.php/privacy', '/privacy-policy',
        '/index.php/ar/privacy-policy', '/index.php/en/privacy-policy',
        '/component/content/article/privacy-policy',
        '/index.php?option=com_content&view=article&catid=privacy',
      ];
    case 'sharepoint':
      return [
        '/Pages/PrivacyPolicy.aspx', '/SitePages/Privacy.aspx',
        '/Pages/Privacy.aspx', '/SitePages/PrivacyPolicy.aspx',
        '/Pages/privacy-policy.aspx', '/_layouts/15/Privacy.aspx',
        '/ar/Pages/PrivacyPolicy.aspx', '/en/Pages/PrivacyPolicy.aspx',
        '/SitePages/سياسة-الخصوصية.aspx',
        '/ar/SitePages/Privacy.aspx', '/en/SitePages/Privacy.aspx',
      ];
    case 'shopify':
      return [
        '/policies/privacy-policy', '/pages/privacy-policy', '/privacy-policy',
        '/pages/privacy', '/policies/privacy',
        '/pages/سياسة-الخصوصية',
      ];
    case 'salla':
      return [
        '/pages/privacy', '/pages/privacy-policy', '/privacy-policy',
        '/pages/سياسة-الخصوصية', '/privacy',
        '/pages/terms-and-conditions', '/pages/الشروط-والأحكام',
        '/pages/الخصوصية', '/page/privacy',
      ];
    case 'zid':
      return [
        '/privacy-policy', '/pages/privacy-policy', '/privacy',
        '/pages/privacy', '/pages/سياسة-الخصوصية',
        '/page/privacy-policy',
      ];
    case 'wix':
      return [
        '/privacy-policy', '/privacy', '/blank-1', '/blank-2',
        '/privacy-policy-1', '/legal/privacy',
        '/سياسة-الخصوصية',
      ];
    case 'squarespace':
      return ['/privacy-policy', '/privacy', '/legal/privacy-policy', '/legal'];
    case 'blogger':
      return ['/p/privacy-policy.html', '/p/privacy.html', '/p/blog-page.html'];
    case 'google_sites':
      return ['/privacy-policy', '/privacy', '/p/privacy'];
    case 'magento':
      return ['/privacy-policy-cookie-restriction-mode', '/privacy-policy', '/privacy', '/customer-service/privacy-policy'];
    case 'prestashop':
      return ['/content/2-legal-notice', '/content/3-terms-and-conditions', '/privacy', '/privacy-policy', '/cms/privacy'];
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

// ===== Comprehensive Privacy URL Patterns (80+ patterns) =====
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
  '/data-protection', '/data-protection-policy',
  '/gdpr', '/gdpr-policy', '/ccpa', '/ccpa-policy',
  '/cookie-policy', '/cookies-policy',
  // Arabic encoded
  '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // سياسة-الخصوصية
  '/%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // الخصوصية
  '/%D8%AD%D9%85%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA', // حماية-البيانات
  '/%D8%A8%D9%8A%D8%A7%D9%86-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', // بيان-الخصوصية
  '/%D8%B3%D8%B1%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA', // سرية-المعلومات
  '/%D8%AD%D9%85%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9', // حماية-البيانات-الشخصية
  // Arabic paths (non-encoded)
  '/ar/privacy', '/ar/privacy-policy', '/ar/سياسة-الخصوصية',
  '/ar/الخصوصية', '/ar/حماية-البيانات',
  // Multi-language patterns
  '/privacy-ar', '/privacy-en', '/privacy/ar', '/privacy/en',
  '/fr/privacy', '/fr/politique-de-confidentialite',
  '/ur/privacy', '/tr/gizlilik-politikasi',
  // Terms that often contain privacy
  '/terms-and-conditions', '/terms', '/legal',
  '/terms-of-service', '/terms-of-use',
  '/الشروط-والأحكام', '/شروط-الاستخدام',
  // Gov.sa specific (Challenge 17.1)
  '/Pages/PrivacyPolicy.aspx', '/SitePages/Privacy.aspx',
  '/ar/Pages/PrivacyPolicy.aspx', '/en/Pages/PrivacyPolicy.aspx',
  // PDF patterns (Challenge 17.19)
  '/privacy-policy.pdf', '/privacy.pdf',
  '/documents/privacy-policy.pdf', '/uploads/privacy-policy.pdf',
  '/wp-content/uploads/privacy-policy.pdf',
  '/media/privacy-policy.pdf', '/files/privacy-policy.pdf',
  '/assets/privacy-policy.pdf', '/static/privacy-policy.pdf',
  // Hash-based routing (Challenge 9.11-9.15)
  '/#/privacy', '/#/privacy-policy', '/#privacy',
  '/#/سياسة-الخصوصية', '/#/الخصوصية',
  // Additional common patterns
  '/disclaimer', '/notice', '/data-notice',
  '/information-notice', '/privacy-center',
  '/your-privacy-choices', '/do-not-sell',
  // German
  '/datenschutz', '/datenschutzerklaerung', '/datenschutzrichtlinie',
  '/de/datenschutz', '/de/privacy',
  // Spanish
  '/politica-de-privacidad', '/aviso-de-privacidad',
  '/es/privacidad', '/es/privacy',
  // Portuguese
  '/politica-de-privacidade', '/pt/privacidade', '/pt/privacy',
  // Italian
  '/informativa-privacy', '/it/privacy',
  // Turkish
  '/gizlilik-politikasi', '/tr/gizlilik', '/tr/privacy',
  // Indonesian/Malay
  '/kebijakan-privasi', '/dasar-privasi',
  // Dutch
  '/privacybeleid', '/nl/privacy',
  // Russian
  '/politika-konfidencialnosti', '/ru/privacy',
  // Blogger-specific
  '/p/privacy-policy.html', '/p/privacy.html',
  // MediaWiki
  '/wiki/Privacy_policy', '/wiki/سياسة_الخصوصية',
  // Confluence
  '/display/privacy', '/pages/viewpage.action?pageId=privacy',
  // Notion (public pages)
  '/privacy-policy-', '/Privacy-Policy-',
  // Third-party privacy services
  '/privacy-policy-iubenda', '/cookie-policy-iubenda',
  // Registration/signup pages that may link to privacy
  '/register', '/signup', '/sign-up', '/التسجيل',
  // About pages that may contain privacy info
  '/about', '/about-us', '/من-نحن', '/عن-الموقع',
];

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

// ===== Privacy Link Text Patterns (Enhanced - Challenge 9.1-9.3, 17.10) =====
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
  /datenschutz/i,
  /datenschutzerkl/i,
  /datenschutzrichtlinie/i,
  // Spanish
  /pol[ií]tica\s*de\s*privacidad/i,
  /protecci[oó]n\s*de\s*datos/i,
  /aviso\s*de\s*privacidad/i,
  // Portuguese
  /pol[ií]tica\s*de\s*privacidade/i,
  /prote[çc][ãa]o\s*de\s*dados/i,
  // Italian
  /informativa\s*sulla\s*privacy/i,
  /politica\s*sulla\s*privacy/i,
  /protezione\s*dei\s*dati/i,
  // Dutch
  /privacybeleid/i,
  /privacyverklaring/i,
  /gegevensbescherming/i,
  // Russian
  /политика\s*конфиденциальности/i,
  /защита\s*данных/i,
  /конфиденциальность/i,
  // Chinese
  /隐私政策/,
  /隐私声明/,
  /数据保护/,
  // Japanese
  /プライバシーポリシー/,
  /個人情報保護/,
  // Korean
  /개인정보\s*처리방침/,
  /개인정보\s*보호/,
  // Hindi
  /गोपनीयता\s*नीति/,
  // Urdu
  /رازداری\s*کی\s*پالیسی/i,
  /نجی\s*معلومات/i,
  // Persian/Farsi
  /سیاست\s*حفظ\s*حریم\s*خصوصی/i,
  /حریم\s*خصوصی/i,
  // Malay/Indonesian
  /dasar\s*privasi/i,
  /kebijakan\s*privasi/i,
  /perlindungan\s*data/i,
  // Third-party privacy service indicators
  /iubenda/i,
  /termly/i,
  /cookiebot/i,
  /onetrust/i,
  /trustarc/i,
  /securiti\.ai/i,
];

const CONTACT_LINK_PATTERNS = [
  /تواصل/i, /اتصل/i, /contact/i, /اتصل\s*بنا/i, /تواصل\s*معنا/i,
  /contact\s*us/i, /get\s*in\s*touch/i, /support/i, /الدعم/i,
  /خدمة\s*العملاء/i, /customer\s*service/i,
  /مركز\s*المساعدة/i, /help\s*center/i,
];

// ===== Error/Parking/Maintenance Detection (Enhanced - Challenge 11.x) =====
const ERROR_PAGE_PATTERNS = [
  /this\s*site\s*can'?t\s*be\s*reached/i,
  /err_connection_refused/i, /err_name_not_resolved/i,
  /err_connection_timed_out/i, /err_connection_reset/i,
  /dns_probe_finished/i, /502\s*bad\s*gateway/i,
  /503\s*service\s*unavailable/i,
  /server\s*error/i, /الصفحة\s*غير\s*موجودة/i,
  /خطأ\s*في\s*الخادم/i, /الموقع\s*غير\s*متاح/i,
  /unexpectedly\s*closed\s*the\s*connection/i,
  /took\s*too\s*long\s*to\s*respond/i,
  /refused\s*to\s*connect/i,
  /err_ssl_protocol_error/i,
  /err_cert_authority_invalid/i,
  /err_cert_common_name_invalid/i,
  /net::err_/i,
];

const SOFT_404_PATTERNS = [
  /page\s*not\s*found/i, /404\s*error/i, /not\s*found/i,
  /الصفحة\s*غير\s*موجودة/i, /لم\s*يتم\s*العثور/i,
  /الصفحة\s*المطلوبة\s*غير\s*متوفرة/i,
  /oops.*page.*exist/i, /sorry.*page.*found/i,
  /this\s*page\s*doesn'?t\s*exist/i,
  /الصفحة\s*التي\s*تبحث\s*عنها\s*غير\s*موجودة/i,
  /we\s*couldn'?t\s*find/i,
  /nothing\s*here/i,
  /page\s*you'?re?\s*looking\s*for/i,
  /الصفحة\s*المطلوبة\s*غير\s*متاحة/i,
  // Additional patterns
  /error\s*404/i, /http\s*404/i,
  /الصفحة\s*غير\s*متاحة/i,
  /عذراً.*الصفحة/i,
  /page\s*does\s*not\s*exist/i,
  /content\s*not\s*found/i,
  /no\s*page\s*found/i,
  /requested\s*page.*not/i,
  /الصفحة\s*المطلوبة\s*لا\s*توجد/i,
  /هذه\s*الصفحة\s*غير\s*موجودة/i,
];

const PARKING_PAGE_PATTERNS = [
  /domain\s*is\s*for\s*sale/i, /buy\s*this\s*domain/i,
  /this\s*domain\s*is\s*parked/i, /domain\s*parking/i,
  /هذا\s*النطاق\s*للبيع/i, /النطاق\s*متاح\s*للشراء/i,
  /godaddy/i, /namecheap.*parking/i, /sedo.*domain/i,
  /hugedomains/i, /dan\.com/i, /afternic/i,
  /register\s*this\s*domain/i, /domain\s*available/i,
  /domain\s*has\s*expired/i, /this\s*domain\s*has\s*been\s*registered/i,
  /هذا\s*النطاق\s*مسجل/i,
  /sedoparking/i, /parkingcrew/i,
];

const MAINTENANCE_PATTERNS = [
  /under\s*construction/i, /coming\s*soon/i, /تحت\s*الإنشاء/i,
  /قريبا/i, /الموقع\s*تحت\s*الصيانة/i, /maintenance\s*mode/i,
  /we'?ll\s*be\s*back/i, /temporarily\s*unavailable/i,
  /site\s*is\s*being\s*updated/i, /الموقع\s*قيد\s*التطوير/i,
  /launching\s*soon/i, /نعمل\s*على\s*تطوير/i,
  /be\s*right\s*back/i, /currently\s*unavailable/i,
  /scheduled\s*maintenance/i, /صيانة\s*مجدولة/i,
  /الموقع\s*سيعود\s*قريبا/i,
  // Additional patterns
  /قيد\s*الإنشاء/i, /الموقع\s*قيد\s*الصيانة/i,
  /الموقع\s*تحت\s*التطوير/i,
  /site\s*under\s*maintenance/i,
  /website\s*is\s*under\s*construction/i,
  /we\s*are\s*working\s*on/i,
  /stay\s*tuned/i, /ترقبونا/i,
  /opening\s*soon/i, /سيتم\s*الإطلاق/i,
  /website\s*coming\s*soon/i,
  /الموقع\s*في\s*طور\s*الإنشاء/i,
];

const COOKIE_CONSENT_PATTERNS = [
  /cookie.*consent/i, /cookie.*banner/i, /cookie.*notice/i,
  /accept.*cookie/i, /ملفات\s*تعريف\s*الارتباط/i,
  /نستخدم\s*ملفات/i, /we\s*use\s*cookies/i,
  /cookie.*preferences/i, /manage.*cookies/i,
  /gdpr/i, /ccpa/i,
  /onetrust/i, /cookiebot/i, /cookie-law/i,
  /cookie-consent/i, /cookie-notice/i,
  // OneTrust specific selectors
  /optanon/i, /ot-sdk/i, /onetrust-consent/i,
  // CookieBot specific
  /CybotCookiebot/i, /cookiebot-widget/i,
  // Quantcast
  /quantcast/i, /qc-cmp/i,
  // TrustArc
  /trustarc/i, /truste/i, /consent-manager/i,
  // Osano
  /osano/i, /cookieconsent/i,
  // Complianz
  /complianz/i, /cmplz/i,
  // iubenda
  /iubenda/i, /iub-cookie/i,
  // Termly
  /termly/i, /termly-embed/i,
];

// ===== Interstitial / DDoS Protection Detection (Challenge 25.x) =====
const INTERSTITIAL_PATTERNS = [
  /checking\s*your\s*browser/i,
  /please\s*wait.*redirect/i,
  /just\s*a\s*moment/i,
  /ddos\s*protection/i,
  /attention\s*required/i,
  /cloudflare/i,
  /sucuri/i,
  /stackpath/i,
  /incapsula/i,
  /akamai/i,
  /imperva/i,
  /يرجى\s*الانتظار/i,
  /جاري\s*التحقق/i,
  /cf-browser-verification/i,
  /challenge-platform/i,
  /ray\s*id/i,
];

function isInterstitialPage(html: string): boolean {
  if (html.length > 50000) return false; // Real pages are usually larger
  let matchCount = 0;
  for (const pattern of INTERSTITIAL_PATTERNS) {
    if (pattern.test(html)) matchCount++;
  }
  return matchCount >= 2;
}

// ===== URL Normalization (Challenge 12.x - Tracking parameter cleanup) =====
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid',
      'mc_cid', 'mc_eid', 'ref', 'source', 'campaign',
      '_ga', '_gl', '_hsenc', '_hsmi', 'hsa_cam', 'hsa_grp',
      'PHPSESSID', 'JSESSIONID', 'sid', 'session_id', 'sessionid',
      'token', 'auth', 'ticket',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
      parsed.searchParams.delete(param.toUpperCase());
    }
    // Remove trailing slashes for consistency
    let normalized = parsed.href;
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

// ===== Base Tag Resolution (Challenge 25.x) =====
function resolveBaseUrl(html: string, pageUrl: string): string {
  const baseMatch = html.match(/<base[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (baseMatch) {
    try {
      return new URL(baseMatch[1], pageUrl).href;
    } catch {}
  }
  return pageUrl;
}

// ===== Interfaces =====
interface DeepScanResult {
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

// ===== Utility Functions =====
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim().slice(0, 500) : '';
}

function isErrorPage(html: string): boolean {
  if (html.length < 500) {
    const htmlLower = html.toLowerCase();
    if (htmlLower.includes('error') || htmlLower.includes('not found') || htmlLower.includes('cannot')) return true;
  }
  if (html.length < 5000) {
    return ERROR_PAGE_PATTERNS.some(p => p.test(html));
  }
  return false;
}

function isSoft404(html: string): boolean {
  if (html.length < 15000) {
    return SOFT_404_PATTERNS.some(p => p.test(html));
  }
  return false;
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
  const textLower = text.toLowerCase();
  const textLen = text.length;

  // Strong indicators - phrases that almost certainly indicate a privacy policy
  const strongIndicators = [
    'سياسة الخصوصية', 'privacy policy', 'بيان الخصوصية', 'privacy notice',
    'privacy statement', 'إشعار الخصوصية', 'حماية البيانات الشخصية',
    'personal data protection', 'نظام حماية البيانات', 'data protection policy',
    'سياسة حماية البيانات', 'PDPL', 'نظام حماية البيانات الشخصية',
  ];

  // Medium indicators - common privacy-related terms
  const mediumIndicators = [
    'خصوصية', 'privacy', 'بيانات شخصية', 'personal data',
    'حماية البيانات', 'data protection', 'معلومات شخصية', 'personal information',
    'جمع البيانات', 'data collection', 'حقوق صاحب البيانات', 'data subject rights',
    'الاحتفاظ بالبيانات', 'data retention', 'الأطراف الثالثة', 'third parties',
    'حماية المعلومات', 'سرية المعلومات', 'information security',
    'ملفات تعريف الارتباط', 'cookies',
    'إفصاح', 'disclosure', 'معالجة البيانات', 'data processing',
    'الموافقة', 'consent', 'حق الوصول', 'right of access',
    'sdaia', 'سدايا',
  ];

  let strongCount = 0;
  let mediumCount = 0;

  for (const keyword of strongIndicators) {
    if (textLower.includes(keyword.toLowerCase())) strongCount++;
  }

  for (const keyword of mediumIndicators) {
    if (textLower.includes(keyword.toLowerCase())) mediumCount++;
  }

  // If text is very short (< 300 chars), it's likely NOT a real privacy policy page
  if (textLen < 300) return false;

  // Strong indicator found + at least 1 medium = definitely privacy content
  if (strongCount >= 1 && mediumCount >= 1) return true;

  // Multiple medium indicators with sufficient text length
  if (mediumCount >= 3 && textLen >= 500) return true;

  // Many medium indicators even with shorter text
  if (mediumCount >= 4) return true;

  return false;
}

// Enhanced: Check if text contains privacy content embedded in terms/legal page
function containsPrivacySection(text: string): boolean {
  const sectionHeaders = [
    /سياسة\s*الخصوصية/i, /privacy\s*policy/i,
    /حماية\s*البيانات/i, /data\s*protection/i,
    /الخصوصية/i, /privacy/i,
    /بيانات\s*شخصية/i, /personal\s*data/i,
    /سرية\s*المعلومات/i, /confidentiality/i,
    /جمع\s*واستخدام\s*البيانات/i, /collection\s*and\s*use/i,
  ];
  let headerCount = 0;
  for (const pattern of sectionHeaders) {
    if (pattern.test(text)) headerCount++;
  }
  return headerCount >= 2 && text.length > 500;
}

function detectLanguage(text: string): string {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabicChars > englishChars * 2) return 'ar';
  if (englishChars > arabicChars * 2) return 'en';
  return 'mixed';
}

// ===== Encoding-Aware Response Reader (Enhanced - Challenge 16.x) =====
async function readResponseWithEncoding(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || '';
    const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
    let charset = charsetMatch ? charsetMatch[1].toLowerCase().replace(/['"]/g, '') : '';

    if (!charset || charset === 'utf-8' || charset === 'utf8') {
      const text = await response.text();
      // Check for meta charset in HTML if no charset in header (Challenge 16.3)
      if (!charset) {
        const metaCharset = text.match(/<meta[^>]*charset=["']?([^"'\s;>]+)/i);
        if (metaCharset) {
          const detectedCharset = metaCharset[1].toLowerCase();
          if (detectedCharset !== 'utf-8' && detectedCharset !== 'utf8') {
            // Re-decode with correct charset if possible
            // Note: In fetch-based approach, we can't re-read the body
            // But we can detect mojibake and flag it
            charset = detectedCharset;
          }
        }
      }
      return text;
    }

    const buffer = await response.arrayBuffer();
    
    // Check for BOM (Byte Order Mark) - Challenge 16.7
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      // UTF-8 BOM
      return new TextDecoder('utf-8').decode(buffer.slice(3));
    }
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      // UTF-16 LE BOM
      return new TextDecoder('utf-16le').decode(buffer.slice(2));
    }
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      // UTF-16 BE BOM
      return new TextDecoder('utf-16be').decode(buffer.slice(2));
    }

    try {
      const decoder = new TextDecoder(charset);
      return decoder.decode(buffer);
    } catch {
      // Fallback chain for Arabic sites
      const fallbackCharsets = ['windows-1256', 'iso-8859-6', 'utf-8'];
      for (const fb of fallbackCharsets) {
        try {
          const decoder = new TextDecoder(fb);
          return decoder.decode(buffer);
        } catch { continue; }
      }
      return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    }
  } catch {
    return await response.text();
  }
}

// ===== Fetch Functions =====
async function safeFetch(url: string, timeout: number, userAgent?: string): Promise<{ html: string; response: Response } | null> {
  const ua = userAgent || getRandomUA();
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
        'Connection': 'keep-alive',
      },
      signal: AbortSignal.timeout(timeout),
      redirect: 'follow',
    });
    const html = await readResponseWithEncoding(response);
    return { html, response };
  } catch {
    return null;
  }
}

// Fetch with exponential backoff retry (Challenge 1.13)
async function fetchWithRetry(url: string, timeout: number, retries: number = 2, ua?: string): Promise<{ html: string; response: Response } | null> {
  let lastResult: { html: string; response: Response } | null = null;
  for (let i = 0; i <= retries; i++) {
    const result = await safeFetch(url, timeout, ua);
    if (result && result.response.ok) return result;
    if (result) lastResult = result;
    if (i < retries) await sleep(300 * Math.pow(2, i));
  }
  return lastResult;
}

// Try HTTPS first, then HTTP with 403 handling (Enhanced with redirect chain tracking)
// Includes: interstitial detection, 429/503 retry, enhanced error status handling
async function fetchDomain(domain: string): Promise<{ html: string; status: number; url: string; protocol: string; sslValid: boolean; redirectChain: string[]; isInterstitial: boolean } | null> {
  const ua = getRandomUA();
  const redirectChain: string[] = [];

  // Try HTTPS first
  const httpsResult = await fetchWithRetry(`https://${domain}`, FETCH_TIMEOUT, 1, ua);
  if (httpsResult && httpsResult.response.ok) {
    if (httpsResult.response.url !== `https://${domain}` && httpsResult.response.url !== `https://${domain}/`) {
      redirectChain.push(`https://${domain} → ${httpsResult.response.url}`);
    }
    const interstitial = isInterstitialPage(httpsResult.html);
    // If interstitial detected, wait and retry once
    if (interstitial) {
      await sleep(5000);
      const retryResult = await safeFetch(`https://${domain}`, FETCH_TIMEOUT, ua);
      if (retryResult && retryResult.response.ok && !isInterstitialPage(retryResult.html)) {
        return {
          html: retryResult.html,
          status: retryResult.response.status,
          url: retryResult.response.url,
          protocol: 'https',
          sslValid: true,
          redirectChain,
          isInterstitial: false,
        };
      }
    }
    return {
      html: httpsResult.html,
      status: httpsResult.response.status,
      url: httpsResult.response.url,
      protocol: 'https',
      sslValid: true,
      redirectChain,
      isInterstitial: interstitial,
    };
  }

  // Handle 429 (Too Many Requests) - wait and retry
  if (httpsResult && httpsResult.response.status === 429) {
    const retryAfter = httpsResult.response.headers.get('retry-after');
    const waitMs = retryAfter ? Math.min(parseInt(retryAfter) * 1000, 10000) : 5000;
    await sleep(waitMs);
    const retryResult = await safeFetch(`https://${domain}`, FETCH_TIMEOUT, ua);
    if (retryResult && retryResult.response.ok) {
      return {
        html: retryResult.html,
        status: retryResult.response.status,
        url: retryResult.response.url,
        protocol: 'https',
        sslValid: true,
        redirectChain,
        isInterstitial: false,
      };
    }
  }

  // Handle 503 (Service Unavailable) - wait and retry
  if (httpsResult && httpsResult.response.status === 503) {
    await sleep(3000);
    const retryResult = await safeFetch(`https://${domain}`, FETCH_TIMEOUT, ua);
    if (retryResult && retryResult.response.ok) {
      return {
        html: retryResult.html,
        status: retryResult.response.status,
        url: retryResult.response.url,
        protocol: 'https',
        sslValid: true,
        redirectChain,
        isInterstitial: false,
      };
    }
  }

  // Try HTTP fallback
  const httpResult = await fetchWithRetry(`http://${domain}`, FETCH_TIMEOUT, 1, ua);
  if (httpResult && httpResult.response.ok) {
    if (httpResult.response.url !== `http://${domain}` && httpResult.response.url !== `http://${domain}/`) {
      redirectChain.push(`http://${domain} → ${httpResult.response.url}`);
    }
    return {
      html: httpResult.html,
      status: httpResult.response.status,
      url: httpResult.response.url,
      protocol: 'http',
      sslValid: false,
      redirectChain,
      isInterstitial: isInterstitialPage(httpResult.html),
    };
  }

  // 403/405 handling - try different UAs (Challenge 1.21)
  if ((httpsResult && (httpsResult.response.status === 403 || httpsResult.response.status === 405)) || (httpResult && (httpResult.response.status === 403 || httpResult.response.status === 405))) {
    const retryUAs = [GOOGLEBOT_UA, MOBILE_UA, 'curl/8.0'];
    for (const retryUA of retryUAs) {
      const retryResult = await safeFetch(`https://${domain}`, FETCH_TIMEOUT, retryUA);
      if (retryResult && retryResult.response.ok) {
        return {
          html: retryResult.html,
          status: retryResult.response.status,
          url: retryResult.response.url,
          protocol: 'https',
          sslValid: true,
          redirectChain,
          isInterstitial: false,
        };
      }
    }
  }

  // Return best error info
  if (httpsResult) {
    return { html: httpsResult.html, status: httpsResult.response.status, url: httpsResult.response.url, protocol: 'https', sslValid: false, redirectChain, isInterstitial: false };
  }
  if (httpResult) {
    return { html: httpResult.html, status: httpResult.response.status, url: httpResult.response.url, protocol: 'http', sslValid: false, redirectChain, isInterstitial: false };
  }

  return null;
}

// ===== NEW: Google Cache Fallback (Challenge 18.x) =====
async function fetchFromGoogleCache(domain: string): Promise<{ html: string; url: string } | null> {
  try {
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(domain)}+privacy+policy&hl=ar`;
    const result = await safeFetch(cacheUrl, 10000, getRandomUA());
    if (result && result.response.ok && result.html.length > 1000) {
      return { html: result.html, url: cacheUrl };
    }
  } catch {}
  return null;
}

// ===== NEW: Wayback Machine Fallback (Challenge 18.x) =====
async function fetchFromWaybackMachine(domain: string): Promise<{ html: string; url: string } | null> {
  try {
    // Check if Wayback Machine has a snapshot
    const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(domain)}&timestamp=20240101`;
    const apiResult = await safeFetch(apiUrl, 8000);
    if (apiResult && apiResult.response.ok) {
      const data = JSON.parse(apiResult.html);
      if (data.archived_snapshots?.closest?.url) {
        const snapshotUrl = data.archived_snapshots.closest.url;
        const snapshotResult = await safeFetch(snapshotUrl, 10000);
        if (snapshotResult && snapshotResult.response.ok) {
          return { html: snapshotResult.html, url: snapshotUrl };
        }
      }
    }
  } catch {}
  return null;
}

// ===== NEW: hreflang Tag Parsing (Challenge 19.x) =====
function extractHreflangUrls(html: string): { lang: string; url: string }[] {
  const hreflangRegex = /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hreflangRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
  const results: { lang: string; url: string }[] = [];
  
  let match;
  while ((match = hreflangRegex.exec(html)) !== null) {
    results.push({ lang: match[1], url: match[2] });
  }
  while ((match = hreflangRegex2.exec(html)) !== null) {
    results.push({ lang: match[2], url: match[1] });
  }
  
  return results;
}

// ===== NEW: iframe Content Extraction (Challenge 8.x) =====
async function extractIframePrivacy(html: string, baseUrl: string): Promise<string | null> {
  const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = iframeRegex.exec(html)) !== null) {
    const src = match[1];
    if (/privacy|خصوصية|policy|حماية|legal/i.test(src)) {
      let iframeUrl = src;
      if (!src.startsWith('http')) {
        try { iframeUrl = new URL(src, baseUrl).href; } catch { continue; }
      }
      try {
        const result = await safeFetch(iframeUrl, 8000);
        if (result && result.response.ok) {
          const text = stripHtml(result.html);
          if (text.length > 500 && isPrivacyContent(text)) {
            return iframeUrl;
          }
        }
      } catch {}
    }
  }
  return null;
}

// ===== NEW: Crawler Trap Detection (Challenge 15.x) =====
const MAX_URL_DEPTH = 5;
const MAX_VISITED_URLS = 50;

function isUrlTrap(url: string, visitedUrls: Set<string>): boolean {
  // Check URL depth
  try {
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split('/').filter(s => s.length > 0);
    if (pathSegments.length > MAX_URL_DEPTH) return true;
  } catch { return true; }

  // Check for infinite loop patterns
  if (/(\w+\/){5,}/i.test(url)) return true; // Repeating path segments
  if (/\?.*page=\d{4,}/i.test(url)) return true; // Very high page numbers
  if (visitedUrls.has(url)) return true; // Already visited
  if (visitedUrls.size >= MAX_VISITED_URLS) return true; // Too many URLs

  return false;
}

// ===== NEW: Extract Privacy from Terms/Legal Page (Challenge 21.x) =====
async function extractPrivacyFromTermsPage(termsUrl: string): Promise<{ text: string; found: boolean }> {
  try {
    const result = await safeFetch(termsUrl, 10000);
    if (!result || !result.response.ok) return { text: '', found: false };
    
    const text = stripHtml(result.html);
    if (containsPrivacySection(text)) {
      // Try to extract just the privacy section
      const privacySection = extractPrivacySectionFromText(text);
      if (privacySection && privacySection.length > 200) {
        return { text: privacySection, found: true };
      }
      // If can't isolate, return full text if it has privacy content
      if (text.length > 500 && isPrivacyContent(text)) {
        return { text: text.slice(0, 30000), found: true };
      }
    }
  } catch {}
  return { text: '', found: false };
}

function extractPrivacySectionFromText(text: string): string | null {
  // Try to find privacy section boundaries
  const sectionStarts = [
    /(?:^|\n)\s*(?:سياسة\s*الخصوصية|privacy\s*policy|الخصوصية|حماية\s*البيانات|data\s*protection)\s*(?:\n|:)/im,
  ];
  
  for (const startPattern of sectionStarts) {
    const startMatch = text.match(startPattern);
    if (startMatch && startMatch.index !== undefined) {
      const startIdx = startMatch.index;
      // Find next major section header (numbered or titled)
      const remaining = text.slice(startIdx + startMatch[0].length);
      const nextSection = remaining.match(/\n\s*(?:\d+[\.\)]\s+|[A-Z][a-z]+\s+[A-Z]|[أ-ي]+\s+[أ-ي]+\s*:)/);
      const endIdx = nextSection?.index 
        ? startIdx + startMatch[0].length + Math.min(nextSection.index, 10000) 
        : startIdx + Math.min(remaining.length, 10000);
      return text.slice(startIdx, endIdx).trim();
    }
  }
  return null;
}

// ===== Privacy Page Discovery - 16 Strategies (Enhanced from 13) =====
function findPrivacyLinks(html: string, baseUrl: string): string | null {
  const searchHtml = html.length > 200000 ? html.slice(-100000) : html;
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const candidates: Array<{ url: string; score: number }> = [];

  while ((match = linkRegex.exec(searchHtml)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();
    const fullText = (href + ' ' + linkText).toLowerCase();

    let score = 0;
    for (const pattern of PRIVACY_LINK_PATTERNS) {
      if (pattern.test(linkText)) score += 10;
      if (pattern.test(href)) score += 5;
    }

    if (/privacy.?policy/i.test(fullText)) score += 20;
    if (/سياسة.?الخصوصية/i.test(fullText)) score += 20;
    if (/بيان.?الخصوصية/i.test(fullText)) score += 18;
    if (/حماية.?البيانات.?الشخصية/i.test(fullText)) score += 18;
    if (/نظام.?حماية.?البيانات/i.test(fullText)) score += 18;
    if (/privacy/i.test(href) && href.length < 100) score += 15;
    // Boost for PDPL/SDAIA references
    if (/pdpl|سدايا|sdaia/i.test(fullText)) score += 15;

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
    /<div[^>]*role="contentinfo"[\s\S]*?<\/div>/i,
  ];
  for (const pattern of footerClassPatterns) {
    const match = html.match(pattern);
    if (match) {
      const result = findPrivacyLinks(match[0], baseUrl);
      if (result) return result;
    }
  }
  // Last 20% heuristic
  const lastPortion = html.slice(Math.floor(html.length * 0.8));
  return findPrivacyLinks(lastPortion, baseUrl);
}

// Strategy 3: Cookie Consent Banner (Challenge 20.x)
function findPrivacyInCookieBanner(html: string, baseUrl: string): string | null {
  const bannerPatterns = [
    /<div[^>]*class="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*id="[^"]*cookie[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*consent[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*gdpr[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*cc-[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*onetrust[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*cookiebot[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*id="[^"]*onetrust[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*id="[^"]*CybotCookiebot[^"]*"[\s\S]*?<\/div>/gi,
  ];
  for (const pattern of bannerPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const result = findPrivacyLinks(match, baseUrl);
        if (result) return result;
      }
    }
  }
  return null;
}

// Strategy 4: Navigation Menus (Challenge 9.4-9.6, 9.31-9.35)
function findPrivacyInNavigation(html: string, baseUrl: string): string | null {
  const navPatterns = [
    /<nav[\s\S]*?<\/nav>/gi,
    /<div[^>]*class="[^"]*nav[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*menu[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*hamburger[^"]*"[\s\S]*?<\/div>/gi,
    /<ul[^>]*class="[^"]*menu[^"]*"[\s\S]*?<\/ul>/gi,
    /<div[^>]*class="[^"]*mega-menu[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="[^"]*dropdown[^"]*"[\s\S]*?<\/div>/gi,
    /<aside[\s\S]*?<\/aside>/gi,
    /<div[^>]*class="[^"]*sidebar[^"]*"[\s\S]*?<\/div>/gi,
    /<div[^>]*role="navigation"[\s\S]*?<\/div>/gi,
  ];
  for (const pattern of navPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const result = findPrivacyLinks(match, baseUrl);
        if (result) return result;
      }
    }
  }
  return null;
}

// Strategy 5: Try URL patterns in batch
async function tryUrlPatternsBatch(baseUrl: string, patterns: string[]): Promise<string | null> {
  const visitedUrls = new Set<string>();
  for (let i = 0; i < patterns.length; i += 4) {
    const batch = patterns.slice(i, i + 4);
    const promises = batch.map(async (path) => {
      try {
        const testUrl = new URL(path, baseUrl).href;
        if (isUrlTrap(testUrl, visitedUrls)) return null;
        visitedUrls.add(testUrl);
        const result = await safeFetch(testUrl, 6000);
        if (result && result.response.ok && !isErrorPage(result.html) && !isSoft404(result.html)) {
          const ct = result.response.headers.get('content-type') || '';
          // Check if it's a PDF with privacy-related path
          if (ct.includes('pdf') && /privacy|خصوصية|حماية|سياسة/i.test(path)) return testUrl;
          if (!ct.includes('text/html') && !ct.includes('application/xhtml')) return null;
          // Check page title for privacy indicators
          const titleMatch = result.html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const pageTitle = titleMatch ? titleMatch[1].toLowerCase() : '';
          const hasPrivacyTitle = /privacy|خصوصية|حماية|سياسة.*خصوص|بيان.*خصوص/i.test(pageTitle);
          const text = stripHtml(result.html);
          // Require stronger evidence: either privacy title + some content, or strong content match
          if (hasPrivacyTitle && text.length > 300) return testUrl;
          if (text.length > 500 && isPrivacyContent(text)) return testUrl;
        }
      } catch {}
      return null;
    });
    const results = await Promise.all(promises);
    const found = results.find(r => r !== null);
    if (found) return found;
  }
  return null;
}

// Strategy 7: Sitemap.xml (Enhanced with sitemap index support)
async function checkSitemap(baseUrl: string): Promise<string | null> {
  try {
    const result = await safeFetch(`${baseUrl}/sitemap.xml`, 5000, RASID_BOT_UA);
    if (!result || !result.response.ok) return null;
    const xml = result.html;
    
    // Check for privacy URLs in sitemap
    const urlMatches = xml.match(/<loc>([^<]*(?:privacy|خصوصية|policy|حماية|بيان|legal)[^<]*)<\/loc>/gi);
    if (urlMatches && urlMatches.length > 0) {
      return urlMatches[0].replace(/<\/?loc>/gi, '');
    }
    
    // Check for sitemap index (nested sitemaps)
    const sitemapIndexMatches = xml.match(/<loc>([^<]*sitemap[^<]*)<\/loc>/gi);
    if (sitemapIndexMatches) {
      for (const sm of sitemapIndexMatches.slice(0, 3)) { // Check first 3 sub-sitemaps
        const subSitemapUrl = sm.replace(/<\/?loc>/gi, '');
        try {
          const subResult = await safeFetch(subSitemapUrl, 5000, RASID_BOT_UA);
          if (subResult && subResult.response.ok) {
            const subMatches = subResult.html.match(/<loc>([^<]*(?:privacy|خصوصية|policy|حماية)[^<]*)<\/loc>/gi);
            if (subMatches) return subMatches[0].replace(/<\/?loc>/gi, '');
          }
        } catch {}
      }
    }
  } catch {}
  return null;
}

// Strategy 8: robots.txt (Enhanced)
async function checkRobotsTxt(baseUrl: string): Promise<string | null> {
  try {
    const result = await safeFetch(`${baseUrl}/robots.txt`, 5000, RASID_BOT_UA);
    if (!result || !result.response.ok) return null;
    
    // Check for sitemap references
    const sitemapMatches = result.html.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
    if (sitemapMatches) {
      for (const sm of sitemapMatches) {
        const sitemapUrl = sm.replace(/Sitemap:\s*/i, '').trim();
        try {
          const smResult = await safeFetch(sitemapUrl, 5000, RASID_BOT_UA);
          if (smResult && smResult.response.ok) {
            const urlMatches = smResult.html.match(/<loc>([^<]*(?:privacy|خصوصية|policy|حماية)[^<]*)<\/loc>/gi);
            if (urlMatches && urlMatches.length > 0) {
              return urlMatches[0].replace(/<\/?loc>/gi, '');
            }
          }
        } catch {}
      }
    }
    
    // Also check for disallowed privacy paths (might indicate the page exists)
    const disallowMatch = result.html.match(/Disallow:\s*([^\s]*(?:privacy|خصوصية|policy)[^\s]*)/i);
    if (disallowMatch) {
      const privacyPath = disallowMatch[1];
      try {
        const testUrl = new URL(privacyPath, baseUrl).href;
        const testResult = await safeFetch(testUrl, 6000);
        if (testResult && testResult.response.ok) {
          const text = stripHtml(testResult.html);
          if (text.length > 500 && isPrivacyContent(text)) return testUrl;
        }
      } catch {}
    }
  } catch {}
  return null;
}

// Strategy 9: Subdomain checking (Enhanced)
async function checkPrivacySubdomains(domain: string): Promise<string | null> {
  const subdomains = ['privacy', 'legal', 'policies', 'www'];
  const paths = ['/privacy-policy', '/privacy', '/'];
  
  for (const sub of subdomains) {
    if (domain.startsWith(`${sub}.`)) continue;
    for (const path of paths) {
      try {
        const testUrl = `https://${sub}.${domain}${path}`;
        const result = await safeFetch(testUrl, 5000);
        if (result && result.response.ok) {
          const text = stripHtml(result.html);
          if (text.length > 500 && isPrivacyContent(text)) return testUrl;
        }
      } catch {}
    }
  }
  return null;
}

// Strategy 11: Hash-based routing (Challenge 9.11-9.15)
function findHashRoutePrivacy(html: string, baseUrl: string): string | null {
  const hashPatterns = [
    /#\/privacy/i, /#\/privacy-policy/i, /#privacy/i,
    /#\/سياسة-الخصوصية/i, /#\/الخصوصية/i,
  ];
  for (const pattern of hashPatterns) {
    const match = html.match(new RegExp(`href=["']([^"']*${pattern.source}[^"']*)["']`, 'i'));
    if (match) {
      try { return new URL(match[1], baseUrl).href; } catch {}
    }
  }
  // Also check for router config patterns
  const routerPatterns = [
    /path:\s*['"]\/privacy['"]/i,
    /route.*['"]\/privacy-policy['"]/i,
    /['"]\/privacy['"]\s*:\s*{/i,
  ];
  for (const pattern of routerPatterns) {
    if (pattern.test(html)) {
      return `${baseUrl}/#/privacy-policy`;
    }
  }
  return null;
}

// Strategy 12: JavaScript onclick links (Challenge 9.11-9.15)
function findJSPrivacyLinks(html: string, baseUrl: string): string | null {
  const jsPatterns = [
    /onclick=["'][^"']*(?:privacy|خصوصية|policy)[^"']*["']/gi,
    /window\.location\s*=\s*["']([^"']*(?:privacy|خصوصية|policy)[^"']*)["']/gi,
    /router\.push\s*\(\s*["']([^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    /navigate\s*\(\s*["']([^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    /window\.open\s*\(\s*["']([^"']*(?:privacy|خصوصية|policy)[^"']*)["']/gi,
    /location\.href\s*=\s*["']([^"']*(?:privacy|خصوصية|policy)[^"']*)["']/gi,
  ];
  for (const pattern of jsPatterns) {
    const match = html.match(pattern);
    if (match) {
      const urlMatch = match[0].match(/["']([^"']+(?:privacy|خصوصية|policy)[^"']*)["']/i);
      if (urlMatch) {
        try { return new URL(urlMatch[1], baseUrl).href; } catch {}
      }
    }
  }
  return null;
}

// Strategy 13: PDF privacy policy (Challenge 17.19)
async function checkPDFPrivacy(html: string, baseUrl: string): Promise<string | null> {
  const pdfLinks = html.match(/<a[^>]*href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi);
  if (pdfLinks) {
    for (const link of pdfLinks) {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      const textMatch = link.match(/>([^<]+)</);
      if (hrefMatch) {
        const href = hrefMatch[1];
        const text = textMatch ? textMatch[1] : '';
        if (/privacy|خصوصية|حماية|سياسة|بيانات/i.test(href + ' ' + text)) {
          try { return new URL(href, baseUrl).href; } catch {}
        }
      }
    }
  }
  
  // Check common PDF paths
  const pdfPaths = [
    '/privacy-policy.pdf', '/privacy.pdf',
    '/documents/privacy-policy.pdf', '/uploads/privacy-policy.pdf',
    '/media/privacy-policy.pdf', '/files/privacy-policy.pdf',
    '/assets/privacy-policy.pdf', '/static/privacy-policy.pdf',
    '/wp-content/uploads/privacy-policy.pdf',
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
    } catch {}
  }
  return null;
}

// ===== NEW Strategy 14: Check terms/legal pages for embedded privacy (Challenge 21.x) =====
async function checkTermsForPrivacy(html: string, baseUrl: string): Promise<string | null> {
  // Find terms/legal page links
  const termsPatterns = [
    /href=["']([^"']*(?:terms|شروط|legal|قانوني|الأحكام|conditions)[^"']*)["']/gi,
  ];
  
  const termsUrls = new Set<string>();
  for (const pattern of termsPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url === '#' || url.startsWith('javascript:') || url.startsWith('mailto:')) continue;
      if (!url.startsWith('http')) {
        try { url = new URL(url, baseUrl).href; } catch { continue; }
      }
      termsUrls.add(url);
    }
  }
  
  // Also try common terms paths
  const termsPaths = ['/terms', '/terms-and-conditions', '/legal', '/الشروط-والأحكام', '/شروط-الاستخدام'];
  for (const path of termsPaths) {
    try { termsUrls.add(new URL(path, baseUrl).href); } catch {}
  }
  
  // Check each terms page for privacy content
  for (const termsUrl of Array.from(termsUrls).slice(0, 3)) {
    const result = await extractPrivacyFromTermsPage(termsUrl);
    if (result.found) return termsUrl;
  }
  
  return null;
}

// ===== NEW Strategy 15: hreflang-based discovery (Challenge 19.x) =====
async function checkHreflangPrivacy(html: string, baseUrl: string): Promise<string | null> {
  const hreflangUrls = extractHreflangUrls(html);
  
  // Check Arabic and English versions for privacy pages
  const priorityLangs = ['ar', 'ar-sa', 'en', 'en-us', 'en-gb'];
  const langUrls = hreflangUrls.filter(h => priorityLangs.some(l => h.lang.toLowerCase().startsWith(l)));
  
  for (const { url: langUrl } of langUrls) {
    try {
      const fullUrl = langUrl.startsWith('http') ? langUrl : new URL(langUrl, baseUrl).href;
      // Try privacy paths on this language version
      const langBase = fullUrl.replace(/\/$/, '');
      const privacyPaths = ['/privacy', '/privacy-policy', '/سياسة-الخصوصية'];
      for (const path of privacyPaths) {
        const testUrl = langBase + path;
        const result = await safeFetch(testUrl, 5000);
        if (result && result.response.ok) {
          const text = stripHtml(result.html);
          if (text.length > 500 && isPrivacyContent(text)) return testUrl;
        }
      }
    } catch {}
  }
  
  return null;
}

// ===== NEW Strategy 16: iframe-based privacy (Challenge 8.x) =====
// Already defined above as extractIframePrivacy

// ===== Enhanced Privacy Discovery Orchestrator (16 strategies) =====
async function discoverPrivacyPageEnhanced(
  html: string, baseUrl: string, domain: string, cms: CMSType
): Promise<{ url: string; method: string }> {
  
  // Strategy 1: Find privacy links in HTML body
  const linkResult = findPrivacyLinks(html, baseUrl);
  if (linkResult) return { url: linkResult, method: 'link_text' };

  // Strategy 2: Check footer specifically
  const footerResult = findPrivacyInFooter(html, baseUrl);
  if (footerResult) return { url: footerResult, method: 'footer' };

  // Strategy 3: Cookie consent banners
  const cookieResult = findPrivacyInCookieBanner(html, baseUrl);
  if (cookieResult) return { url: cookieResult, method: 'cookie_banner' };

  // Strategy 4: Navigation menus
  const navResult = findPrivacyInNavigation(html, baseUrl);
  if (navResult) return { url: navResult, method: 'navigation' };

  // Strategy 5: CMS-specific patterns
  if (cms !== 'unknown') {
    const cmsPatterns = getCMSSpecificPatterns(cms);
    const cmsResult = await tryUrlPatternsBatch(baseUrl, cmsPatterns);
    if (cmsResult) return { url: cmsResult, method: `cms_${cms}` };
  }

  // Strategy 6: Top common URL patterns
  const urlResult = await tryUrlPatternsBatch(baseUrl, FAST_PRIVACY_PATTERNS);
  if (urlResult) return { url: urlResult, method: 'url_pattern' };

  // Strategy 7: Sitemap.xml
  const sitemapResult = await checkSitemap(baseUrl);
  if (sitemapResult) return { url: sitemapResult, method: 'sitemap' };

  // Strategy 8: robots.txt
  const robotsResult = await checkRobotsTxt(baseUrl);
  if (robotsResult) return { url: robotsResult, method: 'robots_txt' };

  // Strategy 9: Subdomain checking
  const subdomainResult = await checkPrivacySubdomains(domain);
  if (subdomainResult) return { url: subdomainResult, method: 'subdomain' };

  // Strategy 10: Extended URL patterns
  const remainingPatterns = PRIVACY_URL_PATTERNS_FULL.filter(p => !FAST_PRIVACY_PATTERNS.includes(p));
  const extResult = await tryUrlPatternsBatch(baseUrl, remainingPatterns.slice(0, 25));
  if (extResult) return { url: extResult, method: 'extended_url_pattern' };

  // Strategy 11: Hash-based routing
  const hashResult = findHashRoutePrivacy(html, baseUrl);
  if (hashResult) return { url: hashResult, method: 'hash_route' };

  // Strategy 12: JavaScript onclick links
  const jsResult = findJSPrivacyLinks(html, baseUrl);
  if (jsResult) return { url: jsResult, method: 'js_link' };

  // Strategy 13: PDF privacy policy
  const pdfResult = await checkPDFPrivacy(html, baseUrl);
  if (pdfResult) return { url: pdfResult, method: 'pdf' };

  // Strategy 14: Check terms/legal pages for embedded privacy (NEW)
  const termsResult = await checkTermsForPrivacy(html, baseUrl);
  if (termsResult) return { url: termsResult, method: 'terms_embedded' };

  // Strategy 15: hreflang-based discovery (NEW)
  const hreflangResult = await checkHreflangPrivacy(html, baseUrl);
  if (hreflangResult) return { url: hreflangResult, method: 'hreflang' };

  // Strategy 16: iframe-based privacy (NEW)
  const iframeResult = await extractIframePrivacy(html, baseUrl);
  if (iframeResult) return { url: iframeResult, method: 'iframe' };

  // Strategy 17: About/Contact/Registration page scanning for privacy links (NEW)
  const aboutContactResult = await checkAboutContactPages(html, baseUrl);
  if (aboutContactResult) return { url: aboutContactResult, method: 'about_contact_page' };

  // Strategy 18: Third-party privacy service detection (iubenda, termly, etc.) (NEW)
  const thirdPartyResult = detectThirdPartyPrivacyService(html, baseUrl);
  if (thirdPartyResult) return { url: thirdPartyResult, method: 'third_party_service' };

  // Strategy 19: Google Docs / Notion / external privacy links (NEW)
  const externalDocResult = findExternalPrivacyDocs(html);
  if (externalDocResult) return { url: externalDocResult, method: 'external_doc' };

  // Strategy 20: Image map / SVG links / area tags (NEW)
  const imageMapResult = findImageMapPrivacyLinks(html, baseUrl);
  if (imageMapResult) return { url: imageMapResult, method: 'image_map_svg' };

  return { url: '', method: '' };
}

// ===== NEW Strategy 17: About/Contact/Registration page scanning =====
async function checkAboutContactPages(html: string, baseUrl: string): Promise<string | null> {
  // Find about, contact, and registration page links
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
      // Only check pages on the same domain
      try {
        const pageHost = new URL(url).hostname;
        const baseHost = new URL(baseUrl).hostname;
        if (pageHost !== baseHost && !pageHost.endsWith('.' + baseHost)) continue;
      } catch { continue; }
      pageUrls.add(url);
    }
  }
  
  // Check each page for privacy links (limit to 3 pages)
  for (const pageUrl of Array.from(pageUrls).slice(0, 3)) {
    try {
      const result = await safeFetch(pageUrl, 6000);
      if (result && result.response.ok) {
        const privacyLink = findPrivacyLinks(result.html, baseUrl);
        if (privacyLink) return privacyLink;
      }
    } catch {}
  }
  
  return null;
}

// ===== NEW Strategy 18: Third-party privacy service detection =====
function detectThirdPartyPrivacyService(html: string, baseUrl: string): string | null {
  const thirdPartyPatterns: Array<{ pattern: RegExp; urlExtractor: (match: RegExpMatchArray) => string | null }> = [
    // iubenda
    {
      pattern: /iubenda\.com\/privacy-policy\/([\d]+)/i,
      urlExtractor: (m) => `https://www.iubenda.com/privacy-policy/${m[1]}`,
    },
    // Termly
    {
      pattern: /termly\.io\/(?:policy-viewer|embed)\/([a-zA-Z0-9-]+)/i,
      urlExtractor: (m) => `https://app.termly.io/policy-viewer/${m[1]}`,
    },
    // CookieBot privacy
    {
      pattern: /cookiebot\.com.*?privacy/i,
      urlExtractor: () => null,
    },
    // OneTrust privacy center
    {
      pattern: /onetrust\.com.*?privacy/i,
      urlExtractor: () => null,
    },
    // Securiti.ai
    {
      pattern: /securiti\.ai\/privacycenter\/([^"'\s]+)/i,
      urlExtractor: (m) => `https://securiti.ai/privacycenter/${m[1]}`,
    },
    // GetTerms
    {
      pattern: /getterms\.io\/view\/([^"'\s]+)/i,
      urlExtractor: (m) => `https://getterms.io/view/${m[1]}`,
    },
  ];
  
  for (const { pattern, urlExtractor } of thirdPartyPatterns) {
    const match = html.match(pattern);
    if (match) {
      const url = urlExtractor(match);
      if (url) return url;
    }
  }
  
  // Also check for iubenda/termly script embeds with data attributes
  const iubendaEmbed = html.match(/data-iub-privacy-policy-url=["']([^"']+)["']/i);
  if (iubendaEmbed) return iubendaEmbed[1];
  
  const termlyEmbed = html.match(/data-termly-embed=["']([^"']+)["']/i);
  if (termlyEmbed) return termlyEmbed[1];
  
  return null;
}

// ===== NEW Strategy 19: Google Docs / Notion / external privacy docs =====
function findExternalPrivacyDocs(html: string): string | null {
  const externalDocPatterns = [
    // Google Docs
    /href=["'](https:\/\/docs\.google\.com\/document\/d\/[^"']+)["'][^>]*>([^<]*(?:privacy|خصوصية|حماية|سياسة)[^<]*)/gi,
    // Google Drive
    /href=["'](https:\/\/drive\.google\.com\/file\/d\/[^"']+)["'][^>]*>([^<]*(?:privacy|خصوصية|حماية|سياسة)[^<]*)/gi,
    // Notion public pages
    /href=["'](https:\/\/[^"']*\.notion\.site\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    // Notion.so
    /href=["'](https:\/\/www\.notion\.so\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    // Confluence
    /href=["'](https:\/\/[^"']*\.atlassian\.net\/wiki\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
    // Gitbook
    /href=["'](https:\/\/[^"']*\.gitbook\.io\/[^"']*(?:privacy|خصوصية)[^"']*)["']/gi,
  ];
  
  for (const pattern of externalDocPatterns) {
    const match = html.match(pattern);
    if (match) {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
      if (hrefMatch) return hrefMatch[1];
    }
  }
  
  // Also check for generic Google Docs links near privacy text
  const docsLinks = html.match(/href=["'](https:\/\/docs\.google\.com\/document\/d\/[^"']+)["']/gi);
  if (docsLinks) {
    for (const link of docsLinks) {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        // Check surrounding context for privacy keywords
        const linkIndex = html.indexOf(link);
        const context = html.slice(Math.max(0, linkIndex - 200), Math.min(html.length, linkIndex + 500));
        if (/privacy|خصوصية|حماية|سياسة/i.test(context)) {
          return hrefMatch[1];
        }
      }
    }
  }
  
  return null;
}

// ===== NEW Strategy 20: Image map / SVG links / area tags =====
function findImageMapPrivacyLinks(html: string, baseUrl: string): string | null {
  // Check <area> tags in image maps
  const areaRegex = /<area[^>]*href=["']([^"']+)["'][^>]*(?:alt|title)=["']([^"']*)["'][^>]*>/gi;
  const areaRegex2 = /<area[^>]*(?:alt|title)=["']([^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = areaRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2];
    if (/privacy|خصوصية|حماية|سياسة/i.test(href + ' ' + text)) {
      try { return new URL(href, baseUrl).href; } catch {}
    }
  }
  
  while ((match = areaRegex2.exec(html)) !== null) {
    const text = match[1];
    const href = match[2];
    if (/privacy|خصوصية|حماية|سياسة/i.test(href + ' ' + text)) {
      try { return new URL(href, baseUrl).href; } catch {}
    }
  }
  
  // Check SVG <a> tags
  const svgLinkRegex = /<svg[\s\S]*?<a[^>]*(?:href|xlink:href)=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>[\s\S]*?<\/svg>/gi;
  while ((match = svgLinkRegex.exec(html)) !== null) {
    const href = match[1];
    if (/privacy|خصوصية|حماية|سياسة/i.test(href)) {
      try { return new URL(href, baseUrl).href; } catch {}
    }
  }
  
  // Check data-href attributes (some sites use custom attributes)
  const dataHrefRegex = /data-href=["']([^"']*(?:privacy|خصوصية|حماية|سياسة)[^"']*)["']/gi;
  while ((match = dataHrefRegex.exec(html)) !== null) {
    try { return new URL(match[1], baseUrl).href; } catch {}
  }
  
  return null;
}

// ===== Privacy Text Extraction (Enhanced) =====
async function extractPrivacyText(privacyUrl: string): Promise<{ text: string; html: string }> {
  try {
    const result = await safeFetch(privacyUrl, PRIVACY_FETCH_TIMEOUT);
    if (!result || !result.response.ok) return { text: '', html: '' };
    
    const contentType = result.response.headers.get('content-type') || '';
    
    // Handle PDF responses
    if (contentType.includes('pdf')) {
      return { text: '[PDF Privacy Policy detected - URL: ' + privacyUrl + ']', html: '' };
    }
    
    let text = stripHtml(result.html);
    
    // Handle paginated content - check for "next page" links
    const nextPagePatterns = [
      /<a[^>]*class="[^"]*next[^"]*"[^>]*href=["']([^"']+)["']/i,
      /<a[^>]*href=["']([^"']+)["'][^>]*class="[^"]*next[^"]*"/i,
      /<a[^>]*rel="next"[^>]*href=["']([^"']+)["']/i,
      /<a[^>]*href=["']([^"']+)["'][^>]*>(?:التالي|Next|›|»|→)/i,
    ];
    
    for (const pattern of nextPagePatterns) {
      const match = result.html.match(pattern);
      if (match && match[1]) {
        let nextUrl = match[1];
        if (!nextUrl.startsWith('http')) {
          try { nextUrl = new URL(nextUrl, privacyUrl).href; } catch { continue; }
        }
        if (nextUrl !== privacyUrl) {
          try {
            const nextResult = await safeFetch(nextUrl, 8000);
            if (nextResult && nextResult.response.ok) {
              text += '\n\n' + stripHtml(nextResult.html);
            }
          } catch {}
          break;
        }
      }
    }
    
    // Extract hidden content (accordion, tabs, collapse panels)
    const hiddenPatterns = [
      /<div[^>]*class="[^"]*(?:accordion|collapse|panel|tab-?pane|tab-?content)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /data-content=["']([^"']+)["']/gi,
    ];
    for (const pattern of hiddenPatterns) {
      let match;
      while ((match = pattern.exec(result.html)) !== null) {
        const hiddenText = stripHtml(match[1] || match[0]);
        if (hiddenText.length > 50 && isPrivacyContent(hiddenText)) {
          text += '\n\n' + hiddenText;
        }
      }
    }
    
    // Check for iframe-embedded content
    const iframeMatch = result.html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (iframeMatch) {
      const iframeSrc = iframeMatch[1];
      if (/privacy|خصوصية|policy|legal/i.test(iframeSrc)) {
        try {
          const iframeUrl = iframeSrc.startsWith('http') ? iframeSrc : new URL(iframeSrc, privacyUrl).href;
          const iframeResult = await safeFetch(iframeUrl, 8000);
          if (iframeResult && iframeResult.response.ok) {
            const iframeText = stripHtml(iframeResult.html);
            if (iframeText.length > 100) {
              text += '\n\n' + iframeText;
            }
          }
        } catch {}
      }
    }
    
    return { text: text.slice(0, 30000), html: result.html };
  } catch {
    return { text: '', html: '' };
  }
}

// ===== Contact Info Extraction (Enhanced) =====
function extractContactInfo(html: string, baseUrl: string): {
  emails: string[]; phones: string[]; socialLinks: Record<string, string>; contactUrl: string;
} {
  const searchHtml = html.length > 200000 ? html.slice(0, 100000) + html.slice(-100000) : html;
  
  // Enhanced email extraction
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const rawEmails = searchHtml.match(emailRegex) || [];
  const emails = Array.from(new Set(rawEmails)).filter(e =>
    !e.includes('example.com') && !e.includes('wixpress') &&
    !e.includes('sentry.io') && !e.includes('webpack') &&
    !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') &&
    !e.includes('cloudflare') && !e.includes('jquery') &&
    !e.includes('bootstrap') && !e.includes('google-analytics') &&
    !e.includes('googleapis') && !e.includes('gstatic') &&
    e.length < 100
  );

  // Enhanced phone extraction (Saudi + international)
  const phoneRegex = /(?:\+966|00966|05|01|02|03|04|06|07|08|09)\d{7,9}/g;
  const intlPhoneRegex = /(?:\+\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g;
  const freePhoneRegex = /(?:800|900)[\s\-]?\d{3,7}/g;
  const rawPhones = [
    ...(searchHtml.match(phoneRegex) || []),
    ...(searchHtml.match(freePhoneRegex) || []),
  ];
  const phones = Array.from(new Set(rawPhones.map(p => p.replace(/[\s\-]/g, '')))).filter(p => p.length >= 9 && p.length <= 15);

  // Enhanced social media extraction
  const socialLinks: Record<string, string> = {};
  const socialPatterns: Record<string, RegExp> = {
    twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/i,
    facebook: /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._\-]+/i,
    instagram: /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]+/i,
    linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._\-]+/i,
    youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)?[a-zA-Z0-9._\-]+/i,
    snapchat: /https?:\/\/(?:www\.)?snapchat\.com\/add\/[a-zA-Z0-9._]+/i,
    tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._]+/i,
    whatsapp: /https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[0-9+]+/i,
  };
  for (const [platform, regex] of Object.entries(socialPatterns)) {
    const match = searchHtml.match(regex);
    if (match) socialLinks[platform] = match[0];
  }

  // Contact page link
  let contactUrl = '';
  const contactLinkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let contactMatch;
  while ((contactMatch = contactLinkRegex.exec(searchHtml)) !== null) {
    const href = contactMatch[1];
    const text = contactMatch[2].replace(/<[^>]+>/g, '').trim();
    for (const pattern of CONTACT_LINK_PATTERNS) {
      if (pattern.test(text) || pattern.test(href)) {
        if (!href.startsWith('http')) {
          try { contactUrl = new URL(href, baseUrl).href; } catch { continue; }
        } else {
          contactUrl = href;
        }
        break;
      }
    }
    if (contactUrl) break;
  }

  return { emails: emails.slice(0, 20), phones: phones.slice(0, 20), socialLinks, contactUrl };
}

// ===== Error Result Factory =====
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
    errorMessage, scanDuration: 0,
  };
}

// ===== Main Scan Function =====
async function deepScanDomain(domain: string): Promise<DeepScanResult> {
  return Promise.race([
    _deepScanDomainImpl(domain),
    new Promise<DeepScanResult>((_, reject) =>
      setTimeout(() => reject(new Error('scan timeout (55s)')), GLOBAL_SCAN_TIMEOUT)
    ),
  ]).catch((e) => ({
    ...createErrorResult(e.message || 'timeout'),
    scanDuration: GLOBAL_SCAN_TIMEOUT,
  }));
}

async function _deepScanDomainImpl(domain: string): Promise<DeepScanResult> {
  const startTime = Date.now();
  const result: DeepScanResult = {
    ...createErrorResult(''),
    complianceStatus: 'no_policy',
    scanDuration: 0,
  };

  try {
    // ===== Step 1: Visit homepage (Challenge 1.1-1.3) =====
    let fetchResult = await fetchDomain(domain);
    
    // ===== NEW: Fallback to Google Cache / Wayback Machine if site unreachable =====
    if (!fetchResult) {
      // Try Google Cache
      const cacheResult = await fetchFromGoogleCache(domain);
      if (cacheResult) {
        fetchResult = {
          html: cacheResult.html,
          status: 200,
          url: cacheResult.url,
          protocol: 'https',
          sslValid: false,
          redirectChain: ['Google Cache fallback'],
          isInterstitial: false,
        };
        result.errorMessage = 'تم الوصول عبر Google Cache (الموقع الأصلي غير متاح)';
      } else {
        // Try Wayback Machine
        const waybackResult = await fetchFromWaybackMachine(domain);
        if (waybackResult) {
          fetchResult = {
            html: waybackResult.html,
            status: 200,
            url: waybackResult.url,
            protocol: 'https',
            sslValid: false,
            redirectChain: ['Wayback Machine fallback'],
            isInterstitial: false,
          };
          result.errorMessage = 'تم الوصول عبر Wayback Machine (الموقع الأصلي غير متاح)';
        }
      }
    }
    
    if (!fetchResult) {
      result.errorMessage = 'الموقع غير قابل للوصول: لا يوجد استجابة من HTTPS أو HTTP أو النسخ المخبأة';
      result.scanDuration = Date.now() - startTime;
      return result;
    }

    const { html, status, url: finalUrl, sslValid, redirectChain, isInterstitial } = fetchResult;
    result.httpStatus = status;
    result.sslValid = sslValid;
    result.hasHttps = fetchResult.protocol === 'https';
    result.hasHttp = fetchResult.protocol === 'http';
    if (redirectChain && redirectChain.length > 0) {
      result.redirectUrl = redirectChain.join(' | ');
    }
    if (isInterstitial) {
      result.errorMessage = 'تم اكتشاف صفحة حماية DDoS/Cloudflare - قد يكون المحتوى غير كامل';
    }
    
    // Resolve base URL for relative link resolution (Challenge 25.x)
    const resolvedBaseUrl = resolveBaseUrl(html, finalUrl);

    // Handle non-OK responses
    if (status >= 400) {
      result.errorMessage = `HTTP ${status}`;
      if (status !== 403 || html.length < 1000) {
        result.scanDuration = Date.now() - startTime;
        return result;
      }
    }

    result.siteReachable = status >= 200 && status < 400;
    if (finalUrl !== `https://${domain}` && finalUrl !== `http://${domain}` && finalUrl !== `https://${domain}/` && finalUrl !== `http://${domain}/`) {
      result.redirectUrl = finalUrl;
    }

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

    // ===== Step 3: CMS Detection (Enhanced - Challenge 22.x) =====
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

    // ===== Step 8: Extract privacy text =====
    if (result.privacyUrl) {
      const privacyContent = await extractPrivacyText(result.privacyUrl);
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

    // ===== Step 9: Compliance Status (fast scan mode - no LLM) =====
    if (result.privacyTextContent && result.privacyTextContent.length > 100) {
      result.complianceStatus = 'non_compliant';
      result.summary = 'تم استخراج النص بنجاح - في انتظار تحليل الامتثال (وضع المسح السريع)';
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

// ===== Worker IPC Handler =====
process.on('message', async (msg: { type: string; domain: string; id: number }) => {
  if (msg.type === 'scan') {
    try {
      const result = await deepScanDomain(msg.domain);
      process.send!({ type: 'result', id: msg.id, domain: msg.domain, result });
    } catch (e: any) {
      process.send!({ type: 'result', id: msg.id, domain: msg.domain, result: {
        ...createErrorResult(e.message || 'worker error'),
        scanDuration: 0,
      }});
    }
  } else if (msg.type === 'exit') {
    process.exit(0);
  }
});

// Signal that worker is ready
process.send!({ type: 'ready' });
