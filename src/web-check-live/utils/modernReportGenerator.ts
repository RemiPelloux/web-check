// Modern, Clean A4 Compliance Report Generator
// Professional, concise, and easy to understand

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
}

interface ComplianceData {
  url: string;
  numericScore: number;
  criticalIssues: number;
  warnings: number;
  improvements: number;
  compliantItems: number;
  timestamp: string;
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

export const generateModernReport = (data: ComplianceData, allResults?: any): string => {
  const date = new Date(data.timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const scoreColor = data.numericScore >= 80 ? '#10b981' : data.numericScore >= 60 ? '#f59e0b' : '#dc2626';
  const scoreLabel = data.numericScore >= 80 ? 'Conforme' : data.numericScore >= 60 ? 'À améliorer' : 'Non conforme';

  const allIssues = [
    ...(data.issues?.critical || []),
    ...(data.issues?.warnings || []),
    ...(data.issues?.improvements || [])
  ];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Conformité - ${data.url}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }

    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
      h1, h2, h3 { page-break-after: avoid; }
      .issue-card, .stat-card { page-break-inside: avoid; }
    }

    /* Header */
    .header {
      text-align: center;
      padding: 30px 0 20px;
      border-bottom: 3px solid #dc2626;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 14pt;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }

    .site-url {
      font-size: 11pt;
      color: #6b7280;
      font-weight: 500;
    }

    /* Score Section */
    .score-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border-radius: 12px;
      margin-bottom: 30px;
      border: 2px solid #e5e7eb;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid ${scoreColor};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .score-number {
      font-size: 32pt;
      font-weight: 800;
      color: ${scoreColor};
      line-height: 1;
    }

    .score-max {
      font-size: 10pt;
      color: #6b7280;
      font-weight: 600;
    }

    .score-info {
      flex: 1;
      padding-left: 30px;
    }

    .score-label {
      font-size: 14pt;
      font-weight: 700;
      color: ${scoreColor};
      margin-bottom: 8px;
    }

