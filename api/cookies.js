import axios from 'axios';
import puppeteer from 'puppeteer';
import middleware from './_common/middleware.js';

// Enhanced cookie analysis functions
const analyzeCookieSecurity = (cookie) => {
  const security = {
    httpOnly: false,
    secure: false,
    sameSite: 'none',
    hasExpiry: false,
    isSession: true,
    domain: null,
    path: '/',
    securityScore: 0,
    warnings: []
  };

  if (cookie.attributes) {
    // Check HttpOnly flag
    security.httpOnly = cookie.attributes.hasOwnProperty('HttpOnly') || cookie.attributes.hasOwnProperty('httponly');
    
    // Check Secure flag
    security.secure = cookie.attributes.hasOwnProperty('Secure') || cookie.attributes.hasOwnProperty('secure');
    
    // Check SameSite attribute
    const sameSiteValue = cookie.attributes['SameSite'] || cookie.attributes['samesite'];
    if (sameSiteValue) {
      security.sameSite = sameSiteValue.toLowerCase();
    }
    
    // Check expiry
    security.hasExpiry = cookie.attributes.hasOwnProperty('Expires') || cookie.attributes.hasOwnProperty('Max-Age');
    security.isSession = !security.hasExpiry;
    
    // Get domain and path
    security.domain = cookie.attributes['Domain'] || cookie.attributes['domain'];
    security.path = cookie.attributes['Path'] || cookie.attributes['path'] || '/';
  }

  // For client-side cookies (from Puppeteer)
  if (cookie.httpOnly !== undefined) {
    security.httpOnly = cookie.httpOnly;
  }
  if (cookie.secure !== undefined) {
    security.secure = cookie.secure;
  }
  if (cookie.sameSite !== undefined) {
    security.sameSite = cookie.sameSite.toLowerCase();
  }
  if (cookie.session !== undefined) {
    security.isSession = cookie.session;
    security.hasExpiry = !cookie.session;
  }
  if (cookie.domain !== undefined) {
    security.domain = cookie.domain;
  }
  if (cookie.path !== undefined) {
    security.path = cookie.path;
  }

  // Calculate security score and warnings
  if (security.httpOnly) security.securityScore += 2;
  else security.warnings.push('Missing HttpOnly flag - vulnerable to XSS attacks');
  
  if (security.secure) security.securityScore += 2;
  else security.warnings.push('Missing Secure flag - can be transmitted over HTTP');
  
  if (security.sameSite !== 'none') security.securityScore += 1;
  else security.warnings.push('SameSite=None - vulnerable to CSRF attacks');
  
  if (security.hasExpiry) security.securityScore += 1;

  return security;
};

const categorizeCookie = (name, value, security) => {
  const nameUpper = name.toUpperCase();
  const categories = [];
  
  // Session management cookies
  if (nameUpper.includes('SESSION') || nameUpper.includes('SESS') || 
      nameUpper.includes('JSESSIONID') || nameUpper.includes('PHPSESSID') ||
      nameUpper.includes('ASPSESSIONID') || nameUpper.includes('SID')) {
    categories.push('session');
  }
  
  // Authentication cookies
  if (nameUpper.includes('AUTH') || nameUpper.includes('TOKEN') || 
      nameUpper.includes('LOGIN') || nameUpper.includes('USER') ||
      nameUpper.includes('JWT') || nameUpper.includes('BEARER')) {
    categories.push('authentication');
  }
  
  // Tracking cookies
  if (nameUpper.includes('_GA') || nameUpper.includes('_GTM') || 
      nameUpper.includes('_FB') || nameUpper.includes('_PIXEL') ||
      nameUpper.includes('TRACK') || nameUpper.includes('ANALYTICS')) {
    categories.push('tracking');
  }
  
  // Functional cookies
  if (nameUpper.includes('LANG') || nameUpper.includes('THEME') || 
      nameUpper.includes('PREF') || nameUpper.includes('SETTINGS') ||
      nameUpper.includes('CART') || nameUpper.includes('WISHLIST')) {
    categories.push('functional');
  }
  
  // Advertising cookies
  if (nameUpper.includes('AD') || nameUpper.includes('DOUBLECLICK') || 
      nameUpper.includes('ADSYSTEM') || nameUpper.includes('MARKETING')) {
    categories.push('advertising');
  }
  
  // Security cookies
  if (nameUpper.includes('CSRF') || nameUpper.includes('XSRF') || 
      nameUpper.includes('NONCE') || nameUpper.includes('ANTI')) {
    categories.push('security');
  }
  
  // Performance cookies
  if (nameUpper.includes('PERF') || nameUpper.includes('SPEED') || 
      nameUpper.includes('CDN') || nameUpper.includes('CACHE')) {
    categories.push('performance');
  }

  // Default category
  if (categories.length === 0) {
    categories.push('other');
  }

  return categories;
};

