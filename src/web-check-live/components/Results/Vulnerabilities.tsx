import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const VulnContainer = styled.div`
  margin: 1rem 0;
`;

const VulnItem = styled.div<{ severity: string }>`
  padding: 12px;
  margin: 8px 0;
  border-left: 4px solid;
  border-left-color: ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      case 'info': return '#2563eb';
      default: return colors.borderColor;
    }
  }};
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fffbeb';
      case 'low': return '#f7fee7';
      case 'info': return '#eff6ff';
      default: return colors.backgroundLighter;
    }
  }};
  border-radius: 0 6px 6px 0;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      case 'info': return '#2563eb';
      default: return colors.neutral;
    }
  }};
  margin-right: 8px;
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
    if (props.score >= 80) return colors.success;
    if (props.score >= 60) return colors.warning;
    if (props.score >= 40) return '#ea580c';
    return colors.error;
  }};
  margin: 0 auto 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface VulnerabilitiesProps {
  data: {
    vulnerabilities?: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation?: string;
      cve?: string;
      impact?: string;
    }>;
    securityScore?: number;
    riskLevel?: string;
    summary?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
    timestamp?: string;
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const VulnerabilitiesCard = ({ data, title, actionButtons }: VulnerabilitiesProps): JSX.Element => {
  if (data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons}>
        <div style={{ color: colors.error, textAlign: 'center', padding: '20px' }}>
          Erreur lors de l'analyse des vulnérabilités: {data.error}
        </div>
      </Card>
    );
  }

  const vulnerabilities = data.vulnerabilities || [];
  const securityScore = data.securityScore || 0;
  const riskLevel = data.riskLevel || 'Unknown';
  const summary = data.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  return (
    <Card heading={title} actionButtons={actionButtons}>
      {/* Security Score Overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <ScoreCircle score={securityScore}>
            {securityScore}
          </ScoreCircle>
          <div style={{ fontSize: '12px', fontWeight: '600', color: colors.textColor }}>
            Score Sécurité
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: riskLevel === 'Critical' || riskLevel === 'High' ? colors.error : 
                   riskLevel === 'Medium' ? colors.warning : colors.success 
          }}>
            Risque {riskLevel}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#fef2f2', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '16px' }}>{summary.critical}</div>
              <div style={{ color: '#7f1d1d' }}>Critique</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#fff7ed', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: '#ea580c', fontSize: '16px' }}>{summary.high}</div>
              <div style={{ color: '#9a3412' }}>Élevé</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#fffbeb', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: '#d97706', fontSize: '16px' }}>{summary.medium}</div>
              <div style={{ color: '#a16207' }}>Moyen</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f7fee7', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: '#65a30d', fontSize: '16px' }}>{summary.low}</div>
              <div style={{ color: '#365314' }}>Faible</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#eff6ff', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: '#2563eb', fontSize: '16px' }}>{summary.info}</div>
              <div style={{ color: '#1e40af' }}>Info</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Row lbl="Vulnérabilités trouvées" val={vulnerabilities.length.toString()} />
        <Row lbl="Niveau de risque" val={riskLevel} />
        <Row lbl="Score de sécurité" val={`${securityScore}/100`} />
        <Row lbl="Dernière analyse" val={data.timestamp ? new Date(data.timestamp).toLocaleString('fr-FR') : 'N/A'} />
      </div>

      {/* Vulnerabilities List */}
      {vulnerabilities.length > 0 && (
        <VulnContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Vulnérabilités Détectées
          </h4>
          
          {vulnerabilities
            .sort((a, b) => {
              const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
              return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                     (severityOrder[a.severity as keyof typeof severityOrder] || 0);
            })
            .slice(0, 10) // Show top 10 vulnerabilities
            .map((vuln, index) => (
              <VulnItem key={index} severity={vuln.severity}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <SeverityBadge severity={vuln.severity}>
                    {vuln.severity}
                  </SeverityBadge>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: colors.textColor, marginBottom: '4px' }}>
                      {vuln.title}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textColorSecondary, marginBottom: '6px' }}>
                      {vuln.description}
                    </div>
                    {vuln.recommendation && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, fontStyle: 'italic' }}>
                        <strong>Recommandation:</strong> {vuln.recommendation}
                      </div>
                    )}
                    {vuln.cve && (
                      <div style={{ fontSize: '10px', color: colors.textColorThirdly, marginTop: '4px' }}>
                        CVE: {vuln.cve}
                      </div>
                    )}
                    {vuln.impact && (
                      <div style={{ fontSize: '11px', color: colors.primary, marginTop: '4px' }}>
                        <strong>Impact:</strong> {vuln.impact}
                      </div>
                    )}
                  </div>
                </div>
              </VulnItem>
            ))}
          
          {vulnerabilities.length > 10 && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '16px', 
              fontSize: '12px', 
              color: colors.textColorSecondary 
            }}>
              ... et {vulnerabilities.length - 10} autre(s) vulnérabilité(s)
            </div>
          )}
        </VulnContainer>
      )}

      {vulnerabilities.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: colors.success,
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Aucune vulnérabilité détectée</div>
          <div style={{ fontSize: '12px' }}>
            Les vérifications de sécurité automatiques n'ont trouvé aucun problème critique
          </div>
        </div>
      )}
    </Card>
  );
};

export default VulnerabilitiesCard;
