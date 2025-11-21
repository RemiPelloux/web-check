import axios from 'axios';
import { load } from 'cheerio';
import middleware from './_common/middleware.js';

/**
 * Secrets & PII Scanner
 * Scans HTML and JavaScript files for exposed API keys, tokens, and PII.
 */

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const results = await scanForSecrets(url);
    return results;
  } catch (error) {
    console.error('Secrets scan error:', error);
    return { 
      error: `Failed to scan for secrets: ${error.message}`,
      statusCode: 500 
    };
  }
};

// Comprehensive Regex Collection for Secrets Detection
const PATTERNS = {
  // Cloud Providers
  'Google API Key': /AIza[0-9A-Za-z\\-_]{35}/gm,
  'Google Captcha': /(6L[0-9A-Za-z-_]{38}|^6[0-9a-zA-Z_-]{39}$)/gm,
  'Google OAuth': /ya29\.[0-9A-Za-z\-_]+/gm,
  'AWS Access Key': /A[SK]IA[0-9A-Z]{16}/gm,
  'AWS MWS Token': /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gm,
  'Amazon AWS URL': /s3\.amazonaws\.com\/[a-zA-Z0-9\/_\-\.]+/gm,

  'OpenAI API Key': /sk-[a-zA-Z0-9]{48}/gm,

  // Social Media
  'Facebook Token': /EAACEdEose0cBA[0-9A-Za-z]+/gm,
  'Twitter Access Token': /[1-9][0-9]+-[0-9a-zA-Z]{40}/gm,
  'Twitter OAuth': /oauth_token=[a-zA-Z0-9]+/gm,
  'Instagram Access Token': /IGQ[A-Za-z0-9]{16}/gm,
  'LinkedIn Access Token': /linkedin_at_[a-zA-Z0-9]{16}/gm,
  'TikTok Access Token': /tiktok_at_[a-zA-Z0-9]{16}/gm,
  'YouTube API Key': /AIza[0-9A-Za-z\\-_]{35}/gm,

  // Communication & Messaging
  'Mailgun API Key': /key-[0-9a-zA-Z]{32}/gm,
  'Twilio API Key': /SK[0-9a-fA-F]{32}/gm,
  // Twilio SID usually starts with AC and is exactly 34 chars long (AC + 32 hex). 
  // We use word boundaries to avoid matching inside long strings.
  'Twilio Account SID': /\bAC[a-fA-F0-9]{32}\b/gm, 
  'Slack Token': /xox[baprs]-([0-9a-zA-Z]{10,48})/gm,
  'SendGrid API Key': /SG\.[0-9A-Za-z\-_]{22}\.[0-9A-Za-z\-_]{43}/gm,


  // Payments
  'Stripe API Key': /sk_live_[0-9a-zA-Z]{24}/gm,
  'Stripe Publishable Key': /pk_live_[0-9a-zA-Z]{24}/gm,
  'PayPal Braintree Access Token': /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/gm,

  // Code & Version Control
  'GitHub Token': /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/gm,
  'GitLab Token': /glpat-[a-zA-Z0-9]{20}/gm,
  'Vercel API Key': /vercel_mk_[a-zA-Z0-9]{32}/gm,
  'DigitalOcean API Key': /do_api_key_[a-zA-Z0-9]{32}/gm,
  'Cloudflare API Key': /cf_api_key_[a-zA-Z0-9]{32}/gm,
  'Linode API Key': /linode_api_key_[a-zA-Z0-9]{32}/gm,
  'Vultr API Key': /vultr_api_key_[a-zA-Z0-9]{32}/gm,

  // Private Keys & Certificates
  'RSA Private Key': /-----BEGIN RSA PRIVATE KEY-----/gm,
  'DSA Private Key': /-----BEGIN DSA PRIVATE KEY-----/gm,
  'EC Private Key': /-----BEGIN EC PRIVATE KEY-----/gm,
  'PGP Private Key': /-----BEGIN PGP PRIVATE KEY BLOCK-----/gm,
  
  // Authentication Headers
  // Stricter Basic Auth: Must look like "Basic " followed by base64-ish string (at least 20 chars)
  'Basic Auth': /basic\s+[a-zA-Z0-9+/=]{20,}/gim, 
  'Bearer Token': /bearer\s+[a-zA-Z0-9_\-\.=:_\+\/]{20,}/gim,
  'JWT Token': /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/gm,

  // Generic Secrets (Assignment Patterns)
  // Require specific variable names before the value
  'Generic Secret Assignment': /(?:password|passwd|pwd|token|secret|access_key|api_key|client_secret)[=:]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gim,

  // PII & Infrastructure
  'Email Address': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gm,
  'Internal IP': /(^|\s)((10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)([0-9]{1,3}\.){1}[0-9]{1,3})(\s|$)/gm,
};

