import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml, safeFetch } from './_common/http.js';

const MAX_DURATION_MS = 9000;
const API_PATTERNS = [
  /\/api\//i,
  /wp-json/i,
  /graphql/i,
  /\.json(\?|$)/i,
  /\.xml(\?|$)/i,
  /\.well-known\//i
];

const looksLikeApi = (target) => API_PATTERNS.some((pattern) => pattern.test(target));

const normalizeUrl = (base, value) => {
  try {
    return new URL(value, base).href;
  } catch (_) {
    return null;
  }
};

const parseRobots = (content, baseUrl) => {
  if (!content) return { rules: [], sitemaps: [] };
  const lines = content.split(/\r?\n/);
  const rules = [];
  const sitemaps = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (/^sitemap:/i.test(trimmed)) {
      const sitemapUrl = trimmed.split(/sitemap:/i)[1].trim();
      const normalized = normalizeUrl(baseUrl, sitemapUrl);
      if (normalized) sitemaps.push(normalized);
      return;
    }

    if (/^(allow|disallow):/i.test(trimmed)) {
      const [directive, path] = trimmed.split(':');
      const normalizedPath = path.trim();
      if (looksLikeApi(normalizedPath)) {
        rules.push({ directive: directive.toLowerCase(), path: normalizedPath });
      }
    }
  });

  return { rules, sitemaps };
};

const extractHtmlEndpoints = ($, origin) => {
  const endpoints = [];

  $('a[href], link[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const absolute = normalizeUrl(origin, href);
    if (!absolute) return;

    if (looksLikeApi(absolute)) {
      endpoints.push({ url: absolute, source: 'document-link' });
    }
  });

  $('meta').each((_, element) => {
    const content = $(element).attr('content');
    if (!content) return;
    if (looksLikeApi(content)) {
      endpoints.push({ url: normalizeUrl(origin, content) || content, source: 'meta-tag' });
    }
  });

  return endpoints;
};

const parseSitemapXml = (xml, baseUrl) => {
  if (!xml) return [];
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls = [];

  $('url > loc, sitemap > loc, loc').each((_, element) => {
    const loc = $(element).text().trim();
    if (!loc) return;
    if (looksLikeApi(loc)) {
      const normalized = normalizeUrl(baseUrl, loc) || loc;
      urls.push({ url: normalized, source: 'sitemap' });
    }
  });

  return urls;
};

const parseLinkHeader = (header, baseUrl) => {
  if (!header) return [];
  return header.split(',').map((entry) => {
    const match = entry.match(/<([^>]+)>;\s*rel="?([^"]+)"?/i);
    if (!match) return null;
    const linkUrl = normalizeUrl(baseUrl, match[1]);
    const rel = match[2];
    if (!linkUrl || !looksLikeApi(linkUrl)) return null;
    return { url: linkUrl, rel, source: 'link-header' };
  }).filter(Boolean);
};

const apiSurfaceHandler = async (url) => {
  const startedAt = Date.now();
  const origin = new URL(url).origin;

  try {
    const response = await fetchHtml(url);
    const html = response.data;
    const headers = response.headers || {};
    const $ = cheerio.load(html);

    const discovered = [];
    const htmlEndpoints = extractHtmlEndpoints($, origin);
    discovered.push(...htmlEndpoints);

    const linkHeaderEndpoints = parseLinkHeader(headers.link, origin);
    discovered.push(...linkHeaderEndpoints);

    let robots = null;
    let sitemapUrls = [];

    if (Date.now() - startedAt < MAX_DURATION_MS) {
      const robotsResponse = await safeFetch(`${origin}/robots.txt`, {
        timeout: 3000,
        headers: { Accept: 'text/plain' },
        validateStatus: () => true
      });

      if (!robotsResponse.error && robotsResponse.status < 500) {
        robots = robotsResponse.data;
        const { rules, sitemaps } = parseRobots(robots, origin);
        discovered.push(...rules.map((rule) => ({ url: `${origin}${rule.path}`, source: `robots-${rule.directive}` })));
        sitemapUrls = sitemaps.slice(0, 3);
      }
    }

    for (const sitemapUrl of sitemapUrls) {
      if (Date.now() - startedAt > MAX_DURATION_MS) break;
      const sitemapResponse = await safeFetch(sitemapUrl, {
        timeout: 4000,
        maxContentLength: 512 * 1024,
        headers: { Accept: 'application/xml, text/xml' },
        validateStatus: () => true
      });

      if (!sitemapResponse.error && sitemapResponse.status < 500) {
        const sitemapEndpoints = parseSitemapXml(sitemapResponse.data, origin);
        discovered.push(...sitemapEndpoints);
      }
    }

    const manifestHref = $('link[rel="manifest"]').attr('href');
    if (manifestHref) {
      const manifestUrl = normalizeUrl(origin, manifestHref);
      if (manifestUrl && looksLikeApi(manifestUrl)) {
        discovered.push({ url: manifestUrl, source: 'manifest-link' });
      }
    }

    const uniqueEndpoints = new Map();
    discovered.forEach((entry) => {
      if (!entry.url) return;
      const key = entry.url;
      if (!uniqueEndpoints.has(key)) {
        uniqueEndpoints.set(key, { url: entry.url, sources: new Set([entry.source || 'unknown']) });
      } else {
        uniqueEndpoints.get(key).sources.add(entry.source || 'unknown');
      }
    });

    const endpoints = Array.from(uniqueEndpoints.values()).map((item) => ({
      url: item.url,
      sources: Array.from(item.sources)
    })).slice(0, 100);

    const elapsed = Date.now() - startedAt;

    return {
      url,
      scannedAt: new Date().toISOString(),
      endpointCount: endpoints.length,
      endpoints,
      hints: {
        linkHeader: Boolean(headers.link),
        robotsScanned: Boolean(robots),
        sitemapsChecked: sitemapUrls.length,
        htmlHints: htmlEndpoints.length
      },
      elapsedMs: elapsed,
      exceededBudget: elapsed > MAX_DURATION_MS
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

export const handler = middleware(apiSurfaceHandler);
export default handler;
