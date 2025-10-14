import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const legalAnalysis = await analyzeLegalPages(url);
    return legalAnalysis;
  } catch (error) {
    console.error('Legal pages analysis error:', error);
    return { 
      error: `Failed to analyze legal pages: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzeLegalPages(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    legalPages: [],
    missingPages: [],
    complianceScore: 0,
    complianceLevel: 'Non-conforme',
    issues: [],
    recommendations: [],
    summary: {
      totalRequired: 0,
      found: 0,
      missing: 0,
      accessible: 0,
      requiresReview: 0
    }
  };

  const domain = new URL(url).origin;

  // Enhanced legal pages detection with more comprehensive paths
  const requiredPages = [
    {
      name: 'Politique de Confidentialité',
      paths: [
        '/politique-de-confidentialite',
        '/confidentialite', 
        '/privacy-policy',
        '/privacy',
        '/politique-confidentialite',
        '/vie-privee',
        '/protection-donnees',
        '/donnees-personnelles',
        '/protection-des-donnees',
        '/donnees-privees',
        '/charte-de-confidentialite'
      ],
      required: true,
      priority: 'critical',
      article: 'RGPD Article 13 et 14 - Information des personnes concernées'
    },
    {
      name: 'Mentions Légales',
      paths: [
        '/mentions-legales',
        '/legal',
        '/mentions',
        '/legal-notice',
        '/about/legal',
        '/informations-legales',
        '/infos-legales',
        '/mention-legale',
        '/legal-information',
        '/avis-legal'
      ],
      required: true,
      priority: 'critical',
      article: 'Loi pour la confiance dans l\'économie numérique - Obligations d\'information'
    },
    {
      name: 'Conditions Générales d\'Utilisation',
      paths: [
        '/conditions-generales-utilisation',
        '/cgu',
        '/c.g.u',
        '/c-g-u',
        '/terms-of-service',
        '/terms',
        '/conditions',
        '/terms-and-conditions',
        '/conditions-utilisation',
        '/conditions-generales',
        '/cgv',
        '/c.g.v',
        '/terms-of-use',
        '/tos'
      ],
      required: true,
      priority: 'high',
      article: 'Droit civil - Contrats et obligations'
    },
    {
      name: 'Politique de Cookies',
      paths: [
        '/politique-cookies',
        '/cookies',
        '/cookie-policy',
        '/politique-de-cookies',
        '/gestion-cookies',
        '/gestion-des-cookies',
        '/charte-cookies',
        '/cookie',
        '/politique-cookie'
      ],
      required: true,
      priority: 'high',
      article: 'RGPD Article 7 - Consentement aux cookies'
    },
    {
      name: 'Contact/Support',
      paths: [
        '/contact',
        '/nous-contacter',
        '/support',
        '/aide',
        '/help',
        '/contactez-nous'
      ],
      required: true,
      priority: 'medium',
      article: 'Article 6 APDP - Droit d\'accès et de rectification'
    },
    {
      name: 'Plan du Site',
      paths: [
        '/sitemap',
        '/plan-du-site',
        '/plan-site',
        '/site-map'
      ],
      required: false,
      priority: 'low',
      article: 'Bonnes pratiques accessibilité'
    }
  ];

  // Get main page to look for legal page links
  let mainPageContent = '';
  try {
    const mainResponse = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; APDP-Scanner/1.0)'
      },
      validateStatus: (status) => status < 500
    });
    mainPageContent = mainResponse.data;
  } catch (error) {
    console.error('Failed to fetch main page:', error);
  }

  // Check each required page
  for (const pageType of requiredPages) {
    const pageResult = await checkLegalPage(domain, pageType, mainPageContent);
    results.legalPages.push(pageResult);
    
    if (pageType.required) {
      results.summary.totalRequired++;
      if (pageResult.found) {
        results.summary.found++;
        if (pageResult.accessible) {
          results.summary.accessible++;
        }
      } else {
        results.summary.missing++;
        results.missingPages.push(pageType.name);
      }
    }
  }

  // Analyze compliance and generate recommendations
  analyzeCompliance(results);
  generateRecommendations(results);

  return results;
}

async function checkLegalPage(domain, pageType, mainPageContent) {
  const result = {
    name: pageType.name,
    required: pageType.required,
    priority: pageType.priority,
    article: pageType.article,
    found: false,
    accessible: false,
    url: null,
    status: null,
    contentLength: 0,
    lastModified: null,
    issues: [],
    foundVia: null // 'direct', 'link', 'footer'
  };

  // Method 1: Try direct URL paths with improved validation
  for (const path of pageType.paths) {
    // Generate path variations (with/without trailing slash, with common extensions)
    const pathVariations = [
      path,
      path + '/',
      path + '.html',
      path + '.php',
      path + '.htm',
      path.endsWith('/') ? path.slice(0, -1) : null
    ].filter(Boolean);

    for (const testPath of pathVariations) {
      try {
        const testUrl = domain + testPath;
        const response = await axios.get(testUrl, { 
          timeout: 8000,
          validateStatus: (status) => status < 500,
          maxContentLength: 100000, // Limit to 100KB for performance
          maxRedirects: 3,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; APDP-Scanner/1.0)',
            'Accept': 'text/html,application/xhtml+xml'
          }
        });
        
        if (response.status === 200) {
          const content = response.data;
          
          // Validate that this is actually a legal page, not a security block
          if (isValidLegalPage(content, pageType.name)) {
            result.found = true;
            result.accessible = true;
            result.url = testUrl;
            result.status = response.status;
            result.foundVia = 'direct';
            result.lastModified = response.headers['last-modified'] || null;
            result.contentLength = content.length;
            
            // Basic content validation
            validatePageContent(content, result, pageType.name);
            
            break; // Found the page, stop checking variations for this path
          } else {
            // This might be a security block page or redirect
            if (!result.issues.some(issue => issue.includes('contenu suspect'))) {
              result.issues.push(`Page trouvée à ${testPath} mais contenu suspect (page de sécurité ou redirection)`);
            }
          }
        }
      } catch (error) {
        // Page not found at this path variation, continue checking
      }
    }
    
    // If found with any variation, stop checking other paths
    if (result.found) break;
  }

  // Method 2: If not found directly, look for links in main page
  if (!result.found && mainPageContent) {
    const pageLinks = findLegalPageLinks(mainPageContent, pageType);
    if (pageLinks.length > 0) {
      // Test the first found link
      for (const linkPath of pageLinks.slice(0, 3)) { // Test up to 3 links
        try {
          const linkUrl = new URL(linkPath, domain).href;
          const response = await axios.get(linkUrl, { 
            timeout: 8000,
            validateStatus: (status) => status < 500,
            maxContentLength: 100000
          });
          
          if (response.status === 200 && isValidLegalPage(response.data, pageType.name)) {
            result.found = true;
            result.accessible = true;
            result.url = linkUrl;
            result.status = response.status;
            result.foundVia = 'link';
            result.lastModified = response.headers['last-modified'] || null;
            result.contentLength = response.data.length;
            
            validatePageContent(response.data, result, pageType.name);
            break;
          }
        } catch (error) {
          // Continue to next link
        }
      }
      
      if (!result.found) {
        result.issues.push('Liens trouvés dans la page principale mais pages non accessibles');
      }
    }
  }

  // Add specific checks based on page type
  if (result.found) {
    addSpecificPageChecks(result, pageType.name);
  } else if (pageType.required) {
    result.issues.push(`Page obligatoire manquante - ${pageType.article}`);
  }

  return result;
}

function isValidLegalPage(content, pageType) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const contentLower = content.toLowerCase();
  
  // Check for security block pages (like Monaco example)
  const securityBlockIndicators = [
    'navigation bloquée',
    'votre navigation sur cette page internet a été bloquée',
    'blocked for security reasons',
    'access denied',
    'securite-web@',
    'support id:',
    'security block',
    'page bloquée'
  ];
  
  if (securityBlockIndicators.some(indicator => contentLower.includes(indicator))) {
    return false;
  }

  // Check for redirect pages
  if (contentLower.includes('<meta http-equiv="refresh"') || 
      contentLower.includes('window.location') ||
      content.length < 100) {
    return false;
  }

  // Basic validation that this looks like a legal page
  const legalPageIndicators = {
    'Politique de Confidentialité': ['données personnelles', 'privacy', 'confidentialité', 'traitement', 'rgpd'],
    'Mentions Légales': ['mentions légales', 'legal notice', 'raison sociale', 'siège social', 'directeur'],
    'Conditions Générales d\'Utilisation': ['conditions', 'utilisation', 'terms', 'service', 'cgu'],
    'Politique de Cookies': ['cookies', 'cookie', 'consentement', 'traceurs'],
    'Contact/Support': ['contact', 'email', 'téléphone', 'adresse', 'nous contacter'],
    'Plan du Site': ['sitemap', 'plan du site', 'navigation']
  };

  const indicators = legalPageIndicators[pageType] || [];
  const hasRelevantContent = indicators.some(indicator => 
    contentLower.includes(indicator.toLowerCase())
  );

  return hasRelevantContent && content.length > 200;
}

function findLegalPageLinks(html, pageType) {
  const links = [];
  const pageName = pageType.name.toLowerCase();
  
  // Create keyword mapping for each legal page type
  const keywordsByType = {
    'Politique de Confidentialité': ['confidentialité', 'privacy', 'données personnelles', 'protection des données', 'vie privée'],
    'Mentions Légales': ['mentions légales', 'legal', 'mentions', 'informations légales', 'legal notice'],
    'Conditions Générales d\'Utilisation': ['cgu', 'c.g.u', 'c-g-u', 'conditions', 'terms', 'cgv', 'utilisation'],
    'Politique de Cookies': ['cookies', 'cookie', 'gestion des cookies'],
    'Contact/Support': ['contact', 'nous contacter', 'contactez-nous', 'support', 'aide'],
    'Plan du Site': ['sitemap', 'plan du site', 'plan']
  };
  
  const keywords = keywordsByType[pageType.name] || [];
  
  // Enhanced regex patterns to find links
  const patterns = [
    // Look for href with relevant keywords in URL
    /<a[^>]+href=["']([^"']*(?:privacy|confidentialite|confidentialité|legal|mentions|cgu|c\.g\.u|c-g-u|cgv|c\.g\.v|cookies|cookie|contact|terms|conditions|donnees|données|protection)[^"']*)["']/gi,
    // Look for links with keywords in the link text
    /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*(?:confidentialité|privacy|mentions|legal|cgu|c\.g\.u|conditions|cookies|cookie|contact|données|protection|terms)[^<]*)<\/a>/gi,
    // Look for footer-specific patterns
    /<footer[^>]*>(.*?)<\/footer>/gi
  ];
  
  // First, try to extract footer content
  let footerContent = '';
  const footerMatch = html.match(/<footer[^>]*>(.*?)<\/footer>/is);
  if (footerMatch) {
    footerContent = footerMatch[1];
  }
  
  // Search in footer first if available
  const searchAreas = footerContent ? [footerContent, html] : [html];
  
  searchAreas.forEach(searchArea => {
    patterns.forEach(pattern => {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      while ((match = pattern.exec(searchArea)) !== null) {
        const href = match[1];
        const linkText = match[2] || '';
        
        if (href && !links.includes(href)) {
          // Filter out obviously non-legal links
          const hrefLower = href.toLowerCase();
          const linkTextLower = linkText.toLowerCase();
          
          if (!hrefLower.includes('javascript:') && 
              !hrefLower.includes('mailto:') && 
              !hrefLower.includes('tel:') &&
              !hrefLower.startsWith('#')) {
            
            // Check if this link matches any of our keywords
            const matchesKeyword = keywords.some(keyword => 
              hrefLower.includes(keyword.toLowerCase()) || 
              linkTextLower.includes(keyword.toLowerCase())
            );
            
            if (matchesKeyword) {
              links.push(href);
            }
          }
        }
      }
    });
  });
  
  return [...new Set(links)]; // Remove duplicates
}

function validatePageContent(content, result, pageType) {
  const contentLower = content.toLowerCase();
  
  // Basic content length validation
  if (content.length < 200) {
    result.issues.push('Contenu très court (moins de 200 caractères)');
  }
  
  // Page-specific validations
  switch (pageType) {
    case 'Politique de Confidentialité':
      validatePrivacyPolicy(contentLower, result);
      break;
    case 'Mentions Légales':
      validateLegalNotice(contentLower, result);
      break;
    case 'Conditions Générales d\'Utilisation':
      validateTermsOfService(contentLower, result);
      break;
    case 'Politique de Cookies':
      validateCookiePolicy(contentLower, result);
      break;
    case 'Contact/Support':
      validateContactPage(contentLower, result);
      break;
  }
}

function validatePrivacyPolicy(content, result) {
  const requiredElements = [
    { term: 'données personnelles|personal data', label: 'Mention des données personnelles' },
    { term: 'finalité|utilisation|purpose', label: 'Finalités du traitement' },
    { term: 'droit|droits|rights', label: 'Droits des personnes' },
    { term: 'contact|responsable|controller', label: 'Contact du responsable' },
    { term: 'durée|conservation|retention', label: 'Durée de conservation' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Élément manquant: ${element.label}`);
    }
  });
  
  // Check for GDPR/APDP specific mentions
  if (!content.includes('rgpd') && !content.includes('gdpr') && !content.includes('apdp')) {
    result.issues.push('Aucune référence à la réglementation (RGPD/APDP) trouvée');
  }
}

