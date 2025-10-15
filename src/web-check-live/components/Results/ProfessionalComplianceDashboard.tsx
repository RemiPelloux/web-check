import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { EnhancedComplianceAnalyzer } from 'web-check-live/utils/enhancedComplianceAnalyzer';
import { generateComplianceReportHTML } from 'web-check-live/utils/htmlPdfGenerator';

interface ProfessionalComplianceDashboardProps {
  allResults: any;
  siteName: string;
}

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
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
  color: #111827;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: #6b7280;
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

const ScoreCircle = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ score }) => 
    score >= 90 ? '#10b981' :
    score >= 80 ? '#22c55e' :
    score >= 70 ? '#f59e0b' :
    score >= 60 ? '#f97316' :
    '#dc2626'
  };
  color: white;
  font-size: 18px;
  font-weight: 700;
`;

const ScoreLabel = styled.div`
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #b91c1c;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin: 24px;
`;

const StatCard = styled.div<{ color: string }>`
  background: white;
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
  color: #6b7280;
  font-weight: 500;
`;

const ContentSection = styled.div`
  background: white;
  margin: 0 24px 24px 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: #f9fafb;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #111827;
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
  color: #111827;
  margin-bottom: 4px;
`;

const ProblemDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background: ${({ severity }) => 
    severity === 'critical' ? '#fecaca' :
    severity === 'warning' ? '#fed7aa' :
    severity === 'improvement' ? '#fef3c7' :
    '#dcfce7'
  };
  color: ${({ severity }) => 
    severity === 'critical' ? '#dc2626' :
    severity === 'warning' ? '#f59e0b' :
    severity === 'improvement' ? '#eab308' :
    '#10b981'
  };
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
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
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: between;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
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
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
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
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

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

  const handleExportPDF = async () => {
    if (!analysis || !allResults) {
      alert('Aucune donnée d\'analyse disponible pour l\'export PDF.');
      return;
    }

    try {
      console.log('Starting PDF export with data:', { 
        analysis: !!analysis, 
        allResults: !!allResults, 
        siteName,
        score: analysis.score 
      });

      // Show loading feedback
      const button = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Génération en cours...';
      }

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
        allResults['cdn-resources']
      );

      // Success feedback
      if (button) {
        button.textContent = '✓ PDF Généré';
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = '<span style="font-size: 16px">⬇️</span> Exporter PDF';
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
      
      // Error feedback
      const button = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
      if (button) {
        button.textContent = 'Erreur - Réessayer';
        button.disabled = false;
      }
      
      alert('Erreur lors de la génération du PDF. Vérifiez que votre navigateur autorise les téléchargements et réessayez.');
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
              <span style={{ fontSize: '24px', color: '#dc2626' }}>📄</span>
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
            <div>
              <ScoreCircle score={analysis.score}>
                {analysis.score}
              </ScoreCircle>
              <ScoreLabel>Score Global</ScoreLabel>
            </div>
            <ExportButton onClick={handleExportPDF} data-export-pdf>
              <span style={{ fontSize: '16px' }}>⬇️</span>
              Exporter PDF
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
              <TableHeaderCell style={{ width: '100px' }}>Sévérité</TableHeaderCell>
              <TableHeaderCell>Recommandation</TableHeaderCell>
              <TableHeaderCell style={{ width: '60px' }}>Action</TableHeaderCell>
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
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                    {issue.recommendation}
                  </div>
                </TableCell>
                <TableCell style={{ textAlign: 'center' }}>
                  <ActionButton onClick={() => setSelectedIssue(issue)}>
                    <span style={{ fontSize: '16px' }}>👁️</span>
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </ContentSection>

      {/* Modal */}
      {selectedIssue && (
        <Modal onClick={(e) => e.target === e.currentTarget && setSelectedIssue(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{selectedIssue.title}</ModalTitle>
              <CloseButton onClick={() => setSelectedIssue(null)}>
                <span style={{ fontSize: '20px' }}>✕</span>
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '16px' }}>
                <SeverityBadge severity={selectedIssue.severity}>
                  {getSeverityText(selectedIssue.severity)}
                </SeverityBadge>
                {' '}
                <CategoryBadge>{selectedIssue.category}</CategoryBadge>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                  Description
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.5' }}>
                  {selectedIssue.description}
                </p>
              </div>
              
              <RecommendationBox>
                <RecommendationTitle>
                  💡 Recommandation
                </RecommendationTitle>
                <RecommendationText>
                  {selectedIssue.recommendation}
                </RecommendationText>
              </RecommendationBox>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default ProfessionalComplianceDashboard;
