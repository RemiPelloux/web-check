import { useState } from 'react';
import { Card } from 'web-check-live/components/Form/Card';
import { ExpandableRow } from 'web-check-live/components/Form/Row';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';
import styled from '@emotion/styled';

// --- Styled Components ---

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.color || colors.textColor};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const RiskGauge = styled.div<{ score: number }>`
  width: 100%;
  height: 8px;
  background: ${colors.backgroundDarker};
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => (props.score / 6) * 100}%;
    background: ${props => {
    if (props.score <= 2) return colors.danger;
    if (props.score <= 4) return colors.warning;
    return colors.success;
  }};
    transition: width 0.5s ease-in-out;
  }
`;

const CategoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const CategoryTag = styled.span<{ category: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch (props.category.toLowerCase()) {
      case 'session': return colors.info;
      case 'authentication': return colors.primary;
      case 'tracking': return colors.warning;
      case 'advertising': return colors.error;
      case 'functional': return colors.success;
      case 'security': return colors.primaryDarker;
      default: return colors.neutral;
    }
  }};
`;

const ComplianceBlock = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-left: 4px solid ${colors.info};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const IssueBlock = styled(ComplianceBlock)`
  border-left-color: ${colors.danger};
  background: rgba(255, 0, 0, 0.02);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${colors.borderColor};
  overflow-x: auto;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : colors.textColorSecondary};
  border: 1px solid ${props => props.active ? colors.primary : colors.borderColor};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? colors.primary : colors.backgroundLighter};
  }
