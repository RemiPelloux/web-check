import axios from 'axios';
import middleware from './_common/middleware.js';

const featuresHandler = async (url) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Since we removed the BuiltWith API dependency, 
    // we'll analyze features based on what we can detect from the HTML
    const features = await analyzeWebFeatures(url);
    return features;

  } catch (error) {
    console.error('Features analysis error:', error);
    return {
      error: `Failed to analyze features: ${error.message}`,
      url,
      technologies: [],
      frameworks: [],
      libraries: []
    };
  }
};

async function analyzeWebFeatures(url) {
  const result = {
    url,
    timestamp: new Date().toISOString(),
    technologies: [],
    frameworks: [],
    libraries: [],
    summary: {
      totalDetected: 0,
      categories: {}
    }
  };

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      maxContentLength: 2 * 1024 * 1024, // 2MB limit
      validateStatus: () => true
    });

    if (typeof response.data === 'string') {
      const html = response.data;
      const headers = response.headers;

      // Detect technologies from HTML content
      detectFromHTML(html, result);
      
      // Detect from HTTP headers
      detectFromHeaders(headers, result);

      // Calculate summary
      result.summary.totalDetected = result.technologies.length + 
                                   result.frameworks.length + 
                                   result.libraries.length;
      
      result.summary.categories = {
        technologies: result.technologies.length,
        frameworks: result.frameworks.length,
        libraries: result.libraries.length
      };
    }

  } catch (error) {
    console.error('Failed to fetch page for feature analysis:', error);
  }

  return result;
}

function detectFromHTML(html, result) {
  // JavaScript libraries and frameworks
  const jsPatterns = [
    { name: 'jQuery', pattern: /jquery[.-](\d+\.\d+\.\d+)/i, type: 'library' },
    { name: 'React', pattern: /react[.-](\d+\.\d+\.\d+)|__REACT_DEVTOOLS/i, type: 'framework' },
    { name: 'Vue.js', pattern: /vue[.-](\d+\.\d+\.\d+)|Vue\.version/i, type: 'framework' },
    { name: 'Angular', pattern: /angular[.-](\d+\.\d+\.\d+)|ng-version/i, type: 'framework' },
    { name: 'Bootstrap', pattern: /bootstrap[.-](\d+\.\d+\.\d+)/i, type: 'framework' },
    { name: 'Lodash', pattern: /lodash[.-](\d+\.\d+\.\d+)/i, type: 'library' },
    { name: 'Moment.js', pattern: /moment[.-](\d+\.\d+\.\d+)/i, type: 'library' },
    { name: 'D3.js', pattern: /d3[.-](\d+\.\d+\.\d+)/i, type: 'library' },
    { name: 'Chart.js', pattern: /chart[.-](\d+\.\d+\.\d+)/i, type: 'library' }
  ];

  // CSS frameworks
  const cssPatterns = [
    { name: 'Tailwind CSS', pattern: /tailwindcss|tailwind\.css/i, type: 'framework' },
    { name: 'Bulma', pattern: /bulma[.-](\d+\.\d+\.\d+)|bulma\.css/i, type: 'framework' },
    { name: 'Foundation', pattern: /foundation[.-](\d+\.\d+\.\d+)/i, type: 'framework' }
  ];

  // CMS and platforms
  const cmsPatterns = [
    { name: 'WordPress', pattern: /wp-content|wordpress|wp-includes/i, type: 'technology' },
    { name: 'Drupal', pattern: /drupal|sites\/default/i, type: 'technology' },
    { name: 'Joomla', pattern: /joomla|com_content/i, type: 'technology' },
    { name: 'Shopify', pattern: /shopify|cdn\.shopify/i, type: 'technology' },
    { name: 'Magento', pattern: /magento|mage\/js/i, type: 'technology' }
  ];

  // Analytics and tracking
  const analyticsPatterns = [
    { name: 'Google Analytics', pattern: /google-analytics|gtag|ga\(/i, type: 'technology' },
    { name: 'Google Tag Manager', pattern: /googletagmanager/i, type: 'technology' },
    { name: 'Facebook Pixel', pattern: /facebook\.net\/tr|fbq\(/i, type: 'technology' },
    { name: 'Hotjar', pattern: /hotjar/i, type: 'technology' }
  ];

  const allPatterns = [...jsPatterns, ...cssPatterns, ...cmsPatterns, ...analyticsPatterns];

  allPatterns.forEach(({ name, pattern, type }) => {
    const match = html.match(pattern);
    if (match) {
      const version = match[1] || 'detected';
      const item = { name, version, confidence: 'high' };
      
      if (type === 'library') {
        result.libraries.push(item);
      } else if (type === 'framework') {
        result.frameworks.push(item);
      } else {
        result.technologies.push(item);
      }
    }
  });

  // Detect meta generators
  const generatorMatch = html.match(/<meta[^>]*name\s*=\s*["']generator["'][^>]*content\s*=\s*["']([^"']*)["']/i);
  if (generatorMatch) {
    result.technologies.push({
      name: generatorMatch[1],
      version: 'detected',
      confidence: 'high',
      source: 'meta generator'
    });
  }
}

function detectFromHeaders(headers, result) {
  // Server technologies
  if (headers['server']) {
    const server = headers['server'];
    result.technologies.push({
      name: `Server: ${server}`,
      version: 'detected',
      confidence: 'high',
      source: 'http header'
    });
  }

  // Powered by headers
  if (headers['x-powered-by']) {
    const poweredBy = headers['x-powered-by'];
    result.technologies.push({
      name: poweredBy,
      version: 'detected',
      confidence: 'high',
      source: 'x-powered-by header'
    });
  }

  // CDN detection
  const cdnHeaders = ['cf-ray', 'x-served-by', 'x-cache', 'x-amz-cf-id'];
  cdnHeaders.forEach(header => {
    if (headers[header]) {
      let cdnName = 'CDN';
      if (header === 'cf-ray') cdnName = 'Cloudflare';
      else if (header === 'x-amz-cf-id') cdnName = 'Amazon CloudFront';
      else if (header === 'x-served-by') cdnName = 'Fastly';
      
      result.technologies.push({
        name: cdnName,
        version: 'detected',
        confidence: 'medium',
        source: 'http header'
      });
    }
  });
}

export const handler = middleware(featuresHandler);
export default handler;
