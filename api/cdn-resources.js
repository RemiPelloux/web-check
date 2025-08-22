import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const cdnAnalysis = await analyzeCDNResources(url);
    return cdnAnalysis;
  } catch (error) {
    console.error('CDN analysis error:', error);
    return { 
      error: `Failed to analyze CDN resources: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzeCDNResources(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    cdnProviders: [],
    externalResources: [],
    securityIssues: [],
    performanceIssues: [],
    privacyIssues: [],
    totalResources: 0,
    totalSize: 0,
    summary: {
      cdnCount: 0,
      externalDomains: 0,
      insecureResources: 0,
      trackingResources: 0,
      performanceScore: 100
    }
  };

  try {
    // Get the page content
    const response = await axios.get(url, { 
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; APDP-Scanner/1.0)'
      }
    });

    const html = response.data;
    const domain = new URL(url).hostname;

    // Extract all external resources
    await extractExternalResources(html, domain, results);
    
    // Analyze CDN providers
    analyzeCDNProviders(results);
    
    // Check for security issues
    checkSecurityIssues(results, url);
    
    // Check for privacy issues
    checkPrivacyIssues(results);
    
    // Calculate performance impact
    calculatePerformanceScore(results);

  } catch (error) {
    console.error('CDN analysis failed:', error);
    results.error = error.message;
  }

  return results;
}

async function extractExternalResources(html, domain, results) {
  const resources = [];
  
  // Extract different types of resources
  const patterns = [
    // JavaScript files
    /<script[^>]+src=["']([^"']+)["']/gi,
    // CSS files
    /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi,
    // Images
    /<img[^>]+src=["']([^"']+)["']/gi,
    // Fonts
    /<link[^>]+href=["']([^"']+\.(woff|woff2|ttf|otf)[^"']*)["']/gi,
    // Videos
    /<video[^>]+src=["']([^"']+)["']/gi,
    // Audio
    /<audio[^>]+src=["']([^"']+)["']/gi
  ];

  patterns.forEach((pattern, index) => {
    const resourceTypes = ['script', 'stylesheet', 'image', 'font', 'video', 'audio'];
    let match;
    
    while ((match = pattern.exec(html)) !== null) {
      const resourceUrl = match[1];
      
      try {
        const fullUrl = new URL(resourceUrl, `https://${domain}`);
        
        if (fullUrl.hostname !== domain) {
          resources.push({
            url: fullUrl.href,
            domain: fullUrl.hostname,
            type: resourceTypes[index] || 'other',
            protocol: fullUrl.protocol,
            isSecure: fullUrl.protocol === 'https:',
            isCDN: false, // Will be determined later
            provider: null
          });
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }
  });

  // Remove duplicates
  const uniqueResources = resources.filter((resource, index, self) => 
    index === self.findIndex(r => r.url === resource.url)
  );

  results.externalResources = uniqueResources;
  results.totalResources = uniqueResources.length;
}

