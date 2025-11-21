import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { generateComplianceReport } from 'web-check-live/utils/pdfGenerator';

interface ComplianceData {
  score: number;
  level: string;
  siteName: string;
  scanDate: string;
  totalChecks: number;
  criticalIssues: number;
  warnings: number;
  improvements: number;
  compliantItems: number;
  categories: {
    [key: string]: {
      score: number;
      issues: number;
      status: 'good' | 'warning' | 'critical';
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    timeline: string;
  }>;
}

interface ComplianceResumeProps {
  data: ComplianceData;
  allResults?: any;
}

const ResumeContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ResumeHeader = styled.div`
  background: #f8fafc;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 32px;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 24px;
  }
`;

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 80px;
  height: 80px;
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
  font-size: 24px;
  font-weight: 700;
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  margin-top: 4px;
`;

const LevelBadge = styled.div<{ level: string }>`
  background: ${({ level }) => 
    level === 'Excellent' ? '#10b981' :
    level === 'Bon' ? '#22c55e' :
    level === 'Moyen' ? '#f59e0b' :
    level === 'Faible' ? '#f97316' :
    '#dc2626'
  };
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SiteInfo = styled.div`
  flex: 1;
`;

const SiteTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #111827;
`;

const SiteSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
`;

const QuickStats = styled.div`
  display: flex;
  gap: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: #3b82f6;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2563eb;
  }
`;

const ResumeBody = styled.div`
  padding: 24px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div<{ status: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 8px 0;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const SummarySubtext = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
`;

const CategoryBreakdown = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const CategoryItem = styled.div<{ status: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ status }) => 
      status === 'critical' ? '#dc2626' :
      status === 'warning' ? '#f59e0b' :
      '#10b981'
    };
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
`;

const CategoryScore = styled.div<{ status: string }>`
  font-weight: 700;
  font-size: 18px;
  color: ${({ status }) => 
    status === 'critical' ? '#dc2626' :
    status === 'warning' ? '#f59e0b' :
    '#10b981'
  };
`;

const CategoryStatus = styled.div<{ status: string }>`
  font-size: 12px;
  color: ${({ status }) => 
    status === 'critical' ? '#dc2626' :
    status === 'warning' ? '#f59e0b' :
    '#10b981'
  };
  font-weight: 500;
  margin-top: 4px;
`;

const RecommendationsSection = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 12px;
  padding: 24px;
`;

const RecommendationsList = styled.div`
  display: grid;
  gap: 12px;
`;

