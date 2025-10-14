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
              Analyse complète de la conformité APDP et des bonnes pratiques de sécurité.
              <br />
              Score basé sur {Object.keys(allResults).length} vérifications techniques.
            </div>
          </HeaderInfo>

          {actionButtons && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionButtons}
            </div>
          )}
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
              {complianceAnalysis.criticalIssues}
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
              {complianceAnalysis.warnings}
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
              {complianceAnalysis.improvements}
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
              {complianceAnalysis.compliantItems}
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

          {/* Vulnerabilities - only show if data exists */}
          {allResults.vulnerabilities && (
            <DetailCard icon="🛡️" title="Vulnérabilités">
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Score Sécurité:</strong> {allResults.vulnerabilities.summary?.securityScore || 'N/A'}/100
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Total:</strong> {allResults.vulnerabilities.summary?.totalVulnerabilities || 0} vulnérabilités
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Critiques:</strong> {allResults.vulnerabilities.summary?.criticalCount || 0}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Élevées:</strong> {allResults.vulnerabilities.summary?.highCount || 0}
                </div>
              </div>
            </DetailCard>
          )}

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
          🚨 Problèmes Critiques ({complianceAnalysis.criticalIssues})
        </h4>
        {/* Critical issues content would go here */}
      </div>

      <div id="warnings-section" style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.warning, 
          marginBottom: '12px' 
        }}>
          ⚠️ Avertissements ({complianceAnalysis.warnings})
        </h4>
        {/* Warnings content would go here */}
      </div>

      <div id="improvements-section" style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.info, 
          marginBottom: '12px' 
        }}>
          💡 Améliorations Recommandées ({complianceAnalysis.improvements})
        </h4>
        {/* Improvements content would go here */}
      </div>

      <div id="compliant-section" style={{ marginTop: '24px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: colors.success, 
          marginBottom: '12px' 
        }}>
          ✅ Éléments Conformes ({complianceAnalysis.compliantItems})
        </h4>
        {/* Compliant items content would go here */}
      </div>
    </SummaryContainer>
  );
};

export default EnhancedComplianceSummaryCard;






