import cheerio from 'cheerio';
import middleware from './_common/middleware.js';
import { fetchHtml } from './_common/http.js';

const LEGAL_PATTERNS = {
  links: [
    /c\.?g\.?u\.?/i,           // C.G.U, CGU, cgu
    /c\.?g\.?v\.?/i,           // C.G.V, CGV, cgv
    /mentions.*légales/i,
    /legal.*notice/i,
    /informations.*légales/i,
    /avis.*légal/i,
    /mentions\s*légales/i,
    /legal\s*info/i,
    /\blégal\b/i,              // Just "Légal"
    /\blegal\b/i,              // Just "Legal"
    /\bmentions\b/i,           // Just "Mentions"
    /conditions.*utilisation/i,
    /conditions.*générales/i,
    /terms.*conditions/i,
    /terms.*service/i,
    /legal\s*terms/i
  ],
  
  urlPatterns: [
    /\/cgu$/i,              // Exact /cgu path
    /\/c\.g\.u$/i,          // /c.g.u path
    /cgu/i,
    /cgv/i,
    /c-g-u/i,
    /c-g-v/i,
    /c\.g\.u/i,             // c.g.u with dots
    /c\.g\.v/i,             // c.g.v with dots
    /mentions-legales/i,
    /legal/i,
    /informations-legales/i,
    /avis-legal/i,
    /mentions_legales/i,
    /legal-notice/i,
    /legal-info/i,
    /conditions-utilisation/i,
    /conditions-generales/i,
    /terms-conditions/i,
    /terms-of-service/i,
    /tos\b/i
  ],
  
  requiredInfo: [
    { name: 'Raison sociale', patterns: [/raison.*sociale/i, /dénomination/i, /société/i, /company.*name/i] },
    { name: 'Adresse du siège', patterns: [/siège.*social/i, /adresse/i, /address/i] },
    { name: 'Numéro SIRET/RCS', patterns: [/siret|siren|rcs/i, /registre.*commerce/i] },
    { name: 'Responsable publication', patterns: [/responsable.*publication/i, /directeur.*publication/i] },
    { name: 'Hébergeur', patterns: [/hébergeur|hébergé|hosting/i, /serveur/i] },
    { name: 'Contact', patterns: [/contact|email|téléphone|phone/i] }
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
      hasLegalNotice: false,
      legalNoticeUrl: null,
      foundInfo: [],
      missingInfo: [],
      footerLinksFound: [],
      compliance: {
        score: 0,
        level: 'Non conforme',
        issues: [],
        recommendations: []
      }
    };
    
    // Find legal notice link - check text, title, aria-label, and URL
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
    let legalLink = allLinks.filter(l => l.inFooter).find(link => {
      const combinedText = `${link.text} ${link.title} ${link.ariaLabel} ${link.href}`.toLowerCase();
      return LEGAL_PATTERNS.links.some(pattern => pattern.test(combinedText)) ||
             LEGAL_PATTERNS.urlPatterns.some(pattern => pattern.test(link.href));
    });
    
    // If not found in footer, search all links
    if (!legalLink) {
      legalLink = allLinks.find(link => {
        const combinedText = `${link.text} ${link.title} ${link.ariaLabel} ${link.href}`.toLowerCase();
        return LEGAL_PATTERNS.links.some(pattern => pattern.test(combinedText)) ||
               LEGAL_PATTERNS.urlPatterns.some(pattern => pattern.test(link.href));
      });
    }
    
    // Debug: show footer links found (max 10 for brevity)
    result.footerLinksFound = allLinks
      .filter(l => l.inFooter && l.text)
      .slice(0, 10)
      .map(l => ({ text: l.text, href: l.href }));
    
    // If not found in HTML, try sitemap.xml
    if (!legalLink) {
      try {
        const baseUrl = new URL(url).origin;
        const { data: sitemap } = await fetchHtml(`${baseUrl}/sitemap.xml`, { timeout: 3000 });
        const $sitemap = cheerio.load(sitemap, { xmlMode: true });
        const sitemapUrls = $sitemap('url > loc').map((_, el) => $sitemap(el).text()).get();
        
        const legalUrl = sitemapUrls.find(u => 
          LEGAL_PATTERNS.urlPatterns.some(pattern => pattern.test(u))
        );
        
        if (legalUrl) {
          legalLink = { href: legalUrl, text: 'Sitemap', inFooter: false };
        }
      } catch (e) {
        // Sitemap not available
      }
    }
    
    if (legalLink) {
      result.hasLegalNotice = true;
      result.legalNoticeUrl = legalLink.href;
      result.detectedVia = legalLink.inFooter === false ? 'Sitemap XML' : (legalLink.text || 'URL pattern');
      
      // Try to fetch and analyze legal notice content
      try {
        const noticeUrl = legalLink.href.startsWith('http') 
          ? legalLink.href 
          : new URL(legalLink.href, url).href;
        
        const { data: noticeHtml } = await fetchHtml(noticeUrl, { timeout: 4000 });
        const $notice = cheerio.load(noticeHtml, { decodeEntities: false });
        const noticeText = $notice('body').text().toLowerCase();
        
        // Check for required information
        for (const info of LEGAL_PATTERNS.requiredInfo) {
          const found = info.patterns.some(pattern => pattern.test(noticeText));
          if (found) {
            result.foundInfo.push(info.name);
            result.compliance.score += 16.67; // Each item worth ~17%
          } else {
            result.missingInfo.push(info.name);
          }
        }
        
      } catch (fetchError) {
        result.compliance.issues.push('Impossible d\'analyser le contenu des mentions légales');
      }
    }
    
    // Compliance evaluation
    if (!result.hasLegalNotice) {
      result.compliance.level = 'Critique';
      result.compliance.issues.push('Aucune page de mentions légales détectée');
      result.compliance.recommendations.push('Créer une page mentions légales obligatoire en France et Monaco');
      result.compliance.recommendations.push('Inclure: raison sociale, siège, SIRET, responsable, hébergeur');
    } else {
      const score = Math.round(result.compliance.score);
      result.compliance.score = score;
      
      if (score >= 85) {
        result.compliance.level = 'Conforme';
      } else if (score >= 50) {
        result.compliance.level = 'Partiellement conforme';
        result.compliance.issues = result.missingInfo.map(i => `Information manquante: ${i}`);
        result.compliance.recommendations.push('Compléter avec toutes les informations légales obligatoires');
      } else {
        result.compliance.level = 'Non conforme';
        result.compliance.issues.push('Mentions légales incomplètes');
        result.compliance.recommendations.push('Mentions légales incomplètes - risque de sanctions');
      }
    }
    
    result.analysisTime = Date.now() - startTime;
    return result;
    
  } catch (error) {
    return {
      url,
      error: error.message,
      hasLegalNotice: false,
      compliance: { level: 'Erreur d\'analyse', score: 0 }
    };
  }
};

export default middleware(handler);