function analyzeCDNProviders(results) {
  const cdnProviders = {
    'cdnjs.cloudflare.com': { name: 'Cloudflare CDNJS', category: 'Public CDN', privacy: 'Medium' },
    'cdn.jsdelivr.net': { name: 'jsDelivr', category: 'Public CDN', privacy: 'Good' },
    'unpkg.com': { name: 'UNPKG', category: 'Public CDN', privacy: 'Medium' },
    'code.jquery.com': { name: 'jQuery CDN', category: 'Library CDN', privacy: 'Good' },
    'stackpath.bootstrapcdn.com': { name: 'Bootstrap CDN', category: 'Library CDN', privacy: 'Medium' },
    'fonts.googleapis.com': { name: 'Google Fonts', category: 'Font CDN', privacy: 'Poor' },
    'fonts.gstatic.com': { name: 'Google Fonts Static', category: 'Font CDN', privacy: 'Poor' },
    'ajax.googleapis.com': { name: 'Google Ajax Libraries', category: 'Library CDN', privacy: 'Poor' },
    'cdn.jsdelivr.net': { name: 'jsDelivr CDN', category: 'Public CDN', privacy: 'Good' },
    'fastly.com': { name: 'Fastly', category: 'Commercial CDN', privacy: 'Medium' },
    'amazonaws.com': { name: 'Amazon CloudFront', category: 'Commercial CDN', privacy: 'Medium' },
    'cloudfront.net': { name: 'Amazon CloudFront', category: 'Commercial CDN', privacy: 'Medium' },
    'azure.microsoft.com': { name: 'Azure CDN', category: 'Commercial CDN', privacy: 'Medium' },
    'keycdn.com': { name: 'KeyCDN', category: 'Commercial CDN', privacy: 'Good' }
  };

  const detectedCDNs = new Set();

  results.externalResources.forEach(resource => {
    const domain = resource.domain.toLowerCase();
    
    // Check for exact matches
    if (cdnProviders[domain]) {
      resource.isCDN = true;
      resource.provider = cdnProviders[domain];
      detectedCDNs.add(domain);
    } else {
      // Check for partial matches
      Object.keys(cdnProviders).forEach(cdnDomain => {
        if (domain.includes(cdnDomain) || cdnDomain.includes(domain)) {
          resource.isCDN = true;
          resource.provider = cdnProviders[cdnDomain];
          detectedCDNs.add(cdnDomain);
        }
      });
    }
  });

  results.cdnProviders = Array.from(detectedCDNs).map(domain => ({
    domain,
    ...cdnProviders[domain],
    resourceCount: results.externalResources.filter(r => 
      r.domain === domain || r.domain.includes(domain)
    ).length
  }));

  results.summary.cdnCount = results.cdnProviders.length;
  results.summary.externalDomains = new Set(results.externalResources.map(r => r.domain)).size;
}

function checkSecurityIssues(results, originalUrl) {
  const securityIssues = [];
  const isHttps = originalUrl.startsWith('https://');

  results.externalResources.forEach(resource => {
    // Check for mixed content
    if (isHttps && resource.protocol === 'http:') {
      securityIssues.push({
        type: 'mixed_content',
        severity: resource.type === 'script' || resource.type === 'stylesheet' ? 'high' : 'medium',
        resource: resource.url,
        title: 'Mixed Content Warning',
        description: `Loading ${resource.type} over HTTP on HTTPS site`,
        recommendation: 'Use HTTPS URLs for all external resources',
        impact: 'Content may be blocked by browsers, security warnings'
      });
      results.summary.insecureResources++;
    }

    // Check for potentially vulnerable resources
    if (resource.url.includes('jquery') && resource.url.match(/jquery[/-]([12]\.|3\.[0-4])/)) {
      securityIssues.push({
        type: 'vulnerable_library',
        severity: 'medium',
        resource: resource.url,
        title: 'Potentially Vulnerable jQuery Version',
        description: 'jQuery version may have known vulnerabilities',
        recommendation: 'Update to jQuery 3.5.0 or later',
        impact: 'XSS vulnerabilities possible'
      });
    }

    // Check for integrity attributes on critical resources
    if ((resource.type === 'script' || resource.type === 'stylesheet') && resource.isCDN) {
      // Note: We can't check for integrity from just the URL, but we can recommend it
      securityIssues.push({
        type: 'missing_sri',
        severity: 'low',
        resource: resource.url,
        title: 'Subresource Integrity Recommended',
        description: 'CDN resource should use SRI for security',
        recommendation: 'Add integrity attribute to prevent tampering',
        impact: 'CDN compromise could inject malicious code'
      });
    }
  });

  results.securityIssues = securityIssues;
}

