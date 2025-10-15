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
  cdnResources?: any
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
      margin: 15mm 10mm;
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
      line-height: 1.6;
      color: #111827;
      background: white;
    }
    
    .page {
      page-break-after: always;
      padding: 0 10mm;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      padding: 20px;
      margin: -15mm -10mm 20px -10mm;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #E5E7EB;
      font-size: 8pt;
      color: #6B7280;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-left {
      flex: 1;
    }
    
    .footer-center {
      flex: 1;
      text-align: center;
    }
    
    .footer-right {
      flex: 1;
      text-align: right;
    }
    
    .footer strong {
      color: #111827;
    }
    
    .confidential {
      text-align: center;
      font-size: 7pt;
      color: #6B7280;
      font-style: italic;
      margin-top: 5px;
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
  <!-- Page 1: Executive Summary -->
  <div class="page">
    <div class="header">
      <div class="header-content">
        <div class="logo-box">
          <div>APDP</div>
          <div style="font-size: 8pt">MONACO</div>
        </div>
        <div class="header-title">
          <h1>RAPPORT DE CONFORMITÉ</h1>
          <p>Audit de Sécurité et Protection des Données</p>
        </div>
      </div>
    </div>
    
    <div class="info-box">
      <h3>INFORMATIONS DU DOCUMENT</h3>
      <div class="info-row">
        <span class="info-label">Site audité:</span>
        <span class="info-value">${data.url}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date d'audit:</span>
        <span class="info-value">${currentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Type d'analyse:</span>
        <span class="info-value">Audit complet de conformité APDP et sécurité</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">
        <div class="section-number">1</div>
        <h2>RÉSUMÉ EXÉCUTIF</h2>
      </div>
      
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
    <div class="section">
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

  ${data.issues?.critical && data.issues.critical.length > 0 ? `
  <!-- Page 2: Critical Issues -->
  <div class="page">
    <div class="section">
      <div class="section-title">
        <div class="section-number">3</div>
        <h2>CONSTATATIONS CRITIQUES</h2>
      </div>
      
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
    
    <div class="footer">
      <div class="footer-left">
        <div><strong>APDP Monaco</strong></div>
        <div>Autorité de Protection des Données Personnelles</div>
      </div>
      <div class="footer-center">
        <div>${currentDate}</div>
      </div>
      <div class="footer-right">
        <div><strong>Page 2</strong></div>
      </div>
    </div>
    <div class="confidential">
      DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation
    </div>
  </div>
  ` : ''}
  
  ${data.issues?.warnings && data.issues.warnings.length > 0 ? `
  <!-- Page: Warning Issues -->
  <div class="page">
    <div class="section">
      <div class="section-title">
        <div class="section-number">${data.issues?.critical && data.issues.critical.length > 0 ? '4' : '3'}</div>
        <h2>CONSTATATIONS IMPORTANTES</h2>
      </div>
      
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
    
    <div class="footer">
      <div class="footer-left">
        <div><strong>APDP Monaco</strong></div>
        <div>Autorité de Protection des Données Personnelles</div>
      </div>
      <div class="footer-center">
        <div>${currentDate}</div>
      </div>
      <div class="footer-right">
        <div><strong>Page ${data.issues?.critical && data.issues.critical.length > 0 ? '3' : '2'}</strong></div>
      </div>
    </div>
    <div class="confidential">
      DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation
    </div>
  </div>
  ` : ''}
  
  ${data.issues?.improvements && data.issues.improvements.length > 0 ? `
  <!-- Page: Improvements -->
  <div class="page">
    <div class="section">
      <div class="section-title">
        <div class="section-number">
          ${data.issues?.critical && data.issues.critical.length > 0 && data.issues?.warnings && data.issues.warnings.length > 0 ? '5' :
            data.issues?.critical && data.issues.critical.length > 0 || data.issues?.warnings && data.issues.warnings.length > 0 ? '4' : '3'}
        </div>
        <h2>RECOMMANDATIONS D'AMÉLIORATION</h2>
      </div>
      
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
    
    <div class="footer">
      <div class="footer-left">
        <div><strong>APDP Monaco</strong></div>
        <div>Autorité de Protection des Données Personnelles</div>
      </div>
      <div class="footer-center">
        <div>${currentDate}</div>
      </div>
      <div class="footer-right">
        <div><strong>Page Final</strong></div>
      </div>
    </div>
    <div class="confidential">
      DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation
    </div>
  </div>
  ` : ''}
</body>
</html>
  `;
};

export const generateComplianceReportHTML = async (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any
): Promise<void> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    console.log('Generating HTML-based PDF report...');
    
    // Dynamically import html2pdf.js only when needed (browser-only)
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Generate HTML
    const htmlContent = generateHTMLReport(data, vulnerabilities, cdnResources);
    
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

