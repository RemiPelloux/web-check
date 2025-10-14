import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml, safeFetch } from './_common/http.js';

const MAX_DURATION_MS = 9000;

const evaluateManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, issues: ['Manifest is not valid JSON.'], score: 0 };
  }

  const issues = [];
  let score = 0;

  if (manifest.name || manifest.short_name) {
    score += 25;
  } else {
    issues.push('Missing name or short_name.');
  }

  if (manifest.start_url) {
    score += 20;
  } else {
    issues.push('Missing start_url.');
  }

  if (manifest.display) {
    score += 15;
  } else {
    issues.push('Missing display property.');
  }

  if (Array.isArray(manifest.icons) && manifest.icons.some((icon) => parseInt(icon.sizes, 10) >= 192)) {
    score += 20;
  } else {
    issues.push('No icon ≥192px declared.');
  }

  if (manifest.theme_color || manifest.background_color) {
    score += 10;
  } else {
    issues.push('Missing theme_color or background_color.');
  }

  if (manifest.scope) {
    score += 10;
  } else {
    issues.push('Missing scope.');
  }

  return { valid: issues.length === 0, issues, score: Math.min(score, 100) };
};

const detectServiceWorker = ($) => {
  const registrations = [];
  $('script').each((_, element) => {
    const content = $(element).html();
    if (!content) return;
    if (/navigator\.serviceWorker\.register\(/i.test(content)) {
      registrations.push(content.slice(0, 200));
    }
  });
  return registrations;
};

const pwaAuditHandler = async (url) => {
  const startedAt = Date.now();

  try {
    const response = await fetchHtml(url);
    const html = response.data;
    const headers = response.headers || {};
    const $ = cheerio.load(html);

    const manifestHref = $('link[rel="manifest"]').attr('href');
    let manifestUrl = null;
    let manifestData = null;
    let manifestScore = { valid: false, issues: ['Manifest not detected.'], score: 0 };

    if (manifestHref && Date.now() - startedAt < MAX_DURATION_MS) {
      try {
        manifestUrl = new URL(manifestHref, url).href;
        const manifestResponse = await safeFetch(manifestUrl, {
          timeout: 4000,
          responseType: 'json',
          headers: {
            Accept: 'application/manifest+json, application/json;q=0.9, */*;q=0.8'
          },
          maxContentLength: 200 * 1024
        });

        if (!manifestResponse.error) {
          manifestData = manifestResponse.data;
          manifestScore = evaluateManifest(manifestData);
        } else {
          manifestScore = { valid: false, issues: ['Failed to fetch manifest.'], score: 0 };
        }
      } catch (error) {
        manifestScore = { valid: false, issues: [error.message], score: 0 };
      }
    }

    const serviceWorkerSnippets = detectServiceWorker($);
    const themeColor = $('meta[name="theme-color"]').attr('content');
    const appleCapable = $('meta[name="apple-mobile-web-app-capable"]').attr('content');
    const appleStatusBar = $('meta[name="apple-mobile-web-app-status-bar-style"]').attr('content');
    const offlineReady = serviceWorkerSnippets.length > 0 && manifestScore.score >= 50;

    const scoreBreakdown = {
      manifest: manifestScore.score,
      serviceWorker: serviceWorkerSnippets.length ? 25 : 0,
      themeColor: themeColor ? 10 : 0,
      appleTouch: $('link[rel="apple-touch-icon"]').length ? 10 : 0,
      offlineReady: offlineReady ? 10 : 0
    };

    const totalScore = Math.min(Object.values(scoreBreakdown).reduce((acc, value) => acc + value, 0), 100);

    return {
      url,
      scannedAt: new Date().toISOString(),
      score: totalScore,
      manifest: {
        present: Boolean(manifestHref),
        url: manifestUrl,
        data: manifestData,
        issues: manifestScore.issues,
        valid: manifestScore.valid,
        score: manifestScore.score
      },
      serviceWorker: {
        detected: serviceWorkerSnippets.length > 0,
        snippetCount: serviceWorkerSnippets.length,
        samples: serviceWorkerSnippets.slice(0, 3)
      },
      offlineReady,
      metadata: {
        themeColor,
        appleMobileWebAppCapable: appleCapable || null,
        appleStatusBarStyle: appleStatusBar || null,
        viewport: $('meta[name="viewport"]').attr('content') || null
      },
      headers: {
        serviceWorkerAllowed: headers['service-worker-allowed'] || null,
        crossOriginEmbedderPolicy: headers['cross-origin-embedder-policy'] || null
      },
      scoreBreakdown,
      elapsedMs: Date.now() - startedAt,
      exceededBudget: Date.now() - startedAt > MAX_DURATION_MS
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

export const handler = middleware(pwaAuditHandler);
export default handler;
