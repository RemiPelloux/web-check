import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { ComplianceAnalyzer } from 'web-check-live/utils/complianceAnalyzer';

// Modular components
import DetailCard from './ComplianceSections/DetailCard';
import CookiesSection from './ComplianceSections/CookiesSection';
import SecurityHeadersSection from './ComplianceSections/SecurityHeadersSection';
import SSLSection from './ComplianceSections/SSLSection';
import ThirdPartySection from './ComplianceSections/ThirdPartySection';
import PerformanceSection from './ComplianceSections/PerformanceSection';

// Styled components
const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: ${colors.background};
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid ${colors.borderColor};
  overflow: hidden;
`;

const HeaderSection = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  padding: 32px;
  border-radius: 12px;
  margin: 24px;
  position: relative;
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 16px;
  }
`;

const ScoreCircle = styled.div<{ score: string; numericScore: number }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 900;
  color: ${colors.background};
  background: ${({ numericScore }) => 
    numericScore >= 90 ? colors.success :
    numericScore >= 80 ? '#22c55e' :
    numericScore >= 70 ? colors.warning :
    numericScore >= 60 ? '#f59e0b' :
    colors.error
  };
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
    pointer-events: none;
  }
`;

const ScoreText = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  opacity: 0.9;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const SiteTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${colors.textColor};
  margin: 0 0 8px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ComplianceLevel = styled.div<{ level: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ level }) => 
    level === 'Excellent' ? colors.success :
    level === 'Bon' ? '#22c55e' :
    level === 'Moyen' ? colors.warning :
    level === 'Faible' ? '#f59e0b' :
    colors.error
  };
  margin-bottom: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const StatCard = styled.div<{ 
  clickable?: boolean; 
  isHovered?: boolean;
  severity?: 'critical' | 'warning' | 'improvement' | 'compliant';
}>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'default'};
  position: relative;
  
  ${({ clickable, isHovered }) => clickable && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: ${colors.primary};
    }
  `}
  
  ${({ isHovered }) => isHovered && `
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${colors.primary};
  `}
`;

const StatNumber = styled.div<{ severity?: 'critical' | 'warning' | 'improvement' | 'compliant' }>`
  font-size: 36px;
  font-weight: 900;
  color: ${({ severity }) => 
    severity === 'critical' ? colors.error :
    severity === 'warning' ? colors.warning :
    severity === 'improvement' ? colors.info :
    severity === 'compliant' ? colors.success :
    colors.textColor
  };
  margin-bottom: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const StatHint = styled.div`
  font-size: 11px;
  color: ${colors.textColorSecondary};
  opacity: 0.8;
`;