// Whitelist for false positives
const WHITELIST = [
  'support@', 'contact@', 'info@', 'example.com', 'email@', 'admin@',
  'bootstrap', 'jquery', 'node_modules', 'react', 'vue', 'webpack',
  'google-analytics', 'googletagmanager', 'sentry', 'cdn',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2',
  'uuid=', 'id=', 'token=', 'key=', 'auth=', 'api_key=', 'client_id=' // Common URL params
];

async function scanForSecrets(url) {
  const findings = [];
  const scannedFiles = [];
  
  try {
    // 1. Scan the main HTML page
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCheck/1.0; +https://web-check.xyz)'
      }
    });

    const html = response.data;
    if (typeof html !== 'string') {
      throw new Error('Invalid response content type');
    }

    scannedFiles.push({ url, type: 'html' });
    
    // Scan HTML content
    const htmlFindings = analyzeContent(html, url, 'HTML Source');
    findings.push(...htmlFindings);

    // 2. Extract and scan JavaScript files
    const $ = load(html);
    const scripts = [];
    
    $('script[src]').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        // Handle relative URLs
        try {
          const scriptUrl = new URL(src, url).href;
          // Only scan same-origin or suspicious third-party scripts
          // We skip known benign CDNs to save time unless requested otherwise
          scripts.push(scriptUrl);
        } catch (e) {
          // Invalid URL
        }
      }
    });

    // Limit to first 10 scripts to avoid timeouts
    const scriptsToScan = scripts.slice(0, 15);

    await Promise.all(scriptsToScan.map(async (scriptUrl) => {
      try {
        const scriptRes = await axios.get(scriptUrl, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (typeof scriptRes.data === 'string') {
          scannedFiles.push({ url: scriptUrl, type: 'js' });
          const scriptFindings = analyzeContent(scriptRes.data, scriptUrl, 'JavaScript File');
          findings.push(...scriptFindings);
        }
      } catch (e) {
        // Failed to fetch script
      }
    }));

  } catch (error) {
    console.error('Scan failed:', error.message);
  }

  // Summarize results
  const uniqueFindings = deduplicateFindings(findings);
  
  return {
    url,
    timestamp: new Date().toISOString(),
    scannedFilesCount: scannedFiles.length,
    totalFindings: uniqueFindings.length,
    findings: uniqueFindings,
    scannedFiles
  };
}

function analyzeContent(content, sourceUrl, sourceType) {
  const found = [];

  for (const [type, pattern] of Object.entries(PATTERNS)) {
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
    
    let match;
    // Prevent infinite loops
    let limit = 0;
    
    while ((match = pattern.exec(content)) !== null && limit < 50) {
      limit++;
      const detectedValue = match[0];
      
      // Get context (surrounding text) to help with validation
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + detectedValue.length + 50);
      const context = content.substring(start, end);
      
      // Check whitelist with context awareness
      if (isWhitelisted(detectedValue, type, context)) {
        continue;
      }

      found.push({
        type,
        value: maskSecret(detectedValue, type), // Mask the actual secret for display
        severity: getSeverity(type),
        sourceUrl,
        sourceType,
        context: cleanContext(context)
      });
    }
  }

  return found;
}

