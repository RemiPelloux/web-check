import { Card } from 'web-check-live/components/Form/Card';
import { ExpandableRow, Row } from 'web-check-live/components/Form/Row';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';
import styled from '@emotion/styled';

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const SummaryCard = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const SecurityBadge = styled.span<{ level: 'high' | 'medium' | 'low' | 'critical' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch (props.level) {
      case 'critical': return colors.danger;
      case 'low': return colors.error;
      case 'medium': return colors.warning;
      case 'high': return colors.success;
      default: return colors.neutral;
    }
  }};
`;

const CategoryBadge = styled.span<{ category: string }>`
  padding: 0.2rem 0.4rem;
  margin: 0.1rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
  display: inline-block;
  background: ${props => {
    switch (props.category) {
      case 'session': return colors.info;
      case 'authentication': return colors.primary;
      case 'tracking': return colors.warning;
      case 'advertising': return colors.error;
      case 'functional': return colors.success;
      case 'security': return colors.primaryDarker;
      case 'performance': return colors.neutral;
      default: return colors.textColorThirdly;
    }
  }};
`;

const IssuesList = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  li {
    margin: 0.25rem 0;
    color: ${colors.error};
    font-size: 0.9rem;
  }
`;

const RecommendationsList = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  li {
    margin: 0.25rem 0;
    color: ${colors.info};
    font-size: 0.9rem;
  }
