import React, { useState } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryBanner = styled.div<{ riskLevel: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: ${colors.backgroundLighter};
  border-radius: 12px;
  border: 1px solid ${colors.borderColor};
  border-left: 6px solid ${props => {
    switch (props.riskLevel) {
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

const ScoreInfo = styled.div`
  flex: 1;
`;

const RiskTitle = styled.h3<{ riskLevel: string }>`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 800;
  color: ${props => {
    switch (props.riskLevel) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#3b82f6';
      default: return '#22c55e';
    }
  }};
`;

const StatsGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const StatPill = styled.div<{ severity: string; active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? colors.background : 'transparent'};
  border: 1px solid ${props => props.active ? colors.borderColor : 'transparent'};

  &:hover {
    background: ${colors.background};
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => {
      switch (props.severity) {
        case 'critical': return '#ef4444';
        case 'high': return '#f97316';
        case 'medium': return '#eab308';
        case 'low': return '#3b82f6';
        default: return '#94a3b8';
      }
    }};
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: ${colors.textColorSecondary};
    text-transform: capitalize;
  }

  .count {
    font-size: 16px;
    font-weight: 700;
    color: ${colors.textColor};
  }
`;

const TechStackSection = styled.div`
  margin-top: 8px;
  padding: 0 4px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: ${colors.textColorSecondary};
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tech-tag {
    background: #f0f9ff;
    color: #0284c7;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #bae6fd;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const VulnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VulnItem = styled.div<{ severity: string; expanded: boolean }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      case 'info': return '#94a3b8';
      default: return colors.borderColor;
    }
  }};

  .header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    background: ${props => props.expanded ? colors.background : 'transparent'};

    &:hover {
      background: ${colors.background};
    }
  }

  .content {
    padding: 0 16px 16px 16px;
    display: ${props => props.expanded ? 'block' : 'none'};
    border-top: 1px solid ${colors.borderColor};
    margin-top: ${props => props.expanded ? '0' : '-1px'};
    background: ${colors.backgroundLighter};
  }

  h4 {
    margin: 0;
    font-size: 15px;
    color: ${colors.textColor};
    flex: 1;
    font-weight: 600;
  }
`;

const Badges = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Badge = styled.span<{ type?: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  
  background: ${props => {
    if (props.type === 'category') return '#f3f4f6';
    if (props.type === 'effort') return '#ecfccb';
    return '#e5e7eb';
  }};
  
  color: ${props => {
    if (props.type === 'category') return '#374151';
    if (props.type === 'effort') return '#365314';
    return '#374151';
  }};
  
  border: 1px solid ${props => {
    if (props.type === 'category') return '#d1d5db';
    if (props.type === 'effort') return '#d9f99d';
    return '#d1d5db';
  }};
`;

const Description = styled.p`
  margin: 16px 0;
  font-size: 14px;
  color: ${colors.textColorSecondary};
  line-height: 1.6;
`;

const SolutionBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;

  strong {
    color: #15803d;
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #166534;
    line-height: 1.5;
  }
