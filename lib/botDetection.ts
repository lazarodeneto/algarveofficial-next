/**
 * Bot Detection Middleware
 * Filters out known bots, crawlers, and automated traffic from analytics
 */

// Known bot user agent patterns (case-insensitive matching)
const BOT_PATTERNS = [
  // Search engine crawlers
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  
  // Social media crawlers
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterest',
  'whatsapp', 'telegrambot', 'slackbot', 'discordbot',
  
  // SEO/Monitoring tools
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'serpstatbot', 'dataforseo', 'blexbot', 'linkdexbot',
  
  // Uptime monitors & testing
  'uptimerobot', 'pingdom', 'statuscake', 'site24x7', 'newrelicpinger',
  'guzzlehttp', 'postman', 'insomnia', 'curl', 'wget', 'httpie',
  
  // Generic bot patterns
  'bot', 'crawl', 'spider', 'scrape', 'fetch', 'headless',
  'phantom', 'selenium', 'puppeteer', 'playwright', 'webdriver',
  
  // Library/framework patterns
  'python-requests', 'python-urllib', 'java/', 'libwww', 'lwp-',
  'http_request', 'go-http-client', 'okhttp', 'axios/',
  
  // Cloud functions / serverless
  'node-fetch', 'undici', 'got/', 'node/',
  
  // AI assistants and preview tools
  'chatgpt', 'gptbot', 'claudebot', 'anthropic', 'perplexity',
  'preview', 'prerender', 'snap url', 'linkpreview',
];

// Additional checks for headless browsers
const HEADLESS_INDICATORS = [
  'headlesschrome',
  'headless',
  'phantomjs',
];

type BotAwareNavigator = Navigator & {
  webdriver?: boolean;
};

type BotAwareWindow = Window & {
  __nightmare?: unknown;
  _phantom?: unknown;
  callPhantom?: unknown;
  chrome?: unknown;
  __analyticsBlocked?: boolean;
};

/**
 * Detects if the current user agent belongs to a bot
 * @returns true if bot detected, false for human traffic
 */
export function isBot(): boolean {
  if (typeof navigator === 'undefined') {
    return true; // Server-side / no navigator = treat as bot
  }

  const nav = navigator as BotAwareNavigator;
  const win = window as BotAwareWindow;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for empty or suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    return true;
  }

  // Check against known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (userAgent.includes(pattern)) {
      return true;
    }
  }

  // Check for headless browser indicators
  for (const indicator of HEADLESS_INDICATORS) {
    if (userAgent.includes(indicator)) {
      return true;
    }
  }

  // Additional heuristics for bot detection
  
  // Check for webdriver property (Selenium, Puppeteer)
  if (nav.webdriver === true) {
    return true;
  }

  // Check for automation properties
  if (win.__nightmare || win._phantom || win.callPhantom) {
    return true;
  }

  // Check for missing browser features that real browsers have
  // Bots often have incomplete navigator objects
  if (!navigator.languages || navigator.languages.length === 0) {
    return true;
  }

  // Check for Chrome without Chrome runtime (headless indicator)
  if (userAgent.includes('chrome') && !win.chrome) {
    // Could be headless, but also could be Electron - be lenient
    // Only flag if other suspicious signs
  }

  return false;
}

/**
 * Gets user agent for logging purposes
 */
export function getUserAgent(): string {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }
  return navigator.userAgent || 'unknown';
}

/**
 * Checks if traffic should be tracked (not a bot and has consent)
 * Combines bot detection with GDPR consent check
 */
export function shouldTrackAnalytics(): boolean {
  // Bot check first (cheaper than consent check)
  if (isBot()) {
    return false;
  }
  
  return true; // Consent is checked separately in getSessionId
}

/**
 * Cached bot detection result to avoid repeated checks
 * Only computed once per page load
 */
let cachedBotResult: boolean | null = null;

/**
 * Optimized bot detection with caching
 * Use this for frequent checks to avoid repeated computation
 */
export function isBotCached(): boolean {
  if (cachedBotResult === null) {
    cachedBotResult = isBot();
  }
  return cachedBotResult;
}

/**
 * Block analytics initialization for bots
 * Call this early in app initialization to prevent any tracking scripts from loading
 */
export function blockAnalyticsForBots(): boolean {
  if (isBotCached()) {
    // Prevent analytics from initializing
    if (typeof window !== 'undefined') {
      // Set a flag that external analytics can check
      const win = window as BotAwareWindow;
      win.__analyticsBlocked = true;
    }
    return true;
  }
  return false;
}
