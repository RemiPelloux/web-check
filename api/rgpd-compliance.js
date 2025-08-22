import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    // Validate URL format
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }
    
    try {
      new URL(url);
    } catch {
      return { error: 'Invalid URL format provided', statusCode: 400 };
    }

    // Comprehensive APDP compliance evaluation
    const complianceResults = await evaluateAPDPCompliance(url);
    return complianceResults;
  } catch (error) {
    console.error('APDP Compliance Analysis Error:', error);
    return { 
      error: `Failed to evaluate APDP compliance: ${error.message}`,
      statusCode: error.response?.status || 500,
      timestamp: new Date().toISOString(),
      url: url || 'unknown'
    };
  }
};

async function evaluateAPDPCompliance(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    overallScore: 'A',
    complianceLevel: 'Excellent',
    criticalIssues: [],
    warnings: [],
    improvements: [],
    compliantItems: [],
    detailedAnalysis: {},
    recommendations: [],
    legalBasis: [],
    dataProcessing: {},
    userRights: {},
    securityMeasures: {}
  };

  // Analyze different compliance aspects
  await Promise.all([
    analyzeCookies(url, results),
    analyzePrivacyPolicy(url, results),
    analyzeSecurityHeaders(url, results),
    analyzeSSLCertificate(url, results),
    analyzeDataCollection(url, results),
    analyzeUserConsent(url, results),
    analyzeDataRetention(url, results),
    analyzeThirdPartyServices(url, results)
  ]);

  // Calculate overall compliance score
  calculateComplianceScore(results);
  
  // Generate specific recommendations
  generateRecommendations(results);

  return results;
}

async function analyzeCookies(url, results) {
  try {
    const response = await axios.get(`http://localhost:3001/api/cookies?url=${encodeURIComponent(url)}`);
    const cookieData = response.data;
    
    if (cookieData && cookieData.cookies) {
      const cookies = cookieData.cookies;
      let cookieIssues = 0;
      
      cookies.forEach(cookie => {
        // Check for essential cookie attributes
        if (!cookie.secure && url.startsWith('https://')) {
          results.criticalIssues.push({
            type: 'cookie_security',
            severity: 'critical',
            title: `Cookie non sécurisé: ${cookie.name}`,
            description: `Le cookie "${cookie.name}" n'a pas l'attribut Secure sur un site HTTPS.`,
            recommendation: 'Ajouter l\'attribut Secure à tous les cookies sur les sites HTTPS.',
            article: 'Article 32 APDP - Sécurité du traitement'
          });
          cookieIssues++;
        }
        
        if (!cookie.httpOnly && (cookie.name.toLowerCase().includes('session') || cookie.name.toLowerCase().includes('auth'))) {
          results.criticalIssues.push({
            type: 'cookie_xss',
            severity: 'critical',
            title: `Cookie d'authentification vulnérable: ${cookie.name}`,
            description: `Le cookie d'authentification "${cookie.name}" n'a pas l'attribut HttpOnly.`,
            recommendation: 'Ajouter l\'attribut HttpOnly aux cookies d\'authentification pour prévenir les attaques XSS.',
            article: 'Article 32 APDP - Sécurité du traitement'
          });
          cookieIssues++;
        }
        
        if (!cookie.sameSite || cookie.sameSite.toLowerCase() === 'none') {
          results.warnings.push({
            type: 'cookie_csrf',
            severity: 'warning',
            title: `Cookie sans protection CSRF: ${cookie.name}`,
            description: `Le cookie "${cookie.name}" n'a pas d'attribut SameSite approprié.`,
            recommendation: 'Configurer l\'attribut SameSite=Strict ou SameSite=Lax selon les besoins.',
            article: 'Article 32 APDP - Sécurité du traitement'
          });
        }
      });
      
      // Check for tracking cookies
      const trackingCookies = cookies.filter(cookie => 
        cookie.name.includes('_ga') || 
        cookie.name.includes('_fb') ||
        cookie.name.includes('_utm') ||
        cookie.domain !== new URL(url).hostname
      );
      
      if (trackingCookies.length > 0) {
        results.warnings.push({
          type: 'tracking_cookies',
          severity: 'warning',
          title: `${trackingCookies.length} cookie(s) de tracking détecté(s)`,
          description: `Cookies de tracking tiers détectés: ${trackingCookies.map(c => c.name).join(', ')}`,
          recommendation: 'Implémenter un système de gestion du consentement avant le dépôt de cookies non essentiels.',
          article: 'Article 6 et 7 APDP - Licéité et consentement'
        });
      }
      
      results.detailedAnalysis.cookies = {
        total: cookies.length,
        secure: cookies.filter(c => c.secure).length,
        httpOnly: cookies.filter(c => c.httpOnly).length,
        sameSite: cookies.filter(c => c.sameSite).length,
        tracking: trackingCookies.length,
        issues: cookieIssues
      };
    }
  } catch (error) {
    console.error('Cookie analysis failed:', error);
  }
}

