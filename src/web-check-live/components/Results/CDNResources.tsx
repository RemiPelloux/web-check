import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const CDNContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CDNHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PerformanceScore = styled.div<{ score: number }>`
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
    if (props.score >= 90) return '#22c55e';
    if (props.score >= 70) return '#eab308';
    if (props.score >= 50) return '#f59e0b';
    return '#ef4444';
  }};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ type: 'resources' | 'domains' | 'performance' | 'security' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'resources': return '#3b82f6';
      case 'domains': return '#8b5cf6';
      case 'performance': return '#22c55e';
      case 'security': return '#ef4444';
      default: return colors.borderColor;
    }
  }};
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${colors.textColorSecondary};
  font-weight: 500;
  text-transform: uppercase;
`;

const ResourcesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResourceItem = styled.div<{ type: 'cdn' | 'external' | 'tracking' | 'google' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'cdn': return '#22c55e';
      case 'external': return '#3b82f6';
      case 'tracking': return '#f59e0b';
      case 'google': return '#ef4444';
      default: return colors.borderColor;
    }
  }};
`;

const ResourceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ResourceDomain = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  word-break: break-all;
`;

const ResourceType = styled.span<{ type: 'cdn' | 'external' | 'tracking' | 'google' }>`
  background: ${props => {
    switch (props.type) {
      case 'cdn': return '#f0fdf4';
      case 'external': return '#eff6ff';
      case 'tracking': return '#fffbeb';
      case 'google': return '#fef2f2';
      default: return colors.backgroundLighter;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'cdn': return '#166534';
      case 'external': return '#1e40af';
      case 'tracking': return '#92400e';
      case 'google': return '#991b1b';
      default: return colors.textColor;
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ResourceDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
  color: ${colors.textColorSecondary};
`;

const ResourceFiles = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  margin-top: 8px;
`;

const FileItem = styled.div`
  padding: 4px 0;
  border-bottom: 1px solid ${colors.borderColor};
  word-break: break-all;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SecurityWarning = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
