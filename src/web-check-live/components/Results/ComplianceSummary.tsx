import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ScoreSection = styled.div`
  text-align: center;
  padding: 16px;
  background: ${colors.backgroundDarker};
  border-radius: 8px;
  border: 1px solid ${colors.borderColor};
`;

const ScoreCircle = styled.div<{ score: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 32px;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch (props.score) {
      case 'A': return colors.success;
      case 'B': return '#10b981'; // emerald-500
      case 'C': return colors.warning;
      case 'D': return '#f97316'; // orange-500
      case 'E': return '#ef4444'; // red-500
      case 'F': return colors.error;
      default: return colors.neutral;
    }
  }};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const ScoreDescription = styled.div<{ score: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    switch (props.score) {
      case 'A': return colors.success;
      case 'B': return '#10b981';
      case 'C': return colors.warning;
      case 'D': return '#f97316';
      case 'E': return '#ef4444';
      case 'F': return colors.error;
      default: return colors.neutral;
    }
  }};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ severity: string }>`
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#fef2f2'; // red-50
      case 'warning': return '#fff7ed'; // orange-50
      case 'improvement': return '#fefce8'; // yellow-50
      case 'success': return '#f0fdf4'; // green-50
      default: return colors.backgroundLighter;
    }
  }};
  border-color: ${props => {
    switch (props.severity) {
      case 'critical': return '#fecaca'; // red-200
      case 'warning': return '#fed7aa'; // orange-200
      case 'improvement': return '#fef3c7'; // yellow-200
      case 'success': return '#bbf7d0'; // green-200
      default: return colors.borderColor;
    }
  }};
`;

const StatNumber = styled.div<{ severity: string }>`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${props => {
    switch (props.severity) {
      case 'critical': return colors.error;
      case 'warning': return colors.warning;
      case 'improvement': return '#eab308'; // yellow-500
      case 'success': return colors.success;
      default: return colors.textColor;
    }
  }};
`;

const StatLabel = styled.div<{ severity: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    switch (props.severity) {
      case 'critical': return '#7f1d1d'; // red-900
      case 'warning': return '#9a3412'; // orange-800
      case 'improvement': return '#a16207'; // yellow-700
      case 'success': return '#14532d'; // green-900
      default: return colors.textColorSecondary;
    }
  }};
`;

const DetailSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
`;

const IssueList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
`;

const IssueItem = styled.div<{ severity: string }>`
  padding: 8px 12px;
  margin: 4px 0;
  border-left: 4px solid;
  border-left-color: ${props => {
    switch (props.severity) {
      case 'critical': return colors.error;
      case 'warning': return colors.warning;
      case 'improvement': return '#eab308';
      case 'compliant': return colors.success;
      default: return colors.neutral;
    }
  }};
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#fef2f2';
      case 'warning': return '#fff7ed';
      case 'improvement': return '#fefce8';
      case 'compliant': return '#f0fdf4';
      default: return colors.backgroundDarker;
    }
  }};
  border-radius: 0 4px 4px 0;
  font-size: 12px;
