import { useState } from 'react';
import { Card } from 'web-check-live/components/Form/Card';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';
import styled from '@emotion/styled';

// --- Interfaces ---

interface Issue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  endpoint?: string;
  recommendation?: string;
  sensitiveEndpoints?: string[];
}

interface Finding {
  type: string;
  title: string;
  description: string;
  endpoint?: string;
}

interface ApiEndpoint {
  type: string;
  url: string;
  path?: string;
  name?: string;
  method?: string;
  status?: number;
  protected?: boolean;
  accessible?: boolean;
  secure?: boolean;
  pathCount?: number;
}

interface ExposedData {
  type: string;
  count: number;
  endpoint: string;
  sample: string;
}

interface GraphqlInfo {
  endpoint: string;
  introspectionEnabled: boolean;
  typeCount?: number;
  hasQueryType?: boolean;
  hasMutationType?: boolean;
  hasSubscriptionType?: boolean;
  sensitiveTypesFound?: string[];
}

interface OpenApiInfo {
  found: boolean;
  url?: string;
  path?: string;
  title?: string;
  version?: string;
  pathCount?: number;
  sensitiveEndpoints?: string[];
  hasAuth?: boolean;
}

interface CorsConfig {
  allowOrigin?: string;
  allowCredentials?: string;
  vulnerable?: boolean;
  reflected?: boolean;
  error?: string;
}

interface ApiSecurityData {
  url: string;
  timestamp: string;
  issues: Issue[];
  findings: Finding[];
  apiEndpoints: ApiEndpoint[];
  graphql: GraphqlInfo | null;
  openapi: OpenApiInfo | null;
  corsConfig: CorsConfig | null;
  authInfo: { method: string; header: string } | null;
  exposedData: ExposedData[];
  error?: string;
}

interface ApiSecurityProps {
  data: ApiSecurityData;
  title: string;
  actionButtons: React.ReactNode;
  refCode?: string;
}

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummaryBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  border: 1px solid ${colors.borderColor};
`;

const SummaryItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.color}15;
  border-radius: 6px;
  border: 1px solid ${props => props.color}40;
  
  .count {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.color};
  }
  
  .label {
    font-size: 0.75rem;
    color: ${colors.textColorSecondary};
    text-transform: uppercase;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ active: boolean; color?: string }>`
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  border: 1px solid ${props => props.active ? (props.color || colors.primary) : colors.borderColor};
  background: ${props => props.active ? (props.color || colors.primary) : 'transparent'};
  color: ${props => props.active ? 'white' : colors.textColorSecondary};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    border-color: ${props => props.color || colors.primary};
  }
`;

const IssueCard = styled.div<{ severity: string }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return 'rgba(220, 38, 38, 0.08)';
      case 'high': return 'rgba(234, 88, 12, 0.08)';
      case 'medium': return 'rgba(202, 138, 4, 0.08)';
      case 'low': return 'rgba(59, 130, 246, 0.08)';
      default: return 'rgba(107, 114, 128, 0.08)';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const SeverityBadge = styled.span<{ severity: string }>`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  margin-right: 0.5rem;
`;

const IssueTitle = styled.span`
  font-weight: 600;
  color: ${colors.textColor};
`;

const IssueDesc = styled.p`
  margin: 0.5rem 0;
  font-size: 0.85rem;
  color: ${colors.textColorSecondary};
  line-height: 1.4;
`;

const IssueEndpoint = styled.code`
  display: block;
  margin: 0.5rem 0;
  padding: 0.3rem 0.5rem;
  background: ${colors.backgroundDarker};
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${colors.textColor};
  word-break: break-all;
`;

const Recommendation = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: ${colors.info};
  font-style: italic;
  
  &::before {
    content: '→ ';
    font-style: normal;
  }
`;

const FindingCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 6px;
  border-left: 3px solid ${colors.success};
  margin-bottom: 0.5rem;
  
  .icon { font-size: 1.25rem; }
  
  .content {
    flex: 1;
    .title {
      font-weight: 600;
      color: ${colors.textColor};
      font-size: 0.9rem;
    }
    .desc {
      color: ${colors.textColorSecondary};
      font-size: 0.8rem;
    }
  }
