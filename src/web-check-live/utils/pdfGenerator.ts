// PDF Generation utility for APDP compliance reports
// Using jsPDF for client-side PDF generation

import { jsPDF } from 'jspdf';

// Helper function to handle French accents and special characters
const cleanText = (text: string): string => {
  if (!text) return '';
  // jsPDF has limited UTF-8 support, so we keep accents but ensure proper encoding
  return text
    .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
    .replace(/\u2013/g, '-')          // En dash
    .replace(/\u2014/g, '-')          // Em dash
    .replace(/\u2026/g, '...')        // Ellipsis
    .replace(/[\u2022\u25CF]/g, '*'); // Bullets
};

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

export const generateComplianceReport = async (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any
): Promise<void> => {
  try {
    // Log data structure for debugging
    console.log('PDF Generation - Data received:', {
      hasUrl: !!data.url,
      hasScore: data.numericScore !== undefined,
      hasIssues: !!data.issues,
      hasCritical: data.issues?.critical?.length || 0,
      hasWarnings: data.issues?.warnings?.length || 0,
      hasCategories: !!data.categories,
      categoryCount: data.categories ? Object.keys(data.categories).length : 0,
      hasLegalPages: !!legalPages,
      hasCdnResources: !!cdnResources
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 25;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    const contentWidth = rightMargin - leftMargin;

    // Professional APDP color scheme
  const colors = {
    primary: [220, 38, 38],      // APDP Red
    secondary: [55, 65, 81],     // Dark gray
    success: [5, 150, 105],      // Green
    warning: [217, 119, 6],      // Orange
    error: [220, 38, 38],        // Red
    text: [17, 24, 39],          // Almost black
    lightGray: [243, 244, 246],  // Light background
    border: [229, 231, 235],     // Light border
    white: [255, 255, 255],      // White
    darkBlue: [30, 64, 175]      // Dark blue
  };

  // Helper functions
  const checkPageBreak = (requiredSpace: number = 20): void => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  const addHeader = () => {
    // APDP Official Header
    // Top red band
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, pageWidth, 8, 'F');
    
    // White space for logo area
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 8, pageWidth, 35, 'F');
    
    // APDP Logo placeholder (left side)
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(1);
    pdf.rect(leftMargin, 15, 25, 20);
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('APDP', leftMargin + 12.5, 25, { align: 'center' });
    pdf.text('MONACO', leftMargin + 12.5, 30, { align: 'center' });
    
    // Document title (center-right)
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT DE CONFORMITE', pageWidth / 2 + 10, 22, { align: 'left' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.secondary);
    pdf.text('Audit de Securite et Protection des Donnees', pageWidth / 2 + 10, 30, { align: 'left' });
    
    // Bottom border
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(0, 43, pageWidth, 43);
    
    yPosition = 55;
  };

  const addSectionTitle = (title: string, sectionNumber?: string) => {
    checkPageBreak(35);
    yPosition += 12;
    
    // Red accent bar on left
    pdf.setFillColor(...colors.primary);
    pdf.rect(leftMargin, yPosition - 8, 4, 14, 'F');
    
    // Section number (if provided)
    if (sectionNumber) {
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sectionNumber, leftMargin + 8, yPosition);
    }
    
    // Title
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const displayTitle = cleanText(title);
    const titleX = sectionNumber ? leftMargin + 20 : leftMargin + 8;
    pdf.text(displayTitle, titleX, yPosition);
    
    // Thin underline
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(leftMargin, yPosition + 4, rightMargin, yPosition + 4);
    
    yPosition += 18;
  };

  const addText = (text: string, fontSize = 10, isBold = false, color = colors.text, indent = 0) => {
    checkPageBreak(15);
    
    const cleanedText = cleanText(text);
    
    pdf.setTextColor(...color);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(cleanedText, contentWidth - indent - 2);
    lines.forEach((line: string) => {
      checkPageBreak(8);
      pdf.text(line, leftMargin + indent, yPosition);
      yPosition += fontSize * 0.6 + 1; // Better line spacing
    });
    yPosition += 4;
  };

  const addKeyValuePair = (key: string, value: string, valueColor?: number[]) => {
    checkPageBreak(10);
    
    const cleanedKey = cleanText(key);
    const cleanedValue = cleanText(value);
    
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    const keyText = `${cleanedKey}:`;
    pdf.text(keyText, leftMargin, yPosition);
    
    // Value color
    if (valueColor) {
      pdf.setTextColor(...valueColor);
    } else {
      pdf.setTextColor(...colors.text);
    }
    
    pdf.setFont('helvetica', 'normal');
    const valueX = leftMargin + pdf.getTextWidth(keyText) + 3;
    const lines = pdf.splitTextToSize(cleanedValue, rightMargin - valueX - 2);
    lines.forEach((line: string, index: number) => {
      if (index > 0) {
        checkPageBreak(6);
        yPosition += 6;
      }
      pdf.text(line, valueX, yPosition);
    });
    yPosition += 9;
  };

  const addScoreCard = (score: number, level: string, grade: string) => {
    checkPageBreak(70);
    
    const cardX = leftMargin;
    const cardY = yPosition;
    const cardWidth = contentWidth;
    const cardHeight = 60;
    
    // White background with shadow effect
    pdf.setFillColor(255, 255, 255);
    pdf.rect(cardX, cardY, cardWidth, cardHeight, 'F');
    
    // Border color based on score
    const borderColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(1.5);
    pdf.rect(cardX, cardY, cardWidth, cardHeight);
    
    // Left section: Score display
    const leftSectionWidth = 70;
    
    // Vertical separator
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(cardX + leftSectionWidth, cardY, cardX + leftSectionWidth, cardY + cardHeight);
    
    // Score circle
    const circleX = cardX + leftSectionWidth / 2;
    const circleY = cardY + 30;
    const circleRadius = 20;
    
    // Outer circle (border)
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(3);
    pdf.circle(circleX, circleY, circleRadius);
    
    // Score number
    pdf.setTextColor(...borderColor);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(score.toString(), circleX, circleY + 7, { align: 'center' });
    
    // "/100" text
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('/100', circleX, circleY + 16, { align: 'center' });
    
    // Grade letter above
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Note: ${grade}`, circleX, circleY - 18, { align: 'center' });
    
    // Right section: Details
    const rightX = cardX + leftSectionWidth + 8;
    
    // Title
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EVALUATION DE CONFORMITE APDP', rightX, cardY + 15);
    
    // Level
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.secondary);
    pdf.text(`Niveau de conformite: ${cleanText(level)}`, rightX, cardY + 26);
    
    // Status with icon
    const statusMsg = score >= 80 ? 'CONFORME - Excellente protection des donnees' : 
                      score >= 60 ? 'PARTIELLEMENT CONFORME - Ameliorations requises' : 
                      'NON CONFORME - Actions correctives urgentes';
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...borderColor);
    
    // Status box
    pdf.setFillColor(...borderColor);
    pdf.rect(rightX, cardY + 32, 3, 12, 'F');
    pdf.text(cleanText(statusMsg), rightX + 6, cardY + 40);
    
    // Interpretation
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.secondary);
    const interpretation = score >= 80 ? 'Vos pratiques respectent les exigences APDP' :
                          score >= 60 ? 'Des ameliorations sont necessaires pour une conformite complete' :
                          'Exposition significative aux risques juridiques et securitaires';
    pdf.text(cleanText(interpretation), rightX + 6, cardY + 50);
    
    yPosition += cardHeight + 18;
  };

  const addIssuesSummary = (critical: number, warnings: number, improvements: number, compliant: number) => {
    checkPageBreak(50);
    
    // Title for this section
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SYNTHESE DES CONSTATATIONS', leftMargin, yPosition);
    yPosition += 10;
    
    const cardX = leftMargin;
    const cardY = yPosition;
    const cardWidth = (contentWidth - 9) / 4;
    const cardHeight = 38;
    
    const items = [
      { label: 'CRITIQUES', sublabel: 'Action immediate', value: critical, color: colors.error, bg: [254, 242, 242] },
      { label: 'IMPORTANTS', sublabel: 'A corriger', value: warnings, color: colors.warning, bg: [255, 251, 235] },
      { label: 'SUGGESTIONS', sublabel: 'Ameliorations', value: improvements, color: colors.darkBlue, bg: [239, 246, 255] },
      { label: 'CONFORMES', sublabel: 'Validees', value: compliant, color: colors.success, bg: [240, 253, 244] }
    ];
    
    items.forEach((item, index) => {
      const x = cardX + (cardWidth + 3) * index;
      
      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x, cardY, cardWidth, cardHeight, 'F');
      
      // Top colored band
      pdf.setFillColor(...item.color);
      pdf.rect(x, cardY, cardWidth, 3, 'F');
      
      // Border
      pdf.setDrawColor(...item.color);
      pdf.setLineWidth(1);
      pdf.rect(x, cardY, cardWidth, cardHeight);
      
      // Value (large and centered)
      pdf.setTextColor(...item.color);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.value.toString(), x + cardWidth/2, cardY + 18, { align: 'center' });
      
      // Label
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label, x + cardWidth/2, cardY + 27, { align: 'center' });
      
      // Sublabel
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.secondary);
      pdf.text(item.sublabel, x + cardWidth/2, cardY + 33, { align: 'center' });
    });
    
    yPosition += cardHeight + 18;
  };

  const addIssueCard = (issue: Issue, index: number) => {
    checkPageBreak(60);
    
    const cardX = leftMargin;
    const cardY = yPosition;
    const cardWidth = contentWidth;
    
    // Severity color
    const severityColor = issue.type === 'critical' ? colors.error : 
                          issue.type === 'warning' ? colors.warning : 
                          colors.darkBlue;
    
    // Background box for the issue
    pdf.setFillColor(250, 250, 250);
    const boxHeight = 12; // Will extend as we add content
    pdf.rect(cardX, cardY, cardWidth, boxHeight, 'F');
    
    // Severity indicator bar (left side)
    pdf.setFillColor(...severityColor);
    pdf.rect(cardX, cardY, 4, boxHeight, 'F');
    
    // Issue number circle
    pdf.circle(cardX + 10, cardY + 6, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(index.toString(), cardX + 10, cardY + 7, { align: 'center' });
    
    // Title
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(cleanText(issue.title), contentWidth - 20);
    titleLines.forEach((line: string, i: number) => {
      pdf.text(line, cardX + 16, cardY + 7 + (i * 6));
    });
    yPosition = cardY + 8 + (titleLines.length * 6);
    
    // Category badge
    pdf.setFillColor(...severityColor);
    pdf.rect(cardX + 16, yPosition, pdf.getTextWidth(`[${issue.category}]`) + 4, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`[${cleanText(issue.category)}]`, cardX + 18, yPosition + 3.5);
    yPosition += 9;
    
    // Description with better spacing
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(cleanText(issue.description), contentWidth - 20);
    descLines.forEach((line: string) => {
      checkPageBreak(6);
      pdf.text(line, cardX + 16, yPosition);
      yPosition += 5.5;
    });
    
    yPosition += 3;
    
    // Recommendation box
    pdf.setFillColor(240, 249, 255); // Light blue background
    const recStartY = yPosition;
    
    pdf.setTextColor(...colors.darkBlue);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECOMMANDATION:', cardX + 16, yPosition);
    yPosition += 6;
    
    pdf.setFont('helvetica', 'normal');
    const recLines = pdf.splitTextToSize(cleanText(issue.recommendation), contentWidth - 20);
    recLines.forEach((line: string) => {
      checkPageBreak(6);
      pdf.text(line, cardX + 16, yPosition);
      yPosition += 5.5;
    });
    
    // Draw recommendation box
    pdf.setDrawColor(...colors.darkBlue);
    pdf.setLineWidth(0.5);
    pdf.rect(cardX + 14, recStartY - 3, cardWidth - 14, yPosition - recStartY + 3);
    
    yPosition += 4;
    
    // Metadata with icons
    if (issue.priority || issue.impact || issue.effort) {
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.secondary);
      pdf.setFont('helvetica', 'normal');
      
      const metadata: string[] = [];
      if (issue.priority) metadata.push(`Priorite: ${cleanText(issue.priority)}`);
      if (issue.impact) metadata.push(`Impact: ${cleanText(issue.impact)}`);
      if (issue.effort) metadata.push(`Effort: ${cleanText(issue.effort)}`);
      
      pdf.text(metadata.join('  |  '), cardX + 16, yPosition);
      yPosition += 6;
    }
    
    // Legal reference
    if (issue.article) {
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Reference legale: ${cleanText(issue.article)}`, cardX + 16, yPosition);
      yPosition += 6;
    }
    
    // Separator line with more space
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(cardX, yPosition + 2, cardX + contentWidth, yPosition + 2);
    yPosition += 10;
  };

  const addCategorySummary = (categories: any) => {
    if (!categories) return;
    
    checkPageBreak(30);
    
    Object.entries(categories).forEach(([name, data]: [string, any]) => {
      checkPageBreak(25);
      
      const boxX = leftMargin;
      const boxY = yPosition;
      const boxWidth = contentWidth;
      const boxHeight = 20;
      
      // Background
      const bgColor = data.status === 'good' ? [220, 252, 231] : 
                      data.status === 'warning' ? [254, 243, 199] : 
                      [254, 226, 226];
      pdf.setFillColor(...bgColor);
      pdf.rect(boxX, boxY, boxWidth, boxHeight, 'F');
      
      // Border
      const borderColor = data.status === 'good' ? colors.success : 
                          data.status === 'warning' ? colors.warning : 
                          colors.error;
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(1.5);
      pdf.rect(boxX, boxY, boxWidth, boxHeight);
      
      // Status indicator circle
      pdf.setFillColor(...borderColor);
      pdf.circle(boxX + 6, boxY + 10, 3, 'F');
      
      // Category name
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cleanText(name), boxX + 12, boxY + 8);
      
      // Score with visual emphasis
      pdf.setTextColor(...borderColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${data.score}/100`, boxX + boxWidth - 30, boxY + 9);
      
      // Issues count
      pdf.setTextColor(...colors.secondary);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${data.issues} probleme(s) detecte(s)`, boxX + 12, boxY + 15);
      
      // Progress bar with better visibility
      const barX = boxX + 4;
      const barY = boxY + boxHeight - 5;
      const barWidth = boxWidth - 8;
      const barHeight = 3;
      
      // Background bar
      pdf.setFillColor(230, 230, 230);
      pdf.rect(barX, barY, barWidth, barHeight, 'F');
      
      // Progress bar
      pdf.setFillColor(...borderColor);
      const progress = Math.max(1, (data.score / 100) * barWidth);
      pdf.rect(barX, barY, progress, barHeight, 'F');
      
      yPosition += boxHeight + 5;
    });
  };

  // Start generating the PDF
  addHeader();

  // Document metadata box
  pdf.setFillColor(248, 250, 252);
  pdf.rect(leftMargin, yPosition, contentWidth, 30, 'F');
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.5);
  pdf.rect(leftMargin, yPosition, contentWidth, 30);
  
  yPosition += 8;
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMATIONS DU DOCUMENT', leftMargin + 5, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.secondary);
  pdf.text(`Site audite: ${cleanText(data.url || 'Non specifie')}`, leftMargin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Date d'audit: ${new Date(data.timestamp).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, leftMargin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Type d'analyse: Audit complet de conformite APDP et securite`, leftMargin + 5, yPosition);
  yPosition += 15;

  // Executive Summary
  addSectionTitle('RESUME EXECUTIF', '1.');
  
  yPosition += 8;
  addScoreCard(data.numericScore || 0, data.complianceLevel || 'Non déterminé', data.overallScore || 'N/A');
  
  addIssuesSummary(
    data.criticalIssues || 0, 
    data.warnings || 0, 
    data.improvements || 0, 
    data.compliantItems || 0
  );

  // Summary interpretation
  pdf.setFillColor(240, 249, 255);
  pdf.rect(leftMargin, yPosition, contentWidth, 20, 'F');
  pdf.setDrawColor(...colors.darkBlue);
  pdf.setLineWidth(0.5);
  pdf.rect(leftMargin, yPosition, contentWidth, 20);
  
  yPosition += 7;
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const summaryText = 'Ce rapport presente une evaluation complete de la conformite et de la securite de votre site web selon les exigences de l\'Autorite de Protection des Donnees Personnelles de Monaco (APDP) et les meilleures pratiques de securite internationale.';
  const summaryLines = pdf.splitTextToSize(cleanText(summaryText), contentWidth - 6);
  summaryLines.forEach((line: string) => {
    pdf.text(line, leftMargin + 3, yPosition);
    yPosition += 5;
  });
  yPosition += 8;

  // Category summary if available
  if (data.categories) {
    addSectionTitle('ANALYSE PAR CATEGORIE', '2.');
    addCategorySummary(data.categories);
  }

  // Critical Issues Section
  if (data.issues && data.issues.critical && data.issues.critical.length > 0) {
    pdf.addPage();
    yPosition = 25;
    
    addSectionTitle('CONSTATATIONS CRITIQUES', '3.');
    
    // Alert box
    pdf.setFillColor(254, 242, 242);
    pdf.rect(leftMargin, yPosition, contentWidth, 15, 'F');
    pdf.setDrawColor(...colors.error);
    pdf.setLineWidth(1);
    pdf.rect(leftMargin, yPosition, contentWidth, 15);
    
    yPosition += 6;
    pdf.setTextColor(...colors.error);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRIORITE MAXIMALE - ACTION IMMEDIATE REQUISE (0-7 jours)', leftMargin + 3, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Les problemes suivants presentent des risques majeurs pour la conformite et la securite.', leftMargin + 3, yPosition);
    yPosition += 12;
    
    data.issues.critical.forEach((issue, index) => {
      addIssueCard(issue, index + 1);
    });
  }

  // Warning Issues Section
  if (data.issues && data.issues.warnings && data.issues.warnings.length > 0) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 25;
    }
    
    const sectionNum = data.issues.critical && data.issues.critical.length > 0 ? '4.' : '3.';
    addSectionTitle('CONSTATATIONS IMPORTANTES', sectionNum);
    
    // Warning box
    pdf.setFillColor(255, 251, 235);
    pdf.rect(leftMargin, yPosition, contentWidth, 12, 'F');
    pdf.setDrawColor(...colors.warning);
    pdf.setLineWidth(0.8);
    pdf.rect(leftMargin, yPosition, contentWidth, 12);
    
    yPosition += 5;
    pdf.setTextColor(...colors.warning);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CORRECTION RECOMMANDEE (7-30 jours)', leftMargin + 3, yPosition);
    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Actions necessaires pour atteindre une conformite optimale.', leftMargin + 3, yPosition);
    yPosition += 10;
    
    data.issues.warnings.forEach((issue, index) => {
      addIssueCard(issue, index + 1);
    });
  }

  // Improvement Issues Section
  if (data.issues && data.issues.improvements && data.issues.improvements.length > 0) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 25;
    }
    
    let sectionNum = '3.';
    if (data.issues.critical && data.issues.critical.length > 0) sectionNum = '4.';
    if (data.issues.warnings && data.issues.warnings.length > 0) sectionNum = '5.';
    
    addSectionTitle('RECOMMANDATIONS D\'AMELIORATION', sectionNum);
    
    // Info box
    pdf.setFillColor(239, 246, 255);
    pdf.rect(leftMargin, yPosition, contentWidth, 10, 'F');
    pdf.setDrawColor(...colors.darkBlue);
    pdf.setLineWidth(0.5);
    pdf.rect(leftMargin, yPosition, contentWidth, 10);
    
    yPosition += 5;
    pdf.setTextColor(...colors.darkBlue);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ameliorations suggerees pour renforcer la securite et la conformite (1-3 mois).', leftMargin + 3, yPosition);
    yPosition += 10;
    
    data.issues.improvements.forEach((issue, index) => {
      addIssueCard(issue, index + 1);
    });
  }

  // Compliant Items Section
  if (data.issues && data.issues.compliant && data.issues.compliant.length > 0) {
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 25;
    }
    
    addSectionTitle('ELEMENTS CONFORMES');
    
    addText('Les aspects suivants de votre site web sont conformes aux exigences APDP.', 9, false, colors.success);
    yPosition += 5;
    
    data.issues.compliant.slice(0, 10).forEach((issue, index) => {
      checkPageBreak(15);
      pdf.setTextColor(...colors.success);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`✓ ${issue.title}`, leftMargin + 2, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Additional Technical Details
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle('DETAILS TECHNIQUES COMPLEMENTAIRES');

  // Legal Pages Section
  if (legalPages && !legalPages.error) {
    checkPageBreak(35);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('Pages Légales et Conformité', leftMargin, yPosition);
    yPosition += 8;
    
    const scoreColor = legalPages.complianceScore >= 75 ? colors.success : 
                       legalPages.complianceScore >= 60 ? colors.warning : colors.error;
    addKeyValuePair('Score de Conformité Légale', `${legalPages.complianceScore || 0}/100`, scoreColor);
    
    if (legalPages.summary) {
      addKeyValuePair('Pages Requises Trouvées', `${legalPages.summary.found || 0}/${legalPages.summary.totalRequired || 0}`);
      if (legalPages.summary.accessible !== undefined) {
      addKeyValuePair('Pages Accessibles', legalPages.summary.accessible.toString());
      }
      if (legalPages.summary.inaccessible !== undefined && legalPages.summary.inaccessible > 0) {
        addKeyValuePair('Pages Inaccessibles', legalPages.summary.inaccessible.toString(), colors.warning);
      }
    }
    
    if (legalPages.missingPages && legalPages.missingPages.length > 0) {
      yPosition += 3;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.error);
      pdf.text('Pages Légales Manquantes:', leftMargin, yPosition);
      yPosition += 6;
      
      legalPages.missingPages.forEach((page: string) => {
        checkPageBreak();
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${page}`, leftMargin + 3, yPosition);
        yPosition += 5;
      });
    }
    
    if (legalPages.foundPages && legalPages.foundPages.length > 0) {
      yPosition += 3;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.success);
      pdf.text('Pages Légales Trouvées:', leftMargin, yPosition);
      yPosition += 6;
      
      legalPages.foundPages.slice(0, 10).forEach((page: any) => {
        checkPageBreak();
        pdf.setFont('helvetica', 'normal');
        pdf.text(`✓ ${page.type || page.name || page}`, leftMargin + 3, yPosition);
        yPosition += 5;
      });
    }
    
    yPosition += 8;
  }

  // CDN and Third-Party Services
  if (cdnResources && !cdnResources.error) {
    checkPageBreak(35);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('Ressources Externes et Services Tiers', leftMargin, yPosition);
    yPosition += 8;
    
    const totalResources = cdnResources.totalResources !== undefined ? cdnResources.totalResources.toString() : '0';
    const cdnCount = cdnResources.summary?.cdnCount !== undefined ? cdnResources.summary.cdnCount.toString() : '0';
    
    addKeyValuePair('Ressources Externes Totales', totalResources);
    addKeyValuePair('Fournisseurs CDN Détectés', cdnCount);
    
    if (cdnResources.privacyIssues && cdnResources.privacyIssues.length > 0) {
      yPosition += 3;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.warning);
      pdf.text('Problèmes de Confidentialité:', leftMargin, yPosition);
      yPosition += 6;
      
      cdnResources.privacyIssues.slice(0, 5).forEach((issue: any) => {
        checkPageBreak(15);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.text);
        pdf.text(`• ${issue.title || issue}`, leftMargin + 3, yPosition);
        yPosition += 5;
        
        if (issue.article) {
          pdf.setFontSize(8);
          pdf.setTextColor(...colors.primary);
          pdf.text(`  Référence: ${issue.article}`, leftMargin + 6, yPosition);
          pdf.setFontSize(9);
          yPosition += 5;
        }
      });
    }
    
    yPosition += 8;
  }

  // Security Analysis
  if (data.detailedAnalysis && (data.detailedAnalysis.sslSecurity || data.detailedAnalysis.cookieCompliance)) {
    checkPageBreak(35);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('Analyse de Sécurité Détaillée', leftMargin, yPosition);
    yPosition += 8;
    
    if (data.detailedAnalysis.sslSecurity) {
      const isValid = data.detailedAnalysis.sslSecurity.isValid || false;
      const sslColor = isValid ? colors.success : colors.error;
      addKeyValuePair('Certificat SSL/TLS', 
        isValid ? 'Valide ✓' : 'Invalide ou Expiré ✗', 
        sslColor);
      addKeyValuePair('Protocole Utilisé', data.detailedAnalysis.sslSecurity.protocol || 'TLS');
    }
    
    if (data.detailedAnalysis.cookieCompliance) {
      addKeyValuePair('Analyse des Cookies', data.detailedAnalysis.cookieCompliance.status || 'Analysé');
      const cookieCount = data.detailedAnalysis.cookieCompliance.cookieCount !== undefined 
        ? data.detailedAnalysis.cookieCompliance.cookieCount.toString() 
        : '0';
      addKeyValuePair('Cookies Détectés', cookieCount);
    }
    
    yPosition += 5;
  }

  // Action Plan and Recommendations
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle('PLAN D\'ACTION RECOMMANDE');
  
  addText('Sur la base de l\'analyse réalisée, voici les actions prioritaires à entreprendre pour améliorer la conformité et la sécurité de votre site web:', 9.5, false, colors.text);
  yPosition += 8;
  
  const actionPlan = [
    {
      priority: 'URGENT (0-7 jours)',
      color: colors.error,
      actions: [
        'Traiter tous les problèmes critiques identifiés dans ce rapport',
        'Corriger les vulnérabilités de sécurité majeures',
        'Mettre à jour les certificats SSL expirés ou faibles'
      ]
    },
    {
      priority: 'IMPORTANT (7-30 jours)',
      color: colors.warning,
      actions: [
        'Implémenter un système de gestion des consentements cookies conforme RGPD',
        'Compléter les pages légales manquantes (Politique de Confidentialité, CGU, etc.)',
        'Configurer les en-têtes de sécurité HTTP recommandés'
      ]
    },
    {
      priority: 'RECOMMANDÉ (1-3 mois)',
      color: colors.darkBlue,
      actions: [
        'Optimiser les performances du site web',
        'Mettre en place un processus d\'audit de sécurité régulier',
        'Former les équipes aux bonnes pratiques de protection des données'
      ]
    }
  ];
  
  actionPlan.forEach((phase) => {
    checkPageBreak(25);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...phase.color);
    pdf.text(phase.priority, leftMargin, yPosition);
    yPosition += 7;
    
    phase.actions.forEach((action) => {
      checkPageBreak();
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      const lines = pdf.splitTextToSize(`• ${action}`, contentWidth - 3);
      lines.forEach((line: string) => {
        pdf.text(line, leftMargin + 3, yPosition);
        yPosition += 5;
      });
    });
    
    yPosition += 5;
  });

  // Conclusion and Next Steps
  checkPageBreak(60);
  yPosition += 10;
  
  addSectionTitle('CONCLUSION ET PROCHAINES ETAPES');
  
  const score = data.numericScore || 0;
  const conclusionText = score >= 80 
    ? 'Votre site web présente un bon niveau de conformité APDP et de sécurité. Continuez à surveiller et maintenir les bonnes pratiques identifiées, et traitez les quelques points d\'amélioration restants pour atteindre l\'excellence.'
    : score >= 60
    ? 'Votre site web présente un niveau de conformité acceptable, mais nécessite des améliorations importantes pour atteindre les standards APDP. Priorisez les actions correctives identifiées dans le plan d\'action ci-dessus.'
    : 'Votre site web présente des lacunes importantes en matière de conformité APDP et de sécurité. Il est impératif de traiter rapidement les problèmes critiques identifiés pour éviter des risques juridiques et sécuritaires majeurs.';
  
  addText(conclusionText, 10, false, colors.text);
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.text);
  pdf.text('Recommandations Générales:', leftMargin, yPosition);
  yPosition += 6;
  
  const generalRecs = [
    'Effectuez un audit de conformité complet tous les 6 mois',
    'Maintenez une documentation à jour de vos traitements de données',
    'Formez régulièrement vos équipes aux bonnes pratiques RGPD/APDP',
    'Désignez un responsable de la protection des données (DPO)',
    'Mettez en place un processus de gestion des incidents de sécurité'
  ];
  
  generalRecs.forEach((rec) => {
    checkPageBreak();
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(`• ${rec}`, contentWidth - 3);
    lines.forEach((line: string) => {
      pdf.text(line, leftMargin + 3, yPosition);
      yPosition += 5;
    });
  });
  
  yPosition += 10;
  
  // Contact and support info
  pdf.setFillColor(...colors.lightGray);
  pdf.rect(leftMargin, yPosition, contentWidth, 30, 'F');
  
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.primary);
  pdf.text('Besoin d\'Assistance ?', leftMargin + 3, yPosition);
  
  yPosition += 7;
    pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  pdf.text('Ce rapport a été généré automatiquement par la plateforme BeCompliant.', leftMargin + 3, yPosition);
  yPosition += 5;
  pdf.text('Pour toute question ou assistance dans la mise en conformité, contactez un expert APDP.', leftMargin + 3, yPosition);
  yPosition += 5;
  pdf.setTextColor(...colors.primary);
  pdf.text('Documentation APDP Monaco: www.apdp.mc', leftMargin + 3, yPosition);
  
  // Professional APDP Footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 15;
    
    // Top separator line
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(leftMargin, footerY - 6, rightMargin, footerY - 6);
    
    // Left: APDP reference
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('APDP Monaco', leftMargin, footerY);
    pdf.setFontSize(6);
    pdf.text('Autorite de Protection des Donnees Personnelles', leftMargin, footerY + 3);
    
    // Center: Date
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(dateStr, pageWidth / 2, footerY, { align: 'center' });
    
    // Right: Page number
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Page ${pageNum} / ${totalPages}`, rightMargin, footerY, { align: 'right' });
    
    // Bottom: Confidentiality
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...colors.secondary);
    pdf.text('DOCUMENT CONFIDENTIEL - Ne pas diffuser sans autorisation', pageWidth / 2, footerY + 4.5, { align: 'center' });
  };

  // Add footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i, totalPages);
  }

    // Save the PDF with timestamp
    const sanitizedUrl = (data.url || 'site-web').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = `BeCompliant-Rapport-${sanitizedUrl}-${dateStr}-${timeStr}.pdf`;
    
  pdf.save(fileName);
    
    console.log(`PDF report generated successfully: ${fileName}`);
    
  } catch (error) {
    console.error('Error during PDF generation:', error);
    console.error('Data that caused the error:', JSON.stringify(data, null, 2));
    throw new Error(`Échec de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

export default generateComplianceReport;







