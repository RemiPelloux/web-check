import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const PRIVACY_PATTERNS = {
  links: [
    /politique.*confidentialit/i,
    /privacy.*polic/i,
    /protection.*données/i,
    /données.*personnelles/i,
    /rgpd|gdpr/i,
    /vie.*privée/i,
    /\bconfidentialit/i,        // Just "Confidentialité"
    /\bprivacy\b/i,             // Just "Privacy"
    /private.*data/i,
    /personal.*data/i,
    /donnée.*perso/i,
    /data.*protection/i,
    /charte.*confidentialit/i
  ],
  
  urlPatterns: [
    /privacy/i,
    /confidentialit/i,
    /donnees-personnelles/i,
    /politique-confidentialite/i,
    /rgpd/i,
    /gdpr/i,
    /personal-data/i,
    /protection-donnees/i,
    /charte-confidentialite/i,
    /vie-privee/i,
    /\/cookies$/i,              // Many sites put privacy info on /cookies page
    /cookie.*polic/i
  ],
  
  requiredSections: [
    { name: 'Collecte de données', patterns: [/collecte|collect/i, /données|data/i] },
    { name: 'Finalités du traitement', patterns: [/finalité|purpose/i, /utilisation|use/i] },
    { name: 'Droits des utilisateurs', patterns: [/droits|rights/i, /accès|access/i, /rectification/i] },
    { name: 'Durée de conservation', patterns: [/conservation|retention/i, /durée|duration/i] },
    { name: 'Sécurité des données', patterns: [/sécurité|security/i, /protection/i] },
    { name: 'Contact DPD/Responsable', patterns: [/dpd|dpo|délégué/i, /responsable|contact/i, /protection.*données/i] }
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
      hasPrivacyPolicy: false,
      privacyPolicyUrl: null,
      foundSections: [],
      missingSections: [],
      footerLinksFound: [],
      compliance: {
        score: 0,
        level: 'Non conforme',
        issues: [],
        recommendations: []
      }
    };
    
    // Find privacy policy link - check text, title, aria-label, and URL
    // Prioritize footer links (most common location)
    // CRITICAL: Only accept links from the same domain
    const allLinks = $('a[href]').map((_, el) => ({
      href: $(el).attr('href'),
      text: $(el).text().toLowerCase().trim(),
      title: ($(el).attr('title') || '').toLowerCase(),
      ariaLabel: ($(el).attr('aria-label') || '').toLowerCase(),
      inFooter: $(el).closest('footer, [role="contentinfo"], .footer').length > 0
    })).get().filter(link => isSameDomain(link.href)); // Filter external domains
    
    // Try footer links first
    let privacyLink = allLinks.filter(l => l.inFooter).find(link => {
      const combinedText = `${link.text} ${link.title} ${link.ariaLabel} ${link.href}`.toLowerCase();
      return PRIVACY_PATTERNS.links.some(pattern => pattern.test(combinedText)) ||
             PRIVACY_PATTERNS.urlPatterns.some(pattern => pattern.test(link.href));
    });
    
    // If not found in footer, search all links
    if (!privacyLink) {
      privacyLink = allLinks.find(link => {
        const combinedText = `${link.text} ${link.title} ${link.ariaLabel} ${link.href}`.toLowerCase();
        return PRIVACY_PATTERNS.links.some(pattern => pattern.test(combinedText)) ||
               PRIVACY_PATTERNS.urlPatterns.some(pattern => pattern.test(link.href));
      });
    }
    
    // Debug: show footer links found (max 10 for brevity)
    result.footerLinksFound = allLinks
      .filter(l => l.inFooter && l.text)
      .slice(0, 10)
      .map(l => ({ text: l.text, href: l.href }));
    
    // If not found in HTML, try sitemap.xml
    if (!privacyLink) {
      try {
        const baseUrl = new URL(url).origin;
        const { data: sitemap } = await fetchHtml(`${baseUrl}/sitemap.xml`, { timeout: 3000 });
        const $sitemap = cheerio.load(sitemap, { xmlMode: true });
        const sitemapUrls = $sitemap('url > loc').map((_, el) => $sitemap(el).text()).get();
        
        const privacyUrl = sitemapUrls.find(u => 
          PRIVACY_PATTERNS.urlPatterns.some(pattern => pattern.test(u))
        );
        
        if (privacyUrl) {
          privacyLink = { href: privacyUrl, text: 'Sitemap', inFooter: false };
        }
      } catch (e) {
        // Sitemap not available
      }
    }
    
    if (privacyLink) {
      result.hasPrivacyPolicy = true;
      result.privacyPolicyUrl = privacyLink.href;
      result.detectedVia = privacyLink.inFooter === false ? 'Sitemap XML' : (privacyLink.text || 'URL pattern');
      
      // Try to fetch and analyze privacy policy content
      try {
        const policyUrl = privacyLink.href.startsWith('http') 
          ? privacyLink.href 
          : new URL(privacyLink.href, url).href;
        
        const { data: policyHtml } = await fetchHtml(policyUrl, { timeout: 4000 });
        const $policy = cheerio.load(policyHtml, { decodeEntities: false });
        const policyText = $policy('body').text().toLowerCase();
        
        // Check for required sections
        for (const section of PRIVACY_PATTERNS.requiredSections) {
          const found = section.patterns.some(pattern => pattern.test(policyText));
          if (found) {
            result.foundSections.push(section.name);
            result.compliance.score += 16.67; // Each section worth ~17%
          } else {
            result.missingSections.push(section.name);
          }
        }
        
      } catch (fetchError) {
        result.compliance.issues.push('Impossible d\'analyser le contenu de la politique');
      }
    }
    
    // Compliance evaluation
    if (!result.hasPrivacyPolicy) {
      result.compliance.level = 'Critique';
      result.compliance.issues.push('Aucune politique de confidentialité détectée');
      result.compliance.recommendations.push('Créer une politique de confidentialité conforme APDP');
      result.compliance.recommendations.push('La rendre facilement accessible depuis toutes les pages');
    } else {
      const score = Math.round(result.compliance.score);
      result.compliance.score = score;
      
      if (score >= 85) {
        result.compliance.level = 'Conforme';
      } else if (score >= 50) {
        result.compliance.level = 'Partiellement conforme';
        result.compliance.issues = result.missingSections.map(s => `Section manquante: ${s}`);
        result.compliance.recommendations.push('Compléter la politique avec toutes les sections obligatoires APDP');
      } else {
        result.compliance.level = 'Non conforme';
        result.compliance.issues.push('Politique incomplète - sections essentielles manquantes');
        result.compliance.recommendations.push('Réviser la politique pour inclure tous les éléments APDP obligatoires');
      }
    }
    
    result.analysisTime = Date.now() - startTime;
    return result;
    
  } catch (error) {
    return {
      url,
      error: error.message,
      hasPrivacyPolicy: false,
      compliance: { level: 'Erreur d\'analyse', score: 0 }
    };
  }
};

export default middleware(handler);
