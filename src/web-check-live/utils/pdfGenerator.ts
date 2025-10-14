// PDF Generation utility for APDP compliance reports
// Using jsPDF for client-side PDF generation

import { jsPDF } from 'jspdf';

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
}

export const generateComplianceReport = async (
  data: ComplianceData,
  vulnerabilities?: any,
  legalPages?: any,
  cdnResources?: any
): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // APDP Red color scheme
  const colors = {
    primary: '#DC2626',      // APDP Red
    secondary: '#374151',    // Dark gray
    success: '#059669',      // Green
    warning: '#D97706',      // Orange
    error: '#DC2626',        // Red
    text: '#111827',         // Almost black
    lightGray: '#F3F4F6',    // Light background
    border: '#E5E7EB'        // Light border
  };

  // Helper functions
  const addHeader = () => {
    // APDP Monaco Logo area (placeholder)
    pdf.setFillColor(220, 38, 38); // APDP Red
    pdf.rect(20, 10, pageWidth - 40, 25, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT DE CONFORMITÉ APDP', pageWidth / 2, 25, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Autorité de Protection des Données Personnelles - Monaco', pageWidth / 2, 30, { align: 'center' });
    
    yPosition = 50;
  };

  const addSectionTitle = (title: string) => {
    yPosition += 10;
    pdf.setTextColor(220, 38, 38); // APDP Red
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPosition);
    
    // Underline
    pdf.setDrawColor(220, 38, 38);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition + 2, 20 + pdf.getTextWidth(title), yPosition + 2);
    
    yPosition += 15;
  };

  const addText = (text: string, fontSize = 10, isBold = false) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setTextColor(17, 24, 39); // Dark text
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - 40);
    lines.forEach((line: string) => {
      pdf.text(line, 20, yPosition);
      yPosition += fontSize * 0.6;
    });
    yPosition += 5;
  };

  const addKeyValuePair = (key: string, value: string, valueColor?: string) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setTextColor(55, 65, 81); // Secondary gray
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(key + ':', 20, yPosition);
    
    // Value color based on content
    if (valueColor === 'success') {
      pdf.setTextColor(5, 150, 105);
    } else if (valueColor === 'warning') {
      pdf.setTextColor(217, 119, 6);
    } else if (valueColor === 'error') {
      pdf.setTextColor(220, 38, 38);
    } else {
      pdf.setTextColor(17, 24, 39);
    }
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 20 + pdf.getTextWidth(key + ': '), yPosition);
    yPosition += 12;
  };

  const addScoreCard = (score: number, level: string) => {
    const cardX = 20;
    const cardY = yPosition;
    const cardWidth = pageWidth - 40;
    const cardHeight = 40;
    
    // Background
    pdf.setFillColor(248, 250, 252); // Light blue-gray
    pdf.rect(cardX, cardY, cardWidth, cardHeight, 'F');
    
    // Border
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(1);
    pdf.rect(cardX, cardY, cardWidth, cardHeight);
    
    // Score circle
    const circleX = cardX + 30;
    const circleY = cardY + 20;
    const circleRadius = 15;
    
    // Circle color based on score
    if (score >= 80) {
      pdf.setFillColor(5, 150, 105); // Green
    } else if (score >= 60) {
      pdf.setFillColor(217, 119, 6); // Orange
    } else {
      pdf.setFillColor(220, 38, 38); // Red
    }
    
    pdf.circle(circleX, circleY, circleRadius, 'F');
    
    // Score text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(score.toString(), circleX, circleY + 5, { align: 'center' });
    
    // Level text
    pdf.setTextColor(17, 24, 39);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score de Conformité APDP', cardX + 60, cardY + 15);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Niveau: ${level}`, cardX + 60, cardY + 30);
    
    yPosition += cardHeight + 15;
  };

  const addIssuesSummary = (critical: number, warnings: number, improvements: number, compliant: number) => {
    const cardX = 20;
    const cardY = yPosition;
    const cardWidth = (pageWidth - 60) / 4;
    const cardHeight = 30;
    
    const items = [
      { label: 'Critique', value: critical, color: [220, 38, 38] },
      { label: 'Attention', value: warnings, color: [217, 119, 6] },
      { label: 'Amélioration', value: improvements, color: [59, 130, 246] },
      { label: 'Conforme', value: compliant, color: [5, 150, 105] }
    ];
    
    items.forEach((item, index) => {
      const x = cardX + (cardWidth + 10) * index;
      
      // Background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(x, cardY, cardWidth, cardHeight, 'F');
      
      // Border
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(x, cardY, cardWidth, cardHeight);
      
      // Value
      pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.value.toString(), x + cardWidth/2, cardY + 15, { align: 'center' });
      
      // Label
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label, x + cardWidth/2, cardY + 25, { align: 'center' });
    });
    
    yPosition += cardHeight + 20;
  };

  // Start generating the PDF
  addHeader();

  // Executive Summary
  addSectionTitle('RÉSUMÉ EXÉCUTIF');
  
  addKeyValuePair('Site Web Analysé', data.url);
  addKeyValuePair('Date d\'Analyse', new Date(data.timestamp).toLocaleString('fr-FR'));
  addKeyValuePair('Durée de l\'Analyse', 'Analyse complète automatisée');
  
  yPosition += 10;
  addScoreCard(data.numericScore, data.complianceLevel);
  
  addIssuesSummary(data.criticalIssues, data.warnings, data.improvements, data.compliantItems);

  // Detailed Analysis
  addSectionTitle('ANALYSE DÉTAILLÉE');
  
  addText('Cette analyse de conformité APDP évalue la conformité de votre site web selon les exigences de l\'Autorité de Protection des Données Personnelles de Monaco.', 11);
  
  if (data.detailedAnalysis) {
    if (data.detailedAnalysis.cookieCompliance) {
      addText('Conformité des Cookies:', 12, true);
      addText(`Statut: ${data.detailedAnalysis.cookieCompliance.status || 'Analysé'}`);
      addText(`Cookies détectés: ${data.detailedAnalysis.cookieCompliance.cookieCount || 'N/A'}`);
      yPosition += 5;
    }
    
    if (data.detailedAnalysis.sslSecurity) {
      addText('Sécurité SSL/TLS:', 12, true);
      addText(`Certificat SSL: ${data.detailedAnalysis.sslSecurity.isValid ? 'Valide' : 'Problème détecté'}`);
      addText(`Protocole: ${data.detailedAnalysis.sslSecurity.protocol || 'N/A'}`);
      yPosition += 5;
    }
  }

  // Vulnerabilities Section
  if (vulnerabilities && !vulnerabilities.error) {
    addSectionTitle('ANALYSE DE SÉCURITÉ');
    
    addKeyValuePair('Score de Sécurité', `${vulnerabilities.securityScore || 0}/100`, 
      vulnerabilities.securityScore >= 80 ? 'success' : 
      vulnerabilities.securityScore >= 60 ? 'warning' : 'error');
    
    addKeyValuePair('Niveau de Risque', vulnerabilities.riskLevel || 'Non déterminé');
    
    if (vulnerabilities.vulnerabilities && vulnerabilities.vulnerabilities.length > 0) {
      addText('Principales Vulnérabilités Détectées:', 12, true);
      vulnerabilities.vulnerabilities.slice(0, 5).forEach((vuln: any) => {
        addText(`• ${vuln.title} (${vuln.severity.toUpperCase()})`);
        if (vuln.recommendation) {
          addText(`  Recommandation: ${vuln.recommendation}`, 9);
        }
        yPosition += 3;
      });
    }
  }

  // Legal Pages Section
  if (legalPages && !legalPages.error) {
    addSectionTitle('CONFORMITÉ DES PAGES LÉGALES');
    
    addKeyValuePair('Score de Conformité Légale', `${legalPages.complianceScore || 0}/100`,
      legalPages.complianceScore >= 75 ? 'success' : 
      legalPages.complianceScore >= 60 ? 'warning' : 'error');
    
    addKeyValuePair('Niveau de Conformité', legalPages.complianceLevel || 'Non déterminé');
    
    if (legalPages.summary) {
      addKeyValuePair('Pages Requises Trouvées', `${legalPages.summary.found}/${legalPages.summary.totalRequired}`);
      addKeyValuePair('Pages Accessibles', legalPages.summary.accessible.toString());
    }
    
    if (legalPages.missingPages && legalPages.missingPages.length > 0) {
      addText('Pages Légales Manquantes:', 12, true);
      legalPages.missingPages.forEach((page: string) => {
        addText(`• ${page}`, 10);
      });
    }
  }

  // CDN Resources Section
  if (cdnResources && !cdnResources.error) {
    addSectionTitle('RESSOURCES EXTERNES ET CDN');
    
    addKeyValuePair('Ressources Externes Totales', cdnResources.totalResources?.toString() || '0');
    addKeyValuePair('Fournisseurs CDN', cdnResources.summary?.cdnCount?.toString() || '0');
    addKeyValuePair('Score Performance', `${cdnResources.summary?.performanceScore || 100}/100`);
    
    if (cdnResources.privacyIssues && cdnResources.privacyIssues.length > 0) {
      addText('Problèmes de Confidentialité Détectés:', 12, true);
      cdnResources.privacyIssues.slice(0, 3).forEach((issue: any) => {
        addText(`• ${issue.title}`);
        if (issue.article) {
          addText(`  Référence légale: ${issue.article}`, 9);
        }
      });
    }
  }

  // Recommendations
  addSectionTitle('RECOMMANDATIONS PRIORITAIRES');
  
  const recommendations = [
    'Mettre en place une politique de confidentialité complète conforme APDP',
    'Implémenter un système de gestion des consentements pour les cookies',
    'Corriger les vulnérabilités de sécurité identifiées',
    'Compléter les pages légales manquantes',
    'Effectuer des audits de conformité réguliers'
  ];
  
  recommendations.forEach((rec, index) => {
    addText(`${index + 1}. ${rec}`, 11);
  });

  // Footer
  const addFooter = () => {
    const footerY = pageHeight - 15;
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Rapport généré par BeCompliant - Plateforme d\'évaluation de conformité APDP Monaco', 20, footerY);
    pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - 20, footerY, { align: 'right' });
  };

  // Add footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter();
  }

  // Save the PDF
  const fileName = `rapport-conformite-apdp-${data.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export default generateComplianceReport;







