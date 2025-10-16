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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = response.data;
    const domain = new URL(url).hostname;

    // Detect if site is a JavaScript SPA
    const isSPA = html.includes('__NEXT_DATA__') || 
            html.includes('React') || 
            html.includes('Vue') || 
            html.includes('ng-app') ||
            /<div[^>]+id=["']root["']/i.test(html) ||
            /<div[^>]+id=["']app["']/i.test(html);

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

    // Add SPA warning if detected
    if (isSPA && results.externalResources.length === 0) {
      results.spaWarning = 'Site détecté comme SPA (Single Page Application). Les ressources externes sont chargées dynamiquement par JavaScript et ne peuvent pas être détectées dans le HTML initial. Utilisez les outils de développement du navigateur pour voir toutes les ressources.';
      results.isSPA = true;
    }

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
    // Images (img src)
    /<img[^>]+src=["']([^"']+)["']/gi,
    // Images (srcset)
    /<img[^>]+srcset=["']([^"']+?)["']/gi,
    // Background images in style attributes
    /style=["'][^"']*background[^"']*url\(['"]?([^'"()]+)['"]?\)/gi,
    // Background images in CSS
    /background[^:]*:\s*url\(['"]?([^'"()]+)['"]?\)/gi,
    // Iframes (for embedded content)
    /<iframe[^>]+src=["']([^"']+)["']/gi,
    // Fonts
    /<link[^>]+href=["']([^"']+\.(woff|woff2|ttf|otf)[^"']*)["']/gi,
    // Videos
    /<video[^>]+src=["']([^"']+)["']/gi,
    /<source[^>]+src=["']([^"']+)["']/gi,
    // Audio
    /<audio[^>]+src=["']([^"']+)["']/gi,
    // Object/embed tags
    /<object[^>]+data=["']([^"']+)["']/gi,
    /<embed[^>]+src=["']([^"']+)["']/gi
  ];

  patterns.forEach((pattern, index) => {
    const resourceTypes = [
      'script',      // 0: JS files
      'stylesheet',  // 1: CSS files
      'image',       // 2: img src
      'image',       // 3: img srcset
      'image',       // 4: background style
      'image',       // 5: background CSS
      'iframe',      // 6: iframes
      'font',        // 7: fonts
      'video',       // 8: video
      'video',       // 9: source
      'audio',       // 10: audio
      'object',      // 11: object
      'object'       // 12: embed
    ];
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
    // Public CDNs
    'cdnjs.cloudflare.com': { name: 'Cloudflare CDNJS', category: 'Public CDN', privacy: 'Medium' },
    'cdn.jsdelivr.net': { name: 'jsDelivr', category: 'Public CDN', privacy: 'Good' },
    'unpkg.com': { name: 'UNPKG', category: 'Public CDN', privacy: 'Medium' },
    'code.jquery.com': { name: 'jQuery CDN', category: 'Library CDN', privacy: 'Good' },
    'stackpath.bootstrapcdn.com': { name: 'Bootstrap CDN', category: 'Library CDN', privacy: 'Medium' },
    
    // Google CDNs
    'fonts.googleapis.com': { name: 'Google Fonts', category: 'Font CDN', privacy: 'Poor' },
    'fonts.gstatic.com': { name: 'Google Fonts Static', category: 'Font CDN', privacy: 'Poor' },
    'ajax.googleapis.com': { name: 'Google Ajax Libraries', category: 'Library CDN', privacy: 'Poor' },
    'www.gstatic.com': { name: 'Google Static', category: 'Library CDN', privacy: 'Poor' },
    
    // Social Media CDNs - Instagram/Facebook
    'scontent': { name: 'Facebook/Instagram CDN', category: 'Social Media', privacy: 'Poor' },
    'cdninstagram.com': { name: 'Instagram CDN', category: 'Social Media', privacy: 'Poor' },
    'fbcdn.net': { name: 'Facebook CDN', category: 'Social Media', privacy: 'Poor' },
    'xx.fbcdn.net': { name: 'Facebook CDN', category: 'Social Media', privacy: 'Poor' },
    
    // Twitter/X
    'pbs.twimg.com': { name: 'Twitter Images CDN', category: 'Social Media', privacy: 'Poor' },
    'abs.twimg.com': { name: 'Twitter CDN', category: 'Social Media', privacy: 'Poor' },
    'video.twimg.com': { name: 'Twitter Video CDN', category: 'Social Media', privacy: 'Poor' },
    
    // LinkedIn
    'media.licdn.com': { name: 'LinkedIn Media CDN', category: 'Social Media', privacy: 'Poor' },
    'static.licdn.com': { name: 'LinkedIn Static CDN', category: 'Social Media', privacy: 'Poor' },
    
    // YouTube
    'i.ytimg.com': { name: 'YouTube Images CDN', category: 'Social Media', privacy: 'Poor' },
    'yt3.ggpht.com': { name: 'YouTube CDN', category: 'Social Media', privacy: 'Poor' },
    
    // TikTok
    'p16-sign': { name: 'TikTok CDN', category: 'Social Media', privacy: 'Poor' },
    'v16-webapp': { name: 'TikTok CDN', category: 'Social Media', privacy: 'Poor' },
    
    // Commercial CDNs
    'fastly.com': { name: 'Fastly', category: 'Commercial CDN', privacy: 'Medium' },
    'amazonaws.com': { name: 'Amazon CloudFront', category: 'Commercial CDN', privacy: 'Medium' },
    'cloudfront.net': { name: 'Amazon CloudFront', category: 'Commercial CDN', privacy: 'Medium' },
    'azure.microsoft.com': { name: 'Azure CDN', category: 'Commercial CDN', privacy: 'Medium' },
    'keycdn.com': { name: 'KeyCDN', category: 'Commercial CDN', privacy: 'Good' },
    'akamaized.net': { name: 'Akamai', category: 'Commercial CDN', privacy: 'Medium' },
    'cloudflare.com': { name: 'Cloudflare', category: 'Commercial CDN', privacy: 'Medium' }
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

