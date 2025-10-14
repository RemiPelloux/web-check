import axios from 'axios';
import middleware from './_common/middleware.js';

// ============================================================================
// DICTIONARIES - Fast keyword matching for FR/EN legal pages
// ============================================================================

const URL_TOKENS = {
  en: ['privacy', 'privacy-policy', 'legal', 'terms', 'terms-of-service', 'cookie', 'cookies', 'imprint', 'legal-notice'],
  fr: ['mentions-legales', 'mentions-légales', 'cgu', 'cgv', 'c.g.u', 'c.g.v', 'conditions-generales', 'conditions-générales', 
       'confidentialite', 'confidentialité', 'cookies', 'donnees-personnelles', 'données-personnelles']
};

const PAGE_KEYWORDS = {
  en: ['privacy policy', 'terms of use', 'terms of service', 'terms of sale', 'terms and conditions', 
       'legal notice', 'imprint', 'cookie policy', 'cookie notice', 'data protection', 'terms & conditions'],
  fr: ['mentions légales', 'conditions générales', 'cgu', 'cgv', 'politique de confidentialité', 
       'cookies', 'données personnelles', 'responsabilité', 'responsabilités', 'protection des données',
       'conditions d\'utilisation', 'conditions de vente']
};

const POLICY_HOSTS = ['onetrust.com', 'cookiebot.com', 'cookie-script.com', 'trustarc.com'];

// ============================================================================
// MAIN HANDLER
// ============================================================================

const handler = async (url) => {
  const startTime = Date.now();
  const HARD_TIMEOUT = 15000; // 15s max
  
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const result = await analyzeLegalPages(url, startTime, HARD_TIMEOUT);
    result.elapsed = Date.now() - startTime;
    return result;
    
  } catch (error) {
    console.error('Legal pages analysis error:', error);
    return { 
      error: `Failed to analyze legal pages: ${error.message}`,
      statusCode: 500,
      elapsed: Date.now() - startTime
    };
  }
};

// ============================================================================
// PHASE 0: Preparation
// ============================================================================

function normalizeBaseURL(url) {
  const parsed = new URL(url);
  // Force HTTPS, strip paths to origin
  return `${parsed.protocol}//${parsed.hostname}`;
}

const LANG_PROFILES = {
  fr: { 'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.6' },
  en: { 'Accept-Language': 'en,en-GB;q=0.9,en-US;q=0.9,fr;q=0.4' }
};

// ============================================================================
// MAIN ANALYSIS LOGIC
// ============================================================================

async function analyzeLegalPages(url, startTime, hardTimeout) {
  const baseURL = normalizeBaseURL(url);
  const state = {
    found: { fr: false, en: false },
    validPages: [],
    requestCount: 0,
    candidates: [],
    coverage: { fr: [], en: [] }
  };

  // PHASE 1: Smart homepage probe (≤2s)
  console.log('Phase 1: Probing homepage...');
  const homepages = await fetchHomepageVariants(baseURL, startTime, hardTimeout);
  state.requestCount += homepages.length;

  if (homepages.length === 0) {
    return buildFailureResult(state, 'Cannot access homepage');
  }

  // PHASE 2: Footer-first link harvest (≤2s)
  console.log('Phase 2: Harvesting footer links...');
  const candidates = harvestCandidates(homepages, baseURL);
  state.candidates = candidates.slice(0, 12); // Top 12 candidates
  console.log(`Found ${state.candidates.length} candidates`);

  // PHASE 3: Probe candidates (≤6s total, parallel)
  console.log('Phase 3: Probing candidates...');
  const probeResults = await probeCandidatesParallel(
    state.candidates, 
    startTime, 
    hardTimeout, 
    state
  );

  state.requestCount += probeResults.filter(r => r !== null).length;

  // PHASE 4: Evaluate and early stop
  for (const result of probeResults) {
    if (!result || !result.isValid) continue;

    const page = {
      url: result.finalUrl,
      language: result.language,
      score: result.score,
      signals: result.signals,
      type: result.pageType
    };

    state.validPages.push(page);

    // Mark coverage
    if (result.language === 'fr' || result.language === 'mixed') {
      state.found.fr = true;
      state.coverage.fr.push(page);
    }
    if (result.language === 'en' || result.language === 'mixed') {
      state.found.en = true;
      state.coverage.en.push(page);
    }

    // Early stop if both languages covered
    if (state.found.fr && state.found.en) {
      console.log('Early stop: Both FR and EN covered');
      break;
    }
  }

  // PHASE 5: Escalations (if time left and not covered)
  const timeLeft = hardTimeout - (Date.now() - startTime);
  if (timeLeft > 3000 && (!state.found.fr || !state.found.en)) {
    console.log('Phase 5: Trying locale roots...');
    await tryLocaleRoots(baseURL, state, startTime, hardTimeout);
  }

  // PHASE 6: Build result
  return buildResult(state);
}

