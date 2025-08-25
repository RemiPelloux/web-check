import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const PageContainer = styled.div`
  margin: 1rem 0;
`;

const PageItem = styled.div<{ found: boolean; accessible: boolean }>`
  padding: 12px;
  margin: 8px 0;
  border-left: 4px solid;
  border-left-color: ${props => {
    if (!props.found) return colors.error;
    if (!props.accessible) return colors.warning;
    return colors.success;
  }};
  background: ${props => {
    if (!props.found) return '#fef2f2';
    if (!props.accessible) return '#fffbeb';
    return '#f0fdf4';
  }};
  border-radius: 0 6px 6px 0;
`;

const StatusBadge = styled.span<{ status: 'found' | 'missing' | 'inaccessible' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch (props.status) {
      case 'found': return colors.success;
      case 'inaccessible': return colors.warning;
      case 'missing': return colors.error;
      default: return colors.neutral;
    }
  }};
  margin-right: 8px;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  margin-left: 8px;
  color: ${props => {
    switch (props.priority) {
      case 'critical': return '#7f1d1d';
      case 'high': return '#9a3412';
      case 'medium': return '#a16207';
      case 'low': return '#365314';
      default: return colors.textColorSecondary;
    }
  }};
  background: ${props => {
    switch (props.priority) {
      case 'critical': return '#fecaca';
      case 'high': return '#fed7aa';
      case 'medium': return '#fef3c7';
      case 'low': return '#bbf7d0';
      default: return colors.backgroundLighter;
    }
  }};
