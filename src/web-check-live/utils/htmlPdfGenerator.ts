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
      margin: 15mm 10mm;
      size: A4;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Print-specific optimizations */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      /* Prevent awkward breaks */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid;
      }
      
      .section, .info-box, .alert-box, .summary-card, .issue-card, .category-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Hide screen-only elements */
      .no-print {
        display: none !important;
      }
      
      /* Optimize spacing for print */
      .page {
        margin-bottom: 0 !important;
        page-break-after: always;
        page-break-inside: avoid;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
    }
    
    :root {
      --color-primary: #DC2626;
      --color-primary-dark: #991B1B;
      --color-success: #059669;
      --color-warning: #D97706;
      --color-critical: #DC2626;
      --color-info: #1E40AF;
      --color-text: #1F2937;
      --color-text-secondary: #6B7280;
      --color-bg: #FFFFFF;
      --color-bg-secondary: #F9FAFB;
      --color-border: #E5E7EB;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
      --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
      --transition: all 0.2s ease;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.8;
      color: var(--color-text);
      background: var(--color-bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      letter-spacing: 0.01em;
    }
    
    /* Smooth scrolling for better UX */
    html {
      scroll-behavior: smooth;
    }
    
    .page {
      page-break-after: always;
      page-break-inside: avoid;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    .content-page {
      padding: 0;
      max-width: 100%;
      margin: 0;
    }
    
    /* Print-friendly padding */
    @media print {
      .content-page {
        padding: 0;
      }
      
      .header {
        margin: 0 0 15px 0 !important;
      }
      
      .section {
        margin: 0 0 15px 0 !important;
      }
      
      .footer {
        margin: 15px 0 0 0 !important;
      }
    }
    
    /* Enhanced readability with better spacing */
    p {
      margin-bottom: var(--spacing-md);
      line-height: 1.8;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.02em;
      margin-bottom: var(--spacing-md);
    }
    
    h1 { font-size: 28pt; margin-top: var(--spacing-2xl); }
    h2 { font-size: 20pt; margin-top: var(--spacing-xl); }
    h3 { font-size: 14pt; margin-top: var(--spacing-lg); }
    
    /* Better text rendering */
    strong {
      font-weight: 600;
      color: var(--color-text);
    }
    
    /* Enhanced links (for screen viewing) */
    a {
      color: var(--color-info);
      text-decoration: none;
      transition: var(--transition);
    }
    
    a:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }
    
    /* Cover Page Styles - Enhanced */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      padding: 40mm 20mm;
      margin: 0;
      position: relative;
      overflow: hidden;
    }
    
    @media print {
      .cover-page {
        min-height: 260mm;
        padding: 30mm 15mm;
        margin: 0;
      }
    }
    
    /* Subtle pattern overlay for depth */
    .cover-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .cover-logo {
      width: 140px;
      height: 140px;
      background: white;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 50px;
      box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }
    
    .cover-logo-text {
      font-size: 48pt;
      font-weight: 900;
      color: var(--color-primary);
      line-height: 1;
      letter-spacing: -0.02em;
    }
    
    .cover-logo-subtitle {
      font-size: 15pt;
      color: var(--color-primary-dark);
      font-weight: 600;
      margin-top: 6px;
      letter-spacing: 0.05em;
    }
    
    .cover-title {
      font-size: 52pt;
      font-weight: 900;
      margin: 35px 0 25px 0;
      letter-spacing: -0.01em;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }
    
    .cover-subtitle {
      font-size: 22pt;
      font-weight: 300;
      margin-bottom: 70px;
      opacity: 0.95;
      max-width: 80%;
      line-height: 1.5;
      position: relative;
      z-index: 1;
    }
    
    .cover-info {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--radius-xl);
      padding: 35px 45px;
      margin: 50px 0;
      min-width: 65%;
      box-shadow: var(--shadow-lg);
      position: relative;
      z-index: 1;
    }
    
    .cover-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 18px 0;
      font-size: 13pt;
      padding: 8px 0;
    }
    
    .cover-info-label {
      font-weight: 600;
      opacity: 0.95;
      letter-spacing: 0.01em;
    }
    
    .cover-info-value {
      font-weight: 400;
      text-align: right;
      max-width: 60%;
      word-break: break-word;
    }
    
    .cover-footer {
      margin-top: auto;
      font-size: 10pt;
      opacity: 0.85;
      font-style: italic;
      position: relative;
      z-index: 1;
    }
    
    /* Header for content pages */
    .header {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      padding: 15px 20px;
      margin: 0 0 20px 0;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    @media print {
      .header {
        padding: 12px 15px;
        margin: 0 0 15px 0;
        box-shadow: none;
      }
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
    
    /* Info Box - Enhanced for better readability */
    .info-box {
      background: linear-gradient(135deg, var(--color-bg-secondary) 0%, #E5E7EB 100%);
      border-left: 5px solid var(--color-primary);
      padding: var(--spacing-lg) var(--spacing-xl);
      margin: var(--spacing-xl) 0;
      border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
      box-shadow: var(--shadow-sm);
    }
    
    .info-box h3 {
      font-size: 12pt;
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    
    .info-row {
      display: flex;
      margin: var(--spacing-sm) 0;
      font-size: 10pt;
      line-height: 1.6;
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: var(--color-text);
      min-width: 140px;
      flex-shrink: 0;
    }
    
    .info-value {
      color: var(--color-text-secondary);
      flex: 1;
      word-break: break-word;
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
    
    /* Score Card - Enhanced for better visual hierarchy */
    .score-card {
      background: linear-gradient(135deg, #FFFFFF 0%, var(--color-bg-secondary) 100%);
      border: 3px solid ${scoreColor};
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      margin: var(--spacing-xl) 0;
      display: flex;
      align-items: center;
      box-shadow: var(--shadow-md), 0 0 0 1px rgba(0, 0, 0, 0.02);
      page-break-inside: avoid;
      gap: var(--spacing-xl);
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
    
    /* Summary Cards - Enhanced with modern design */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
      margin: var(--spacing-xl) 0;
    }
    
    .summary-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg) var(--spacing-md);
      text-align: center;
      border: 2px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      page-break-inside: avoid;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }
    
    .summary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: var(--color-border);
    }
    
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .summary-card.critical::before { background: linear-gradient(90deg, var(--color-critical) 0%, #EF4444 100%); }
    .summary-card.critical { background: linear-gradient(180deg, #FEF2F2 0%, white 100%); border-color: #FECACA; }
    
    .summary-card.warning::before { background: linear-gradient(90deg, var(--color-warning) 0%, #F59E0B 100%); }
    .summary-card.warning { background: linear-gradient(180deg, #FFFBEB 0%, white 100%); border-color: #FED7AA; }
    
    .summary-card.info::before { background: linear-gradient(90deg, var(--color-info) 0%, #3B82F6 100%); }
    .summary-card.info { background: linear-gradient(180deg, #EFF6FF 0%, white 100%); border-color: #BFDBFE; }
    
    .summary-card.success::before { background: linear-gradient(90deg, var(--color-success) 0%, #10B981 100%); }
    .summary-card.success { background: linear-gradient(180deg, #F0FDF4 0%, white 100%); border-color: #A7F3D0; }
    
    .summary-number {
      font-size: 36pt;
      font-weight: 800;
      margin: var(--spacing-md) 0 var(--spacing-sm) 0;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    
    .summary-card.critical .summary-number { color: var(--color-critical); }
    .summary-card.warning .summary-number { color: var(--color-warning); }
    .summary-card.info .summary-number { color: var(--color-info); }
    .summary-card.success .summary-number { color: var(--color-success); }
    
    .summary-label {
      font-size: 10pt;
      font-weight: 600;
      color: var(--color-text);
      margin-top: var(--spacing-sm);
      line-height: 1.4;
    }
    
    .summary-sublabel {
      font-size: 9pt;
      color: var(--color-text-secondary);
      margin-top: var(--spacing-xs);
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
    
    /* Issue Cards - Enhanced with better spacing and hierarchy */
    .issue-card {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin: var(--spacing-lg) 0;
      box-shadow: var(--shadow-sm), 0 0 0 1px rgba(0, 0, 0, 0.03);
      border-left: 5px solid var(--color-border);
      page-break-inside: avoid;
      transition: var(--transition);
    }
    
    .issue-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(2px);
    }
    
    .issue-card.critical { 
      border-left-color: var(--color-critical);
      background: linear-gradient(90deg, #FEF2F2 0%, white 10%);
    }
    
    .issue-card.warning { 
      border-left-color: var(--color-warning);
      background: linear-gradient(90deg, #FFFBEB 0%, white 10%);
    }
    
    .issue-card.info { 
      border-left-color: var(--color-info);
      background: linear-gradient(90deg, #EFF6FF 0%, white 10%);
    }
    
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
      font-size: 12pt;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--spacing-sm);
      line-height: 1.5;
      letter-spacing: -0.01em;
    }
    
    .issue-category {
      display: inline-block;
      background: var(--color-critical);
      color: white;
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    
    .issue-card.warning .issue-category { background: var(--color-warning); }
    .issue-card.info .issue-category { background: var(--color-info); }
    
    .issue-description {
      font-size: 10pt;
      color: var(--color-text-secondary);
      margin: var(--spacing-md) 0;
      line-height: 1.8;
    }
    
    .issue-recommendation {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-left: 4px solid var(--color-info);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      margin: var(--spacing-md) 0;
    }
    
    .recommendation-title {
      font-size: 10pt;
      font-weight: 700;
      color: var(--color-info);
      margin-bottom: var(--spacing-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    
    .recommendation-title::before {
      content: '💡';
      font-size: 12pt;
    }
    
    .recommendation-text {
      font-size: 10pt;
      color: var(--color-text);
      line-height: 1.8;
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
    
    /* Alert Boxes - Enhanced for better readability */
    .alert-box {
      padding: var(--spacing-lg) var(--spacing-xl);
      border-radius: var(--radius-lg);
      margin: var(--spacing-xl) 0;
      border-left: 5px solid;
      page-break-inside: avoid;
      box-shadow: var(--shadow-sm), 0 0 0 1px rgba(0, 0, 0, 0.02);
      position: relative;
    }
    
    .alert-box.critical {
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      border-left-color: var(--color-critical);
      border: 1px solid #FECACA;
      border-left-width: 5px;
    }
    
    .alert-box.warning {
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
      border-left-color: var(--color-warning);
      border: 1px solid #FED7AA;
      border-left-width: 5px;
    }
    
    .alert-box.info {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-left-color: var(--color-info);
      border: 1px solid #BFDBFE;
      border-left-width: 5px;
    }
    
    .alert-box.success {
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      border-left-color: var(--color-success);
      border: 1px solid #A7F3D0;
      border-left-width: 5px;
    }
    
    .alert-title {
      font-weight: 700;
      font-size: 12pt;
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      line-height: 1.4;
    }
    
    .alert-box.critical .alert-title { color: var(--color-critical); }
    .alert-box.warning .alert-title { color: var(--color-warning); }
    .alert-box.info .alert-title { color: var(--color-info); }
    .alert-box.success .alert-title { color: var(--color-success); }
    
    .alert-text {
      font-size: 10pt;
      color: var(--color-text);
      line-height: 1.8;
    }
    
    /* Table of Contents */
    .toc-container {
      background: var(--color-bg-secondary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      margin: var(--spacing-2xl) 0;
      border: 2px solid var(--color-border);
      page-break-inside: avoid;
    }
    
    .toc-title {
      font-size: 18pt;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-primary);
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
    }
    
    .toc-item {
      padding: var(--spacing-sm) 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }
    
    .toc-item:last-child {
      border-bottom: none;
    }
    
    .toc-link {
      color: var(--color-text);
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      transition: var(--transition);
    }
    
    .toc-link:hover {
      color: var(--color-primary);
    }
    
    .toc-number {
      background: var(--color-primary);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11pt;
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
    
    /* Comprehensive Print Styles */
    @media print {
      html, body {
        margin: 0;
        padding: 0;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        font-size: 10pt;
        line-height: 1.5;
      }
      
      /* Reduce spacing in print */
      h1 { font-size: 20pt; margin-top: 10px; margin-bottom: 8px; }
      h2 { font-size: 14pt; margin-top: 12px; margin-bottom: 6px; }
      h3 { font-size: 11pt; margin-top: 10px; margin-bottom: 5px; }
      
      p { margin-bottom: 8px; line-height: 1.4; }
      
      .info-box, .alert-box {
        margin: 10px 0;
        padding: 10px 15px;
      }
      
      .summary-grid {
        gap: 8px;
        margin: 10px 0;
      }
      
      .summary-card {
        padding: 10px 8px;
      }
      
      .issue-card, .category-card {
        margin: 10px 0;
        padding: 10px 12px;
      }
      
      .section {
        margin: 10px 0 15px 0;
      }
      
      .footer {
        font-size: 7pt;
        padding: 8px 0;
      }
      
      /* Prevent orphans and widows */
      p, li {
        orphans: 3;
        widows: 3;
      }
      
      /* Avoid breaks after headers */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      
      /* Keep related content together */
      .info-row, .metadata-item {
        page-break-inside: avoid;
      }
      
      /* Ensure tables and grids stay together when possible */
      table, .summary-grid, .info-box, .alert-box {
        page-break-inside: avoid;
      }
      
      /* Remove max-heights and scrolling in print */
      * {
        max-height: none !important;
        overflow: visible !important;
      }
      
      /* Optimize score displays */
      .score-circle {
        width: 100px;
        height: 100px;
      }
      
      .score-number {
        font-size: 28pt;
      }
      
      /* Compact cover page for print */
      .cover-logo {
        width: 120px;
        height: 120px;
        margin-bottom: 30px;
      }
      
      .cover-title {
        font-size: 42pt;
        margin: 25px 0 20px 0;
      }
      
      .cover-subtitle {
        font-size: 18pt;
        margin-bottom: 40px;
      }
      
      .cover-info {
        padding: 25px 35px;
        margin: 30px 0;
      }
      
      .cover-info-row {
        margin: 12px 0;
        font-size: 11pt;
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
          <div style="font-size: 12pt; font-weight: 700;">${(() => {
            let count = 0;
            if (allResults?.dns?.A) count += (Array.isArray(allResults.dns.A) ? allResults.dns.A.length : 1);
            if (allResults?.dns?.AAAA) count += (Array.isArray(allResults.dns.AAAA) ? allResults.dns.AAAA.length : 0);
            if (allResults?.dns?.MX) count += (Array.isArray(allResults.dns.MX) ? allResults.dns.MX.length : 0);
            if (allResults?.dns?.TXT) count += (Array.isArray(allResults.dns.TXT) ? allResults.dns.TXT.length : 0);
            return count;
          })()}</div>
        </div>
        <div class="summary-card" style="background: ${allResults?.dnssec?.valid ? '#F0FDF4' : '#FEF2F2'}; border-left: 3px solid ${allResults?.dnssec?.valid ? '#16A34A' : '#D97706'}; padding: 12px;">
          <div style="font-size: 18pt;">${allResults?.dnssec?.valid ? '✅' : '⚠️'}</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">DNSSEC</div>
          <div style="font-size: 8pt; color: #6B7280;">${allResults?.dnssec?.valid ? 'Validé' : 'Non validé'}</div>
        </div>
      </div>
      
      <!-- Ports & Network Security -->
      <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-radius: 8px; border-left: 4px solid #3B82F6;">
        <div style="font-size: 9pt; font-weight: 700; color: #1E40AF; margin-bottom: 8px;">🔌 Ports Ouverts & Sécurité Réseau</div>
        <div style="font-size: 8pt; color: #1E3A8A; line-height: 1.6;">
          <strong>Ports ouverts détectés:</strong> ${allResults?.ports?.openPorts?.join(', ') || 'Aucun'}<br>
          <strong>Total ports scannés:</strong> ${(allResults?.ports?.openPorts?.length || 0) + (allResults?.ports?.failedPorts?.length || 0)} ports<br>
          ${(allResults?.ports?.openPorts || []).includes(22) ? '<span style="color: #D97706;">⚠️ Port SSH (22) ouvert - Assurez une authentification forte</span><br>' : ''}
          ${(allResults?.ports?.openPorts || []).includes(3306) ? '<span style="color: #DC2626;">🚨 Port MySQL (3306) ouvert - RISQUE SÉCURITÉ ÉLEVÉ</span><br>' : ''}
          ${(allResults?.ports?.openPorts || []).includes(3389) ? '<span style="color: #DC2626;">🚨 Port RDP (3389) ouvert - RISQUE SÉCURITÉ ÉLEVÉ</span><br>' : ''}
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
  
  <!-- Page: Complete Technology Stack -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>STACK TECHNOLOGIQUE COMPLET</h1>
            <p>Toutes les technologies détectées</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults?.['tech-stack']?.technologies?.length ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🔧 Technologies Détectées (${allResults['tech-stack'].technologies.length})</h3>
      
      ${(() => {
        const techs = allResults['tech-stack'].technologies;
        const categories = {};
        
        // Group by category
        techs.forEach(tech => {
          tech.categories?.forEach(cat => {
            if (!categories[cat.name]) categories[cat.name] = [];
            categories[cat.name].push(tech);
          });
        });
        
        return Object.entries(categories).map(([catName, techList]) => `
          <div style="margin: 15px 0;">
            <h4 style="font-size: 10pt; color: #DC2626; margin: 10px 0 8px 0;">📦 ${catName}</h4>
            <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${techList.slice(0, 10).map(tech => `
                <div class="summary-card" style="text-align: left; padding: 12px; background: linear-gradient(135deg, #F9FAFB 0%, white 100%);">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="font-size: 10pt; font-weight: 700; color: #111827;">${tech.name}</div>
                    ${tech.version ? `<div style="font-size: 8pt; color: white; background: #3B82F6; padding: 2px 8px; border-radius: 12px;">${tech.version}</div>` : ''}
                  </div>
                  ${tech.description ? `<div style="font-size: 7pt; color: #6B7280; margin-top: 6px; line-height: 1.4;">${tech.description.substring(0, 100)}${tech.description.length > 100 ? '...' : ''}</div>` : ''}
                  ${tech.website ? `<div style="font-size: 7pt; color: #3B82F6; margin-top: 4px;">🌐 ${tech.website}</div>` : ''}
                  <div style="font-size: 7pt; margin-top: 6px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
                    <strong>Confiance:</strong> <span style="color: ${tech.confidence >= 80 ? '#059669' : tech.confidence >= 50 ? '#D97706' : '#DC2626'}">${tech.confidence}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
            ${techList.length > 10 ? `<div style="font-size: 8pt; color: #6B7280; margin-top: 8px; text-align: center;">... et ${techList.length - 10} autre(s) ${catName.toLowerCase()}</div>` : ''}
          </div>
        `).join('');
      })()}
      ` : ''}
      
      <div class="alert-box info" style="margin-top: 20px;">
        <div class="alert-title">📊 Analyse du Stack Technique</div>
        <div class="alert-text">
          ${allResults?.['tech-stack']?.technologies?.length || 0} technologies identifiées avec succès. 
          Cette analyse permet d'identifier les potentielles vulnérabilités connues et de vérifier la conformité des outils utilisés avec les exigences APDP.
        </div>
      </div>
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Stack Technologique</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: SEO & Web Presence -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>SEO & PRÉSENCE WEB</h1>
            <p>Référencement et visibilité en ligne</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults?.['social-tags'] ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🏷️ Métadonnées & Tags Sociaux</h3>
      <div class="info-box">
        ${allResults['social-tags'].title ? `<div class="info-row"><span class="info-label">Titre de la page:</span> <span class="info-value">${allResults['social-tags'].title}</span></div>` : ''}
        ${allResults['social-tags'].description ? `<div class="info-row"><span class="info-label">Description:</span> <span class="info-value">${allResults['social-tags'].description}</span></div>` : ''}
        ${allResults['social-tags'].canonicalUrl ? `<div class="info-row"><span class="info-label">URL Canonique:</span> <span class="info-value">${allResults['social-tags'].canonicalUrl}</span></div>` : ''}
        ${allResults['social-tags'].robots ? `<div class="info-row"><span class="info-label">Directives Robots:</span> <span class="info-value">${allResults['social-tags'].robots}</span></div>` : ''}
        ${allResults['social-tags'].ogTitle ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
          <div style="font-size: 9pt; font-weight: 700; margin-bottom: 8px; color: #DC2626;">📱 Open Graph (Facebook, LinkedIn)</div>
          <div class="info-row"><span class="info-label">OG:Title:</span> <span class="info-value">${allResults['social-tags'].ogTitle}</span></div>
          ${allResults['social-tags'].ogType ? `<div class="info-row"><span class="info-label">OG:Type:</span> <span class="info-value">${allResults['social-tags'].ogType}</span></div>` : ''}
          ${allResults['social-tags'].ogUrl ? `<div class="info-row"><span class="info-label">OG:URL:</span> <span class="info-value">${allResults['social-tags'].ogUrl}</span></div>` : ''}
          ${allResults['social-tags'].ogSiteName ? `<div class="info-row"><span class="info-label">OG:Site Name:</span> <span class="info-value">${allResults['social-tags'].ogSiteName}</span></div>` : ''}
          ${allResults['social-tags'].ogImage ? `<div class="info-row"><span class="info-label">OG:Image:</span> <span class="info-value" style="word-break: break-all;">${allResults['social-tags'].ogImage}</span></div>` : ''}
        </div>
        ` : ''}
        ${allResults['social-tags'].twitterCard ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
          <div style="font-size: 9pt; font-weight: 700; margin-bottom: 8px; color: #DC2626;">🐦 Twitter Cards</div>
          <div class="info-row"><span class="info-label">Card Type:</span> <span class="info-value">${allResults['social-tags'].twitterCard}</span></div>
          ${allResults['social-tags'].twitterSite ? `<div class="info-row"><span class="info-label">Twitter Site:</span> <span class="info-value">${allResults['social-tags'].twitterSite}</span></div>` : ''}
          ${allResults['social-tags'].twitterCreator ? `<div class="info-row"><span class="info-label">Twitter Creator:</span> <span class="info-value">${allResults['social-tags'].twitterCreator}</span></div>` : ''}
        </div>
        ` : ''}
        ${allResults['social-tags'].favicon ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
          <div class="info-row"><span class="info-label">Favicon:</span> <span class="info-value" style="word-break: break-all;">${allResults['social-tags'].favicon}</span></div>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${allResults?.sitemap ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🗺️ Sitemap XML</h3>
      <div class="info-box" style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);">
        <div style="font-size: 9pt; margin-bottom: 10px;">
          ✅ Sitemap détecté - Facilite l'indexation par les moteurs de recherche
        </div>
        ${allResults.sitemap.sitemapindex?.sitemap ? `
          <div style="font-size: 8pt; color: #166534;">
            <strong>Sous-sitemaps détectés:</strong> ${allResults.sitemap.sitemapindex.sitemap.length}<br>
            ${allResults.sitemap.sitemapindex.sitemap.slice(0, 5).map(sm => `
              <div style="margin: 4px 0; padding: 4px 8px; background: white; border-radius: 4px;">
                📄 ${sm.loc?.[0] || 'Sitemap'}
                ${sm.lastmod ? ` - Modifié: ${new Date(sm.lastmod[0]).toLocaleDateString('fr-FR')}` : ''}
              </div>
            `).join('')}
            ${allResults.sitemap.sitemapindex.sitemap.length > 5 ? `<div style="margin-top: 6px;">... et ${allResults.sitemap.sitemapindex.sitemap.length - 5} autre(s)</div>` : ''}
          </div>
        ` : ''}
      </div>
      ` : '<div class="alert-box warning"><div class="alert-title">⚠️ Pas de Sitemap XML</div><div class="alert-text">Aucun sitemap détecté. Un sitemap XML améliore le référencement en aidant les moteurs de recherche à découvrir vos pages.</div></div>'}
      
      ${allResults?.['robots-txt']?.robots ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🤖 Robots.txt</h3>
      <div class="info-box">
        <div style="font-size: 8pt; background: #F9FAFB; padding: 10px; border-radius: 6px; font-family: 'Courier New', monospace;">
          ${allResults['robots-txt'].robots.map(rule => `${rule.lbl}: ${rule.val}`).join('<br>')}
        </div>
        <div style="font-size: 8pt; color: #6B7280; margin-top: 10px;">
          ${allResults['robots-txt'].robots.length} directive(s) trouvée(s)
        </div>
      </div>
      ` : ''}
      
      ${allResults?.['linked-pages'] ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🔗 Pages Liées & Structure</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div class="summary-card" style="text-align: left; padding: 15px;">
          <div style="font-size: 10pt; font-weight: 700; color: #059669; margin-bottom: 10px;">🏠 Liens Internes</div>
          <div style="font-size: 24pt; font-weight: 800; color: #059669; margin: 10px 0;">${allResults['linked-pages'].internal?.length || 0}</div>
          ${allResults['linked-pages'].internal?.length > 0 ? `
            <div style="font-size: 7pt; color: #6B7280; max-height: 150px; overflow-y: auto;">
              ${allResults['linked-pages'].internal.slice(0, 10).map(link => `<div style="margin: 2px 0; padding: 2px 0; border-bottom: 1px solid #F3F4F6;">📄 ${link.replace('https://apdp.mc', '')}</div>`).join('')}
              ${allResults['linked-pages'].internal.length > 10 ? `<div style="margin-top: 6px; font-weight: 600;">... et ${allResults['linked-pages'].internal.length - 10} autre(s) page(s)</div>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="summary-card" style="text-align: left; padding: 15px;">
          <div style="font-size: 10pt; font-weight: 700; color: #3B82F6; margin-bottom: 10px;">🌍 Liens Externes</div>
          <div style="font-size: 24pt; font-weight: 800; color: #3B82F6; margin: 10px 0;">${allResults['linked-pages'].external?.length || 0}</div>
          ${allResults['linked-pages'].external?.length > 0 ? `
            <div style="font-size: 7pt; color: #6B7280; max-height: 150px; overflow-y: auto;">
              ${allResults['linked-pages'].external.slice(0, 8).map(link => `<div style="margin: 2px 0; padding: 2px 0; border-bottom: 1px solid #F3F4F6;">🔗 ${link}</div>`).join('')}
              ${allResults['linked-pages'].external.length > 8 ? `<div style="margin-top: 6px; font-weight: 600;">... et ${allResults['linked-pages'].external.length - 8} autre(s) lien(s)</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">SEO & Présence Web</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: Network & Infrastructure Details -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>RÉSEAU & INFRASTRUCTURE</h1>
            <p>Configuration réseau détaillée</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults?.dns ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🌐 Configuration DNS Complète</h3>
      
      ${allResults.dns.A ? `
      <div style="margin: 12px 0;">
        <h4 style="font-size: 9pt; color: #DC2626; margin: 8px 0;">📍 Enregistrements A (IPv4)</h4>
        <div style="font-size: 8pt; background: #EFF6FF; padding: 8px; border-radius: 6px; border-left: 3px solid #3B82F6;">
          ${Array.isArray(allResults.dns.A) ? 
            allResults.dns.A.map(ip => `<div style="margin: 3px 0;">✓ ${ip}</div>`).join('') :
            `<div>✓ ${allResults.dns.A.address || allResults.dns.A}</div>`
          }
        </div>
      </div>
      ` : ''}
      
      ${allResults.dns.AAAA?.length ? `
      <div style="margin: 12px 0;">
        <h4 style="font-size: 9pt; color: #DC2626; margin: 8px 0;">📍 Enregistrements AAAA (IPv6)</h4>
        <div style="font-size: 8pt; background: #EFF6FF; padding: 8px; border-radius: 6px; border-left: 3px solid #3B82F6;">
          ${allResults.dns.AAAA.map(ip => `<div style="margin: 3px 0;">✓ ${ip}</div>`).join('')}
        </div>
      </div>
      ` : ''}
      
      ${allResults.dns.MX?.length ? `
      <div style="margin: 12px 0;">
        <h4 style="font-size: 9pt; color: #DC2626; margin: 8px 0;">📧 Serveurs Mail (MX)</h4>
        <div style="font-size: 8pt; background: #F0FDF4; padding: 8px; border-radius: 6px; border-left: 3px solid #10B981;">
          ${allResults.dns.MX.map((mx, idx) => `
            <div style="margin: 3px 0;">
              <strong>${idx + 1}.</strong> ${mx.exchange} 
              <span style="color: #6B7280;">(Priorité: ${mx.priority})</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${allResults.dns.TXT?.length ? `
      <div style="margin: 12px 0;">
        <h4 style="font-size: 9pt; color: #DC2626; margin: 8px 0;">📝 Enregistrements TXT</h4>
        <div style="font-size: 7pt; background: #FFFBEB; padding: 8px; border-radius: 6px; border-left: 3px solid #F59E0B; max-height: 120px; overflow-y: auto;">
          ${allResults.dns.TXT.map((txt, idx) => `
            <div style="margin: 4px 0; padding: 4px; background: white; border-radius: 3px;">
              <strong>${idx + 1}.</strong> ${Array.isArray(txt) ? txt.join(', ') : JSON.stringify(txt)}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${allResults.dns.NS?.length || allResults.dns.CNAME?.length ? `
      <div style="margin: 12px 0;">
        <h4 style="font-size: 9pt; color: #DC2626; margin: 8px 0;">🖥️ Serveurs de Noms & CNAME</h4>
        <div style="font-size: 8pt; background: #F9FAFB; padding: 8px; border-radius: 6px;">
          ${allResults.dns.CNAME?.length ? `
            <div style="margin-bottom: 8px;">
              <strong style="color: #111827;">CNAME:</strong><br>
              ${allResults.dns.CNAME.map(cname => `<div style="margin: 2px 0;">✓ ${cname}</div>`).join('')}
            </div>
          ` : ''}
          ${allResults.dns.NS?.length ? `
            <div>
              <strong style="color: #111827;">Enregistrements NS:</strong><br>
              ${allResults.dns.NS.map(ns => `<div style="margin: 2px 0; font-size: 7pt;">${Array.isArray(ns) ? ns.join(', ') : ns}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      ` : ''}
      
      ${allResults?.['mail-config'] ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">📧 Configuration Email & SPF</h3>
      <div class="info-box">
        ${allResults['mail-config'].mxRecords?.length ? `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 9pt; font-weight: 700; margin-bottom: 6px;">Serveurs Mail:</div>
            ${allResults['mail-config'].mxRecords.map((mx, idx) => `
              <div style="font-size: 8pt; margin: 3px 0; padding: 4px 8px; background: #F0FDF4; border-left: 3px solid #10B981; border-radius: 3px;">
                <strong>${idx + 1}.</strong> ${mx.exchange} (Priorité: ${mx.priority})
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${allResults['mail-config'].txtRecords?.length ? `
          <div style="font-size: 8pt; padding: 8px; background: #FFFBEB; border-radius: 6px;">
            <strong>SPF Record:</strong><br>
            ${allResults['mail-config'].txtRecords[0]?.[0] || 'Non configuré'}
          </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${allResults?.['block-lists']?.blocklists ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">🛡️ Status dans les Listes de Blocage</h3>
      <div style="font-size: 8pt;">
        ${(() => {
          const blocked = allResults['block-lists'].blocklists.filter(bl => bl.isBlocked);
          const safe = allResults['block-lists'].blocklists.filter(bl => !bl.isBlocked);
          return `
            <div style="margin-bottom: 12px; padding: 10px; background: ${blocked.length === 0 ? '#F0FDF4' : '#FEF2F2'}; border-radius: 6px; border-left: 4px solid ${blocked.length === 0 ? '#10B981' : '#DC2626'};">
              <div style="font-size: 10pt; font-weight: 700; margin-bottom: 6px; color: ${blocked.length === 0 ? '#166534' : '#991B1B'};">
                ${blocked.length === 0 ? '✅ Aucun Blocage Détecté' : `⚠️ ${blocked.length} Blocage(s) Détecté(s)`}
              </div>
              <div style="color: ${blocked.length === 0 ? '#166534' : '#991B1B'};">
                Statut vérifié sur ${allResults['block-lists'].blocklists.length} listes de blocage
              </div>
            </div>
            <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${safe.slice(0, 9).map(bl => `
                <div style="padding: 6px 8px; background: #F0FDF4; border-radius: 4px; border-left: 2px solid #10B981;">
                  ✓ ${bl.server}
                </div>
              `).join('')}
            </div>
            ${safe.length > 9 ? `<div style="margin-top: 8px; color: #6B7280; text-align: center;">... et ${safe.length - 9} autre(s) liste(s)</div>` : ''}
          `;
        })()}
      </div>
      ` : ''}
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Réseau & Infrastructure</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: Historical Data & Archives -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>HISTORIQUE & ARCHIVES</h1>
            <p>Évolution du site dans le temps</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      ${allResults?.archives ? `
      <h3 style="font-size: 11pt; margin: 15px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">📚 Archives Internet (Wayback Machine)</h3>
      
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 15px;">
        <div class="summary-card info" style="padding: 12px;">
          <div style="font-size: 18pt;">📅</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Première Archive</div>
          <div style="font-size: 8pt; font-weight: 600;">${new Date(allResults.archives.firstScan).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="summary-card info" style="padding: 12px;">
          <div style="font-size: 18pt;">📅</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Dernière Archive</div>
          <div style="font-size: 8pt; font-weight: 600;">${new Date(allResults.archives.lastScan).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="summary-card success" style="padding: 12px;">
          <div style="font-size: 18pt;">📸</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Total Scans</div>
          <div style="font-size: 18pt; font-weight: 800; color: #059669;">${allResults.archives.totalScans}</div>
        </div>
        <div class="summary-card warning" style="padding: 12px;">
          <div style="font-size: 18pt;">🔄</div>
          <div class="summary-label" style="font-size: 9pt; margin: 5px 0;">Changements</div>
          <div style="font-size: 18pt; font-weight: 800; color: #D97706;">${allResults.archives.changeCount}</div>
        </div>
      </div>
      
      <div class="info-box" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);">
        <h4 style="font-size: 10pt; color: #1E40AF; margin-bottom: 10px;">📊 Statistiques d'Archivage</h4>
        <div class="info-row">
          <span class="info-label">Taille moyenne des pages:</span>
          <span class="info-value">${(allResults.archives.averagePageSize / 1024).toFixed(2)} KB</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fréquence de scan:</span>
          <span class="info-value">${allResults.archives.scanFrequency?.scansPerDay?.toFixed(2)} scans/jour (tous les ${allResults.archives.scanFrequency?.daysBetweenScans?.toFixed(1)} jours)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fréquence de modifications:</span>
          <span class="info-value">${allResults.archives.scanFrequency?.changesPerDay?.toFixed(2)} changements/jour</span>
        </div>
      </div>
      
      <h4 style="font-size: 10pt; color: #111827; margin: 15px 0 8px 0;">📜 Historique des Scans (Derniers 10)</h4>
      <div style="font-size: 7pt; background: #F9FAFB; padding: 10px; border-radius: 6px; max-height: 180px; overflow-y: auto;">
        ${allResults.archives.scans?.slice(-10).reverse().map((scan, idx) => {
          const date = scan[0];
          const statusCode = scan[1];
          const formattedDate = `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)} ${date.substring(8,10)}:${date.substring(10,12)}`;
          return `
            <div style="margin: 4px 0; padding: 6px 8px; background: white; border-radius: 4px; border-left: 3px solid ${statusCode === '200' ? '#10B981' : statusCode === '301' ? '#F59E0B' : '#DC2626'};">
              <strong>${formattedDate}</strong> - 
              <span style="color: ${statusCode === '200' ? '#059669' : statusCode === '301' ? '#D97706' : '#DC2626'}">
                HTTP ${statusCode}
              </span>
              ${scan[3] ? ` - ${(scan[3] / 1024).toFixed(1)} KB` : ''}
            </div>
          `;
        }).join('')}
      </div>
      ` : '<div class="alert-box info"><div class="alert-title">ℹ️ Pas d\'historique</div><div class="alert-text">Aucune archive trouvée sur la Wayback Machine.</div></div>'}
      
      ${allResults?.status ? `
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">⚡ Performance & Disponibilité</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div class="summary-card ${allResults.status.isUp ? 'success' : 'critical'}" style="padding: 15px;">
          <div style="font-size: 24pt;">${allResults.status.isUp ? '✅' : '❌'}</div>
          <div class="summary-label" style="font-size: 10pt; margin: 8px 0;">Statut</div>
          <div style="font-size: 12pt; font-weight: 700;">${allResults.status.isUp ? 'EN LIGNE' : 'HORS LIGNE'}</div>
        </div>
        <div class="summary-card info" style="padding: 15px;">
          <div style="font-size: 24pt;">🚀</div>
          <div class="summary-label" style="font-size: 10pt; margin: 8px 0;">Temps de Réponse</div>
          <div style="font-size: 16pt; font-weight: 700; color: ${allResults.status.responseTime < 200 ? '#059669' : allResults.status.responseTime < 500 ? '#D97706' : '#DC2626'}">
            ${allResults.status.responseTime?.toFixed(0)} ms
          </div>
        </div>
        <div class="summary-card success" style="padding: 15px;">
          <div style="font-size: 24pt;">📟</div>
          <div class="summary-label" style="font-size: 10pt; margin: 8px 0;">Code HTTP</div>
          <div style="font-size: 16pt; font-weight: 700;">${allResults.status.responseCode}</div>
        </div>
      </div>
      ` : ''}
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Historique & Archives</div>
        </div>
        <div class="confidential">DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation</div>
      </div>
    </div>
  </div>
  
  <!-- Page: Executive Summary - Everything at a Glance -->
  <div class="page">
    <div class="content-page">
      <div class="header">
        <div class="header-content">
          <div class="logo-box">
            <div>APDP</div>
            <div style="font-size: 8pt">MONACO</div>
          </div>
          <div class="header-title">
            <h1>SYNTHÈSE EXÉCUTIVE</h1>
            <p>Vue d'ensemble complète de l'audit</p>
          </div>
        </div>
      </div>
      
      <div class="section" style="margin-top: 0;">
      
      <h3 style="font-size: 12pt; margin: 15px 0 15px 0; color: #DC2626; text-align: center;">📊 RÉCAPITULATIF GÉNÉRAL DE L'AUDIT</h3>
      
      <!-- Main Metrics Grid -->
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
        <div class="summary-card" style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 20px; text-align: center;">
          <div style="font-size: 32pt; font-weight: 900; margin: 10px 0;">${data.numericScore}</div>
          <div style="font-size: 11pt; font-weight: 600;">SCORE GLOBAL</div>
          <div style="font-size: 8pt; opacity: 0.9; margin-top: 5px;">/100</div>
        </div>
        <div class="summary-card critical" style="padding: 20px; text-align: center;">
          <div style="font-size: 32pt; font-weight: 900; margin: 10px 0;">${data.criticalIssues}</div>
          <div style="font-size: 11pt; font-weight: 600;">PROBLÈMES CRITIQUES</div>
          <div style="font-size: 8pt; opacity: 0.7; margin-top: 5px;">Action immédiate</div>
        </div>
        <div class="summary-card warning" style="padding: 20px; text-align: center;">
          <div style="font-size: 32pt; font-weight: 900; margin: 10px 0;">${data.warnings}</div>
          <div style="font-size: 11pt; font-weight: 600;">AVERTISSEMENTS</div>
          <div style="font-size: 8pt; opacity: 0.7; margin-top: 5px;">À corriger</div>
        </div>
        <div class="summary-card success" style="padding: 20px; text-align: center;">
          <div style="font-size: 32pt; font-weight: 900; margin: 10px 0;">${data.compliantItems}</div>
          <div style="font-size: 11pt; font-weight: 600;">CONFORMES</div>
          <div style="font-size: 8pt; opacity: 0.7; margin-top: 5px;">Validés</div>
        </div>
      </div>
      
      <!-- Key Findings by Category -->
      <h3 style="font-size: 11pt; margin: 25px 0 12px 0; color: #111827; border-bottom: 2px solid #DC2626; padding-bottom: 5px;">🔍 RÉSULTATS CLÉS PAR DOMAINE</h3>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
        <!-- Security -->
        <div style="padding: 15px; background: linear-gradient(135deg, #FEF2F2 0%, white 100%); border-radius: 8px; border-left: 4px solid ${allResults?.ssl?.valid ? '#10B981' : '#DC2626'};">
          <div style="font-size: 10pt; font-weight: 700; color: #DC2626; margin-bottom: 10px;">🔒 SÉCURITÉ</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            <div style="margin: 4px 0;">SSL/TLS: <strong style="color: ${allResults?.ssl?.valid ? '#059669' : '#DC2626'}">${allResults?.ssl?.valid ? '✓ Valide' : '✗ Problème'}</strong></div>
            <div style="margin: 4px 0;">HSTS: <strong style="color: ${allResults?.hsts?.isEnabled ? '#059669' : '#DC2626'}">${allResults?.hsts?.isEnabled ? '✓ Activé' : '✗ Désactivé'}</strong></div>
            <div style="margin: 4px 0;">Ports ouverts: <strong>${allResults?.ports?.openPorts?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Vulnérabilités: <strong style="color: ${(allResults?.vulnerabilities?.length || 0) === 0 ? '#059669' : '#DC2626'}">${allResults?.vulnerabilities?.length || 0}</strong></div>
          </div>
        </div>
        
        <!-- APDP Compliance -->
        <div style="padding: 15px; background: linear-gradient(135deg, #EFF6FF 0%, white 100%); border-radius: 8px; border-left: 4px solid #3B82F6;">
          <div style="font-size: 10pt; font-weight: 700; color: #3B82F6; margin-bottom: 10px;">📋 CONFORMITÉ APDP</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            ${allResults?.['apdp-cookie-banner'] ? `<div style="margin: 4px 0;">Bannière Cookies: <strong>${allResults['apdp-cookie-banner'].compliance?.score || 0}/100</strong></div>` : ''}
            ${allResults?.['apdp-privacy-policy'] ? `<div style="margin: 4px 0;">Politique Confidentialité: <strong>${allResults['apdp-privacy-policy'].compliance?.score || 0}/100</strong></div>` : ''}
            ${allResults?.['apdp-legal-notices'] ? `<div style="margin: 4px 0;">Mentions Légales: <strong>${allResults['apdp-legal-notices'].compliance?.score || 0}/100</strong></div>` : ''}
            ${allResults?.['apdp-user-rights'] ? `<div style="margin: 4px 0;">Droits Utilisateurs: <strong>${allResults['apdp-user-rights'].compliance?.score || 0}/100</strong></div>` : ''}
          </div>
        </div>
        
        <!-- Technology -->
        <div style="padding: 15px; background: linear-gradient(135deg, #FFFBEB 0%, white 100%); border-radius: 8px; border-left: 4px solid #F59E0B;">
          <div style="font-size: 10pt; font-weight: 700; color: #F59E0B; margin-bottom: 10px;">⚙️ TECHNOLOGIES</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            <div style="margin: 4px 0;">Technologies détectées: <strong>${allResults?.['tech-stack']?.technologies?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Outils Analytics: <strong>${allResults?.['tech-stack']?.analytics?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Frameworks: <strong>${allResults?.['tech-stack']?.frameworks?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Serveur: <strong>${allResults?.['tech-stack']?.server || 'Inconnu'}</strong></div>
          </div>
        </div>
        
        <!-- Performance -->
        <div style="padding: 15px; background: linear-gradient(135deg, #F0FDF4 0%, white 100%); border-radius: 8px; border-left: 4px solid #10B981;">
          <div style="font-size: 10pt; font-weight: 700; color: #10B981; margin-bottom: 10px;">⚡ PERFORMANCE</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            <div style="margin: 4px 0;">Temps de réponse: <strong style="color: ${allResults?.status?.responseTime < 200 ? '#059669' : '#D97706'}">${allResults?.status?.responseTime?.toFixed(0) || 'N/A'} ms</strong></div>
            <div style="margin: 4px 0;">Statut: <strong style="color: ${allResults?.status?.isUp ? '#059669' : '#DC2626'}">${allResults?.status?.isUp ? '✓ En ligne' : '✗ Hors ligne'}</strong></div>
            <div style="margin: 4px 0;">CO2/visite: <strong>${allResults?.carbon?.statistics?.co2?.grid?.grams?.toFixed(3) || 'N/A'}g</strong></div>
            <div style="margin: 4px 0;">Note environnementale: <strong>${allResults?.carbon?.rating || 'N/A'}</strong></div>
          </div>
        </div>
        
        <!-- Cookies & Tracking -->
        <div style="padding: 15px; background: linear-gradient(135deg, #FEF2F2 0%, white 100%); border-radius: 8px; border-left: 4px solid #DC2626;">
          <div style="font-size: 10pt; font-weight: 700; color: #DC2626; margin-bottom: 10px;">🍪 COOKIES & TRACKING</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            <div style="margin: 4px 0;">Total cookies: <strong>${(allResults?.cookies?.clientCookies || allResults?.cookies?.cookies || []).length}</strong></div>
            <div style="margin: 4px 0;">Cookies sécurisés: <strong>${(allResults?.cookies?.clientCookies || allResults?.cookies?.cookies || []).filter((c: any) => c.secure).length}</strong></div>
            <div style="margin: 4px 0;">Ressources externes: <strong>${allResults?.['cdn-resources']?.externalResources?.length || 0}</strong></div>
            <div style="margin: 4px 0;">CDN Providers: <strong>${allResults?.['cdn-resources']?.cdnProviders?.length || 0}</strong></div>
          </div>
        </div>
        
        <!-- SEO & Web Presence -->
        <div style="padding: 15px; background: linear-gradient(135deg, #EFF6FF 0%, white 100%); border-radius: 8px; border-left: 4px solid #1E40AF;">
          <div style="font-size: 10pt; font-weight: 700; color: #1E40AF; margin-bottom: 10px;">🌐 SEO & PRÉSENCE WEB</div>
          <div style="font-size: 8pt; line-height: 1.6;">
            <div style="margin: 4px 0;">Sitemap XML: <strong style="color: ${allResults?.sitemap ? '#059669' : '#DC2626'}">${allResults?.sitemap ? '✓ Présent' : '✗ Absent'}</strong></div>
            <div style="margin: 4px 0;">Liens internes: <strong>${allResults?.['linked-pages']?.internal?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Liens externes: <strong>${allResults?.['linked-pages']?.external?.length || 0}</strong></div>
            <div style="margin: 4px 0;">Archives Wayback: <strong>${allResults?.archives?.totalScans || 0} scans</strong></div>
          </div>
        </div>
      </div>
      
      <!-- Data Coverage Summary -->
      <h3 style="font-size: 11pt; margin: 25px 0 12px 0; color: #111827; border-bottom: 2px solid #DC2626; padding-bottom: 5px;">📊 COUVERTURE DE L'AUDIT</h3>
      
      <div class="info-box" style="background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);">
        <div style="font-size: 9pt; line-height: 1.8; columns: 2; column-gap: 30px;">
          <div style="margin: 6px 0;"><strong>✓</strong> Sécurité SSL/TLS & Certificats</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Configuration DNS complète</div>
          <div style="margin: 6px 0;"><strong>✓</strong> En-têtes HTTP de sécurité</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Conformité APDP/RGPD</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Analyse des cookies</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Technologies & stack technique</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Performance & disponibilité</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Empreinte carbone</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Ports réseau ouverts</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Vulnérabilités connues</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Listes de blocage</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Configuration email (MX, SPF)</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Métadonnées & tags sociaux</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Sitemap XML</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Robots.txt</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Liens internes/externes</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Historique archives (Wayback)</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Ressources externes & CDN</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Localisation serveur</div>
          <div style="margin: 6px 0;"><strong>✓</strong> Redirections</div>
        </div>
      </div>
      
      <div class="alert-box" style="margin-top: 20px; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-left-color: #3B82F6;">
        <div class="alert-title" style="color: #1E40AF;">📈 Points de Données Analysés</div>
        <div class="alert-text" style="color: #1E3A8A;">
          <strong>${Object.keys(allResults || {}).length}+ modules d'analyse</strong> ont été exécutés, générant 
          <strong>${(() => {
            let dataPoints = 0;
            if (allResults?.cookies?.clientCookies) dataPoints += allResults.cookies.clientCookies.length;
            if (allResults?.['tech-stack']?.technologies) dataPoints += allResults['tech-stack'].technologies.length;
            if (allResults?.['cdn-resources']?.externalResources) dataPoints += allResults['cdn-resources'].externalResources.length;
            if (allResults?.headers) dataPoints += Object.keys(allResults.headers).length;
            if (allResults?.dns?.A) dataPoints += 1;
            if (allResults?.dns?.MX) dataPoints += allResults.dns.MX.length || 0;
            if (allResults?.dns?.TXT) dataPoints += allResults.dns.TXT.length || 0;
            if (allResults?.ports?.openPorts) dataPoints += allResults.ports.openPorts.length;
            if (allResults?.archives?.scans) dataPoints += allResults.archives.scans.length;
            if (allResults?.['block-lists']?.blocklists) dataPoints += allResults['block-lists'].blocklists.length;
            if (allResults?.['linked-pages']?.internal) dataPoints += allResults['linked-pages'].internal.length;
            return dataPoints;
          })()}+ points de données</strong> détaillés. 
          Ce rapport présente une analyse exhaustive couvrant tous les aspects techniques, de sécurité, de conformité et de performance du site web audité.
        </div>
      </div>
      
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left"><strong>APDP Monaco</strong> - Autorité de Protection des Données Personnelles</div>
          <div class="footer-center">${currentDate}</div>
          <div class="footer-right">Synthèse Exécutive</div>
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

// Function to open HTML report in a new window (can be printed to PDF)
export const openComplianceReportHTML = (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any,
  allResults?: any
): void => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Report viewer is only available in browser environment');
    }

    console.log('Opening HTML compliance report...');
    
    // Generate HTML with all data
    const htmlContent = generateHTMLReport(data, vulnerabilities, cdnResources, allResults);
    
    // Add print button and instructions to the HTML
    const htmlWithPrintButton = htmlContent.replace(
      '</body>',
      `
      <!-- Print Button (hidden when printing) -->
      <div style="position: fixed; top: 20px; right: 20px; z-index: 9999;" class="no-print">
        <button onclick="window.print()" style="
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(220, 38, 38, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.4)';">
          <span style="font-size: 18px;">🖨️</span>
          Imprimer / Enregistrer en PDF
        </button>
        <div style="
          margin-top: 8px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 280px;
          line-height: 1.5;
        ">
          <div style="margin-bottom: 4px;">
            <strong>Ctrl+P</strong> (Windows) ou <strong>⌘+P</strong> (Mac)
          </div>
          <div style="font-size: 9px; color: #9CA3AF; margin-top: 4px;">
            💡 <strong>Astuce:</strong> Pour un PDF optimal, sélectionnez "Enregistrer au format PDF" comme destination
          </div>
        </div>
      </div>
      
      <style>
        /* Hide print button when printing */
        @media print {
          .no-print {
            display: none !important;
          }
        }
      </style>
      </body>`
    );
    
    // Open in new window
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      throw new Error('Le navigateur a bloqué l\'ouverture de la fenêtre. Veuillez autoriser les popups pour ce site.');
    }
    
    reportWindow.document.write(htmlWithPrintButton);
    reportWindow.document.close();
    
    console.log('HTML report opened successfully!');
  } catch (error) {
    console.error('Error opening HTML report:', error);
    throw new Error(`Échec de l'ouverture du rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
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

