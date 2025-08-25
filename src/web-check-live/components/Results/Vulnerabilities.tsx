import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const VulnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VulnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: ${props => {
    if (props.score >= 90) return '#22c55e';
    if (props.score >= 70) return '#eab308';
    if (props.score >= 50) return '#f59e0b';
    return '#ef4444';
  }};
`;

const VulnStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ severity: 'critical' | 'high' | 'medium' | 'low' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return colors.borderColor;
    }
  }};
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  font-weight: 500;
  text-transform: uppercase;
`;

const VulnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VulnItem = styled.div<{ severity: 'critical' | 'high' | 'medium' | 'low' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return colors.borderColor;
    }
  }};
`;

const VulnTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
`;

const VulnDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 13px;
  color: ${colors.textColorSecondary};
  line-height: 1.4;
`;

const VulnMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: ${colors.textColorThirdly};
`;

const SeverityBadge = styled.span<{ severity: 'critical' | 'high' | 'medium' | 'low' }>`
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fffbeb';
      case 'low': return '#f7fee7';
      default: return colors.backgroundLighter;
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'critical': return '#991b1b';
      case 'high': return '#9a3412';
      case 'medium': return '#92400e';
      case 'low': return '#365314';
      default: return colors.textColor;
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

interface VulnerabilitiesCardProps {
  data: {
    vulnerabilities?: Array<{
      id: string;
      title: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      cvss?: number;
      cve?: string;
      solution?: string;
    }>;
    summary?: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      score: number;
    };
    lastScan?: string;
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const VulnerabilitiesCard: React.FC<VulnerabilitiesCardProps> = ({ data, title, actionButtons }) => {
  if (data?.error) {
    return (
      <Card heading={title} actionButtons={actionButtons}>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textColorSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0', color: colors.textColor }}>Analyse des vulnérabilités indisponible</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {data.error || 'Impossible d\'analyser les vulnérabilités pour ce site.'}
          </p>
        </div>
      </Card>
    );
  }

  const vulnerabilities = data?.vulnerabilities || [];
  const summary = data?.summary || {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length,
    score: 85 // Default score if not provided
  };

  return (
    <Card heading={title} actionButtons={actionButtons}>
      <VulnContainer>
        <VulnHeader>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: colors.textColor, fontSize: '16px' }}>
              Analyse de Sécurité
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textColorSecondary }}>
              {summary.total} vulnérabilité{summary.total > 1 ? 's' : ''} détectée{summary.total > 1 ? 's' : ''}
            </p>
          </div>
          <ScoreDisplay>
            <ScoreCircle score={summary.score}>
              {summary.score}
            </ScoreCircle>
            <div>
              <div style={{ fontSize: '12px', color: colors.textColorSecondary }}>Score Sécurité</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textColor }}>
                {summary.score >= 90 ? 'Excellent' : 
                 summary.score >= 70 ? 'Bon' : 
                 summary.score >= 50 ? 'Moyen' : 'Critique'}
              </div>
            </div>
          </ScoreDisplay>
        </VulnHeader>

        <VulnStats>
          <StatCard severity="critical">
            <StatNumber>{summary.critical}</StatNumber>
            <StatLabel>Critique</StatLabel>
          </StatCard>
          <StatCard severity="high">
            <StatNumber>{summary.high}</StatNumber>
            <StatLabel>Élevé</StatLabel>
          </StatCard>
          <StatCard severity="medium">
            <StatNumber>{summary.medium}</StatNumber>
            <StatLabel>Moyen</StatLabel>
          </StatCard>
          <StatCard severity="low">
            <StatNumber>{summary.low}</StatNumber>
            <StatLabel>Faible</StatLabel>
          </StatCard>
        </VulnStats>

        {vulnerabilities.length > 0 ? (
          <VulnList>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.textColor }}>
              Vulnérabilités Détectées
            </h4>
            {vulnerabilities.slice(0, 10).map((vuln, index) => (
              <VulnItem key={vuln.id || index} severity={vuln.severity}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <VulnTitle>{vuln.title}</VulnTitle>
                  <SeverityBadge severity={vuln.severity}>{vuln.severity}</SeverityBadge>
                </div>
                <VulnDescription>{vuln.description}</VulnDescription>
                <VulnMeta>
                  {vuln.cvss && <span>CVSS: {vuln.cvss}</span>}
                  {vuln.cve && <span>CVE: {vuln.cve}</span>}
                </VulnMeta>
                {vuln.solution && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    background: colors.background, 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: colors.textColorSecondary
                  }}>
                    <strong>Solution:</strong> {vuln.solution}
                  </div>
                )}
              </VulnItem>
            ))}
            {vulnerabilities.length > 10 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                color: colors.textColorSecondary, 
                fontSize: '13px' 
              }}>
                ... et {vulnerabilities.length - 10} autre{vulnerabilities.length - 10 > 1 ? 's' : ''} vulnérabilité{vulnerabilities.length - 10 > 1 ? 's' : ''}
              </div>
            )}
          </VulnList>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textColorSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 8px 0', color: colors.textColor }}>Aucune vulnérabilité détectée</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Votre site semble sécurisé selon notre analyse automatisée.
            </p>
          </div>
        )}

        {data?.lastScan && (
          <div style={{ 
            fontSize: '11px', 
            color: colors.textColorThirdly, 
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${colors.borderColor}`
          }}>
            Dernière analyse: {new Date(data.lastScan).toLocaleDateString('fr-FR')}
          </div>
        )}
      </VulnContainer>
    </Card>
  );
};

export default VulnerabilitiesCard;