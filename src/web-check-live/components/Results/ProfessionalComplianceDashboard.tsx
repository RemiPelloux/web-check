import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { EnhancedComplianceAnalyzer } from 'web-check-live/utils/enhancedComplianceAnalyzer';
import { openComplianceReportHTML, generateComplianceReportHTML } from 'web-check-live/utils/htmlPdfGenerator';
import SiteFavicon from 'web-check-live/components/misc/SiteFavicon';

interface ProfessionalComplianceDashboardProps {
  allResults: any;
  siteName: string;
}

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: ${colors.backgroundLighter};
  min-height: 100vh;
`;

const Header = styled.div`
  background: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  padding: 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 24px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  margin: 0;
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: ${colors.textColorSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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
`;

const StatCard = styled.div<{ color: string }>`
  background: ${colors.background};
  padding: 24px;
  text-align: center;
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
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  font-weight: 500;
`;

const ContentSection = styled.div`
  background: ${colors.background};
  margin: 0 24px 24px 24px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: ${colors.backgroundLighter};
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${colors.textColor};
  vertical-align: top;
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
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: between;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0;
  flex: 1;
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
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

  const handleViewReport = () => {
    if (!analysis || !allResults) {
      alert('Aucune donnée d\'analyse disponible pour l\'affichage du rapport.');
      return;
    }

    try {
      console.log('Opening modern compliance report with data:', { 
        analysis: !!analysis, 
        allResults: !!allResults, 
        siteName,
        score: analysis.score 
      });

      openComplianceReportHTML(
        {
          url: siteName || 'Site Web',
          overallScore: getScoreGrade(analysis.score),
          complianceLevel: analysis.level,
          numericScore: analysis.score,
          criticalIssues: analysis.criticalIssues.length,
          warnings: analysis.warnings.length,
          improvements: analysis.improvements.length,
          compliantItems: analysis.compliantItems.length,
          timestamp: new Date().toISOString(),
          issues: {
            critical: analysis.criticalIssues || [],
            warnings: analysis.warnings || [],
            improvements: analysis.improvements || [],
            compliant: analysis.compliantItems || []
          },
          categories: analysis.categories || {}
        },
        allResults.vulnerabilities,
        undefined,
        allResults['cdn-resources'],
        allResults
      );
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du rapport:', error);
      alert('Erreur lors de l\'ouverture du rapport. Vérifiez que votre navigateur autorise les popups pour ce site et réessayez.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis || !allResults) {
      alert('Aucune donnée d\'analyse disponible pour générer le PDF.');
      return;
    }

    try {
      console.log('Generating PDF report with data:', { 
        analysis: !!analysis, 
        allResults: !!allResults, 
        siteName,
        score: analysis.score 
      });

      // Utiliser la fonction déjà importée

      await generateComplianceReportHTML(
        {
          url: siteName || 'Site Web',
          overallScore: getScoreGrade(analysis.score),
          complianceLevel: analysis.level,
          numericScore: analysis.score,
          criticalIssues: analysis.criticalIssues.length,
          warnings: analysis.warnings.length,
          improvements: analysis.improvements.length,
          compliantItems: analysis.compliantItems.length,
          timestamp: new Date().toISOString(),
          detailedAnalysis: {
            cookieCompliance: {
              status: allResults.cookies ? 'Analysé' : 'Non analysé',
              cookieCount: allResults.cookies?.clientCookies?.length || allResults.cookies?.cookies?.length || 0
            },
            sslSecurity: {
              isValid: allResults.ssl?.valid || allResults.ssl?.validCertificate || false,
              protocol: allResults.ssl?.protocol || 'TLS'
            }
          },
          issues: {
            critical: analysis.criticalIssues || [],
            warnings: analysis.warnings || [],
            improvements: analysis.improvements || [],
            compliant: analysis.compliantItems || []
          },
          categories: analysis.categories || {}
        },
        allResults.vulnerabilities,
        undefined, // legal-pages removed
        allResults['cdn-resources'],
        allResults // Pass all results for comprehensive report
      );
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    if (score >= 50) return 'E';
    return 'F';
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
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Erreur d'analyse</h2>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Une erreur s'est produite lors de l'analyse de conformité.
          </p>
        </div>
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
                <Title>Rapport d'Audit de Conformité</Title>
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
            <ExportButton onClick={handleViewReport}>
              <span style={{ fontSize: '18px' }}>📄</span>
              Voir le Rapport
            </ExportButton>
          </HeaderRight>
        </HeaderContent>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard color="red">
          <StatNumber color="red">{analysis.criticalIssues.length}</StatNumber>
          <StatLabel>Problèmes Critiques</StatLabel>
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
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell style={{ width: '40px' }}></TableHeaderCell>
              <TableHeaderCell>Problème</TableHeaderCell>
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
      </ContentSection>
    </DashboardContainer>
  );
};

export default ProfessionalComplianceDashboard;
