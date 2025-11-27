/**
 * Plugin Reference Code System
 * 
 * Maps plugin IDs to unique category-based reference codes for easy identification
 * between admin configuration and result cards.
 * 
 * Format: {CATEGORY_PREFIX}-{SEQUENTIAL_NUMBER}
 * Example: SEC-01, CONF-02, DNS-03
 * 
 * NOTE: Only active plugins are included here. This list must match ACTIVE_PLUGINS in server.js
 */

// Category prefixes
export const CATEGORY_PREFIXES = {
  CONFORMITE: 'CONF',
  SECURITE: 'SEC',
  DNS: 'DNS',
  RESEAU: 'NET',
  PERFORMANCE: 'PERF',
  SEO: 'SEO',
  EMAIL: 'MAIL',
  AUDIT: 'AUD',
  HISTORIQUE: 'HIST',
  TECHNIQUE: 'TECH',
} as const;

/**
 * Complete mapping of active plugin IDs to their unique reference codes
 */
export const pluginReferences: Record<string, string> = {
  // Conformité (CONF-XX)
  'rgpd-compliance': 'CONF-01',
  'apdp-cookie-banner': 'CONF-02',
  'apdp-privacy-policy': 'CONF-03',
  'apdp-legal-notices': 'CONF-04',
  'cookies': 'CONF-05',
  'enhanced-compliance-summary': 'CONF-00', // Main compliance dashboard

  // Sécurité (SEC-XX)
  'ssl': 'SEC-01',
  'tls': 'SEC-02',
  'vulnerabilities': 'SEC-03',
  'secrets': 'SEC-04',
  'http-security': 'SEC-05',
  'firewall': 'SEC-06',
  'hsts': 'SEC-07',
  'dnssec': 'SEC-08',
  'threats': 'SEC-09',
  'block-lists': 'SEC-10',
  'tls-cipher-suites': 'SEC-11',
  'tls-security-config': 'SEC-12',
  'tls-client-support': 'SEC-13',
  'security-txt': 'SEC-14',
  'exposed-files': 'SEC-15',
  'subdomain-takeover': 'SEC-16',
  'headers': 'SEC-17',

  // DNS (DNS-XX)
  'dns': 'DNS-01',
  'dns-server': 'DNS-02',
  'subdomain-enumeration': 'DNS-03',
  'txt-records': 'DNS-04',
  'domain': 'DNS-05',

  // Réseau (NET-XX)
  'get-ip': 'NET-01',
  'location': 'NET-02',
  'trace-route': 'NET-03',
  'status': 'NET-04',
  'ports': 'NET-05',
  'server-info': 'NET-06',
  'hosts': 'NET-07',

  // Performance (PERF-XX)
  'quality': 'PERF-01',
  'lighthouse': 'PERF-02',
  'cdn-resources': 'PERF-03',
  'carbon': 'PERF-04',

  // SEO (SEO-XX)
  'social-tags': 'SEO-01',
  'sitemap': 'SEO-02',
  'robots-txt': 'SEO-03',
  'linked-pages': 'SEO-04',
  'rank': 'SEO-05',

  // E-mail (MAIL-XX)
  'mail-config': 'MAIL-01',

  // Audit (AUD-XX)
  'link-audit': 'AUD-01',

  // Historique (HIST-XX)
  'archives': 'HIST-01',

  // Technique (TECH-XX)
  'tech-stack': 'TECH-01',
  'redirects': 'TECH-02',
};

/**
 * Get the reference code for a plugin ID
 * @param pluginId - The plugin ID (e.g., 'ssl', 'cookies')
 * @returns The reference code (e.g., 'SEC-01') or undefined if not found
 */
export const getPluginRefCode = (pluginId: string): string | undefined => {
  return pluginReferences[pluginId];
};

/**
 * Get the category from a reference code
 * @param refCode - The reference code (e.g., 'SEC-01')
 * @returns The category prefix (e.g., 'SEC')
 */
export const getCategoryFromRefCode = (refCode: string): string => {
  return refCode.split('-')[0];
};

/**
 * Get category display name in French
 * @param prefix - The category prefix (e.g., 'SEC')
 * @returns The French category name (e.g., 'Sécurité')
 */
export const getCategoryDisplayName = (prefix: string): string => {
  const categoryNames: Record<string, string> = {
    'CONF': 'Conformité',
    'SEC': 'Sécurité',
    'DNS': 'DNS',
    'NET': 'Réseau',
    'PERF': 'Performance',
    'SEO': 'SEO',
    'MAIL': 'E-mail',
    'AUD': 'Audit',
    'HIST': 'Historique',
    'TECH': 'Technique',
  };
  return categoryNames[prefix] || prefix;
};

export default pluginReferences;
