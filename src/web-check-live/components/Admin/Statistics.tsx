import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div<{ variant: string }>`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      switch (props.variant) {
        case 'primary': return 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)';
        case 'danger': return 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
        case 'warning': return 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
        case 'success': return 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
        case 'info': return 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)';
        default: return colors.primary;
      }
    }};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div<{ variant: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: white;
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'danger': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'success': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'info': return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textColor};
  line-height: 1;
`;

const StatUnit = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textColorSecondary};
  margin-left: 6px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 8px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.span<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch (props.variant) {
      case 'history': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'types': return 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
      case 'recent': return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

const ChartCard = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 20px;
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BarLabel = styled.div`
  width: 100px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 24px;
  background: ${colors.backgroundDarker};
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 6px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: ${props => props.width > 0 ? '40px' : '0'};
`;

const BarValue = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: white;
`;

const HistoryChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  padding: 10px 0;
`;

const HistoryBar = styled.div<{ height: number; active?: boolean }>`
  flex: 1;
  min-width: 20px;
  height: ${props => props.height}%;
  min-height: 4px;
  background: ${props => props.active 
    ? 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)'
    : 'linear-gradient(180deg, #6b7280 0%, #4b5563 100%)'};
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
    transform: scaleY(1.05);
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.backgroundDarker};
    color: ${colors.textColor};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    margin-bottom: 4px;
    border: 1px solid ${colors.borderColor};
  }
`;

const HistoryLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10px;
  color: ${colors.textColorSecondary};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
`;

const LoadingIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  background: ${colors.background};
  border: 1px solid ${colors.danger};
  border-radius: 12px;
`;

const ErrorIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: white;
`;

const ErrorText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.danger};
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textColorSecondary};
  font-size: 13px;
`;

// Types
interface StatisticsData {
  totalScans: number;
  criticalIssues: number;
  warningIssues: number;
  dpdUsers: number;
  scansPerUser: number;
  scanHistory: Array<{ date: string; scans: number }>;
  issuesByType: {
    critical: number;
    warnings: number;
    improvements: number;
  };
}

const Statistics = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatisticsData | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération des statistiques');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <LoadingState>
        <LoadingIcon>STAT</LoadingIcon>
        <LoadingText>Chargement des statistiques...</LoadingText>
      </LoadingState>
    );
  }

  if (error) {
    return (
      <ErrorState>
        <ErrorIcon>ERR</ErrorIcon>
        <ErrorText>{error}</ErrorText>
        <RetryButton onClick={fetchStatistics}>Réessayer</RetryButton>
      </ErrorState>
    );
  }

  if (!stats) {
    return (
      <EmptyState>Aucune statistique disponible</EmptyState>
    );
  }

  // Calculate percentages for bar chart
  const totalIssues = stats.issuesByType.critical + stats.issuesByType.warnings + stats.issuesByType.improvements;
  const criticalPercent = totalIssues > 0 ? (stats.issuesByType.critical / totalIssues) * 100 : 0;
  const warningsPercent = totalIssues > 0 ? (stats.issuesByType.warnings / totalIssues) * 100 : 0;
  const improvementsPercent = totalIssues > 0 ? (stats.issuesByType.improvements / totalIssues) * 100 : 0;

  // Calculate max scans for history chart
  const maxScans = Math.max(...stats.scanHistory.map(h => h.scans), 1);

  return (
    <Container>
      {/* Summary Stats */}
      <StatsGrid>
        <StatCard variant="primary">
          <StatHeader>
            <StatIcon variant="primary">SCAN</StatIcon>
            <StatInfo>
              <StatLabel>Total Analyses</StatLabel>
              <StatValue>
                {stats.totalScans.toLocaleString()}
                <StatUnit>scans</StatUnit>
              </StatValue>
            </StatInfo>
          </StatHeader>
        </StatCard>

        <StatCard variant="danger">
          <StatHeader>
            <StatIcon variant="danger">CRIT</StatIcon>
            <StatInfo>
              <StatLabel>Problèmes Critiques</StatLabel>
              <StatValue>
                {stats.criticalIssues.toLocaleString()}
              </StatValue>
            </StatInfo>
          </StatHeader>
        </StatCard>

        <StatCard variant="warning">
          <StatHeader>
            <StatIcon variant="warning">WARN</StatIcon>
            <StatInfo>
              <StatLabel>Avertissements</StatLabel>
              <StatValue>
                {stats.warningIssues.toLocaleString()}
              </StatValue>
            </StatInfo>
          </StatHeader>
        </StatCard>

        <StatCard variant="success">
          <StatHeader>
            <StatIcon variant="success">USR</StatIcon>
            <StatInfo>
              <StatLabel>Utilisateurs DPD</StatLabel>
              <StatValue>
                {stats.dpdUsers.toLocaleString()}
              </StatValue>
            </StatInfo>
          </StatHeader>
        </StatCard>

        <StatCard variant="info">
          <StatHeader>
            <StatIcon variant="info">AVG</StatIcon>
            <StatInfo>
              <StatLabel>Moyenne / Utilisateur</StatLabel>
              <StatValue>
                {stats.scansPerUser.toFixed(1)}
              </StatValue>
            </StatInfo>
          </StatHeader>
        </StatCard>
      </StatsGrid>

      {/* Charts Section */}
      <ChartSection>
        {/* Scan History */}
        <ChartCard>
          <ChartTitle>
            <SectionIcon variant="history">HIST</SectionIcon>
            Historique des Analyses (30 jours)
          </ChartTitle>
          {stats.scanHistory.length > 0 ? (
            <>
              <HistoryChart>
                {stats.scanHistory.map((item, index) => (
                  <HistoryBar
                    key={index}
                    height={(item.scans / maxScans) * 100}
                    active={index === stats.scanHistory.length - 1}
                    data-tooltip={`${item.date}: ${item.scans} scans`}
                  />
                ))}
              </HistoryChart>
              <HistoryLabels>
                <span>{stats.scanHistory[0]?.date || ''}</span>
                <span>{stats.scanHistory[stats.scanHistory.length - 1]?.date || ''}</span>
              </HistoryLabels>
            </>
          ) : (
            <EmptyState>Aucune donnée d'historique</EmptyState>
          )}
        </ChartCard>

        {/* Issues by Type */}
        <ChartCard>
          <ChartTitle>
            <SectionIcon variant="types">TYPE</SectionIcon>
            Répartition des Problèmes
          </ChartTitle>
          <BarChart>
            <BarItem>
              <BarLabel>Critiques</BarLabel>
              <BarTrack>
                <BarFill width={criticalPercent} color="linear-gradient(90deg, #dc2626 0%, #ef4444 100%)">
                  {stats.issuesByType.critical > 0 && <BarValue>{stats.issuesByType.critical}</BarValue>}
                </BarFill>
              </BarTrack>
            </BarItem>
            <BarItem>
              <BarLabel>Avertissements</BarLabel>
              <BarTrack>
                <BarFill width={warningsPercent} color="linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)">
                  {stats.issuesByType.warnings > 0 && <BarValue>{stats.issuesByType.warnings}</BarValue>}
                </BarFill>
              </BarTrack>
            </BarItem>
            <BarItem>
              <BarLabel>Améliorations</BarLabel>
              <BarTrack>
                <BarFill width={improvementsPercent} color="linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)">
                  {stats.issuesByType.improvements > 0 && <BarValue>{stats.issuesByType.improvements}</BarValue>}
                </BarFill>
              </BarTrack>
            </BarItem>
          </BarChart>
          <div style={{ marginTop: '16px', fontSize: '12px', color: colors.textColorSecondary, textAlign: 'center' }}>
            Total: {totalIssues.toLocaleString()} problèmes détectés
          </div>
        </ChartCard>
      </ChartSection>
    </Container>
  );
};

export default Statistics;
