import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { ComplianceAnalyzer } from 'web-check-live/utils/complianceAnalyzer';

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
  font-size: 28px;
  font-weight: 700;
  color: white;
  background: ${props => {
    if (props.numericScore >= 95) return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
    if (props.numericScore >= 85) return 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)';
    if (props.numericScore >= 75) return 'linear-gradient(135deg, #eab308 0%, #fbbf24 100%)';
    if (props.numericScore >= 65) return 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)';
    if (props.numericScore >= 50) return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
    return 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
  }};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.2);
`;

const ScoreNumber = styled.div`
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  margin-top: 2px;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const SiteTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${colors.textColor};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ComplianceLevel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  margin-bottom: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ExecutiveSummary = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${colors.textColorSecondary};
  max-width: 500px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const CloudActWarning = styled.div`
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    font-size: 24px;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .description {
      font-size: 12px;
      opacity: 0.8;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ severity: string }>`
  background: white;
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.severity) {
        case 'critical': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'improvement': return '#eab308';
        case 'success': return '#22c55e';
        default: return colors.borderColor;
      }
    }};
  }
`;

const StatNumber = styled.div<{ severity: string }>`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${props => {
    switch (props.severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'improvement': return '#eab308';
      case 'success': return '#22c55e';
      default: return colors.textColor;
    }
  }};
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailSection = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const AnalysisCard = styled.div`
  background: white;
  border: 1px solid ${colors.borderColor};
  border-radius: 6px;
  padding: 16px;
`;

const AnalysisTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 8px;
`;

const AnalysisValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.primary};
  margin-bottom: 4px;
`;

const AnalysisDescription = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
`;

const IssuesList = styled.div`
  display: grid;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const IssueItem = styled.div<{ severity: string }>`
  background: white;
  border: 1px solid;
  border-color: ${props => {
    switch (props.severity) {
      case 'critical': return '#fecaca';
      case 'high': return '#fed7aa';
      case 'medium': return '#fef3c7';
      case 'low': return '#bbf7d0';
      default: return colors.borderColor;
    }
  }};
  border-left: 4px solid;
  border-left-color: ${props => {
    switch (props.severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return colors.borderColor;
    }
  }};
  border-radius: 0 6px 6px 0;
  padding: 16px;
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const IssueTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: ${colors.textColor};
`;

const IssueBadge = styled.span<{ severity: string }>`
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fefce8';
      case 'low': return '#f0fdf4';
      default: return colors.backgroundLighter;
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'critical': return '#991b1b';
      case 'high': return '#9a3412';
      case 'medium': return '#a16207';
      case 'low': return '#14532d';
      default: return colors.textColor;
    }
  }};
`;

const IssueDescription = styled.div`
  font-size: 13px;
  color: ${colors.textColorSecondary};
  line-height: 1.4;
  margin-bottom: 8px;
`;

const IssueRecommendation = styled.div`
  font-size: 12px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  padding: 8px;
  color: #1e40af;
`;

const RecommendationsList = styled.div`
  display: grid;
  gap: 16px;
`;

const RecommendationCard = styled.div<{ priority: string }>`
  background: white;
  border: 1px solid;
  border-color: ${props => {
    switch (props.priority) {
      case 'immediate': return '#fecaca';
      case 'high': return '#fed7aa';
      case 'medium': return '#fef3c7';
      case 'low': return '#e5e7eb';
      default: return colors.borderColor;
    }
  }};
  border-left: 4px solid;
  border-left-color: ${props => {
    switch (props.priority) {
      case 'immediate': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      case 'low': return '#6b7280';
      default: return colors.borderColor;
    }
  }};
  border-radius: 0 8px 8px 0;
  padding: 16px;
`;

const ActionButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #1e40af;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface EnhancedComplianceSummaryProps {
  data: any;
  allResults: Record<string, any>;
  title: string;
  actionButtons?: any;
}