// ============================================================================
// PHASE 1: Homepage Variants
// ============================================================================

async function fetchHomepageVariants(baseURL, startTime, hardTimeout) {
  const results = [];
  
  // Realistic browser headers to avoid 403 blocks
  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  };
  
  const fetchOptions = [
    { url: baseURL, lang: 'fr', headers: { ...browserHeaders, ...LANG_PROFILES.fr } },
    { url: baseURL, lang: 'en', headers: { ...browserHeaders, ...LANG_PROFILES.en } }
  ];

  const promises = fetchOptions.map(async (opt) => {
    if (Date.now() - startTime > hardTimeout - 2000) return null;
    
    try {
      const response = await axios.get(opt.url, {
        headers: opt.headers,
        timeout: 4000, // Increased timeout
        maxContentLength: 300000, // 300KB max
        maxRedirects: 5,
        validateStatus: (s) => s < 500
      });

      if (response.status === 200) {
        return {
          html: response.data,
          finalUrl: response.request.res?.responseUrl || opt.url,
          lang: opt.lang
        };
      }
    } catch (e) {
      console.log(`Homepage fetch failed (${opt.lang}):`, e.message);
    }
    return null;
  });

  const settled = await Promise.allSettled(promises);
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  }

  return results;
}

// ============================================================================
// PHASE 2: Footer-first Link Harvest
// ============================================================================

function harvestCandidates(homepages, baseURL) {
  const candidates = new Map();

  for (const page of homepages) {
    const links = extractFooterLinks(page.html, baseURL);
    
    for (const link of links) {
      const key = link.url;
      if (!candidates.has(key)) {
        candidates.set(key, link);
      } else {
        // Merge scores (take max)
        const existing = candidates.get(key);
        existing.score = Math.max(existing.score, link.score);
      }
    }
  }

  // Sort by score descending
  return Array.from(candidates.values())
    .sort((a, b) => b.score - a.score);
}

