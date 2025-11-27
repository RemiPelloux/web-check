import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div<{ color?: string }>`
  background: ${colors.backgroundLighter};
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${colors.borderColor};
  text-align: center;

  .value {
    font-size: 28px;
    font-weight: 700;
    color: ${props => props.color || colors.textColor};
    margin-bottom: 4px;
  }

  .label {
    font-size: 12px;
    text-transform: uppercase;
    color: ${colors.textColorSecondary};
    font-weight: 600;
  }
`;

const Section = styled.div`
  h3 {
    font-size: 16px;
    margin-bottom: 12px;
    color: ${colors.textColor};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const IssueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IssueItem = styled.div<{ type: 'broken' | 'mixed' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.background};
  border: 1px solid ${props => props.type === 'broken' ? '#fecaca' : '#fef08a'};
  padding: 12px;
  border-radius: 6px;
  
  .url {
    font-family: monospace;
    font-size: 13px;
    color: ${colors.textColor};
    word-break: break-all;
  }

  .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    background: ${props => props.type === 'broken' ? '#ef4444' : '#eab308'};
    color: white;
    white-space: nowrap;
    margin-left: 12px;
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  background: #f0fdf4;
  border: 1px dashed #86efac;
  border-radius: 8px;
  color: #15803d;
  font-size: 14px;
`;

interface BrokenLink {
  url: string;
  status: number;
  reason: string;
}

interface MixedContent {
  url: string;
  type: string;
  severity: string;
}

interface LinkAuditData {
  url: string;
  totalLinks: number;
  brokenLinks: BrokenLink[];
  mixedContent: MixedContent[];
  internalLinks: number;
  externalLinks: number;
  score: number;
}

const LinkAuditCard = (props: { data: LinkAuditData, title?: string, actionButtons?: any, refCode?: string }): JSX.Element => {
  const { data } = props;

  if (!data) return <Card heading={props.title || "Link & Content Auditor"} refCode={props.refCode}>Chargement...</Card>;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#eab308';
    return '#ef4444';
  };

  return (
    <Card heading={props.title || "Link & Content Audit (SEO & Quality)"} actionButtons={props.actionButtons} refCode={props.refCode}>
      <Container>
        <StatsGrid>
          <StatCard color={getScoreColor(data.score)}>
            <div className="value">{data.score}/100</div>
            <div className="label">Health Score</div>
          </StatCard>
          <StatCard>
            <div className="value">{data.totalLinks}</div>
            <div className="label">Total Links</div>
          </StatCard>
          <StatCard color={data.brokenLinks.length > 0 ? '#ef4444' : '#22c55e'}>
            <div className="value">{data.brokenLinks.length}</div>
            <div className="label">Broken Links</div>
          </StatCard>
          <StatCard color={data.mixedContent.length > 0 ? '#eab308' : '#22c55e'}>
            <div className="value">{data.mixedContent.length}</div>
            <div className="label">Mixed Content</div>
          </StatCard>
        </StatsGrid>

        <Section>
          <h3>🔗 Broken Links (404/Errors)</h3>
          {data.brokenLinks.length === 0 ? (
            <EmptyState>✅ No broken links found on homepage.</EmptyState>
          ) : (
            <IssueList>
              {data.brokenLinks.map((link, idx) => (
                <IssueItem key={idx} type="broken">
                  <span className="url">{link.url}</span>
                  <span className="badge">{link.status === 0 ? 'Network Error' : `${link.status} ${link.reason}`}</span>
                </IssueItem>
              ))}
            </IssueList>
          )}
        </Section>

        <Section>
          <h3>🔒 Mixed Content (HTTP on HTTPS)</h3>
          {data.mixedContent.length === 0 ? (
            <EmptyState>✅ All resources are loaded securely (HTTPS).</EmptyState>
          ) : (
            <IssueList>
              {data.mixedContent.map((item, idx) => (
                <IssueItem key={idx} type="mixed">
                  <span className="url">{item.url}</span>
                  <span className="badge">{item.type}</span>
                </IssueItem>
              ))}
            </IssueList>
          )}
        </Section>
      </Container>
    </Card>
  );
};

export default LinkAuditCard;