    .score-date {
      font-size: 9pt;
      color: #6b7280;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }

    .stat-icon {
      font-size: 20pt;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 24pt;
      font-weight: 700;
      color: #111827;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 8pt;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card.critical { border-left: 4px solid #dc2626; }
    .stat-card.critical .stat-number { color: #dc2626; }
    
    .stat-card.warning { border-left: 4px solid #f59e0b; }
    .stat-card.warning .stat-number { color: #f59e0b; }
    
    .stat-card.success { border-left: 4px solid #10b981; }
    .stat-card.success .stat-number { color: #10b981; }

    /* Section Titles */
    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #111827;
      margin: 30px 0 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h2 span {
      font-size: 14pt;
    }

    /* Issues List */
    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .issue-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      page-break-inside: avoid;
    }

    .issue-card.critical {
      border-left: 4px solid #dc2626;
      background: linear-gradient(to right, rgba(220, 38, 38, 0.03) 0%, white 100%);
    }

    .issue-card.warning {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(to right, rgba(245, 158, 11, 0.03) 0%, white 100%);
    }

    .issue-card.improvement {
      border-left: 4px solid #3b82f6;
      background: linear-gradient(to right, rgba(59, 130, 246, 0.03) 0%, white 100%);
    }

    .issue-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .issue-title {
      font-size: 11pt;
      font-weight: 700;
      color: #111827;
      flex: 1;
    }

    .issue-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .issue-badge.critical {
      background: #dc2626;
      color: white;
    }

    .issue-badge.warning {
      background: #f59e0b;
      color: white;
    }

    .issue-badge.improvement {
      background: #3b82f6;
      color: white;
    }

    .issue-description {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .issue-recommendation {
      background: #f9fafb;
      border-left: 3px solid #dc2626;
      padding: 10px;
      border-radius: 4px;
      font-size: 9pt;
      color: #374151;
      line-height: 1.5;
    }

    .issue-meta {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 8pt;
      color: #6b7280;
    }

    .issue-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Summary Box */
    .summary-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #86efac;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .summary-box h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #15803d;
      margin-bottom: 10px;
    }

    .summary-box ul {
      list-style: none;
      padding: 0;
    }

    .summary-box li {
      font-size: 9pt;
      color: #166534;
      padding: 4px 0;
      padding-left: 20px;
      position: relative;
    }

    .summary-box li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: 700;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 8pt;
      color: #9ca3af;
    }

    /* Print Button (screen only) */
    .print-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #dc2626;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 10pt;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
      z-index: 1000;
    }

    .print-button:hover {
      background: #b91c1c;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
    }

    @media print {
      .print-button { display: none !important; }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">
    🖨️ Imprimer / Enregistrer en PDF
  </button>

  <!-- Header -->
  <div class="header">
    <div class="logo">APDP MONACO</div>
    <h1>Rapport de Conformité Loi 1.565</h1>
    <div class="site-url">${data.url}</div>
  </div>

  <!-- Score Section -->
  <div class="score-section">
    <div class="score-circle">
      <div class="score-number">${data.numericScore}</div>
      <div class="score-max">/100</div>
    </div>
    <div class="score-info">
      <div class="score-label">${scoreLabel}</div>
      <div class="score-date">Analyse effectuée le ${date}</div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="stat-card critical">
      <div class="stat-icon">🔴</div>
      <div class="stat-number">${data.criticalIssues}</div>
      <div class="stat-label">Critiques</div>
    </div>
    
    <div class="stat-card warning">
      <div class="stat-icon">⚠️</div>
      <div class="stat-number">${data.warnings}</div>
      <div class="stat-label">Avertissements</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">💡</div>
      <div class="stat-number">${data.improvements}</div>
      <div class="stat-label">À améliorer</div>
    </div>
    
    <div class="stat-card success">
      <div class="stat-icon">✅</div>
      <div class="stat-number">${data.compliantItems}</div>
      <div class="stat-label">Conformes</div>
    </div>
  </div>

  ${data.compliantItems > 0 ? `
  <!-- Compliant Items Summary -->
  <div class="summary-box">
    <h3>✅ Points Conformes</h3>
    <ul>
      ${(data.issues?.compliant || []).slice(0, 5).map(item => `
        <li>${item.title}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${allIssues.length > 0 ? `
  <!-- Critical Issues -->
  ${data.issues?.critical && data.issues.critical.length > 0 ? `
  <h2><span>🔴</span>Problèmes Critiques (${data.issues.critical.length})</h2>
  <div class="issues-list">
    ${data.issues.critical.map(issue => `
      <div class="issue-card critical">
        <div class="issue-header">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-badge critical">Critique</div>
        </div>
        <div class="issue-description">${issue.description}</div>
        <div class="issue-recommendation">
          <strong>💡 Recommandation:</strong> ${issue.recommendation}
        </div>
        ${issue.article || issue.priority ? `
        <div class="issue-meta">
          ${issue.article ? `<span>📋 ${issue.article}</span>` : ''}
          ${issue.priority ? `<span>⚡ Priorité: ${issue.priority === 'high' ? 'Haute' : issue.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>` : ''}
        </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Warnings -->
  ${data.issues?.warnings && data.issues.warnings.length > 0 ? `
  <h2><span>⚠️</span>Avertissements (${data.issues.warnings.length})</h2>
  <div class="issues-list">
    ${data.issues.warnings.map(issue => `
      <div class="issue-card warning">
        <div class="issue-header">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-badge warning">Attention</div>
        </div>
        <div class="issue-description">${issue.description}</div>
        <div class="issue-recommendation">
          <strong>💡 Recommandation:</strong> ${issue.recommendation}
        </div>
        ${issue.article || issue.priority ? `
        <div class="issue-meta">
          ${issue.article ? `<span>📋 ${issue.article}</span>` : ''}
          ${issue.priority ? `<span>⚡ Priorité: ${issue.priority === 'high' ? 'Haute' : issue.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>` : ''}
        </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Improvements -->
  ${data.issues?.improvements && data.issues.improvements.length > 0 ? `
  <h2><span>💡</span>Améliorations Recommandées (${data.issues.improvements.length})</h2>
  <div class="issues-list">
    ${data.issues.improvements.map(issue => `
      <div class="issue-card improvement">
        <div class="issue-header">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-badge improvement">Amélioration</div>
        </div>
        <div class="issue-description">${issue.description}</div>
        <div class="issue-recommendation">
          <strong>💡 Recommandation:</strong> ${issue.recommendation}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Rapport généré par l'Outil d'Audit de Conformité APDP Monaco</p>
    <p>Ce rapport est confidentiel et destiné uniquement à l'usage interne</p>
  </div>
</body>
</html>
  `.trim();
};

export const openModernComplianceReport = (data: ComplianceData, allResults?: any) => {
  const html = generateModernReport(data, allResults);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  if (newWindow) {
    newWindow.document.title = `Rapport de Conformité - ${data.url}`;
  }
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

