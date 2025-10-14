import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const seoData = await analyzeSEO(url);
    return seoData;
  } catch (error) {
    console.error('SEO analysis error:', error);
    return { 
      error: `Failed to analyze SEO: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzeSEO(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    score: 0,
    grade: 'F',
    issues: [],
    passed: [],
    categories: {
      meta: { score: 0, issues: [], passed: [] },
      content: { score: 0, issues: [], passed: [] },
      technical: { score: 0, issues: [], passed: [] },
      social: { score: 0, issues: [], passed: [] },
      performance: { score: 0, issues: [], passed: [] }
    },
    recommendations: []
  };

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      maxContentLength: 5 * 1024 * 1024,
      validateStatus: () => true
    });

    if (typeof response.data === 'string') {
      const html = response.data;
      const headers = response.headers;
      
      // Run SEO checks
      await Promise.all([
        checkMetaTags(html, results),
        checkContent(html, results),
        checkTechnicalSEO(html, url, headers, results),
        checkSocialMedia(html, results),
        checkPerformanceSEO(html, headers, results)
      ]);

      // Calculate overall score
      calculateSEOScore(results);
      generateSEORecommendations(results);
    }

  } catch (error) {
    console.error('Failed to fetch page for SEO analysis:', error);
    results.issues.push({
      type: 'fetch_error',
      severity: 'critical',
      title: 'Impossible d\'analyser la page',
      description: 'La page n\'a pas pu être chargée pour l\'analyse SEO',
      category: 'technical'
    });
  }

  return results;
}

function checkMetaTags(html, results) {
  const category = results.categories.meta;
  
  // Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    if (title.length > 0) {
      if (title.length >= 30 && title.length <= 60) {
        category.passed.push({
          type: 'title_optimal',
          title: 'Titre optimisé',
          description: `Longueur: ${title.length} caractères`,
          value: title
        });
      } else {
        category.issues.push({
          type: 'title_length',
          severity: title.length === 0 ? 'critical' : 'moderate',
          title: 'Longueur du titre non optimale',
          description: `${title.length} caractères (recommandé: 30-60)`,
          recommendation: 'Ajuster la longueur du titre entre 30 et 60 caractères',
          value: title
        });
      }
    } else {
      category.issues.push({
        type: 'title_empty',
        severity: 'critical',
        title: 'Titre vide',
        description: 'La balise title est présente mais vide',
        recommendation: 'Ajouter un titre descriptif et optimisé'
      });
    }
  } else {
    category.issues.push({
      type: 'title_missing',
      severity: 'critical',
      title: 'Titre manquant',
      description: 'Aucune balise title trouvée',
      recommendation: 'Ajouter une balise title descriptive'
    });
  }

  // Meta description
  const descMatch = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i);
  if (descMatch) {
    const description = descMatch[1].trim();
    if (description.length > 0) {
      if (description.length >= 120 && description.length <= 160) {
        category.passed.push({
          type: 'description_optimal',
          title: 'Meta description optimisée',
          description: `Longueur: ${description.length} caractères`,
          value: description
        });
      } else {
        category.issues.push({
          type: 'description_length',
          severity: 'moderate',
          title: 'Longueur de la meta description non optimale',
          description: `${description.length} caractères (recommandé: 120-160)`,
          recommendation: 'Ajuster la longueur de la meta description',
          value: description
        });
      }
    } else {
      category.issues.push({
        type: 'description_empty',
        severity: 'high',
        title: 'Meta description vide',
        description: 'La meta description est présente mais vide',
        recommendation: 'Ajouter une meta description attrayante'
      });
    }
  } else {
    category.issues.push({
      type: 'description_missing',
      severity: 'high',
      title: 'Meta description manquante',
      description: 'Aucune meta description trouvée',
      recommendation: 'Ajouter une meta description de 120-160 caractères'
    });
  }

  // Meta keywords (should not be used)
  const keywordsMatch = html.match(/<meta[^>]*name\s*=\s*["']keywords["']/i);
  if (keywordsMatch) {
    category.issues.push({
      type: 'meta_keywords_present',
      severity: 'minor',
      title: 'Meta keywords présente',
      description: 'La balise meta keywords est obsolète',
      recommendation: 'Supprimer la balise meta keywords'
    });
  } else {
    category.passed.push({
      type: 'no_meta_keywords',
      title: 'Pas de meta keywords obsolète',
      description: 'Bonne pratique: meta keywords non utilisée'
    });
  }

  // Viewport meta tag
  const viewportMatch = html.match(/<meta[^>]*name\s*=\s*["']viewport["']/i);
  if (viewportMatch) {
    category.passed.push({
      type: 'viewport_present',
      title: 'Meta viewport présente',
      description: 'Optimisation mobile configurée'
    });
  } else {
    category.issues.push({
      type: 'viewport_missing',
      severity: 'high',
      title: 'Meta viewport manquante',
      description: 'Essentielle pour l\'optimisation mobile',
      recommendation: 'Ajouter <meta name="viewport" content="width=device-width, initial-scale=1">'
    });
  }

  // Calculate category score
  const totalChecks = 4; // title, description, keywords, viewport
  const issues = category.issues.length;
  category.score = Math.max(0, Math.round(((totalChecks - issues) / totalChecks) * 100));
}

function checkContent(html, results) {
  const category = results.categories.content;
  
  // Heading structure
  const headings = [];
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([^<]+)</h${i}>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      headings.push({ level: i, text: match[1].trim() });
    }
  }

  if (headings.length > 0) {
    if (headings.filter(h => h.level === 1).length === 1) {
      category.passed.push({
        type: 'h1_unique',
        title: 'H1 unique présent',
        description: 'Un seul H1 trouvé (bonne pratique)'
      });
    } else if (headings.filter(h => h.level === 1).length === 0) {
      category.issues.push({
        type: 'h1_missing',
        severity: 'high',
        title: 'H1 manquant',
        description: 'Aucun titre H1 trouvé',
        recommendation: 'Ajouter un titre H1 unique et descriptif'
      });
    } else {
      category.issues.push({
        type: 'multiple_h1',
        severity: 'moderate',
        title: 'Plusieurs H1 détectés',
        description: `${headings.filter(h => h.level === 1).length} titres H1 trouvés`,
        recommendation: 'Utiliser un seul H1 par page'
      });
    }

    // Check heading hierarchy
    let hierarchyIssues = 0;
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level - headings[i-1].level > 1) {
        hierarchyIssues++;
      }
    }

    if (hierarchyIssues === 0) {
      category.passed.push({
        type: 'heading_hierarchy',
        title: 'Hiérarchie des titres respectée',
        description: 'Structure logique des titres H1-H6'
      });
    } else {
      category.issues.push({
        type: 'heading_hierarchy_issues',
        severity: 'moderate',
        title: 'Problèmes de hiérarchie des titres',
        description: `${hierarchyIssues} saut(s) de niveau détecté(s)`,
        recommendation: 'Respecter l\'ordre séquentiel des titres'
      });
    }
  } else {
    category.issues.push({
      type: 'no_headings',
      severity: 'critical',
      title: 'Aucun titre trouvé',
      description: 'Aucune balise H1-H6 détectée',
      recommendation: 'Structurer le contenu avec des titres hiérarchiques'
    });
  }

  // Images alt text
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter(img => !img.match(/alt\s*=/i));
  
  if (images.length > 0) {
    if (imagesWithoutAlt.length === 0) {
      category.passed.push({
        type: 'images_alt_complete',
        title: 'Toutes les images ont un alt',
        description: `${images.length} image(s) avec attribut alt`
      });
    } else {
      category.issues.push({
        type: 'images_missing_alt',
        severity: 'moderate',
        title: 'Images sans attribut alt',
        description: `${imagesWithoutAlt.length}/${images.length} image(s) sans alt`,
        recommendation: 'Ajouter des attributs alt descriptifs à toutes les images'
      });
    }
  }

  // Internal links
  const internalLinks = html.match(/<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>/gi) || [];
  const externalLinks = internalLinks.filter(link => 
    link.match(/href\s*=\s*["']https?:\/\/[^"']*["']/i) && 
    !link.includes(new URL(results.url).hostname)
  );

  if (internalLinks.length > 0) {
    category.passed.push({
      type: 'internal_links_present',
      title: 'Liens internes présents',
      description: `${internalLinks.length - externalLinks.length} lien(s) interne(s)`
    });
  } else {
    category.issues.push({
      type: 'no_internal_links',
      severity: 'moderate',
      title: 'Aucun lien interne',
      description: 'Les liens internes améliorent le maillage',
      recommendation: 'Ajouter des liens vers d\'autres pages du site'
    });
  }

  category.score = Math.max(0, 100 - (category.issues.length * 20));
}

function checkTechnicalSEO(html, url, headers, results) {
  const category = results.categories.technical;
  
  // HTTPS
  if (url.startsWith('https://')) {
    category.passed.push({
      type: 'https_enabled',
      title: 'HTTPS activé',
      description: 'Site sécurisé avec SSL/TLS'
    });
  } else {
    category.issues.push({
      type: 'no_https',
      severity: 'high',
      title: 'HTTPS non activé',
      description: 'Le site n\'utilise pas HTTPS',
      recommendation: 'Migrer vers HTTPS pour la sécurité et le SEO'
    });
  }

  // Canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i);
  if (canonicalMatch) {
    category.passed.push({
      type: 'canonical_present',
      title: 'URL canonique présente',
      description: `Canonical: ${canonicalMatch[1]}`
    });
  } else {
    category.issues.push({
      type: 'canonical_missing',
      severity: 'moderate',
      title: 'URL canonique manquante',
      description: 'Aide à éviter le contenu dupliqué',
      recommendation: 'Ajouter une balise link rel="canonical"'
    });
  }

  // Robots meta tag
  const robotsMatch = html.match(/<meta[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["']([^"']*)["']/i);
  if (robotsMatch) {
    const robotsContent = robotsMatch[1].toLowerCase();
    if (robotsContent.includes('noindex') || robotsContent.includes('nofollow')) {
      category.issues.push({
        type: 'robots_restrictive',
        severity: 'high',
        title: 'Robots meta restrictif',
        description: `Robots: ${robotsContent}`,
        recommendation: 'Vérifier si les restrictions robots sont intentionnelles'
      });
    } else {
      category.passed.push({
        type: 'robots_permissive',
        title: 'Robots meta permissif',
        description: `Robots: ${robotsContent}`
      });
    }
  }

  // Language declaration
  const langMatch = html.match(/<html[^>]*lang\s*=\s*["']([^"']*)["']/i);
  if (langMatch) {
    category.passed.push({
      type: 'lang_declared',
      title: 'Langue déclarée',
      description: `Lang: ${langMatch[1]}`
    });
  } else {
    category.issues.push({
      type: 'lang_missing',
      severity: 'moderate',
      title: 'Langue non déclarée',
      description: 'Attribut lang manquant sur html',
      recommendation: 'Ajouter lang="fr" (ou autre) à la balise html'
    });
  }

  // Structured data (basic check)
  const jsonLdMatch = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i);
  const microdataMatch = html.match(/itemscope|itemtype|itemprop/i);
  
  if (jsonLdMatch || microdataMatch) {
    category.passed.push({
      type: 'structured_data_present',
      title: 'Données structurées détectées',
      description: jsonLdMatch ? 'JSON-LD trouvé' : 'Microdata trouvé'
    });
  } else {
    category.issues.push({
      type: 'structured_data_missing',
      severity: 'moderate',
      title: 'Données structurées manquantes',
      description: 'Aucune donnée structurée détectée',
      recommendation: 'Ajouter des données structurées (JSON-LD recommandé)'
    });
  }

  // XML Sitemap (check robots.txt reference)
  // This would require additional API call, so we'll skip for now

  category.score = Math.max(0, 100 - (category.issues.length * 15));
}

function checkSocialMedia(html, results) {
  const category = results.categories.social;
  
  // Open Graph tags
  const ogTags = {
    title: html.match(/<meta[^>]*property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']*)["']/i),
    description: html.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']*)["']/i),
    image: html.match(/<meta[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']*)["']/i),
    url: html.match(/<meta[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']*)["']/i)
  };

  let ogCount = 0;
  Object.entries(ogTags).forEach(([tag, match]) => {
    if (match) {
      ogCount++;
      category.passed.push({
        type: `og_${tag}_present`,
        title: `Open Graph ${tag} présent`,
        description: `og:${tag}: ${match[1]}`
      });
    }
  });

  if (ogCount === 0) {
    category.issues.push({
      type: 'og_missing',
      severity: 'moderate',
      title: 'Open Graph manquant',
      description: 'Aucune balise Open Graph trouvée',
      recommendation: 'Ajouter les balises og:title, og:description, og:image, og:url'
    });
  } else if (ogCount < 4) {
    category.issues.push({
      type: 'og_incomplete',
      severity: 'minor',
      title: 'Open Graph incomplet',
      description: `${ogCount}/4 balises Open Graph trouvées`,
      recommendation: 'Compléter avec toutes les balises Open Graph essentielles'
    });
  }

  // Twitter Card tags
  const twitterTags = {
    card: html.match(/<meta[^>]*name\s*=\s*["']twitter:card["'][^>]*content\s*=\s*["']([^"']*)["']/i),
    title: html.match(/<meta[^>]*name\s*=\s*["']twitter:title["'][^>]*content\s*=\s*["']([^"']*)["']/i),
    description: html.match(/<meta[^>]*name\s*=\s*["']twitter:description["'][^>]*content\s*=\s*["']([^"']*)["']/i)
  };

  let twitterCount = 0;
  Object.entries(twitterTags).forEach(([tag, match]) => {
    if (match) {
      twitterCount++;
      category.passed.push({
        type: `twitter_${tag}_present`,
        title: `Twitter Card ${tag} présent`,
        description: `twitter:${tag}: ${match[1]}`
      });
    }
  });

  if (twitterCount === 0) {
    category.issues.push({
      type: 'twitter_missing',
      severity: 'minor',
      title: 'Twitter Cards manquantes',
      description: 'Aucune balise Twitter Card trouvée',
      recommendation: 'Ajouter les balises twitter:card, twitter:title, twitter:description'
    });
  }

  category.score = Math.max(0, 100 - (category.issues.length * 20));
}

function checkPerformanceSEO(html, headers, results) {
  const category = results.categories.performance;
  
  // Compression
  const compression = headers['content-encoding'];
  if (compression) {
    category.passed.push({
      type: 'compression_enabled',
      title: 'Compression activée',
      description: `Compression: ${compression}`
    });
  } else {
    category.issues.push({
      type: 'compression_missing',
      severity: 'moderate',
      title: 'Compression non activée',
      description: 'La compression améliore les temps de chargement',
      recommendation: 'Activer la compression gzip ou brotli'
    });
  }

  // Caching headers
  const cacheControl = headers['cache-control'];
  if (cacheControl && (cacheControl.includes('max-age') || cacheControl.includes('public'))) {
    category.passed.push({
      type: 'caching_configured',
      title: 'Cache configuré',
      description: `Cache-Control: ${cacheControl}`
    });
  } else {
    category.issues.push({
      type: 'caching_missing',
      severity: 'moderate',
      title: 'Cache non configuré',
      description: 'Les headers de cache améliorent les performances',
      recommendation: 'Configurer les headers Cache-Control appropriés'
    });
  }

  // Minification (basic check)
  const hasMinifiedCSS = html.match(/\.min\.css/i);
  const hasMinifiedJS = html.match(/\.min\.js/i);
  
  if (hasMinifiedCSS || hasMinifiedJS) {
    category.passed.push({
      type: 'minification_detected',
      title: 'Minification détectée',
      description: 'Ressources minifiées trouvées'
    });
  } else {
    category.issues.push({
      type: 'minification_missing',
      severity: 'minor',
      title: 'Minification non détectée',
      description: 'Les ressources ne semblent pas minifiées',
      recommendation: 'Minifier les fichiers CSS et JavaScript'
    });
  }

  category.score = Math.max(0, 100 - (category.issues.length * 25));
}

function calculateSEOScore(results) {
  // Collect all issues
  Object.values(results.categories).forEach(category => {
    results.issues.push(...category.issues);
    results.passed.push(...category.passed);
  });

  // Calculate weighted average score
  const weights = {
    meta: 0.3,      // 30% - Most important
    content: 0.25,  // 25% - Very important
    technical: 0.25, // 25% - Very important
    social: 0.1,    // 10% - Nice to have
    performance: 0.1 // 10% - Nice to have
  };

  let weightedScore = 0;
  Object.entries(weights).forEach(([category, weight]) => {
    weightedScore += results.categories[category].score * weight;
  });

  results.score = Math.round(weightedScore);

  // Assign grade
  if (results.score >= 90) {
    results.grade = 'A';
  } else if (results.score >= 80) {
    results.grade = 'B';
  } else if (results.score >= 70) {
    results.grade = 'C';
  } else if (results.score >= 60) {
    results.grade = 'D';
  } else {
    results.grade = 'F';
  }
}

function generateSEORecommendations(results) {
  const recommendations = [];

  // Critical issues
  const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.push({
      priority: 'Critique',
      title: 'Problèmes SEO critiques',
      description: `${criticalIssues.length} problème(s) critique(s) à corriger immédiatement`,
      actions: criticalIssues.map(issue => issue.recommendation).filter(Boolean)
    });
  }

  // High priority issues
  const highIssues = results.issues.filter(issue => issue.severity === 'high');
  if (highIssues.length > 0) {
    recommendations.push({
      priority: 'Élevée',
      title: 'Optimisations SEO importantes',
      description: `${highIssues.length} amélioration(s) importante(s) pour le référencement`,
      actions: highIssues.map(issue => issue.recommendation).filter(Boolean)
    });
  }

  // Moderate issues
  const moderateIssues = results.issues.filter(issue => issue.severity === 'moderate');
  if (moderateIssues.length > 0) {
    recommendations.push({
      priority: 'Moyenne',
      title: 'Améliorations SEO recommandées',
      description: `${moderateIssues.length} optimisation(s) pour améliorer le référencement`,
      actions: moderateIssues.map(issue => issue.recommendation).filter(Boolean)
    });
  }

  // General SEO recommendations
  recommendations.push({
    priority: 'Continue',
    title: 'Bonnes pratiques SEO',
    description: 'Maintenir et améliorer le référencement naturel',
    actions: [
      'Créer du contenu de qualité régulièrement',
      'Optimiser la vitesse de chargement',
      'Améliorer l\'expérience utilisateur mobile',
      'Construire des liens de qualité',
      'Surveiller les performances dans Search Console',
      'Effectuer des audits SEO réguliers'
    ]
  });

  results.recommendations = recommendations;
}

export default middleware(handler);
