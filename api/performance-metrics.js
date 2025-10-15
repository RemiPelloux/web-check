import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const performanceData = await analyzePerformance(url);
    return performanceData;
  } catch (error) {
    console.error('Performance analysis error:', error);
    return { 
      error: `Failed to analyze performance: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzePerformance(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    metrics: {},
    score: 0,
    grade: 'F',
    recommendations: [],
    details: {
      loadTime: null,
      responseTime: null,
      contentSize: null,
      resourceCount: null,
      compression: null,
      caching: null
    }
  };

  // Measure basic performance metrics
  await Promise.all([
    measureLoadTime(url, results),
    analyzeHeaders(url, results),
    analyzeContent(url, results)
  ]);

  // Calculate overall performance score
  calculatePerformanceScore(results);
  generateRecommendations(results);

  return results;
}

async function measureLoadTime(url, results) {
  try {
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      timeout: 8000,
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
      validateStatus: () => true,
      maxRedirects: 5
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    results.details.loadTime = loadTime;
    results.details.responseTime = loadTime;
    results.details.contentSize = response.data ? response.data.length : 0;
    
    // Analyze response
    results.metrics.loadTime = {
      value: loadTime,
      unit: 'ms',
      status: loadTime < 1000 ? 'good' : loadTime < 3000 ? 'needs-improvement' : 'poor',
      description: 'Temps de chargement total de la page'
    };

    results.metrics.contentSize = {
      value: Math.round(results.details.contentSize / 1024),
      unit: 'KB',
      status: results.details.contentSize < 500000 ? 'good' : results.details.contentSize < 1000000 ? 'needs-improvement' : 'poor',
      description: 'Taille du contenu HTML'
    };

  } catch (error) {
    console.error('Load time measurement failed:', error);
    results.metrics.loadTime = {
      value: null,
      unit: 'ms',
      status: 'error',
      description: 'Impossible de mesurer le temps de chargement'
    };
  }
}

async function analyzeHeaders(url, results) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: () => true,
      maxRedirects: 5
    });

    const headers = response.headers;

    // Check compression
    const compression = headers['content-encoding'];
    results.details.compression = compression || 'none';
    results.metrics.compression = {
      value: compression || 'Non activée',
      status: compression ? 'good' : 'poor',
      description: 'Compression du contenu (gzip, brotli, etc.)'
    };

    // Check caching headers
    const cacheControl = headers['cache-control'];
    const expires = headers['expires'];
    const etag = headers['etag'];
    
    let cachingStatus = 'poor';
    let cachingValue = 'Non configuré';
    
    if (cacheControl) {
      cachingValue = cacheControl;
      if (cacheControl.includes('max-age') || cacheControl.includes('public')) {
        cachingStatus = 'good';
      } else if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
        cachingStatus = 'needs-improvement';
      }
    } else if (expires || etag) {
      cachingValue = 'Headers basiques présents';
      cachingStatus = 'needs-improvement';
    }

    results.details.caching = cachingValue;
    results.metrics.caching = {
      value: cachingValue,
      status: cachingStatus,
      description: 'Configuration du cache HTTP'
    };

    // Check server response time (from initial request)
    results.metrics.serverResponse = {
      value: results.details.responseTime,
      unit: 'ms',
      status: results.details.responseTime < 200 ? 'good' : results.details.responseTime < 500 ? 'needs-improvement' : 'poor',
      description: 'Temps de réponse du serveur'
    };

  } catch (error) {
    console.error('Headers analysis failed:', error);
  }
}

async function analyzeContent(url, results) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      maxContentLength: 3 * 1024 * 1024, // 3MB limit
      validateStatus: () => true,
      maxRedirects: 5
    });

    if (typeof response.data === 'string') {
      const html = response.data;
      
      // Count resources
      const resourceCounts = countResources(html);
      results.details.resourceCount = resourceCounts.total;
      
      results.metrics.resourceCount = {
        value: resourceCounts.total,
        unit: 'ressources',
        status: resourceCounts.total < 50 ? 'good' : resourceCounts.total < 100 ? 'needs-improvement' : 'poor',
        description: `Scripts: ${resourceCounts.scripts}, CSS: ${resourceCounts.stylesheets}, Images: ${resourceCounts.images}`
      };

      // Check for performance best practices
      const performanceIssues = checkPerformanceIssues(html);
      results.metrics.performanceIssues = {
        value: performanceIssues.length,
        unit: 'problèmes',
        status: performanceIssues.length === 0 ? 'good' : performanceIssues.length < 3 ? 'needs-improvement' : 'poor',
        description: 'Problèmes de performance détectés',
        details: performanceIssues
      };

      // Analyze CSS and JS optimization
      const optimization = analyzeOptimization(html);
      results.metrics.optimization = {
        value: `${optimization.minified}% minifié`,
        status: optimization.minified > 80 ? 'good' : optimization.minified > 50 ? 'needs-improvement' : 'poor',
        description: 'Optimisation des ressources CSS/JS'
      };
    }

  } catch (error) {
    console.error('Content analysis failed:', error);
  }
}

function countResources(html) {
  const scriptMatches = html.match(/<script[^>]*src=/gi) || [];
  const stylesheetMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  const imageMatches = html.match(/<img[^>]*src=/gi) || [];
  
  return {
    scripts: scriptMatches.length,
    stylesheets: stylesheetMatches.length,
    images: imageMatches.length,
    total: scriptMatches.length + stylesheetMatches.length + imageMatches.length
  };
}

function checkPerformanceIssues(html) {
  const issues = [];
  
  // Check for blocking resources
  const blockingScripts = html.match(/<script(?![^>]*async)(?![^>]*defer)[^>]*src=/gi);
  if (blockingScripts && blockingScripts.length > 0) {
    issues.push(`${blockingScripts.length} script(s) bloquant(s) détecté(s)`);
  }

  // Check for inline styles (should be minimized)
  const inlineStyles = html.match(/<style[^>]*>/gi);
  if (inlineStyles && inlineStyles.length > 3) {
    issues.push(`Trop de styles inline (${inlineStyles.length})`);
  }

  // Check for large inline scripts
  const inlineScripts = html.match(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/gi);
  if (inlineScripts) {
    const largeInlineScripts = inlineScripts.filter(script => script.length > 1000);
    if (largeInlineScripts.length > 0) {
      issues.push(`${largeInlineScripts.length} script(s) inline volumineux`);
    }
  }

  // Check for missing alt attributes on images
  const imagesWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi);
  if (imagesWithoutAlt && imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} image(s) sans attribut alt`);
  }

  // Check for HTTP resources on HTTPS pages
  if (html.includes('https://') && html.match(/src=["']http:\/\/[^"']+/gi)) {
    issues.push('Ressources HTTP sur page HTTPS (contenu mixte)');
  }

  return issues;
}

function analyzeOptimization(html) {
  let totalResources = 0;
  let minifiedResources = 0;

  // Check for minified CSS
  const cssLinks = html.match(/<link[^>]*href=["']([^"']*\.css[^"']*)["']/gi);
  if (cssLinks) {
    totalResources += cssLinks.length;
    const minifiedCSS = cssLinks.filter(link => link.includes('.min.css'));
    minifiedResources += minifiedCSS.length;
  }

  // Check for minified JS
  const jsScripts = html.match(/<script[^>]*src=["']([^"']*\.js[^"']*)["']/gi);
  if (jsScripts) {
    totalResources += jsScripts.length;
    const minifiedJS = jsScripts.filter(script => script.includes('.min.js'));
    minifiedResources += minifiedJS.length;
  }

  const minificationPercentage = totalResources > 0 ? Math.round((minifiedResources / totalResources) * 100) : 0;

  return {
    total: totalResources,
    minified: minificationPercentage
  };
}

function calculatePerformanceScore(results) {
  let score = 0;
  let totalMetrics = 0;

  // Score each metric
  Object.values(results.metrics).forEach(metric => {
    if (metric.status) {
      totalMetrics++;
      switch (metric.status) {
        case 'good':
          score += 100;
          break;
        case 'needs-improvement':
          score += 60;
          break;
        case 'poor':
          score += 20;
          break;
        case 'error':
          score += 0;
          break;
      }
    }
  });

  results.score = totalMetrics > 0 ? Math.round(score / totalMetrics) : 0;

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

function generateRecommendations(results) {
  const recommendations = [];

  // Load time recommendations
  if (results.metrics.loadTime && results.metrics.loadTime.status !== 'good') {
    recommendations.push({
      priority: 'High',
      title: 'Améliorer le temps de chargement',
      description: `Temps de chargement actuel: ${results.metrics.loadTime.value}ms`,
      actions: [
        'Optimiser les images (compression, formats modernes)',
        'Minifier CSS et JavaScript',
        'Utiliser un CDN pour les ressources statiques',
        'Activer la compression gzip/brotli'
      ]
    });
  }

  // Compression recommendations
  if (results.metrics.compression && results.metrics.compression.status !== 'good') {
    recommendations.push({
      priority: 'Medium',
      title: 'Activer la compression',
      description: 'La compression du contenu n\'est pas activée',
      actions: [
        'Configurer gzip ou brotli sur le serveur',
        'Compresser les fichiers CSS, JS et HTML',
        'Vérifier la configuration du serveur web'
      ]
    });
  }

  // Caching recommendations
  if (results.metrics.caching && results.metrics.caching.status !== 'good') {
    recommendations.push({
      priority: 'Medium',
      title: 'Améliorer la mise en cache',
      description: 'Configuration du cache HTTP insuffisante',
      actions: [
        'Ajouter des headers Cache-Control appropriés',
        'Configurer des ETags pour les ressources',
        'Définir des durées de cache optimales',
        'Utiliser un CDN avec cache intelligent'
      ]
    });
  }

  // Resource optimization
  if (results.metrics.resourceCount && results.metrics.resourceCount.status !== 'good') {
    recommendations.push({
      priority: 'Medium',
      title: 'Optimiser le nombre de ressources',
      description: `${results.metrics.resourceCount.value} ressources chargées`,
      actions: [
        'Combiner les fichiers CSS et JavaScript',
        'Utiliser le lazy loading pour les images',
        'Éliminer les ressources non utilisées',
        'Optimiser les polices web'
      ]
    });
  }

  // Performance issues
  if (results.metrics.performanceIssues && results.metrics.performanceIssues.value > 0) {
    recommendations.push({
      priority: 'High',
      title: 'Corriger les problèmes de performance',
      description: `${results.metrics.performanceIssues.value} problème(s) détecté(s)`,
      actions: results.metrics.performanceIssues.details || [
        'Ajouter async/defer aux scripts non critiques',
        'Minimiser les styles inline',
        'Optimiser les images et ajouter les attributs alt',
        'Corriger le contenu mixte HTTP/HTTPS'
      ]
    });
  }

  results.recommendations = recommendations;
}

export default middleware(handler);