`;

const EndpointGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const EndpointTag = styled.div<{ type: string; protected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  background: ${props => {
    if (props.protected) return 'rgba(16, 185, 129, 0.1)';
    switch (props.type) {
      case 'graphql': return 'rgba(226, 0, 116, 0.1)';
      case 'openapi': return 'rgba(139, 195, 74, 0.1)';
      case 'websocket': return 'rgba(156, 39, 176, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    if (props.protected) return 'rgba(16, 185, 129, 0.3)';
    switch (props.type) {
      case 'graphql': return 'rgba(226, 0, 116, 0.3)';
      case 'openapi': return 'rgba(139, 195, 74, 0.3)';
      case 'websocket': return 'rgba(156, 39, 176, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: monospace;
  color: ${colors.textColor};
  
  .type {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.6rem;
    opacity: 0.7;
  }
`;

const InfoBox = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  margin-bottom: 0.75rem;
  
  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    
    .icon { font-size: 1.1rem; }
  }
  
  .detail {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    margin: 0.25rem 0;
    
    code {
      background: ${colors.backgroundDarker};
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-size: 0.75rem;
    }
  }
`;

const NoIssues = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${colors.success};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .text {
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

// --- Main Component ---

const ApiSecurityCard = (props: ApiSecurityProps): JSX.Element => {
  const { data, title, actionButtons, refCode } = props;
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  
  if (!data || data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
        <div style={{ textAlign: 'center', padding: '2rem', color: colors.textColorSecondary }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🔐</span>
          {data?.error || 'Analyse de sécurité API non disponible'}
        </div>
      </Card>
    );
  }

  const { issues, findings, apiEndpoints, graphql, openapi, corsConfig, exposedData } = data;
  
  // Count by severity
  const counts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length
  };
  
  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(i => i.severity === filter);

  return (
    <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
      <Container>
        
        {/* Summary */}
        {issues.length > 0 ? (
          <SummaryBar>
            {counts.critical > 0 && (
              <SummaryItem color="#dc2626">
                <span className="count">{counts.critical}</span>
                <span className="label">Critiques</span>
              </SummaryItem>
            )}
            {counts.high > 0 && (
              <SummaryItem color="#ea580c">
                <span className="count">{counts.high}</span>
                <span className="label">Élevés</span>
              </SummaryItem>
            )}
            {counts.medium > 0 && (
              <SummaryItem color="#ca8a04">
                <span className="count">{counts.medium}</span>
                <span className="label">Moyens</span>
              </SummaryItem>
            )}
            {counts.low > 0 && (
              <SummaryItem color="#3b82f6">
                <span className="count">{counts.low}</span>
                <span className="label">Faibles</span>
              </SummaryItem>
            )}
            {findings.length > 0 && (
              <SummaryItem color="#10b981">
                <span className="count">{findings.length}</span>
                <span className="label">OK</span>
              </SummaryItem>
            )}
          </SummaryBar>
        ) : (
          <NoIssues>
            <div className="icon">✅</div>
            <div className="text">Aucun problème API détecté</div>
          </NoIssues>
        )}

        {/* GraphQL Info */}
        {graphql && (
          <InfoBox>
            <div className="header">
              <span className="icon">◇</span>
              GraphQL {graphql.introspectionEnabled ? '⚠️' : '✓'}
            </div>
            <div className="detail">Endpoint: <code>{graphql.endpoint}</code></div>
            {graphql.typeCount && <div className="detail">Types: {graphql.typeCount}</div>}
            {graphql.sensitiveTypesFound && graphql.sensitiveTypesFound.length > 0 && (
              <div className="detail" style={{ color: '#dc2626' }}>
                Types sensibles: {graphql.sensitiveTypesFound.join(', ')}
              </div>
            )}
          </InfoBox>
        )}

        {/* OpenAPI Info */}
        {openapi?.found && (
          <InfoBox>
            <div className="header">
              <span className="icon">📋</span>
              OpenAPI/Swagger Exposé
            </div>
            <div className="detail">URL: <code>{openapi.url}</code></div>
            {openapi.title && <div className="detail">API: {openapi.title} v{openapi.version}</div>}
            {openapi.pathCount && <div className="detail">Endpoints: {openapi.pathCount}</div>}
            {openapi.sensitiveEndpoints && openapi.sensitiveEndpoints.length > 0 && (
              <div className="detail" style={{ color: '#ea580c' }}>
                Endpoints sensibles: {openapi.sensitiveEndpoints.slice(0, 5).join(', ')}
              </div>
            )}
          </InfoBox>
        )}

        {/* CORS Info */}
        {corsConfig?.vulnerable && (
          <InfoBox>
            <div className="header">
              <span className="icon">🌐</span>
              CORS Vulnérable
            </div>
            <div className="detail" style={{ color: '#dc2626' }}>
              Allow-Origin: <code>{corsConfig.allowOrigin || 'reflected'}</code>
              {corsConfig.reflected && ' (reflection)'}
            </div>
          </InfoBox>
        )}

        {/* Exposed Data */}
        {exposedData.length > 0 && (
          <InfoBox>
            <div className="header" style={{ color: '#dc2626' }}>
              <span className="icon">🔑</span>
              Données Sensibles Exposées
            </div>
            {exposedData.map((exp, idx) => (
              <div key={idx} className="detail">
                {exp.type}: {exp.count} occurrence(s) - <code>{exp.sample}</code>
              </div>
            ))}
          </InfoBox>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>
              Problèmes Détectés ({issues.length})
            </Heading>
            
            <FilterTabs>
              <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
                Tous ({issues.length})
              </FilterTab>
              {counts.critical > 0 && (
                <FilterTab active={filter === 'critical'} color="#dc2626" onClick={() => setFilter('critical')}>
                  Critiques ({counts.critical})
                </FilterTab>
              )}
              {counts.high > 0 && (
                <FilterTab active={filter === 'high'} color="#ea580c" onClick={() => setFilter('high')}>
                  Élevés ({counts.high})
                </FilterTab>
              )}
              {counts.medium > 0 && (
                <FilterTab active={filter === 'medium'} color="#ca8a04" onClick={() => setFilter('medium')}>
                  Moyens ({counts.medium})
                </FilterTab>
              )}
              {counts.low > 0 && (
                <FilterTab active={filter === 'low'} color="#3b82f6" onClick={() => setFilter('low')}>
                  Faibles ({counts.low})
                </FilterTab>
              )}
            </FilterTabs>
            
            <div style={{ marginTop: '1rem' }}>
              {filteredIssues.map((issue, idx) => (
                <IssueCard key={idx} severity={issue.severity}>
                  <div>
                    <SeverityBadge severity={issue.severity}>{issue.severity}</SeverityBadge>
                    <IssueTitle>{issue.title}</IssueTitle>
                  </div>
                  <IssueDesc>{issue.description}</IssueDesc>
                  {issue.endpoint && <IssueEndpoint>{issue.endpoint}</IssueEndpoint>}
                  {issue.recommendation && <Recommendation>{issue.recommendation}</Recommendation>}
                </IssueCard>
              ))}
            </div>
          </div>
        )}

        {/* Findings (positive) */}
        {findings.length > 0 && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>
              Points Positifs ({findings.length})
            </Heading>
            {findings.map((finding, idx) => (
              <FindingCard key={idx}>
                <span className="icon">✅</span>
                <div className="content">
                  <div className="title">{finding.title}</div>
                  <div className="desc">{finding.description}</div>
                </div>
              </FindingCard>
            ))}
          </div>
        )}

        {/* Discovered Endpoints */}
        {apiEndpoints.length > 0 && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>
              Endpoints Découverts ({apiEndpoints.length})
            </Heading>
            <EndpointGrid>
              {apiEndpoints.map((ep, idx) => (
                <EndpointTag key={idx} type={ep.type} protected={ep.protected}>
                  <span className="type">{ep.type}</span>
                  {ep.path || new URL(ep.url).pathname}
                  {ep.protected && ' 🔒'}
                </EndpointTag>
              ))}
            </EndpointGrid>
          </div>
        )}

      </Container>
    </Card>
  );
};

export default ApiSecurityCard;
