import React, { useState, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { EnhancedComplianceAnalyzer } from 'web-check-live/utils/enhancedComplianceAnalyzer';
import { openFullResultsReport } from 'web-check-live/utils/fullResultsPdfGenerator';
import SiteFavicon from 'web-check-live/components/misc/SiteFavicon';

interface ProfessionalComplianceDashboardProps {
  allResults: any;
  siteName: string;
}

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: ${colors.backgroundLighter};
  min-height: 80vh;
  
  @media (max-width: 1440px) {
    max-width: 100%;
  }
`;

const Header = styled.div`
  background: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 599px) {
    padding: 12px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  @media (max-width: 599px) {
    gap: 8px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 599px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  margin: 0;
  
  @media (max-width: 599px) {
    font-size: 12px;
  }
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: ${colors.textColorSecondary};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 599px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 599px) {
    word-break: break-all;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25), 
              0 2px 4px rgba(220, 38, 38, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 24px;
  }
  
  @media (max-width: 599px) {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  /* Shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(220, 38, 38, 0.35), 
                0 4px 6px rgba(220, 38, 38, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3),
                inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Pulse animation when generating */
  &:disabled:not([data-success]) {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  /* Icon styling */
  span {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: ${colors.border};
  border-radius: 8px;
  overflow: hidden;
  margin: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    margin: 16px;
  }
  
  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    margin: 12px;
    border-radius: 8px;
  }
`;

const StatCard = styled.div<{ color: string }>`
  background: ${colors.background};
  padding: 24px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
  
  @media (max-width: 599px) {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
`;

const StatNumber = styled.div<{ color: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${({ color }) => 
    color === 'red' ? '#dc2626' :
    color === 'orange' ? '#f59e0b' :
    color === 'yellow' ? '#eab308' :
    '#10b981'
  };
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
  
  @media (max-width: 599px) {
    font-size: 24px;
    margin-bottom: 0;
    order: 2;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  font-weight: 500;
  
  @media (max-width: 599px) {
    font-size: 13px;
    order: 1;
  }
`;

const ContentSection = styled.div`
  background: ${colors.background};
  border-radius: 8px;
  border: 1px solid ${colors.border};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: ${colors.backgroundLighter};
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.border};
  
  @media (max-width: 599px) {
    padding: 12px 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0;
  
  @media (max-width: 599px) {
    font-size: 14px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  
  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

const TableHeader = styled.thead`
  background: ${colors.backgroundLighter};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${colors.border};
  
  &:hover {
    background: ${colors.backgroundLighter};
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 11px;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${colors.textColor};
  vertical-align: top;
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 13px;
  }
`;

const SeverityIcon = styled.div<{ severity: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ severity }) => 
    severity === 'critical' ? '#dc2626' :
    severity === 'warning' ? '#f59e0b' :
    severity === 'improvement' ? '#eab308' :
    '#10b981'
  };
  color: white;
  font-size: 10px;
  font-weight: 700;
`;

const ProblemTitle = styled.div`
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const ProblemDescription = styled.div`
  font-size: 13px;
  color: ${colors.textColorSecondary};
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background: ${({ severity }) => 
    severity === 'critical' ? '#dc2626' :
    severity === 'warning' ? '#f59e0b' :
    severity === 'improvement' ? '#eab308' :
    '#10b981'
  };
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textColorSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.textColor};
    background: ${colors.backgroundLighter};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  
  @media (max-width: 599px) {
    padding: 16px;
  }
`;

const ModalContent = styled.div`
  background: ${colors.background};
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 599px) {
    max-height: 90vh;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 599px) {
    padding: 16px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0;
  flex: 1;
  
  @media (max-width: 599px) {
    font-size: 16px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  
  @media (max-width: 599px) {
    padding: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textColorSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.textColor};
    background: ${colors.backgroundLighter};
  }
`;

const RecommendationBox = styled.div`
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
`;

const RecommendationTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RecommendationText = styled.p`
  font-size: 14px;
  color: #1e40af;
  margin: 0;
  line-height: 1.5;
`;

const ErrorState = styled.div`
  padding: 60px 24px;
  text-align: center;
  
  @media (max-width: 599px) {
    padding: 40px 16px;
  }
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
    
    @media (max-width: 599px) {
      font-size: 40px;
      margin-bottom: 12px;
    }
  }
  
  h2 {
    color: #dc2626;
    margin: 0 0 8px 0;
    font-size: 20px;
    
    @media (max-width: 599px) {
      font-size: 18px;
    }
  }
  
  p {
    color: #6b7280;
    margin: 0;
    font-size: 14px;
    
    @media (max-width: 599px) {
      font-size: 13px;
    }
  }
`;

const ProfessionalComplianceDashboard: React.FC<ProfessionalComplianceDashboardProps> = ({ 
  allResults, 
  siteName 
}) => {
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

  // Save full results as printable HTML report (all plugins)
  const handleSaveResults = useCallback(() => {
    if (!allResults) {
      alert('Aucune donnée d\'analyse disponible.');
      return;
    }

    try {
      openFullResultsReport(allResults, siteName || 'Site Web');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport. Vérifiez que votre navigateur autorise les popups.');
    }
  }, [allResults, siteName]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '!';
      case 'warning': return '⚠';
      case 'improvement': return 'i';
      default: return '✓';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'warning': return 'Attention';
      case 'improvement': return 'Amélioration';
      default: return 'Conforme';
    }
  };

  if (!analysis) {
    return (
      <DashboardContainer>
        <ErrorState>
          <div className="error-icon">⚠️</div>
          <h2>Erreur d'analyse</h2>
          <p>Une erreur s'est produite lors de l'analyse de conformité.</p>
        </ErrorState>
      </DashboardContainer>
    );
  }

  const allIssues = [
    ...analysis.criticalIssues.map(issue => ({ ...issue, severity: 'critical' })),
    ...analysis.warnings.map(issue => ({ ...issue, severity: 'warning' })),
    ...analysis.improvements.map(issue => ({ ...issue, severity: 'improvement' })),
    ...analysis.compliantItems.map(issue => ({ ...issue, severity: 'compliant' }))
  ];

  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <HeaderTitle>
              <SiteFavicon domain={siteName} size={32} />
              <div>
                <Title>Rapport d'Analyse de Sécurité</Title>
                <Subtitle>Analyse automatisée APDP Monaco</Subtitle>
              </div>
            </HeaderTitle>
            <HeaderMeta>
              <MetaItem>
                <span style={{ fontSize: '14px' }}>🔗</span>
                <strong>Site analysé:</strong> {siteName}
              </MetaItem>
              <MetaItem>
                <span style={{ fontSize: '14px' }}>📅</span>
                <span>Généré le {formatDate(new Date().toISOString())}</span>
              </MetaItem>
            </HeaderMeta>
          </HeaderLeft>
          <HeaderRight>
            <ExportButton onClick={handleSaveResults}>
              <span style={{ fontSize: '18px' }}>💾</span>
              Télécharger le résultat d’analyse
            </ExportButton>
          </HeaderRight>
        </HeaderContent>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard color="red">
          <StatNumber color="red">{analysis.criticalIssues.length}</StatNumber>
          <StatLabel>Analyses Critiques</StatLabel>
        </StatCard>
        <StatCard color="orange">
          <StatNumber color="orange">{analysis.warnings.length}</StatNumber>
          <StatLabel>Avertissements</StatLabel>
        </StatCard>
        <StatCard color="yellow">
          <StatNumber color="yellow">{analysis.improvements.length}</StatNumber>
          <StatLabel>Améliorations Recommandées</StatLabel>
        </StatCard>
        <StatCard color="green">
          <StatNumber color="green">{analysis.compliantItems.length}</StatNumber>
          <StatLabel>Éléments Conformes</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Issues Table */}
      <ContentSection>
        <SectionHeader>
          <SectionTitle>
            Détail des Contrôles ({allIssues.length} éléments)
          </SectionTitle>
        </SectionHeader>
        
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '40px' }}></TableHeaderCell>
                <TableHeaderCell>Analyse</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px' }}>Catégorie</TableHeaderCell>
                <TableHeaderCell style={{ width: '140px' }}>Criticité</TableHeaderCell>
                <TableHeaderCell>Recommandation</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {allIssues.map((issue, index) => (
                <TableRow key={issue.id || index}>
                  <TableCell style={{ textAlign: 'center' }}>
                    <SeverityIcon severity={issue.severity}>
                      {getSeverityIcon(issue.severity)}
                    </SeverityIcon>
                  </TableCell>
                  <TableCell>
                    <ProblemTitle>{issue.title}</ProblemTitle>
                    <ProblemDescription>{issue.description}</ProblemDescription>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge>{issue.category}</CategoryBadge>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={issue.severity}>
                      {getSeverityText(issue.severity)}
                    </SeverityBadge>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.4' }}>
                      {issue.recommendation}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </ContentSection>
    </DashboardContainer>
  );
};

export default ProfessionalComplianceDashboard;