const EnhancedComplianceSummaryCard = ({ 
  data, 
  allResults, 
  title, 
  actionButtons 
}: EnhancedComplianceSummaryProps): JSX.Element => {
  
  const complianceAnalysis = useMemo(() => {
    const analyzer = new ComplianceAnalyzer();
    return analyzer.analyzeCompliance(allResults, allResults.url || '');
  }, [allResults]);

  const handlePDFExport = () => {
    // Enhanced PDF export with comprehensive analysis
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generateComprehensivePDFContent(complianceAnalysis);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SummaryContainer>
        {/* Report Title */}
        <div style={{ 
          padding: '24px 24px 0 24px', 
          borderBottom: `1px solid ${colors.borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '700', 
            color: colors.textColor,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {title}
          </h2>
          {actionButtons && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {actionButtons}
            </div>
          )}
        </div>

        {/* Enhanced Header Section */}
        <HeaderSection>
          <HeaderGrid>
            <ScoreCircle score={complianceAnalysis.overallScore} numericScore={complianceAnalysis.numericScore}>
              {complianceAnalysis.overallScore}
              <ScoreNumber>{complianceAnalysis.numericScore}/100</ScoreNumber>
            </ScoreCircle>
            
            <HeaderInfo>
              <SiteTitle>{complianceAnalysis.url}</SiteTitle>
              <ComplianceLevel>{complianceAnalysis.complianceLevel}</ComplianceLevel>
              <ExecutiveSummary>{complianceAnalysis.executiveSummary}</ExecutiveSummary>
            </HeaderInfo>
            
            {complianceAnalysis.googleServicesDetected.length > 0 && (
              <CloudActWarning>
                <div className="icon">⚠️</div>
                <div className="content">
                  <div className="title">Avertissement Cloud Act</div>
                  <div className="description">
                    {complianceAnalysis.googleServicesDetected.length} service(s) Google détecté(s)
                  </div>
                </div>
              </CloudActWarning>
            )}
          </HeaderGrid>
        </HeaderSection>

        {/* Enhanced Statistics */}
        <StatsGrid>
          <StatCard 
            severity="critical" 
            onClick={() => {
              const element = document.getElementById('critical-issues-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{ 
              cursor: complianceAnalysis.criticalIssues.length > 0 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (complianceAnalysis.criticalIssues.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <StatNumber severity="critical">{complianceAnalysis.criticalIssues.length}</StatNumber>
            <StatLabel>Problèmes Critiques</StatLabel>
            {complianceAnalysis.criticalIssues.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.error, marginTop: '4px', fontWeight: '500' }}>
                ↓ Cliquez pour voir
              </div>
            )}
          </StatCard>
          
          <StatCard 
            severity="warning"
            onClick={() => {
              const element = document.getElementById('warnings-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{ 
              cursor: complianceAnalysis.warnings.length > 0 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (complianceAnalysis.warnings.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <StatNumber severity="warning">{complianceAnalysis.warnings.length}</StatNumber>
            <StatLabel>Avertissements</StatLabel>
            {complianceAnalysis.warnings.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.warning, marginTop: '4px', fontWeight: '500' }}>
                ↓ Cliquez pour voir
              </div>
            )}
          </StatCard>
          
          <StatCard 
            severity="improvement"
            onClick={() => {
              const element = document.getElementById('improvements-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{ 
              cursor: complianceAnalysis.improvements.length > 0 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (complianceAnalysis.improvements.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <StatNumber severity="improvement">{complianceAnalysis.improvements.length}</StatNumber>
            <StatLabel>Améliorations</StatLabel>
            {complianceAnalysis.improvements.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.info, marginTop: '4px', fontWeight: '500' }}>
                ↓ Cliquez pour voir
              </div>
            )}
          </StatCard>
          
          <StatCard 
            severity="success"
            onClick={() => {
              const element = document.getElementById('compliant-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{ 
              cursor: complianceAnalysis.compliantItems.length > 0 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (complianceAnalysis.compliantItems.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <StatNumber severity="success">{complianceAnalysis.compliantItems.length}</StatNumber>
            <StatLabel>Éléments Conformes</StatLabel>
            {complianceAnalysis.compliantItems.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.success, marginTop: '4px', fontWeight: '500' }}>
                ↓ Cliquez pour voir
              </div>
            )}
          </StatCard>
        </StatsGrid>

        {/* Detailed Analysis Section */}
        <DetailSection>
          <SectionTitle>📊 Analyse Détaillée</SectionTitle>
          <AnalysisGrid>
            <AnalysisCard>
              <AnalysisTitle>Cookies</AnalysisTitle>
              <AnalysisValue>
                {complianceAnalysis.detailedAnalysis.cookies.secure}/
                {complianceAnalysis.detailedAnalysis.cookies.total}
              </AnalysisValue>
              <AnalysisDescription>Cookies sécurisés</AnalysisDescription>
            </AnalysisCard>
            
            <AnalysisCard>
              <AnalysisTitle>En-têtes de sécurité</AnalysisTitle>
              <AnalysisValue>
                {complianceAnalysis.detailedAnalysis.securityHeaders.present}/
                {complianceAnalysis.detailedAnalysis.securityHeaders.total}
              </AnalysisValue>
              <AnalysisDescription>Headers présents</AnalysisDescription>
            </AnalysisCard>
            
            <AnalysisCard>
              <AnalysisTitle>Services tiers</AnalysisTitle>
              <AnalysisValue>{complianceAnalysis.detailedAnalysis.thirdPartyServices.count}</AnalysisValue>
              <AnalysisDescription>Domaines externes</AnalysisDescription>
            </AnalysisCard>
            
            <AnalysisCard>
              <AnalysisTitle>Chiffrement</AnalysisTitle>
              <AnalysisValue>{complianceAnalysis.detailedAnalysis.encryption.tlsVersion}</AnalysisValue>
              <AnalysisDescription>Version TLS</AnalysisDescription>
            </AnalysisCard>
          </AnalysisGrid>
        </DetailSection>

        {/* Cloud Act Warnings */}
        {complianceAnalysis.cloudActWarnings.length > 0 && (
          <DetailSection>
            <SectionTitle>🚨 Avertissements Cloud Act</SectionTitle>
            <IssuesList>
              {complianceAnalysis.cloudActWarnings.map((warning, index) => (
                <IssueItem key={index} severity={warning.severity}>
                  <IssueHeader>
                    <IssueTitle>{warning.title}</IssueTitle>
                    <IssueBadge severity={warning.severity}>Cloud Act</IssueBadge>
                  </IssueHeader>
                  <IssueDescription>{warning.description}</IssueDescription>
                  <IssueRecommendation>
                    <strong>Recommandation:</strong> {warning.recommendation}
                  </IssueRecommendation>
                </IssueItem>
              ))}
            </IssuesList>
          </DetailSection>
        )}

        {/* Critical Issues */}
        {complianceAnalysis.criticalIssues.length > 0 && (
          <DetailSection id="critical-issues-section">
            <SectionTitle>🔴 Problèmes Critiques</SectionTitle>
            <IssuesList>
              {complianceAnalysis.criticalIssues.slice(0, 5).map((issue, index) => (
                <IssueItem key={index} severity={issue.severity}>
                  <IssueHeader>
                    <IssueTitle>{issue.title}</IssueTitle>
                    <IssueBadge severity={issue.severity}>{issue.category}</IssueBadge>
                  </IssueHeader>
                  <IssueDescription>{issue.description}</IssueDescription>
                  <IssueRecommendation>
                    <strong>Action requise:</strong> {issue.recommendation}
                  </IssueRecommendation>
                </IssueItem>
              ))}
            </IssuesList>
          </DetailSection>
        )}

        {/* Recommendations */}
        <DetailSection>
          <SectionTitle>💡 Recommandations Prioritaires</SectionTitle>
          <RecommendationsList>
            {complianceAnalysis.recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard key={index} priority={rec.priority}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                    {rec.title}
                  </h4>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '600', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    backgroundColor: rec.priority === 'immediate' ? '#fef2f2' : '#fff7ed',
                    color: rec.priority === 'immediate' ? '#991b1b' : '#9a3412'
                  }}>
                    {rec.timeline}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: colors.textColorSecondary, margin: '0 0 8px 0' }}>
                  {rec.description}
                </p>
                <div style={{ fontSize: '11px', color: colors.textColorThirdly }}>
                  <strong>Impact:</strong> {rec.impact}
                </div>
              </RecommendationCard>
            ))}
          </RecommendationsList>
        </DetailSection>

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
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              background: colors.backgroundLighter, 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${colors.borderColor}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: colors.textColor, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🍪 Cookies & Tracking
              </div>
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                {allResults?.cookies ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Total:</strong> {allResults.cookies.cookies?.length || 0} cookies
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Sécurisés:</strong> {allResults.cookies.cookies?.filter((c: any) => c.secure).length || 0}/{allResults.cookies.cookies?.length || 0}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>HttpOnly:</strong> {allResults.cookies.cookies?.filter((c: any) => c.httpOnly).length || 0}/{allResults.cookies.cookies?.length || 0}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>SameSite:</strong> {allResults.cookies.cookies?.filter((c: any) => c.sameSite).length || 0}/{allResults.cookies.cookies?.length || 0}
                    </div>
                    {allResults.cookies.cookies?.length > 0 && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Voir les cookies ({allResults.cookies.cookies.length})
                        </summary>
                        <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
                          {allResults.cookies.cookies.slice(0, 10).map((cookie: any, i: number) => (
                            <div key={i} style={{ 
                              fontSize: '11px', 
                              padding: '4px 8px', 
                              margin: '2px 0',
                              background: colors.backgroundDarker,
                              borderRadius: '4px',
                              wordBreak: 'break-all'
                            }}>
                              <strong>{cookie.name}</strong>
                              {cookie.domain && <span style={{ color: colors.textColorThirdly }}> ({cookie.domain})</span>}
                            </div>
                          ))}
                          {allResults.cookies.cookies.length > 10 && (
                            <div style={{ fontSize: '10px', color: colors.textColorThirdly, textAlign: 'center', marginTop: '4px' }}>
                              ... et {allResults.cookies.cookies.length - 10} autres
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </>
                ) : (
                  <div style={{ color: colors.textColorThirdly }}>Aucun cookie détecté</div>
                )}
              </div>
            </div>
            
            <div style={{ 
              background: colors.backgroundLighter, 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${colors.borderColor}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: colors.textColor, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔐 En-têtes de Sécurité
              </div>
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                {allResults?.headers ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Total analysés:</strong> {Object.keys(allResults.headers).length} en-têtes
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      {['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options'].map(header => (
                        <div key={header} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{ fontSize: '12px' }}>{header}:</span>
                          <span style={{ 
                            fontSize: '11px',
                            color: allResults.headers[header] ? colors.success : colors.error,
                            fontWeight: '600'
                          }}>
                            {allResults.headers[header] ? '✓' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                        Tous les en-têtes ({Object.keys(allResults.headers).length})
                      </summary>
                      <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
                        {Object.entries(allResults.headers).slice(0, 15).map(([key, value]: [string, any]) => (
                          <div key={key} style={{ 
                            fontSize: '10px', 
                            padding: '4px 8px', 
                            margin: '2px 0',
                            background: colors.backgroundDarker,
                            borderRadius: '4px',
                            wordBreak: 'break-all'
                          }}>
                            <strong>{key}:</strong> {typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : String(value)}
                          </div>
                        ))}
                      </div>
                    </details>
                  </>
                ) : (
                  <div style={{ color: colors.textColorThirdly }}>Aucun en-tête analysé</div>
                )}
              </div>
            </div>
            
            <div style={{ 
              background: colors.backgroundLighter, 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${colors.borderColor}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: colors.textColor, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌐 Services Tiers
              </div>
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                {allResults?.['cdn-resources'] ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Domaines:</strong> {allResults['cdn-resources'].summary?.externalDomains || 0}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Google:</strong> {allResults['cdn-resources'].summary?.googleServices || 0} services
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>CDN:</strong> {allResults['cdn-resources'].summary?.cdnResources || 0} ressources
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Tracking:</strong> {allResults['cdn-resources'].summary?.trackingResources || 0} ressources
                    </div>
                    {allResults['cdn-resources'].resources?.length > 0 && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Domaines externes ({allResults['cdn-resources'].resources.length})
                        </summary>
                        <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
                          {allResults['cdn-resources'].resources.slice(0, 10).map((resource: any, i: number) => (
                            <div key={i} style={{ 
                              fontSize: '11px', 
                              padding: '4px 8px', 
                              margin: '2px 0',
                              background: colors.backgroundDarker,
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ wordBreak: 'break-all' }}>{resource.domain}</span>
                              <span style={{ 
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                background: resource.type === 'google' ? '#fef2f2' : resource.type === 'cdn' ? '#f0fdf4' : '#eff6ff',
                                color: resource.type === 'google' ? '#991b1b' : resource.type === 'cdn' ? '#166534' : '#1e40af'
                              }}>
                                {resource.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </>
                ) : (
                  <div style={{ color: colors.textColorThirdly }}>Aucun service tiers détecté</div>
                )}
              </div>
            </div>
            
            <div style={{ 
              background: colors.backgroundLighter, 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${colors.borderColor}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: colors.textColor, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔒 Chiffrement
              </div>
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                {allResults?.ssl ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>TLS:</strong> {allResults.ssl.protocol || 'Unknown'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Certificat:</strong> {allResults.ssl.valid ? '✅ Valide' : '❌ Invalide'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Émetteur:</strong> {allResults.ssl.issuer || 'Unknown'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Expiration:</strong> {allResults.ssl.validTo ? new Date(allResults.ssl.validTo).toLocaleDateString('fr-FR') : 'Unknown'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>HSTS:</strong> {allResults.hsts?.isEnabled ? '✅ Activé' : '❌ Désactivé'}
                    </div>
                    {allResults.ssl.subjectAltName && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                          Détails certificat
                        </summary>
                        <div style={{ marginTop: '8px', fontSize: '11px' }}>
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Sujet:</strong> {allResults.ssl.subject || 'N/A'}
                          </div>
                          <div style={{ marginBottom: '4px' }}>
                            <strong>SAN:</strong> {allResults.ssl.subjectAltName || 'N/A'}
                          </div>
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Valide depuis:</strong> {allResults.ssl.validFrom ? new Date(allResults.ssl.validFrom).toLocaleDateString('fr-FR') : 'N/A'}
                          </div>
                        </div>
                      </details>
                    )}
                  </>
                ) : (
                  <div style={{ color: colors.textColorThirdly }}>Informations SSL/TLS non disponibles</div>
                )}
              </div>
            </div>

            {/* Performance & Tech Stack */}
            <div style={{ 
              background: colors.backgroundLighter, 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${colors.borderColor}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                color: colors.textColor, 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚡ Performance & Technologies
              </div>
              <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
                {allResults?.quality ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Score Performance:</strong> {Math.round((allResults.quality.categories?.performance?.score || 0) * 100)}/100
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Accessibilité:</strong> {Math.round((allResults.quality.categories?.accessibility?.score || 0) * 100)}/100
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Bonnes pratiques:</strong> {Math.round((allResults.quality.categories?.['best-practices']?.score || 0) * 100)}/100
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>SEO:</strong> {Math.round((allResults.quality.categories?.seo?.score || 0) * 100)}/100
                    </div>
                  </>
                ) : (
                  <div style={{ color: colors.textColorThirdly }}>Données de performance non disponibles</div>
                )}
                
                {allResults?.['tech-stack']?.technologies?.length > 0 && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                      Technologies ({allResults['tech-stack'].technologies.length})
                    </summary>
                    <div style={{ marginTop: '8px', maxHeight: '100px', overflow: 'auto' }}>
                      {allResults['tech-stack'].technologies.slice(0, 8).map((tech: any, i: number) => (
                        <div key={i} style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px', 
                          margin: '2px 0',
                          background: colors.backgroundDarker,
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{tech.name}</span>
                          {tech.version && <span style={{ color: colors.textColorThirdly }}>v{tech.version}</span>}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>

            {/* Vulnerabilities */}
            {allResults?.vulnerabilities && (
              <div style={{ 
                background: colors.backgroundLighter, 
                padding: '20px', 
                borderRadius: '12px', 
                border: `1px solid ${colors.borderColor}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: colors.textColor, 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🛡️ Vulnérabilités
                </div>
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
                  
                  {allResults.vulnerabilities.vulnerabilities?.length > 0 && (
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                        Vulnérabilités détectées ({allResults.vulnerabilities.vulnerabilities.length})
                      </summary>
                      <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
                        {allResults.vulnerabilities.vulnerabilities.slice(0, 5).map((vuln: any, i: number) => (
                          <div key={i} style={{ 
                            fontSize: '11px', 
                            padding: '6px 8px', 
                            margin: '2px 0',
                            background: colors.backgroundDarker,
                            borderRadius: '4px',
                            borderLeft: `3px solid ${vuln.severity === 'critical' ? colors.error : vuln.severity === 'high' ? colors.warning : colors.info}`
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{vuln.title}</div>
                            <div style={{ fontSize: '10px', color: colors.textColorThirdly }}>
                              {vuln.severity.toUpperCase()} - {vuln.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Legal Pages */}
            {allResults?.['legal-pages'] && (
              <div style={{ 
                background: colors.backgroundLighter, 
                padding: '20px', 
                borderRadius: '12px', 
                border: `1px solid ${colors.borderColor}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: colors.textColor, 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📋 Pages Légales
                </div>
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
                  
                  {allResults['legal-pages'].legalPages?.length > 0 && (
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                        Pages détectées ({allResults['legal-pages'].legalPages.length})
                      </summary>
                      <div style={{ marginTop: '8px', maxHeight: '100px', overflow: 'auto' }}>
                        {allResults['legal-pages'].legalPages.map((page: any, i: number) => (
                          <div key={i} style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px', 
                            margin: '2px 0',
                            background: colors.backgroundDarker,
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{page.name}</span>
                            <span style={{ 
                              fontSize: '9px',
                              color: page.accessible ? colors.success : colors.error,
                              fontWeight: '600'
                            }}>
                              {page.accessible ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compliance Frameworks */}
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: colors.textColor, 
            marginBottom: '12px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            📋 Conformité Réglementaire
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              background: complianceAnalysis.complianceFrameworks.gdpr.compliant ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${complianceAnalysis.complianceFrameworks.gdpr.compliant ? '#16a34a' : '#dc2626'}`,
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                🇪🇺 RGPD/GDPR
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Score: {complianceAnalysis.complianceFrameworks.gdpr.score}/100<br/>
                Issues: {complianceAnalysis.complianceFrameworks.gdpr.issues}
              </div>
            </div>
            
            <div style={{ 
              background: complianceAnalysis.complianceFrameworks.cloudAct.risk === 'low' ? '#f0fdf4' : 
                         complianceAnalysis.complianceFrameworks.cloudAct.risk === 'medium' ? '#fffbeb' : '#fef2f2',
              border: `1px solid ${complianceAnalysis.complianceFrameworks.cloudAct.risk === 'low' ? '#16a34a' : 
                                  complianceAnalysis.complianceFrameworks.cloudAct.risk === 'medium' ? '#d97706' : '#dc2626'}`,
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                🇺🇸 Cloud Act
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Risque: {complianceAnalysis.complianceFrameworks.cloudAct.risk}<br/>
                Services: {complianceAnalysis.complianceFrameworks.cloudAct.services.length}
              </div>
            </div>
            
            <div style={{ 
              background: complianceAnalysis.complianceFrameworks.apdp.compliant ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${complianceAnalysis.complianceFrameworks.apdp.compliant ? '#16a34a' : '#dc2626'}`,
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                🇲🇨 APDP Monaco
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Score: {complianceAnalysis.complianceFrameworks.apdp.score}/100<br/>
                Exigences: {complianceAnalysis.complianceFrameworks.apdp.requirements}
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center', 
          paddingTop: '20px', 
          borderTop: `1px solid ${colors.borderColor}` 
        }}>
          <ActionButton onClick={handlePDFExport}>
            📄 Rapport PDF Complet
          </ActionButton>
          <ActionButton 
            style={{ background: '#059669' }}
            onClick={() => window.open('https://openpro.ai/apdp-compliance-guide', '_blank')}
          >
            📚 Guide de Conformité
          </ActionButton>
        </div>
      </SummaryContainer>
  );
};

// Helper function to generate comprehensive PDF content
const generateComprehensivePDFContent = (analysis: any): string => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Rapport de Conformité APDP - ${analysis.url}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; font-size: 12px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score-circle { display: inline-block; width: 60px; height: 60px; border-radius: 50%; background: #059669; color: white; text-align: center; line-height: 60px; font-weight: bold; font-size: 18px; }
        .section { margin-bottom: 20px; page-break-inside: avoid; }
        .issue { border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 8px; background: #fef2f2; }
        .warning { border-left-color: #f59e0b; background: #fff7ed; }
        .improvement { border-left-color: #eab308; background: #fefce8; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
        .stat { text-align: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 4px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport de Conformité APDP Monaco</h1>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="score-circle">${analysis.overallScore}</div>
          <div>
            <h2 style="margin: 0;">${analysis.url}</h2>
            <p style="margin: 4px 0;">${analysis.complianceLevel}</p>
            <p style="margin: 0; font-size: 11px; opacity: 0.8;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Résumé Exécutif</h2>
        <p>${analysis.executiveSummary}</p>
        
        <div class="grid">
          <div class="stat">
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${analysis.criticalIssues.length}</div>
            <div>Critiques</div>
          </div>
          <div class="stat">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${analysis.warnings.length}</div>
            <div>Avertissements</div>
          </div>
          <div class="stat">
            <div style="font-size: 24px; font-weight: bold; color: #eab308;">${analysis.improvements.length}</div>
            <div>Améliorations</div>
          </div>
          <div class="stat">
            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${analysis.compliantItems.length}</div>
            <div>Conformes</div>
          </div>
        </div>
      </div>

      ${analysis.cloudActWarnings.length > 0 ? `
        <div class="section">
          <h2>🚨 Avertissements Cloud Act</h2>
          ${analysis.cloudActWarnings.map((warning: any) => `
            <div class="issue">
              <h3>${warning.title}</h3>
              <p>${warning.description}</p>
              <p><strong>Recommandation:</strong> ${warning.recommendation}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${analysis.criticalIssues.length > 0 ? `
        <div class="section">
          <h2>🔴 Problèmes Critiques</h2>
          ${analysis.criticalIssues.map((issue: any) => `
            <div class="issue">
              <h3>${issue.title}</h3>
              <p>${issue.description}</p>
              <p><strong>Recommandation:</strong> ${issue.recommendation}</p>
              ${issue.article ? `<p><em>${issue.article}</em></p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section">
        <h2>📋 Plan d'Action Prioritaire</h2>
        ${analysis.recommendations.map((rec: any, index: number) => `
          <div class="issue ${rec.priority === 'immediate' ? '' : rec.priority === 'high' ? 'warning' : 'improvement'}">
            <h3>${index + 1}. ${rec.title}</h3>
            <p>${rec.description}</p>
            <p><strong>Échéance:</strong> ${rec.timeline}</p>
            <p><strong>Impact:</strong> ${rec.impact}</p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>📊 Analyse Technique Détaillée</h2>
        <div class="grid">
          <div class="stat">
            <div style="font-weight: bold;">Cookies</div>
            <div>${analysis.detailedAnalysis.cookies.secure}/${analysis.detailedAnalysis.cookies.total} sécurisés</div>
          </div>
          <div class="stat">
            <div style="font-weight: bold;">En-têtes</div>
            <div>${analysis.detailedAnalysis.securityHeaders.present}/${analysis.detailedAnalysis.securityHeaders.total} présents</div>
          </div>
          <div class="stat">
            <div style="font-weight: bold;">Services tiers</div>
            <div>${analysis.detailedAnalysis.thirdPartyServices.count} domaines</div>
          </div>
          <div class="stat">
            <div style="font-weight: bold;">Chiffrement</div>
            <div>${analysis.detailedAnalysis.encryption.tlsVersion}</div>
          </div>
        </div>
      </div>

      <div class="section" style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
        <p style="text-align: center; color: #6b7280; font-size: 10px;">
          <strong>APDP Monaco - Autorité de Protection des Données Personnelles</strong><br>
          Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
          Document confidentiel - Usage interne exclusivement
        </p>
      </div>
    </body>
    </html>
  `;
};

export default EnhancedComplianceSummaryCard;
