import axios from 'axios';
import cheerio from 'cheerio';
import urlLib from 'url';
import puppeteer from 'puppeteer';
import middleware from './_common/middleware.js';

const extractLinksFromHtml = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const internalLinksMap = new Map();
  const externalLinksMap = new Map();
  const baseUrlObj = new URL(baseUrl);

  // Get all links on the page
  $('a[href]').each((i, link) => {
    const href = $(link).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return; // Skip anchors, email, and phone links
    }

    try {
      const absoluteUrl = urlLib.resolve(baseUrl, href);
      const linkUrl = new URL(absoluteUrl);
      
      // Check if it's internal (same domain) or external
      if (linkUrl.hostname === baseUrlObj.hostname) {
        const count = internalLinksMap.get(absoluteUrl) || 0;
        internalLinksMap.set(absoluteUrl, count + 1);
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        const count = externalLinksMap.get(absoluteUrl) || 0;
        externalLinksMap.set(absoluteUrl, count + 1);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  return { internalLinksMap, externalLinksMap };
};

const linkedPagesHandler = async (url) => {
  let html = '';
  let method = 'static';

  try {
    // First try static HTML fetch
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    html = response.data;
    
    console.log(`Retrieved ${html.length} characters of HTML via static fetch`);
    
    // Quick check if this looks like a dynamic page
    const isDynamic = html.includes('React') || 
                     html.includes('Vue') || 
                     html.includes('Angular') ||
                     html.includes('__NEXT_DATA__') ||
                     html.includes('gatsby') ||
                     html.length < 1000; // Very small HTML might indicate client-side rendering

    if (isDynamic) {
      console.log('Detected potential dynamic content, will try Puppeteer if no links found');
    }
    
  } catch (error) {
    console.error('Static fetch failed:', error.message);
    return {
      statusCode: 500,
      body: { error: `Failed to fetch page: ${error.message}` }
    };
  }

  // Extract links from static HTML
  let { internalLinksMap, externalLinksMap } = extractLinksFromHtml(html, url);
  
  // If no links found, try with Puppeteer for dynamic content
  if (internalLinksMap.size === 0 && externalLinksMap.size === 0) {
    console.log('No links found in static HTML, trying Puppeteer...');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--no-first-run'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate and wait for content to load
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 15000 
      });
      
      // Wait a bit more for dynamic content
      await page.waitForTimeout(3000);
      
      // Get the rendered HTML
      const renderedHtml = await page.content();
      console.log(`Retrieved ${renderedHtml.length} characters of HTML via Puppeteer`);
      
      // Extract links from rendered HTML
      const puppeteerResult = extractLinksFromHtml(renderedHtml, url);
      internalLinksMap = puppeteerResult.internalLinksMap;
      externalLinksMap = puppeteerResult.externalLinksMap;
      method = 'puppeteer';
      
    } catch (puppeteerError) {
      console.error('Puppeteer failed:', puppeteerError.message);
      // Continue with empty results
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Sort by most occurrences and convert to arrays
  const internalLinks = [...internalLinksMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => ({ url: entry[0], count: entry[1] }));
    
  const externalLinks = [...externalLinksMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => ({ url: entry[0], count: entry[1] }));

  // If still no links found
  if (internalLinks.length === 0 && externalLinks.length === 0) {
    return {
      internal: [],
      external: [],
      analysis: {
        method: method,
        internalCount: 0,
        externalCount: 0,
        totalUniqueLinks: 0,
        message: 'Aucun lien de navigation détecté',
        note: 'Cette page semble être principalement axée sur le contenu sans liens de navigation externes'
      }
    };
  }

  return { 
    internal: internalLinks.map(link => link.url), 
    external: externalLinks.map(link => link.url),
    analysis: {
      method: method,
      internalCount: internalLinks.length,
      externalCount: externalLinks.length,
      totalUniqueLinks: internalLinks.length + externalLinks.length,
      internalWithCounts: internalLinks,
      externalWithCounts: externalLinks
    }
  };
};

export const handler = middleware(linkedPagesHandler);
export default handler;