`;

interface CDNResourcesCardProps {
  data: {
    resources?: Array<{
      domain: string;
      type: 'cdn' | 'external' | 'tracking' | 'google';
      files: string[];
      size?: number;
      loadTime?: number;
      secure?: boolean;
      description?: string;
    }>;
    summary?: {
      totalResources: number;
      externalDomains: number;
      cdnResources: number;
      trackingResources: number;
      googleServices: number;
      performanceScore: number;
      securityIssues: number;
    };
    confidentialityIssues?: Array<{
      domain: string;
      issue: string;
      severity: 'high' | 'medium' | 'low';
      recommendation: string;
    }>;
    error?: string;
  };
  title: string;
  actionButtons?: any;
  refCode?: string;
}

const CDNResourcesCard: React.FC<CDNResourcesCardProps> = ({ data, title, actionButtons, refCode }) => {
  if (data?.error) {
    return (
      <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textColorSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
          <h3 style={{ margin: '0 0 8px 0', color: colors.textColor }}>Analyse CDN indisponible</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {data.error || 'Impossible d\'analyser les ressources CDN pour ce site.'}
          </p>
        </div>
      </Card>
    );
  }

  // Backend sends externalResources, not resources
  const resources = data?.externalResources || data?.resources || [];
  const summary = data?.summary || {
    totalResources: data?.totalResources || resources.length,
    externalDomains: new Set(resources.map(r => r.domain)).size,
    cdnResources: data?.cdnProviders?.length || resources.filter(r => r.isCDN).length,
    trackingResources: resources.filter(r => r.type === 'tracking').length,
    googleServices: resources.filter(r => r.type === 'google').length,
    performanceScore: data?.summary?.performanceScore || 85,
    securityIssues: data?.securityIssues?.length || resources.filter(r => !r.isSecure).length
  };

  const confidentialityIssues = data?.confidentialityIssues || [];

  // Group resources by domain for better display
  const groupedResources = resources.reduce((acc, resource) => {
    const domain = resource.domain;
    if (!acc[domain]) {
      acc[domain] = {
        domain: domain,
        type: resource.isCDN ? 'cdn' : 
              (resource.provider?.category === 'Social Media' ? 'google' : 
               (resource.provider?.privacy === 'Poor' ? 'tracking' : 'external')),
        files: [],
        totalSize: 0,
        secure: resource.isSecure !== false,
        description: resource.provider?.name || domain
      };
    }
    // Each resource is one file - add its URL to the files array
    if (resource.url) {
      acc[domain].files.push(resource.url);
    }
    acc[domain].totalSize += resource.size || 0;
    return acc;
  }, {} as Record<string, any>);

  return (
    <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
      <CDNContainer>
        <CDNHeader>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: colors.textColor, fontSize: '16px' }}>
              Ressources Externes
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textColorSecondary }}>
              {summary.totalResources} ressource{summary.totalResources > 1 ? 's' : ''} • {summary.externalDomains} domaine{summary.externalDomains > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PerformanceScore score={summary.performanceScore}>
              {summary.performanceScore}
            </PerformanceScore>
            <div>
              <div style={{ fontSize: '12px', color: colors.textColorSecondary }}>Score Performance</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textColor }}>
                {summary.performanceScore >= 90 ? 'Excellent' : 
                 summary.performanceScore >= 70 ? 'Bon' : 
                 summary.performanceScore >= 50 ? 'Moyen' : 'Faible'}
              </div>
            </div>
          </div>
        </CDNHeader>

        <StatsGrid>
          <StatCard type="resources">
            <StatNumber>{summary.totalResources}</StatNumber>
            <StatLabel>Ressources</StatLabel>
          </StatCard>
          <StatCard type="domains">
            <StatNumber>{summary.externalDomains}</StatNumber>
            <StatLabel>Domaines</StatLabel>
          </StatCard>
          <StatCard type="performance">
            <StatNumber>{summary.cdnResources}</StatNumber>
            <StatLabel>CDN</StatLabel>
          </StatCard>
          <StatCard type="security">
            <StatNumber>{summary.securityIssues}</StatNumber>
            <StatLabel>Problèmes</StatLabel>
          </StatCard>
        </StatsGrid>

        {Object.keys(groupedResources).length > 0 ? (
          <ResourcesList>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.textColor }}>
              Fournisseurs CDN Détectés
            </h4>
            {Object.values(groupedResources).slice(0, 10).map((resource: any, index) => (
              <ResourceItem key={resource.domain} type={resource.type}>
                <ResourceHeader>
                  <ResourceDomain>{resource.domain}</ResourceDomain>
                  <ResourceType type={resource.type}>
                    {resource.type === 'cdn' ? 'CDN' :
                     resource.type === 'external' ? 'Externe' :
                     resource.type === 'tracking' ? 'Tracking' : 'Google'}
                  </ResourceType>
                </ResourceHeader>
                
                {resource.description && (
                  <div style={{ fontSize: '12px', color: colors.textColorSecondary, marginBottom: '8px' }}>
                    {resource.description}
                  </div>
                )}

                <ResourceDetails>
                  <span>📁 {resource.files.length} fichier{resource.files.length > 1 ? 's' : ''}</span>
                  {resource.totalSize > 0 && <span>📊 {Math.round(resource.totalSize / 1024)}KB</span>}
                  <span>{resource.secure ? '🔒 HTTPS' : '⚠️ HTTP'}</span>
                </ResourceDetails>

                {resource.files.length > 0 && (
                  <ResourceFiles>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Fichiers chargés:</div>
                    {resource.files.slice(0, 3).map((file: string, i: number) => (
                      <FileItem key={i}>
                        {file.length > 60 ? `...${file.slice(-60)}` : file}
                      </FileItem>
                    ))}
                    {resource.files.length > 3 && (
                      <div style={{ fontSize: '11px', color: colors.textColorThirdly, paddingTop: '4px' }}>
                        ... et {resource.files.length - 3} autre{resource.files.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </ResourceFiles>
                )}

                {resource.type === 'google' && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    background: '#fef2f2', 
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#991b1b'
                  }}>
                    ⚠️ <strong>Avertissement Cloud Act:</strong> Service Google soumis à la législation américaine
                  </div>
                )}
              </ResourceItem>
            ))}
            {Object.keys(groupedResources).length > 10 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                color: colors.textColorSecondary, 
                fontSize: '13px' 
              }}>
                ... et {Object.keys(groupedResources).length - 10} autre{Object.keys(groupedResources).length - 10 > 1 ? 's' : ''} domaine{Object.keys(groupedResources).length - 10 > 1 ? 's' : ''}
              </div>
            )}
          </ResourcesList>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textColorSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {data.isSPA ? '⚠️' : '🏠'}
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: colors.textColor }}>
              {data.isSPA ? 'Application SPA Détectée' : 'Aucune ressource externe détectée'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {data.spaWarning || 'Toutes les ressources semblent être hébergées localement.'}
            </p>
          </div>
        )}

        {confidentialityIssues.length > 0 && (
          <SecurityWarning>
            <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
              🔴 Problèmes de Confidentialité Détectés
            </div>
            {confidentialityIssues.slice(0, 3).map((issue, index) => (
              <div key={index} style={{ marginBottom: '8px', fontSize: '12px' }}>
                <strong>{issue.domain}:</strong> {issue.issue}
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  💡 {issue.recommendation}
                </div>
              </div>
            ))}
          </SecurityWarning>
        )}

        <div style={{ 
          fontSize: '11px', 
          color: colors.textColorThirdly, 
          textAlign: 'center',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.borderColor}`
        }}>
          Analyse des performances • Sécurité CDN • Conformité APDP
        </div>
      </CDNContainer>
    </Card>
  );
};

export default CDNResourcesCard;