async function analyzePrivacyPolicy(url, results) {
  try {
    // Check for common privacy policy URLs
    const privacyUrls = [
      '/privacy', '/privacy-policy', '/politique-de-confidentialite',
      '/confidentialite', '/mentions-legales', '/legal'
    ];
    
    let privacyPolicyFound = false;
    
    for (const privacyUrl of privacyUrls) {
      try {
        const testUrl = new URL(privacyUrl, url).toString();
        const response = await axios.head(testUrl, { timeout: 5000 });
        if (response.status === 200) {
          privacyPolicyFound = true;
          results.compliantItems.push({
            type: 'privacy_policy',
            title: 'Politique de confidentialité accessible',
            description: `Politique de confidentialité trouvée à: ${testUrl}`,
            article: 'Article 13 et 14 APDP - Information des personnes concernées'
          });
          break;
        }
      } catch (e) {
        // Continue checking other URLs
      }
    }
    
    if (!privacyPolicyFound) {
      results.criticalIssues.push({
        type: 'missing_privacy_policy',
        severity: 'critical',
        title: 'Politique de confidentialité non trouvée',
        description: 'Aucune politique de confidentialité accessible n\'a été détectée.',
        recommendation: 'Créer et publier une politique de confidentialité détaillée et facilement accessible.',
        article: 'Article 13 et 14 APDP - Information des personnes concernées'
      });
    }
  } catch (error) {
    console.error('Privacy policy analysis failed:', error);
  }
}

async function analyzeSecurityHeaders(url, results) {
  try {
    const response = await axios.get(`http://localhost:3001/api/headers?url=${encodeURIComponent(url)}`);
    const headerData = response.data;
    
    if (headerData && headerData.headers) {
      const headers = headerData.headers;
      
      // Check for security headers
      const securityHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy'
      ];
      
      const missingHeaders = securityHeaders.filter(header => !headers[header]);
      
      missingHeaders.forEach(header => {
        results.warnings.push({
          type: 'missing_security_header',
          severity: 'warning',
          title: `En-tête de sécurité manquant: ${header}`,
          description: `L'en-tête de sécurité ${header} n'est pas configuré.`,
          recommendation: `Configurer l'en-tête ${header} pour améliorer la sécurité.`,
          article: 'Article 32 APDP - Sécurité du traitement'
        });
      });
      
      // Check for proper CSP
      if (headers['content-security-policy']) {
        const csp = headers['content-security-policy'];
        if (csp.includes('unsafe-inline') || csp.includes('unsafe-eval')) {
          results.warnings.push({
            type: 'weak_csp',
            severity: 'warning',
            title: 'Politique CSP permissive',
            description: 'La Content Security Policy autorise des pratiques non sécurisées.',
            recommendation: 'Renforcer la CSP en supprimant unsafe-inline et unsafe-eval.',
            article: 'Article 32 APDP - Sécurité du traitement'
          });
        } else {
          results.compliantItems.push({
            type: 'strong_csp',
            title: 'Content Security Policy robuste',
            description: 'Une CSP restrictive est configurée correctement.',
            article: 'Article 32 APDP - Sécurité du traitement'
          });
        }
      }
      
      results.detailedAnalysis.securityHeaders = {
        total: securityHeaders.length,
        present: securityHeaders.length - missingHeaders.length,
        missing: missingHeaders
      };
    }
  } catch (error) {
    console.error('Security headers analysis failed:', error);
  }
}

