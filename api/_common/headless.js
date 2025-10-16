import puppeteer from 'puppeteer';

/**
 * Fetches and renders a page with Puppeteer, waiting for JavaScript execution
 * @param {string} url - URL to fetch
 * @param {object} options - Options
 * @param {number} options.timeout - Maximum time in milliseconds (default: 18000)
 * @param {number} options.waitTime - Time to wait after load for dynamic content (default: 2000)
 * @param {string} options.waitUntil - When to consider navigation complete (default: 'networkidle2')
 * @returns {Promise<{html: string, resources: Array, pageData: object}>}
 */
export const fetchRenderedHtml = async (url, options = {}) => {
  const {
    timeout = 18000,
    waitTime = 2000,
    waitUntil = 'networkidle2'
  } = options;

  const startTime = Date.now();
  let browser = null;

  try {
    // Launch browser with optimized settings for speed
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-extensions',
        '--disable-software-rasterizer',
        '--disable-web-security', // Allow CORS for analysis
      ],
      timeout: 5000 // Quick launch timeout
    });

    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    // Set realistic browser headers
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Track network requests for resource detection
    const resources = [];
    page.on('request', (request) => {
      const resourceUrl = request.url();
      const resourceType = request.resourceType();
      
      try {
        const parsedUrl = new URL(resourceUrl);
        resources.push({
          url: resourceUrl,
          domain: parsedUrl.hostname,
          type: resourceType,
          method: request.method()
        });
      } catch (e) {
        // Invalid URL, skip
      }
    });

    // Navigate with timeout
    const navigationTimeout = Math.max(timeout - 3000, 5000); // Reserve 3s for processing
    await page.goto(url, {
      waitUntil,
      timeout: navigationTimeout
    });

    // Wait additional time for dynamic content
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Extract rendered HTML
    const html = await page.content();

    // Extract useful page data (buttons, forms, etc.)
    const pageData = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
        .map(btn => ({
          text: btn.textContent?.trim() || '',
          id: btn.id,
          class: btn.className
        }))
        .filter(btn => btn.text);

      const images = Array.from(document.querySelectorAll('img[src]'))
        .map(img => ({
          src: img.src,
          alt: img.alt
        }));

      const scripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src)
        .filter(src => src);

      return {
        buttons,
        images,
        scripts,
        title: document.title,
        framework: {
          react: !!window.React || document.querySelector('[data-reactroot]') !== null,
          vue: !!window.Vue || document.querySelector('[data-v-]') !== null,
          angular: !!window.angular || document.querySelector('[ng-app]') !== null
        }
      };
    });

    const elapsedTime = Date.now() - startTime;

    return {
      html,
      resources,
      pageData,
      metadata: {
        elapsedTime,
        resourceCount: resources.length,
        buttonCount: pageData.buttons.length,
        imageCount: pageData.images.length
      }
    };

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    throw new Error(`Puppeteer failed after ${elapsedTime}ms: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default fetchRenderedHtml;
