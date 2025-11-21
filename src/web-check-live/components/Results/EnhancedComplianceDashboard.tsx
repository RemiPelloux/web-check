import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { EnhancedComplianceAnalyzer } from 'web-check-live/utils/enhancedComplianceAnalyzer';
import ComplianceResume from './ComplianceIssues/ComplianceResume';
import IssuesList from './ComplianceIssues/IssuesList';

interface EnhancedComplianceDashboardProps {
  allResults: any;
  siteName: string;
}

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 32px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${colors.backgroundLighter};
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textColorSecondary};
  font-size: 16px;
  margin: 0;
`;

const ErrorContainer = styled.div`
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #dc2626;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: ${colors.backgroundLighter};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div<{ type: string }>`
  font-size: 32px;
  font-weight: 800;
  color: ${({ type }) => 
    type === 'critical' ? '#dc2626' :
    type === 'warning' ? '#f59e0b' :
    type === 'improvement' ? '#10b981' :
    colors.textColor
  };
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const EnhancedComplianceDashboard: React.FC<EnhancedComplianceDashboardProps> = ({ 
  allResults, 
  siteName 
}) => {
  // State for collapsible section
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  const analysis = useMemo(() => {
    if (!allResults || Object.keys(allResults).length === 0) {
      return null;
    }

    try {
      const analyzer = new EnhancedComplianceAnalyzer(allResults);
      return analyzer.analyze();
    } catch (error) {
      console.error('Compliance analysis error:', error);
      return null;
    }
  }, [allResults]);

  const resumeData = useMemo(() => {
    if (!analysis) return null;

    return {
      score: analysis.score,
      level: analysis.level,
      siteName: siteName || 'Site Web',
      scanDate: new Date().toISOString(),
      totalChecks: Object.keys(allResults).length,
      criticalIssues: analysis.criticalIssues.length,
      warnings: analysis.warnings.length,
      improvements: analysis.improvements.length,
      compliantItems: analysis.compliantItems.length,
      categories: analysis.categories,
      recommendations: analysis.recommendations
    };
  }, [analysis, allResults, siteName]);

  // Loading state
  if (!allResults || Object.keys(allResults).length === 0) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Analyse de conformité en cours...</LoadingText>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  // Error state
  if (!analysis) {
    return (
      <DashboardContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Erreur d'analyse</ErrorTitle>
          <ErrorMessage>
            Une erreur s'est produite lors de l'analyse de conformité. 
            Veuillez réessayer ou contacter le support technique.
          </ErrorMessage>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Compliance Resume */}
      {resumeData && <ComplianceResume data={resumeData} allResults={allResults} />}

      {/* Quick Stats */}
      <StatsBar>
        <StatItem>
          <StatValue type="critical">{analysis.criticalIssues.length}</StatValue>
          <StatLabel>Problèmes Critiques</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="warning">{analysis.warnings.length}</StatValue>
          <StatLabel>Avertissements</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="improvement">{analysis.improvements.length}</StatValue>
          <StatLabel>Améliorations</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="compliant">{analysis.compliantItems.length}</StatValue>
          <StatLabel>Éléments Conformes</StatLabel>
        </StatItem>
      </StatsBar>

      {/* Issues Lists - Collapsible */}
      <SectionTitle onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
        {isDetailsExpanded ? '▼' : '▶'} 📋 Détail des Contrôles ({analysis.criticalIssues.length + analysis.warnings.length + analysis.improvements.length} éléments)
      </SectionTitle>

      {isDetailsExpanded && (
        <>
          {analysis.criticalIssues.length > 0 && (
            <IssuesList
              issues={analysis.criticalIssues}
              title="Problèmes Critiques"
              totalCount={analysis.criticalIssues.length}
              type="critical"
            />
          )}

          {analysis.warnings.length > 0 && (
            <IssuesList
              issues={analysis.warnings}
              title="Avertissements"
              totalCount={analysis.warnings.length}
              type="warning"
            />
          )}

          {analysis.improvements.length > 0 && (
            <IssuesList
              issues={analysis.improvements}
              title="Améliorations Recommandées"
              totalCount={analysis.improvements.length}
              type="improvement"
            />
          )}

          {/* Show empty state if no issues */}
          {analysis.criticalIssues.length === 0 && 
           analysis.warnings.length === 0 && 
           analysis.improvements.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: colors.backgroundLighter,
              borderRadius: '16px',
              border: `1px solid ${colors.borderColor}`
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ 
                color: colors.textColor, 
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Excellente conformité !
              </h3>
              <p style={{ 
                color: colors.textColorSecondary, 
                margin: '0',
                fontSize: '16px'
              }}>
                Aucun problème de conformité détecté. Votre site respecte les standards APDP Monaco.
              </p>
            </div>
          )}
        </>
      )}
    </DashboardContainer>
  );
};

export default EnhancedComplianceDashboard;