`;

const ComplianceCircle = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: ${props => {
    if (props.score >= 90) return colors.success;
    if (props.score >= 75) return '#16a34a';
    if (props.score >= 60) return colors.warning;
    if (props.score >= 40) return '#ea580c';
    return colors.error;
  }};
  margin: 0 auto 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface LegalPagesProps {
  data: {
    legalPages?: Array<{
      name: string;
      required: boolean;
      priority: string;
      article: string;
      found: boolean;
      accessible: boolean;
      url?: string;
      status?: number;
      contentLength?: number;
      lastModified?: string;
      issues: string[];
      foundVia?: string;
    }>;
    missingPages?: string[];
    complianceScore?: number;
    complianceLevel?: string;
    recommendations?: Array<{
      priority: string;
      title: string;
      description: string;
      actions: string[];
    }>;
    summary?: {
      totalRequired: number;
      found: number;
      missing: number;
      accessible: number;
    };
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const LegalPagesCard = ({ data, title, actionButtons }: LegalPagesProps): JSX.Element => {
  if (data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons}>
        <div style={{ color: colors.error, textAlign: 'center', padding: '20px' }}>
          Erreur lors de l'analyse des pages légales: {data.error}
        </div>
      </Card>
    );
  }

  const legalPages = data.legalPages || [];
  const complianceScore = data.complianceScore || 0;
  const complianceLevel = data.complianceLevel || 'Non-conforme';
  const summary = data.summary || { totalRequired: 0, found: 0, missing: 0, accessible: 0 };
  const recommendations = data.recommendations || [];

  return (
    <Card heading={title} actionButtons={actionButtons}>
      {/* Compliance Score Overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <ComplianceCircle score={complianceScore}>
            {complianceScore}
          </ComplianceCircle>
          <div style={{ fontSize: '12px', fontWeight: '600', color: colors.textColor }}>
            Conformité Légale
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: complianceScore >= 75 ? colors.success : 
                   complianceScore >= 60 ? colors.warning : colors.error,
            fontWeight: '600'
          }}>
            {complianceLevel}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: colors.success, fontSize: '16px' }}>{summary.found}</div>
              <div style={{ color: '#14532d' }}>Trouvées</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: colors.success, fontSize: '16px' }}>{summary.accessible}</div>
              <div style={{ color: '#14532d' }}>Accessibles</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#fef2f2', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: colors.error, fontSize: '16px' }}>{summary.missing}</div>
              <div style={{ color: '#7f1d1d' }}>Manquantes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: colors.backgroundDarker, borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', color: colors.textColor, fontSize: '16px' }}>{summary.totalRequired}</div>
              <div style={{ color: colors.textColorSecondary }}>Requises</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Row lbl="Score de conformité" val={`${complianceScore}/100`} />
        <Row lbl="Niveau" val={complianceLevel} />
        <Row lbl="Pages requises" val={`${summary.found}/${summary.totalRequired}`} />
        <Row lbl="Pages manquantes" val={summary.missing.toString()} />
      </div>

      {/* Legal Pages List */}
      {legalPages.length > 0 && (
        <PageContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Pages Légales Analysées
          </h4>
          
          {legalPages.map((page, index) => {
            const status = !page.found ? 'missing' : !page.accessible ? 'inaccessible' : 'found';
            
            return (
              <PageItem key={index} found={page.found} accessible={page.accessible}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                      <StatusBadge status={status}>
                        {status === 'found' ? 'Trouvée' : status === 'missing' ? 'Manquante' : 'Inaccessible'}
                      </StatusBadge>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: colors.textColor }}>
                        {page.name}
                      </span>
                      {page.required && (
                        <PriorityBadge priority={page.priority}>
                          {page.priority === 'critical' ? 'Obligatoire' : 
                           page.priority === 'high' ? 'Important' :
                           page.priority === 'medium' ? 'Recommandé' : 'Optionnel'}
                        </PriorityBadge>
                      )}
                    </div>
                    
                    {page.url && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginBottom: '4px', wordBreak: 'break-all' }}>
                        <strong>URL:</strong> {page.url}
                      </div>
                    )}
                    
                    {page.foundVia && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginBottom: '4px' }}>
                        <strong>Trouvée via:</strong> {page.foundVia === 'direct' ? 'URL directe' : 'Lien dans la page'}
                      </div>
                    )}
                    
                    {page.contentLength && page.contentLength > 0 && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginBottom: '4px' }}>
                        <strong>Taille du contenu:</strong> {page.contentLength.toLocaleString()} caractères
                      </div>
                    )}
                    
                    {page.lastModified && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginBottom: '4px' }}>
                        <strong>Dernière modification:</strong> {new Date(page.lastModified).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '10px', color: colors.primary, fontStyle: 'italic' }}>
                      {page.article}
                    </div>
                    
                    {page.issues.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: colors.warning, marginBottom: '4px' }}>
                          Problèmes identifiés:
                        </div>
                        {page.issues.slice(0, 3).map((issue, issueIndex) => (
                          <div key={issueIndex} style={{ fontSize: '10px', color: colors.textColorSecondary, marginLeft: '8px' }}>
                            • {issue}
                          </div>
                        ))}
                        {page.issues.length > 3 && (
                          <div style={{ fontSize: '10px', color: colors.textColorThirdly, marginLeft: '8px' }}>
                            ... et {page.issues.length - 3} autre(s) problème(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </PageItem>
            );
          })}
        </PageContainer>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <PageContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Recommandations Prioritaires
          </h4>
          
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} style={{ 
              padding: '12px', 
              marginBottom: '8px', 
              background: colors.backgroundDarker, 
              border: `1px solid ${colors.borderColor}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '600', color: colors.primary, marginBottom: '4px' }}>
                {rec.priority}: {rec.title}
              </div>
              <div style={{ color: colors.textColorSecondary, marginBottom: '6px' }}>
                {rec.description}
              </div>
              <div style={{ fontSize: '11px', color: colors.textColorSecondary }}>
                <strong>Actions:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {rec.actions.slice(0, 3).map((action, actionIndex) => (
                    <li key={actionIndex} style={{ marginBottom: '2px' }}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </PageContainer>
      )}

      {/* Missing Pages Alert */}
      {data.missingPages && data.missingPages.length > 0 && (
        <div style={{ 
          padding: '12px', 
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <div style={{ fontWeight: '600', color: colors.error, marginBottom: '8px', fontSize: '13px' }}>
            ⚠️ Pages légales manquantes ({data.missingPages.length})
          </div>
          <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
            {data.missingPages.join(', ')}
          </div>
          <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '6px', fontStyle: 'italic' }}>
            Ces pages sont obligatoires pour la conformité légale APDP Monaco
          </div>
        </div>
      )}
    </Card>
  );
};

export default LegalPagesCard;