`;

interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation?: string;
  effort?: 'Low' | 'Medium' | 'High';
  category?: string;
}

interface VulnerabilitiesCardProps {
  data: {
    vulnerabilities?: Vulnerability[];
    technologies?: string[];
    summary?: {
      totalVulnerabilities: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
    securityScore?: number;
    riskLevel?: string;
    error?: string;
  };
  title: string;
  actionButtons?: any;
  refCode?: string;
}

const VulnerabilitiesCard: React.FC<VulnerabilitiesCardProps> = ({ data, title, actionButtons, refCode }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (data?.error) {
    return (
      <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textColorSecondary }}>
          <h3>Analyse indisponible</h3>
          <p>{data.error}</p>
        </div>
      </Card>
    );
  }

  const vulnerabilities = data?.vulnerabilities || [];
  const summary = data?.summary || { totalVulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const technologies = data?.technologies || [];
  
  // Determine display risk level if not provided
  let displayRisk = data?.riskLevel;
  if (!displayRisk) {
    if (summary.critical > 0) displayRisk = 'Critical';
    else if (summary.high > 0) displayRisk = 'High';
    else if (summary.medium > 2) displayRisk = 'Medium';
    else if (summary.medium > 0 || summary.low > 2) displayRisk = 'Low';
    else displayRisk = 'Minimal';
  }

  const filteredVulns = vulnerabilities.filter(v => 
    activeTab === 'all' ? true : v.severity === activeTab
  );

  // Sort by severity order
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  filteredVulns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const getRiskTranslation = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      case 'minimal': return 'Minimal';
      default: return risk;
    }
  };

  return (
    <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
      <Container>
        <SummaryBanner riskLevel={displayRisk || 'Minimal'}>
          <ScoreInfo>
            <div style={{ fontSize: '13px', color: colors.textColorSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Niveau de Risque
            </div>
            <RiskTitle riskLevel={displayRisk || 'Minimal'}>
              {getRiskTranslation(displayRisk || 'Minimal')}
            </RiskTitle>
          </ScoreInfo>
          
          <StatsGroup>
            <StatPill 
              severity="critical" 
              active={activeTab === 'critical'}
              onClick={() => setActiveTab(activeTab === 'critical' ? 'all' : 'critical')}
            >
              <div className="dot" />
              <span className="label">Critique</span>
              <span className="count">{summary.critical}</span>
            </StatPill>
            <StatPill 
              severity="high" 
              active={activeTab === 'high'}
              onClick={() => setActiveTab(activeTab === 'high' ? 'all' : 'high')}
            >
              <div className="dot" />
              <span className="label">Élevé</span>
              <span className="count">{summary.high}</span>
            </StatPill>
            <StatPill 
              severity="medium" 
              active={activeTab === 'medium'}
              onClick={() => setActiveTab(activeTab === 'medium' ? 'all' : 'medium')}
            >
              <div className="dot" />
              <span className="label">Moyen</span>
              <span className="count">{summary.medium}</span>
            </StatPill>
            <StatPill 
              severity="low" 
              active={activeTab === 'low'}
              onClick={() => setActiveTab(activeTab === 'low' ? 'all' : 'low')}
            >
              <div className="dot" />
              <span className="label">Faible</span>
              <span className="count">{summary.low}</span>
            </StatPill>
          </StatsGroup>
        </SummaryBanner>

        {technologies.length > 0 && (
          <TechStackSection>
            <h4>Technologies Détectées</h4>
            <div className="tech-tags">
              {technologies.map((tech, i) => (
                <span key={i} className="tech-tag">
                  <span style={{ fontSize: '14px' }}>⚡</span> {tech}
                </span>
              ))}
            </div>
          </TechStackSection>
        )}

        <VulnList>
          {filteredVulns.length > 0 ? (
            filteredVulns.map((vuln, index) => (
              <VulnItem 
                key={index} 
                severity={vuln.severity} 
                expanded={expandedItems.has(index)}
              >
                <div className="header" onClick={() => toggleExpand(index)}>
                  <h4>{vuln.title}</h4>
                  <Badges>
                    {vuln.category && <Badge type="category">{vuln.category}</Badge>}
                    <Badge>{vuln.severity}</Badge>
                    <span style={{ transform: expandedItems.has(index) ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: colors.textColorSecondary }}>▼</span>
                  </Badges>
                </div>
                <div className="content">
                  <Description>{vuln.description}</Description>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {vuln.effort && (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: colors.textColorSecondary }}>Effort de correction: </span>
                        <Badge type="effort">{vuln.effort}</Badge>
                      </div>
                    )}
                  </div>

                  {vuln.recommendation && (
                    <SolutionBox>
                      <strong>💡 Solution Recommandée</strong>
                      <p>{vuln.recommendation}</p>
                    </SolutionBox>
                  )}
                </div>
              </VulnItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.textColorSecondary, background: colors.backgroundLighter, borderRadius: '8px', border: `1px dashed ${colors.borderColor}` }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.7 }}>🛡️</div>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {activeTab === 'all' 
                  ? 'Aucune vulnérabilité détectée. Votre site semble sécurisé.' 
                  : `Aucune vulnérabilité de niveau ${activeTab} détectée.`}
              </p>
            </div>
          )}
        </VulnList>
      </Container>
    </Card>
  );
};

export default VulnerabilitiesCard;
