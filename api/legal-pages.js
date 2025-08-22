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

  // Define required legal pages for APDP Monaco compliance
  const requiredPages = [
    {
      name: 'Politique de Confidentialité',
      paths: [
        '/politique-de-confidentialite',
        '/confidentialite', 
        '/privacy-policy',
        '/privacy',
        '/politique-confidentialite',
        '/vie-privee'
      ],
      required: true,
      priority: 'critical',
      article: 'Article 13 et 14 APDP - Information des personnes concernées'
    },
    {
      name: 'Mentions Légales',
      paths: [
        '/mentions-legales',
        '/legal',
        '/mentions',
        '/legal-notice',
        '/about/legal'
      ],
      required: true,
      priority: 'critical',
      article: 'Loi n° 1.165 du 23 décembre 1993 - Commerce électronique'
    },
    {
      name: 'Conditions Générales d\'Utilisation',
      paths: [
        '/conditions-generales-utilisation',
        '/cgu',
        '/terms-of-service',
        '/terms',
        '/conditions',
        '/terms-and-conditions'
      ],
      required: true,
      priority: 'high',
      article: 'Code Civil Monégasque - Obligations contractuelles'
    },
    {
      name: 'Politique de Cookies',
      paths: [
        '/politique-cookies',
        '/cookies',
        '/cookie-policy',
        '/politique-de-cookies'
      ],
      required: true,
      priority: 'high',
      article: 'Article 82 Loi n° 1.165 - Cookies et traceurs'
    },
    {
      name: 'Contact/Support',
      paths: [
        '/contact',
        '/nous-contacter',
        '/support',
        '/aide',
        '/help'
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
        '/plan-site'
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
      }
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

  // Method 1: Try direct URL paths
  for (const path of pageType.paths) {
    try {
      const testUrl = domain + path;
      const response = await axios.head(testUrl, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        result.found = true;
        result.accessible = true;
        result.url = testUrl;
        result.status = response.status;
        result.foundVia = 'direct';
        result.lastModified = response.headers['last-modified'] || null;
        
        // Get content length for basic validation
        try {
          const contentResponse = await axios.get(testUrl, { 
            timeout: 8000,
            maxContentLength: 50000 // Limit to 50KB for performance
          });
          result.contentLength = contentResponse.data.length;
          
          // Basic content validation
          validatePageContent(contentResponse.data, result, pageType.name);
        } catch (error) {
          result.issues.push('Failed to fetch page content for validation');
        }
        
        break; // Found the page, stop checking other paths
      }
    } catch (error) {
      // Page not found at this path, continue checking
    }
  }

  // Method 2: If not found directly, look for links in main page
  if (!result.found && mainPageContent) {
    const pageLinks = findLegalPageLinks(mainPageContent, pageType);
    if (pageLinks.length > 0) {
      // Test the first found link
      try {
        const linkUrl = new URL(pageLinks[0], domain).href;
        const response = await axios.head(linkUrl, { 
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        
        if (response.status === 200) {
          result.found = true;
          result.accessible = true;
          result.url = linkUrl;
          result.status = response.status;
          result.foundVia = 'link';
          result.lastModified = response.headers['last-modified'] || null;
        }
      } catch (error) {
        result.found = true;
        result.accessible = false;
        result.url = pageLinks[0];
        result.issues.push('Page found in links but not accessible');
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

function findLegalPageLinks(html, pageType) {
  const links = [];
  const pageName = pageType.name.toLowerCase();
  
  // Create regex patterns to find links
  const patterns = [
    // Look for href attributes with relevant text
    new RegExp(`<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*(?:${pageName.replace(/\s+/g, '|')})[^<]*)</a>`, 'gi'),
    // Look for common legal page patterns
    /<a[^>]+href=["']([^"']*(?:privacy|confidentialite|legal|mentions|cgu|cookies|contact)[^"']*)["']/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1] && !links.includes(match[1])) {
        links.push(match[1]);
      }
    }
  });
  
  return links;
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
    { term: 'données personnelles', label: 'Mention des données personnelles' },
    { term: 'finalité|utilisation', label: 'Finalités du traitement' },
    { term: 'droit|droits', label: 'Droits des personnes' },
    { term: 'contact|responsable', label: 'Contact du responsable' },
    { term: 'durée|conservation', label: 'Durée de conservation' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Élément manquant: ${element.label}`);
    }
  });
  
  // Check for APDP specific mentions
  if (!content.includes('apdp') && !content.includes('monaco')) {
    result.issues.push('Aucune référence à l\'APDP Monaco trouvée');
  }
}

function validateLegalNotice(content, result) {
  const requiredElements = [
    { term: 'raison sociale|dénomination', label: 'Raison sociale' },
    { term: 'adresse|siège', label: 'Adresse' },
    { term: 'téléphone|contact', label: 'Coordonnées' },
    { term: 'directeur|responsable', label: 'Directeur de publication' }
  ];
  
  requiredElements.forEach(element => {
    if (!new RegExp(element.term, 'i').test(content)) {
      result.issues.push(`Information manquante: ${element.label}`);
    }
  });
}

function validateTermsOfService(content, result) {
  const requiredElements = [
    { term: 'conditions|utilisation', label: 'Conditions d\'utilisation' },
    { term: 'responsabilité', label: 'Limitation de responsabilité' },
    { term: 'propriété|intellectuelle', label: 'Propriété intellectuelle' }
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
    { term: 'consentement|accepter', label: 'Gestion du consentement' },
    { term: 'désactiver|refuser', label: 'Options de refus' },
    { term: 'finalité|utilisation', label: 'Finalités des cookies' }
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
    { term: 'adresse|rue|avenue', label: 'Adresse postale' }
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
