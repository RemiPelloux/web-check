import axios from 'axios';
import { load } from 'cheerio';
import middleware from './_common/middleware.js';

/**
 * Broken Link & Mixed Content Auditor
 * Crawls the homepage to find 404 links and HTTP resources on HTTPS pages.
 */

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const results = await auditLinks(url);
    return results;
  } catch (error) {
    console.error('Link audit error:', error);
    return { 
      error: `Failed to audit links: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function auditLinks(baseUrl) {
  const report = {
    url: baseUrl,
    timestamp: new Date().toISOString(),
    totalLinks: 0,
    brokenLinks: [],
    mixedContent: [],
    internalLinks: 0,
    externalLinks: 0,
    score: 100
  };

  try {
    // 1. Fetch the main page
    const response = await axios.get(baseUrl, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebCheck/1.0)' }
    });

    const $ = load(response.data);
    const links = [];
    const resources = [];

    // 2. Extract all links (a href)
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          const linkUrl = new URL(href, baseUrl).href;
          links.push({ url: linkUrl, text: $(el).text().trim().substring(0, 50) });
        } catch (e) {
          // Invalid URL
        }
      }
    });

    // 3. Extract all resources (img src, script src, link href) for Mixed Content check
    $('img[src], script[src], link[href], iframe[src]').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('href');
      if (src) {
        try {
          const resourceUrl = new URL(src, baseUrl).href;
          resources.push({ 
            url: resourceUrl, 
            type: el.tagName, 
            location: 'html' 
          });
        } catch (e) {
          // Invalid URL
        }
      }
    });

    // 4. Check for Mixed Content (HTTP on HTTPS)
    const isHttps = baseUrl.startsWith('https:');
    if (isHttps) {
      resources.forEach(res => {
        if (res.url.startsWith('http:')) {
          report.mixedContent.push({
            url: res.url,
            type: res.type,
            severity: 'High'
          });
        }
      });
    }

    // 5. Check Links (Limit to first 20 internal links to keep it fast)
    const uniqueLinks = [...new Set(links.map(l => l.url))];
    report.totalLinks = uniqueLinks.length;
    
    const internalLinks = uniqueLinks.filter(l => l.startsWith(baseUrl) || l.startsWith('/'));
    report.internalLinks = internalLinks.length;
    report.externalLinks = uniqueLinks.length - internalLinks.length;

    // Only check internal links + a few external ones (max 25 total)
    const linksToCheck = uniqueLinks.slice(0, 25);

    await Promise.all(linksToCheck.map(async (linkUrl) => {
      try {
        await axios.head(linkUrl, { timeout: 5000 });
      } catch (err) {
        // If HEAD fails, try GET (some servers block HEAD)
        try {
          await axios.get(linkUrl, { timeout: 5000, maxContentLength: 1000 }); // Tiny fetch
        } catch (getErr) {
          if (getErr.response) {
            // Server responded with error status
            if (getErr.response.status >= 400) {
              report.brokenLinks.push({
                url: linkUrl,
                status: getErr.response.status,
                reason: getErr.response.statusText
              });
            }
          } else {
            // Network error
            report.brokenLinks.push({
              url: linkUrl,
              status: 0,
              reason: 'Connection Failed'
            });
          }
        }
      }
    }));

    // Calculate Score
    report.score = 100;
    report.score -= (report.brokenLinks.length * 10);
    report.score -= (report.mixedContent.length * 15);
    if (report.score < 0) report.score = 0;

  } catch (error) {
    console.error('Audit failed:', error.message);
  }

  return report;
}

export default middleware(handler);
export { handler };