const RecommendationItem = styled.div<{ priority: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${colors.background};
  border-radius: 8px;
  border-left: 4px solid ${({ priority }) => 
    priority === 'high' ? '#dc2626' :
    priority === 'medium' ? '#f59e0b' :
    '#10b981'
  };
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background: ${({ priority }) => 
    priority === 'high' ? 'rgba(220, 38, 38, 0.1)' :
    priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(16, 185, 129, 0.1)'
  };
  color: ${({ priority }) => 
    priority === 'high' ? '#dc2626' :
    priority === 'medium' ? '#f59e0b' :
    '#10b981'
  };
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RecommendationText = styled.div`
  flex: 1;
`;

const RecommendationAction = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const RecommendationMeta = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
`;

const ComplianceResume: React.FC<ComplianceResumeProps> = ({ data, allResults }) => {
  const handleExportPDF = async () => {
    try {
      if (allResults) {
        await generateComplianceReport(data, allResults.vulnerabilities, allResults['legal-pages'], allResults['cdn-resources']);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
    }
  };
  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Bon';
    if (score >= 70) return 'Moyen';
    if (score >= 60) return 'Faible';
    return 'Critique';
  };

  const handlePDFExport = () => {
    // PDF export functionality
    console.log('Exporting PDF...');
  };

  const handleDetailedReport = () => {
    // Navigate to detailed report
    console.log('Opening detailed report...');
  };

  return (
    <ResumeContainer>
      <ResumeHeader>
        <HeaderGrid>
          <ScoreSection>
            <ScoreCircle score={data.score}>
              {data.score}
              <ScoreLabel>/100</ScoreLabel>
            </ScoreCircle>
            <LevelBadge level={getScoreLevel(data.score)}>
              {getScoreLevel(data.score)}
            </LevelBadge>
          </ScoreSection>

          <SiteInfo>
            <SiteTitle>{data.siteName}</SiteTitle>
            <SiteSubtitle>Rapport de Conformité Loi 1.565 Monaco</SiteSubtitle>
            <QuickStats>
              <StatItem>
                <StatValue>{data.totalChecks}</StatValue>
                <StatLabel>Contrôles effectués</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{new Date(data.scanDate).toLocaleDateString('fr-FR')}</StatValue>
                <StatLabel>Date d'analyse</StatLabel>
              </StatItem>
            </QuickStats>
          </SiteInfo>

          <ActionButtons>
            <ActionButton onClick={handleExportPDF}>
              📄 Rapport PDF
            </ActionButton>
          </ActionButtons>
        </HeaderGrid>
      </ResumeHeader>

      <ResumeBody>
        <SummaryGrid>
          <SummaryCard status="critical">
            <SummaryTitle>🚨 Problèmes Critiques</SummaryTitle>
            <SummaryValue>{data.criticalIssues}</SummaryValue>
            <SummarySubtext>
              Nécessitent une action immédiate pour assurer la conformité APDP
            </SummarySubtext>
          </SummaryCard>

          <SummaryCard status="warning">
            <SummaryTitle>⚠️ Avertissements</SummaryTitle>
            <SummaryValue>{data.warnings}</SummaryValue>
            <SummarySubtext>
              Points d'attention à traiter dans les prochaines semaines
            </SummarySubtext>
          </SummaryCard>

          <SummaryCard status="good">
            <SummaryTitle>💡 Améliorations</SummaryTitle>
            <SummaryValue>{data.improvements}</SummaryValue>
            <SummarySubtext>
              Recommandations pour optimiser la conformité
            </SummarySubtext>
          </SummaryCard>

          <SummaryCard status="good">
            <SummaryTitle>✅ Éléments Conformes</SummaryTitle>
            <SummaryValue>{data.compliantItems}</SummaryValue>
            <SummarySubtext>
              Aspects déjà en conformité avec les exigences APDP
            </SummarySubtext>
          </SummaryCard>
        </SummaryGrid>

        <CategoryBreakdown>
          <CategoryTitle>🔍 Analyse par Catégorie</CategoryTitle>
          <CategoryGrid>
            {Object.entries(data.categories).map(([category, info]) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'critical': return '🚨';
                  case 'warning': return '⚠️';
                  default: return '✅';
                }
              };

              const getCategorySubtitle = (category: string) => {
                switch (category) {
                  case 'SSL/TLS': return 'Chiffrement';
                  case 'Cookies': return 'Données Utilisateur';
                  case 'Headers HTTP': return 'Sécurité Web';
                  case 'Performance': return 'Vitesse & UX';
                  case 'Pages Légales': return 'Conformité';
                  case 'Services Tiers': return 'Intégrations';
                  case 'DNS': return 'Infrastructure';
                  default: return 'Analyse';
                }
              };

              return (
                <CategoryItem key={category} status={info.status}>
                  <CategoryHeader>
                    <CategoryName>{category}</CategoryName>
                    <CategoryScore status={info.status}>
                      {info.score}/100
                    </CategoryScore>
                  </CategoryHeader>
                  <CategoryStatus status={info.status}>
                    {info.issues === 0 ? (info.score >= 90 ? 'Conforme' : 'À vérifier') : 
                     info.issues === 1 ? '1 problème' : 
                     `${info.issues} problèmes`}
                  </CategoryStatus>
                </CategoryItem>
              );
            })}
          </CategoryGrid>
        </CategoryBreakdown>

        <RecommendationsSection>
          <CategoryTitle>🎯 Recommandations Prioritaires</CategoryTitle>
          <RecommendationsList>
            {data.recommendations.slice(0, 5).map((rec, index) => (
              <RecommendationItem key={index} priority={rec.priority}>
                <PriorityBadge priority={rec.priority}>{rec.priority}</PriorityBadge>
                <RecommendationText>
                  <RecommendationAction>{rec.action}</RecommendationAction>
                  <RecommendationMeta>
                    {rec.category} • {rec.timeline}
                  </RecommendationMeta>
                </RecommendationText>
              </RecommendationItem>
            ))}
          </RecommendationsList>
        </RecommendationsSection>
      </ResumeBody>
    </ResumeContainer>
  );
};

export default ComplianceResume;
