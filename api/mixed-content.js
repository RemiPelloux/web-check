import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const MAX_DURATION_MS = 9000;
const RESOURCE_SELECTORS = [
  { selector: 'script[src]', attr: 'src', type: 'script' },
  { selector: 'link[rel="stylesheet"]', attr: 'href', type: 'stylesheet' },
  { selector: 'link[rel="preload"][as="style"]', attr: 'href', type: 'stylesheet' },
  { selector: 'img[src]', attr: 'src', type: 'image' },
  { selector: 'img[srcset]', attr: 'srcset', type: 'imageSet' },
  { selector: 'source[src]', attr: 'src', type: 'media' },
  { selector: 'source[srcset]', attr: 'srcset', type: 'mediaSet' },
  { selector: 'video[src]', attr: 'src', type: 'media' },
  { selector: 'audio[src]', attr: 'src', type: 'media' },
  { selector: 'iframe[src]', attr: 'src', type: 'iframe' },
  { selector: 'object[data]', attr: 'data', type: 'object' },
  { selector: 'embed[src]', attr: 'src', type: 'embed' },
  { selector: 'form[action]', attr: 'action', type: 'form' }
];

const extractCandidates = (value) => {
  if (!value) return [];
  if (value.includes(',')) {
    return value.split(',').map((entry) => entry.trim().split(' ')[0]).filter(Boolean);
  }
  return [value.trim()];
};

const isExplicitHttp = (candidate) => candidate.toLowerCase().startsWith('http://');

const mixedContentHandler = async (url) => {
  const startedAt = Date.now();

  if (!url.startsWith('https://')) {
    return {
      url,
      scannedAt: new Date().toISOString(),
      secureContext: false,
      skipped: 'Mixed content analysis applies only to HTTPS pages.'
    };
  }

  try {
    const response = await fetchHtml(url);
    const html = response.data;
    const headers = response.headers || {};
    const $ = cheerio.load(html);

    const totals = { script: 0, stylesheet: 0, image: 0, media: 0, iframe: 0, object: 0, embed: 0, form: 0 };
    const insecureResources = [];

    RESOURCE_SELECTORS.forEach(({ selector, attr, type }) => {
      $(selector).each((_, element) => {
        if (Date.now() - startedAt > MAX_DURATION_MS) return;

        const rawValue = $(element).attr(attr);
        const candidates = extractCandidates(rawValue);

        if (type === 'imageSet' || type === 'mediaSet') {
          totals.image += type === 'imageSet' ? candidates.length : 0;
          totals.media += type === 'mediaSet' ? candidates.length : 0;
        } else {
          totals[type] = (totals[type] || 0) + 1;
        }

        candidates.forEach((candidate) => {
          if (!candidate) return;
          if (!isExplicitHttp(candidate)) return;

          insecureResources.push({
            type: type.replace('Set', ''),
            url: candidate,
            element: selector.split('[')[0]
          });
        });
      });
    });

    const elapsed = Date.now() - startedAt;

    return {
      url,
      scannedAt: new Date().toISOString(),
      secureContext: insecureResources.length === 0,
      totals,
      insecureCount: insecureResources.length,
      insecureResources: insecureResources.slice(0, 100),
      truncated: insecureResources.length > 100,
      responseHeaders: {
        contentType: headers['content-type'] || null,
        contentLength: headers['content-length'] || null
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

export const handler = middleware(mixedContentHandler);
export default handler;