function isWhitelisted(value, type, context = '') {
  // 1. Check global whitelist terms in value
  const lowerValue = value.toLowerCase();
  if (WHITELIST.some(term => lowerValue.includes(term))) {
    return true;
  }

  // 2. Context Validation (Crucial for reducing false positives)
  const lowerContext = context.toLowerCase();

  // Check if it looks like a URL parameter or header value
  if (lowerContext.includes('uuid=') || lowerContext.includes('uuid:') || 
      lowerContext.includes('id=') || lowerContext.includes('token=') ||
      lowerContext.includes('nonce=') || lowerContext.includes('?') ||
      lowerContext.includes('&')) {
    
    // Strict whitelist for generic UUID-like secrets
    if (type === 'Heroku API Key' || type === 'AWS MWS Token') {
      return true;
    }
  }

  // 3. Type specific checks
  if (type === 'Twilio Account SID') {
    // Twilio SIDs are strictly 34 chars (AC + 32 hex).
    // Reject if surrounded by other uppercase letters (likely a constant name)
    if (/[A-Z]{3,}/.test(context)) return true;
  }

  if (type === 'Basic Auth') {
    // Reject if it looks like a translation key or sentence
    if (lowerContext.includes('translation') || lowerContext.includes('message') || lowerContext.includes('column')) return true;
  }

  if (type === 'Generic Secret Assignment') {
    // If capturing group exists (from regex), use it. 
    // Otherwise the whole match includes "password = ..."
    if (value.length < 8) return true; // Too short to be a real secret
    if (lowerValue.includes('test') || lowerValue.includes('example') || lowerValue.includes('dummy')) return true;
  }

  if (type === 'Email Address') {
    // Ignore common placeholder domains and file extensions
    if (value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.js') || value.endsWith('.css') || value.endsWith('.svg')) return true;
    if (value.includes('w3.org') || value.includes('schema.org') || value.includes('sentry.io')) return true;
    if (value.includes('example.com') || value.includes('yourdomain.com')) return true;
  }

  // Generic UUID check - if a "key" is just a UUID and not in a specific format, ignore it unless context is suspicious
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  if (isUUID && type !== 'Heroku API Key' && type !== 'AWS MWS Token') {
    // UUIDs are often just IDs, not secrets
    return true;
  }

  return false;
}

function getSeverity(type) {
  const CRITICAL = [
    'AWS Access Key', 'AWS MWS Token', 'Stripe Secret Key', 'Slack Token', 
    'GitHub Token', 'RSA Private Key', 'DSA Private Key', 'EC Private Key', 
    'PGP Private Key', 'Twilio API Key', 'SendGrid API Key', 'Mailgun API Key',
    'PayPal Braintree Access Token'
  ];
  const HIGH = [
    'Google API Key', 'Google OAuth', 'Facebook Token', 'Twitter Access Token', 
    'Twitter OAuth', 'Heroku API Key', 'Generic Secret Assignment', 'JWT Token',
    'Bearer Token'
  ];
  const MEDIUM = [
    'Stripe Publishable Key', 'Google Captcha', 'Twilio Account SID', 'Basic Auth',
    'Amazon AWS URL'
  ];
  const LOW = ['Email Address', 'Internal IP'];

  if (CRITICAL.includes(type)) return 'Critical';
  if (HIGH.includes(type)) return 'High';
  if (MEDIUM.includes(type)) return 'Medium';
  return 'Low';
}

function maskSecret(value, type) {
  if (type === 'Email Address' || type === 'Internal IP') return value;
  if (value.length < 8) return '***';
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

function cleanContext(context) {
  return context.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function deduplicateFindings(findings) {
  const unique = [];
  const map = new Map();

  for (const item of findings) {
    const key = `${item.type}-${item.value}-${item.sourceUrl}`;
    if (!map.has(key)) {
      map.set(key, true);
      unique.push(item);
    }
  }

  return unique;
}

export default middleware(handler);
export { handler };

