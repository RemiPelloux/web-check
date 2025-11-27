import React, { useState } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryBanner = styled.div<{ severity: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: ${colors.backgroundLighter};
  border-radius: 12px;
  border: 1px solid ${colors.borderColor};
  border-left: 6px solid ${props => {
    switch (props.severity) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#3b82f6';
      default: return '#22c55e';
    }
  }};
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: ${colors.textColor};
  }

  p {
    margin: 0;
    color: ${colors.textColorSecondary};
    font-size: 14px;
  }
`;

const FindingCard = styled.div<{ severity: string }>`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => {
      switch (props.severity) {
        case 'Critical': return '#ef4444';
        case 'High': return '#f97316';
        case 'Medium': return '#eab308';
        case 'Low': return '#3b82f6';
        default: return colors.primary;
      }
    }};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const FindingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .type {
    font-weight: 700;
    font-size: 15px;
    color: ${colors.textColor};
  }
`;

const SeverityBadge = styled.span<{ severity: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.severity) {
      case 'Critical': return `background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;`;
      case 'High': return `background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5;`;
      case 'Medium': return `background: #fefce8; color: #a16207; border: 1px solid #fef9c3;`;
      case 'Low': return `background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe;`;
      default: return `background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7;`;
    }
  }}
`;

const CodeBlock = styled.pre`
  background: ${colors.backgroundLighter};
  padding: 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: ${colors.textColor};
  overflow-x: auto;
  border: 1px solid ${colors.borderColor};
  margin: 0;
  
  span.highlight {
    background: #fef3c7;
    color: #92400e;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: bold;
  }
`;

const SourceInfo = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  
  a {
    color: ${colors.primary};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  border: 1px dashed ${colors.borderColor};
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: ${colors.textColor};
  }
  
  p {
    margin: 0;
    color: ${colors.textColorSecondary};
    font-size: 14px;
  }
`;

interface Finding {
  type: string;
  value: string;
  severity: string;
  sourceUrl: string;
  sourceType: string;
  context: string;
}

interface SecretsData {
  url: string;
  timestamp: string;
  scannedFilesCount: number;
  totalFindings: number;
  findings: Finding[];
}

const SecretsCard = (props: { data: SecretsData, title?: string, actionButtons?: any, refCode?: string }): JSX.Element => {
  const { data } = props;

  if (!data) return <Card heading={props.title || "PII & Secrets Scanner"} refCode={props.refCode}>Chargement...</Card>;

  const getHighestSeverity = () => {
    if (data.findings.some(f => f.severity === 'Critical')) return 'Critical';
    if (data.findings.some(f => f.severity === 'High')) return 'High';
    if (data.findings.some(f => f.severity === 'Medium')) return 'Medium';
    if (data.findings.some(f => f.severity === 'Low')) return 'Low';
    return 'Safe';
  };

  const severity = getHighestSeverity();
  const criticalCount = data.findings.filter(f => f.severity === 'Critical').length;
  const highCount = data.findings.filter(f => f.severity === 'High').length;

  const renderContext = (context: string, value: string) => {
    // Simple highlighting of the secret value within context
    // Note: value is already masked, so we might need to highlight based on position or pattern
    return context;
  };

  return (
    <Card heading={props.title || "PII & Secrets Scanner (Source Code Analysis)"} actionButtons={props.actionButtons} refCode={props.refCode}>
      <Container>
        <SummaryBanner severity={severity}>
          <StatusMessage>
            <h3>
              {data.totalFindings === 0 
                ? "Aucun secret détecté" 
                : `${data.totalFindings} problème${data.totalFindings > 1 ? 's' : ''} potentiel${data.totalFindings > 1 ? 's' : ''} trouvé${data.totalFindings > 1 ? 's' : ''}`}
            </h3>
            <p>
              {data.scannedFilesCount} fichiers source analysés (HTML & JS).
              {criticalCount > 0 && ` ⚠️ ${criticalCount} secrets critiques trouvés !`}
            </p>
          </StatusMessage>
          <SeverityBadge severity={severity} style={{ fontSize: '14px', padding: '8px 16px' }}>
            Risque {severity}
          </SeverityBadge>
        </SummaryBanner>

        {data.totalFindings === 0 ? (
          <EmptyState>
            <span className="icon">🛡️</span>
            <h3>Code source propre</h3>
            <p>Aucune clé API, token ou données personnelles exposés détectés dans le code source analysé.</p>
          </EmptyState>
        ) : (
          data.findings.map((finding, idx) => (
            <FindingCard key={idx} severity={finding.severity}>
              <FindingHeader>
                <span className="type">{finding.type}</span>
                <SeverityBadge severity={finding.severity}>{finding.severity}</SeverityBadge>
              </FindingHeader>
              
              <CodeBlock>
                {finding.context}
              </CodeBlock>
              
              <SourceInfo>
                Trouvé dans <strong>{finding.sourceType}</strong>: 
                <a href={finding.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {finding.sourceUrl.split('/').pop() || 'index'}
                </a>
              </SourceInfo>
            </FindingCard>
          ))
        )}
      </Container>
    </Card>
  );
};

export default SecretsCard;



