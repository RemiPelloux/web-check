import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const USER_RIGHTS_PATTERNS = {
  rights: [
    { name: 'Droit d\'accès', patterns: [/droit.*accès|access.*right/i, /consulter.*données/i] },
    { name: 'Droit de rectification', patterns: [/rectification|modifier|corriger/i] },
    { name: 'Droit d\'effacement', patterns: [/effacement|suppression|delete|droit.*oubli/i] },
    { name: 'Droit d\'opposition', patterns: [/opposition|opposer/i, /refuser.*traitement/i] },
    { name: 'Droit à la portabilité', patterns: [/portabilité|export.*données/i] },
    { name: 'Droit de limitation', patterns: [/limitation.*traitement/i] }
  ],
  
  mechanisms: [
    { name: 'Formulaire de contact', patterns: [/formulaire|form/i, /contact/i] },
    { name: 'Email dédié', patterns: [/@.*\.(com|fr|net|org)/i, /email|e-mail|courriel/i] },
    { name: 'Espace utilisateur', patterns: [/compte|account/i, /espace.*client/i, /mon.*profil/i] }
  ]
};

const handler = async (url) => {
  const startTime = Date.now();
  
  try {
    const { data: html } = await fetchHtml(url, { timeout: 5000 });
    const $ = cheerio.load(html, { decodeEntities: false });
    
    // Extract base domain for validation
    const baseUrl = new URL(url);
    const baseDomain = baseUrl.hostname;
    
    // Function to check if URL belongs to the same domain
    const isSameDomain = (linkHref) => {
      try {
        // Handle relative URLs
        if (!linkHref.startsWith('http')) {
          return true; // Relative URLs are always same domain
        }
        
        const linkUrl = new URL(linkHref);
        const linkDomain = linkUrl.hostname;
        
        // Exact match or subdomain match
        return linkDomain === baseDomain || 
               linkDomain.endsWith('.' + baseDomain) ||
               baseDomain.endsWith('.' + linkDomain);
      } catch (e) {
        return false; // Invalid URL
      }
    };
    
    const result = {
      url,
      timestamp: new Date().toISOString(),
      implementedRights: [],
      missingRights: [],
      availableMechanisms: [],
      compliance: {
        score: 0,
        level: 'Non conforme',
        issues: [],
        recommendations: []
      }
    };
    
    // Collect all relevant text from privacy/legal pages
    // CRITICAL: Only follow links from the same domain
    const links = $('a[href]').map((_, el) => ({
      href: $(el).attr('href'),
      text: $(el).text().toLowerCase()
    })).get().filter(link => isSameDomain(link.href)); // Filter external domains
    
    const relevantLinks = links.filter(link =>
      /privacy|confidentialit|données|legal|mention|rgpd|gdpr/i.test(link.text)
    ).slice(0, 3); // Limit to 3 links for performance
    
    let combinedText = $('body').text().toLowerCase();
    
    // Fetch and combine text from relevant pages (max 2 to stay under 15s)
    for (const link of relevantLinks.slice(0, 2)) {
      try {
        const pageUrl = link.href.startsWith('http') 
          ? link.href 
          : new URL(link.href, url).href;
        
        const { data: pageHtml } = await fetchHtml(pageUrl, { timeout: 3000 });
        const $page = cheerio.load(pageHtml, { decodeEntities: false });
        combinedText += ' ' + $page('body').text().toLowerCase();
      } catch (e) {
        // Skip this page if fetch fails
      }
    }
    
    // Check for user rights
    for (const right of USER_RIGHTS_PATTERNS.rights) {
      const found = right.patterns.some(pattern => pattern.test(combinedText));
      if (found) {
        result.implementedRights.push(right.name);
        result.compliance.score += 14.28; // 6 rights = 100%
      } else {
        result.missingRights.push(right.name);
      }
    }
    
    // Check for mechanisms to exercise rights
    for (const mechanism of USER_RIGHTS_PATTERNS.mechanisms) {
      const found = mechanism.patterns.some(pattern => pattern.test(combinedText));
      if (found) {
        result.availableMechanisms.push(mechanism.name);
        result.compliance.score += 5; // Bonus for each mechanism
      }
    }
    
    // Compliance evaluation
    const score = Math.min(100, Math.round(result.compliance.score));
    result.compliance.score = score;
    
    if (result.implementedRights.length === 0) {
      result.compliance.level = 'Critique';
      result.compliance.issues.push('Aucun droit RGPD mentionné');
      result.compliance.recommendations.push('Documenter tous les droits RGPD des utilisateurs');
      result.compliance.recommendations.push('Fournir un moyen simple d\'exercer ces droits');
    } else if (score >= 85) {
      result.compliance.level = 'Conforme';
      if (result.availableMechanisms.length === 0) {
        result.compliance.recommendations.push('Bon! Considérer un formulaire dédié pour faciliter les demandes');
      }
    } else if (score >= 50) {
      result.compliance.level = 'Partiellement conforme';
      result.compliance.issues = result.missingRights.map(r => `Droit manquant: ${r}`);
      result.compliance.recommendations.push('Compléter avec tous les droits RGPD obligatoires');
      if (result.availableMechanisms.length === 0) {
        result.compliance.recommendations.push('Ajouter un moyen clair d\'exercer les droits (formulaire, email)');
      }
    } else {
      result.compliance.level = 'Non conforme';
      result.compliance.issues.push('Documentation insuffisante des droits utilisateurs');
      result.compliance.recommendations.push('Implémenter et documenter tous les droits RGPD requis');
      result.compliance.recommendations.push('Créer un processus clair pour traiter les demandes des utilisateurs');
    }
    
    result.analysisTime = Date.now() - startTime;
    return result;
    
  } catch (error) {
    return {
      url,
      error: error.message,
      implementedRights: [],
      compliance: { level: 'Erreur d\'analyse', score: 0 }
    };
  }
};

export default middleware(handler);
