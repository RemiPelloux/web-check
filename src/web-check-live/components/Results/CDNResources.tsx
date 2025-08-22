import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const ResourceContainer = styled.div`
  margin: 1rem 0;
`;

const ResourceItem = styled.div`
  padding: 10px;
  margin: 6px 0;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 6px;
  font-size: 12px;
`;

const ProviderBadge = styled.span<{ privacy: string }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  margin-right: 8px;
  color: white;
  background: ${props => {
    switch (props.privacy) {
      case 'Good': return colors.success;
      case 'Medium': return colors.warning;
      case 'Poor': return colors.error;
      default: return colors.neutral;
    }
  }};
`;

const IssueItem = styled.div<{ severity: string }>`
  padding: 8px;
  margin: 4px 0;
  border-left: 3px solid;
  border-left-color: ${props => {
    switch (props.severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.borderColor;
    }
  }};
  background: ${props => {
    switch (props.severity) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fffbeb';
      case 'low': return '#eff6ff';
      default: return colors.backgroundLighter;
    }
  }};
  border-radius: 0 4px 4px 0;
  font-size: 11px;
`;

interface CDNResourcesProps {
  data: {
    cdnProviders?: Array<{
      domain: string;
      name: string;
      category: string;
      privacy: string;
      resourceCount: number;
    }>;
    externalResources?: Array<{
      url: string;
      domain: string;
      type: string;
      protocol: string;
      isSecure: boolean;
      isCDN: boolean;
      provider?: any;
    }>;
    securityIssues?: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation?: string;
      resource?: string;
    }>;
    privacyIssues?: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation?: string;
      article?: string;
    }>;
    performanceIssues?: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation?: string;
    }>;
    summary?: {
      cdnCount: number;
      externalDomains: number;
      insecureResources: number;
      trackingResources: number;
      performanceScore: number;
    };
    totalResources?: number;
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const CDNResourcesCard = ({ data, title, actionButtons }: CDNResourcesProps): JSX.Element => {
  if (data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons}>
        <div style={{ color: colors.error, textAlign: 'center', padding: '20px' }}>
          Erreur lors de l'analyse CDN: {data.error}
        </div>
      </Card>
    );
  }

  const cdnProviders = data.cdnProviders || [];
  const externalResources = data.externalResources || [];
  const securityIssues = data.securityIssues || [];
  const privacyIssues = data.privacyIssues || [];
  const performanceIssues = data.performanceIssues || [];
  const summary = data.summary || { cdnCount: 0, externalDomains: 0, insecureResources: 0, trackingResources: 0, performanceScore: 100 };

  return (
    <Card heading={title} actionButtons={actionButtons}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Row lbl="Ressources externes" val={`${data.totalResources || 0} ressources`} />
        <Row lbl="Fournisseurs CDN" val={`${summary.cdnCount} détectés`} />
        <Row lbl="Domaines externes" val={`${summary.externalDomains} domaines`} />
        <Row lbl="Score performance" val={`${summary.performanceScore}/100`} />
      </div>

      {/* Performance Score */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '12px',
        background: colors.backgroundDarker,
        borderRadius: '8px',
        border: `1px solid ${colors.borderColor}`
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          color: 'white',
          background: summary.performanceScore >= 80 ? colors.success : 
                     summary.performanceScore >= 60 ? colors.warning : colors.error
        }}>
          {summary.performanceScore}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: colors.textColor }}>
            Score Performance CDN
          </div>
          <div style={{ fontSize: '12px', color: colors.textColorSecondary }}>
            Basé sur le nombre et la qualité des ressources externes
          </div>
        </div>
      </div>

      {/* CDN Providers */}
      {cdnProviders.length > 0 && (
        <ResourceContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Fournisseurs CDN Détectés ({cdnProviders.length})
          </h4>
          {cdnProviders.map((provider, index) => (
            <ResourceItem key={index}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: '600', color: colors.textColor }}>
                  {provider.name}
                </div>
                <ProviderBadge privacy={provider.privacy}>
                  {provider.privacy} Privacy
                </ProviderBadge>
              </div>
              <div style={{ color: colors.textColorSecondary, marginBottom: '4px' }}>
                <strong>Domaine:</strong> {provider.domain} | <strong>Catégorie:</strong> {provider.category}
              </div>
              <div style={{ color: colors.textColorSecondary }}>
                <strong>Ressources:</strong> {provider.resourceCount}
              </div>
            </ResourceItem>
          ))}
        </ResourceContainer>
      )}

      {/* Security Issues */}
      {securityIssues.length > 0 && (
        <ResourceContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Problèmes de Sécurité ({securityIssues.length})
          </h4>
          {securityIssues.slice(0, 5).map((issue, index) => (
            <IssueItem key={index} severity={issue.severity}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: colors.textColor }}>
                {issue.title}
              </div>
              <div style={{ marginBottom: '4px', color: colors.textColorSecondary }}>
                {issue.description}
              </div>
              {issue.recommendation && (
                <div style={{ fontStyle: 'italic', color: colors.textColorSecondary }}>
                  <strong>Recommandation:</strong> {issue.recommendation}
                </div>
              )}
              {issue.resource && (
                <div style={{ fontSize: '10px', color: colors.textColorThirdly, marginTop: '4px', wordBreak: 'break-all' }}>
                  Ressource: {issue.resource}
                </div>
              )}
            </IssueItem>
          ))}
        </ResourceContainer>
      )}

      {/* Privacy Issues */}
      {privacyIssues.length > 0 && (
        <ResourceContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Problèmes de Confidentialité ({privacyIssues.length})
          </h4>
          {privacyIssues.slice(0, 5).map((issue, index) => (
            <IssueItem key={index} severity={issue.severity}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: colors.textColor }}>
                {issue.title}
              </div>
              <div style={{ marginBottom: '4px', color: colors.textColorSecondary }}>
                {issue.description}
              </div>
              {issue.recommendation && (
                <div style={{ fontStyle: 'italic', color: colors.textColorSecondary, marginBottom: '4px' }}>
                  <strong>Recommandation:</strong> {issue.recommendation}
                </div>
              )}
              {issue.article && (
                <div style={{ fontSize: '10px', color: colors.primary, fontWeight: '600' }}>
                  {issue.article}
                </div>
              )}
            </IssueItem>
          ))}
        </ResourceContainer>
      )}

      {/* Performance Issues */}
      {performanceIssues.length > 0 && (
        <ResourceContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Optimisations Performance ({performanceIssues.length})
          </h4>
          {performanceIssues.map((issue, index) => (
            <IssueItem key={index} severity={issue.severity}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: colors.textColor }}>
                {issue.title}
              </div>
              <div style={{ marginBottom: '4px', color: colors.textColorSecondary }}>
                {issue.description}
              </div>
              {issue.recommendation && (
                <div style={{ fontStyle: 'italic', color: colors.textColorSecondary }}>
                  <strong>Recommandation:</strong> {issue.recommendation}
                </div>
              )}
            </IssueItem>
          ))}
        </ResourceContainer>
      )}

      {/* External Resources Summary */}
      {externalResources.length > 0 && (
        <ResourceContainer>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: colors.textColor }}>
            Types de Ressources Externes ({externalResources.length} total)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            {['script', 'stylesheet', 'image', 'font', 'video', 'other'].map(type => {
              const count = externalResources.filter(r => r.type === type).length;
              if (count === 0) return null;
              
              const typeLabels = {
                script: 'JavaScript',
                stylesheet: 'CSS',
                image: 'Images',
                font: 'Polices',
                video: 'Vidéos',
                other: 'Autres'
              };
              
              return (
                <div key={type} style={{ 
                  textAlign: 'center', 
                  padding: '12px', 
                  background: colors.backgroundDarker, 
                  borderRadius: '6px',
                  border: `1px solid ${colors.borderColor}`
                }}>
                  <div style={{ fontWeight: '700', color: colors.primary, fontSize: '18px' }}>{count}</div>
                  <div style={{ fontSize: '12px', color: colors.textColorSecondary, fontWeight: '500' }}>
                    {typeLabels[type as keyof typeof typeLabels] || type}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Show some example resources */}
          <div style={{ marginTop: '16px' }}>
            <h5 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: colors.textColor }}>
              Exemples de Ressources Externes:
            </h5>
            {externalResources.slice(0, 5).map((resource, index) => (
              <div key={index} style={{ 
                fontSize: '11px', 
                color: colors.textColorSecondary, 
                marginBottom: '4px',
                padding: '4px 8px',
                background: colors.backgroundLighter,
                borderRadius: '3px',
                wordBreak: 'break-all'
              }}>
                <span style={{ 
                  color: resource.isSecure ? colors.success : colors.error,
                  fontWeight: '600',
                  marginRight: '8px'
                }}>
                  [{resource.type.toUpperCase()}]
                </span>
                {resource.domain}
                {resource.isCDN && (
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '1px 4px',
                    background: colors.info,
                    color: 'white',
                    borderRadius: '2px',
                    fontSize: '9px'
                  }}>
                    CDN
                  </span>
                )}
              </div>
            ))}
            {externalResources.length > 5 && (
              <div style={{ fontSize: '10px', color: colors.textColorThirdly, fontStyle: 'italic' }}>
                ... et {externalResources.length - 5} autres ressources
              </div>
            )}
          </div>
        </ResourceContainer>
      )}

      {/* No External Resources */}
      {externalResources.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: colors.textColorSecondary,
          background: colors.backgroundDarker,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Aucune ressource externe détectée</div>
          <div style={{ fontSize: '12px' }}>
            Ce site semble utiliser uniquement des ressources locales
          </div>
        </div>
      )}
    </Card>
  );
};

export default CDNResourcesCard;