function checkPrivacyIssues(results) {
  const privacyIssues = [];
  const trackingDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com',
    'connect.facebook.net',
    'doubleclick.net',
    'googlesyndication.com',
    'adsystem.amazon.com',
    'amazon-adsystem.com',
    'scorecardresearch.com',
    'quantserve.com',
    'hotjar.com',
    'crazyegg.com',
    'mouseflow.com',
    'fullstory.com'
  ];

  results.externalResources.forEach(resource => {
    const domain = resource.domain.toLowerCase();
    
    // Check for tracking domains
    trackingDomains.forEach(trackingDomain => {
      if (domain.includes(trackingDomain)) {
        privacyIssues.push({
          type: 'tracking_resource',
          severity: 'medium',
          resource: resource.url,
          domain: resource.domain,
          title: `Tracking Resource: ${resource.provider?.name || resource.domain}`,
          description: 'Resource from known tracking/analytics provider',
          recommendation: 'Ensure proper consent management for tracking',
          impact: 'User data may be collected without explicit consent',
          article: 'Article 6 et 7 APDP - Licéité et consentement'
        });
        results.summary.trackingResources++;
      }
    });

    // Check for Google Fonts (privacy concern)
    if (domain.includes('fonts.googleapis.com') || domain.includes('fonts.gstatic.com')) {
      privacyIssues.push({
        type: 'google_fonts_privacy',
        severity: 'low',
        resource: resource.url,
        title: 'Google Fonts Privacy Concern',
        description: 'Google Fonts may transmit user IP addresses to Google',
        recommendation: 'Consider self-hosting fonts or using privacy-friendly alternatives',
        impact: 'User IP addresses shared with Google',
        article: 'Article 6 APDP - Licéité du traitement'
      });
    }

    // Check for poor privacy rating CDNs
    if (resource.provider && resource.provider.privacy === 'Poor') {
      privacyIssues.push({
        type: 'privacy_concern_cdn',
        severity: 'low',
        resource: resource.url,
        title: `Privacy Concern: ${resource.provider.name}`,
        description: 'CDN provider may collect user data',
        recommendation: 'Review privacy policy of CDN provider',
        impact: 'Potential user data collection by third party',
        article: 'Article 28 APDP - Sous-traitant'
      });
    }
  });

  results.privacyIssues = privacyIssues;
}

function calculatePerformanceScore(results) {
  let score = 100;
  
  // Penalize for too many external resources
  if (results.totalResources > 20) {
    score -= Math.min(30, (results.totalResources - 20) * 2);
  }
  
  // Penalize for too many external domains (DNS lookups)
  if (results.summary.externalDomains > 10) {
    score -= Math.min(20, (results.summary.externalDomains - 10) * 3);
  }
  
  // Penalize for insecure resources
  score -= results.summary.insecureResources * 5;
  
  // Bonus for using CDNs (performance benefit)
  if (results.summary.cdnCount > 0) {
    score += Math.min(10, results.summary.cdnCount * 2);
  }
  
  results.summary.performanceScore = Math.max(0, Math.min(100, score));
  
  // Add performance recommendations
  results.performanceIssues = [];
  
  if (results.totalResources > 15) {
    results.performanceIssues.push({
      type: 'too_many_resources',
      severity: 'medium',
      title: `${results.totalResources} External Resources Detected`,
      description: 'High number of external resources may slow page loading',
      recommendation: 'Consider bundling resources or using fewer external dependencies',
      impact: 'Slower page load times and more DNS lookups'
    });
  }
  
  if (results.summary.externalDomains > 8) {
    results.performanceIssues.push({
      type: 'too_many_domains',
      severity: 'medium',
      title: `${results.summary.externalDomains} External Domains`,
      description: 'Multiple external domains increase DNS lookup time',
      recommendation: 'Reduce number of external domains or use DNS prefetching',
      impact: 'Additional DNS resolution delays'
    });
  }
  
  if (results.summary.insecureResources > 0) {
    results.performanceIssues.push({
      type: 'mixed_content_performance',
      severity: 'low',
      title: 'Mixed Content May Cause Delays',
      description: 'Browsers may block or warn about insecure resources',
      recommendation: 'Use HTTPS for all external resources',
      impact: 'Resource loading may be blocked or delayed'
    });
  }
}

export default middleware(handler);
