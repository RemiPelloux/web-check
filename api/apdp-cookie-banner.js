import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const COOKIE_BANNER_PATTERNS = {
  // Text patterns (case-insensitive)
  text: [
    /cookies?/i,
    /consent/i,
    /accepter/i,
    /refuser/i,
    /personnalis/i,
    /privacy/i,
    /confidentialité/i,
    /données personnelles/i,
    /rgpd|gdpr/i,
    /gestion.*cookies/i,
    /préférences.*cookies/i,
    /cookie.*polic/i
  ],
  
  // Common cookie policy link patterns
  cookiePolicyLinks: [
    /cookie.*polic/i,
    /politique.*cookie/i,
    /gestion.*cookie/i,
    /\bcookies?\b/i,            // Just "Cookie" or "Cookies"
    /cookie-policy/i,
    /politique-cookies/i,
    /charte.*cookies/i,
    /préférence.*cookies/i
  ],
  
  // Common cookie banner selectors
  selectors: [
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="consent"]',
    '[id*="consent"]',
    '[class*="gdpr"]',
    '[id*="gdpr"]',
    '[class*="privacy"]',
    '[id*="privacy"]',
    '[role="dialog"][aria-label*="cookie" i]',
    '[role="alertdialog"]'
  ],
  
  // Common cookie libraries
  libraries: [
    'cookiebot',
    'onetrust',
    'didomi',
    'axeptio',
    'tarteaucitron',
    'cookie-consent',
    'cookieconsent',
    'osano',
    'iubenda'
  ],
  
  // Specific DOM IDs/Classes for cookie banners
  specificSelectors: [
    '#tarteaucitronAlertBig',
    '#tarteaucitronRoot',
    '[id*="tarteaucitron"]',
    '[class*="tarteaucitron"]',
    '#CybotCookiebotDialog',
    '#onetrust-banner-sdk',
    '[id*="cookiebot"]',
    '[class*="cookiebot"]'
  ]
};

const handler = async (url) => {
  const startTime = Date.now();
  
  try {
    const { data: html } = await fetchHtml(url, { timeout: 5000 });
    const $ = cheerio.load(html, { decodeEntities: false });
    
    const result = {
      url,
      timestamp: new Date().toISOString(),
      hasCookieBanner: false,
      bannerType: null,
      features: {
        hasAcceptButton: false,
        hasRejectButton: false,
        hasCustomizeButton: false,
        hasCookiePolicy: false
      },
      detectedLibrary: null,
      bannerElements: [],
      compliance: {
        level: 'Non conforme',
        issues: [],
        recommendations: []
      }
    };
    
    // Check for cookie management libraries
    const scriptTags = $('script[src]').map((_, el) => $(el).attr('src')).get();
    const scripts = scriptTags.join(' ').toLowerCase();
    
    for (const lib of COOKIE_BANNER_PATTERNS.libraries) {
      if (scripts.includes(lib)) {
        result.detectedLibrary = lib;
        result.hasCookieBanner = true;
        result.bannerType = 'library';
        break;
      }
    }
    
    // Check for specific cookie banner IDs/classes (tarteaucitron, etc.)
    if (!result.hasCookieBanner) {
      for (const selector of COOKIE_BANNER_PATTERNS.specificSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          result.hasCookieBanner = true;
          result.bannerType = 'library';
          result.detectedLibrary = selector.includes('tarteaucitron') ? 'tarteaucitron' : 
                                   selector.includes('cookiebot') ? 'cookiebot' : 
                                   'cookie-library';
          break;
        }
      }
    }
    
    // Check for custom banner elements
    if (!result.hasCookieBanner) {
      for (const selector of COOKIE_BANNER_PATTERNS.selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          elements.each((_, el) => {
            const text = $(el).text().toLowerCase();
            const hasRelevantText = COOKIE_BANNER_PATTERNS.text.some(pattern => pattern.test(text));
            
            if (hasRelevantText) {
              result.hasCookieBanner = true;
              result.bannerType = 'custom';
              result.bannerElements.push({
                selector,
                text: text.substring(0, 150)
              });
            }
          });
          
          if (result.hasCookieBanner) break;
        }
      }
    }
    
    // Analyze banner features
    if (result.hasCookieBanner) {
      const bodyText = $('body').text().toLowerCase();
      const buttons = $('button, a, [role="button"]').map((_, el) => $(el).text().toLowerCase()).get().join(' ');
      
      // Special case: Tarteaucitron ALWAYS provides compliant buttons (injected by JS)
      if (result.detectedLibrary === 'tarteaucitron') {
        result.features.hasAcceptButton = true;  // Tarteaucitron always has "Accepter"
        result.features.hasRejectButton = true;   // Tarteaucitron always has "Refuser"
        result.features.hasCustomizeButton = true; // Tarteaucitron always has "Personnaliser"
        result.features.hasCookiePolicy = true;    // Tarteaucitron always links to policy
      } else {
        // For other libraries, check actual buttons
        result.features.hasAcceptButton = /accept|accepter|j'accepte|d'accord|ok|tout accepter/i.test(buttons);
        result.features.hasRejectButton = /refus|reject|non merci|decline|refuser|deny|interdire/i.test(buttons);
        result.features.hasCustomizeButton = /personnalis|customize|paramètr|préférences|gérer|choisir|configurer/i.test(buttons);
      }
      
      // Check for cookie policy link (unless already set by library detection)
      if (!result.features.hasCookiePolicy) {
        const allLinks = $('a[href]').map((_, el) => {
          const text = $(el).text().toLowerCase();
          const href = $(el).attr('href') || '';
          return `${text} ${href}`;
        }).get().join(' ');
        result.features.hasCookiePolicy = COOKIE_BANNER_PATTERNS.cookiePolicyLinks.some(pattern => pattern.test(allLinks));
      }
    }
    
    // Compliance analysis
    if (!result.hasCookieBanner) {
      result.compliance.level = 'Critique';
      result.compliance.issues.push('Aucune bannière de cookies détectée');
      result.compliance.recommendations.push('Implémenter une solution de gestion des cookies conforme APDP');
    } else {
      let score = 0;
      
      if (result.features.hasAcceptButton) score += 25;
      else result.compliance.issues.push('Bouton "Accepter" manquant');
      
      if (result.features.hasRejectButton) score += 35;
      else result.compliance.issues.push('Bouton "Refuser" manquant ou difficile à trouver');
      
      if (result.features.hasCustomizeButton) score += 25;
      else result.compliance.issues.push('Option de personnalisation manquante');
      
      if (result.features.hasCookiePolicy) score += 15;
      else result.compliance.issues.push('Lien vers politique cookies manquant');
      
      if (score >= 85) {
        result.compliance.level = 'Conforme';
      } else if (score >= 60) {
        result.compliance.level = 'Partiellement conforme';
        result.compliance.recommendations.push('Améliorer les options de refus et personnalisation');
      } else {
        result.compliance.level = 'Non conforme';
        result.compliance.recommendations.push('La bannière doit permettre un refus aussi simple que l\'acceptation');
      }
    }
    
    result.analysisTime = Date.now() - startTime;
    return result;
    
  } catch (error) {
    return {
      url,
      error: error.message,
      hasCookieBanner: false,
      compliance: { level: 'Erreur d\'analyse' }
    };
  }
};

export default middleware(handler);
