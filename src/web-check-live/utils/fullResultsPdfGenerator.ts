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
  // RGPD Compliance - Comprehensive Analysis
  'rgpd-compliance': (data) => {
    if (!data || data.error) return '';
    
    const criticalCount = data.criticalIssues?.length || 0;
    const warningsCount = data.warnings?.length || 0;
    const improvementsCount = data.improvements?.length || 0;
    const compliantCount = data.compliantItems?.length || 0;
    const score = data.numericScore ?? data.overallScore ?? 'N/A';
    
    // Determine overall status
    let statusClass = 'success';
    let statusText = 'Conforme';
    if (criticalCount > 0) {
      statusClass = 'error';
      statusText = 'Non conforme';
    } else if (warningsCount > 0) {
      statusClass = 'warning';
      statusText = 'Partiellement conforme';
    }
    
    // Render issues
    const renderIssues = (issues: any[], title: string, cssClass: string) => {
      if (!issues || issues.length === 0) return '';
      return `
        <div class="issue-section ${cssClass}">
          <h4>${title} (${issues.length})</h4>
          <ul class="issue-list">
            ${issues.slice(0, 5).map((issue: any) => `
              <li>
                <strong>${escapeHtml(issue.title)}</strong>
                <p>${escapeHtml(issue.description)}</p>
                ${issue.recommendation ? `<p class="recommendation">→ ${escapeHtml(issue.recommendation)}</p>` : ''}
                ${issue.article ? `<span class="article">${escapeHtml(issue.article)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
          ${issues.length > 5 ? `<p class="more">+ ${issues.length - 5} autres...</p>` : ''}
        </div>
      `;
    };
    
    return `
      <div class="plugin-card wide rgpd-card">
        <div class="plugin-header">
          <span class="plugin-icon">⚖️</span>
          <h3>Analyse RGPD/APDP Complète</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="plugin-content">
          <div class="score-summary">
            <div class="score-box">
              <span class="score-value">${score}</span>
              <span class="score-label">Score</span>
            </div>
            <div class="counts-grid">
              <div class="count-item critical"><span>${criticalCount}</span>Critiques</div>
              <div class="count-item warning"><span>${warningsCount}</span>Avertissements</div>
              <div class="count-item improvement"><span>${improvementsCount}</span>Améliorations</div>
              <div class="count-item compliant"><span>${compliantCount}</span>Conformes</div>
            </div>
          </div>
          
          ${renderIssues(data.criticalIssues, '🚨 Analyses Critiques', 'critical')}
          ${renderIssues(data.warnings, '⚠️ Avertissements', 'warning')}
          ${renderIssues(data.improvements, '💡 Améliorations', 'improvement')}
          ${renderIssues(data.compliantItems, '✅ Points Conformes', 'compliant')}
          
          ${data.recommendations?.length > 0 ? `
            <div class="recommendations-section">
              <h4>📋 Recommandations Prioritaires</h4>
              ${data.recommendations.slice(0, 3).map((rec: any) => `
                <div class="recommendation-item">
                  <strong>${escapeHtml(rec.priority || rec.title || '')}</strong>
                  <p>${escapeHtml(rec.description || '')}</p>
                  ${rec.actions ? `<ul>${rec.actions.slice(0, 3).map((a: string) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.detailedAnalysis ? `
            <div class="detailed-analysis">
              <h4>📊 Analyse Détaillée</h4>
              <table class="info-table">
                ${data.detailedAnalysis.cookies ? `
                  <tr><td class="label">Cookies analysés</td><td>${data.detailedAnalysis.cookies.total || 0} (${data.detailedAnalysis.cookies.secure || 0} sécurisés)</td></tr>
                ` : ''}
                ${data.detailedAnalysis.securityHeaders ? `
                  <tr><td class="label">En-têtes de sécurité</td><td>${data.detailedAnalysis.securityHeaders.present || 0}/${data.detailedAnalysis.securityHeaders.total || 0}</td></tr>
                ` : ''}
                ${data.detailedAnalysis.thirdPartyServices ? `
                  <tr><td class="label">Services tiers</td><td>${data.detailedAnalysis.thirdPartyServices.count || 0}</td></tr>
                ` : ''}
              </table>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // IP Address
  'get-ip': (data) => {
    if (!data || data.error) return '';
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌐</span>
          <h3>Adresse IP</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.ip ? `<tr><td class="label">IP</td><td><code>${escapeHtml(data.ip)}</code></td></tr>` : ''}
            ${data.family ? `<tr><td class="label">Version</td><td>IPv${data.family}</td></tr>` : ''}
            ${data.hostname ? `<tr><td class="label">Hostname</td><td>${escapeHtml(data.hostname)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Quality Analysis (separate from Lighthouse)
  'quality': (data) => {
    if (!data || data.error) return '';
    const score = data.score || 0;
    const categories = data.categories || {};
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📈</span>
          <h3>Qualité du Site</h3>
          <span class="status-badge ${score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error'}">${score}/100</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${categories.performance ? `
              <tr>
                <td class="label">Performance</td>
                <td>${categories.performance.score}/100 ${categories.performance.issues?.length > 0 ? `<br><small>${categories.performance.issues.slice(0, 2).join(', ')}</small>` : ''}</td>
              </tr>
            ` : ''}
            ${categories.accessibility ? `
              <tr>
                <td class="label">Accessibilité</td>
                <td>${categories.accessibility.score}/100 ${categories.accessibility.issues?.length > 0 ? `<br><small>${categories.accessibility.issues.slice(0, 2).join(', ')}</small>` : ''}</td>
              </tr>
            ` : ''}
            ${categories.bestPractices ? `
              <tr>
                <td class="label">Bonnes Pratiques</td>
                <td>${categories.bestPractices.score}/100 ${categories.bestPractices.issues?.length > 0 ? `<br><small>${categories.bestPractices.issues.slice(0, 2).join(', ')}</small>` : ''}</td>
              </tr>
            ` : ''}
            ${categories.seo ? `
              <tr>
                <td class="label">SEO</td>
                <td>${categories.seo.score}/100 ${categories.seo.issues?.length > 0 ? `<br><small>${categories.seo.issues.slice(0, 2).join(', ')}</small>` : ''}</td>
              </tr>
            ` : ''}
          </table>
          ${data.suggestions?.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong>Suggestions:</strong>
              <ul style="font-size: 8pt; margin: 5px 0; padding-left: 15px;">
                ${data.suggestions.slice(0, 4).map((s: string) => `<li>${escapeHtml(s)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // SSL Certificate
  'ssl': (data) => {
    if (!data || data.error) return '';
    const subject = data.subject?.CN || data.subject?.O || data.commonName || data.subjectCN || 
                   (typeof data.subject === 'string' ? data.subject : '');
    const issuer = data.issuer?.O || data.issuer?.CN || 
                  (typeof data.issuer === 'string' ? data.issuer : '');
    const validTo = data.valid_to || data.validTo || data.expiresAt || data.notAfter;
    const validFrom = data.valid_from || data.validFrom || data.issuedAt || data.notBefore;
    
    // Check if certificate is valid by checking expiry date
    let isValid = data.valid || data.validCertificate;
    if (isValid === undefined && validTo) {
      try {
        isValid = new Date(validTo) > new Date();
      } catch { isValid = false; }
    }
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Certificat SSL</h3>
          <span class="status-badge ${isValid ? 'success' : 'error'}">
            ${isValid ? '✓ Valide' : '✗ Invalide'}
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
    // Handle various cookie data structures
    const clientCookies = data.clientCookies || data.cookies || [];
    const headerCookies = data.headerCookies || data.serverCookies || [];
    const total = data.analysis?.totalCount || data.summary?.total || (clientCookies.length + headerCookies.length);
    const allCookies = [...clientCookies, ...headerCookies];
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🍪</span>
          <h3>Cookies</h3>
          <span class="status-badge info">${total} cookie${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${allCookies.length > 0 ? `
            <table class="data-table">
              <thead><tr><th>Nom</th><th>Type</th><th>Sécurisé</th></tr></thead>
              <tbody>
                ${allCookies.slice(0, 10).map((c: any) => `
                  <tr>
                    <td>${escapeHtml(c.name)}</td>
                    <td>${escapeHtml(c.categories?.[0] || c.category || c.type || 'autre')}</td>
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
    // Check if records are actually found (handle object structure with isFound property)
    const dnskeyFound = data.DNSKEY?.isFound === true || data.dnskey === true;
    const dsFound = data.DS?.isFound === true || data.ds === true;
    const rrsigFound = data.RRSIG?.isFound === true || data.rrsig === true;
    const enabled = data.enabled || data.isValid || data.secure || (dnskeyFound && dsFound && rrsigFound);
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔐</span>
          <h3>DNSSEC</h3>
          <span class="status-badge ${enabled ? 'success' : 'warning'}">${enabled ? '✓ Activé' : '○ Non activé'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">DNSKEY</td><td>${dnskeyFound ? '✓ Présent' : '✗ Absent'}</td></tr>
            <tr><td class="label">DS</td><td>${dsFound ? '✓ Présent' : '✗ Absent'}</td></tr>
            <tr><td class="label">RRSIG</td><td>${rrsigFound ? '✓ Présent' : '✗ Absent'}</td></tr>
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
    // Handle various sitemap structures
    let urls = data.urls || data.pages || data.entries || [];
    // Handle urlset.url structure (from XML sitemap parsing)
    if (!urls.length && data.urlset?.url) {
      urls = data.urlset.url;
    }
    
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
                // Handle various URL structures: string, {url}, {loc: ['url']}, etc
                let url = '';
                if (typeof u === 'string') url = u;
                else if (u.url) url = u.url;
                else if (u.loc && Array.isArray(u.loc)) url = u.loc[0];
                else if (u.loc) url = u.loc;
                return `<li>${escapeHtml(url.replace(/^https?:\/\/[^/]+/, '') || '/')}</li>`;
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
    // Handle various robots.txt data structures
    let rules = data.robots || data.rules || [];
    // If data itself is an array of rules
    if (Array.isArray(data) && data.length > 0 && (data[0].lbl || data[0].val)) {
      rules = data;
    }
    const hasRobots = rules.length > 0 || (data.found === true);
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🤖</span>
          <h3>Robots.txt</h3>
          <span class="status-badge ${hasRobots ? 'success' : 'warning'}">${hasRobots ? '✓ Présent' : '○ Absent'}</span>
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
    const totalHops = data.totalHops || hops.length;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛤️</span>
          <h3>Traçage Route</h3>
          <span class="status-badge info">${totalHops} saut${totalHops !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${hops.length > 0 ? `
            <ul class="url-list">
              ${hops.slice(0, 6).map((h: any) => {
                const hopNum = h.hop || '';
                const ip = h.ip || h.host || h.hostname || h.address || '';
                return `<li>${hopNum}. ${escapeHtml(ip)}</li>`;
              }).join('')}
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
    // Handle various feature structures
    const features = data.technologies || data.features || data.Technologies || [];
    const count = data.summary?.totalDetected || features.length;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">✨</span>
          <h3>Fonctionnalités</h3>
          <span class="status-badge info">${count} détectée${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${features.length > 0 ? `
            <ul class="url-list">
              ${features.slice(0, 8).map((f: any) => `<li>${escapeHtml(f.name || f.Name || f)}</li>`).join('')}
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

  // TLS General
  'tls': (data) => {
    if (!data || data.error) return '';
    
    // Handle different TLS data structures
    const version = data.tlsVersion || data.version || data.protocol || '';
    const cipher = data.cipherSuite || data.cipher || '';
    const grade = data.grade || data.rating || '';
    const supported = data.protocols || data.supportedProtocols || [];
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔐</span>
          <h3>Configuration TLS</h3>
          ${grade ? `<span class="status-badge ${grade === 'A' || grade === 'A+' ? 'success' : 'warning'}">${grade}</span>` : ''}
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${version ? `<tr><td class="label">Version</td><td>${escapeHtml(version)}</td></tr>` : ''}
            ${cipher ? `<tr><td class="label">Cipher Suite</td><td><code>${escapeHtml(cipher)}</code></td></tr>` : ''}
            ${supported.length > 0 ? `<tr><td class="label">Protocoles</td><td>${supported.slice(0, 4).map((p: any) => escapeHtml(p.protocol || p)).join(', ')}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // TLS Cipher Suites
  'tls-cipher-suites': (data) => {
    if (!data || data.error) return '';
    
    const ciphers = data.ciphers || data.cipherSuites || [];
    const weak = ciphers.filter((c: any) => c.weak || c.insecure);
    const strong = ciphers.filter((c: any) => !c.weak && !c.insecure);
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Suites de Chiffrement TLS</h3>
          <span class="status-badge ${weak.length === 0 ? 'success' : 'warning'}">
            ${weak.length === 0 ? '✓ Sécurisé' : `⚠ ${weak.length} faible(s)`}
          </span>
        </div>
        <div class="plugin-content">
          ${ciphers.length > 0 ? `
            <table class="info-table">
              <tr><td class="label">Total</td><td>${ciphers.length} suites</td></tr>
              <tr><td class="label">Fortes</td><td>${strong.length}</td></tr>
              <tr><td class="label">Faibles</td><td>${weak.length}</td></tr>
            </table>
            ${weak.length > 0 ? `
              <p style="color: #991b1b; font-size: 8pt; margin-top: 8px;">
                ⚠ Suites faibles: ${weak.slice(0, 3).map((c: any) => escapeHtml(c.name || c.cipher || c)).join(', ')}
              </p>
            ` : ''}
          ` : '<p class="empty">Aucune suite de chiffrement analysée</p>'}
        </div>
      </div>
    `;
  },

  // TLS Security Config
  'tls-security-config': (data) => {
    if (!data || data.error) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛡️</span>
          <h3>Configuration Sécurité TLS</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.grade ? `<tr><td class="label">Grade</td><td><strong>${escapeHtml(data.grade)}</strong></td></tr>` : ''}
            ${data.forwardSecrecy !== undefined ? `<tr><td class="label">Forward Secrecy</td><td>${data.forwardSecrecy ? '✓ Activé' : '✗ Non'}</td></tr>` : ''}
            ${data.heartbleed !== undefined ? `<tr><td class="label">Heartbleed</td><td>${!data.heartbleed ? '✓ Protégé' : '⚠ Vulnérable'}</td></tr>` : ''}
            ${data.poodle !== undefined ? `<tr><td class="label">POODLE</td><td>${!data.poodle ? '✓ Protégé' : '⚠ Vulnérable'}</td></tr>` : ''}
            ${data.beast !== undefined ? `<tr><td class="label">BEAST</td><td>${!data.beast ? '✓ Protégé' : '⚠ Vulnérable'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // TLS Client Support
  'tls-client-support': (data) => {
    if (!data || data.error) return '';
    
    const clients = data.clients || data.supportedClients || data.compatibility || [];
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">💻</span>
          <h3>Compatibilité TLS Clients</h3>
        </div>
        <div class="plugin-content">
          ${clients.length > 0 ? `
            <table class="info-table">
              ${clients.slice(0, 6).map((c: any) => `
                <tr>
                  <td class="label">${escapeHtml(c.name || c.client || c)}</td>
                  <td>${c.supported !== false ? '✓ Compatible' : '✗ Non compatible'}</td>
                </tr>
              `).join('')}
            </table>
          ` : '<p class="empty">Données de compatibilité non disponibles</p>'}
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
  'robots': 'robots',
  'traceroute': 'trace-route',
  'host-names': 'hosts',
  'hostNames': 'hosts',
  'tls-handshake': 'tls',
  'server-info': 'server-info',
  'serverInfo': 'server-info',
  'subdomainTakeover': 'subdomain-takeover',
  'subdomainEnumeration': 'subdomain-enumeration',
  'linkedPages': 'linked-pages',
  'linkAudit': 'link-audit',
  'socialTags': 'social-tags',
  'blockLists': 'block-lists',
  'carbonFootprint': 'carbon',
  'cdnResources': 'cdn-resources',
  'httpSecurity': 'http-security',
  'techStack': 'tech-stack',
  'rgpdCompliance': 'rgpd-compliance',
  'getIp': 'get-ip',
  'ip': 'get-ip',
  'robotsTxt': 'robots',
};

/**
 * Generic fallback renderer for plugins without specific renderers
 * Shows all data in a readable format
 */
const genericPluginRenderer = (data: any, key: string): string => {
  if (!data || data.error) return '';
  
  // Skip if data is just a primitive
  if (typeof data !== 'object') return '';
  
  // Get plugin display name
  const displayName = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Function to render value
  const renderValue = (value: any, depth = 0): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? '✓ Oui' : '✗ Non';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      if (value.length > 100) return escapeHtml(value.substring(0, 100)) + '...';
      return escapeHtml(value);
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Aucun';
      return value.slice(0, 5).map(v => {
        if (typeof v === 'object' && v !== null) {
          return escapeHtml(v.name || v.value || v.url || JSON.stringify(v).substring(0, 50));
        }
        return escapeHtml(String(v));
      }).join(', ') + (value.length > 5 ? ` (+${value.length - 5})` : '');
    }
    if (typeof value === 'object' && depth < 1) {
      const entries = Object.entries(value).slice(0, 5);
      return entries.map(([k, v]) => `${k}: ${renderValue(v, depth + 1)}`).join(', ');
    }
    return '';
  };
  
  // Get important fields to display
  const importantFields = Object.entries(data)
    .filter(([k, v]) => 
      v !== null && 
      v !== undefined && 
      k !== 'error' && 
      k !== 'statusCode' &&
      k !== 'timestamp' &&
      typeof v !== 'function'
    )
    .slice(0, 10);
  
  if (importantFields.length === 0) return '';
  
  return `
    <div class="plugin-card">
      <div class="plugin-header">
        <span class="plugin-icon">📋</span>
        <h3>${displayName}</h3>
      </div>
      <div class="plugin-content">
        <table class="info-table">
          ${importantFields.map(([k, v]) => `
            <tr>
              <td class="label">${escapeHtml(k.replace(/([A-Z])/g, ' $1').trim())}</td>
              <td>${renderValue(v)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  `;
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
  const processedPlugins: string[] = [];
  
  // Priority order - RGPD compliance first, then other important plugins
  const priorityOrder = [
    'rgpd-compliance',
    'ssl',
    'tls',
    'tls-cipher-suites',
    'tls-security-config',
    'tls-client-support',
    'http-security',
    'cookies',
    'apdp-cookie-banner',
    'apdp-privacy-policy',
    'apdp-legal-notices',
    'quality',
    'lighthouse',
    'tech-stack',
    'dns',
    'dnssec',
    'hsts',
    'threats',
    'vulnerabilities',
    'secrets',
    'exposed-files',
    'get-ip',
    'location',
    'domain',
    'firewall',
    'headers',
    'security-txt',
    'mail-config',
    'cdn-resources',
    'carbon',
    'link-audit',
    'sitemap',
    'robots-txt',
    'redirects',
    'status',
    'block-lists',
    'subdomain-enumeration',
    'subdomain-takeover',
    'trace-route',
    'ports',
    'archives',
    'rank',
    'social-tags',
    'linked-pages',
    'txt-records',
    'dns-server',
    'hosts',
    'server-info'
  ];
  
  // Process plugins in priority order first
  for (const key of priorityOrder) {
    if (!allResults[key] || allResults[key].error) continue;
    
    const rendererKey = keyAliases[key] || key;
    const renderer = pluginRenderers[rendererKey];
    
    if (renderer) {
      const html = renderer(allResults[key], key);
      if (html) {
        pluginCards.push(html);
        processedPlugins.push(key);
      }
    }
  }
  
  // Process remaining plugins
  for (const [key, data] of Object.entries(allResults)) {
    if (!data || data.error || key === 'url' || processedPlugins.includes(key)) continue;
    
    // Check for custom renderer
    const rendererKey = keyAliases[key] || key;
    const renderer = pluginRenderers[rendererKey];
    
    if (renderer) {
      const html = renderer(data, key);
      if (html) {
        pluginCards.push(html);
        processedPlugins.push(key);
      }
    } else {
      // Use generic fallback renderer for unknown plugins
      const html = genericPluginRenderer(data, key);
      if (html) {
        pluginCards.push(html);
        processedPlugins.push(key);
      }
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
    
    /* RGPD Compliance Card Styles */
    .rgpd-card { border: 2px solid #dc2626; }
    .rgpd-card .plugin-header { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
    
    .score-summary { display: flex; align-items: center; gap: 20px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
    .score-box { 
      text-align: center; padding: 15px 25px; 
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
      border-radius: 8px; color: white; 
    }
    .score-value { font-size: 24pt; font-weight: 700; display: block; }
    .score-label { font-size: 9pt; opacity: 0.9; }
    
    .counts-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex: 1; }
    .count-item { text-align: center; padding: 10px; border-radius: 6px; font-size: 8pt; }
    .count-item span { display: block; font-size: 16pt; font-weight: 700; }
    .count-item.critical { background: #fee2e2; color: #991b1b; }
    .count-item.warning { background: #fef3c7; color: #92400e; }
    .count-item.improvement { background: #e0f2fe; color: #0369a1; }
    .count-item.compliant { background: #dcfce7; color: #166534; }
    
    .issue-section { margin-top: 15px; padding: 12px; border-radius: 6px; }
    .issue-section.critical { background: #fef2f2; border-left: 4px solid #dc2626; }
    .issue-section.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
    .issue-section.improvement { background: #f0f9ff; border-left: 4px solid #0284c7; }
    .issue-section.compliant { background: #f0fdf4; border-left: 4px solid #16a34a; }
    .issue-section h4 { font-size: 10pt; margin-bottom: 8px; }
    .issue-list { list-style: none; font-size: 9pt; }
    .issue-list li { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .issue-list li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .issue-list strong { display: block; margin-bottom: 3px; }
    .issue-list p { margin: 0; color: #666; line-height: 1.4; }
    .issue-list .recommendation { color: #0369a1; font-style: italic; margin-top: 4px; }
    .issue-list .article { display: inline-block; margin-top: 4px; font-size: 8pt; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; }
    
    .recommendations-section { margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 6px; }
    .recommendations-section h4 { font-size: 10pt; margin-bottom: 10px; }
    .recommendation-item { margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0; }
    .recommendation-item strong { color: #1e40af; }
    .recommendation-item ul { margin: 5px 0 0 0; padding-left: 15px; font-size: 8pt; }
    
    .detailed-analysis { margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 6px; }
    .detailed-analysis h4 { font-size: 10pt; margin-bottom: 8px; }
    
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
        <span>📊 ${processedPlugins.length} modules analysés</span>
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
