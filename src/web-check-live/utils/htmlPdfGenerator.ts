// HTML-based PDF Generation for APDP compliance reports
// Modern, clean, minimalist black & white design with red accent

interface Issue {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  severity: 'Critique' | 'Attention' | 'Amélioration';
  title: string;
  description: string;
  category: string;
  recommendation: string;
  article?: string;
  priority?: 'high' | 'medium' | 'low';
  impact?: string;
  effort?: string;
}

interface ComplianceData {
  url: string;
  overallScore: string;
  complianceLevel: string;
  numericScore: number;
  criticalIssues: number;
  warnings: number;
  improvements: number;
  compliantItems: number;
  timestamp: string;
  detailedAnalysis?: {
    cookieCompliance?: any;
    sslSecurity?: any;
    privacyPolicy?: any;
    dataCollection?: any;
  };
  scoreBreakdown?: any;
  issues?: {
    critical: Issue[];
    warnings: Issue[];
    improvements: Issue[];
    compliant: Issue[];
  };
  categories?: {
    [key: string]: {
      score: number;
      issues: number;
      status: 'good' | 'warning' | 'critical';
    };
  };
}

const generateHTMLReport = (
  data: ComplianceData,
  vulnerabilities?: any,
  cdnResources?: any,
  allResults?: any
): string => {
  
  const currentDate = new Date(data.timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Construire l'URL absolue du logo pour le PDF
  const logoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/assets/images/Logo-APDP.svg`
    : '/assets/images/Logo-APDP.svg';

  // Helper function to render issues
  const renderIssues = (issues: Issue[] = [], type: 'critical' | 'warning' | 'improvement') => {
    if (!issues || issues.length === 0) return '';
    
    const icon = type === 'critical' ? '●' : type === 'warning' ? '▲' : '○';
    const limit = type === 'critical' ? 20 : 15;
    
    return issues.slice(0, limit).map(issue => `
      <div class="issue-item ${type}">
        <div class="issue-bullet ${type}">${icon}</div>
        <div class="issue-content">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description}</div>
        </div>
      </div>
    `).join('');
  };

  // Collect all analysis results
  const analysisResults = [];
  
  if (allResults) {
    // SSL/TLS
    if (allResults.ssl) {
      analysisResults.push({
        name: 'SSL/TLS',
        status: allResults.ssl.valid ? '✓' : '✗',
        detail: allResults.ssl.validityDays ? `Valide ${allResults.ssl.validityDays} jours` : 'Vérifié'
      });
    }
    
    // HTTPS
    if (allResults['http-security']) {
      const score = allResults['http-security'].securityScore || 0;
      const level = score >= 70 ? 'Bon' : score >= 40 ? 'Moyen' : 'Faible';
      analysisResults.push({
        name: 'Sécurité HTTP',
        status: score >= 70 ? '✓' : score >= 40 ? '!' : '✗',
        detail: level
      });
    }
    
    // Cookies
    if (allResults.cookies) {
      const cookieCount = allResults.cookies.length || 0;
      analysisResults.push({
        name: 'Cookies',
        status: cookieCount > 0 ? '!' : '✓',
        detail: `${cookieCount} ${cookieCount <= 1 ? 'cookie détecté' : 'cookies détectés'}`
      });
    }
    
    // Privacy Policy
    if (allResults['apdp-privacy-policy']) {
      const found = allResults['apdp-privacy-policy'].found;
      analysisResults.push({
        name: 'Politique de confidentialité',
        status: found ? '✓' : '✗',
        detail: found ? 'Présente' : 'Absente'
      });
    }
    
    // Legal Notices
    if (allResults['apdp-legal-notices']) {
      const found = allResults['apdp-legal-notices'].found;
      analysisResults.push({
        name: 'Mentions légales',
        status: found ? '✓' : '✗',
        detail: found ? 'Présentes' : 'Absentes'
      });
    }
    
    // Cookie Banner
    if (allResults['apdp-cookie-banner']) {
      const compliant = allResults['apdp-cookie-banner'].compliant;
      analysisResults.push({
        name: 'Bandeau cookies',
        status: compliant ? '✓' : '✗',
        detail: compliant ? 'Conforme' : 'Non conforme'
      });
    }
    
    // Headers
    if (allResults.headers) {
      const headers = allResults.headers.headers || {};
      const hasHSTS = 'strict-transport-security' in headers;
      analysisResults.push({
        name: 'En-têtes de sécurité',
        status: hasHSTS ? '✓' : '!',
        detail: hasHSTS ? 'HSTS activé' : 'HSTS manquant'
      });
    }
    
    // Robots.txt
    if (allResults['robots-txt']) {
      const found = !allResults['robots-txt'].error;
      analysisResults.push({
        name: 'Robots.txt',
        status: found ? '✓' : '○',
        detail: found ? 'Présent' : 'Absent'
      });
    }
    
    // Sitemap
    if (allResults.sitemap) {
      const found = !allResults.sitemap.error;
      analysisResults.push({
        name: 'Sitemap',
        status: found ? '✓' : '○',
        detail: found ? 'Présent' : 'Absent'
      });
    }
    
    // DNSSEC
    if (allResults.dnssec) {
      const enabled = allResults.dnssec.enabled;
      analysisResults.push({
        name: 'DNSSEC',
        status: enabled ? '✓' : '○',
        detail: enabled ? 'Activé' : 'Non activé'
      });
    }
    
    // Firewall
    if (allResults.firewall) {
      const detected = allResults.firewall.detected;
      analysisResults.push({
        name: 'Firewall',
        status: detected ? '✓' : '○',
        detail: detected ? allResults.firewall.name || 'Détecté' : 'Non détecté'
      });
    }
    
    // Mixed Content
    if (allResults['mixed-content']) {
      const issues = allResults['mixed-content'].mixedContent?.length || 0;
      analysisResults.push({
        name: 'Contenu mixte',
        status: issues === 0 ? '✓' : '✗',
        detail: issues === 0 ? 'Aucun problème' : `${issues} ${issues <= 1 ? 'ressource non sécurisée' : 'ressources non sécurisées'}`
      });
    }
    
    // Redirects
    if (allResults.redirects) {
      const redirects = allResults.redirects.redirects?.length || 0;
      analysisResults.push({
        name: 'Redirections',
        status: redirects <= 2 ? '✓' : '!',
        detail: `${redirects} ${redirects <= 1 ? 'redirection' : 'redirections'}`
      });
    }
    
    // Social Tags
    if (allResults['social-tags']) {
      const hasOG = allResults['social-tags']['og:title'] ? true : false;
      analysisResults.push({
        name: 'Balises sociales',
        status: hasOG ? '✓' : '○',
        detail: hasOG ? 'Présentes (OpenGraph)' : 'Absentes'
      });
    }
    
    // Accessibility
    if (allResults.accessibility) {
      const score = allResults.accessibility.score || 0;
      analysisResults.push({
        name: 'Accessibilité',
        status: score >= 80 ? '✓' : score >= 50 ? '!' : '✗',
        detail: `Score: ${score}/100`
      });
    }
    
    // Performance
    if (allResults.performance) {
      const score = allResults.performance.score || 0;
      analysisResults.push({
        name: 'Performance',
        status: score >= 80 ? '✓' : score >= 50 ? '!' : '✗',
        detail: `Score: ${score}/100`
      });
    }
    
    // Quality
    if (allResults.quality) {
      const score = allResults.quality.score || 0;
      analysisResults.push({
        name: 'Qualité du code',
        status: score >= 80 ? '✓' : score >= 50 ? '!' : '✗',
        detail: `Score: ${score}/100`
      });
    }
    
    // Vulnerabilities
    if (vulnerabilities && vulnerabilities.vulnerabilities) {
      const vulnCount = vulnerabilities.vulnerabilities.length || 0;
      analysisResults.push({
        name: 'Vulnérabilités',
        status: vulnCount === 0 ? '✓' : '✗',
        detail: vulnCount === 0 ? 'Aucune détectée' : `${vulnCount} ${vulnCount <= 1 ? 'vulnérabilité' : 'vulnérabilités'}`
      });
    }
    
    // TLS
    if (allResults.tls) {
      const version = allResults.tls.tlsVersion || 'Unknown';
      analysisResults.push({
        name: 'Version TLS',
        status: version.includes('1.3') || version.includes('1.2') ? '✓' : '!',
        detail: version
      });
    }
    
    // Security Headers Details
    if (allResults['http-security']) {
      const headers = allResults['http-security'].missingHeaders || [];
      if (headers.length > 0) {
        analysisResults.push({
          name: 'En-têtes manquants',
          status: '!',
          detail: `${headers.length} ${headers.length <= 1 ? 'en-tête de sécurité manquant' : 'en-têtes de sécurité manquants'}`
        });
      }
    }
    
    // CDN Resources
    if (cdnResources && cdnResources.resources) {
      const cdnCount = cdnResources.resources.length || 0;
      analysisResults.push({
        name: 'Ressources CDN',
        status: '○',
        detail: `${cdnCount} ${cdnCount <= 1 ? 'ressource externe' : 'ressources externes'}`
      });
    }
    
    // Tech Stack
    if (allResults['tech-stack']) {
      const technologies = allResults['tech-stack'].technologies?.length || 0;
      analysisResults.push({
        name: 'Technologies détectées',
        status: '○',
        detail: `${technologies} ${technologies <= 1 ? 'technologie' : 'technologies'}`
      });
    }
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Conformité APDP - ${data.url}</title>
  <style>
    @page {
      margin: 20mm;
      size: A4;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #000;
      background: #f5f5f5;
        padding: 0;
      margin: 0;
    }
    
    /* A4 Container with margins */
    .page-container {
      max-width: 210mm;
      margin: 20px auto;
      background: #fff;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      padding: 0;
    }
    
    .content {
      padding: 0 20mm;
    }
    
    @media print {
      body {
        background: #fff;
      }
      
      .page-container {
        max-width: 100%;
        box-shadow: none;
        margin: 0;
      }
    }
    
    /* Cover Page */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
      border: 3px solid #000;
      padding: 60px 40px;
      margin: 0;
    }
    
    @media print {
      .cover {
        min-height: 277mm;
      }
    }
    
    .logo {
      width: 180px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 40px;
      padding: 15px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .logo img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    
    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      margin: 40px 0 20px;
      letter-spacing: -0.5px;
    }
    
    .cover-subtitle {
      font-size: 14pt;
      color: #666;
      margin-bottom: 60px;
    }
    
    .cover-info {
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 30px 0;
      width: 100%;
      max-width: 500px;
    }
    
    .cover-info-row {
      display: flex;
      justify-content: space-between;
      margin: 12px 0;
      font-size: 11pt;
    }
    
    .cover-info-label {
      font-weight: 600;
    }
    
    .cover-info-value {
      text-align: right;
      max-width: 60%;
      word-break: break-word;
    }
    
    .cover-footer {
      margin-top: auto;
      font-size: 9pt;
      color: #666;
    }
    
    /* Content Pages */
    .content {
      page-break-before: always;
    }
    
      .header {
      display: flex;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 2px solid #000;
      margin-bottom: 30px;
    }
    
    .header-logo {
      width: 80px;
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      padding: 5px;
      background: #fff;
      border-radius: 4px;
    }
    
    .header-logo img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    
    .header-title {
      flex: 1;
    }
    
    .header-title h1 {
      font-size: 14pt;
      font-weight: 700;
    }
    
    .header-title p {
      font-size: 9pt;
      color: #666;
      margin-top: 2px;
    }
    
    /* Summary Section */
    .summary-section {
      border: 1px solid #000;
      padding: 30px;
      margin: 35px 0;
      page-break-inside: avoid;
      background: #fff;
    }
    
    .summary-title {
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 25px;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border: 1px solid #000;
    }
    
    .summary-item {
      text-align: center;
      padding: 25px 15px;
      background: #fff;
      border-right: 1px solid #000;
      position: relative;
    }
    
    .summary-item:last-child {
      border-right: none;
    }
    
    .summary-item-number {
      font-size: 36pt;
      font-weight: 300;
      margin-bottom: 10px;
      line-height: 1;
      color: #000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .summary-item-label {
      font-size: 8pt;
      color: #000;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .summary-item-sublabel {
      font-size: 7pt;
      color: #666;
      margin-top: 6px;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }
    
    /* Section */
    .section {
      margin: 40px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
      display: flex;
      align-items: center;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .section-number {
      width: 26px;
      height: 26px;
      background: #000;
      color: #fff;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
      font-weight: 700;
      margin-right: 12px;
    }
    
    /* Issues */
    .issues-container {
      margin: 20px 0;
    }
    
    .issue-category {
      margin: 25px 0;
      page-break-inside: avoid;
    }
    
    .issue-category-title {
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .issue-category-icon {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .issue-category-icon.critical {
      background: #DC2626;
    }
    
    .issue-category-icon.warning {
      background: #d97706;
    }
    
    .issue-category-icon.improvement {
      background: #6b7280;
    }
    
    .issue-category-icon.compliant {
      background: #059669;
    }
    
    .issue-item {
      display: flex;
      margin: 10px 0;
      padding: 12px;
      border-left: 3px solid #000;
      background: #fff;
      border: 1px solid #ddd;
      border-left: 3px solid #000;
    }
    
    .issue-item.critical {
      border-left-width: 4px;
    }
    
    .issue-item.warning {
      border-left-width: 3px;
    }
    
    .issue-item.improvement {
      border-left-width: 2px;
    }
    
    .issue-bullet {
      font-size: 12pt;
      margin-right: 12px;
      line-height: 1.4;
      font-weight: 700;
    }
    
    .issue-bullet.critical {
      color: #DC2626;
    }
    
    .issue-bullet.warning {
      color: #d97706;
    }
    
    .issue-bullet.improvement {
      color: #6b7280;
    }
    
    .issue-content {
      flex: 1;
    }
    
    .issue-title {
      font-weight: 600;
      font-size: 10pt;
      margin-bottom: 4px;
    }
    
    .issue-desc {
      font-size: 9pt;
      color: #666;
    }
    
    /* Analysis Table */
    .analysis-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 9pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .analysis-table th {
      background: #000;
      color: #fff;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #000;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .analysis-table td {
      padding: 10px;
      border: 1px solid #e0e0e0;
      vertical-align: top;
    }
    
    .analysis-table tbody tr:nth-child(even) {
      background: #fafafa;
    }
    
    .analysis-table tbody tr:hover {
      background: #f5f5f5;
    }
    
    .status-check {
      font-weight: 700;
      font-size: 12pt;
      text-align: center;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }
    
    /* Info Box */
    .info-box {
      border: 1px solid #ddd;
      padding: 18px 20px;
      margin: 20px 0;
      background: #fafafa;
      font-size: 9pt;
      line-height: 1.7;
    }
    
    /* Print optimization */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .section, .issue-category, .summary-section {
        page-break-inside: avoid;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      .summary-section {
        box-shadow: none;
      }
      
      .summary-item {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
  <!-- Cover Page -->
  <div class="cover">
    <div class="logo">
      <img src="${logoUrl}" alt="Logo APDP" crossorigin="anonymous" />
      </div>
      
    <h1 class="cover-title">Rapport d'Analyse Web</h1>
    <p class="cover-subtitle">Analyse automatique - Sécurité & Bonnes Pratiques</p>
      
      <div class="cover-info">
        <div class="cover-info-row">
        <span class="cover-info-label">Site web analysé</span>
          <span class="cover-info-value">${data.url}</span>
        </div>
        <div class="cover-info-row">
        <span class="cover-info-label">Date d'analyse</span>
          <span class="cover-info-value">${currentDate}</span>
        </div>
      <div class="cover-info-row">
        <span class="cover-info-label">${(data.criticalIssues + data.warnings) <= 1 ? 'Problème détecté' : 'Problèmes détectés'}</span>
        <span class="cover-info-value">${data.criticalIssues + data.warnings} ${(data.criticalIssues + data.warnings) <= 1 ? 'problème' : 'problèmes'}</span>
      </div>
      <div class="cover-info-row">
        <span class="cover-info-label">Résultat</span>
        <span class="cover-info-value">${data.criticalIssues === 0 && data.warnings === 0 ? 'Aucun problème majeur détecté' : data.criticalIssues > 0 ? 'Points d\'attention identifiés' : 'Optimisations possibles'}</span>
      </div>
    </div>
    
    <p class="cover-footer">
      Outil d'analyse fourni par l'APDP Monaco
    </p>
  </div>

  <!-- Content Pages -->
  <div class="content">
    <!-- Header -->
      <div class="header">
      <div class="header-logo">
        <img src="${logoUrl}" alt="Logo APDP" crossorigin="anonymous" />
          </div>
          <div class="header-title">
        <h1>Analyse Web APDP</h1>
        <p>${data.url} • ${currentDate}</p>
        </div>
      </div>
      
    <!-- Summary Section -->
    <div class="summary-section">
      <div class="summary-title">Synthèse de l'analyse</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-item-number">${data.criticalIssues}</div>
          <div class="summary-item-label">${data.criticalIssues <= 1 ? 'Point Critique' : 'Points Critiques'}</div>
          <div class="summary-item-sublabel">Action requise</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-number">${data.warnings}</div>
          <div class="summary-item-label">${data.warnings <= 1 ? 'Avertissement' : 'Avertissements'}</div>
          <div class="summary-item-sublabel">À surveiller</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-number">${data.improvements}</div>
          <div class="summary-item-label">${data.improvements <= 1 ? 'Amélioration' : 'Améliorations'}</div>
          <div class="summary-item-sublabel">${data.improvements <= 1 ? 'Recommandée' : 'Recommandées'}</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-number">${data.compliantItems}</div>
          <div class="summary-item-label">${data.compliantItems <= 1 ? 'Conforme' : 'Conformes'}</div>
          <div class="summary-item-sublabel">${data.compliantItems <= 1 ? 'Validé' : 'Validés'}</div>
        </div>
      </div>
    </div>
    
    <!-- Info Box -->
    <div class="info-box">
      <strong>À propos de ce rapport :</strong><br><br>
      Ce document est généré automatiquement par notre outil d'analyse qui évolue continuellement pour vous accompagner dans l'amélioration de votre présence en ligne. Les vérifications portent sur différents aspects : sécurité, confidentialité, bonnes pratiques web et accessibilité.<br><br>
      <em style="font-size: 9pt; color: #666;">Note : Cet outil est fourni à titre informatif. Les résultats sont basés sur des analyses automatiques et ne constituent pas un audit de conformité juridique officiel. Nous vous recommandons de consulter des experts pour toute question spécifique.</em>
      </div>
    
    <!-- Site Information -->
    <div class="section">
      <div class="section-title">
        <div class="section-number">0</div>
        <span>Informations sur le site analysé</span>
      </div>
      
      <table class="analysis-table">
        <tbody>
          <tr>
            <td style="font-weight: 600; width: 30%;">Site web</td>
            <td>${data.url}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Date de l'analyse</td>
            <td>${new Date(data.timestamp).toLocaleString('fr-FR')}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">${(data.criticalIssues + data.warnings) <= 1 ? 'Problème détecté' : 'Problèmes détectés'}</td>
            <td>${data.criticalIssues + data.warnings} ${(data.criticalIssues + data.warnings) <= 1 ? 'problème' : 'problèmes'}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Résumé</td>
            <td>${data.criticalIssues} ${data.criticalIssues <= 1 ? 'critique' : 'critiques'} • ${data.warnings} ${data.warnings <= 1 ? 'avertissement' : 'avertissements'} • ${data.improvements} ${data.improvements <= 1 ? 'amélioration' : 'améliorations'} • ${data.compliantItems} ${data.compliantItems <= 1 ? 'conforme' : 'conformes'}</td>
          </tr>
        </tbody>
      </table>
  </div>

  ${data.issues?.critical && data.issues.critical.length > 0 ? `
    <!-- Critical Issues -->
    <div class="section">
      <div class="section-title">
        <div class="section-number" style="background: #DC2626;">1</div>
        <span>${data.criticalIssues <= 1 ? 'Point critique' : 'Points critiques'} (${data.criticalIssues})</span>
          </div>
      <div class="issues-container">
        <div class="issue-category">
          <div class="issue-category-title">
            <div class="issue-category-icon critical"></div>
            <span>Nécessitent une action rapide</span>
          </div>
          ${renderIssues(data.issues.critical, 'critical')}
        </div>
      </div>
          </div>
          ` : ''}
  
  ${data.issues?.warnings && data.issues.warnings.length > 0 ? `
    <!-- Warnings -->
    <div class="section">
      <div class="section-title">
        <div class="section-number" style="background: #d97706;">2</div>
        <span>${data.warnings <= 1 ? 'Avertissement' : 'Avertissements'} (${data.warnings})</span>
          </div>
      <div class="issues-container">
        <div class="issue-category">
          <div class="issue-category-title">
            <div class="issue-category-icon warning"></div>
            <span>À améliorer prochainement</span>
          </div>
          ${renderIssues(data.issues.warnings, 'warning')}
        </div>
      </div>
          </div>
          ` : ''}
  
  ${data.issues?.improvements && data.issues.improvements.length > 0 ? `
    <!-- Improvements -->
    <div class="section">
      <div class="section-title">
        <div class="section-number" style="background: #6b7280;">3</div>
        <span>${data.improvements <= 1 ? 'Optimisation possible' : 'Optimisations possibles'} (${data.improvements})</span>
          </div>
      <div class="issues-container">
        <div class="issue-category">
          <div class="issue-category-title">
            <div class="issue-category-icon improvement"></div>
            <span>Pour aller plus loin</span>
          </div>
          ${renderIssues(data.issues.improvements, 'improvement')}
        </div>
      </div>
          </div>
          ` : ''}

    ${data.issues?.compliant && data.issues.compliant.length > 0 ? `
    <!-- Compliant Items -->
    <div class="section">
      <div class="section-title">
        <div class="section-number" style="background: #059669;">4</div>
        <span>${data.compliantItems <= 1 ? 'Point positif' : 'Points positifs'} (${data.compliantItems})</span>
        </div>
      <div class="issues-container">
        <div class="issue-category">
          <div class="issue-category-title">
            <div class="issue-category-icon compliant"></div>
            <span>Déjà bien configurés</span>
          </div>
          <div class="info-box" style="margin-bottom: 15px;">
            <p style="font-weight: 600;">Bravo ! Ces éléments sont correctement mis en place.</p>
        </div>
          ${renderIssues(data.issues.compliant.slice(0, 15), 'improvement')}
      </div>
        </div>
        </div>
        ` : ''}
    
    ${analysisResults.length > 0 ? `
    <!-- Analysis Results -->
    <div class="section">
      <div class="section-title">
        <div class="section-number">5</div>
        <span>Détail de l'analyse technique (${analysisResults.length} contrôles)</span>
          </div>
      
      <table class="analysis-table">
        <thead>
          <tr>
            <th style="width: 10%;">Statut</th>
            <th style="width: 35%;">Point de contrôle</th>
            <th style="width: 55%;">Détail</th>
          </tr>
        </thead>
        <tbody>
          ${analysisResults.map(result => `
            <tr>
              <td class="status-check">${result.status}</td>
              <td>${result.name}</td>
              <td>${result.detail}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; padding: 12px; background: #fafafa; border-left: 3px solid #000; font-size: 9pt;">
        <strong>Légende des statuts :</strong><br>
        ✓ = Conforme | ✗ = Non conforme | ! = Attention requise | ○ = Information
          </div>
        </div>
        ` : ''}
        
    <!-- Recommendations Summary -->
    <div class="section">
      <div class="section-title">
        <div class="section-number">6</div>
        <span>Plan d'action recommandé</span>
          </div>
      
      ${data.criticalIssues > 0 ? `
      <div class="info-box" style="border-left: 4px solid #DC2626; margin-bottom: 20px;">
        <p style="margin-bottom: 10px;"><strong style="font-size: 11pt; color: #DC2626;">PRIORITÉ 1 — ${data.criticalIssues <= 1 ? 'Action urgente' : 'Actions urgentes'} (${data.criticalIssues} ${data.criticalIssues <= 1 ? 'point' : 'points'})</strong></p>
        <p style="margin-bottom: 10px; line-height: 1.7;">Ces problèmes méritent une attention immédiate car ils peuvent impacter directement la sécurité de vos utilisateurs ou exposer des données sensibles :</p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><strong>Certificat SSL invalide :</strong> Installez un certificat SSL valide via Let's Encrypt (gratuit) ou votre hébergeur</li>
          <li><strong>Politique de confidentialité manquante :</strong> Rédigez et publiez une page dédiée accessible depuis le footer</li>
          <li><strong>Bandeau de cookies absent :</strong> Intégrez une solution comme Axeptio, Cookiebot ou Tarteaucitron.js</li>
          <li><strong>En-têtes de sécurité manquants :</strong> Configurez HSTS, X-Frame-Options et Content-Security-Policy</li>
        </ul>
        <p style="margin-top: 10px; font-style: italic;">Délai recommandé : 1 à 2 semaines</p>
              </div>
              ` : ''}
      
      ${data.warnings > 0 ? `
      <div class="info-box" style="border-left: 3px solid #d97706; margin-bottom: 20px;">
        <p style="margin-bottom: 10px;"><strong style="font-size: 11pt; color: #d97706;">PRIORITÉ 2 — ${data.warnings <= 1 ? 'Point d\'attention' : 'Points d\'attention'} (${data.warnings} ${data.warnings <= 1 ? 'point' : 'points'})</strong></p>
        <p style="margin-bottom: 10px; line-height: 1.7;">Ces améliorations renforceront la confiance de vos visiteurs et optimiseront votre conformité :</p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><strong>Mentions légales incomplètes :</strong> Ajoutez éditeur, hébergeur, directeur de publication</li>
          <li><strong>Cookies tiers détectés :</strong> Documentez leur utilisation et obtenez le consentement</li>
          <li><strong>Contenu mixte HTTP/HTTPS :</strong> Forcez le chargement de toutes les ressources en HTTPS</li>
          <li><strong>Redirections multiples :</strong> Optimisez pour améliorer les performances</li>
        </ul>
        <p style="margin-top: 10px; font-style: italic;">Délai recommandé : 1 mois</p>
          </div>
          ` : ''}
      
      ${data.improvements > 0 ? `
      <div class="info-box" style="border-left: 2px solid #6b7280; margin-bottom: 20px;">
        <p style="margin-bottom: 10px;"><strong style="font-size: 11pt; color: #6b7280;">PRIORITÉ 3 — ${data.improvements <= 1 ? 'Optimisation' : 'Optimisations'} (${data.improvements} ${data.improvements <= 1 ? 'point' : 'points'})</strong></p>
        <p style="margin-bottom: 10px; line-height: 1.7;">Ces améliorations valoriseront votre site et amélioreront l'expérience utilisateur :</p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><strong>Accessibilité :</strong> Ajoutez des attributs alt aux images, améliorez le contraste des couleurs</li>
          <li><strong>Performance :</strong> Compressez les images, activez la mise en cache, minifiez CSS/JS</li>
          <li><strong>SEO :</strong> Complétez les balises meta, ajoutez un sitemap XML, optimisez robots.txt</li>
          <li><strong>Sécurité avancée :</strong> Activez DNSSEC, configurez un WAF (pare-feu applicatif)</li>
        </ul>
        <p style="margin-top: 10px; font-style: italic;">Délai recommandé : 2 à 3 mois</p>
        </div>
        ` : ''}
      
      ${data.compliantItems > 0 ? `
      <div class="info-box" style="border-left: 3px solid #059669;">
        <p style="margin-bottom: 10px;"><strong style="font-size: 11pt; color: #059669;">${data.compliantItems <= 1 ? 'Point positif' : 'Points positifs'} (${data.compliantItems} ${data.compliantItems <= 1 ? 'élément' : 'éléments'})</strong></p>
        <p style="line-height: 1.7;">Félicitations ! Plusieurs éléments de votre site sont déjà bien configurés. Continuez à maintenir ces bonnes pratiques lors de vos futures mises à jour.</p>
      </div>
      ` : ''}
      
      <div class="info-box" style="border: 2px solid #000; margin-top: 20px;">
        <p style="margin-bottom: 10px;"><strong style="font-size: 11pt;">Besoin d'aide ?</strong></p>
        <p style="line-height: 1.7; margin-bottom: 10px;">Si vous avez besoin d'assistance pour mettre en œuvre ces recommandations :</p>
        <ul style="margin-left: 20px; line-height: 1.8; margin-bottom: 10px;">
          <li>Contactez votre développeur web ou votre agence</li>
          <li>Consultez la documentation de votre CMS (WordPress, Shopify, etc.)</li>
          <li>Utilisez des outils comme GTmetrix, PageSpeed Insights pour les performances</li>
          <li>Testez régulièrement votre site avec notre outil pour suivre vos progrès</li>
        </ul>
        <p style="font-style: italic; color: #666; font-size: 9pt;">Rappel : Notre outil effectue des analyses automatiques. Pour un audit approfondi, nous recommandons de faire appel à un expert en cybersécurité et protection des données.</p>
        </div>
        </div>
      
    <!-- Footer -->
      <div class="footer">
      <p><strong>À propos de cet outil</strong></p>
      <p>Ce rapport est généré automatiquement par un outil d'analyse en amélioration continue.</p>
      <p>Les résultats sont fournis à titre informatif pour vous aider à améliorer votre site web.</p>
      <p>Pour plus d'informations : <strong>jetestemonsite.apdp.mc</strong></p>
      <p style="margin-top: 15px; font-size: 7pt; font-style: italic;">Autorité de Protection des Données Personnelles de Monaco</p>
      <p style="font-size: 7pt;">Document généré le ${new Date(data.timestamp).toLocaleString('fr-FR')} • Version ${new Date().getFullYear()}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateComplianceReportHTML = async (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any,
  allResults?: any
): Promise<void> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    console.log('🔄 Début de la génération du PDF...');
    console.log('📊 Données reçues:', { 
      url: data.url, 
      score: data.numericScore,
      criticalIssues: data.criticalIssues,
      warnings: data.warnings 
    });
    
    // Dynamically import html2pdf.js only when needed (browser-only)
    console.log('📦 Chargement de html2pdf.js...');
    let html2pdf;
    try {
      const module = await import('html2pdf.js');
      html2pdf = module.default || module;
      console.log('✅ html2pdf.js chargé avec succès');
    } catch (importError) {
      console.error('❌ Erreur lors du chargement de html2pdf.js:', importError);
      throw new Error('Impossible de charger la bibliothèque PDF. Vérifiez que html2pdf.js est installé.');
    }
    
    // Generate HTML with all data
    console.log('📝 Génération du contenu HTML...');
    const htmlContent = generateHTMLReport(data, vulnerabilities, cdnResources, allResults);
    console.log('✅ Contenu HTML généré, taille:', htmlContent.length, 'caractères');
    
    // PDF options - optimized for clean output
    const filename = `Rapport-APDP-${data.url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 40)}-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('📄 Nom du fichier:', filename);
    
    const options = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    console.log('⚙️ Options PDF configurées');
    
    // Generate PDF
    console.log('🎨 Conversion HTML → PDF en cours...');
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('✅ PDF généré et téléchargé avec succès!');
  } catch (error) {
    console.error('❌ Erreur complète lors de la génération du PDF:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    throw new Error(`Échec de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

export const openComplianceReportHTML = async (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any,
  allResults?: any
): Promise<void> => {
  try {
    // Generate HTML with all data
    const htmlContent = generateHTMLReport(data, vulnerabilities, cdnResources, allResults);
    
    // Open in new window for preview
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      console.log('✓ Report opened in new window');
    } else {
      throw new Error('Impossible d\'ouvrir une nouvelle fenêtre. Veuillez autoriser les pop-ups.');
    }
  } catch (error) {
    console.error('Error opening report:', error);
    throw new Error(`Échec de l'ouverture du rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

export default generateComplianceReportHTML;