function extractFooterLinks(html, baseURL) {
  const links = [];
  
  // Detect footer using priority cascade
  let footerContent = '';
  
  // Try ARIA landmark
  const ariaMatch = html.match(/<[^>]+role=["']contentinfo["'][^>]*>(.*?)<\/[^>]+>/is);
  if (ariaMatch) {
    footerContent = ariaMatch[1];
  } else {
    // Try <footer> tag
    const footerMatch = html.match(/<footer[^>]*>(.*?)<\/footer>/is);
    if (footerMatch) {
      footerContent = footerMatch[1];
    } else {
      // Heuristic: last div/section with footer-ish class/id
      const divMatches = html.match(/<(div|section)[^>]*(footer|site-footer|page-footer)[^>]*>(.*?)<\/\1>/gis);
      if (divMatches && divMatches.length > 0) {
        footerContent = divMatches[divMatches.length - 1];
      } else {
        // Fallback: last 20% of HTML
        footerContent = html.slice(-Math.floor(html.length * 0.2));
      }
    }
  }

  // Extract links from footer
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(footerContent)) !== null) {
    const href = match[1];
    const text = match[2].trim().toLowerCase();
    
    // Skip anchors, mailto, tel
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    
    try {
      const absoluteUrl = new URL(href, baseURL).href;
      const score = scoreLinkCandidate(absoluteUrl, text, true);
      
      if (score > 0) {
        links.push({ url: absoluteUrl, text, score, source: 'footer' });
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  return links;
}

function scoreLinkCandidate(url, text, isFooter) {
  let score = 0;
  const urlLower = url.toLowerCase();
  const textLower = text.toLowerCase();

  // URL token match (+3)
  for (const lang of ['en', 'fr']) {
    for (const token of URL_TOKENS[lang]) {
      if (urlLower.includes(token)) {
        score += 3;
            break;
          }
    }
  }

  // Anchor text keyword match (+3)
  for (const lang of ['en', 'fr']) {
    for (const keyword of PAGE_KEYWORDS[lang]) {
      if (textLower.includes(keyword)) {
        score += 3;
        break;
      }
    }
  }

  // Short acronyms (CGU, CGV, T&C, etc.) (+2)
  if (/^(cgu|cgv|c\.g\.u|c\.g\.v|t&c|tos)$/i.test(textLower)) {
    score += 2;
  }

  // Footer location (+2)
  if (isFooter) {
    score += 2;
  }

  // External domain (-1 but keep)
  try {
    const linkDomain = new URL(url).hostname;
    const isExternal = !linkDomain.includes(new URL(url).hostname);
    if (isExternal) score -= 1;
  } catch (e) {}

  return score;
}

// ============================================================================
// PHASE 3: Probe Candidates in Parallel
// ============================================================================

async function probeCandidatesParallel(candidates, startTime, hardTimeout, state) {
  const results = [];
  const maxConcurrent = 6;
  
  for (let i = 0; i < candidates.length; i += maxConcurrent) {
    // Early stop if both languages found
    if (state.found.fr && state.found.en) break;
    
    // Check timeout
    if (Date.now() - startTime > hardTimeout - 3000) break;
    
    const batch = candidates.slice(i, i + maxConcurrent);
    const promises = batch.map(c => probeCandidate(c, startTime, hardTimeout));
    
    const batchResults = await Promise.allSettled(promises);
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      } else {
        results.push(null);
      }
    }
  }

  return results;
}

async function probeCandidate(candidate, startTime, hardTimeout) {
  if (Date.now() - startTime > hardTimeout - 2000) return null;

  try {
    const response = await axios.get(candidate.url, {
      timeout: 4000,
      maxContentLength: 300000,
      maxRedirects: 5,
      validateStatus: (s) => s < 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    if (response.status !== 200) return null;

    const finalUrl = response.request.res?.responseUrl || candidate.url;
    const content = response.data;
    const contentType = response.headers['content-type'] || '';

    // Handle PDFs
    if (contentType.includes('pdf')) {
      return evaluatePDF(content, finalUrl, candidate);
    }

    // Evaluate HTML page
    return evaluatePage(content, finalUrl, candidate);

  } catch (error) {
    console.log(`Probe failed for ${candidate.url}:`, error.message);
    return null;
  }
}

function evaluatePage(html, finalUrl, candidate) {
  const signals = [];
  let score = 0;

  // Extract <html lang>
  const langMatch = html.match(/<html[^>]+lang=["']?([a-z]{2})/i);
  const htmlLang = langMatch ? langMatch[1].toLowerCase() : null;

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].toLowerCase() : '';

  // Extract h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].toLowerCase() : '';

  // Extract body snippet (first 5000 chars)
  const bodySnippet = html.slice(0, 5000).toLowerCase();

  // Detect language
  let language = 'unknown';
  let frHits = 0;
  let enHits = 0;

  for (const keyword of PAGE_KEYWORDS.fr) {
    if (title.includes(keyword) || h1.includes(keyword) || bodySnippet.includes(keyword)) {
      frHits++;
    }
  }

  for (const keyword of PAGE_KEYWORDS.en) {
    if (title.includes(keyword) || h1.includes(keyword) || bodySnippet.includes(keyword)) {
      enHits++;
    }
  }

  if (frHits >= 2 && enHits >= 2) language = 'mixed';
  else if (frHits >= 2) language = 'fr';
  else if (enHits >= 2) language = 'en';
  else if (htmlLang === 'fr') language = 'fr';
  else if (htmlLang === 'en') language = 'en';

  // SCORING
  // +3 if title/H1 contains legal keywords
  const hasTitleKeywords = PAGE_KEYWORDS.fr.some(k => title.includes(k) || h1.includes(k)) ||
                          PAGE_KEYWORDS.en.some(k => title.includes(k) || h1.includes(k));
  if (hasTitleKeywords) {
    score += 3;
    signals.push('title/h1 match');
  }

  // +2 if page body contains ≥2 keyword hits
  if (frHits >= 2 || enHits >= 2) {
    score += 2;
    signals.push('body keywords');
  }

  // +2 if <html lang> starts with expected language
  if (htmlLang === 'fr' || htmlLang === 'en') {
    score += 2;
    signals.push(`html lang=${htmlLang}`);
  }

  // +1 if URL token matches
  const urlLower = finalUrl.toLowerCase();
  const hasUrlToken = URL_TOKENS.fr.some(t => urlLower.includes(t)) ||
                     URL_TOKENS.en.some(t => urlLower.includes(t));
  if (hasUrlToken) {
    score += 1;
    signals.push('URL token');
  }

  // +1 if on recognized policy host
  const isPolicyHost = POLICY_HOSTS.some(h => finalUrl.includes(h));
  if (isPolicyHost) {
    score += 1;
    signals.push('policy host');
  }

  // Determine page type
  const pageType = determinePageType(title + ' ' + h1 + ' ' + bodySnippet);

  return {
    finalUrl,
    language,
    score,
    signals,
    isValid: score >= 4,
    pageType,
    candidate
  };
}

function evaluatePDF(content, finalUrl, candidate) {
  // Simple PDF text extraction (basic approach)
  // In production, use proper PDF parser
  const text = content.toString().toLowerCase().slice(0, 5000);
  
  let frHits = 0;
  let enHits = 0;

  for (const keyword of PAGE_KEYWORDS.fr) {
    if (text.includes(keyword)) frHits++;
  }

  for (const keyword of PAGE_KEYWORDS.en) {
    if (text.includes(keyword)) enHits++;
  }

  const language = frHits > enHits ? 'fr' : (enHits > 0 ? 'en' : 'unknown');
  const score = (frHits + enHits >= 2) ? 5 : 2;

  return {
    finalUrl,
    language,
    score,
    signals: ['PDF', `${frHits + enHits} keywords`],
    isValid: score >= 4,
    pageType: 'PDF Policy',
    candidate
  };
}

function determinePageType(content) {
  const lower = content.toLowerCase();
  
  if (lower.includes('privacy') || lower.includes('confidentialité') || lower.includes('données personnelles')) {
    return 'Privacy Policy / Politique de Confidentialité';
  }
  if (lower.includes('mentions légales') || lower.includes('legal notice') || lower.includes('imprint')) {
    return 'Mentions Légales / Legal Notice';
  }
  if (lower.includes('cgu') || lower.includes('conditions générales') || lower.includes('terms')) {
    return 'CGU/CGV / Terms of Service';
  }
  if (lower.includes('cookie')) {
    return 'Cookie Policy';
  }
  
  return 'Legal Page';
}

// ============================================================================
// PHASE 5: Escalations (Locale Roots)
// ============================================================================

async function tryLocaleRoots(baseURL, state, startTime, hardTimeout) {
  const localeUrls = [
    `${baseURL}/fr`,
    `${baseURL}/en`,
    `${baseURL}/?lang=fr`,
    `${baseURL}/?lang=en`
  ];

  for (const url of localeUrls) {
    if (Date.now() - startTime > hardTimeout - 2000) break;
    if (state.found.fr && state.found.en) break;

    try {
      const response = await axios.get(url, {
        timeout: 3000,
        maxContentLength: 200000,
        maxRedirects: 3,
        validateStatus: (s) => s < 500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      });

      if (response.status === 200) {
        const links = extractFooterLinks(response.data, baseURL);
        state.candidates.push(...links.slice(0, 3));
        state.requestCount++;
      }
    } catch (e) {
      // Continue
    }
  }
}

// ============================================================================
// PHASE 6: Build Results
// ============================================================================

function buildResult(state) {
  const pass = state.found.fr && state.found.en;
  const status = pass ? 'Conforme' : (state.validPages.length > 0 ? 'Partiellement conforme' : 'Non-conforme');

  return {
    status,
    pass,
    coverage: {
      french: state.found.fr,
      english: state.found.en
    },
    validPages: state.validPages.map(p => ({
      url: p.url,
      language: p.language,
      type: p.type,
      score: p.score,
      signals: p.signals
    })),
    summary: {
      totalRequests: state.requestCount,
      pagesFound: state.validPages.length,
      candidatesEvaluated: state.candidates.length
    },
    complianceScore: calculateComplianceScore(state),
    missingPages: getMissingPages(state)
  };
}

function buildFailureResult(state, reason) {
  return {
    status: 'Erreur',
    pass: false,
    error: reason,
    coverage: { french: false, english: false },
    validPages: [],
    summary: { totalRequests: state.requestCount, pagesFound: 0, candidatesEvaluated: 0 },
    complianceScore: 0
  };
}

function calculateComplianceScore(state) {
  let score = 0;
  
  if (state.found.fr) score += 50;
  if (state.found.en) score += 50;
  
  // Bonus for multiple pages per language
  if (state.coverage.fr.length > 2) score += 5;
  if (state.coverage.en.length > 2) score += 5;
  
  return Math.min(100, score);
}

function getMissingPages(state) {
  const missing = [];
  
  if (!state.found.fr) {
    missing.push('Pages légales en français manquantes');
  }
  if (!state.found.en) {
    missing.push('Legal pages in English missing');
  }
  
  return missing;
}

export default middleware(handler);
