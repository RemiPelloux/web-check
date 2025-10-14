import axios from 'axios';
import middleware from './_common/middleware.js';

const qualityHandler = async (url) => {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Since we removed the Google PageSpeed API dependency, 
    // we'll provide a basic quality analysis based on what we can detect
    const qualityData = await analyzeBasicQuality(url);
    return qualityData;

  } catch (error) {
    console.error('Quality analysis error:', error);
    return {
      error: `Failed to analyze quality: ${error.message}`,
      url,
      score: 0,
      metrics: {},
      suggestions: ['Unable to perform quality analysis']
    };
  }
};

async function analyzeBasicQuality(url) {
  const result = {
    url,
    timestamp: new Date().toISOString(),
    score: 0,
    metrics: {},
    suggestions: [],
    categories: {
      performance: { score: 0, issues: [] },
      accessibility: { score: 0, issues: [] },
      bestPractices: { score: 0, issues: [] },
      seo: { score: 0, issues: [] }
    }
  };

  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 15000,
      maxContentLength: 5 * 1024 * 1024,
      validateStatus: () => true
    });
    const loadTime = Date.now() - startTime;

    if (typeof response.data === 'string') {
      const html = response.data;
      const headers = response.headers;

      // Performance analysis
      analyzePerformance(html, headers, loadTime, result.categories.performance);
      
      // Basic accessibility check
      analyzeAccessibility(html, result.categories.accessibility);
      
      // Best practices
      analyzeBestPractices(html, headers, url, result.categories.bestPractices);
      
      // SEO basics
      analyzeSEO(html, result.categories.seo);

      // Calculate overall score
      const scores = Object.values(result.categories).map(cat => cat.score);
      result.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // Generate suggestions
      result.suggestions = generateSuggestions(result.categories);
    }

  } catch (error) {
    result.suggestions.push('Unable to fetch page for analysis');
  }

  return result;
}

function analyzePerformance(html, headers, loadTime, category) {
  let score = 100;
  
  // Load time check
  if (loadTime > 3000) {
    category.issues.push('Page load time exceeds 3 seconds');
    score -= 20;
  } else if (loadTime > 1000) {
    category.issues.push('Page load time could be improved');
    score -= 10;
  }

  // Compression check
  if (!headers['content-encoding']) {
    category.issues.push('Content compression not enabled');
    score -= 15;
  }

  // Resource count
  const scripts = (html.match(/<script[^>]*src=/gi) || []).length;
  const stylesheets = (html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length;
  
  if (scripts > 10) {
    category.issues.push('Too many JavaScript files');
    score -= 10;
  }
  
  if (stylesheets > 5) {
    category.issues.push('Too many CSS files');
    score -= 10;
  }

  category.score = Math.max(0, score);
}

function analyzeAccessibility(html, category) {
  let score = 100;
  
  // Images without alt text
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter(img => !img.match(/alt\s*=/i));
  
  if (imagesWithoutAlt.length > 0) {
    category.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    score -= 20;
  }

  // Missing page title
  if (!html.match(/<title[^>]*>([^<]+)<\/title>/i)) {
    category.issues.push('Page title missing');
    score -= 25;
  }

  // Missing lang attribute
  if (!html.match(/<html[^>]*lang\s*=/i)) {
    category.issues.push('HTML lang attribute missing');
    score -= 15;
  }

  category.score = Math.max(0, score);
}

function analyzeBestPractices(html, headers, url, category) {
  let score = 100;

  // HTTPS check
  if (!url.startsWith('https://')) {
    category.issues.push('Site not using HTTPS');
    score -= 30;
  }

  // Security headers
  if (!headers['x-content-type-options']) {
    category.issues.push('Missing X-Content-Type-Options header');
    score -= 10;
  }

  if (!headers['x-frame-options']) {
    category.issues.push('Missing X-Frame-Options header');
    score -= 10;
  }

  // Deprecated features
  if (html.includes('document.write')) {
    category.issues.push('Uses deprecated document.write');
    score -= 15;
  }

  category.score = Math.max(0, score);
}

function analyzeSEO(html, category) {
  let score = 100;

  // Meta description
  if (!html.match(/<meta[^>]*name\s*=\s*["']description["']/i)) {
    category.issues.push('Meta description missing');
    score -= 20;
  }

  // H1 tag
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0) {
    category.issues.push('No H1 tag found');
    score -= 25;
  } else if (h1Count > 1) {
    category.issues.push('Multiple H1 tags found');
    score -= 10;
  }

  // Viewport meta tag
  if (!html.match(/<meta[^>]*name\s*=\s*["']viewport["']/i)) {
    category.issues.push('Viewport meta tag missing');
    score -= 15;
  }

  category.score = Math.max(0, score);
}

function generateSuggestions(categories) {
  const suggestions = [];
  
  Object.entries(categories).forEach(([categoryName, data]) => {
    if (data.issues.length > 0) {
      suggestions.push(`${categoryName}: ${data.issues.join(', ')}`);
    }
  });

  if (suggestions.length === 0) {
    suggestions.push('No major issues detected');
  }

  return suggestions;
}

export const handler = middleware(qualityHandler);
export default handler;