function validateLegalNotice(content, result) {
  const requiredElements = [
    { term: 'raison sociale|dénomination|company name', label: 'Raison sociale' },
    { term: 'adresse|siège|address', label: 'Adresse' },
    { term: 'téléphone|contact|phone', label: 'Coordonnées' },
    { term: 'directeur|responsable|director', label: 'Directeur de publication' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Information manquante: ${element.label}`);
    }
  });
}

function validateTermsOfService(content, result) {
  const requiredElements = [
    { term: 'conditions|utilisation|terms', label: 'Conditions d\'utilisation' },
    { term: 'responsabilité|liability', label: 'Limitation de responsabilité' },
    { term: 'propriété|intellectuelle|intellectual', label: 'Propriété intellectuelle' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Clause manquante: ${element.label}`);
    }
  });
}

function validateCookiePolicy(content, result) {
  const requiredElements = [
    { term: 'cookies', label: 'Explication des cookies' },
    { term: 'consentement|accepter|consent', label: 'Gestion du consentement' },
    { term: 'désactiver|refuser|disable', label: 'Options de refus' },
    { term: 'finalité|utilisation|purpose', label: 'Finalités des cookies' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Information manquante: ${element.label}`);
    }
  });
}

function validateContactPage(content, result) {
  const requiredElements = [
    { term: 'email|@|courriel', label: 'Adresse email' },
    { term: 'téléphone|tel|phone', label: 'Numéro de téléphone' },
    { term: 'adresse|rue|avenue|address', label: 'Adresse postale' }
  ];
  
  let contactMethods = 0;
  requiredElements.forEach(element => {
    if (new RegExp(element.term, 'i').test(content)) {
      contactMethods++;
    }
  });
  
  if (contactMethods === 0) {
    result.issues.push('Aucun moyen de contact identifié');
  } else if (contactMethods === 1) {
    result.issues.push('Un seul moyen de contact trouvé (recommandé: multiple)');
  }
}

function addSpecificPageChecks(result, pageType) {
  // Add last modified date check
  if (!result.lastModified) {
    result.issues.push('Date de dernière modification non disponible');
  } else {
    const lastMod = new Date(result.lastModified);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (lastMod < sixMonthsAgo) {
      result.issues.push('Page non mise à jour depuis plus de 6 mois');
    }
  }
  
  // Check content length appropriateness
  const minLengths = {
    'Politique de Confidentialité': 1000,
    'Mentions Légales': 500,
    'Conditions Générales d\'Utilisation': 800,
    'Politique de Cookies': 600
  };
  
  if (minLengths[pageType] && result.contentLength < minLengths[pageType]) {
    result.issues.push(`Contenu possiblement incomplet (${result.contentLength} caractères)`);
  }
}

function analyzeCompliance(results) {
  const totalRequired = results.summary.totalRequired;
  const found = results.summary.found;
  const accessible = results.summary.accessible;
  
  // Calculate compliance score
  let score = 0;
  
  // Base score for found pages
  score += (found / totalRequired) * 60;
  
  // Bonus for accessible pages
  score += (accessible / totalRequired) * 30;
  
  // Penalty for pages with issues
  const totalIssues = results.legalPages.reduce((sum, page) => sum + page.issues.length, 0);
  score -= Math.min(20, totalIssues * 2);
  
  results.complianceScore = Math.max(0, Math.round(score));
  
  // Determine compliance level
  if (results.complianceScore >= 90) {
    results.complianceLevel = 'Excellent';
  } else if (results.complianceScore >= 75) {
    results.complianceLevel = 'Conforme';
  } else if (results.complianceScore >= 60) {
    results.complianceLevel = 'Partiellement conforme';
  } else if (results.complianceScore >= 40) {
    results.complianceLevel = 'Non-conforme';
  } else {
    results.complianceLevel = 'Critique';
  }
}

function generateRecommendations(results) {
  const recommendations = [];
  
  // Critical recommendations for missing required pages
  if (results.missingPages.length > 0) {
    recommendations.push({
      priority: 'Immédiate (0-7 jours)',
      title: 'Pages légales manquantes',
      description: `${results.missingPages.length} page(s) légale(s) obligatoire(s) manquante(s)`,
      actions: results.missingPages.map(page => `Créer et publier: ${page}`)
    });
  }
  
  // High priority for inaccessible pages
  const inaccessiblePages = results.legalPages.filter(p => p.found && !p.accessible);
  if (inaccessiblePages.length > 0) {
    recommendations.push({
      priority: 'Rapide (7-30 jours)',
      title: 'Pages inaccessibles',
      description: `${inaccessiblePages.length} page(s) trouvée(s) mais non accessible(s)`,
      actions: inaccessiblePages.map(page => `Corriger l'accessibilité: ${page.name}`)
    });
  }
  
  // Medium priority for content issues
  const pagesWithIssues = results.legalPages.filter(p => p.issues.length > 0);
  if (pagesWithIssues.length > 0) {
    recommendations.push({
      priority: 'Planifiée (1-3 mois)',
      title: 'Amélioration du contenu',
      description: `${pagesWithIssues.length} page(s) avec des problèmes de contenu`,
      actions: [
        'Réviser et compléter le contenu des pages légales',
        'Ajouter les informations manquantes identifiées',
        'Mettre à jour les dates de modification'
      ]
    });
  }
  
  // General recommendations
  recommendations.push({
    priority: 'Continue',
    title: 'Maintenance des pages légales',
    description: 'Maintenir la conformité légale à long terme',
    actions: [
      'Réviser les pages légales tous les 6 mois',
      'Vérifier la conformité après chaque modification du site',
      'Former les équipes aux obligations légales APDP',
      'Mettre en place un processus de validation juridique'
    ]
  });
  
  results.recommendations = recommendations;
}

export default middleware(handler);