`;

// --- Helper Functions ---

const getSecurityLevel = (score: number) => {
  if (score <= 2) return { label: 'Critical Risk', color: colors.danger };
  if (score <= 4) return { label: 'Medium Risk', color: colors.warning };
  return { label: 'Secure', color: colors.success };
};

const formatCookieValue = (value: string): string => {
  if (!value) return 'N/A';
  if (value.length > 60) return value.substring(0, 60) + '...';
  return value;
};

// --- Main Component ---

const CookiesCard = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const { headerCookies = [], clientCookies = [], analysis, summary } = props.data;
  const [filter, setFilter] = useState<'all' | 'header' | 'client' | 'secure' | 'insecure'>('all');

  if (!summary || summary.total === 0) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons}>
        <div style={{ textAlign: 'center', padding: '2rem', color: colors.textColorSecondary }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🍪</span>
          No cookies detected. This site is clean!
        </div>
      </Card>
    );
  }

  const allCookies = [
    ...headerCookies.map((c: any) => ({ ...c, source: 'header' })),
    ...clientCookies.map((c: any) => ({ ...c, source: 'client' }))
  ];

  const filteredCookies = allCookies.filter(cookie => {
    if (filter === 'all') return true;
    if (filter === 'header') return cookie.source === 'header';
    if (filter === 'client') return cookie.source === 'client';
    if (filter === 'secure') return cookie.security?.secure && cookie.security?.httpOnly;
    if (filter === 'insecure') return !cookie.security?.secure || !cookie.security?.httpOnly;
    return true;
  });

  const securityStatus = getSecurityLevel(summary.securityScore);

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      <DashboardContainer>

        {/* Summary Section */}
        <SummarySection>
          <StatCard>
            <StatValue color={colors.primary}>{summary.total}</StatValue>
            <StatLabel>Total Cookies</StatLabel>
            <CategoryGrid>
              <CategoryTag category="header">Server: {summary.bySource.header}</CategoryTag>
              <CategoryTag category="client">Client: {summary.bySource.client}</CategoryTag>
            </CategoryGrid>
          </StatCard>

          <StatCard>
            <StatValue color={securityStatus.color}>{summary.securityScore}/6</StatValue>
            <StatLabel>Security Score</StatLabel>
            <RiskGauge score={summary.securityScore} />
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: securityStatus.color, fontWeight: 'bold' }}>
              {securityStatus.label}
            </div>
          </StatCard>

          <StatCard>
            <StatValue>{Object.keys(summary.byCategory).length}</StatValue>
            <StatLabel>Categories</StatLabel>
            <CategoryGrid>
              {Object.entries(summary.byCategory).map(([cat, count]) => (
                <CategoryTag key={cat} category={cat}>{cat}: {count as number}</CategoryTag>
              ))}
            </CategoryGrid>
          </StatCard>
        </SummarySection>

        {/* Analysis & Compliance */}
        {(analysis?.securityIssues?.length > 0 || analysis?.recommendations?.length > 0) && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>Assessment Summary</Heading>

            {analysis?.securityIssues?.length > 0 && (
              <IssueBlock>
                <div style={{ fontWeight: 'bold', color: colors.danger, marginBottom: '0.5rem' }}>⚠️ Security Issues Detected</div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.textColorSecondary }}>
                  {analysis.securityIssues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </IssueBlock>
            )}

            {analysis?.recommendations?.length > 0 && (
              <ComplianceBlock>
                <div style={{ fontWeight: 'bold', color: colors.info, marginBottom: '0.5rem' }}>💡 Recommendations</div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.textColorSecondary }}>
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </ComplianceBlock>
            )}
          </div>
        )}

        {/* Cookie List with Filters */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Heading as="h3" size="small" color={colors.textColor}>Detailed Cookie Inventory</Heading>
            <span style={{ fontSize: '0.8rem', color: colors.textColorSecondary }}>
              Showing {filteredCookies.length} of {allCookies.length}
            </span>
          </div>

          <FilterBar>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
            <FilterButton active={filter === 'header'} onClick={() => setFilter('header')}>Server-Side</FilterButton>
            <FilterButton active={filter === 'client'} onClick={() => setFilter('client')}>Client-Side</FilterButton>
            <FilterButton active={filter === 'secure'} onClick={() => setFilter('secure')}>Secure</FilterButton>
            <FilterButton active={filter === 'insecure'} onClick={() => setFilter('insecure')}>Insecure</FilterButton>
          </FilterBar>

          {filteredCookies.map((cookie: any, index: number) => {
            const attributes = [];

            // Security Attributes
            if (cookie.security) {
              attributes.push({
                lbl: 'Security',
                val: `${cookie.security.httpOnly ? '🔒 HttpOnly' : '🔓 No HttpOnly'} | ${cookie.security.secure ? '🔒 Secure' : '🔓 Not Secure'} | SameSite: ${cookie.security.sameSite || 'None'}`
              });
            }

            // Standard Attributes
            ['domain', 'path', 'expires', 'size'].forEach(prop => {
              if (cookie[prop] !== undefined) {
                attributes.push({ lbl: prop.charAt(0).toUpperCase() + prop.slice(1), val: cookie[prop].toString() });
              } else if (cookie.security && cookie.security[prop]) {
                attributes.push({ lbl: prop.charAt(0).toUpperCase() + prop.slice(1), val: cookie.security[prop].toString() });
              }
            });

            // Custom Attributes
            if (cookie.attributes) {
              Object.entries(cookie.attributes).forEach(([key, value]) => {
                if (!['HttpOnly', 'Secure', 'SameSite', 'Domain', 'Path'].includes(key)) {
                  attributes.push({ lbl: key, val: value as string });
                }
              });
            }

            return (
              <div key={`${cookie.source}-${index}`} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', alignItems: 'center' }}>
                  <CategoryTag category={cookie.source === 'header' ? 'security' : 'functional'}>
                    {cookie.source === 'header' ? 'Server' : 'Client'}
                  </CategoryTag>
                  {cookie.categories?.map((cat: string) => (
                    <CategoryTag key={cat} category={cat}>{cat}</CategoryTag>
                  ))}
                </div>
                <ExpandableRow
                  lbl={cookie.name}
                  val={formatCookieValue(cookie.value)}
                  rowList={attributes}
                />
              </div>
            );
          })}
        </div>

      </DashboardContainer>
    </Card>
  );
};

export default CookiesCard;