`;

interface ComplianceIssue {
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  article?: string;
}

interface ComplianceSummaryProps {
  data: {
    overallScore?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    complianceLevel?: string;
    numericScore?: number;
    criticalIssues?: ComplianceIssue[] | number;
    warnings?: ComplianceIssue[] | number;
    improvements?: ComplianceIssue[] | number;
    compliantItems?: ComplianceIssue[] | number;
    url?: string;
    timestamp?: string;
    detailedAnalysis?: any;
    recommendations?: any[];
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const getScoreDescription = (score: string): string => {
  switch (score) {
    case 'A': return 'Excellent';
    case 'B': return 'Très bien';
    case 'C': return 'Correct';
    case 'D': return 'À améliorer';
    case 'E': return 'Problématique';
    case 'F': return 'Critique';
    default: return 'Non évalué';
  }
};

const getIssueCount = (issues: ComplianceIssue[] | number | undefined): number => {
  if (typeof issues === 'number') return issues;
  if (Array.isArray(issues)) return issues.length;
  return 0;
};

const getIssueArray = (issues: ComplianceIssue[] | number | undefined): ComplianceIssue[] => {
  if (Array.isArray(issues)) return issues;
  return [];
};

const ComplianceSummaryCard = ({ data, title, actionButtons }: ComplianceSummaryProps): JSX.Element => {
  if (data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons} styles="grid-column: 1 / -1;">
        <div style={{ color: colors.error, textAlign: 'center', padding: '20px' }}>
          <p>Erreur lors de l'évaluation RGPD: {data.error}</p>
          <p style={{ fontSize: '12px', marginTop: '8px', color: colors.textColorSecondary }}>
            Utilisation des données d'analyse de base disponibles.
          </p>
        </div>
      </Card>
    );
  }

  const overallScore = data.overallScore || 'C';
  const criticalCount = getIssueCount(data.criticalIssues);
  const warningCount = getIssueCount(data.warnings);
  const improvementCount = getIssueCount(data.improvements);
  const compliantCount = getIssueCount(data.compliantItems);
  
  const criticalIssues = getIssueArray(data.criticalIssues);
  const warnings = getIssueArray(data.warnings);
  const improvements = getIssueArray(data.improvements);
  const compliantItems = getIssueArray(data.compliantItems);
  
  return (
    <Card heading={title} actionButtons={actionButtons} styles="grid-column: 1 / -1;">
      <SummaryContainer>
        <ScoreSection>
          <ScoreCircle score={overallScore}>
            {overallScore}
          </ScoreCircle>
          <ScoreLabel>Score Global de Conformité</ScoreLabel>
          <ScoreDescription score={overallScore}>
            {data.complianceLevel || getScoreDescription(overallScore)}
          </ScoreDescription>
          {data.numericScore && (
            <div style={{ fontSize: '10px', marginTop: '4px', color: colors.textColorThirdly }}>
              {data.numericScore}/100
            </div>
          )}
        </ScoreSection>
        
        <StatsGrid>
          <StatCard severity="critical">
            <StatNumber severity="critical">{criticalCount}</StatNumber>
            <StatLabel severity="critical">Critiques</StatLabel>
          </StatCard>
          
          <StatCard severity="warning">
            <StatNumber severity="warning">{warningCount}</StatNumber>
            <StatLabel severity="warning">Alertes</StatLabel>
          </StatCard>
          
          <StatCard severity="improvement">
            <StatNumber severity="improvement">{improvementCount}</StatNumber>
            <StatLabel severity="improvement">Améliorations</StatLabel>
          </StatCard>
          
          <StatCard severity="success">
            <StatNumber severity="success">{compliantCount}</StatNumber>
            <StatLabel severity="success">Conformes</StatLabel>
          </StatCard>
        </StatsGrid>
      </SummaryContainer>

      {/* Detailed Analysis */}
      {data.detailedAnalysis && (
        <DetailSection>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Analyse Détaillée
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
            {data.detailedAnalysis.cookies && (
              <Row lbl="Cookies" val={`${data.detailedAnalysis.cookies.total} total, ${data.detailedAnalysis.cookies.secure} sécurisés`} />
            )}
            {data.detailedAnalysis.securityHeaders && (
              <Row lbl="En-têtes sécurité" val={`${data.detailedAnalysis.securityHeaders.present}/${data.detailedAnalysis.securityHeaders.total} présents`} />
            )}
            {data.detailedAnalysis.dataCollection && (
              <Row lbl="Outils d'analyse" val={`${data.detailedAnalysis.dataCollection.analyticsTools} détectés`} />
            )}
            {data.detailedAnalysis.thirdPartyServices && (
              <Row lbl="Services tiers" val={`${data.detailedAnalysis.thirdPartyServices.count} domaines`} />
            )}
          </div>
        </DetailSection>
      )}

      {/* Issues Details */}
      {(criticalIssues.length > 0 || warnings.length > 0) && (
        <DetailSection>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: colors.textColor }}>
            Problèmes Identifiés
          </h4>
          <IssueList>
            {criticalIssues.slice(0, 3).map((issue, index) => (
              <IssueItem key={index} severity="critical">
                <strong>{issue.title}</strong>
                <div style={{ marginTop: '4px', color: colors.textColorSecondary }}>{issue.description}</div>
                {issue.article && (
                  <div style={{ marginTop: '4px', fontSize: '10px', fontStyle: 'italic' }}>
                    {issue.article}
                  </div>
                )}
              </IssueItem>
            ))}
            {warnings.slice(0, 2).map((issue, index) => (
              <IssueItem key={index} severity="warning">
                <strong>{issue.title}</strong>
                <div style={{ marginTop: '4px', color: colors.textColorSecondary }}>{issue.description}</div>
              </IssueItem>
            ))}
          </IssueList>
        </DetailSection>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <DetailSection>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: colors.textColor }}>
            Recommandations Prioritaires
          </h4>
          {data.recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} style={{ marginBottom: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: '600', color: colors.primary }}>{rec.priority}: {rec.title}</div>
              <div style={{ marginTop: '4px', color: colors.textColorSecondary }}>{rec.description}</div>
            </div>
          ))}
        </DetailSection>
      )}
      
      <div style={{
        background: colors.backgroundDarker,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '6px',
        padding: '12px',
        fontSize: '12px',
        color: colors.textColorSecondary,
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: colors.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px'
          }}>
            ℹ
          </div>
          <strong>Plan d'Action Prioritaire</strong>
        </div>
        <div style={{ paddingLeft: '24px', lineHeight: '1.5' }}>
          1. <strong>Traitement immédiat</strong>: {criticalCount} problème(s) critique(s) (0-7 jours)<br/>
          2. <strong>Correction rapide</strong>: {warningCount} avertissement(s) de sécurité (7-30 jours)<br/>
          3. <strong>Planification</strong>: {improvementCount} amélioration(s) recommandée(s) (1-3 mois)<br/>
          4. <strong>Maintien</strong>: {compliantCount} élément(s) déjà conforme(s)
        </div>
      </div>
    </Card>
  );
};

export default ComplianceSummaryCard;
