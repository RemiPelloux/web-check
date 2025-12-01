/**
 * Full Results PDF Generator
 * Dynamically generates a comprehensive PDF with ALL available plugin results
 */

interface PluginResult {
  [key: string]: any;
}

/**
 * Format a date to French locale
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Escape HTML to prevent XSS
 */
const escapeHtml = (text: any): string => {
  if (text === null || text === undefined) return '';
  if (typeof text === 'object') {
    // Try to extract meaningful value from object
    if (text.CN) return escapeHtml(text.CN);
    if (text.O) return escapeHtml(text.O);
    if (text.commonName) return escapeHtml(text.commonName);
    if (text.name) return escapeHtml(text.name);
    if (text.value) return escapeHtml(text.value);
    if (text.address) return escapeHtml(text.address);
    // If it's an array, join values
    if (Array.isArray(text)) return text.map(escapeHtml).filter(Boolean).join(', ');
    // Last resort: try to get first string property
    const values = Object.values(text).filter(v => typeof v === 'string');
    if (values.length > 0) return escapeHtml(values[0]);
    return '';
  }
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Safely get nested property
 */
const safeGet = (obj: any, path: string, defaultValue: any = ''): any => {
  try {
    const value = path.split('.').reduce((o, k) => o?.[k], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Format any value for display
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? '✓ Oui' : '✗ Non';
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) {
    return value.slice(0, 5).map(v => escapeHtml(v)).filter(Boolean).join(', ') + 
           (value.length > 5 ? ` (+${value.length - 5})` : '');
  }
  if (typeof value === 'object') return escapeHtml(value);
  return escapeHtml(value);
};

/**
 * Plugin renderer configurations
 */
const pluginRenderers: Record<string, (data: any, key: string) => string> = {
  // SSL Certificate
  'ssl': (data) => {
    if (!data || data.error) return '';
    const subject = data.subject?.CN || data.subject?.O || data.commonName || data.subjectCN || 
                   (typeof data.subject === 'string' ? data.subject : '');
    const issuer = data.issuer?.O || data.issuer?.CN || 
                  (typeof data.issuer === 'string' ? data.issuer : '');
    const validTo = data.validTo || data.expiresAt || data.notAfter;
    const validFrom = data.validFrom || data.issuedAt || data.notBefore;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Certificat SSL</h3>
          <span class="status-badge ${data.valid || data.validCertificate ? 'success' : 'error'}">
            ${data.valid || data.validCertificate ? '✓ Valide' : '✗ Invalide'}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${subject ? `<tr><td class="label">Sujet</td><td>${escapeHtml(subject)}</td></tr>` : ''}
            ${issuer ? `<tr><td class="label">Émetteur</td><td>${escapeHtml(issuer)}</td></tr>` : ''}
            ${validTo ? `<tr><td class="label">Expire le</td><td>${new Date(validTo).toLocaleDateString('fr-FR')}</td></tr>` : ''}
            ${validFrom ? `<tr><td class="label">Renouvelé le</td><td>${new Date(validFrom).toLocaleDateString('fr-FR')}</td></tr>` : ''}
            ${data.protocol ? `<tr><td class="label">Protocole</td><td>${escapeHtml(data.protocol)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Technologies
  'tech-stack': (data) => {
    if (!data?.technologies?.length) return '';
    const techs = data.technologies.slice(0, 20);
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">⚙️</span>
          <h3>Technologies Utilisées (${data.technologies.length})</h3>
        </div>
        <div class="plugin-content">
          <div class="tech-grid">
            ${techs.map((tech: any) => `
              <div class="tech-item">
                <strong>${escapeHtml(tech.name)}</strong>
                ${tech.version ? `<span class="version">v${escapeHtml(tech.version)}</span>` : ''}
                <span class="category">${escapeHtml(tech.categories?.[0]?.name || tech.category || '')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Cookies
  'cookies': (data) => {
    if (!data) return '';
    const cookies = data.cookies || data.clientCookies || [];
    const serverCookies = data.serverCookies || [];
    const total = cookies.length + serverCookies.length;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🍪</span>
          <h3>Cookies</h3>
          <span class="status-badge info">${total} cookie${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${total > 0 ? `
            <table class="data-table">
              <thead><tr><th>Nom</th><th>Type</th><th>Sécurisé</th></tr></thead>
              <tbody>
                ${[...cookies, ...serverCookies].slice(0, 10).map((c: any) => `
                  <tr>
                    <td>${escapeHtml(c.name)}</td>
                    <td>${escapeHtml(c.category || c.type || 'autre')}</td>
                    <td>${c.secure ? '✓' : '✗'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${total > 10 ? `<p class="more">+ ${total - 10} autres...</p>` : ''}
          ` : '<p class="empty">Aucun cookie détecté</p>'}
        </div>
      </div>
    `;
  },

  // HTTP Security
  'http-security': (data) => {
    if (!data || data.error) return '';
    const headers = [
      { name: 'Content-Security-Policy', key: 'contentSecurityPolicy', alt: 'csp' },
      { name: 'Strict-Transport-Security', key: 'strictTransportSecurity', alt: 'hsts' },
      { name: 'X-Content-Type-Options', key: 'xContentTypeOptions' },
      { name: 'X-Frame-Options', key: 'xFrameOptions' },
      { name: 'X-XSS-Protection', key: 'xXSSProtection' },
    ];
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛡️</span>
          <h3>Sécurité HTTP</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${headers.map(h => {
              const present = data[h.key] || data[h.alt] || data.headers?.[h.name.toLowerCase()];
              return `<tr>
                <td class="label">${h.name}</td>
                <td><span class="${present ? 'check' : 'cross'}">${present ? '✓ Oui' : '✗ Non'}</span></td>
              </tr>`;
            }).join('')}
          </table>
        </div>
      </div>
    `;
  },

  // DNS Records
  'dns': (data) => {
    if (!data || data.error) return '';
    
    const extractRecords = (records: any): string => {
      if (!records) return '';
      if (Array.isArray(records)) {
        return records.slice(0, 4).map(r => {
          if (typeof r === 'string') return r;
          return r?.address || r?.value || r?.exchange || r?.data || r?.target || '';
        }).filter(Boolean).join(', ');
      }
      if (typeof records === 'string') return records;
      return records?.address || records?.value || '';
    };
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌐</span>
          <h3>Enregistrements DNS</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.A ? `<tr><td class="label">A</td><td>${extractRecords(data.A)}</td></tr>` : ''}
            ${data.AAAA ? `<tr><td class="label">AAAA</td><td>${extractRecords(data.AAAA)}</td></tr>` : ''}
            ${data.MX ? `<tr><td class="label">MX</td><td>${extractRecords(data.MX)}</td></tr>` : ''}
            ${data.NS ? `<tr><td class="label">NS</td><td>${extractRecords(data.NS)}</td></tr>` : ''}
            ${data.TXT ? `<tr><td class="label">TXT</td><td>${extractRecords(data.TXT)}</td></tr>` : ''}
            ${data.CNAME ? `<tr><td class="label">CNAME</td><td>${extractRecords(data.CNAME)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // DNSSEC
  'dnssec': (data) => {
    if (!data) return '';
    const enabled = data.enabled || data.isValid || data.secure;
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔐</span>
          <h3>DNSSEC</h3>
          <span class="status-badge ${enabled ? 'success' : 'warning'}">${enabled ? '✓ Activé' : '○ Non activé'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">DNSKEY</td><td>${data.dnskey || data.DNSKEY ? '✓ Présent' : '✗ Absent'}</td></tr>
            <tr><td class="label">DS</td><td>${data.ds || data.DS ? '✓ Présent' : '✗ Absent'}</td></tr>
            <tr><td class="label">RRSIG</td><td>${data.rrsig || data.RRSIG ? '✓ Présent' : '✗ Absent'}</td></tr>
          </table>
        </div>
      </div>
    `;
  },

  // Server Location
  'location': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📍</span>
          <h3>Localisation Serveur</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.city ? `<tr><td class="label">Ville</td><td>${escapeHtml(data.city)}</td></tr>` : ''}
            ${data.region ? `<tr><td class="label">Région</td><td>${escapeHtml(data.region)}</td></tr>` : ''}
            ${data.country ? `<tr><td class="label">Pays</td><td>${escapeHtml(data.country)} ${data.countryCode || ''}</td></tr>` : ''}
            ${data.isp || data.org ? `<tr><td class="label">Hébergeur</td><td>${escapeHtml(data.isp || data.org)}</td></tr>` : ''}
            ${data.timezone ? `<tr><td class="label">Fuseau</td><td>${escapeHtml(data.timezone)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Privacy Policy
  'apdp-privacy-policy': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📜</span>
          <h3>Politique de Confidentialité</h3>
          <span class="status-badge ${data.found ? 'success' : 'error'}">${data.found ? '✓ Trouvée' : '✗ Absente'}</span>
        </div>
        <div class="plugin-content">
          ${data.found ? `
            <table class="info-table">
              ${data.url ? `<tr><td class="label">URL</td><td>${escapeHtml(data.url)}</td></tr>` : ''}
              ${data.score !== undefined ? `<tr><td class="label">Score</td><td>${data.score}/100</td></tr>` : ''}
              ${data.detectedVia ? `<tr><td class="label">Détection</td><td>${escapeHtml(data.detectedVia)}</td></tr>` : ''}
            </table>
            ${data.sections ? `
              <div class="checklist">
                ${Object.entries(data.sections).map(([k, v]) => 
                  `<span class="${v ? 'check' : 'cross'}">${v ? '✓' : '✗'} ${escapeHtml(k)}</span>`
                ).join('')}
              </div>
            ` : ''}
          ` : '<p class="empty">Non trouvée</p>'}
        </div>
      </div>
    `;
  },

  // Legal Notices
  'apdp-legal-notices': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">⚖️</span>
          <h3>Mentions Légales</h3>
          <span class="status-badge ${data.found ? 'success' : 'error'}">${data.found ? '✓ Trouvées' : '✗ Absentes'}</span>
        </div>
        <div class="plugin-content">
          ${data.found ? `
            <table class="info-table">
              ${data.url ? `<tr><td class="label">URL</td><td>${escapeHtml(data.url)}</td></tr>` : ''}
              ${data.score !== undefined ? `<tr><td class="label">Score</td><td>${data.score}/100</td></tr>` : ''}
            </table>
          ` : '<p class="empty">Non trouvées</p>'}
        </div>
      </div>
    `;
  },

  // Threats
  'threats': (data) => {
    if (!data) return '';
    const isClean = !data.urlhaus && !data.phishing && !data.malware;
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛡️</span>
          <h3>Menaces</h3>
          <span class="status-badge ${isClean ? 'success' : 'error'}">${isClean ? '✓ Aucune' : '⚠ Détectées'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">Phishing</td><td>${data.phishing ? '⚠ Détecté' : '✓ Non détecté'}</td></tr>
            <tr><td class="label">Malware</td><td>${data.malware || data.urlhaus ? '⚠ Listé' : '✓ Non listé'}</td></tr>
          </table>
        </div>
      </div>
    `;
  },

  // Sitemap
  'sitemap': (data) => {
    if (!data || data.error) return '';
    const urls = data.urls || data.pages || data.entries || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🗺️</span>
          <h3>Plan du Site</h3>
          <span class="status-badge info">${urls.length} page${urls.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${urls.length > 0 ? `
            <ul class="url-list">
              ${urls.slice(0, 12).map((u: any) => {
                const url = typeof u === 'string' ? u : u.url || u.loc || '';
                return `<li>${escapeHtml(url.replace(/^https?:\/\/[^/]+/, ''))}</li>`;
              }).join('')}
            </ul>
            ${urls.length > 12 ? `<p class="more">+ ${urls.length - 12} autres...</p>` : ''}
          ` : '<p class="empty">Aucun sitemap</p>'}
        </div>
      </div>
    `;
  },

  // Block Lists
  'block-lists': (data) => {
    if (!data || data.error) return '';
    const lists = data.lists || data.blocklists || data.servers || [];
    const blocked = lists.filter((l: any) => l.blocked || l.isBlocked);
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🚫</span>
          <h3>Listes de Blocage</h3>
          <span class="status-badge ${blocked.length === 0 ? 'success' : 'error'}">
            ${blocked.length === 0 ? '✓ Non bloqué' : `⚠ ${blocked.length} liste(s)`}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${lists.slice(0, 10).map((l: any) => `
              <tr>
                <td class="label">${escapeHtml(l.name || l.server || l.list)}</td>
                <td><span class="${l.blocked || l.isBlocked ? 'cross' : 'check'}">${l.blocked || l.isBlocked ? '⚠ Bloqué' : '✓ OK'}</span></td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
    `;
  },

  // Carbon Footprint
  'carbon': (data) => {
    if (!data || data.error) return '';
    const co2 = data.co2?.grid?.grams || data.statistics?.co2?.grid?.grams || data.co2PerVisit || 0;
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌱</span>
          <h3>Empreinte Carbone</h3>
          <span class="status-badge ${data.rating === 'A' || data.rating === 'A+' ? 'success' : 'info'}">${data.rating || 'N/A'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">CO2 par visite</td><td>${typeof co2 === 'number' ? co2.toFixed(3) : co2} g</td></tr>
            ${data.statistics?.energy ? `<tr><td class="label">Énergie</td><td>${data.statistics.energy.toFixed(5)} KWh</td></tr>` : ''}
            ${data.cleanerThan || data.statistics?.cleanerThan ? `<tr><td class="label">Plus propre que</td><td>${data.cleanerThan || data.statistics?.cleanerThan}% des sites</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // CDN Resources
  'cdn-resources': (data) => {
    if (!data || data.error) return '';
    const resources = data.resources || data.externalResources || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📦</span>
          <h3>Ressources CDN</h3>
          <span class="status-badge info">${resources.length} ressource${resources.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${resources.length > 0 ? `
            <ul class="resource-list">
              ${resources.slice(0, 8).map((r: any) => `<li>${escapeHtml(r.domain || r.url || r.host || r)}</li>`).join('')}
            </ul>
            ${resources.length > 8 ? `<p class="more">+ ${resources.length - 8} autres...</p>` : ''}
          ` : '<p class="empty">Aucune ressource CDN</p>'}
        </div>
      </div>
    `;
  },

  // Robots.txt
  'robots': (data) => {
    if (!data) return '';
    const rules = data.robots || data.rules || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🤖</span>
          <h3>Robots.txt</h3>
          <span class="status-badge ${data.error ? 'warning' : 'success'}">${data.error ? '○ Absent' : '✓ Présent'}</span>
        </div>
        <div class="plugin-content">
          ${rules.length > 0 ? `
            <ul class="rules-list">
              ${rules.slice(0, 8).map((r: any) => `<li><code>${escapeHtml(r.lbl || r.directive || r.field || '')}: ${escapeHtml(r.val || r.value || '')}</code></li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucune règle</p>'}
        </div>
      </div>
    `;
  },

  // Redirects
  'redirects': (data) => {
    if (!data) return '';
    const chain = data.redirects || data.chain || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">↪️</span>
          <h3>Redirections</h3>
          <span class="status-badge ${chain.length <= 2 ? 'success' : 'warning'}">${chain.length} redirection${chain.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${chain.length > 0 ? `
            <ul class="redirect-list">
              ${chain.map((r: any) => `<li>→ ${escapeHtml(typeof r === 'string' ? r : r.url || r.to || '')}</li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucune redirection</p>'}
        </div>
      </div>
    `;
  },

  // Server Status
  'status': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📡</span>
          <h3>Statut Serveur</h3>
          <span class="status-badge ${data.isUp ? 'success' : 'error'}">${data.isUp ? '✓ En ligne' : '✗ Hors ligne'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.responseCode ? `<tr><td class="label">Code</td><td>${data.responseCode}</td></tr>` : ''}
            ${data.responseTime ? `<tr><td class="label">Temps</td><td>${Math.round(data.responseTime)}ms</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // HSTS
  'hsts': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔐</span>
          <h3>HSTS</h3>
          <span class="status-badge ${data.enabled || data.isEnabled || data.preloaded ? 'success' : 'warning'}">
            ${data.enabled || data.isEnabled ? '✓ Activé' : '○ Non activé'}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.preloaded !== undefined ? `<tr><td class="label">Préchargé</td><td>${data.preloaded ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
            ${data.maxAge ? `<tr><td class="label">Max-Age</td><td>${data.maxAge}s</td></tr>` : ''}
            ${data.includeSubDomains !== undefined ? `<tr><td class="label">Sous-domaines</td><td>${data.includeSubDomains ? '✓' : '✗'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Firewall
  'firewall': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔥</span>
          <h3>Pare-feu / WAF</h3>
          <span class="status-badge ${data.detected || data.hasWaf ? 'success' : 'info'}">
            ${data.detected || data.hasWaf ? '✓ Détecté' : '○ Non détecté'}
          </span>
        </div>
        <div class="plugin-content">
          ${data.detected || data.hasWaf ? `
            <table class="info-table">
              ${data.name || data.waf ? `<tr><td class="label">Type</td><td>${escapeHtml(data.name || data.waf)}</td></tr>` : ''}
              ${data.confidence ? `<tr><td class="label">Confiance</td><td>${data.confidence}%</td></tr>` : ''}
            </table>
          ` : '<p class="empty">Aucun WAF détecté</p>'}
        </div>
      </div>
    `;
  },

  // Social Tags
  'social-tags': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📱</span>
          <h3>Métadonnées Sociales</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.title || data['og:title'] ? `<tr><td class="label">Titre</td><td>${escapeHtml(data.title || data['og:title'])}</td></tr>` : ''}
            ${data.description || data['og:description'] ? `<tr><td class="label">Description</td><td>${escapeHtml((data.description || data['og:description']).substring(0, 100))}...</td></tr>` : ''}
            ${data['og:image'] ? `<tr><td class="label">Image</td><td>✓ Présente</td></tr>` : ''}
            ${data['twitter:card'] ? `<tr><td class="label">Twitter Card</td><td>${escapeHtml(data['twitter:card'])}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Vulnerabilities
  'vulnerabilities': (data) => {
    if (!data || data.error) return '';
    const vulns = data.vulnerabilities || data.issues || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">⚠️</span>
          <h3>Vulnérabilités</h3>
          <span class="status-badge ${vulns.length === 0 ? 'success' : 'error'}">
            ${vulns.length === 0 ? '✓ Aucune' : `${vulns.length} trouvée(s)`}
          </span>
        </div>
        <div class="plugin-content">
          ${vulns.length > 0 ? `
            <ul class="vuln-list">
              ${vulns.slice(0, 5).map((v: any) => `<li>⚠ ${escapeHtml(v.title || v.name || v.id || v)}</li>`).join('')}
            </ul>
            ${vulns.length > 5 ? `<p class="more">+ ${vulns.length - 5} autres...</p>` : ''}
          ` : '<p class="empty">Aucune vulnérabilité détectée</p>'}
        </div>
      </div>
    `;
  },

  // Link Audit
  'link-audit': (data) => {
    if (!data || data.error) return '';
    const broken = data.brokenLinks || data.broken || [];
    const mixed = data.mixedContent || data.mixed || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔗</span>
          <h3>Audit des Liens</h3>
          <span class="status-badge ${broken.length === 0 && mixed.length === 0 ? 'success' : 'warning'}">
            ${data.score || 100}/100
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">Liens cassés</td><td>${broken.length}</td></tr>
            <tr><td class="label">Contenu mixte</td><td>${mixed.length}</td></tr>
          </table>
        </div>
      </div>
    `;
  },

  // Subdomain Enumeration
  'subdomain-enumeration': (data) => {
    if (!data || data.error) return '';
    const subdomains = data.subdomains || data.domains || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌍</span>
          <h3>Sous-domaines</h3>
          <span class="status-badge info">${subdomains.length} trouvé${subdomains.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${subdomains.length > 0 ? `
            <ul class="url-list">
              ${subdomains.slice(0, 8).map((s: any) => `<li>${escapeHtml(s.domain || s.name || s)}</li>`).join('')}
            </ul>
            ${subdomains.length > 8 ? `<p class="more">+ ${subdomains.length - 8} autres...</p>` : ''}
          ` : '<p class="empty">Aucun sous-domaine trouvé</p>'}
        </div>
      </div>
    `;
  },

  // Domain/Whois
  'domain': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📋</span>
          <h3>Informations Domaine</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.domain ? `<tr><td class="label">Domaine</td><td>${escapeHtml(data.domain)}</td></tr>` : ''}
            ${data.registrar ? `<tr><td class="label">Registrar</td><td>${escapeHtml(data.registrar)}</td></tr>` : ''}
            ${data.createdDate || data.created ? `<tr><td class="label">Créé le</td><td>${escapeHtml(data.createdDate || data.created)}</td></tr>` : ''}
            ${data.expiresDate || data.expires ? `<tr><td class="label">Expire le</td><td>${escapeHtml(data.expiresDate || data.expires)}</td></tr>` : ''}
            ${data.updatedDate || data.updated ? `<tr><td class="label">Mis à jour</td><td>${escapeHtml(data.updatedDate || data.updated)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Whois (alias)
  'whois': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📋</span>
          <h3>WHOIS</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.registrar?.name || data.registrar ? `<tr><td class="label">Registrar</td><td>${escapeHtml(data.registrar?.name || data.registrar)}</td></tr>` : ''}
            ${data.creationDate ? `<tr><td class="label">Créé</td><td>${escapeHtml(data.creationDate)}</td></tr>` : ''}
            ${data.expirationDate ? `<tr><td class="label">Expire</td><td>${escapeHtml(data.expirationDate)}</td></tr>` : ''}
            ${data.nameServers ? `<tr><td class="label">NS</td><td>${Array.isArray(data.nameServers) ? data.nameServers.slice(0, 2).join(', ') : escapeHtml(data.nameServers)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Subdomain Takeover
  'subdomain-takeover': (data) => {
    if (!data) return '';
    const isVulnerable = data.vulnerable || data.isVulnerable;
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🎯</span>
          <h3>Subdomain Takeover</h3>
          <span class="status-badge ${isVulnerable ? 'error' : 'success'}">${isVulnerable ? '⚠ Vulnérable' : '✓ Sécurisé'}</span>
        </div>
        <div class="plugin-content">
          <p>${data.status || data.message || (isVulnerable ? 'Risque de prise de contrôle détecté' : 'Aucun risque détecté')}</p>
        </div>
      </div>
    `;
  },

  // Trace Route
  'trace-route': (data) => {
    if (!data || data.error) return '';
    const hops = data.hops || data.result || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛤️</span>
          <h3>Traçage Route</h3>
          <span class="status-badge info">${hops.length} saut${hops.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${hops.length > 0 ? `
            <ul class="url-list">
              ${hops.slice(0, 6).map((h: any, i: number) => `<li>${i + 1}. ${escapeHtml(h.ip || h.host || h.address || h)} ${h.time ? `(${h.time}ms)` : ''}</li>`).join('')}
            </ul>
            ${hops.length > 6 ? `<p class="more">+ ${hops.length - 6} autres sauts...</p>` : ''}
          ` : '<p class="empty">Aucun résultat</p>'}
        </div>
      </div>
    `;
  },

  // Linked Pages
  'linked-pages': (data) => {
    if (!data || data.error) return '';
    const internal = data.internal || data.internalLinks || [];
    const external = data.external || data.externalLinks || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔗</span>
          <h3>Pages Liées</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">Liens internes</td><td>${internal.length || 0}</td></tr>
            <tr><td class="label">Liens externes</td><td>${external.length || 0}</td></tr>
          </table>
        </div>
      </div>
    `;
  },

  // Site Features
  'features': (data) => {
    if (!data || data.error) return '';
    const features = data.features || data.Technologies || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">✨</span>
          <h3>Fonctionnalités</h3>
          <span class="status-badge info">${features.length} détectée${features.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${features.length > 0 ? `
            <ul class="url-list">
              ${features.slice(0, 8).map((f: any) => `<li>${escapeHtml(f.Name || f.name || f)}</li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucune fonctionnalité détectée</p>'}
        </div>
      </div>
    `;
  },

  // Cookie Banner APDP
  'apdp-cookie-banner': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🍪</span>
          <h3>Bandeau Cookies APDP</h3>
          <span class="status-badge ${data.found || data.detected ? 'success' : 'warning'}">
            ${data.found || data.detected ? '✓ Présent' : '○ Non détecté'}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">Détecté</td><td>${data.found || data.detected ? '✓ Oui' : '✗ Non'}</td></tr>
            ${data.compliant !== undefined ? `<tr><td class="label">Conforme</td><td>${data.compliant ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
            ${data.score !== undefined ? `<tr><td class="label">Score</td><td>${data.score}/100</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Secrets Scanner
  'secrets': (data) => {
    if (!data || data.error) return '';
    const secrets = data.secrets || data.findings || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔑</span>
          <h3>Secrets & PII</h3>
          <span class="status-badge ${secrets.length === 0 ? 'success' : 'error'}">
            ${secrets.length === 0 ? '✓ Aucun' : `⚠ ${secrets.length} trouvé(s)`}
          </span>
        </div>
        <div class="plugin-content">
          ${secrets.length > 0 ? `
            <ul class="vuln-list">
              ${secrets.slice(0, 5).map((s: any) => `<li>⚠ ${escapeHtml(s.type || s.name || s)}</li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucun secret exposé détecté</p>'}
        </div>
      </div>
    `;
  },

  // Exposed Files
  'exposed-files': (data) => {
    if (!data || data.error) return '';
    const files = data.files || data.exposedFiles || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📂</span>
          <h3>Fichiers Exposés</h3>
          <span class="status-badge ${files.length === 0 ? 'success' : 'warning'}">
            ${files.length === 0 ? '✓ Aucun' : `${files.length} fichier(s)`}
          </span>
        </div>
        <div class="plugin-content">
          ${files.length > 0 ? `
            <ul class="url-list">
              ${files.slice(0, 6).map((f: any) => `<li>${escapeHtml(f.path || f.file || f)}</li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucun fichier sensible exposé</p>'}
        </div>
      </div>
    `;
  },

  // Headers
  'headers': (data) => {
    if (!data || data.error) return '';
    const headers = data.headers || {};
    const headerList = Object.entries(headers).slice(0, 8);
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📨</span>
          <h3>En-têtes HTTP</h3>
        </div>
        <div class="plugin-content">
          ${headerList.length > 0 ? `
            <table class="info-table">
              ${headerList.map(([k, v]) => `<tr><td class="label">${escapeHtml(k)}</td><td>${escapeHtml(String(v).substring(0, 50))}${String(v).length > 50 ? '...' : ''}</td></tr>`).join('')}
            </table>
          ` : '<p class="empty">Aucun en-tête</p>'}
        </div>
      </div>
    `;
  },

  // TXT Records
  'txt-records': (data) => {
    if (!data || data.error) return '';
    const records = data.records || data.txtRecords || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📝</span>
          <h3>Enregistrements TXT</h3>
          <span class="status-badge info">${records.length} enregistrement${records.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${records.length > 0 ? `
            <ul class="url-list">
              ${records.slice(0, 5).map((r: any) => `<li><code>${escapeHtml(String(r).substring(0, 60))}${String(r).length > 60 ? '...' : ''}</code></li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucun enregistrement TXT</p>'}
        </div>
      </div>
    `;
  },

  // Mail Config
  'mail-config': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📧</span>
          <h3>Configuration Email</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.hasMx !== undefined ? `<tr><td class="label">MX</td><td>${data.hasMx ? '✓ Présent' : '✗ Absent'}</td></tr>` : ''}
            ${data.spf !== undefined ? `<tr><td class="label">SPF</td><td>${data.spf ? '✓ Configuré' : '✗ Absent'}</td></tr>` : ''}
            ${data.dmarc !== undefined ? `<tr><td class="label">DMARC</td><td>${data.dmarc ? '✓ Configuré' : '✗ Absent'}</td></tr>` : ''}
            ${data.dkim !== undefined ? `<tr><td class="label">DKIM</td><td>${data.dkim ? '✓ Configuré' : '○ Non vérifié'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Archives
  'archives': (data) => {
    if (!data || data.error) return '';
    const archives = data.results || data.archives || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📚</span>
          <h3>Archives Web</h3>
          <span class="status-badge info">${archives.length} capture${archives.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${data.firstSeen || data.oldestCapture ? `<p>Première capture: ${escapeHtml(data.firstSeen || data.oldestCapture)}</p>` : ''}
          ${data.lastSeen || data.newestCapture ? `<p>Dernière capture: ${escapeHtml(data.lastSeen || data.newestCapture)}</p>` : ''}
          ${data.totalCaptures || archives.length ? `<p>Total: ${data.totalCaptures || archives.length} captures</p>` : ''}
        </div>
      </div>
    `;
  },

  // Rank
  'rank': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📊</span>
          <h3>Classement Global</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.rank ? `<tr><td class="label">Rang</td><td>#${data.rank.toLocaleString()}</td></tr>` : ''}
            ${data.isInList !== undefined ? `<tr><td class="label">Dans le top 1M</td><td>${data.isInList ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Ports
  'ports': (data) => {
    if (!data || data.error) return '';
    const ports = data.ports || data.openPorts || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🚪</span>
          <h3>Ports Ouverts</h3>
          <span class="status-badge info">${ports.length} port${ports.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${ports.length > 0 ? `
            <p>${ports.slice(0, 10).map((p: any) => `<code>${p.port || p}</code>`).join(', ')}</p>
          ` : '<p class="empty">Aucun port ouvert détecté</p>'}
        </div>
      </div>
    `;
  },

  // TLS
  'tls': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔐</span>
          <h3>Configuration TLS</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.tlsVersion || data.version ? `<tr><td class="label">Version</td><td>${escapeHtml(data.tlsVersion || data.version)}</td></tr>` : ''}
            ${data.cipherSuite ? `<tr><td class="label">Cipher</td><td>${escapeHtml(data.cipherSuite)}</td></tr>` : ''}
            ${data.grade ? `<tr><td class="label">Grade</td><td>${escapeHtml(data.grade)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Security.txt
  'security-txt': (data) => {
    if (!data) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Security.txt</h3>
          <span class="status-badge ${data.found || data.present ? 'success' : 'warning'}">
            ${data.found || data.present ? '✓ Présent' : '○ Absent'}
          </span>
        </div>
        <div class="plugin-content">
          ${data.found || data.present ? `
            <table class="info-table">
              ${data.contact ? `<tr><td class="label">Contact</td><td>${escapeHtml(data.contact)}</td></tr>` : ''}
              ${data.expires ? `<tr><td class="label">Expire</td><td>${escapeHtml(data.expires)}</td></tr>` : ''}
            </table>
          ` : '<p class="empty">Fichier security.txt non trouvé</p>'}
        </div>
      </div>
    `;
  },

  // DNS Server
  'dns-server': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌐</span>
          <h3>Serveur DNS</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.dns ? `<tr><td class="label">Serveur</td><td>${escapeHtml(data.dns)}</td></tr>` : ''}
            ${data.doh !== undefined ? `<tr><td class="label">DoH</td><td>${data.doh ? '✓ Supporté' : '✗ Non'}</td></tr>` : ''}
            ${data.dot !== undefined ? `<tr><td class="label">DoT</td><td>${data.dot ? '✓ Supporté' : '✗ Non'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Server Info
  'server-info': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🖥️</span>
          <h3>Informations Serveur</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.server ? `<tr><td class="label">Serveur</td><td>${escapeHtml(data.server)}</td></tr>` : ''}
            ${data.os ? `<tr><td class="label">OS</td><td>${escapeHtml(data.os)}</td></tr>` : ''}
            ${data.ip ? `<tr><td class="label">IP</td><td>${escapeHtml(data.ip)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Host Names
  'hosts': (data) => {
    if (!data || data.error) return '';
    const hosts = data.hostnames || data.hosts || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🏠</span>
          <h3>Noms d'Hôtes</h3>
          <span class="status-badge info">${hosts.length}</span>
        </div>
        <div class="plugin-content">
          ${hosts.length > 0 ? `
            <ul class="url-list">
              ${hosts.slice(0, 6).map((h: any) => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
          ` : '<p class="empty">Aucun nom d\'hôte</p>'}
        </div>
      </div>
    `;
  },

  // Lighthouse / Quality
  'lighthouse': (data) => {
    if (!data || data.error) return '';
    const categories = data.categories || {};
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">⚡</span>
          <h3>Performance & Qualité</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${categories.performance ? `<tr><td class="label">Performance</td><td>${Math.round((categories.performance.score || 0) * 100)}/100</td></tr>` : ''}
            ${categories.accessibility ? `<tr><td class="label">Accessibilité</td><td>${Math.round((categories.accessibility.score || 0) * 100)}/100</td></tr>` : ''}
            ${categories['best-practices'] ? `<tr><td class="label">Bonnes pratiques</td><td>${Math.round((categories['best-practices'].score || 0) * 100)}/100</td></tr>` : ''}
            ${categories.seo ? `<tr><td class="label">SEO</td><td>${Math.round((categories.seo.score || 0) * 100)}/100</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },
};

// Alias mappings for different key names
const keyAliases: Record<string, string> = {
  'dns-sec': 'dnssec',
  'carbon-footprint': 'carbon',
  'robots-txt': 'robots',
  'traceroute': 'trace-route',
  'host-names': 'hosts',
  'tls-cipher-suites': 'tls',
  'tls-security-config': 'tls',
  'tls-client-support': 'tls',
  'tls-handshake': 'tls',
  'quality': 'lighthouse',
};

/**
 * Generate full HTML report dynamically from all available results
 */
export const generateFullResultsHTML = (allResults: PluginResult, siteName: string): string => {
  const currentDate = formatDate(new Date());
  const logoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/assets/images/Logo-APDP.svg`
    : '/assets/images/Logo-APDP.svg';

  // Generate plugin cards dynamically
  const pluginCards: string[] = [];
  
  for (const [key, data] of Object.entries(allResults)) {
    if (!data || data.error || key === 'url') continue;
    
    // Check for custom renderer
    const rendererKey = keyAliases[key] || key;
    const renderer = pluginRenderers[rendererKey];
    
    if (renderer) {
      const html = renderer(data, key);
      if (html) pluginCards.push(html);
    }
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'Analyse - ${escapeHtml(siteName)}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: #f5f5f5;
    }
    
    .container { max-width: 210mm; margin: 0 auto; background: #fff; padding: 20mm; }
    
    @media print {
      body { background: #fff; }
      .container { max-width: 100%; padding: 0; }
      .plugin-card { break-inside: avoid; }
      .print-btn { display: none; }
    }
    
    .report-header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 20px; border-bottom: 3px solid #000; margin-bottom: 30px;
    }
    .logo { height: 60px; }
    .logo img { height: 100%; }
    .header-info { text-align: right; }
    .header-info h1 { font-size: 18pt; margin-bottom: 5px; }
    .header-info p { color: #666; font-size: 10pt; }
    
    .site-info {
      background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 20px; margin-bottom: 30px;
    }
    .site-info h2 { font-size: 14pt; margin-bottom: 10px; }
    .site-url { font-size: 12pt; color: #333; word-break: break-all; }
    .site-meta { display: flex; gap: 30px; margin-top: 10px; font-size: 9pt; color: #666; }
    
    .plugins-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .plugin-card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
      overflow: hidden; break-inside: avoid;
    }
    .plugin-card.wide { grid-column: span 2; }
    
    .plugin-header {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 15px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0;
    }
    .plugin-icon { font-size: 16pt; }
    .plugin-header h3 { flex: 1; font-size: 11pt; font-weight: 600; }
    
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 8pt; font-weight: 600; }
    .status-badge.success { background: #dcfce7; color: #166534; }
    .status-badge.error { background: #fee2e2; color: #991b1b; }
    .status-badge.warning { background: #fef3c7; color: #92400e; }
    .status-badge.info { background: #e0e7ff; color: #3730a3; }
    
    .plugin-content { padding: 15px; }
    
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 9pt; }
    .info-table td.label { font-weight: 600; width: 40%; color: #555; }
    
    .data-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
    .data-table th { background: #f8f9fa; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .data-table td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
    
    .tech-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .tech-item { background: #f8f9fa; padding: 8px 10px; border-radius: 6px; font-size: 9pt; }
    .tech-item strong { display: block; }
    .tech-item .version { color: #666; font-size: 8pt; }
    .tech-item .category { display: block; color: #888; font-size: 8pt; }
    
    .url-list, .resource-list, .rules-list, .redirect-list, .vuln-list { list-style: none; font-size: 9pt; }
    .url-list li, .resource-list li, .rules-list li, .redirect-list li, .vuln-list li {
      padding: 4px 0; border-bottom: 1px solid #f0f0f0;
    }
    
    .checklist { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .checklist span { padding: 4px 8px; border-radius: 4px; font-size: 8pt; background: #f5f5f5; }
    
    .check { color: #166534; }
    .cross { color: #991b1b; }
    .empty { color: #999; font-style: italic; font-size: 9pt; }
    .more { color: #666; font-size: 8pt; margin-top: 8px; }
    
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 8pt; }
    
    .report-footer {
      margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;
      text-align: center; font-size: 8pt; color: #666;
    }
    
    .print-btn {
      position: fixed; top: 20px; right: 20px;
      padding: 12px 24px; background: #dc2626; color: white;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000;
    }
    .print-btn:hover { background: #b91c1c; }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">💾 Enregistrer en PDF</button>
  
  <div class="container">
    <div class="report-header">
      <div class="logo"><img src="${logoUrl}" alt="APDP" /></div>
      <div class="header-info">
        <h1>Rapport d'Analyse de Sécurité</h1>
        <p>Généré le ${currentDate}</p>
      </div>
    </div>
    
    <div class="site-info">
      <h2>🔗 Site Analysé</h2>
      <div class="site-url">${escapeHtml(siteName)}</div>
      <div class="site-meta">
        <span>📅 ${currentDate}</span>
        <span>🛡️ Outil d'analyse de la sécurité APDP</span>
        <span>📊 ${pluginCards.length} modules analysés</span>
      </div>
    </div>
    
    <div class="plugins-grid">
      ${pluginCards.join('\n')}
    </div>
    
    <div class="report-footer">
      <p><strong>Rapport généré par l'Outil d'analyse de la sécurité APDP</strong></p>
      <p>Ce rapport est fourni à titre informatif. Pour plus d'informations : jetestemonsite.apdp.mc</p>
      <p>Autorité de Protection des Données Personnelles de Monaco • ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Open full results report in new window
 */
export const openFullResultsReport = (allResults: PluginResult, siteName: string): void => {
  const html = generateFullResultsHTML(allResults, siteName);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    throw new Error('Impossible d\'ouvrir une nouvelle fenêtre. Autorisez les pop-ups.');
  }
};

export default openFullResultsReport;