`;

const getSecurityLevel = (score: number): 'critical' | 'low' | 'medium' | 'high' => {
  if (score <= 1) return 'critical';
  if (score <= 3) return 'low';
  if (score <= 5) return 'medium';
  return 'high';
};

const formatCookieValue = (value: string): string => {
  if (!value) return 'N/A';
  if (value.length > 50) {
    return value.substring(0, 50) + '...';
  }
  return value;
};

const CookiesCard = (props: { data: any, title: string, actionButtons: any}): JSX.Element => {
  const { headerCookies = [], clientCookies = [], analysis, summary } = props.data;
  
  if (!summary || summary.total === 0) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons}>
        <p>No cookies detected</p>
      </Card>
    );
  }

  const allCookies = [...headerCookies, ...clientCookies];
  
  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      {/* Summary Overview */}
      <Heading as="h3" size="small" color={colors.primary}>Cookie Assessment Summary</Heading>
      <SummaryGrid>
        <SummaryCard>
          <h4>Total Cookies</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.primary }}>
            {summary.total}
          </p>
        </SummaryCard>
        <SummaryCard>
          <h4>Security Score</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            <SecurityBadge level={getSecurityLevel(summary.securityScore)}>
              {summary.securityScore}/6
            </SecurityBadge>
          </p>
        </SummaryCard>
        <SummaryCard>
          <h4>Sources</h4>
          <p>Header: {summary.bySource.header}</p>
          <p>Client: {summary.bySource.client}</p>
        </SummaryCard>
        <SummaryCard>
          <h4>Categories</h4>
          <div>
            {Object.entries(summary.byCategory).map(([category, count]) => (
              <div key={category}>
                <CategoryBadge category={category}>
                  {category}: {count as number}
                </CategoryBadge>
              </div>
            ))}
          </div>
        </SummaryCard>
      </SummaryGrid>

      {/* Security Issues */}
      {analysis?.securityIssues && analysis.securityIssues.length > 0 && (
        <>
          <Heading as="h3" size="small" color={colors.error}>Security Issues</Heading>
          <IssuesList>
            {analysis.securityIssues.map((issue: string, index: number) => (
              <li key={`issue-${index}`}>{issue}</li>
            ))}
          </IssuesList>
        </>
      )}

      {/* Recommendations */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <>
          <Heading as="h3" size="small" color={colors.info}>Compliance Recommendations</Heading>
          <RecommendationsList>
            {analysis.recommendations.map((rec: string, index: number) => (
              <li key={`rec-${index}`}>{rec}</li>
            ))}
          </RecommendationsList>
        </>
      )}

      {/* Detailed Cookie Information */}
      <Heading as="h3" size="small" color={colors.primary}>Detailed Cookie Analysis</Heading>
      
      {/* Header Cookies */}
      {headerCookies.length > 0 && (
        <>
          <Heading as="h4" size="small" color={colors.primaryDarker}>Server-Set Cookies (HTTP Headers)</Heading>
          {headerCookies.map((cookie: any, index: number) => {
            const securityAttributes = [];
            const cookieAttributes = [];
            
            if (cookie.security) {
              if (cookie.security.httpOnly) securityAttributes.push({ lbl: 'HttpOnly', val: '✅ Yes' });
              else securityAttributes.push({ lbl: 'HttpOnly', val: '❌ No (XSS Risk)' });
              
              if (cookie.security.secure) securityAttributes.push({ lbl: 'Secure', val: '✅ Yes' });
              else securityAttributes.push({ lbl: 'Secure', val: '❌ No (HTTP Risk)' });
              
              securityAttributes.push({ 
                lbl: 'SameSite', 
                val: cookie.security.sameSite === 'none' ? '❌ None (CSRF Risk)' : `✅ ${cookie.security.sameSite}` 
              });
              
              securityAttributes.push({ 
                lbl: 'Type', 
                val: cookie.security.isSession ? 'Session Cookie' : 'Persistent Cookie' 
              });
              
              if (cookie.security.domain) {
                securityAttributes.push({ lbl: 'Domain', val: cookie.security.domain });
              }
              
              securityAttributes.push({ lbl: 'Path', val: cookie.security.path });
              
              securityAttributes.push({ 
                lbl: 'Security Score', 
                val: `${cookie.security.securityScore}/6` 
              });
            }

            // Add original attributes
            if (cookie.attributes) {
              Object.entries(cookie.attributes).forEach(([key, value]) => {
                if (!['HttpOnly', 'Secure', 'SameSite', 'Domain', 'Path'].includes(key)) {
                  cookieAttributes.push({ lbl: key, val: value as string });
                }
              });
            }

            const allAttributes = [...securityAttributes, ...cookieAttributes];
            
            return (
              <div key={`header-cookie-${index}`} style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {cookie.categories && cookie.categories.map((category: string) => (
                    <CategoryBadge key={category} category={category}>
                      {category}
                    </CategoryBadge>
                  ))}
                  {cookie.security && (
                    <SecurityBadge level={getSecurityLevel(cookie.security.securityScore)}>
                      Security: {cookie.security.securityScore}/6
                    </SecurityBadge>
                  )}
                </div>
                <ExpandableRow 
                  key={`cookie-${index}`} 
                  lbl={cookie.name} 
                  val={formatCookieValue(cookie.value)} 
                  rowList={allAttributes} 
                />
              </div>
            );
          })}
        </>
      )}

      {/* Client Cookies */}
      {clientCookies.length > 0 && (
        <>
          <Heading as="h4" size="small" color={colors.primaryDarker}>Client-Side Cookies (Browser)</Heading>
          {clientCookies.map((cookie: any, index: number) => {
            const cookieDetails = [];
            
            // Add security analysis
            if (cookie.security) {
              cookieDetails.push({ lbl: 'HttpOnly', val: cookie.security.httpOnly ? '✅ Yes' : '❌ No' });
              cookieDetails.push({ lbl: 'Secure', val: cookie.security.secure ? '✅ Yes' : '❌ No' });
              cookieDetails.push({ lbl: 'SameSite', val: cookie.security.sameSite || 'Not set' });
              cookieDetails.push({ lbl: 'Type', val: cookie.security.isSession ? 'Session' : 'Persistent' });
              cookieDetails.push({ lbl: 'Security Score', val: `${cookie.security.securityScore}/6` });
            }
            
            // Add other cookie properties
            ['domain', 'path', 'expires', 'size'].forEach(prop => {
              if (cookie[prop] !== undefined) {
                cookieDetails.push({ 
                  lbl: prop.charAt(0).toUpperCase() + prop.slice(1), 
                  val: cookie[prop].toString() 
                });
              }
            });

            return (
              <div key={`client-cookie-${index}`} style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {cookie.categories && cookie.categories.map((category: string) => (
                    <CategoryBadge key={category} category={category}>
                      {category}
                    </CategoryBadge>
                  ))}
                  {cookie.security && (
                    <SecurityBadge level={getSecurityLevel(cookie.security.securityScore)}>
                      Security: {cookie.security.securityScore}/6
                    </SecurityBadge>
                  )}
                </div>
                <ExpandableRow 
                  key={`client-cookie-${index}`} 
                  lbl={cookie.name} 
                  val={formatCookieValue(cookie.value)} 
                  rowList={cookieDetails} 
                />
              </div>
            );
          })}
        </>
      )}
    </Card>
  );
};

export default CookiesCard;
