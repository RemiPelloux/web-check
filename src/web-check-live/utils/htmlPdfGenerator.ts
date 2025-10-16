// HTML-based PDF Generation for APDP compliance reports
// Using html2pdf.js for beautiful, professional PDFs

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
  const scoreColor = data.numericScore >= 80 ? '#059669' : 
                     data.numericScore >= 60 ? '#D97706' : '#DC2626';
  
  const currentDate = new Date(data.timestamp).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Conformité APDP - ${data.url}</title>
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #111827;
      background: white;
    }
    
    .page {
      page-break-after: always;
      page-break-inside: avoid;
      margin-bottom: 20mm;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: auto;
      margin-bottom: 0;
    }
    
    .content-page {
      padding: 15mm 10mm 10mm 10mm;
    }
    
    /* Cover Page Styles */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 260mm;
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      color: white;
      padding: 40mm 20mm;
      margin: -15mm -10mm;
    }
    
    .cover-logo {
      width: 120px;
      height: 120px;
      background: white;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .cover-logo-text {
      font-size: 42pt;
      font-weight: 900;
      color: #DC2626;
      line-height: 1;
    }
    
    .cover-logo-subtitle {
      font-size: 14pt;
      color: #991B1B;
      font-weight: 600;
      margin-top: 5px;
    }
    
    .cover-title {
      font-size: 48pt;
      font-weight: 900;
      margin: 30px 0 20px 0;
      letter-spacing: 1px;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .cover-subtitle {
      font-size: 20pt;
      font-weight: 300;
      margin-bottom: 60px;
      opacity: 0.95;
    }
    
    .cover-info {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 30px 40px;
      margin: 40px 0;
      min-width: 60%;
    }
    
    .cover-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 15px 0;
      font-size: 12pt;
    }
    
    .cover-info-label {
      font-weight: 600;
      opacity: 0.9;
    }
    
    .cover-info-value {
      font-weight: 400;
      text-align: right;
    }
    
    .cover-footer {
      margin-top: auto;
      font-size: 9pt;
      opacity: 0.8;
      font-style: italic;
    }
    
    /* Header for content pages */
    .header {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      padding: 15px 20px;
      margin: -15mm -10mm 15px -10mm;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo-box {
      width: 80px;
      height: 60px;
      background: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #DC2626;
      font-size: 11pt;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .header-title {
      flex: 1;
      margin-left: 30px;
    }
    
    .header-title h1 {
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    
    .header-title p {
      font-size: 11pt;
      opacity: 0.95;
      font-weight: 300;
    }
    
    /* Info Box */
    .info-box {
      background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
      border-left: 4px solid #DC2626;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .info-box h3 {
      font-size: 11pt;
      color: #DC2626;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .info-row {
      display: flex;
      margin: 5px 0;
      font-size: 9pt;
    }
    
    .info-label {
      font-weight: 600;
      color: #374151;
      min-width: 120px;
    }
    
    .info-value {
      color: #111827;
    }
    
    /* Section Title */
    .section {
      margin: 25px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      margin: 20px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #DC2626;
    }
    
    .section-number {
      background: #DC2626;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12pt;
      margin-right: 12px;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
    }
    
    .section-title h2 {
      font-size: 14pt;
      color: #111827;
      font-weight: 700;
    }
    
    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
      border: 2px solid ${scoreColor};
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      page-break-inside: avoid;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 6px solid ${scoreColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      margin-right: 30px;
      flex-shrink: 0;
    }
    
    .score-grade {
      font-size: 14pt;
      font-weight: bold;
      color: ${scoreColor};
      margin-bottom: 5px;
    }
    
    .score-number {
      font-size: 32pt;
      font-weight: 700;
      color: ${scoreColor};
      line-height: 1;
    }
    
    .score-max {
      font-size: 11pt;
      color: #6B7280;
    }
    
    .score-details {
      flex: 1;
    }
    
    .score-details h3 {
      font-size: 16pt;
      color: #111827;
      margin-bottom: 8px;
      font-weight: 700;
    }
    
    .score-level {
      font-size: 11pt;
      color: #374151;
      margin-bottom: 12px;
    }
    
    .score-status {
      background: ${scoreColor};
      color: white;
      padding: 8px 15px;
      border-radius: 6px;
      display: inline-block;
      font-weight: 600;
      font-size: 10pt;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .score-interpretation {
      margin-top: 10px;
      font-size: 9pt;
      color: #6B7280;
      font-style: italic;
    }
    
    /* Summary Cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    
    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      border: 2px solid #E5E7EB;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }
    
    .summary-card.critical {
      border-top: 4px solid #DC2626;
      background: linear-gradient(180deg, #FEF2F2 0%, white 100%);
    }
    
    .summary-card.warning {
      border-top: 4px solid #D97706;
      background: linear-gradient(180deg, #FFFBEB 0%, white 100%);
    }
    
    .summary-card.info {
      border-top: 4px solid #1E40AF;
      background: linear-gradient(180deg, #EFF6FF 0%, white 100%);
    }
    
    .summary-card.success {
      border-top: 4px solid #059669;
      background: linear-gradient(180deg, #F0FDF4 0%, white 100%);
    }
    
    .summary-number {
      font-size: 28pt;
      font-weight: 700;
      margin: 5px 0;
    }
    
    .summary-card.critical .summary-number { color: #DC2626; }
    .summary-card.warning .summary-number { color: #D97706; }
    .summary-card.info .summary-number { color: #1E40AF; }
    .summary-card.success .summary-number { color: #059669; }
    
    .summary-label {
      font-size: 9pt;
      font-weight: 600;
      color: #111827;
      margin-top: 5px;
    }
    
    .summary-sublabel {
      font-size: 8pt;
      color: #6B7280;
      margin-top: 2px;
    }
    
    /* Category Cards */
    .category-card {
      background: white;
      border-left: 4px solid #E5E7EB;
      padding: 12px 15px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }
    
    .category-card.good { border-left-color: #059669; background: linear-gradient(90deg, #F0FDF4 0%, white 100%); }
    .category-card.warning { border-left-color: #D97706; background: linear-gradient(90deg, #FFFBEB 0%, white 100%); }
    .category-card.critical { border-left-color: #DC2626; background: linear-gradient(90deg, #FEF2F2 0%, white 100%); }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .category-name {
      font-weight: 600;
      font-size: 10pt;
      color: #111827;
    }
    
    .category-score {
      font-weight: 700;
      font-size: 12pt;
    }
    
    .category-card.good .category-score { color: #059669; }
    .category-card.warning .category-score { color: #D97706; }
    .category-card.critical .category-score { color: #DC2626; }
    
    .category-issues {
      font-size: 8pt;
      color: #6B7280;
      margin-bottom: 8px;
    }
    
    .progress-bar {
      height: 6px;
      background: #E5E7EB;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s;
    }
    
    .category-card.good .progress-fill { background: linear-gradient(90deg, #059669, #10B981); }
    .category-card.warning .progress-fill { background: linear-gradient(90deg, #D97706, #F59E0B); }
    .category-card.critical .progress-fill { background: linear-gradient(90deg, #DC2626, #EF4444); }
    
    /* Issue Cards */
    .issue-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin: 12px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      border-left: 4px solid #E5E7EB;
      page-break-inside: avoid;
    }
    
    .issue-card.critical { border-left-color: #DC2626; }
    .issue-card.warning { border-left-color: #D97706; }
    .issue-card.info { border-left-color: #1E40AF; }
    
    .issue-header {
      display: flex;
      align-items: start;
      margin-bottom: 10px;
    }
    
    .issue-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #DC2626;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 10pt;
      flex-shrink: 0;
      margin-right: 10px;
    }
    
    .issue-card.warning .issue-number { background: #D97706; }
    .issue-card.info .issue-number { background: #1E40AF; }
    
    .issue-title-block {
      flex: 1;
    }
    
    .issue-title {
      font-size: 11pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 5px;
      line-height: 1.4;
    }
    
    .issue-category {
      display: inline-block;
      background: #DC2626;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
    }
    
    .issue-card.warning .issue-category { background: #D97706; }
    .issue-card.info .issue-category { background: #1E40AF; }
    
    .issue-description {
      font-size: 9pt;
      color: #374151;
      margin: 10px 0;
      line-height: 1.5;
    }
    
    .issue-recommendation {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-left: 3px solid #1E40AF;
      padding: 10px 12px;
      border-radius: 0 6px 6px 0;
      margin: 10px 0;
    }
    
    .recommendation-title {
      font-size: 9pt;
      font-weight: 700;
      color: #1E40AF;
      margin-bottom: 5px;
    }
    
    .recommendation-text {
      font-size: 9pt;
      color: #1F2937;
      line-height: 1.5;
    }
    
    .issue-metadata {
      display: flex;
      gap: 15px;
      font-size: 8pt;
      color: #6B7280;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #E5E7EB;
    }
    
    .metadata-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .metadata-label {
      font-weight: 600;
    }
    
    .issue-legal {
      font-size: 8pt;
      color: #DC2626;
      font-style: italic;
      margin-top: 5px;
    }
    
    /* Alert Boxes */
    .alert-box {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid;
      page-break-inside: avoid;
    }
    
    .alert-box.critical {
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      border-left-color: #DC2626;
    }
    
    .alert-box.warning {
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
      border-left-color: #D97706;
    }
    
    .alert-box.info {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-left-color: #1E40AF;
    }
    
    .alert-title {
      font-weight: 700;
      font-size: 10pt;
      margin-bottom: 5px;
    }
    
    .alert-box.critical .alert-title { color: #DC2626; }
    .alert-box.warning .alert-title { color: #D97706; }
    .alert-box.info .alert-title { color: #1E40AF; }
    
    .alert-text {
      font-size: 9pt;
      color: #374151;
    }
    
    /* Footer */
    .footer {
      margin-top: 20px;
      padding: 12px 0 8px 0;
      border-top: 2px solid #E5E7EB;
      font-size: 8pt;
      color: #6B7280;
      page-break-inside: avoid;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .footer-left {
      flex: 1;
      font-size: 7pt;
    }
    
    .footer-center {
      flex: 1;
      text-align: center;
      font-size: 7pt;
    }
    
    .footer-right {
      flex: 1;
      text-align: right;
      font-size: 8pt;
      font-weight: 600;
    }
    
    .footer strong {
      color: #111827;
      font-size: 7pt;
    }
    
    .confidential {
      text-align: center;
      font-size: 7pt;
      color: #6B7280;
      font-style: italic;
      margin-top: 4px;
    }
    
    /* Print Styles */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page">
    <div class="cover-page">
      <div class="cover-logo">
        <div class="cover-logo-text">APDP</div>
        <div class="cover-logo-subtitle">MONACO</div>
      </div>
      
      <h1 class="cover-title">RAPPORT DE CONFORMITÉ</h1>
      <p class="cover-subtitle">Audit de Sécurité et Protection des Données Personnelles</p>
      
      <div class="cover-info">
        <div class="cover-info-row">
          <span class="cover-info-label">Site audité:</span>
          <span class="cover-info-value">${data.url}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Date d'audit:</span>
          <span class="cover-info-value">${currentDate}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Type d'analyse:</span>
          <span class="cover-info-value">Audit Complet APDP</span>
        </div>
        <div class="cover-info-row" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
          <span class="cover-info-label">Score de conformité:</span>
          <span class="cover-info-value" style="font-size: 24pt; font-weight: 700;">${data.numericScore}/100</span>
        </div>
      </div>
      
      <div class="cover-footer">
        DOCUMENT CONFIDENTIEL - Autorité de Protection des Données Personnelles de Monaco
      </div>
    </div>
  </div>

  <!-- Page 1: Executive Summary -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>RÉSUMÉ EXÉCUTIF</h1>
            <p>Vue d'ensemble de la conformité</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <div class="score-card">
        <div class="score-circle">
          <div class="score-grade">Note ${data.overallScore}</div>
          <div class="score-number">${data.numericScore}</div>
          <div class="score-max">/100</div>
        </div>
        <div class="score-details">
          <h3>ÉVALUATION DE CONFORMITÉ APDP</h3>
          <div class="score-level">Niveau de conformité: ${data.complianceLevel}</div>
          <div class="score-status">
            ${data.numericScore >= 80 ? 'CONFORME - Excellente protection des données' :
              data.numericScore >= 60 ? 'PARTIELLEMENT CONFORME - Améliorations requises' :
              'NON CONFORME - Actions correctives urgentes'}
          </div>
          <div class="score-interpretation">
            ${data.numericScore >= 80 ? 'Vos pratiques respectent les exigences APDP' :
              data.numericScore >= 60 ? 'Des améliorations sont nécessaires pour une conformité complète' :
              'Exposition significative aux risques juridiques et sécuritaires'}
          </div>
        </div>
      </div>
      
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #111827;">SYNTHÈSE DES CONSTATATIONS</h3>
      <div class="summary-grid">
        <div class="summary-card critical">
          <div class="summary-number">${data.criticalIssues}</div>
          <div class="summary-label">CRITIQUES</div>
          <div class="summary-sublabel">Action immédiate</div>
        </div>
        <div class="summary-card warning">
          <div class="summary-number">${data.warnings}</div>
          <div class="summary-label">IMPORTANTS</div>
          <div class="summary-sublabel">À corriger</div>
        </div>
        <div class="summary-card info">
          <div class="summary-number">${data.improvements}</div>
          <div class="summary-label">SUGGESTIONS</div>
          <div class="summary-sublabel">Améliorations</div>
        </div>
        <div class="summary-card success">
          <div class="summary-number">${data.compliantItems}</div>
          <div class="summary-label">CONFORMES</div>
          <div class="summary-sublabel">Validées</div>
        </div>
      </div>
      
      <div class="alert-box info">
        <div class="alert-text">
          Ce rapport présente une évaluation complète de la conformité et de la sécurité de votre site web selon les exigences de l'Autorité de Protection des Données Personnelles de Monaco (APDP) et les meilleures pratiques de sécurité internationale.
        </div>
      </div>
    </div>
    
    ${data.categories ? `
    <div class="section" style="page-break-before: avoid;">
      <div class="section-title">
        <div class="section-number">2</div>
        <h2>ANALYSE PAR CATÉGORIE</h2>
      </div>
      ${Object.entries(data.categories).map(([name, cat]: [string, any]) => `
        <div class="category-card ${cat.status}">
          <div class="category-header">
            <div class="category-name">${name}</div>
            <div class="category-score">${cat.score}/100</div>
          </div>
          <div class="category-issues">${cat.issues} problème(s) détecté(s)</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${cat.score}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <!-- Detailed Controls Section -->
    <div class="section" style="page-break-before: avoid; margin-top: 20px;">
      <div class="section-title">
        <div class="section-number">3</div>
        <h2>DÉTAIL DES CONTRÔLES</h2>
      </div>
      <div style="font-size: 8pt; color: #6B7280; margin-bottom: 15px; font-style: italic;">
        Synthèse exhaustive des ${Object.keys(allResults || {}).length}+ points de contrôle analysés automatiquement
      </div>
      
      <!-- Security & Encryption -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">🔒 SÉCURITÉ & CHIFFREMENT</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="background: ${allResults?.ssl?.valid ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.ssl?.valid ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.ssl?.valid ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">SSL/TLS</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.ssl?.valid ? 'Valide' : 'Invalide'}</div>
          ${allResults?.ssl?.protocol ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults.ssl.protocol}</div>` : ''}
        </div>
        <div class="summary-card" style="background: ${allResults?.hsts?.isEnabled ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.hsts?.isEnabled ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.hsts?.isEnabled ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">HSTS</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.hsts?.isEnabled ? 'Activé' : 'Désactivé'}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🔐</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Cipher Suites</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.['tls-cipher-suites']?.supportedCiphers?.length || 0} détecté(s)</div>
          ${allResults?.['tls-cipher-suites']?.supportedCiphers?.[0]?.bits ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['tls-cipher-suites'].supportedCiphers[0].bits} bits</div>` : ''}
        </div>
        <div class="summary-card" style="background: ${(allResults?.vulnerabilities?.length || 0) === 0 ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${(allResults?.vulnerabilities?.length || 0) === 0 ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${(allResults?.vulnerabilities?.length || 0) === 0 ? '✅' : '⚠️'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Vulnérabilités</div>
          <div style="font-size: 8pt; color: ${(allResults?.vulnerabilities?.length || 0) === 0 ? '#16A34A' : '#DC2626'};">${allResults?.vulnerabilities?.length || 0} détectée(s)</div>
        </div>
      </div>
      
      <!-- APDP Compliance -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">📋 CONFORMITÉ APDP/RGPD</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="background: ${
          allResults?.['apdp-cookie-banner']?.compliance?.level === 'Conforme' ? '#F0FDF4' : 
          allResults?.['apdp-cookie-banner']?.compliance?.level === 'Partiellement conforme' ? '#FFFBEB' : 
          '#FEF2F2'
        }; border-left: 3px solid ${
          allResults?.['apdp-cookie-banner']?.compliance?.level === 'Conforme' ? '#16A34A' : 
          allResults?.['apdp-cookie-banner']?.compliance?.level === 'Partiellement conforme' ? '#F59E0B' : 
          '#DC2626'
        }; padding: 12px;">
          <div style="font-size: 18pt;">${
            allResults?.['apdp-cookie-banner']?.compliance?.level === 'Conforme' ? '✅' : 
            allResults?.['apdp-cookie-banner']?.compliance?.level === 'Partiellement conforme' ? '⚠️' : 
            '❌'
          }</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Bannière Cookies</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.['apdp-cookie-banner']?.compliance?.level || 'Non analysée'}</div>
          ${allResults?.['apdp-cookie-banner']?.detectedLibrary ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-cookie-banner'].detectedLibrary}</div>` : ''}
          ${allResults?.['apdp-cookie-banner']?.compliance?.score ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-cookie-banner'].compliance.score}/100</div>` : ''}
        </div>
        <div class="summary-card" style="background: ${
          allResults?.['apdp-privacy-policy']?.compliance?.level === 'Conforme' ? '#F0FDF4' : 
          allResults?.['apdp-privacy-policy']?.compliance?.level === 'Partiellement conforme' ? '#FFFBEB' : 
          '#FEF2F2'
        }; border-left: 3px solid ${
          allResults?.['apdp-privacy-policy']?.compliance?.level === 'Conforme' ? '#16A34A' : 
          allResults?.['apdp-privacy-policy']?.compliance?.level === 'Partiellement conforme' ? '#F59E0B' : 
          '#DC2626'
        }; padding: 12px;">
          <div style="font-size: 18pt;">${
            allResults?.['apdp-privacy-policy']?.compliance?.level === 'Conforme' ? '✅' : 
            allResults?.['apdp-privacy-policy']?.compliance?.level === 'Partiellement conforme' ? '⚠️' : 
            '❌'
          }</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Politique Confidentialité</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.['apdp-privacy-policy']?.compliance?.level || 'Non analysée'}</div>
          ${allResults?.['apdp-privacy-policy']?.compliance?.score ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-privacy-policy'].compliance.score}/100</div>` : ''}
          ${allResults?.['apdp-privacy-policy']?.sections?.found && allResults?.['apdp-privacy-policy']?.sections?.missing ? `
          <div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">
            ${allResults['apdp-privacy-policy'].sections.found.length}/${allResults['apdp-privacy-policy'].sections.found.length + allResults['apdp-privacy-policy'].sections.missing.length} sections
          </div>
          ` : ''}
        </div>
        <div class="summary-card" style="background: ${
          allResults?.['apdp-legal-notices']?.compliance?.level === 'Conforme' ? '#F0FDF4' : 
          allResults?.['apdp-legal-notices']?.compliance?.level === 'Partiellement conforme' ? '#FFFBEB' : 
          '#FEF2F2'
        }; border-left: 3px solid ${
          allResults?.['apdp-legal-notices']?.compliance?.level === 'Conforme' ? '#16A34A' : 
          allResults?.['apdp-legal-notices']?.compliance?.level === 'Partiellement conforme' ? '#F59E0B' : 
          '#DC2626'
        }; padding: 12px;">
          <div style="font-size: 18pt;">${
            allResults?.['apdp-legal-notices']?.compliance?.level === 'Conforme' ? '✅' : 
            allResults?.['apdp-legal-notices']?.compliance?.level === 'Partiellement conforme' ? '⚠️' : 
            '❌'
          }</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Mentions Légales</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.['apdp-legal-notices']?.compliance?.level || 'Non analysées'}</div>
          ${allResults?.['apdp-legal-notices']?.compliance?.score ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-legal-notices'].compliance.score}/100</div>` : ''}
          ${allResults?.['apdp-legal-notices']?.requiredInfo?.found && allResults?.['apdp-legal-notices']?.requiredInfo?.missing ? `
          <div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">
            ${allResults['apdp-legal-notices'].requiredInfo.found.length}/${allResults['apdp-legal-notices'].requiredInfo.found.length + allResults['apdp-legal-notices'].requiredInfo.missing.length} infos
          </div>
          ` : ''}
        </div>
        <div class="summary-card" style="background: ${
          allResults?.['apdp-user-rights']?.compliance?.level === 'Conforme' ? '#F0FDF4' : 
          allResults?.['apdp-user-rights']?.compliance?.level === 'Partiellement conforme' ? '#FFFBEB' : 
          '#FEF2F2'
        }; border-left: 3px solid ${
          allResults?.['apdp-user-rights']?.compliance?.level === 'Conforme' ? '#16A34A' : 
          allResults?.['apdp-user-rights']?.compliance?.level === 'Partiellement conforme' ? '#F59E0B' : 
          '#DC2626'
        }; padding: 12px;">
          <div style="font-size: 18pt;">${
            allResults?.['apdp-user-rights']?.compliance?.level === 'Conforme' ? '✅' : 
            allResults?.['apdp-user-rights']?.compliance?.level === 'Partiellement conforme' ? '⚠️' : 
            '❌'
          }</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Droits Utilisateurs</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.['apdp-user-rights']?.compliance?.level || 'Non analysés'}</div>
          ${allResults?.['apdp-user-rights']?.rightsFound ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-user-rights'].rightsFound}/6 droits détectés</div>` : ''}
          ${allResults?.['apdp-user-rights']?.compliance?.score ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults['apdp-user-rights'].compliance.score}/100</div>` : ''}
        </div>
      </div>
      
      <!-- Cookies & Tracking -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">🍪 COOKIES & TRACKING</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🍪</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Total Cookies</div>
          <div style="font-size: 12pt; font-weight: 700; color: ${(allResults?.cookies?.clientCookies?.length || 0) > 10 ? '#D97706' : '#059669'};">${allResults?.cookies?.clientCookies?.length || allResults?.cookies?.cookies?.length || 0}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🔒</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Cookies Sécurisés</div>
          <div style="font-size: 12pt; font-weight: 700; color: #059669;">${(allResults?.cookies?.clientCookies || allResults?.cookies?.cookies || []).filter((c: any) => c.secure).length || 0}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">📊</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Outils Analytics</div>
          <div style="font-size: 12pt; font-weight: 700; color: ${(allResults?.['tech-stack']?.analytics?.length || 0) > 3 ? '#D97706' : '#059669'};">${allResults?.['tech-stack']?.analytics?.length || 0}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🌍</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Ressources Externes</div>
          <div style="font-size: 12pt; font-weight: 700;">${allResults?.['cdn-resources']?.externalResources?.length || 0}</div>
        </div>
      </div>
      
      <!-- HTTP Security Headers -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">🛡️ EN-TÊTES DE SÉCURITÉ HTTP</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="background: ${allResults?.headers?.['Content-Security-Policy'] ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.headers?.['Content-Security-Policy'] ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.headers?.['Content-Security-Policy'] ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">CSP</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.headers?.['Content-Security-Policy'] ? 'Configuré' : 'Manquant'}</div>
        </div>
        <div class="summary-card" style="background: ${allResults?.headers?.['X-Frame-Options'] ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.headers?.['X-Frame-Options'] ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.headers?.['X-Frame-Options'] ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">X-Frame-Options</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.headers?.['X-Frame-Options'] || 'Manquant'}</div>
        </div>
        <div class="summary-card" style="background: ${allResults?.headers?.['X-Content-Type-Options'] ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.headers?.['X-Content-Type-Options'] ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.headers?.['X-Content-Type-Options'] ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">X-Content-Type</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.headers?.['X-Content-Type-Options'] || 'Manquant'}</div>
        </div>
        <div class="summary-card" style="background: ${allResults?.headers?.['Strict-Transport-Security'] ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.headers?.['Strict-Transport-Security'] ? '#16A34A' : '#DC2626'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.headers?.['Strict-Transport-Security'] ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">HSTS Header</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.headers?.['Strict-Transport-Security'] ? 'Présent' : 'Manquant'}</div>
        </div>
      </div>
      
      <!-- Infrastructure & Network -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">🌐 INFRASTRUCTURE & RÉSEAU</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">📍</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Localisation</div>
          <div style="font-size: 8pt; font-weight: 600;">${allResults?.location?.country || 'Inconnue'}</div>
          ${allResults?.location?.city ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 2px;">${allResults.location.city}</div>` : ''}
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🖥️</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Serveur Web</div>
          <div style="font-size: 8pt; font-weight: 600;">${allResults?.['tech-stack']?.server || allResults?.headers?.Server || 'Inconnu'}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🌐</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">DNS Records</div>
          <div style="font-size: 12pt; font-weight: 700;">${(allResults?.dns?.A?.length || 0) + (allResults?.dns?.AAAA?.length || 0)}</div>
        </div>
        <div class="summary-card" style="background: ${allResults?.dnssec?.valid ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.dnssec?.valid ? '#16A34A' : '#D97706'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.dnssec?.valid ? '✅' : '⚠️'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">DNSSEC</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.dnssec?.valid ? 'Validé' : 'Non validé'}</div>
        </div>
      </div>
      
      <!-- Performance & Environment -->
      <h3 style="font-size: 10pt; color: #DC2626; margin: 15px 0 10px 0; border-bottom: 2px solid #DC2626; padding-bottom: 4px;">⚡ PERFORMANCE & ENVIRONNEMENT</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🌱</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Empreinte CO2</div>
          <div style="font-size: 8pt; font-weight: 600;">${allResults?.carbon?.statistics?.co2?.grid?.grams ? `${allResults.carbon.statistics.co2.grid.grams.toFixed(2)}g` : 'N/A'}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">📊</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Note Environnementale</div>
          <div style="font-size: 12pt; font-weight: 700; color: ${allResults?.carbon?.rating?.startsWith('A') ? '#16A34A' : '#D97706'};">${allResults?.carbon?.rating || 'N/A'}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">📈</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Frameworks</div>
          <div style="font-size: 12pt; font-weight: 700;">${allResults?.['tech-stack']?.frameworks?.length || 0}</div>
        </div>
        <div class="summary-card" style="padding: 12px;">
          <div style="font-size: 18pt;">🚀</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">CDN Providers</div>
          <div style="font-size: 12pt; font-weight: 700;">${allResults?.['cdn-resources']?.cdnProviders?.length || 0}</div>
        </div>
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-radius: 6px; border-left: 4px solid #3B82F6;">
        <div style="font-size: 8pt; color: #1E3A8A; line-height: 1.5;">
          <strong>📊 Statistiques de l'audit :</strong> ${Object.keys(allResults || {}).length} modules d'analyse exécutés | 
          ${(allResults?.cookies?.clientCookies?.length || 0) + (allResults?.['cdn-resources']?.externalResources?.length || 0) + (allResults?.['tech-stack']?.analytics?.length || 0)} points de données collectés |
          Couverture APDP/RGPD complète
        </div>
      </div>
    </div>
    
      <div class="footer">
        <div class="footer-left">
          <div><strong>APDP Monaco</strong></div>
          <div>Autorité de Protection des Données Personnelles</div>
        </div>
        <div class="footer-center">
          <div>${currentDate}</div>
        </div>
        <div class="footer-right">
          <div><strong>Page 1</strong></div>
        </div>
      </div>
      <div class="confidential">
        DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation
      </div>
    </div>
  </div>

  ${data.issues?.critical && data.issues.critical.length > 0 ? `
  <!-- Page 2: Critical Issues -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>CONSTATATIONS CRITIQUES</h1>
            <p>Priorité maximale - Action immédiate (0-7 jours)</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <div class="alert-box critical">
        <div class="alert-title">PRIORITÉ MAXIMALE - ACTION IMMÉDIATE REQUISE (0-7 jours)</div>
        <div class="alert-text">Les problèmes suivants présentent des risques majeurs pour la conformité et la sécurité.</div>
      </div>
      
      ${data.issues.critical.map((issue, index) => `
        <div class="issue-card critical">
          <div class="issue-header">
            <div class="issue-number">${index + 1}</div>
            <div class="issue-title-block">
              <div class="issue-title">${issue.title}</div>
              <div class="issue-category">${issue.category}</div>
            </div>
          </div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-recommendation">
            <div class="recommendation-title">RECOMMANDATION:</div>
            <div class="recommendation-text">${issue.recommendation}</div>
          </div>
          ${issue.priority || issue.impact || issue.effort ? `
          <div class="issue-metadata">
            ${issue.priority ? `<div class="metadata-item"><span class="metadata-label">Priorité:</span> ${issue.priority}</div>` : ''}
            ${issue.impact ? `<div class="metadata-item"><span class="metadata-label">Impact:</span> ${issue.impact}</div>` : ''}
            ${issue.effort ? `<div class="metadata-item"><span class="metadata-label">Effort:</span> ${issue.effort}</div>` : ''}
          </div>
          ` : ''}
          ${issue.article ? `<div class="issue-legal">Référence légale: ${issue.article}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="section" style="margin-top: 0;">
      <div class="alert-box success" style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-left-color: #16A34A;">
        <div class="alert-title" style="color: #166534;">✅ Aucune constatation critique</div>
        <div class="alert-text" style="color: #15803D;">
          Aucun problème critique de conformité APDP n'a été détecté lors de cet audit automatisé.
          Cela indique que les exigences fondamentales de sécurité et de protection des données
          personnelles semblent être respectées.
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px;">
        <h3 style="font-size: 10pt; color: #111827; margin-bottom: 10px;">🔍 Rappel des points critiques vérifiés :</h3>
        <ul style="margin-left: 20px; color: #374151; font-size: 9pt; line-height: 1.8;">
          <li>Certificat SSL/TLS valide et configuration sécurisée</li>
          <li>Absence de vulnérabilités de sécurité majeures</li>
          <li>En-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options)</li>
          <li>Protection contre les attaques courantes (XSS, CSRF, clickjacking)</li>
          <li>Pas de transmission de données en clair (HTTP)</li>
        </ul>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 6px;">
        <strong style="color: #92400E; font-size: 9pt;">⚠️ Note importante :</strong>
        <div style="color: #78350F; font-size: 8pt; margin-top: 8px; line-height: 1.6;">
          Cette évaluation se base sur des tests automatisés. Certains aspects de la conformité APDP
          nécessitent une revue manuelle approfondie (procédures internes, documentation, formations,
          contrats avec sous-traitants, etc.). Il est recommandé de compléter cet audit par un
          examen juridique et organisationnel.
        </div>
      </div>
    </div>
    `}
    
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Constatations Critiques</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  ${data.issues?.warnings && data.issues.warnings.length > 0 ? `
  <!-- Page: Warning Issues -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>CONSTATATIONS IMPORTANTES</h1>
            <p>Correction recommandée (7-30 jours)</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <div class="alert-box warning">
        <div class="alert-title">CORRECTION RECOMMANDÉE (7-30 jours)</div>
        <div class="alert-text">Actions nécessaires pour atteindre une conformité optimale.</div>
      </div>
      
      ${data.issues.warnings.map((issue, index) => `
        <div class="issue-card warning">
          <div class="issue-header">
            <div class="issue-number">${index + 1}</div>
            <div class="issue-title-block">
              <div class="issue-title">${issue.title}</div>
              <div class="issue-category">${issue.category}</div>
            </div>
          </div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-recommendation">
            <div class="recommendation-title">RECOMMANDATION:</div>
            <div class="recommendation-text">${issue.recommendation}</div>
          </div>
          ${issue.priority || issue.impact || issue.effort ? `
          <div class="issue-metadata">
            ${issue.priority ? `<div class="metadata-item"><span class="metadata-label">Priorité:</span> ${issue.priority}</div>` : ''}
            ${issue.impact ? `<div class="metadata-item"><span class="metadata-label">Impact:</span> ${issue.impact}</div>` : ''}
            ${issue.effort ? `<div class="metadata-item"><span class="metadata-label">Effort:</span> ${issue.effort}</div>` : ''}
          </div>
          ` : ''}
          ${issue.article ? `<div class="issue-legal">Référence légale: ${issue.article}</div>` : ''}
        </div>
      `).join('')}
      </div>
      ` : `
      <div class="section" style="margin-top: 0;">
        <div class="alert-box info" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-left-color: #3B82F6;">
          <div class="alert-title" style="color: #1E40AF;">✅ Aucun avertissement majeur</div>
          <div class="alert-text" style="color: #1E3A8A;">
            Aucun problème de conformité important n'a été détecté. Le site respecte les principales
            exigences de sécurité et de protection des données personnelles selon les standards APDP.
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px;">
          <h3 style="font-size: 10pt; color: #111827; margin-bottom: 10px;">🔍 Points importants vérifiés :</h3>
          <ul style="margin-left: 20px; color: #374151; font-size: 9pt; line-height: 1.8;">
            <li>Configuration des cookies conforme aux exigences RGPD/APDP</li>
            <li>Présence et qualité des pages légales (mentions, confidentialité)</li>
            <li>Informations sur les droits des utilisateurs (accès, rectification, effacement)</li>
            <li>Configuration DNS et infrastructure sécurisée</li>
            <li>Absence de ressources externes non sécurisées</li>
          </ul>
        </div>
      </div>
      `}
    
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Constatations Importantes</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  ${data.issues?.improvements && data.issues.improvements.length > 0 ? `
  <!-- Page: Improvements -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>RECOMMANDATIONS D'AMÉLIORATION</h1>
            <p>Suggestions (1-3 mois)</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <div class="alert-box info">
        <div class="alert-text">Améliorations suggérées pour renforcer la sécurité et la conformité (1-3 mois).</div>
      </div>
      
      ${data.issues.improvements.slice(0, 10).map((issue, index) => `
        <div class="issue-card info">
          <div class="issue-header">
            <div class="issue-number">${index + 1}</div>
            <div class="issue-title-block">
              <div class="issue-title">${issue.title}</div>
              <div class="issue-category">${issue.category}</div>
            </div>
          </div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-recommendation">
            <div class="recommendation-title">RECOMMANDATION:</div>
            <div class="recommendation-text">${issue.recommendation}</div>
          </div>
          ${issue.priority || issue.impact || issue.effort ? `
          <div class="issue-metadata">
            ${issue.priority ? `<div class="metadata-item"><span class="metadata-label">Priorité:</span> ${issue.priority}</div>` : ''}
            ${issue.impact ? `<div class="metadata-item"><span class="metadata-label">Impact:</span> ${issue.impact}</div>` : ''}
            ${issue.effort ? `<div class="metadata-item"><span class="metadata-label">Effort:</span> ${issue.effort}</div>` : ''}
          </div>
          ` : ''}
        </div>
      `).join('')}
      </div>
      ` : `
      <div class="section" style="margin-top: 0;">
        <div class="alert-box success" style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-left-color: #16A34A;">
          <div class="alert-title" style="color: #166534;">✅ Configuration optimale</div>
          <div class="alert-text" style="color: #15803D;">
            Aucune recommandation d'amélioration majeure n'a été identifiée. Le site présente
            une configuration technique et une conformité APDP satisfaisantes dans l'ensemble.
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #F0F9FF; border-radius: 8px; border-left: 4px solid #0284C7;">
          <h3 style="font-size: 10pt; color: #075985; margin-bottom: 10px;">💡 Bonnes pratiques à maintenir :</h3>
          <ul style="margin-left: 20px; color: #0C4A6E; font-size: 9pt; line-height: 1.8;">
            <li><strong>Revue régulière :</strong> Effectuez des audits de conformité trimestriels</li>
            <li><strong>Veille juridique :</strong> Restez informé des évolutions réglementaires APDP/RGPD</li>
            <li><strong>Formation continue :</strong> Assurez la formation régulière de vos équipes</li>
            <li><strong>Documentation :</strong> Maintenez à jour votre registre des traitements</li>
            <li><strong>Tests de sécurité :</strong> Planifiez des tests d'intrusion annuels</li>
            <li><strong>Mise à jour technologique :</strong> Gardez vos systèmes et bibliothèques à jour</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 6px;">
          <strong style="color: #991B1B; font-size: 9pt;">⚠️ Rappel important :</strong>
          <div style="color: #7F1D1D; font-size: 8pt; margin-top: 8px; line-height: 1.6;">
            Même en l'absence de recommandations techniques, assurez-vous que vos procédures
            organisationnelles sont conformes : politique de confidentialité, procédures de
            gestion des incidents, exercice des droits des personnes, contrats avec les
            sous-traitants, et analyses d'impact (PIA) pour les traitements à risque élevé.
          </div>
        </div>
      </div>
      `}
    
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Recommandations</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: Technical Details -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>DÉTAILS TECHNIQUES</h1>
            <p>Configuration technique du site</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <!-- SSL/TLS Security -->
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🔒 SÉCURITÉ SSL/TLS</h3>
      <div class="info-box">
        ${allResults?.ssl ? `
        <div class="info-row">
          <span class="info-label">Certificat SSL:</span>
          <span class="info-value" style="color: ${allResults.ssl.valid || allResults.ssl.validCertificate || (!allResults.ssl.error && allResults.ssl.issuer) ? '#059669' : '#DC2626'}">
            ${allResults.ssl.valid || allResults.ssl.validCertificate || (!allResults.ssl.error && allResults.ssl.issuer) ? '✓ Valide et sécurisé' : '✗ Invalide ou absent'}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Protocole TLS:</span>
          <span class="info-value" style="font-weight: 600;">${allResults.ssl.protocol || 'TLS 1.2/1.3'}</span>
        </div>
        ${allResults.ssl.issuer ? `
        <div class="info-row">
          <span class="info-label">Autorité de certification:</span>
          <span class="info-value">${typeof allResults.ssl.issuer === 'object' ? Object.entries(allResults.ssl.issuer).map(([k,v]) => `${k}=${v}`).join(', ') : allResults.ssl.issuer}</span>
        </div>
        ` : ''}
        ${allResults.ssl.validFrom ? `
        <div class="info-row">
          <span class="info-label">Valide du:</span>
          <span class="info-value">${new Date(allResults.ssl.validFrom).toLocaleDateString('fr-FR')}</span>
        </div>
        ` : ''}
        ${allResults.ssl.validTo ? `
        <div class="info-row">
          <span class="info-label">Expire le:</span>
          <span class="info-value">${new Date(allResults.ssl.validTo).toLocaleDateString('fr-FR')}</span>
        </div>
        ` : ''}
        ` : '<div class="info-row"><span class="info-value" style="color: #D97706;">⚠️ Données SSL non disponibles</span></div>'}
        
        ${allResults?.['tls-cipher-suites']?.supportedCiphers?.length ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E5E7EB;">
          <div class="info-row">
            <span class="info-label">Suite de chiffrement:</span>
            <span class="info-value">${allResults['tls-cipher-suites'].supportedCiphers[0].name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Force de chiffrement:</span>
            <span class="info-value" style="color: ${allResults['tls-cipher-suites'].supportedCiphers[0].bits >= 256 ? '#059669' : '#D97706'}">
              ${allResults['tls-cipher-suites'].supportedCiphers[0].bits} bits ${allResults['tls-cipher-suites'].supportedCiphers[0].bits >= 256 ? '(Fort)' : '(Moyen)'}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Niveau de sécurité:</span>
            <span class="info-value">${allResults['tls-cipher-suites'].securityLevel || 'Standard'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Version TLS:</span>
            <span class="info-value">${allResults['tls-cipher-suites'].supportedCiphers[0].version || 'TLSv1.3'}</span>
          </div>
        </div>
        ` : ''}
        
        ${allResults?.hsts ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E5E7EB;">
          <div class="info-row">
            <span class="info-label">HSTS (Strict Transport Security):</span>
            <span class="info-value" style="color: ${allResults.hsts.isEnabled ? '#059669' : '#DC2626'}; font-weight: 600;">
              ${allResults.hsts.isEnabled ? '✓ Activé - Sécurité renforcée' : '✗ Désactivé - Vulnérable aux attaques'}
            </span>
          </div>
          ${allResults.hsts.maxAge ? `
          <div class="info-row">
            <span class="info-label">Durée HSTS:</span>
            <span class="info-value">${Math.round(allResults.hsts.maxAge / 86400)} jours</span>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <div style="font-size: 8pt; margin-top: 12px; padding: 10px; background: ${allResults?.ssl?.valid ? '#F0FDF4' : '#FEF2F2'}; border-radius: 6px; color: ${allResults?.ssl?.valid ? '#166534' : '#991B1B'};">
          ${allResults?.ssl?.valid ? '✓ Configuration SSL/TLS conforme aux standards APDP' : '⚠️ Vérifier la configuration SSL/TLS pour assurer la conformité'}
        </div>
      </div>
      
      <!-- Tech Stack -->
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">⚙️ STACK TECHNIQUE & TECHNOLOGIES</h3>
      <div class="info-box">
        ${allResults?.['tech-stack']?.server ? `
        <div class="info-row">
          <span class="info-label">Serveur Web:</span>
          <span class="info-value" style="font-weight: 600;">${allResults['tech-stack'].server}</span>
        </div>
        ` : ''}
        
        ${allResults?.['tech-stack']?.frameworks?.length ? `
        <div style="margin-top: 12px;">
          <div class="info-row">
            <span class="info-label" style="font-weight: 700;">Frameworks Détectés:</span>
            <span class="info-value">${allResults['tech-stack'].frameworks.length} technologie(s)</span>
          </div>
          ${allResults['tech-stack'].frameworks.slice(0, 5).map((item: any) => `
            <div style="font-size: 8pt; margin: 4px 0; padding: 6px 10px; background: #EFF6FF; border-left: 3px solid #3B82F6; border-radius: 4px;">
              <strong>${item.name || item}</strong>
              ${item.version ? ` - Version: ${item.version}` : ''}
              ${item.description ? `<br><span style="color: #6B7280; font-size: 7pt;">${item.description}</span>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${allResults?.['tech-stack']?.analytics?.length ? `
        <div style="margin-top: 12px;">
          <div class="info-row">
            <span class="info-label" style="font-weight: 700;">Outils Analytics & Tracking:</span>
            <span class="info-value" style="color: ${allResults['tech-stack'].analytics.length > 3 ? '#D97706' : '#6B7280'};">
              ${allResults['tech-stack'].analytics.length} outil(s) ${allResults['tech-stack'].analytics.length > 3 ? '⚠️' : ''}
            </span>
          </div>
          ${allResults['tech-stack'].analytics.slice(0, 5).map((item: any) => `
            <div style="font-size: 8pt; margin: 4px 0; padding: 6px 10px; background: #FFFBEB; border-left: 3px solid #F59E0B; border-radius: 4px;">
              <strong>${item.name || item}</strong>
              ${item.category ? ` - ${item.category}` : ''}
            </div>
          `).join('')}
          ${allResults['tech-stack'].analytics.length > 5 ? `
          <div style="font-size: 7pt; color: #6B7280; margin-top: 5px;">
            ... et ${allResults['tech-stack'].analytics.length - 5} autre(s) outil(s)
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${allResults?.['tech-stack']?.libraries?.length ? `
        <div style="margin-top: 12px;">
          <div class="info-row">
            <span class="info-label" style="font-weight: 700;">Bibliothèques JavaScript:</span>
            <span class="info-value">${allResults['tech-stack'].libraries.length} bibliothèque(s)</span>
          </div>
          ${allResults['tech-stack'].libraries.slice(0, 4).map((item: any) => `
            <div style="font-size: 8pt; margin: 4px 0; padding: 6px 10px; background: #F0FDF4; border-left: 3px solid #10B981; border-radius: 4px;">
              <strong>${item.name || item}</strong>
              ${item.version ? ` v${item.version}` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div style="font-size: 8pt; margin-top: 15px; padding: 10px; background: #F9FAFB; border-radius: 6px; color: #374151;">
          <strong>⚠️ Impact APDP:</strong> Les outils analytics et de tracking peuvent collecter des données personnelles.
          Assurez-vous d'avoir le consentement explicite des utilisateurs avant leur activation.
        </div>
      </div>
      
      <!-- Cookies Analysis -->
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🍪 ANALYSE DES COOKIES</h3>
      <div class="info-box">
        ${allResults?.cookies ? `
        <div class="info-row">
          <span class="info-label">Total cookies détectés:</span>
          <span class="info-value" style="font-weight: 700; color: ${(allResults.cookies.clientCookies?.length || allResults.cookies.cookies?.length || 0) > 10 ? '#D97706' : '#059669'};">
            ${allResults.cookies.clientCookies?.length || allResults.cookies.cookies?.length || 0} cookie(s)
          </span>
        </div>
        
        ${(allResults.cookies.clientCookies || allResults.cookies.cookies)?.length > 0 ? `
        <div style="margin-top: 15px;">
          <div style="font-size: 9pt; font-weight: 600; margin-bottom: 10px; color: #111827;">📋 Détail des cookies (Top 10):</div>
          ${(allResults.cookies.clientCookies || allResults.cookies.cookies).slice(0, 10).map((cookie: any, idx: number) => `
            <div style="font-size: 8pt; margin: 8px 0; padding: 8px 10px; background: ${cookie.secure && cookie.httpOnly ? '#F0FDF4' : '#FEF2F2'}; border-left: 4px solid ${cookie.secure && cookie.httpOnly ? '#10B981' : '#DC2626'}; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong style="color: #111827;">${idx + 1}. ${cookie.name || 'Cookie sans nom'}</strong>
                <span style="font-size: 7pt; color: #6B7280;">${cookie.domain || 'domaine inconnu'}</span>
              </div>
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid ${cookie.secure && cookie.httpOnly ? '#D1FAE5' : '#FECACA'};">
                ${cookie.secure ? '<span style="color: #059669; margin-right: 10px;">✓ Secure</span>' : '<span style="color: #DC2626; margin-right: 10px;">✗ Non Secure</span>'}
                ${cookie.httpOnly ? '<span style="color: #059669; margin-right: 10px;">✓ HttpOnly</span>' : '<span style="color: #DC2626; margin-right: 10px;">✗ Non HttpOnly</span>'}
                ${cookie.sameSite ? `<span style="color: #059669;">✓ SameSite=${cookie.sameSite}</span>` : '<span style="color: #D97706;">⚠️ Pas de SameSite</span>'}
              </div>
              ${cookie.expires ? `
              <div style="font-size: 7pt; color: #6B7280; margin-top: 4px;">
                Expire: ${new Date(cookie.expires).toLocaleDateString('fr-FR')}
              </div>
              ` : ''}
              ${(!cookie.secure || !cookie.httpOnly) ? `
              <div style="font-size: 7pt; margin-top: 6px; padding: 4px 6px; background: #FEF2F2; border-radius: 3px; color: #991B1B;">
                ⚠️ Cookie non sécurisé - Vulnérable aux attaques ${!cookie.secure ? 'MITM' : ''} ${!cookie.httpOnly ? 'XSS' : ''}
              </div>
              ` : ''}
            </div>
          `).join('')}
          
          ${(allResults.cookies.clientCookies || allResults.cookies.cookies).length > 10 ? `
          <div style="font-size: 8pt; color: #6B7280; margin-top: 10px; text-align: center;">
            ... et ${(allResults.cookies.clientCookies || allResults.cookies.cookies).length - 10} autre(s) cookie(s)
          </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-left: 4px solid #F59E0B; border-radius: 6px;">
          <div style="font-size: 9pt; font-weight: 700; color: #92400E; margin-bottom: 6px;">🔒 Exigences APDP pour les Cookies:</div>
          <div style="font-size: 8pt; color: #78350F; line-height: 1.5;">
            • Tous les cookies doivent avoir les flags <strong>Secure</strong> et <strong>HttpOnly</strong><br>
            • Le consentement explicite est requis avant tout cookie non essentiel<br>
            • La durée de conservation doit être justifiée et proportionnée<br>
            • L'utilisateur doit pouvoir refuser les cookies non essentiels
          </div>
        </div>
        ` : ''}
        ` : '<div class="info-row"><span class="info-value">Aucun cookie détecté</span></div>'}
      </div>
      </div>
    
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Détails Techniques</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: APDP Compliance Details -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>CONFORMITÉ APDP DÉTAILLÉE</h1>
            <p>Protection des données personnelles</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults['apdp-cookie-banner'] ? `
      <div class="category-card ${allResults['apdp-cookie-banner'].compliance?.level === 'Conforme' ? 'good' : allResults['apdp-cookie-banner'].compliance?.level === 'Partiellement conforme' ? 'warning' : 'critical'}">
        <div class="category-header">
          <div class="category-name">🍪 Bannière de Consentement Cookies</div>
          <div class="category-score">${allResults['apdp-cookie-banner'].compliance?.score || 0}/100</div>
        </div>
        <div class="category-issues" style="margin: 8px 0;">
          ${allResults['apdp-cookie-banner'].hasCookieBanner ? '✓ Bannière détectée' : '✗ Aucune bannière détectée'}
          ${allResults['apdp-cookie-banner'].detectedLibrary ? ` - Solution: ${allResults['apdp-cookie-banner'].detectedLibrary}` : ''}
        </div>
        <div style="font-size: 8pt; margin: 5px 0;">
          ${allResults['apdp-cookie-banner'].features?.hasAcceptButton ? '✓ Bouton Accepter' : '✗ Pas de bouton Accepter'} |
          ${allResults['apdp-cookie-banner'].features?.hasRejectButton ? '✓ Bouton Refuser' : '✗ Pas de bouton Refuser'} |
          ${allResults['apdp-cookie-banner'].features?.hasCustomizeButton ? '✓ Personnalisation' : '✗ Pas de personnalisation'}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${allResults['apdp-cookie-banner'].compliance?.score || 0}%"></div>
        </div>
      </div>
      ` : ''}
      
      ${allResults['apdp-privacy-policy'] ? `
      <div class="category-card ${allResults['apdp-privacy-policy'].compliance?.level === 'Conforme' ? 'good' : allResults['apdp-privacy-policy'].compliance?.level === 'Partiellement conforme' ? 'warning' : 'critical'}">
        <div class="category-header">
          <div class="category-name">📜 Politique de Confidentialité</div>
          <div class="category-score">${allResults['apdp-privacy-policy'].compliance?.score || 0}/100</div>
        </div>
        <div class="category-issues" style="margin: 8px 0;">
          ${allResults['apdp-privacy-policy'].hasPrivacyPolicy ? '✓ Politique trouvée' : '✗ Politique manquante'}
          ${allResults['apdp-privacy-policy'].privacyPolicyUrl ? ` - ${allResults['apdp-privacy-policy'].privacyPolicyUrl}` : ''}
        </div>
        ${allResults['apdp-privacy-policy'].sections ? `
        <div style="font-size: 8pt; margin: 5px 0;">
          ${allResults['apdp-privacy-policy'].sections.found?.slice(0, 3).map((s: any) => `✓ ${s.name}`).join(' | ') || ''}
        </div>
        ` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${allResults['apdp-privacy-policy'].compliance?.score || 0}%"></div>
        </div>
      </div>
      ` : ''}
      
      ${allResults['apdp-legal-notices'] ? `
      <div class="category-card ${allResults['apdp-legal-notices'].compliance?.level === 'Conforme' ? 'good' : allResults['apdp-legal-notices'].compliance?.level === 'Partiellement conforme' ? 'warning' : 'critical'}">
        <div class="category-header">
          <div class="category-name">⚖️ Mentions Légales</div>
          <div class="category-score">${allResults['apdp-legal-notices'].compliance?.score || 0}/100</div>
        </div>
        <div class="category-issues" style="margin: 8px 0;">
          ${allResults['apdp-legal-notices'].hasLegalNotice ? '✓ Mentions trouvées' : '✗ Mentions manquantes'}
          ${allResults['apdp-legal-notices'].legalNoticeUrl ? ` - ${allResults['apdp-legal-notices'].legalNoticeUrl}` : ''}
        </div>
        ${allResults['apdp-legal-notices'].requiredInfo ? `
        <div style="font-size: 8pt; margin: 5px 0;">
          ${allResults['apdp-legal-notices'].requiredInfo.found?.slice(0, 3).map((s: any) => `✓ ${s.name}`).join(' | ') || ''}
        </div>
        ` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${allResults['apdp-legal-notices'].compliance?.score || 0}%"></div>
        </div>
      </div>
      ` : ''}
      
      ${allResults['apdp-user-rights'] ? `
      <div class="category-card ${allResults['apdp-user-rights'].compliance?.level === 'Conforme' ? 'good' : allResults['apdp-user-rights'].compliance?.level === 'Partiellement conforme' ? 'warning' : 'critical'}">
        <div class="category-header">
          <div class="category-name">👤 Droits des Utilisateurs (RGPD)</div>
          <div class="category-score">${allResults['apdp-user-rights'].compliance?.score || 0}/100</div>
        </div>
        <div style="font-size: 8pt; margin: 8px 0;">
          ${allResults['apdp-user-rights'].rights?.found?.map((r: any) => `✓ ${r.right}`).join(' | ') || 'Informations sur les droits non trouvées'}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${allResults['apdp-user-rights'].compliance?.score || 0}%"></div>
        </div>
      </div>
      ` : ''}
      
      ${allResults['carbon-footprint'] ? `
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🌍 Impact Environnemental</h3>
      <div class="info-box" style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);">
        <div class="info-row">
          <span class="info-label">CO2 par visite:</span>
          <span class="info-value">${allResults['carbon-footprint'].statistics?.co2?.grid?.grams?.toFixed(3) || 0}g</span>
        </div>
        <div class="info-row">
          <span class="info-label">Note environnementale:</span>
          <span class="info-value" style="font-weight: 700; color: ${allResults['carbon-footprint'].rating === 'A+' ? '#059669' : '#D97706'}">${allResults['carbon-footprint'].rating || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Plus propre que:</span>
          <span class="info-value">${allResults['carbon-footprint'].cleanerThan ? (allResults['carbon-footprint'].cleanerThan * 100).toFixed(0) + '% des sites' : 'N/A'}</span>
        </div>
        <div style="font-size: 8pt; margin-top: 8px; padding-top: 8px; border-top: 1px solid #D1FAE5;">
          Impact: 1 000 visites = ${(allResults['carbon-footprint'].statistics?.co2?.grid?.grams * 1000 || 0).toFixed(1)}g CO2
        </div>
      </div>
      ` : ''}
      </div>
    
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Conformité APDP</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: Deep Analysis - Everything We Detected -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>ANALYSE APPROFONDIE</h1>
            <p>Toutes les données techniques détectées</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults?.headers ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">📋 En-têtes HTTP</h3>
      <div class="info-box">
        ${allResults.headers['Strict-Transport-Security'] ? `<div class="info-row"><span class="info-label">HSTS:</span> <span class="info-value" style="color: #059669">✓ Activé</span></div>` : ''}
        ${allResults.headers['Content-Security-Policy'] ? `<div class="info-row"><span class="info-label">CSP:</span> <span class="info-value" style="color: #059669">✓ Configuré</span></div>` : ''}
        ${allResults.headers['X-Frame-Options'] ? `<div class="info-row"><span class="info-label">X-Frame-Options:</span> <span class="info-value">${allResults.headers['X-Frame-Options']}</span></div>` : ''}
        ${allResults.headers['X-Content-Type-Options'] ? `<div class="info-row"><span class="info-label">X-Content-Type-Options:</span> <span class="info-value">${allResults.headers['X-Content-Type-Options']}</span></div>` : ''}
        ${allResults.headers.Server ? `<div class="info-row"><span class="info-label">Serveur:</span> <span class="info-value">${allResults.headers.Server}</span></div>` : ''}
        <div style="font-size: 8pt; margin-top: 10px; color: #6B7280;">
          ${Object.keys(allResults.headers).length} en-têtes HTTP détectés au total
        </div>
      </div>
      ` : ''}
      
      ${allResults?.dns ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🌐 Configuration DNS</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr);">
        ${allResults.dns.A?.length ? `
        <div class="summary-card info" style="text-align: left;">
          <div class="summary-label">Enregistrements A:</div>
          <div class="summary-number" style="font-size: 18pt;">${allResults.dns.A.length}</div>
          ${allResults.dns.A.slice(0, 2).map((ip: string) => `<div style="font-size: 8pt; margin: 2px 0;">• ${ip}</div>`).join('')}
        </div>
        ` : ''}
        ${allResults.dns.AAAA?.length ? `
        <div class="summary-card info" style="text-align: left;">
          <div class="summary-label">Enregistrements AAAA (IPv6):</div>
          <div class="summary-number" style="font-size: 18pt;">${allResults.dns.AAAA.length}</div>
        </div>
        ` : ''}
        ${allResults.dns.MX?.length ? `
        <div class="summary-card info" style="text-align: left;">
          <div class="summary-label">Serveurs Mail (MX):</div>
          <div class="summary-number" style="font-size: 18pt;">${allResults.dns.MX.length}</div>
        </div>
        ` : ''}
        ${allResults.dns.NS?.length ? `
        <div class="summary-card info" style="text-align: left;">
          <div class="summary-label">Serveurs DNS (NS):</div>
          <div class="summary-number" style="font-size: 18pt;">${allResults.dns.NS.length}</div>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${allResults?.vulnerabilities ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🔍 Vulnérabilités Détectées</h3>
      <div class="alert-box ${allResults.vulnerabilities.length > 0 ? 'critical' : 'info'}">
        <div class="alert-title">${allResults.vulnerabilities.length > 0 ? `${allResults.vulnerabilities.length} vulnérabilité(s) détectée(s)` : 'Aucune vulnérabilité majeure détectée'}</div>
        ${allResults.vulnerabilities.length > 0 ? `
        <div class="alert-text">
          ${allResults.vulnerabilities.slice(0, 3).map((vuln: any) => `• ${vuln.title || vuln.name || 'Vulnérabilité détectée'}`).join('<br>')}
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${allResults?.['cdn-resources'] ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🌍 Ressources Externes & CDN</h3>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Total ressources externes:</span>
          <span class="info-value">${allResults['cdn-resources'].totalResources || allResults['cdn-resources'].externalResources?.length || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Domaines externes:</span>
          <span class="info-value">${allResults['cdn-resources'].summary?.externalDomains || new Set(allResults['cdn-resources'].externalResources?.map((r: any) => r.domain)).size || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ressources CDN:</span>
          <span class="info-value">${allResults['cdn-resources'].cdnProviders?.length || 0}</span>
        </div>
        ${allResults['cdn-resources'].isSPA ? `
        <div style="font-size: 8pt; margin-top: 10px; padding: 10px; background: #FFFBEB; border-radius: 6px; color: #92400E;">
          ⚠️ Application SPA détectée - Certaines ressources peuvent être chargées dynamiquement
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${allResults?.location ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">📍 Localisation Serveur</h3>
      <div class="info-box" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);">
        ${allResults.location.city ? `<div class="info-row"><span class="info-label">Ville:</span> <span class="info-value">${allResults.location.city}</span></div>` : ''}
        ${allResults.location.country ? `<div class="info-row"><span class="info-label">Pays:</span> <span class="info-value">${allResults.location.country}</span></div>` : ''}
        ${allResults.location.org ? `<div class="info-row"><span class="info-label">Hébergeur:</span> <span class="info-value">${allResults.location.org}</span></div>` : ''}
        ${allResults.location.timezone ? `<div class="info-row"><span class="info-label">Fuseau horaire:</span> <span class="info-value">${allResults.location.timezone}</span></div>` : ''}
      </div>
      ` : ''}
      
      <div class="alert-box info" style="margin-top: 20px;">
        <div class="alert-title">📊 Analyse Complète</div>
        <div class="alert-text">
          Ce rapport présente toutes les données techniques et de conformité détectables automatiquement.
          Certaines vérifications manuelles peuvent être nécessaires pour une conformité APDP complète.
        </div>
      </div>
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Analyse Approfondie</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
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

    console.log('Generating HTML-based PDF report...');
    
    // Dynamically import html2pdf.js only when needed (browser-only)
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Generate HTML with all data
    const htmlContent = generateHTMLReport(data, vulnerabilities, cdnResources, allResults);
    
    // PDF options
    const options = {
      margin: [0, 0, 0, 0],
      filename: `BeCompliant-Rapport-${data.url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Generate PDF
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating HTML-based PDF:', error);
    throw new Error(`Échec de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

export default generateComplianceReportHTML;

