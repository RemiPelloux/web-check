import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const accessibilityData = await analyzeAccessibility(url);
    return accessibilityData;
  } catch (error) {
    console.error('Accessibility analysis error:', error);
    return { 
      error: `Failed to analyze accessibility: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzeAccessibility(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    score: 0,
    level: 'Non-conforme',
    issues: [],
    passed: [],
    summary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      total: 0
    },
    categories: {
      images: { score: 0, issues: [], passed: [] },
      forms: { score: 0, issues: [], passed: [] },
      navigation: { score: 0, issues: [], passed: [] },
      content: { score: 0, issues: [], passed: [] },
      structure: { score: 0, issues: [], passed: [] }
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
      
      // Run accessibility checks
      await Promise.all([
        checkImages(html, results),
        checkForms(html, results),
        checkNavigation(html, results),
        checkContent(html, results),
        checkStructure(html, results)
      ]);

      // Calculate overall score and level
      calculateAccessibilityScore(results);
      generateAccessibilityRecommendations(results);
    }

  } catch (error) {
    console.error('Failed to fetch page for accessibility analysis:', error);
    results.issues.push({
      type: 'fetch_error',
      severity: 'critical',
      title: 'Impossible d\'analyser la page',
      description: 'La page n\'a pas pu être chargée pour l\'analyse',
      wcag: null,
      element: null
    });
  }

  return results;
}

function checkImages(html, results) {
  const category = results.categories.images;
  
  // Find all images
  const imageRegex = /<img[^>]*>/gi;
  const images = html.match(imageRegex) || [];
  
  images.forEach((img, index) => {
    // Check for alt attribute
    if (!img.match(/alt\s*=/i)) {
      category.issues.push({
        type: 'missing_alt',
        severity: 'serious',
        title: 'Image sans attribut alt',
        description: 'Image non accessible aux lecteurs d\'écran',
        wcag: 'WCAG 2.1 - 1.1.1 (Niveau A)',
        element: `Image ${index + 1}`,
        recommendation: 'Ajouter un attribut alt descriptif'
      });
      results.summary.serious++;
    } else {
      // Check for empty alt on decorative images
      const altMatch = img.match(/alt\s*=\s*["']([^"']*)["']/i);
      if (altMatch) {
        const altText = altMatch[1].trim();
        if (altText.length > 0) {
          category.passed.push({
            type: 'alt_present',
            title: 'Image avec alt descriptif',
            element: `Image ${index + 1}`
          });
        } else {
          // Empty alt is OK for decorative images
          category.passed.push({
            type: 'decorative_alt',
            title: 'Image décorative (alt vide)',
            element: `Image ${index + 1}`
          });
        }
      }
    }

    // Check for title attribute (should not replace alt)
    if (img.match(/title\s*=/i) && !img.match(/alt\s*=/i)) {
      category.issues.push({
        type: 'title_instead_alt',
        severity: 'moderate',
        title: 'Title utilisé à la place d\'alt',
        description: 'L\'attribut title ne remplace pas alt pour l\'accessibilité',
        wcag: 'WCAG 2.1 - 1.1.1 (Niveau A)',
        element: `Image ${index + 1}`,
        recommendation: 'Utiliser alt au lieu de title'
      });
      results.summary.moderate++;
    }
  });

  // Calculate category score
  const totalImages = images.length;
  const imageIssues = category.issues.length;
  category.score = totalImages > 0 ? Math.max(0, Math.round(((totalImages - imageIssues) / totalImages) * 100)) : 100;
}

function checkForms(html, results) {
  const category = results.categories.forms;
  
  // Find all form inputs
  const inputRegex = /<(input|textarea|select)[^>]*>/gi;
  const inputs = html.match(inputRegex) || [];
  
  inputs.forEach((input, index) => {
    const inputType = input.match(/type\s*=\s*["']([^"']*)["']/i);
    const inputId = input.match(/id\s*=\s*["']([^"']*)["']/i);
    
    // Skip hidden inputs
    if (inputType && inputType[1] === 'hidden') return;
    
    // Check for labels
    let hasLabel = false;
    
    if (inputId) {
      const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["']${inputId[1]}["'][^>]*>`, 'i');
      if (html.match(labelRegex)) {
        hasLabel = true;
        category.passed.push({
          type: 'label_present',
          title: 'Champ avec label associé',
          element: `Input ${index + 1}`
        });
      }
    }
    
    // Check for aria-label or aria-labelledby
    if (!hasLabel && (input.match(/aria-label\s*=/i) || input.match(/aria-labelledby\s*=/i))) {
      hasLabel = true;
      category.passed.push({
        type: 'aria_label_present',
        title: 'Champ avec aria-label',
        element: `Input ${index + 1}`
      });
    }
    
    if (!hasLabel) {
      category.issues.push({
        type: 'missing_label',
        severity: 'serious',
        title: 'Champ de formulaire sans label',
        description: 'Champ non accessible aux lecteurs d\'écran',
        wcag: 'WCAG 2.1 - 1.3.1, 4.1.2 (Niveau A)',
        element: `Input ${index + 1}`,
        recommendation: 'Ajouter un label ou aria-label'
      });
      results.summary.serious++;
    }

    // Check for required fields indication
    if (input.match(/required/i) && !input.match(/aria-required/i)) {
      category.issues.push({
        type: 'required_not_indicated',
        severity: 'moderate',
        title: 'Champ requis non indiqué',
        description: 'Les champs obligatoires doivent être clairement indiqués',
        wcag: 'WCAG 2.1 - 3.3.2 (Niveau A)',
        element: `Input ${index + 1}`,
        recommendation: 'Ajouter aria-required="true" et indication visuelle'
      });
      results.summary.moderate++;
    }
  });

  // Check for fieldsets in complex forms
  const fieldsets = html.match(/<fieldset[^>]*>/gi) || [];
  const formGroups = html.match(/<form[^>]*>/gi) || [];
  
  if (formGroups.length > 0 && inputs.length > 5 && fieldsets.length === 0) {
    category.issues.push({
      type: 'missing_fieldset',
      severity: 'moderate',
      title: 'Formulaire complexe sans fieldset',
      description: 'Les formulaires complexes devraient utiliser fieldset/legend',
      wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
      element: 'Formulaire',
      recommendation: 'Grouper les champs avec fieldset et legend'
    });
    results.summary.moderate++;
  }

  const totalInputs = inputs.length;
  const formIssues = category.issues.length;
  category.score = totalInputs > 0 ? Math.max(0, Math.round(((totalInputs - formIssues) / totalInputs) * 100)) : 100;
}