const getPuppeteerCookies = async (url) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Enable request interception to capture more cookie details
    await page.setRequestInterception(true);
    const cookieRequests = [];
    
    page.on('request', (request) => {
      const cookies = request.headers()['cookie'];
      if (cookies) {
        cookieRequests.push(cookies);
      }
      request.continue();
    });
    
    const navigationPromise = page.goto(url, { waitUntil: 'networkidle2' });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Puppeteer took too long!')), 5000)
    );
    
    await Promise.race([navigationPromise, timeoutPromise]);
    
    // Get cookies from the page
    const cookies = await page.cookies();
    
    // Also try to get cookies from JavaScript
    const jsCookies = await page.evaluate(() => {
      const cookies = [];
      if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
          const [name, ...valueParts] = cookie.trim().split('=');
          if (name && valueParts.length > 0) {
            cookies.push({
              name: name.trim(),
              value: valueParts.join('=').trim(),
              source: 'javascript'
            });
          }
        });
      }
      return cookies;
    });
    
    return { cookies, jsCookies, requestCookies: cookieRequests };
  } finally {
    await browser.close();
  }
};

const parseHeaderCookies = (setCookieHeaders) => {
  if (!setCookieHeaders || !Array.isArray(setCookieHeaders)) return [];
  
  return setCookieHeaders.map((cookieHeader, index) => {
    const parts = cookieHeader.split(';').map(part => part.trim());
    const [nameValuePair] = parts;
    const [name, ...valueParts] = nameValuePair.split('=');
    const value = valueParts.join('=');
    
    const attributes = {};
    parts.slice(1).forEach(part => {
      const [attrName, attrValue] = part.split('=');
      attributes[attrName.trim()] = attrValue ? attrValue.trim() : '';
    });
    
    return {
      name: name.trim(),
      value: value.trim(),
      attributes,
      source: 'header',
      index
    };
  });
};

const cookieHandler = async (url) => {
  let headerCookies = [];
  let clientCookies = [];
  let cookieAnalysis = {
    totalCount: 0,
    categories: {},
    securityIssues: [],
    recommendations: []
  };

  // Get cookies from HTTP headers
  try {
    const response = await axios.get(url, {
      withCredentials: true,
      maxRedirects: 5,
      timeout: 10000,
    });
    
    if (response.headers['set-cookie']) {
      headerCookies = parseHeaderCookies(response.headers['set-cookie']);
    }
  } catch (error) {
    if (error.response) {
      return { error: `Request failed with status ${error.response.status}: ${error.message}` };
    } else if (error.request) {
      return { error: `No response received: ${error.message}` };
    } else {
      return { error: `Error setting up request: ${error.message}` };
    }
  }

  // Get cookies from browser
  try {
    const puppeteerResult = await getPuppeteerCookies(url);
    clientCookies = puppeteerResult.cookies || [];
    
    // Merge JavaScript cookies if they're different
    if (puppeteerResult.jsCookies) {
      puppeteerResult.jsCookies.forEach(jsCookie => {
        if (!clientCookies.find(c => c.name === jsCookie.name)) {
          clientCookies.push({
            ...jsCookie,
            httpOnly: false, // JS accessible cookies are not httpOnly
            secure: false, // We can't determine this from JS
            session: true // We can't determine expiry from JS
          });
        }
      });
    }
  } catch (error) {
    // Browser cookies are optional, continue without them
    clientCookies = [];
  }

  // Analyze all cookies
  const allCookies = [...headerCookies, ...clientCookies];
  
  if (allCookies.length === 0) {
    return { skipped: 'No cookies found' };
  }

  // Perform comprehensive analysis
  allCookies.forEach(cookie => {
    const security = analyzeCookieSecurity(cookie);
    const categories = categorizeCookie(cookie.name, cookie.value, security);
    
    cookie.security = security;
    cookie.categories = categories;
    
    // Update analysis
    cookieAnalysis.totalCount++;
    
    categories.forEach(category => {
      if (!cookieAnalysis.categories[category]) {
        cookieAnalysis.categories[category] = 0;
      }
      cookieAnalysis.categories[category]++;
    });
    
    // Collect security issues
    security.warnings.forEach(warning => {
      const issue = `${cookie.name}: ${warning}`;
      if (!cookieAnalysis.securityIssues.includes(issue)) {
        cookieAnalysis.securityIssues.push(issue);
      }
    });
  });

  // Generate recommendations
  if (cookieAnalysis.securityIssues.length > 0) {
    cookieAnalysis.recommendations.push('Review and fix security issues with cookie attributes');
  }
  if (cookieAnalysis.categories.tracking) {
    cookieAnalysis.recommendations.push('Consider implementing cookie consent for tracking cookies');
  }
  if (cookieAnalysis.categories.advertising) {
    cookieAnalysis.recommendations.push('Ensure compliance with privacy regulations for advertising cookies');
  }

  return { 
    headerCookies, 
    clientCookies, 
    analysis: cookieAnalysis,
    summary: {
      total: cookieAnalysis.totalCount,
      bySource: {
        header: headerCookies.length,
        client: clientCookies.length
      },
      byCategory: cookieAnalysis.categories,
      securityScore: Math.round(
        allCookies.reduce((sum, cookie) => sum + (cookie.security?.securityScore || 0), 0) / 
        Math.max(allCookies.length, 1)
      )
    }
  };
};

export const handler = middleware(cookieHandler);
export default handler;