async function analyzeSSLCertificate(url, results) {
  try {
    const response = await axios.get(`http://localhost:3001/api/ssl?url=${encodeURIComponent(url)}`);
    const sslData = response.data;
    
    if (sslData && !sslData.error) {
      if (sslData.validCertificate) {
        results.compliantItems.push({
          type: 'valid_ssl',
          title: 'Certificat SSL valide',
          description: `Certificat SSL valide émis par ${sslData.issuer || 'autorité reconnue'}`,
          article: 'Article 32 APDP - Sécurité du traitement'
        });
      } else {
        results.criticalIssues.push({
          type: 'invalid_ssl',
          severity: 'critical',
          title: 'Certificat SSL invalide ou expiré',
          description: 'Le certificat SSL n\'est pas valide ou a expiré.',
          recommendation: 'Renouveler ou corriger le certificat SSL immédiatement.',
          article: 'Article 32 APDP - Sécurité du traitement'
        });
      }
      
      // Check certificate strength
      if (sslData.algorithm && sslData.algorithm.includes('SHA-1')) {
        results.warnings.push({
          type: 'weak_ssl_algorithm',
          severity: 'warning',
          title: 'Algorithme SSL obsolète',
          description: 'Le certificat utilise un algorithme de hachage obsolète (SHA-1).',
          recommendation: 'Migrer vers un certificat utilisant SHA-256 ou supérieur.',
          article: 'Article 32 APDP - Sécurité du traitement'
        });
      }
    } else {
      results.criticalIssues.push({
        type: 'no_ssl',
        severity: 'critical',
        title: 'Pas de chiffrement SSL/TLS',
        description: 'Le site n\'utilise pas de chiffrement SSL/TLS.',
        recommendation: 'Implémenter HTTPS avec un certificat SSL valide.',
        article: 'Article 32 APDP - Sécurité du traitement'
      });
    }
  } catch (error) {
    console.error('SSL analysis failed:', error);
  }
}

async function analyzeDataCollection(url, results) {
  // Analyze potential data collection through forms, scripts, etc.
  try {
    const response = await axios.get(`http://localhost:3001/api/tech-stack?url=${encodeURIComponent(url)}`);
    const techData = response.data;
    
    if (techData && techData.technologies) {
      const analyticsTools = techData.technologies.filter(tech => 
        tech.name.toLowerCase().includes('analytics') ||
        tech.name.toLowerCase().includes('tracking') ||
        tech.name.toLowerCase().includes('tag manager')
      );
      
      if (analyticsTools.length > 0) {
        results.warnings.push({
          type: 'analytics_tracking',
          severity: 'warning',
          title: `${analyticsTools.length} outil(s) d'analyse détecté(s)`,
          description: `Outils d'analyse détectés: ${analyticsTools.map(t => t.name).join(', ')}`,
          recommendation: 'Vérifier que le consentement est obtenu avant l\'activation des outils d\'analyse.',
          article: 'Article 6 APDP - Licéité du traitement'
        });
      }
      
      results.detailedAnalysis.dataCollection = {
        analyticsTools: analyticsTools.length,
        tools: analyticsTools.map(t => t.name)
      };
    }
  } catch (error) {
    console.error('Data collection analysis failed:', error);
  }
}

async function analyzeUserConsent(url, results) {
  // This would typically involve checking for consent management platforms
  // For now, we'll provide general guidance
  results.improvements.push({
    type: 'consent_management',
    severity: 'improvement',
    title: 'Système de gestion du consentement',
    description: 'Vérification manuelle requise pour le système de gestion du consentement.',
    recommendation: 'Implémenter un système de gestion du consentement conforme (CMP) pour tous les cookies non essentiels.',
    article: 'Article 7 APDP - Conditions applicables au consentement'
  });
}

async function analyzeDataRetention(url, results) {
  results.improvements.push({
    type: 'data_retention',
    severity: 'improvement',
    title: 'Politique de conservation des données',
    description: 'Vérification manuelle requise pour les politiques de conservation.',
    recommendation: 'Définir et documenter des durées de conservation appropriées pour toutes les catégories de données.',
    article: 'Article 5(1)(e) APDP - Limitation de la conservation'
  });
}

async function analyzeThirdPartyServices(url, results) {
  try {
    const response = await axios.get(`http://localhost:3001/api/linked-pages?url=${encodeURIComponent(url)}`);
    const linkData = response.data;
    
    if (linkData && linkData.externalLinks) {
      const thirdPartyDomains = [...new Set(linkData.externalLinks
        .map(link => {
          try {
            return new URL(link).hostname;
          } catch {
            return null;
          }
        })
        .filter(domain => domain && domain !== new URL(url).hostname)
      )];
      
      if (thirdPartyDomains.length > 0) {
        results.improvements.push({
          type: 'third_party_services',
          severity: 'improvement',
          title: `${thirdPartyDomains.length} service(s) tiers détecté(s)`,
          description: `Services tiers: ${thirdPartyDomains.slice(0, 5).join(', ')}${thirdPartyDomains.length > 5 ? '...' : ''}`,
          recommendation: 'Vérifier les accords de traitement des données avec tous les services tiers.',
          article: 'Article 28 APDP - Sous-traitant'
        });
      }
      
      results.detailedAnalysis.thirdPartyServices = {
        count: thirdPartyDomains.length,
        domains: thirdPartyDomains
      };
    }
  } catch (error) {
    console.error('Third party services analysis failed:', error);
  }
}