function checkNavigation(html, results) {
  const category = results.categories.navigation;
  
  // Check for skip links
  const skipLinks = html.match(/<a[^>]*href\s*=\s*["']#[^"']*["'][^>]*>.*?skip.*?<\/a>/gi);
  if (skipLinks && skipLinks.length > 0) {
    category.passed.push({
      type: 'skip_links_present',
      title: 'Liens d\'évitement présents',
      element: 'Navigation'
    });
  } else {
    category.issues.push({
      type: 'missing_skip_links',
      severity: 'moderate',
      title: 'Liens d\'évitement manquants',
      description: 'Les liens "Aller au contenu" facilitent la navigation au clavier',
      wcag: 'WCAG 2.1 - 2.4.1 (Niveau A)',
      element: 'Navigation',
      recommendation: 'Ajouter des liens d\'évitement en début de page'
    });
    results.summary.moderate++;
  }

  // Check for navigation landmarks
  const navElements = html.match(/<nav[^>]*>/gi) || [];
  const roleNav = html.match(/role\s*=\s*["']navigation["']/gi) || [];
  
  if (navElements.length > 0 || roleNav.length > 0) {
    category.passed.push({
      type: 'nav_landmarks',
      title: 'Balises de navigation présentes',
      element: 'Navigation'
    });
  } else {
    category.issues.push({
      type: 'missing_nav_landmarks',
      severity: 'moderate',
      title: 'Balises de navigation manquantes',
      description: 'Utiliser <nav> ou role="navigation" pour identifier les zones de navigation',
      wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
      element: 'Navigation',
      recommendation: 'Ajouter des balises <nav> ou role="navigation"'
    });
    results.summary.moderate++;
  }

  // Check for focus indicators (basic check)
  if (html.includes('outline:') || html.includes(':focus')) {
    category.passed.push({
      type: 'focus_indicators',
      title: 'Indicateurs de focus détectés',
      element: 'CSS'
    });
  } else {
    category.issues.push({
      type: 'missing_focus_indicators',
      severity: 'serious',
      title: 'Indicateurs de focus manquants',
      description: 'Les éléments focusables doivent avoir des indicateurs visuels',
      wcag: 'WCAG 2.1 - 2.4.7 (Niveau AA)',
      element: 'CSS',
      recommendation: 'Ajouter des styles :focus visibles'
    });
    results.summary.serious++;
  }

  category.score = Math.max(0, 100 - (category.issues.length * 25));
}

function checkContent(html, results) {
  const category = results.categories.content;
  
  // Check for page title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].trim().length > 0) {
    category.passed.push({
      type: 'page_title',
      title: 'Titre de page présent',
      element: 'Title'
    });
  } else {
    category.issues.push({
      type: 'missing_page_title',
      severity: 'serious',
      title: 'Titre de page manquant',
      description: 'Chaque page doit avoir un titre descriptif',
      wcag: 'WCAG 2.1 - 2.4.2 (Niveau A)',
      element: 'Head',
      recommendation: 'Ajouter un titre de page descriptif'
    });
    results.summary.serious++;
  }

  // Check for lang attribute
  if (html.match(/<html[^>]*lang\s*=/i)) {
    category.passed.push({
      type: 'lang_attribute',
      title: 'Attribut lang présent',
      element: 'HTML'
    });
  } else {
    category.issues.push({
      type: 'missing_lang',
      severity: 'serious',
      title: 'Attribut lang manquant',
      description: 'La langue de la page doit être spécifiée',
      wcag: 'WCAG 2.1 - 3.1.1 (Niveau A)',
      element: 'HTML',
      recommendation: 'Ajouter lang="fr" à la balise html'
    });
    results.summary.serious++;
  }

  // Check for color contrast issues (basic check)
  const colorStyles = html.match(/color\s*:\s*[^;]+/gi) || [];
  const backgroundStyles = html.match(/background(?:-color)?\s*:\s*[^;]+/gi) || [];
  
  if (colorStyles.length > 0 && backgroundStyles.length === 0) {
    category.issues.push({
      type: 'potential_contrast_issue',
      severity: 'moderate',
      title: 'Contraste potentiellement insuffisant',
      description: 'Couleurs définies sans arrière-plan spécifique',
      wcag: 'WCAG 2.1 - 1.4.3 (Niveau AA)',
      element: 'CSS',
      recommendation: 'Vérifier le contraste des couleurs (ratio 4.5:1 minimum)'
    });
    results.summary.moderate++;
  }

  category.score = Math.max(0, 100 - (category.issues.length * 30));
}

function checkStructure(html, results) {
  const category = results.categories.structure;
  
  // Check heading hierarchy
  const headings = [];
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([^<]+)</h${i}>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      headings.push({ level: i, text: match[1].trim() });
    }
  }

  if (headings.length > 0) {
    // Check if starts with h1
    if (headings[0].level === 1) {
      category.passed.push({
        type: 'h1_present',
        title: 'Titre principal H1 présent',
        element: 'Headings'
      });
    } else {
      category.issues.push({
        type: 'missing_h1',
        severity: 'serious',
        title: 'Titre principal H1 manquant',
        description: 'La page doit commencer par un titre H1',
        wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
        element: 'Headings',
        recommendation: 'Ajouter un titre H1 en début de contenu'
      });
      results.summary.serious++;
    }

    // Check for heading hierarchy gaps
    let hasHierarchyIssues = false;
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level - headings[i-1].level > 1) {
        hasHierarchyIssues = true;
        break;
      }
    }

    if (hasHierarchyIssues) {
      category.issues.push({
        type: 'heading_hierarchy_gap',
        severity: 'moderate',
        title: 'Hiérarchie des titres non respectée',
        description: 'Les niveaux de titre doivent être séquentiels',
        wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
        element: 'Headings',
        recommendation: 'Respecter l\'ordre h1, h2, h3, etc.'
      });
      results.summary.moderate++;
    } else {
      category.passed.push({
        type: 'heading_hierarchy',
        title: 'Hiérarchie des titres respectée',
        element: 'Headings'
      });
    }
  } else {
    category.issues.push({
      type: 'no_headings',
      severity: 'critical',
      title: 'Aucun titre trouvé',
      description: 'La page doit avoir une structure de titres',
      wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
      element: 'Structure',
      recommendation: 'Ajouter des titres H1-H6 pour structurer le contenu'
    });
    results.summary.critical++;
  }

  // Check for main landmark
  if (html.match(/<main[^>]*>/i) || html.match(/role\s*=\s*["']main["']/i)) {
    category.passed.push({
      type: 'main_landmark',
      title: 'Zone de contenu principal identifiée',
      element: 'Landmarks'
    });
  } else {
    category.issues.push({
      type: 'missing_main_landmark',
      severity: 'moderate',
      title: 'Zone de contenu principal non identifiée',
      description: 'Utiliser <main> ou role="main" pour le contenu principal',
      wcag: 'WCAG 2.1 - 1.3.1 (Niveau A)',
      element: 'Landmarks',
      recommendation: 'Ajouter une balise <main> autour du contenu principal'
    });
    results.summary.moderate++;
  }

  category.score = Math.max(0, 100 - (category.issues.length * 25));
}

function calculateAccessibilityScore(results) {
  // Collect all issues
  Object.values(results.categories).forEach(category => {
    results.issues.push(...category.issues);
    results.passed.push(...category.passed);
  });

  // Update summary totals
  results.summary.total = results.summary.critical + results.summary.serious + 
                         results.summary.moderate + results.summary.minor;

  // Calculate weighted score
  let totalScore = 0;
  let categoryCount = 0;
  
  Object.values(results.categories).forEach(category => {
    totalScore += category.score;
    categoryCount++;
  });

  results.score = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;

  // Determine compliance level
  if (results.summary.critical > 0) {
    results.level = 'Critique';
  } else if (results.summary.serious > 0) {
    results.level = 'Non-conforme';
  } else if (results.summary.moderate > 2) {
    results.level = 'Partiellement conforme';
  } else if (results.summary.moderate > 0) {
    results.level = 'Conforme avec améliorations';
  } else {
    results.level = 'Conforme';
  }
}

function generateAccessibilityRecommendations(results) {
  const recommendations = [];

  // Critical issues first
  if (results.summary.critical > 0) {
    recommendations.push({
      priority: 'Critique',
      title: 'Problèmes critiques d\'accessibilité',
      description: `${results.summary.critical} problème(s) critique(s) bloquant l'accessibilité`,
      actions: results.issues
        .filter(issue => issue.severity === 'critical')
        .map(issue => issue.recommendation)
    });
  }

  // Serious issues
  if (results.summary.serious > 0) {
    recommendations.push({
      priority: 'Élevée',
      title: 'Problèmes sérieux d\'accessibilité',
      description: `${results.summary.serious} problème(s) sérieux affectant l'accessibilité`,
      actions: results.issues
        .filter(issue => issue.severity === 'serious')
        .map(issue => issue.recommendation)
    });
  }

  // Moderate issues
  if (results.summary.moderate > 0) {
    recommendations.push({
      priority: 'Moyenne',
      title: 'Améliorations recommandées',
      description: `${results.summary.moderate} amélioration(s) pour une meilleure accessibilité`,
      actions: results.issues
        .filter(issue => issue.severity === 'moderate')
        .map(issue => issue.recommendation)
    });
  }

  // General recommendations
  recommendations.push({
    priority: 'Continue',
    title: 'Bonnes pratiques d\'accessibilité',
    description: 'Maintenir et améliorer l\'accessibilité',
    actions: [
      'Tester régulièrement avec des lecteurs d\'écran',
      'Vérifier la navigation au clavier',
      'Valider le contraste des couleurs',
      'Former l\'équipe aux standards WCAG',
      'Intégrer l\'accessibilité dans le processus de développement'
    ]
  });

  results.recommendations = recommendations;
}

export default middleware(handler);

