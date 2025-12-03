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
    
    // Render issues - show up to 10 items
    const renderIssues = (issues: any[], title: string, cssClass: string) => {
      if (!issues || issues.length === 0) return '';
      return `
        <div class="issue-section ${cssClass}">
          <h4>${title} (${issues.length})</h4>
          <ul class="issue-list">
            ${issues.slice(0, 10).map((issue: any) => `
              <li>
                <strong>${escapeHtml(issue.title)}</strong>
                <p>${escapeHtml(issue.description)}</p>
                ${issue.recommendation ? `<p class="recommendation">→ ${escapeHtml(issue.recommendation)}</p>` : ''}
                ${issue.article ? `<span class="article">${escapeHtml(issue.article)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
          ${issues.length > 10 ? `<p class="more">+ ${issues.length - 10} autres...</p>` : ''}
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

  // Enhanced Compliance Summary - Main dashboard summary
  'enhanced-compliance-summary': (data) => {
    if (!data) return '';
    
    const score = data.overallScore || data.score || 'N/A';
    const criticalCount = data.criticalIssues || 0;
    const warningsCount = data.warnings || 0;
    const improvementsCount = data.improvements || 0;
    const compliantCount = data.compliantItems || 0;
    
    // Determine status class based on score
    let statusClass = 'success';
    let statusText = 'Excellent';
    if (score === 'F' || score === 'D' || criticalCount > 0) {
      statusClass = 'error';
      statusText = 'Critique';
    } else if (score === 'C' || warningsCount > 2) {
      statusClass = 'warning';
      statusText = 'À améliorer';
    } else if (score === 'B') {
      statusClass = 'info';
      statusText = 'Bon';
    }
    
    return `
      <div class="plugin-card wide rgpd-card">
        <div class="plugin-header">
          <span class="plugin-icon">📊</span>
          <h3>Résumé de Conformité</h3>
          <span class="status-badge ${statusClass}">${score} - ${statusText}</span>
        </div>
        <div class="plugin-content">
          <div class="score-summary">
            <div class="score-box">
              <span class="score-value">${score}</span>
              <span class="score-label">Score Global</span>
            </div>
            <div class="counts-grid">
              <div class="count-item critical"><span>${criticalCount}</span>Critiques</div>
              <div class="count-item warning"><span>${warningsCount}</span>Avertissements</div>
              <div class="count-item improvement"><span>${improvementsCount}</span>Améliorations</div>
              <div class="count-item compliant"><span>${compliantCount}</span>Conformes</div>
            </div>
          </div>
          
          <table class="info-table">
            ${data.url ? `<tr><td class="label">URL analysée</td><td>${escapeHtml(data.url)}</td></tr>` : ''}
            ${data.timestamp ? `<tr><td class="label">Date d'analyse</td><td>${new Date(data.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>` : ''}
          </table>
          
          ${data.error ? `
            <p style="margin-top: 10px; color: #b45309; font-size: 9pt; padding: 8px; background: #fef3c7; border-radius: 4px;">
              ⚠️ ${escapeHtml(data.error)}
            </p>
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
    const issuerOrg = data.issuer?.O || '';
    const issuerCN = data.issuer?.CN || '';
    const issuerCountry = data.issuer?.C || '';
    const validTo = data.valid_to || data.validTo || data.expiresAt || data.notAfter;
    const validFrom = data.valid_from || data.validFrom || data.issuedAt || data.notBefore;
    
    // Parse Subject Alternative Names
    const sanString = data.subjectaltname || '';
    const sans = sanString.split(',').map((s: string) => s.trim().replace('DNS:', '')).filter(Boolean);
    
    // Check if certificate is valid by checking expiry date
    let isValid = data.valid || data.validCertificate;
    let daysRemaining = 0;
    if (validTo) {
      try {
        const expiryDate = new Date(validTo);
        isValid = expiryDate > new Date();
        daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      } catch { isValid = false; }
    }
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Certificat SSL/TLS</h3>
          <span class="status-badge ${isValid ? (daysRemaining < 30 ? 'warning' : 'success') : 'error'}">
            ${isValid ? (daysRemaining < 30 ? `⚠ Expire dans ${daysRemaining}j` : '✓ Valide') : '✗ Invalide'}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${subject ? `<tr><td class="label">Sujet (CN)</td><td><strong>${escapeHtml(subject)}</strong></td></tr>` : ''}
            ${issuerOrg || issuerCN ? `<tr><td class="label">Émetteur</td><td>${escapeHtml(issuerOrg || issuerCN)} ${issuerCountry ? `(${issuerCountry})` : ''}</td></tr>` : ''}
            ${validFrom ? `<tr><td class="label">Émis le</td><td>${escapeHtml(validFrom)}</td></tr>` : ''}
            ${validTo ? `<tr><td class="label">Expire le</td><td>${escapeHtml(validTo)} ${daysRemaining > 0 ? `(${daysRemaining} jours)` : ''}</td></tr>` : ''}
            ${data.bits ? `<tr><td class="label">Taille de clé</td><td>${data.bits} bits</td></tr>` : ''}
            ${data.ca !== undefined ? `<tr><td class="label">Autorité de cert.</td><td>${data.ca ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
            ${data.fingerprint ? `<tr><td class="label">Empreinte SHA1</td><td><code style="font-size: 7pt;">${escapeHtml(data.fingerprint)}</code></td></tr>` : ''}
            ${data.fingerprint256 ? `<tr><td class="label">Empreinte SHA256</td><td><code style="font-size: 7pt;">${escapeHtml(data.fingerprint256.substring(0, 40))}...</code></td></tr>` : ''}
            ${data.serialNumber ? `<tr><td class="label">N° de série</td><td><code style="font-size: 7pt;">${escapeHtml(data.serialNumber)}</code></td></tr>` : ''}
          </table>
          
          ${sans.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin: 10px 0 5px 0;">Noms alternatifs (SAN): ${sans.length}</p>
            <p style="font-size: 8pt;">
              ${sans.slice(0, 10).map((s: string) => `<code>${escapeHtml(s)}</code>`).join(', ')}
              ${sans.length > 10 ? ` +${sans.length - 10} autres` : ''}
            </p>
          ` : ''}
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
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🍪</span>
          <h3>Cookies</h3>
          <span class="status-badge info">${total} cookie${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${allCookies.length > 0 ? `
            <table class="data-table">
              <thead><tr><th>Nom</th><th>Type</th><th>Sécurisé</th><th>HttpOnly</th><th>SameSite</th></tr></thead>
              <tbody>
                ${allCookies.slice(0, 20).map((c: any) => `
                  <tr>
                    <td>${escapeHtml(c.name)}</td>
                    <td>${escapeHtml(c.categories?.[0] || c.category || c.type || 'autre')}</td>
                    <td>${c.secure ? '✓' : '✗'}</td>
                    <td>${c.httpOnly ? '✓' : '✗'}</td>
                    <td>${escapeHtml(c.sameSite || '-')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${total > 20 ? `<p class="more">+ ${total - 20} autres...</p>` : ''}
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
    
    const extractRecords = (records: any, limit = 10): string => {
      if (!records) return '';
      if (Array.isArray(records)) {
        const items = records.slice(0, limit).map(r => {
          if (typeof r === 'string') return r;
          return r?.address || r?.value || r?.exchange || r?.data || r?.target || '';
        }).filter(Boolean);
        const result = items.join(', ');
        return records.length > limit ? result + ` (+${records.length - limit})` : result;
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
            ${data.TXT ? `<tr><td class="label">TXT</td><td>${extractRecords(data.TXT, 5)}</td></tr>` : ''}
            ${data.CNAME ? `<tr><td class="label">CNAME</td><td>${extractRecords(data.CNAME)}</td></tr>` : ''}
            ${data.SRV ? `<tr><td class="label">SOA</td><td>${data.SRV.nsname || ''} (${data.SRV.hostmaster || ''})</td></tr>` : ''}
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
    const coords = data.coords || {};
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📍</span>
          <h3>Localisation Serveur</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.city ? `<tr><td class="label">Ville</td><td><strong>${escapeHtml(data.city)}</strong></td></tr>` : ''}
            ${data.region ? `<tr><td class="label">Région</td><td>${escapeHtml(data.region)} ${data.regionCode ? `(${data.regionCode})` : ''}</td></tr>` : ''}
            ${data.country ? `<tr><td class="label">Pays</td><td>${escapeHtml(data.country)} ${data.countryCode ? `(${data.countryCode})` : ''}</td></tr>` : ''}
            ${data.postCode ? `<tr><td class="label">Code postal</td><td>${escapeHtml(data.postCode)}</td></tr>` : ''}
            ${data.isp ? `<tr><td class="label">FAI/Hébergeur</td><td>${escapeHtml(data.isp)}</td></tr>` : ''}
            ${data.timezone ? `<tr><td class="label">Fuseau horaire</td><td>${escapeHtml(data.timezone)}</td></tr>` : ''}
            ${data.languages ? `<tr><td class="label">Langues</td><td>${escapeHtml(data.languages)}</td></tr>` : ''}
            ${data.currency ? `<tr><td class="label">Monnaie</td><td>${escapeHtml(data.currency)} (${data.currencyCode || ''})</td></tr>` : ''}
            ${coords.latitude && coords.longitude ? `<tr><td class="label">Coordonnées</td><td>${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}</td></tr>` : ''}
            ${data.countryDomain ? `<tr><td class="label">Domaine pays</td><td>${escapeHtml(data.countryDomain)}</td></tr>` : ''}
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
  // Threats - Only show if threats are detected
  'threats': (data) => {
    if (!data) return '';
    const hasThreats = data.urlhaus || data.phishing || data.malware;
    // Skip if no threats detected
    if (!hasThreats) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛡️</span>
          <h3>Menaces Détectées</h3>
          <span class="status-badge error">⚠ Attention</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.phishing ? `<tr><td class="label">Phishing</td><td style="color: #991b1b;">⚠ Détecté</td></tr>` : ''}
            ${data.malware ? `<tr><td class="label">Malware</td><td style="color: #991b1b;">⚠ Détecté</td></tr>` : ''}
            ${data.urlhaus ? `<tr><td class="label">URLHaus</td><td style="color: #991b1b;">⚠ Listé</td></tr>` : ''}
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
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🗺️</span>
          <h3>Plan du Site</h3>
          <span class="status-badge info">${urls.length} page${urls.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${urls.length > 0 ? `
            <ul class="url-list">
              ${urls.slice(0, 25).map((u: any) => {
                // Handle various URL structures: string, {url}, {loc: ['url']}, etc
                let url = '';
                if (typeof u === 'string') url = u;
                else if (u.url) url = u.url;
                else if (u.loc && Array.isArray(u.loc)) url = u.loc[0];
                else if (u.loc) url = u.loc;
                return `<li>${escapeHtml(url.replace(/^https?:\/\/[^/]+/, '') || '/')}</li>`;
              }).join('')}
            </ul>
            ${urls.length > 25 ? `<p class="more">+ ${urls.length - 25} autres...</p>` : ''}
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
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🚫</span>
          <h3>Listes de Blocage (${lists.length} testées)</h3>
          <span class="status-badge ${blocked.length === 0 ? 'success' : 'error'}">
            ${blocked.length === 0 ? '✓ Non bloqué' : `⚠ ${blocked.length} liste(s)`}
          </span>
        </div>
        <div class="plugin-content">
          <table class="data-table">
            <thead><tr><th>Service DNS</th><th>IP</th><th>Statut</th></tr></thead>
            <tbody>
            ${lists.map((l: any) => `
              <tr>
                <td>${escapeHtml(l.name || l.server || l.list)}</td>
                <td><code>${escapeHtml(l.serverIp || l.ip || '-')}</code></td>
                <td><span class="${l.blocked || l.isBlocked ? 'cross' : 'check'}">${l.blocked || l.isBlocked ? '⚠ Bloqué' : '✓ OK'}</span></td>
              </tr>
            `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Carbon Footprint
  'carbon': (data) => {
    if (!data || data.error) return '';
    const stats = data.statistics || {};
    const co2Grid = stats.co2?.grid || data.co2?.grid || {};
    const co2Renewable = stats.co2?.renewable || data.co2?.renewable || {};
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🌱</span>
          <h3>Empreinte Carbone</h3>
          <span class="status-badge ${data.rating === 'A' || data.rating === 'A+' ? 'success' : 'info'}">${data.rating || 'N/A'}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.gco2e !== undefined ? `<tr><td class="label">CO2 par visite</td><td><strong>${typeof data.gco2e === 'number' ? data.gco2e.toFixed(4) : data.gco2e} g</strong></td></tr>` : ''}
            ${co2Grid.grams !== undefined ? `<tr><td class="label">CO2 (réseau)</td><td>${co2Grid.grams.toFixed(4)} g</td></tr>` : ''}
            ${co2Renewable.grams !== undefined ? `<tr><td class="label">CO2 (renouvelable)</td><td>${co2Renewable.grams.toFixed(4)} g</td></tr>` : ''}
            ${stats.energy !== undefined ? `<tr><td class="label">Énergie</td><td>${stats.energy.toFixed(6)} KWh</td></tr>` : ''}
            ${stats.adjustedBytes !== undefined ? `<tr><td class="label">Données ajustées</td><td>${(stats.adjustedBytes / 1024).toFixed(1)} KB</td></tr>` : ''}
            ${data.bytes !== undefined ? `<tr><td class="label">Taille page</td><td>${(data.bytes / 1024).toFixed(1)} KB</td></tr>` : ''}
            ${data.cleanerThan !== undefined ? `<tr><td class="label">Plus propre que</td><td><strong>${Math.round(data.cleanerThan * 100)}%</strong> des sites</td></tr>` : ''}
            ${data.green !== undefined ? `<tr><td class="label">Hébergement vert</td><td>${data.green ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // CDN Resources - Skip if no external resources
  'cdn-resources': (data) => {
    if (!data || data.error) return '';
    const resources = data.externalResources || data.resources || [];
    const cdnProviders = data.cdnProviders || [];
    const summary = data.summary || {};
    
    // Skip if no external resources
    if (resources.length === 0) return '';
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📦</span>
          <h3>Ressources CDN & Externes</h3>
          <span class="status-badge info">${data.totalResources || resources.length} ressource${(data.totalResources || resources.length) !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            <tr><td class="label">Domaines externes</td><td>${summary.externalDomains || resources.length}</td></tr>
            <tr><td class="label">CDN détectés</td><td>${summary.cdnCount || cdnProviders.length || 0}</td></tr>
            ${summary.insecureResources ? `<tr><td class="label">Ressources non sécurisées</td><td style="color: #991b1b;">${summary.insecureResources}</td></tr>` : ''}
          </table>
          <table class="data-table">
            <thead><tr><th>Domaine</th><th>Type</th><th>Sécurisé</th></tr></thead>
            <tbody>
            ${resources.slice(0, 15).map((r: any) => `
              <tr>
                <td>${escapeHtml(r.domain || r.url || r.host || r)}</td>
                <td>${escapeHtml(r.type || '-')}</td>
                <td>${r.isSecure !== false ? '✓' : '✗'}</td>
              </tr>
            `).join('')}
            </tbody>
          </table>
          ${resources.length > 15 ? `<p class="more">+ ${resources.length - 15} autres...</p>` : ''}
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
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🤖</span>
          <h3>Robots.txt (${rules.length} règles)</h3>
          <span class="status-badge ${hasRobots ? 'success' : 'warning'}">${hasRobots ? '✓ Présent' : '○ Absent'}</span>
        </div>
        <div class="plugin-content">
          ${rules.length > 0 ? `
            <table class="data-table">
              <thead><tr><th>Directive</th><th>Valeur</th></tr></thead>
              <tbody>
              ${rules.slice(0, 30).map((r: any) => `
                <tr>
                  <td><code>${escapeHtml(r.lbl || r.directive || r.field || '')}</code></td>
                  <td>${escapeHtml(r.val || r.value || '')}</td>
                </tr>
              `).join('')}
              </tbody>
            </table>
            ${rules.length > 30 ? `<p class="more">+ ${rules.length - 30} autres règles...</p>` : ''}
          ` : '<p class="empty">Aucune règle</p>'}
        </div>
      </div>
    `;
  },

  // Redirects - Skip if no redirects
  'redirects': (data) => {
    if (!data) return '';
    const chain = data.redirects || data.chain || [];
    // Skip if no redirects or only 1 (no actual redirect happened)
    if (chain.length <= 1) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">↪️</span>
          <h3>Redirections</h3>
          <span class="status-badge ${chain.length <= 2 ? 'success' : 'warning'}">${chain.length} redirection${chain.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <ul class="redirect-list">
            ${chain.map((r: any, i: number) => {
              const url = typeof r === 'string' ? r : (r.url || r.to || '');
              return `<li>${i === 0 ? '🔗' : '→'} ${escapeHtml(url)}</li>`;
            }).join('')}
          </ul>
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
  // Firewall - Only show if WAF is detected
  'firewall': (data) => {
    if (!data) return '';
    const hasWaf = data.detected || data.hasWaf;
    // Skip if no WAF detected
    if (!hasWaf) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔥</span>
          <h3>Pare-feu / WAF</h3>
          <span class="status-badge success">✓ Détecté</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.name || data.waf ? `<tr><td class="label">Type</td><td>${escapeHtml(data.name || data.waf)}</td></tr>` : ''}
            ${data.confidence ? `<tr><td class="label">Confiance</td><td>${data.confidence}%</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Social Tags
  'social-tags': (data) => {
    if (!data || data.error) return '';
    const title = data.title || data.ogTitle || '';
    const description = data.description || data.ogDescription || '';
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📱</span>
          <h3>Métadonnées Sociales & SEO</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${title ? `<tr><td class="label">Titre</td><td>${escapeHtml(title)}</td></tr>` : ''}
            ${description ? `<tr><td class="label">Description</td><td>${escapeHtml(description.length > 150 ? description.substring(0, 150) + '...' : description)}</td></tr>` : ''}
            ${data.canonicalUrl ? `<tr><td class="label">URL canonique</td><td>${escapeHtml(data.canonicalUrl)}</td></tr>` : ''}
            ${data.ogTitle ? `<tr><td class="label">OG Title</td><td>${escapeHtml(data.ogTitle)}</td></tr>` : ''}
            ${data.ogDescription ? `<tr><td class="label">OG Description</td><td>${escapeHtml(data.ogDescription.length > 100 ? data.ogDescription.substring(0, 100) + '...' : data.ogDescription)}</td></tr>` : ''}
            ${data.twitterTitle ? `<tr><td class="label">Twitter Title</td><td>${escapeHtml(data.twitterTitle)}</td></tr>` : ''}
            ${data.twitterDescription ? `<tr><td class="label">Twitter Desc.</td><td>${escapeHtml(data.twitterDescription.length > 100 ? data.twitterDescription.substring(0, 100) + '...' : data.twitterDescription)}</td></tr>` : ''}
            ${data.themeColor ? `<tr><td class="label">Couleur thème</td><td><code>${escapeHtml(data.themeColor)}</code></td></tr>` : ''}
            ${data.generator ? `<tr><td class="label">Générateur</td><td>${escapeHtml(data.generator)}</td></tr>` : ''}
            ${data.author ? `<tr><td class="label">Auteur</td><td>${escapeHtml(data.author)}</td></tr>` : ''}
            ${data.viewport ? `<tr><td class="label">Viewport</td><td>${escapeHtml(data.viewport)}</td></tr>` : ''}
            ${data.favicon ? `<tr><td class="label">Favicon</td><td>${escapeHtml(data.favicon)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Vulnerabilities - Only show if vulnerabilities found
  'vulnerabilities': (data) => {
    if (!data || data.error) return '';
    const vulns = data.vulnerabilities || data.issues || [];
    const summary = data.summary || {};
    
    // Skip if no vulnerabilities
    if (vulns.length === 0 && !summary.critical && !summary.high && !summary.medium && !summary.low) return '';
    
    // Translate risk level to French
    const translateRiskLevel = (level: string) => {
      const translations: Record<string, string> = {
        'Minimal': 'Minimal',
        'Low': 'Faible',
        'Medium': 'Moyen',
        'High': 'Élevé',
        'Critical': 'Critique'
      };
      return translations[level] || level || '';
    };
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">⚠️</span>
          <h3>Vulnérabilités Détectées</h3>
          <span class="status-badge error">${vulns.length} trouvée(s)</span>
        </div>
        <div class="plugin-content">
          ${summary.critical || summary.high || summary.medium || summary.low ? `
            <table class="info-table" style="margin-bottom: 10px;">
              <tr>
                <td class="label">Niveau de risque</td>
                <td style="color: #991b1b;">${translateRiskLevel(data.riskLevel)}</td>
              </tr>
              ${summary.critical ? `<tr><td class="label">Critiques</td><td style="color: #991b1b;">${summary.critical}</td></tr>` : ''}
              ${summary.high ? `<tr><td class="label">Élevées</td><td style="color: #c2410c;">${summary.high}</td></tr>` : ''}
              ${summary.medium ? `<tr><td class="label">Moyennes</td><td style="color: #b45309;">${summary.medium}</td></tr>` : ''}
              ${summary.low ? `<tr><td class="label">Faibles</td><td style="color: #0369a1;">${summary.low}</td></tr>` : ''}
            </table>
          ` : ''}
          ${vulns.length > 0 ? `
            <ul class="vuln-list">
              ${vulns.slice(0, 15).map((v: any) => `<li>⚠ ${escapeHtml(v.title || v.name || v.id || v)}</li>`).join('')}
            </ul>
            ${vulns.length > 15 ? `<p class="more">+ ${vulns.length - 15} autres...</p>` : ''}
          ` : ''}
        </div>
      </div>
    `;
  },

  // Link Audit
  // Link Audit - Only show if there are issues
  'link-audit': (data) => {
    if (!data || data.error) return '';
    const broken = data.brokenLinks || data.broken || [];
    const mixed = data.mixedContent || data.mixed || [];
    // Skip if no issues found
    if (broken.length === 0 && mixed.length === 0) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔗</span>
          <h3>Problèmes de Liens</h3>
          <span class="status-badge warning">⚠ ${broken.length + mixed.length} problème(s)</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${broken.length > 0 ? `<tr><td class="label">Liens cassés</td><td style="color: #991b1b;">${broken.length}</td></tr>` : ''}
            ${mixed.length > 0 ? `<tr><td class="label">Contenu mixte</td><td style="color: #b45309;">${mixed.length}</td></tr>` : ''}
          </table>
          ${broken.length > 0 ? `
            <p style="font-size: 8pt; margin-top: 8px;">
              ${broken.slice(0, 5).map((b: any) => escapeHtml(b.url || b)).join(', ')}
            </p>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Subdomain Enumeration
  'subdomain-enumeration': (data) => {
    if (!data || data.error) return '';
    
    const subdomains = data.subdomains || data.domains || [];
    const analysis = data.analysis || {};
    const summary = data.summary || {};
    const methods = data.methods || {};
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🌍</span>
          <h3>Énumération des Sous-domaines</h3>
          <span class="status-badge info">${summary.totalSubdomains || subdomains.length} trouvé${(summary.totalSubdomains || subdomains.length) !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            <tr><td class="label">Domaine principal</td><td>${escapeHtml(data.domain || data.queryDomain || '')}</td></tr>
            <tr><td class="label">Sous-domaines trouvés</td><td>${summary.totalSubdomains || subdomains.length}</td></tr>
            <tr><td class="label">Adresses IP uniques</td><td>${summary.uniqueIPAddresses || analysis.uniqueIPs?.length || 0}</td></tr>
            <tr><td class="label">CDN détecté</td><td>${summary.hasCDN || analysis.hasCDN ? '✓ Oui' : '✗ Non'}</td></tr>
            <tr><td class="label">Wildcard DNS</td><td>${summary.hasWildcard || analysis.hasWildcard ? '⚠ Oui' : '✓ Non'}</td></tr>
            <tr><td class="label">Méthodologie</td><td>${escapeHtml(summary.methodology || 'Reconnaissance passive')}</td></tr>
            ${summary.executionTimeMs ? `<tr><td class="label">Temps d'exécution</td><td>${(summary.executionTimeMs / 1000).toFixed(1)}s</td></tr>` : ''}
          </table>
          
          ${subdomains.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin-bottom: 5px;">Sous-domaines découverts:</p>
            <table class="data-table">
              <thead><tr><th>Sous-domaine</th><th>IP</th><th>CNAME</th></tr></thead>
              <tbody>
              ${subdomains.map((s: any) => {
                const subdomain = s.subdomain || s.domain || s.name || s;
                const ips = Array.isArray(s.ipv4) ? s.ipv4.slice(0, 2).join(', ') : (s.ip || '-');
                const cname = Array.isArray(s.cname) ? s.cname.slice(0, 1).join(', ') : (s.cname || '-');
                return `<tr><td>${escapeHtml(subdomain)}</td><td><code>${escapeHtml(ips)}</code></td><td>${escapeHtml(cname)}</td></tr>`;
              }).join('')}
              </tbody>
            </table>
          ` : '<p class="empty">Aucun sous-domaine trouvé</p>'}
          
          ${analysis.uniqueIPs?.length > 0 ? `
            <p style="font-size: 9pt; margin-top: 10px;">
              <strong>IPs uniques:</strong> ${analysis.uniqueIPs.slice(0, 8).map((ip: string) => `<code>${escapeHtml(ip)}</code>`).join(', ')}
              ${analysis.uniqueIPs.length > 8 ? `... +${analysis.uniqueIPs.length - 8}` : ''}
            </p>
          ` : ''}
          
          ${methods.passiveReconnaissance ? `
            <p style="font-size: 8pt; color: #666; margin-top: 8px;">
              Sources: CT Logs (${methods.passiveReconnaissance.certificateTransparency?.found || 0}), 
              HackerTarget (${methods.passiveReconnaissance.hackerTarget?.found || 0}), 
              URLScan (${methods.passiveReconnaissance.urlScan?.found || 0})
            </p>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Domain/Whois
  'domain': (data) => {
    if (!data || data.error) return '';
    
    // Extract data from internicData if available
    const internic = data.internicData || {};
    const whois = data.whoisData || {};
    
    const domainName = internic.Domain_Name || data.domain || '';
    const registrar = internic.Registrar || data.registrar || '';
    const creationDate = internic.Creation_Date || data.createdDate || data.created || '';
    const expiryDate = internic.Registry_Expiry_Date || data.expiresDate || data.expires || '';
    const updatedDate = internic.Updated_Date || data.updatedDate || data.updated || '';
    const status = internic.Domain_Status || data.status || '';
    const nameServer = internic.Name_Server || '';
    const dnssec = internic.DNSSEC || '';
    const registrarUrl = internic.Registrar_URL || '';
    const abuseEmail = internic.Registrar_Abuse_Contact_Email || '';
    const abusePhone = internic.Registrar_Abuse_Contact_Phone || '';
    
    // Format dates
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📋</span>
          <h3>Informations Domaine (WHOIS)</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${domainName ? `<tr><td class="label">Domaine</td><td><strong>${escapeHtml(domainName)}</strong></td></tr>` : ''}
            ${registrar ? `<tr><td class="label">Registrar</td><td>${escapeHtml(registrar)}</td></tr>` : ''}
            ${registrarUrl ? `<tr><td class="label">Site Registrar</td><td>${escapeHtml(registrarUrl)}</td></tr>` : ''}
            ${creationDate ? `<tr><td class="label">Date de création</td><td>${formatDateStr(creationDate)}</td></tr>` : ''}
            ${expiryDate ? `<tr><td class="label">Date d'expiration</td><td>${formatDateStr(expiryDate)}</td></tr>` : ''}
            ${updatedDate ? `<tr><td class="label">Dernière mise à jour</td><td>${formatDateStr(updatedDate)}</td></tr>` : ''}
            ${status ? `<tr><td class="label">Statut</td><td>${escapeHtml(status.split(' ')[0] || status)}</td></tr>` : ''}
            ${nameServer ? `<tr><td class="label">Serveur de noms</td><td><code>${escapeHtml(nameServer)}</code></td></tr>` : ''}
            ${dnssec ? `<tr><td class="label">DNSSEC</td><td>${dnssec === 'unsigned' ? '✗ Non signé' : '✓ Signé'}</td></tr>` : ''}
            ${abuseEmail ? `<tr><td class="label">Contact Abus</td><td>${escapeHtml(abuseEmail)}</td></tr>` : ''}
            ${abusePhone ? `<tr><td class="label">Téléphone Abus</td><td>${escapeHtml(abusePhone)}</td></tr>` : ''}
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
  // Subdomain Takeover - Only show if vulnerable
  'subdomain-takeover': (data) => {
    if (!data) return '';
    const isVulnerable = data.vulnerable || data.isVulnerable;
    // Skip if not vulnerable
    if (!isVulnerable) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🎯</span>
          <h3>Vulnérabilité Subdomain Takeover</h3>
          <span class="status-badge error">⚠ Vulnérable</span>
        </div>
        <div class="plugin-content">
          <p style="color: #991b1b;">${data.status || data.message || 'Risque de prise de contrôle de sous-domaine détecté'}</p>
          ${data.cname ? `<p>CNAME: <code>${escapeHtml(data.cname)}</code></p>` : ''}
          ${data.service ? `<p>Service: ${escapeHtml(data.service)}</p>` : ''}
        </div>
      </div>
    `;
  },

  // Trace Route - Skip if no meaningful hops
  'trace-route': (data) => {
    if (!data || data.error) return '';
    const hops = data.hops || data.result || [];
    
    // Skip if no hops or only localhost with timeouts
    const meaningfulHops = hops.filter((h: any) => {
      const ip = h.ip || h.host || h.hostname || h.address || '';
      const hasRealIp = ip && ip !== 'localhost' && ip !== '127.0.0.1';
      const rttArray = Array.isArray(h.rtt) ? h.rtt : [];
      const hasRealRtt = rttArray.some((r: string) => r && r !== 'timeout');
      return hasRealIp || hasRealRtt;
    });
    
    if (meaningfulHops.length === 0) return '';
    
    const totalHops = data.totalHops || hops.length;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛤️</span>
          <h3>Traçage Route</h3>
          <span class="status-badge info">${totalHops} saut${totalHops !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${data.summary ? `<p style="font-size: 9pt; margin-bottom: 10px;">${escapeHtml(data.summary)}</p>` : ''}
          ${data.avgLatency && data.avgLatency > 0 ? `<p style="font-size: 9pt; margin-bottom: 10px;">Latence moyenne: ${data.avgLatency}ms</p>` : ''}
          ${hops.length > 0 ? `
            <table class="data-table">
              <thead><tr><th>#</th><th>Hôte</th><th>RTT</th></tr></thead>
              <tbody>
              ${hops.map((h: any) => {
                const hopNum = h.hop || '';
                const ip = h.ip || h.host || h.hostname || h.address || '';
                const rtt = Array.isArray(h.rtt) ? h.rtt.filter((r: string) => r).join(', ') || '-' : (h.rtt || '-');
                return `<tr><td>${hopNum}</td><td>${escapeHtml(ip)}</td><td>${escapeHtml(rtt)}</td></tr>`;
              }).join('')}
              </tbody>
            </table>
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
    const analysis = data.analysis || {};
    const internalWithCounts = analysis.internalWithCounts || [];
    const externalWithCounts = analysis.externalWithCounts || [];
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🔗</span>
          <h3>Pages Liées</h3>
          <span class="status-badge info">${analysis.totalUniqueLinks || (internal.length + external.length)} liens</span>
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            <tr><td class="label">Liens internes</td><td>${analysis.internalCount || internal.length}</td></tr>
            <tr><td class="label">Liens externes</td><td>${analysis.externalCount || external.length}</td></tr>
            ${analysis.method ? `<tr><td class="label">Méthode</td><td>${escapeHtml(analysis.method)}</td></tr>` : ''}
          </table>
          
          ${internal.length > 0 || internalWithCounts.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin-bottom: 5px;">Liens internes:</p>
            <ul class="url-list">
              ${(internalWithCounts.length > 0 ? internalWithCounts : internal).slice(0, 10).map((l: any) => {
                const url = l.url || l;
                const count = l.count ? ` (${l.count}x)` : '';
                return `<li>${escapeHtml(url)}${count}</li>`;
              }).join('')}
            </ul>
            ${internal.length > 10 ? `<p class="more">+ ${internal.length - 10} autres...</p>` : ''}
          ` : ''}
          
          ${external.length > 0 || externalWithCounts.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin: 10px 0 5px 0;">Liens externes:</p>
            <ul class="url-list">
              ${(externalWithCounts.length > 0 ? externalWithCounts : external).slice(0, 10).map((l: any) => {
                const url = l.url || l;
                const count = l.count ? ` (${l.count}x)` : '';
                return `<li>${escapeHtml(url)}${count}</li>`;
              }).join('')}
            </ul>
            ${external.length > 10 ? `<p class="more">+ ${external.length - 10} autres...</p>` : ''}
          ` : ''}
        </div>
      </div>
    `;
  },

  // Site Features - Skip if no technologies detected
  'features': (data) => {
    if (!data || data.error) return '';
    // Handle various feature structures
    const features = data.technologies || data.features || data.Technologies || [];
    
    // Skip if no features detected
    if (features.length === 0) return '';
    
    const count = data.summary?.totalDetected || features.length;
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">✨</span>
          <h3>Technologies Détectées</h3>
          <span class="status-badge info">${count} détectée${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <div class="tech-grid">
            ${features.map((f: any) => {
              const name = f.name || f.Name || (typeof f === 'string' ? f : '');
              const version = f.version && f.version !== 'detected' ? f.version : '';
              const confidence = f.confidence || '';
              const source = f.source || '';
              return `
                <div class="tech-item">
                  <strong>${escapeHtml(name)}</strong>
                  ${version ? `<span class="version">v${escapeHtml(version)}</span>` : ''}
                  ${confidence ? `<span class="category">${escapeHtml(confidence)}</span>` : ''}
                  ${source ? `<span class="category" style="font-size: 7pt;">(${escapeHtml(source)})</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
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
  // Secrets - Only show if secrets are found
  'secrets': (data) => {
    if (!data || data.error) return '';
    const secrets = data.secrets || data.findings || [];
    // Skip if no secrets found
    if (secrets.length === 0) return '';
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">🔑</span>
          <h3>Secrets & PII Exposés</h3>
          <span class="status-badge error">⚠ ${secrets.length} trouvé(s)</span>
        </div>
        <div class="plugin-content">
          <ul class="vuln-list">
            ${secrets.slice(0, 15).map((s: any) => `<li>⚠ ${escapeHtml(s.type || s.name || s)}</li>`).join('')}
          </ul>
          ${secrets.length > 15 ? `<p class="more">+ ${secrets.length - 15} autres...</p>` : ''}
        </div>
      </div>
    `;
  },

  // Exposed Files - Skip if no files found
  'exposed-files': (data) => {
    if (!data || data.error) return '';
    const files = data.files || data.exposedFiles || [];
    
    // Skip if no exposed files detected
    if (files.length === 0) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📂</span>
          <h3>Fichiers Exposés</h3>
          <span class="status-badge warning">
            ${files.length} fichier(s)
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            <tr><td class="label">Fichiers scannés</td><td>${data.scannedCount || 0}</td></tr>
          </table>
          <ul class="url-list">
            ${files.slice(0, 15).map((f: any) => `<li>${escapeHtml(f.path || f.file || f)}</li>`).join('')}
          </ul>
          ${files.length > 15 ? `<p class="more">+ ${files.length - 15} autres...</p>` : ''}
        </div>
      </div>
    `;
  },

  // Headers
  'headers': (data) => {
    if (!data || data.error) return '';
    // Handle both nested and flat structure
    const headers = data.headers || data;
    const headerList = Object.entries(headers).filter(([k]) => k !== 'error' && k !== 'statusCode');
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📨</span>
          <h3>En-têtes HTTP (${headerList.length})</h3>
        </div>
        <div class="plugin-content">
          ${headerList.length > 0 ? `
            <table class="data-table">
              <thead><tr><th>En-tête</th><th>Valeur</th></tr></thead>
              <tbody>
              ${headerList.map(([k, v]) => {
                let displayValue = '';
                if (Array.isArray(v)) {
                  displayValue = v.join('; ');
                } else {
                  displayValue = String(v);
                }
                // Truncate long values
                if (displayValue.length > 100) {
                  displayValue = displayValue.substring(0, 100) + '...';
                }
                return `<tr><td class="label">${escapeHtml(k)}</td><td><code>${escapeHtml(displayValue)}</code></td></tr>`;
              }).join('')}
              </tbody>
            </table>
          ` : '<p class="empty">Aucun en-tête</p>'}
        </div>
      </div>
    `;
  },

  // TXT Records
  'txt-records': (data) => {
    if (!data || data.error) return '';
    // Handle both array and object formats
    let records: any[] = [];
    if (Array.isArray(data.records)) {
      records = data.records;
    } else if (typeof data.records === 'object') {
      records = Object.entries(data.records).map(([k, v]) => `${k}: ${v}`);
    }
    const count = data.count || records.length;
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📝</span>
          <h3>Enregistrements TXT</h3>
          <span class="status-badge info">${count} enregistrement${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          ${data.hostname ? `<p style="font-size: 9pt; margin-bottom: 8px;">Domaine: ${escapeHtml(data.hostname)}</p>` : ''}
          ${records.length > 0 ? `
            <ul class="url-list">
              ${records.slice(0, 15).map((r: any) => `<li><code>${escapeHtml(String(r).substring(0, 80))}${String(r).length > 80 ? '...' : ''}</code></li>`).join('')}
            </ul>
            ${records.length > 15 ? `<p class="more">+ ${records.length - 15} autres...</p>` : ''}
          ` : '<p class="empty">Aucun enregistrement TXT</p>'}
        </div>
      </div>
    `;
  },

  // Mail Config
  'mail-config': (data) => {
    if (!data || data.error) return '';
    
    const security = data.securityAnalysis || {};
    const summary = data.summary || {};
    const mailServices = data.mailServices || [];
    const recommendations = security.recommendations || [];
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📧</span>
          <h3>Configuration Email</h3>
          <span class="status-badge ${summary.hasBasicSecurity ? 'success' : 'warning'}">
            ${summary.securityScore || `${security.score || 0}/${security.maxScore || 3}`}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            <tr><td class="label">Enregistrements MX</td><td>${summary.totalMxRecords || data.mxRecords?.length || 0}</td></tr>
            <tr><td class="label">Enregistrements TXT</td><td>${summary.totalTxtRecords || data.txtRecords?.length || 0}</td></tr>
            <tr><td class="label">Services identifiés</td><td>${summary.identifiedServices || mailServices.length}</td></tr>
          </table>
          
          <p style="font-size: 9pt; font-weight: 600; margin-bottom: 5px;">Analyse de sécurité:</p>
          <table class="info-table">
            <tr><td class="label">SPF</td><td><span class="${security.spf ? 'check' : 'cross'}">${security.spf ? '✓ Configuré' : '✗ Non configuré'}</span></td></tr>
            <tr><td class="label">DMARC</td><td><span class="${security.dmarc ? 'check' : 'cross'}">${security.dmarc ? '✓ Configuré' : '✗ Non configuré'}</span></td></tr>
            <tr><td class="label">DKIM</td><td><span class="${security.dkim ? 'check' : 'cross'}">${security.dkim ? '✓ Configuré' : '✗ Non configuré'}</span></td></tr>
          </table>
          
          ${mailServices.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin: 10px 0 5px 0;">Services détectés:</p>
            <ul class="url-list">
              ${mailServices.map((s: any) => `<li>${escapeHtml(s.provider || s.name || s)} (${escapeHtml(s.type || 'service')})</li>`).join('')}
            </ul>
          ` : ''}
          
          ${recommendations.length > 0 ? `
            <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 6px;">
              <p style="font-size: 9pt; font-weight: 600; margin-bottom: 5px; color: #92400e;">⚠️ Recommandations:</p>
              <ul style="font-size: 8pt; margin: 0; padding-left: 15px; color: #92400e;">
                ${recommendations.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Archives
  // Archives - Only show if there are captures
  'archives': (data) => {
    if (!data || data.error) return '';
    const archives = data.results || data.archives || [];
    const totalCaptures = data.totalCaptures || archives.length || 0;
    const hasData = totalCaptures > 0 || data.firstSeen || data.oldestCapture;
    // Skip if no archive data
    if (!hasData) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">📚</span>
          <h3>Archives Web</h3>
          <span class="status-badge info">${totalCaptures} capture${totalCaptures !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.firstSeen || data.oldestCapture ? `<tr><td class="label">Première capture</td><td>${escapeHtml(data.firstSeen || data.oldestCapture)}</td></tr>` : ''}
            ${data.lastSeen || data.newestCapture ? `<tr><td class="label">Dernière capture</td><td>${escapeHtml(data.lastSeen || data.newestCapture)}</td></tr>` : ''}
            ${totalCaptures ? `<tr><td class="label">Total</td><td>${totalCaptures} captures</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Rank
  'rank': (data) => {
    if (!data || data.error) return '';
    
    const ranks = data.ranks || [];
    const domain = data.domain || '';
    const currentRank = ranks[0]?.rank || data.rank;
    const oldestRank = ranks[ranks.length - 1]?.rank;
    
    // Calculate trend
    let trend = '';
    let trendClass = '';
    if (ranks.length >= 2) {
      const diff = ranks[ranks.length - 1]?.rank - ranks[0]?.rank;
      if (diff > 0) {
        trend = `↑ +${diff.toLocaleString()} (amélioration)`;
        trendClass = 'check';
      } else if (diff < 0) {
        trend = `↓ ${diff.toLocaleString()} (régression)`;
        trendClass = 'cross';
      } else {
        trend = '→ Stable';
        trendClass = '';
      }
    }
    
    return `
      <div class="plugin-card wide">
        <div class="plugin-header">
          <span class="plugin-icon">📊</span>
          <h3>Classement Global Tranco</h3>
          ${currentRank ? `<span class="status-badge info">#${currentRank.toLocaleString()}</span>` : ''}
        </div>
        <div class="plugin-content">
          <table class="info-table" style="margin-bottom: 10px;">
            ${domain ? `<tr><td class="label">Domaine</td><td>${escapeHtml(domain)}</td></tr>` : ''}
            ${currentRank ? `<tr><td class="label">Rang actuel</td><td><strong>#${currentRank.toLocaleString()}</strong></td></tr>` : ''}
            ${oldestRank && ranks.length > 1 ? `<tr><td class="label">Rang il y a ${ranks.length} jours</td><td>#${oldestRank.toLocaleString()}</td></tr>` : ''}
            ${trend ? `<tr><td class="label">Tendance (${ranks.length} jours)</td><td><span class="${trendClass}">${trend}</span></td></tr>` : ''}
          </table>
          ${ranks.length > 0 ? `
            <p style="font-size: 9pt; font-weight: 600; margin-bottom: 5px;">Historique des 15 derniers jours:</p>
            <table class="data-table">
              <thead><tr><th>Date</th><th>Rang</th><th>Variation</th></tr></thead>
              <tbody>
              ${ranks.slice(0, 15).map((r: any, i: number) => {
                const prev = ranks[i + 1]?.rank;
                let change = '';
                if (prev) {
                  const diff = prev - r.rank;
                  if (diff > 0) change = `<span class="check">↑ ${diff}</span>`;
                  else if (diff < 0) change = `<span class="cross">↓ ${Math.abs(diff)}</span>`;
                  else change = '→';
                }
                return `<tr><td>${new Date(r.date).toLocaleDateString('fr-FR')}</td><td>#${r.rank.toLocaleString()}</td><td>${change}</td></tr>`;
              }).join('')}
              </tbody>
            </table>
            ${ranks.length > 15 ? `<p class="more">+ ${ranks.length - 15} jours d'historique...</p>` : ''}
          ` : ''}
        </div>
      </div>
    `;
  },

  // Ports
  'ports': (data) => {
    if (!data || data.error) return '';
    const openPorts = data.openPorts || data.ports || [];
    const failedPorts = data.failedPorts || [];
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🚪</span>
          <h3>Ports</h3>
          <span class="status-badge info">${openPorts.length} ouvert${openPorts.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            <tr><td class="label">Ports ouverts</td><td>${openPorts.length > 0 ? openPorts.map((p: any) => `<code>${p.port || p}</code>`).join(', ') : 'Aucun'}</td></tr>
            <tr><td class="label">Ports fermés</td><td>${failedPorts.length} (${failedPorts.slice(0, 10).join(', ')}${failedPorts.length > 10 ? '...' : ''})</td></tr>
          </table>
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
    
    const cert = data.certificate || {};
    const securityLevel = data.securityLevel || 'unknown';
    const isSecure = securityLevel === 'secure' || securityLevel === 'acceptable';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Suites de Chiffrement TLS</h3>
          <span class="status-badge ${isSecure ? 'success' : 'warning'}">
            ${escapeHtml(securityLevel)}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.hostname ? `<tr><td class="label">Hôte</td><td>${escapeHtml(data.hostname)}:${data.port || 443}</td></tr>` : ''}
            ${data.protocol ? `<tr><td class="label">Protocole</td><td><strong>${escapeHtml(data.protocol)}</strong></td></tr>` : ''}
            ${data.cipher ? `<tr><td class="label">Cipher</td><td><code>${escapeHtml(data.cipher)}</code></td></tr>` : ''}
            ${data.version ? `<tr><td class="label">Version TLS</td><td>${escapeHtml(data.version)}</td></tr>` : ''}
            ${cert.daysRemaining !== undefined ? `<tr><td class="label">Expire dans</td><td>${cert.daysRemaining} jours</td></tr>` : ''}
            ${data.available !== undefined ? `<tr><td class="label">Disponible</td><td>${data.available ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
          </table>
          ${data.note ? `<p style="font-size: 8pt; color: #666; margin-top: 8px;">${escapeHtml(data.note)}</p>` : ''}
        </div>
      </div>
    `;
  },

  // TLS Security Config
  'tls-security-config': (data) => {
    if (!data || data.error) return '';
    
    const cert = data.certificate || {};
    const securityLevel = data.securityLevel || 'unknown';
    const isSecure = securityLevel === 'secure' || securityLevel === 'acceptable';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🛡️</span>
          <h3>Configuration Sécurité TLS</h3>
          <span class="status-badge ${isSecure ? 'success' : 'warning'}">
            ${escapeHtml(securityLevel)}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.hostname ? `<tr><td class="label">Hôte</td><td>${escapeHtml(data.hostname)}:${data.port || 443}</td></tr>` : ''}
            ${data.protocol ? `<tr><td class="label">Protocole</td><td><strong>${escapeHtml(data.protocol)}</strong></td></tr>` : ''}
            ${data.cipher ? `<tr><td class="label">Cipher Suite</td><td><code>${escapeHtml(data.cipher)}</code></td></tr>` : ''}
            ${data.version ? `<tr><td class="label">Version</td><td>${escapeHtml(data.version)}</td></tr>` : ''}
            ${cert.subject?.CN ? `<tr><td class="label">Certificat</td><td>${escapeHtml(cert.subject.CN)}</td></tr>` : ''}
            ${cert.issuer?.O ? `<tr><td class="label">Émetteur</td><td>${escapeHtml(cert.issuer.O)} (${escapeHtml(cert.issuer.CN || '')})</td></tr>` : ''}
            ${cert.daysRemaining !== undefined ? `<tr><td class="label">Jours restants</td><td>${cert.daysRemaining}</td></tr>` : ''}
            ${data.available !== undefined ? `<tr><td class="label">TLS disponible</td><td>${data.available ? '✓ Oui' : '✗ Non'}</td></tr>` : ''}
          </table>
          ${data.note ? `<p style="font-size: 8pt; color: #666; margin-top: 8px;">${escapeHtml(data.note)}</p>` : ''}
        </div>
      </div>
    `;
  },

  // TLS Client Support
  'tls-client-support': (data) => {
    if (!data || data.error) return '';
    
    const cert = data.certificate || {};
    const securityLevel = data.securityLevel || 'unknown';
    const isSecure = securityLevel === 'secure' || securityLevel === 'acceptable';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">💻</span>
          <h3>Compatibilité TLS Clients</h3>
          <span class="status-badge ${isSecure ? 'success' : 'warning'}">
            ${escapeHtml(securityLevel)}
          </span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.hostname ? `<tr><td class="label">Hôte</td><td>${escapeHtml(data.hostname)}:${data.port || 443}</td></tr>` : ''}
            ${data.protocol ? `<tr><td class="label">Protocole négocié</td><td><strong>${escapeHtml(data.protocol)}</strong></td></tr>` : ''}
            ${data.cipher ? `<tr><td class="label">Cipher négocié</td><td><code>${escapeHtml(data.cipher)}</code></td></tr>` : ''}
            ${data.version ? `<tr><td class="label">Version TLS</td><td>${escapeHtml(data.version)}</td></tr>` : ''}
            ${cert.validFrom ? `<tr><td class="label">Valide depuis</td><td>${escapeHtml(cert.validFrom)}</td></tr>` : ''}
            ${cert.validTo ? `<tr><td class="label">Valide jusqu'au</td><td>${escapeHtml(cert.validTo)}</td></tr>` : ''}
            ${cert.daysRemaining !== undefined ? `<tr><td class="label">Jours restants</td><td>${cert.daysRemaining}</td></tr>` : ''}
            ${data.available !== undefined ? `<tr><td class="label">Connexion TLS</td><td>${data.available ? '✓ Réussie' : '✗ Échouée'}</td></tr>` : ''}
          </table>
          ${data.note ? `<p style="font-size: 8pt; color: #666; margin-top: 8px;">${escapeHtml(data.note)}</p>` : ''}
        </div>
      </div>
    `;
  },

  // Security.txt
  // Security.txt - Only show if present with data
  'security-txt': (data) => {
    if (!data) return '';
    const isPresent = data.found || data.present || data.isPresent;
    // Skip if not present
    if (!isPresent) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔒</span>
          <h3>Security.txt</h3>
          <span class="status-badge success">✓ Présent</span>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${data.contact ? `<tr><td class="label">Contact</td><td>${escapeHtml(data.contact)}</td></tr>` : ''}
            ${data.expires ? `<tr><td class="label">Expire</td><td>${escapeHtml(data.expires)}</td></tr>` : ''}
            ${data.encryption ? `<tr><td class="label">Encryption</td><td>${escapeHtml(data.encryption)}</td></tr>` : ''}
            ${data.policy ? `<tr><td class="label">Policy</td><td>${escapeHtml(data.policy)}</td></tr>` : ''}
          </table>
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

  // Server Info - Skip if all fields are empty
  'server-info': (data) => {
    if (!data || data.error) return '';
    // Check if there's any meaningful data
    const hasServer = data.server && data.server.trim();
    const hasOs = data.os && data.os.trim();
    const hasIp = data.ip && data.ip.trim();
    const hasLoc = data.loc && data.loc.trim();
    const hasType = data.type && data.type.trim();
    if (!hasServer && !hasOs && !hasIp && !hasLoc && !hasType) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🖥️</span>
          <h3>Informations Serveur</h3>
        </div>
        <div class="plugin-content">
          <table class="info-table">
            ${hasServer ? `<tr><td class="label">Serveur</td><td>${escapeHtml(data.server)}</td></tr>` : ''}
            ${hasOs ? `<tr><td class="label">OS</td><td>${escapeHtml(data.os)}</td></tr>` : ''}
            ${hasIp ? `<tr><td class="label">IP</td><td>${escapeHtml(data.ip)}</td></tr>` : ''}
            ${hasLoc ? `<tr><td class="label">Localisation</td><td>${escapeHtml(data.loc)}</td></tr>` : ''}
            ${hasType ? `<tr><td class="label">Type</td><td>${escapeHtml(data.type)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `;
  },

  // Host Names
  // Hosts - Only show if hosts found
  'hosts': (data) => {
    if (!data || data.error) return '';
    const hosts = data.hostnames || data.hosts || [];
    // Skip if no hosts
    if (hosts.length === 0) return '';
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🏠</span>
          <h3>Noms d'Hôtes</h3>
          <span class="status-badge info">${hosts.length}</span>
        </div>
        <div class="plugin-content">
          <ul class="url-list">
            ${hosts.slice(0, 10).map((h: any) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
          ${hosts.length > 10 ? `<p class="more">+ ${hosts.length - 10} autres...</p>` : ''}
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
  'enhancedComplianceSummary': 'enhanced-compliance-summary',
  'compliance-summary': 'enhanced-compliance-summary',
};

/**
 * Generic fallback renderer for plugins without specific renderers
 * Shows all data in a readable format - ONLY if there's meaningful data
 */
const genericPluginRenderer = (data: any, key: string): string => {
  if (!data || data.error) return '';
  
  // Skip if data is just a primitive
  if (typeof data !== 'object') return '';
  
  // Metadata fields to exclude from rendering
  const metadataFields = [
    'error', 'statusCode', 'timestamp', 'url', 'hostname', 'domain', 
    'queryDomain', 'scanUrl', 'port', 'skipped', 'message'
  ];
  
  // Check if a value is meaningful (not empty)
  const isMeaningful = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      const entries = Object.entries(value).filter(([k]) => !metadataFields.includes(k));
      return entries.some(([, v]) => isMeaningful(v));
    }
    return false;
  };
  
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
  
  // Get important fields to display (excluding metadata)
  const importantFields = Object.entries(data)
    .filter(([k, v]) => 
      !metadataFields.includes(k) &&
      typeof v !== 'function' &&
      isMeaningful(v)
    )
    .slice(0, 10);
  
  // Skip if no meaningful fields
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
  
  // Priority order - Compliance summary first, then other important plugins
  const priorityOrder = [
    'enhanced-compliance-summary',
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
    'tech-stack',
    'dns',
    'dnssec',
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
    'server-info',
    'features'
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