function calculateComplianceScore(results) {
  const criticalWeight = 15;  // Increased weight for critical issues
  const warningWeight = 8;    // Increased weight for warnings
  const improvementWeight = 3; // Slightly increased weight
  const compliantWeight = 2;   // Increased reward for compliant items
  
  const totalIssues = 
    (results.criticalIssues.length * criticalWeight) +
    (results.warnings.length * warningWeight) +
    (results.improvements.length * improvementWeight);
  
  const totalCompliant = results.compliantItems.length * compliantWeight;
  
  // Enhanced scoring algorithm
  const baseScore = 100;
  const maxPenalty = 85; // Maximum penalty possible
  const maxBonus = 25;   // Maximum bonus possible
  
  // Apply penalties with diminishing returns
  const penaltyScore = Math.min(
    totalIssues * 1.5 + (totalIssues > 10 ? (totalIssues - 10) * 0.5 : 0), 
    maxPenalty
  );
  
  // Apply bonuses with scaling
  const bonusScore = Math.min(
    totalCompliant * 2.5 + (totalCompliant > 5 ? (totalCompliant - 5) * 1.5 : 0), 
    maxBonus
  );
  
  const rawScore = Math.max(0, baseScore - penaltyScore + bonusScore);
  
  // Enhanced grading scale
  if (rawScore >= 95) {
    results.overallScore = 'A+';
    results.complianceLevel = 'Exemplaire';
  } else if (rawScore >= 90) {
    results.overallScore = 'A';
    results.complianceLevel = 'Excellent';
  } else if (rawScore >= 85) {
    results.overallScore = 'A-';
    results.complianceLevel = 'Très excellent';
  } else if (rawScore >= 80) {
    results.overallScore = 'B+';
    results.complianceLevel = 'Très bien';
  } else if (rawScore >= 75) {
    results.overallScore = 'B';
    results.complianceLevel = 'Bien';
  } else if (rawScore >= 70) {
    results.overallScore = 'B-';
    results.complianceLevel = 'Assez bien';
  } else if (rawScore >= 65) {
    results.overallScore = 'C+';
    results.complianceLevel = 'Correct';
  } else if (rawScore >= 60) {
    results.overallScore = 'C';
    results.complianceLevel = 'Passable';
  } else if (rawScore >= 55) {
    results.overallScore = 'C-';
    results.complianceLevel = 'À améliorer';
  } else if (rawScore >= 50) {
    results.overallScore = 'D';
    results.complianceLevel = 'Insuffisant';
  } else if (rawScore >= 40) {
    results.overallScore = 'E';
    results.complianceLevel = 'Problématique';
  } else {
    results.overallScore = 'F';
    results.complianceLevel = 'Critique';
  }
  
  results.numericScore = Math.round(rawScore);
  results.scoreBreakdown = {
    baseScore,
    penalties: Math.round(penaltyScore),
    bonuses: Math.round(bonusScore),
    criticalIssues: results.criticalIssues.length,
    warnings: results.warnings.length,
    improvements: results.improvements.length,
    compliantItems: results.compliantItems.length
  };
}

function generateRecommendations(results) {
  const recommendations = [];
  
  // Priority recommendations based on issues found
  if (results.criticalIssues.length > 0) {
    recommendations.push({
      priority: 'Immédiate (0-7 jours)',
      title: 'Traitement des vulnérabilités critiques',
      description: `${results.criticalIssues.length} problème(s) critique(s) nécessitent une action immédiate.`,
      actions: results.criticalIssues.slice(0, 3).map(issue => issue.recommendation)
    });
  }
  
  if (results.warnings.length > 0) {
    recommendations.push({
      priority: 'Rapide (7-30 jours)',
      title: 'Correction des problèmes de sécurité',
      description: `${results.warnings.length} avertissement(s) à traiter rapidement.`,
      actions: results.warnings.slice(0, 3).map(issue => issue.recommendation)
    });
  }
  
  if (results.improvements.length > 0) {
    recommendations.push({
      priority: 'Planifiée (1-3 mois)',
      title: 'Améliorations recommandées',
      description: `${results.improvements.length} amélioration(s) pour optimiser la conformité.`,
      actions: results.improvements.slice(0, 3).map(issue => issue.recommendation)
    });
  }
  
  // General APDP recommendations
  recommendations.push({
    priority: 'Continue',
    title: 'Bonnes pratiques APDP',
    description: 'Maintenir et améliorer la conformité APDP.',
    actions: [
      'Effectuer des audits réguliers de conformité',
      'Former le personnel aux exigences APDP',
      'Maintenir un registre des traitements à jour',
      'Établir des procédures pour les droits des personnes',
      'Réviser régulièrement les politiques de confidentialité'
    ]
  });
  
  results.recommendations = recommendations;
}

export default middleware(handler);