const DetailSection = styled.div`
  margin-top: 32px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

// Interface
interface EnhancedComplianceSummaryProps {
  data: any;
  allResults: Record<string, any>;
  title: string;
  actionButtons?: any;
}

// Main component
const EnhancedComplianceSummaryCard: React.FC<EnhancedComplianceSummaryProps> = ({ 
  data, 
  allResults, 
  title, 
  actionButtons 
}) => {
  
  const complianceAnalysis = useMemo(() => {
    const analyzer = new ComplianceAnalyzer();
    return analyzer.analyzeCompliance(allResults, allResults.url || '');
  }, [allResults]);

  const [hoveredStat, setHoveredStat] = React.useState<string | null>(null);

  const getComplianceLevel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Bon';
    if (score >= 70) return 'Moyen';
    if (score >= 60) return 'Faible';
    return 'Critique';
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePDFExport = () => {
    // Enhanced PDF export with comprehensive analysis
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport de Conformité Loi 1.565 - ${siteName}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #1f2937; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #dc2626; padding-bottom: 20px; }
          .score-circle { display: inline-block; width: 80px; height: 80px; border-radius: 50%; 
                         background: ${numericScore >= 80 ? '#22c55e' : numericScore >= 60 ? '#f59e0b' : '#ef4444'};
                         color: white; text-align: center; line-height: 80px; font-size: 24px; font-weight: bold; }
          .section { margin: 30px 0; }
          .issue { margin: 15px 0; padding: 15px; border-left: 4px solid #ef4444; background: #fef2f2; }
          .warning { border-left-color: #f59e0b; background: #fffbeb; }
          .improvement { border-left-color: #3b82f6; background: #eff6ff; }
          .compliant { border-left-color: #22c55e; background: #f0fdf4; }
          h1 { color: #dc2626; font-size: 28px; }
          h2 { color: #1f2937; font-size: 20px; margin-top: 30px; }
          h3 { color: #374151; font-size: 16px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .stat { text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport de Conformité Loi 1.565</h1>
          <h2>${siteName}</h2>
          <div class="score-circle">${complianceAnalysis.overallScore}</div>
          <p>Score: ${numericScore}/100 - Niveau: ${getComplianceLevel(numericScore)}</p>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <h3>Problèmes Critiques</h3>
            <div style="font-size: 24px; color: #ef4444;">${Array.isArray(complianceAnalysis.criticalIssues) ? complianceAnalysis.criticalIssues.length : 0}</div>
          </div>
          <div class="stat">
            <h3>Avertissements</h3>
            <div style="font-size: 24px; color: #f59e0b;">${Array.isArray(complianceAnalysis.warnings) ? complianceAnalysis.warnings.length : 0}</div>
          </div>
          <div class="stat">
            <h3>Améliorations</h3>
            <div style="font-size: 24px; color: #3b82f6;">${Array.isArray(complianceAnalysis.improvements) ? complianceAnalysis.improvements.length : 0}</div>
          </div>
          <div class="stat">
            <h3>Éléments Conformes</h3>
            <div style="font-size: 24px; color: #22c55e;">${Array.isArray(complianceAnalysis.compliantItems) ? complianceAnalysis.compliantItems.length : 0}</div>
          </div>
        </div>

        <div class="section">
          <h2>📊 Résumé Exécutif</h2>
          <p>Ce rapport présente l'analyse de conformité Loi 1.565 pour ${siteName}. L'évaluation porte sur ${Object.keys(allResults).length} aspects techniques incluant la sécurité, la confidentialité, et les bonnes pratiques.</p>
        </div>

        ${complianceAnalysis.criticalIssues && Array.isArray(complianceAnalysis.criticalIssues) && complianceAnalysis.criticalIssues.length > 0 ? `
        <div class="section">
          <h2>🚨 Problèmes Critiques (${complianceAnalysis.criticalIssues.length})</h2>
          ${complianceAnalysis.criticalIssues.map((issue, index) => `
            <div class="issue">
              <h3>${index + 1}. ${issue.title || 'Problème critique'}</h3>
              <p><strong>Sévérité:</strong> ${issue.severity || 'Critique'}</p>
              <p><strong>Description:</strong> ${issue.description || 'Description non disponible'}</p>
              ${issue.recommendation ? `<p><strong>Recommandation:</strong> ${issue.recommendation}</p>` : ''}
              ${issue.article ? `<p><strong>Article Loi 1.565:</strong> ${issue.article}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${complianceAnalysis.warnings && Array.isArray(complianceAnalysis.warnings) && complianceAnalysis.warnings.length > 0 ? `
        <div class="section">
          <h2>⚠️ Avertissements (${complianceAnalysis.warnings.length})</h2>
          ${complianceAnalysis.warnings.map((warning, index) => `
            <div class="warning">
              <h3>${index + 1}. ${warning.title || 'Avertissement'}</h3>
              <p><strong>Sévérité:</strong> ${warning.severity || 'Moyenne'}</p>
              <p><strong>Description:</strong> ${warning.description || 'Description non disponible'}</p>
              ${warning.recommendation ? `<p><strong>Recommandation:</strong> ${warning.recommendation}</p>` : ''}
              ${warning.article ? `<p><strong>Article APDP:</strong> ${warning.article}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${complianceAnalysis.recommendations && Array.isArray(complianceAnalysis.recommendations) && complianceAnalysis.recommendations.length > 0 ? `
        <div class="section">
          <h2>💡 Recommandations (${complianceAnalysis.recommendations.length})</h2>
          ${complianceAnalysis.recommendations.map((rec, index) => `
            <div class="improvement">
              <h3>${index + 1}. ${rec.title || 'Recommandation'}</h3>
              <p><strong>Priorité:</strong> ${rec.priority || 'Normale'}</p>
              <p><strong>Description:</strong> ${rec.description || 'Description non disponible'}</p>
              ${rec.timeline ? `<p><strong>Délai:</strong> ${rec.timeline}</p>` : ''}
              ${rec.impact ? `<p><strong>Impact:</strong> ${rec.impact}</p>` : ''}
              ${rec.actions && Array.isArray(rec.actions) ? `
                <p><strong>Actions à entreprendre:</strong></p>
                <ul>
                  ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="section">
          <h2>🔍 Analyse Technique Détaillée</h2>
          
          <h3>🍪 Cookies & Tracking</h3>
          ${allResults.cookies && (allResults.cookies.cookies || allResults.cookies.clientCookies) ? `
            ${(() => {
              const cookies = allResults.cookies.clientCookies || allResults.cookies.cookies || [];
              return `
                <p><strong>Total:</strong> ${cookies.length} cookies détectés</p>
                <p><strong>Sécurisés:</strong> ${cookies.filter(c => c.secure).length}/${cookies.length}</p>
                <p><strong>HttpOnly:</strong> ${cookies.filter(c => c.httpOnly).length}/${cookies.length}</p>
                <p><strong>SameSite:</strong> ${cookies.filter(c => c.sameSite && c.sameSite !== 'None').length}/${cookies.length}</p>
                <p><strong>Cookies par catégorie:</strong></p>
                <ul>
                  ${cookies.map(cookie => `
                    <li><strong>${cookie.name}:</strong> ${cookie.categories ? cookie.categories.join(', ') : 'Non catégorisé'} 
                    ${cookie.security?.warnings?.length > 0 ? `<span style="color: #dc2626;">(⚠️ ${cookie.security.warnings.length} problème(s))</span>` : ''}</li>
                  `).join('')}
                </ul>
              `;
            })()}
          ` : '<p>Aucun cookie détecté</p>'}

          <h3>🔐 En-têtes de Sécurité</h3>
          ${allResults.headers ? `
            <p><strong>Total analysés:</strong> ${Object.keys(allResults.headers).length} en-têtes</p>
            <p><strong>Strict-Transport-Security:</strong> ${allResults.headers['strict-transport-security'] ? '✅ Présent' : '❌ Manquant'}</p>
            <p><strong>Content-Security-Policy:</strong> ${allResults.headers['content-security-policy'] ? '✅ Présent' : '❌ Manquant'}</p>
            <p><strong>X-Frame-Options:</strong> ${allResults.headers['x-frame-options'] ? '✅ Présent' : '❌ Manquant'}</p>
            <p><strong>X-Content-Type-Options:</strong> ${allResults.headers['x-content-type-options'] ? '✅ Présent' : '❌ Manquant'}</p>
          ` : '<p>Aucun en-tête analysé</p>'}

          <h3>🔒 Chiffrement SSL/TLS</h3>
          ${allResults.ssl ? `
            <p><strong>TLS:</strong> ${allResults.ssl.protocol || 'TLSv1.2'}</p>
            <p><strong>Certificat:</strong> ${(allResults.ssl.valid || allResults.ssl.validCertificate || (!allResults.ssl.error && allResults.ssl.issuer)) ? '✅ Valide' : '❌ Invalide'}</p>
            <p><strong>Émetteur:</strong> ${typeof allResults.ssl.issuer === 'object' ? Object.entries(allResults.ssl.issuer).map(([k,v]) => k + '=' + v).join(', ') : allResults.ssl.issuer || 'N/A'}</p>
            <p><strong>HSTS:</strong> ${allResults.hsts?.isEnabled ? '✅ Activé' : '❌ Désactivé'}</p>
          ` : '<p>Informations SSL/TLS non disponibles</p>'}

          <h3>🌐 Services Tiers</h3>
          ${allResults['cdn-resources'] && allResults['cdn-resources'].summary ? `
            <p><strong>Domaines externes:</strong> ${allResults['cdn-resources'].summary.externalDomains || 0} domaines</p>
            <p><strong>Services Google:</strong> ${allResults['cdn-resources'].summary.googleServices || 0} services</p>
            <p><strong>Ressources CDN:</strong> ${allResults['cdn-resources'].summary.cdnResources || 0} fichiers</p>
            <p><strong>Tracking/Analytics:</strong> ${allResults['cdn-resources'].summary.trackingResources || 0} outils</p>
            ${allResults['cdn-resources'].summary.googleServices > 0 ? '<p style="color: #f59e0b;"><strong>⚠️ Attention:</strong> Services US détectés - Risque Cloud Act</p>' : ''}
          ` : '<p>Aucun service tiers détecté</p>'}

          <h3>⚡ Performance</h3>
          ${allResults.quality && allResults.quality.categories ? `
            <p><strong>Performance:</strong> ${Math.round((allResults.quality.categories.performance?.score || 0) * 100)}/100</p>
            <p><strong>Accessibilité:</strong> ${Math.round((allResults.quality.categories.accessibility?.score || 0) * 100)}/100</p>
            <p><strong>Bonnes pratiques:</strong> ${Math.round((allResults.quality.categories['best-practices']?.score || 0) * 100)}/100</p>
            <p><strong>SEO:</strong> ${Math.round((allResults.quality.categories.seo?.score || 0) * 100)}/100</p>
          ` : '<p>Données de performance non disponibles</p>'}

          ${allResults['legal-pages'] ? `
            <h3>📋 Pages Légales</h3>
            <p><strong>Score:</strong> ${allResults['legal-pages'].complianceScore || 0}%</p>
            <p><strong>Trouvées:</strong> ${allResults['legal-pages'].summary?.found || 0}/${allResults['legal-pages'].summary?.totalRequired || 0}</p>
            <p><strong>Manquantes:</strong> ${allResults['legal-pages'].summary?.missing || 0} pages</p>
            <p><strong>Niveau:</strong> ${allResults['legal-pages'].complianceLevel || 'Non évalué'}</p>
            
            ${allResults['legal-pages'].legalPages ? `
              <p><strong>📄 Pages trouvées:</strong></p>
              <ul>
                ${allResults['legal-pages'].legalPages.filter(page => page.found).map(page => `
                  <li>✅ <strong>${page.name}</strong> - ${page.url || 'URL non spécifiée'}
                  ${page.foundVia ? ` (trouvée via: ${page.foundVia})` : ''}
                  ${page.contentLength ? ` - ${page.contentLength} caractères` : ''}
                  </li>
                `).join('')}
              </ul>
              
              <p><strong>❌ Pages manquantes:</strong></p>
              <ul>
                ${allResults['legal-pages'].legalPages.filter(page => !page.found && page.required).map(page => `
                  <li>❌ <strong>${page.name}</strong> - ${page.article || 'Obligatoire pour la conformité'}
                  ${page.priority ? ` (Priorité: ${page.priority})` : ''}
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          ` : ''}
        </div>

        <div class="section">
          <h2>📋 Conclusions et Recommandations</h2>
          <p>Ce site web présente un score de conformité APDP de <strong>${numericScore}/100</strong> (niveau ${getComplianceLevel(numericScore)}).</p>
          
          ${complianceAnalysis.criticalIssues && Array.isArray(complianceAnalysis.criticalIssues) && complianceAnalysis.criticalIssues.length > 0 ? 
            `<p><strong>Action immédiate requise:</strong> ${complianceAnalysis.criticalIssues.length} problème(s) critique(s) nécessitent une correction immédiate pour assurer la conformité APDP.</p>` : 
            ''
          }
          
          ${complianceAnalysis.warnings && Array.isArray(complianceAnalysis.warnings) && complianceAnalysis.warnings.length > 0 ? 
            `<p><strong>Améliorations recommandées:</strong> ${complianceAnalysis.warnings.length} avertissement(s) doivent être traités dans les prochaines semaines.</p>` : 
            ''
          }

          <p><strong>Date d'analyse:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p><strong>Prochaine révision recommandée:</strong> ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')} (dans 90 jours)</p>
        </div>

        <div class="footer">
          <p>Rapport généré par l'Outil d'Audit de Conformité Loi 1.565 Monaco</p>
          <p>Usage interne - Contrôleurs APDP Monaco</p>
          <p>Confidentiel - Ne pas diffuser sans autorisation</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const siteName = allResults.url ? new URL(allResults.url).hostname.replace('www.', '') : 'Site Web';
  const numericScore = complianceAnalysis.numericScore || 0;
  const complianceLevel = getComplianceLevel(numericScore);

  return (
    <SummaryContainer>
      <HeaderSection>
        <HeaderGrid>
          <ScoreCircle score={complianceAnalysis.overallScore} numericScore={numericScore}>
            {complianceAnalysis.overallScore}
            <ScoreText>Score</ScoreText>
          </ScoreCircle>
          
          <HeaderInfo>
            <SiteTitle>{siteName}</SiteTitle>
            <ComplianceLevel level={complianceLevel}>
              Niveau de Conformité: {complianceLevel}
            </ComplianceLevel>
            <div style={{ 
              fontSize: '14px', 
              color: colors.textColorSecondary,
              lineHeight: '1.5'
            }}>
              Analyse complète de la conformité Loi 1.565 et des bonnes pratiques de sécurité.
              <br />
              Score basé sur {Object.keys(allResults).length} vérifications techniques.
            </div>
          </HeaderInfo>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionButtons && actionButtons}
            <button
              onClick={handlePDFExport}
              style={{
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colors.primaryDarker || '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              📄 Générer Rapport PDF
            </button>
          </div>
        </HeaderGrid>

        <StatsGrid>
          <StatCard 
            clickable 
            isHovered={hoveredStat === 'critical'}
            severity="critical"
            onClick={() => scrollToSection('critical-issues-section')}
            onMouseEnter={() => setHoveredStat('critical')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <StatNumber severity="critical">
              {Array.isArray(complianceAnalysis.criticalIssues) ? complianceAnalysis.criticalIssues.length : complianceAnalysis.criticalIssues || 0}
            </StatNumber>
            <StatLabel>Problèmes Critiques</StatLabel>
            <StatHint>↓ Cliquez pour voir</StatHint>
          </StatCard>

          <StatCard 
            clickable 
            isHovered={hoveredStat === 'warning'}
            severity="warning"
            onClick={() => scrollToSection('warnings-section')}
            onMouseEnter={() => setHoveredStat('warning')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <StatNumber severity="warning">
              {Array.isArray(complianceAnalysis.warnings) ? complianceAnalysis.warnings.length : complianceAnalysis.warnings || 0}
            </StatNumber>
            <StatLabel>Avertissements</StatLabel>
            <StatHint>↓ Cliquez pour voir</StatHint>
          </StatCard>

          <StatCard 
            clickable 
            isHovered={hoveredStat === 'improvement'}
            severity="improvement"
            onClick={() => scrollToSection('improvements-section')}
            onMouseEnter={() => setHoveredStat('improvement')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <StatNumber severity="improvement">
              {Array.isArray(complianceAnalysis.improvements) ? complianceAnalysis.improvements.length : complianceAnalysis.improvements || 0}
            </StatNumber>
            <StatLabel>Améliorations</StatLabel>
            <StatHint>↓ Cliquez pour voir</StatHint>
          </StatCard>

          <StatCard 
            clickable 
            isHovered={hoveredStat === 'compliant'}
            severity="compliant"
            onClick={() => scrollToSection('compliant-section')}
            onMouseEnter={() => setHoveredStat('compliant')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <StatNumber severity="compliant">
              {Array.isArray(complianceAnalysis.compliantItems) ? complianceAnalysis.compliantItems.length : complianceAnalysis.compliantItems || 0}
            </StatNumber>
            <StatLabel>Éléments Conformes</StatLabel>
            <StatHint>↓ Cliquez pour voir</StatHint>
          </StatCard>
        </StatsGrid>
      </HeaderSection>

      {/* Detailed Analysis Section */}
      <DetailSection>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: colors.textColor, 
          marginBottom: '16px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          📊 Analyse Technique Détaillée
        </h3>
        
        <DetailGrid>
          <DetailCard icon="🍪" title="Cookies & Tracking">
            <CookiesSection cookies={allResults.cookies} />
          </DetailCard>

          <DetailCard icon="🔐" title="En-têtes de Sécurité">
            <SecurityHeadersSection headers={allResults.headers} />
          </DetailCard>

          <DetailCard icon="🌐" title="Services Tiers">
            <ThirdPartySection cdnResources={allResults['cdn-resources']} />
          </DetailCard>

          <DetailCard icon="🔒" title="Chiffrement">
            <SSLSection ssl={allResults.ssl} hsts={allResults.hsts} />
          </DetailCard>

          <DetailCard icon="⚡" title="Performance & Technologies">
            <PerformanceSection 
              quality={allResults.quality} 
              techStack={allResults['tech-stack']} 
            />
          </DetailCard>



          {/* Legal Pages - only show if data exists */}
          {allResults['legal-pages'] && (
            <DetailCard icon="📋" title="Pages Légales">
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Score:</strong> {allResults['legal-pages'].complianceScore || 0}%
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Trouvées:</strong> {allResults['legal-pages'].summary?.found || 0}/{allResults['legal-pages'].summary?.totalRequired || 0}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Manquantes:</strong> {allResults['legal-pages'].summary?.missing || 0} pages
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Niveau:</strong> {allResults['legal-pages'].complianceLevel || 'Non évalué'}
                </div>
              </div>
            </DetailCard>
          )}
        </DetailGrid>
      </DetailSection>

      {/* Issue Sections with IDs for anchor navigation */}
      <div id="critical-issues-section" style={{ marginTop: '32px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.error, 
          marginBottom: '12px' 
        }}>
          🚨 Problèmes Critiques ({Array.isArray(complianceAnalysis.criticalIssues) ? complianceAnalysis.criticalIssues.length : 0})
        </h4>
        {complianceAnalysis.criticalIssues && Array.isArray(complianceAnalysis.criticalIssues) && complianceAnalysis.criticalIssues.length > 0 ? (
          <div style={{ marginLeft: '16px' }}>
            {complianceAnalysis.criticalIssues.slice(0, 5).map((issue: any, index: number) => (
              <div key={index} style={{ 
                marginBottom: '12px',
                padding: '12px',
                background: colors.backgroundLighter,
                borderLeft: `4px solid ${colors.error}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: '600', color: colors.error, marginBottom: '4px' }}>
                  {typeof issue === 'string' ? issue : issue.title || 'Problème critique'}
                </div>
                {typeof issue === 'object' && issue.description && (
                  <div style={{ fontSize: '14px', color: colors.textColorSecondary }}>
                    {issue.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginLeft: '16px', color: colors.textColorSecondary, fontStyle: 'italic' }}>
            Aucun problème critique détecté
          </div>
        )}
      </div>

      <div id="warnings-section" style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.warning, 
          marginBottom: '12px' 
        }}>
          ⚠️ Avertissements ({Array.isArray(complianceAnalysis.warnings) ? complianceAnalysis.warnings.length : 0})
        </h4>
        {complianceAnalysis.warnings && Array.isArray(complianceAnalysis.warnings) && complianceAnalysis.warnings.length > 0 ? (
          <div style={{ marginLeft: '16px' }}>
            {complianceAnalysis.warnings.slice(0, 5).map((warning: any, index: number) => (
              <div key={index} style={{ 
                marginBottom: '12px',
                padding: '12px',
                background: colors.backgroundLighter,
                borderLeft: `4px solid ${colors.warning}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: '600', color: colors.warning, marginBottom: '4px' }}>
                  {typeof warning === 'string' ? warning : warning.title || 'Avertissement'}
                </div>
                {typeof warning === 'object' && warning.description && (
                  <div style={{ fontSize: '14px', color: colors.textColorSecondary }}>
                    {warning.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginLeft: '16px', color: colors.textColorSecondary, fontStyle: 'italic' }}>
            Aucun avertissement
          </div>
        )}
      </div>

      <div id="improvements-section" style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.info, 
          marginBottom: '12px' 
        }}>
          💡 Améliorations Recommandées ({Array.isArray(complianceAnalysis.improvements) ? complianceAnalysis.improvements.length : 0})
        </h4>
        {complianceAnalysis.recommendations && Array.isArray(complianceAnalysis.recommendations) && complianceAnalysis.recommendations.length > 0 ? (
          <div style={{ marginLeft: '16px' }}>
            {complianceAnalysis.recommendations.slice(0, 3).map((rec: any, index: number) => (
              <div key={index} style={{ 
                marginBottom: '12px',
                padding: '12px',
                background: colors.backgroundLighter,
                borderLeft: `4px solid ${colors.info}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: '600', color: colors.info, marginBottom: '4px' }}>
                  {typeof rec === 'string' ? rec : rec.title || 'Recommandation'}
                </div>
                {typeof rec === 'object' && rec.description && (
                  <div style={{ fontSize: '14px', color: colors.textColorSecondary, marginBottom: '8px' }}>
                    {rec.description}
                  </div>
                )}
                {typeof rec === 'object' && rec.actions && Array.isArray(rec.actions) && (
                  <ul style={{ fontSize: '13px', color: colors.textColorSecondary, paddingLeft: '16px' }}>
                    {rec.actions.slice(0, 3).map((action: string, i: number) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{action}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginLeft: '16px', color: colors.textColorSecondary, fontStyle: 'italic' }}>
            Aucune amélioration recommandée
          </div>
        )}
      </div>

{/* Only show compliant section if there are actual compliant items */}
      {complianceAnalysis.compliantItems && Array.isArray(complianceAnalysis.compliantItems) && complianceAnalysis.compliantItems.length > 0 && (
        <div id="compliant-section" style={{ marginTop: '24px' }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: colors.success, 
            marginBottom: '12px' 
          }}>
            ✅ Éléments Conformes ({complianceAnalysis.compliantItems.length})
          </h4>
          <div style={{ marginLeft: '16px' }}>
            {complianceAnalysis.compliantItems.slice(0, 5).map((item: any, index: number) => (
              <div key={index} style={{ 
                marginBottom: '8px',
                padding: '8px 12px',
                background: colors.backgroundLighter,
                borderLeft: `4px solid ${colors.success}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: '600', color: colors.success, fontSize: '14px' }}>
                  ✓ {typeof item === 'string' ? item : item.title || 'Élément conforme'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SummaryContainer>
  );
};

export default EnhancedComplianceSummaryCard;
