import cheerio from 'cheerio';
import psl from 'psl';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const MAX_DURATION_MS = 9000;
const RESOURCE_SELECTORS = [
  { selector: 'script[src]', attr: 'src', type: 'script' },
  { selector: 'link[rel="stylesheet"]', attr: 'href', type: 'stylesheet' },
  { selector: 'link[rel="preload"][as="style"]', attr: 'href', type: 'stylesheet' },
  { selector: 'link[rel="preload"][as="script"]', attr: 'href', type: 'script' },
  { selector: 'link[rel="preconnect"]', attr: 'href', type: 'preconnect' },
  { selector: 'link[rel="dns-prefetch"]', attr: 'href', type: 'dnsPrefetch' },
  { selector: 'iframe[src]', attr: 'src', type: 'iframe' },
  { selector: 'img[src]', attr: 'src', type: 'image' },
  { selector: 'script[type="application/ld+json"]', attr: 'src', type: 'metadata' }
];

const CATEGORY_DEFINITIONS = [
  { name: 'analytics', label: 'Analytics & Tracking', patterns: [/google-analytics\.com/, /googletagmanager\.com/, /segment\.com/, /mixpanel\.com/, /matomo/, /hotjar\.com/] },
  { name: 'ads', label: 'Advertising', patterns: [/doubleclick\.net/, /googlesyndication\.com/, /adservice\.google\.com/, /taboola\.com/, /outbrain\.com/, /adnxs\.com/] },
  { name: 'marketing', label: 'Marketing Automation', patterns: [/hubspot\.com/, /marketo\.com/, /pardot\.com/, /salesforce\.com/, /mailchimp\.com/] },
  { name: 'social', label: 'Social & Widgets', patterns: [/facebook\.com/, /facebook\.net/, /twitter\.com/, /linkedin\.com/, /instagram\.com/, /tiktokcdn\.com/] },
  { name: 'performance', label: 'Performance & CDN', patterns: [/cdn\./, /cloudflare\.com/, /akamaihd\.net/, /fastly\.net/, /stackpathcdn\.com/, /cloudfront\.net/] },
  { name: 'security', label: 'Security & Tag Managers', patterns: [/sentry\.io/, /datadoghq\.com/, /newrelic\.com/, /logrocket\.com/, /bugsnag\.com/] }
];

const getRegistrableDomain = (value) => {
  try {
    const url = new URL(value);
    const parsed = psl.parse(url.hostname);
    return parsed.domain || url.hostname;
  } catch (_) {
    return null;
  }
};

const classifyCategory = (target) => {
  if (!target) return null;
  return CATEGORY_DEFINITIONS.find((category) => category.patterns.some((pattern) => pattern.test(target))) || null;
};

const thirdPartyRiskHandler = async (url) => {
  const startedAt = Date.now();

  try {
    const { data: html, headers } = await fetchHtml(url);
    const $ = cheerio.load(html);

    const pageDomain = getRegistrableDomain(url);
    const resources = new Map();

    RESOURCE_SELECTORS.forEach(({ selector, attr, type }) => {
      $(selector).each((_, element) => {
        if (Date.now() - startedAt > MAX_DURATION_MS) return;

        const rawValue = $(element).attr(attr);
        if (!rawValue) return;
        if (rawValue.startsWith('data:')) return;

        let candidate;
        try {
          candidate = new URL(rawValue, url).href;
        } catch (_) {
          return;
        }

        if (!candidate.startsWith('http')) return;

        const registrable = getRegistrableDomain(candidate);
        if (!registrable || !pageDomain) return;

        if (registrable === pageDomain) return;

        const key = `${type}:${candidate}`;
        if (!resources.has(key)) {
          const category = classifyCategory(candidate) || classifyCategory(registrable);
          resources.set(key, {
            type,
            url: candidate,
            hostname: new URL(candidate).hostname,
            registrable,
            category: category ? category.name : 'uncategorized',
            categoryLabel: category ? category.label : 'Uncategorized'
          });
        }
      });
    });

    const groupedByCategory = {};
    const vendorMap = new Map();

    Array.from(resources.values()).forEach((resource) => {
      groupedByCategory[resource.category] = groupedByCategory[resource.category] || {
        label: resource.categoryLabel,
        count: 0,
        items: []
      };
      const entry = groupedByCategory[resource.category];
      entry.count += 1;
      if (entry.items.length < 25) {
        entry.items.push({ url: resource.url, type: resource.type, hostname: resource.hostname });
      }

      const vendor = vendorMap.get(resource.registrable) || { count: 0, hostnames: new Set() };
      vendor.count += 1;
      vendor.hostnames.add(resource.hostname);
      vendorMap.set(resource.registrable, vendor);
    });

    const elapsed = Date.now() - startedAt;

    return {
      url,
      scannedAt: new Date().toISOString(),
      thirdPartyCount: resources.size,
      registrableDomain: pageDomain,
      categories: groupedByCategory,
      topVendors: Array.from(vendorMap.entries())
        .map(([registrable, value]) => ({
          registrable,
          count: value.count,
          hostnames: Array.from(value.hostnames).slice(0, 5)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      headers: {
        contentSecurityPolicy: headers['content-security-policy'] || null,
        permissionsPolicy: headers['permissions-policy'] || null
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

export const handler = middleware(thirdPartyRiskHandler);
export default handler;
