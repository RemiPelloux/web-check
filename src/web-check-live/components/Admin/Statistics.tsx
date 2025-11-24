import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ variant?: 'primary' | 'danger' | 'warning' | 'success' | 'info' }>`
  background: ${colors.background};
  border: 1px solid ${({ variant }) => {
    if (variant === 'danger') return 'rgba(220, 38, 38, 0.2)';
    if (variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    if (variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (variant === 'info') return 'rgba(59, 130, 246, 0.2)';
    return colors.borderColor;
  }};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ variant }) => {
      if (variant === 'danger') return 'rgba(220, 38, 38, 0.4)';
      if (variant === 'warning') return 'rgba(245, 158, 11, 0.4)';
      if (variant === 'success') return 'rgba(16, 185, 129, 0.4)';
      if (variant === 'info') return 'rgba(59, 130, 246, 0.4)';
      return colors.borderColor;
    }};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatValue = styled.div<{ variant?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.textColor};
  display: flex;
  align-items: baseline;
  gap: 8px;
  position: relative;
  z-index: 1;
  line-height: 1;
`;

const StatUnit = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textColorSecondary};
`;

const StatIcon = styled.div<{ variant?: string }>`
  font-size: 20px;
  opacity: 0.8;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ variant }) => {
    if (variant === 'danger') return 'rgba(220, 38, 38, 0.1)';
    if (variant === 'warning') return 'rgba(245, 158, 11, 0.1)';
    if (variant === 'success') return 'rgba(16, 185, 129, 0.1)';
    if (variant === 'info') return 'rgba(59, 130, 246, 0.1)';
    return 'rgba(220, 38, 38, 0.1)';
  }};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: linear-gradient(135deg, ${colors.backgroundLighter} 0%, ${colors.backgroundDarker} 100%);
  border: 2px solid ${colors.borderColor};
  border-radius: 16px;
  padding: 28px;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.12);
  }
`;

const ChartTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  color: ${colors.textColor};
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${colors.borderColor};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: ${colors.primary};
  }

  span:first-of-type {
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${colors.textColorSecondary};
  font-size: 18px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  &::before {
    content: '📊';
    font-size: 64px;
    display: block;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${colors.danger};
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, ${colors.backgroundLighter} 0%, ${colors.backgroundDarker} 100%);
  border: 2px solid ${colors.danger};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &::before {
    content: '❌';
    font-size: 64px;
    display: block;
  }
`;

interface StatisticsData {
  totalScans: number;
  criticalIssues: number;
  warningIssues: number;
  dpdUsers: number;
  scansPerUser: number;
  scanHistory: Array<{
    date: string;
    scans: number;
  }>;
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

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch('/api/admin/statistics', {
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

  if (loading) {
    return <LoadingState>Chargement des statistiques...</LoadingState>;
  }

  if (error || !stats) {
    return <ErrorState>❌ {error || 'Impossible de charger les statistiques'}</ErrorState>;
  }

  // Prepare chart data
  const scanHistoryData = {
    labels: stats.scanHistory.map(item => item.date),
    datasets: [
      {
        label: 'Analyses effectuées',
        data: stats.scanHistory.map(item => item.scans),
        fill: true,
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgb(220, 38, 38)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const issuesData = {
    labels: ['Critiques', 'Avertissements', 'Améliorations'],
    datasets: [
      {
        label: 'Nombre de problèmes',
        data: [
          stats.issuesByType.critical,
          stats.issuesByType.warnings,
          stats.issuesByType.improvements
        ],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgb(220, 38, 38)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const distributionData = {
    labels: ['Problèmes Critiques', 'Avertissements', 'Améliorations'],
    datasets: [
      {
        data: [
          stats.issuesByType.critical,
          stats.issuesByType.warnings,
          stats.issuesByType.improvements
        ],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: colors.background,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: colors.textColor,
          font: {
            size: 12,
            weight: '500' as const
          },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: colors.backgroundDarker,
        titleColor: colors.textColor,
        bodyColor: colors.textColorSecondary,
        borderColor: colors.borderColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: colors.textColorSecondary,
          font: {
            size: 11
          }
        },
        grid: {
          color: colors.borderColor
        }
      },
      x: {
        ticks: {
          color: colors.textColorSecondary,
          font: {
            size: 11
          }
        },
        grid: {
          color: colors.borderColor
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: colors.textColor,
          font: {
            size: 12,
            weight: '500' as const
          },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: colors.backgroundDarker,
        titleColor: colors.textColor,
        bodyColor: colors.textColorSecondary,
        borderColor: colors.borderColor,
        borderWidth: 1,
        padding: 12
      }
    }
  };

  return (
    <StatsContainer>
      {/* Summary Cards */}
      <StatsGrid>
        <StatCard variant="primary">
          <StatIcon variant="primary">📊</StatIcon>
          <StatLabel>Total Analyses</StatLabel>
          <StatValue variant="primary">
            {stats.totalScans.toLocaleString()}
            <StatUnit>scans</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard variant="danger">
          <StatIcon variant="danger">🔴</StatIcon>
          <StatLabel>Problèmes Critiques</StatLabel>
          <StatValue variant="danger">
            {stats.criticalIssues.toLocaleString()}
            <StatUnit>trouvés</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard variant="warning">
          <StatIcon variant="warning">⚠️</StatIcon>
          <StatLabel>Avertissements</StatLabel>
          <StatValue variant="warning">
            {stats.warningIssues.toLocaleString()}
            <StatUnit>détectés</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard variant="success">
          <StatIcon variant="success">👥</StatIcon>
          <StatLabel>Utilisateurs DPD</StatLabel>
          <StatValue variant="success">
            {stats.dpdUsers.toLocaleString()}
            <StatUnit>actifs</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard variant="info">
          <StatIcon variant="info">📈</StatIcon>
          <StatLabel>Moyenne par Utilisateur</StatLabel>
          <StatValue variant="info">
            {stats.scansPerUser.toFixed(1)}
            <StatUnit>scans</StatUnit>
          </StatValue>
        </StatCard>
      </StatsGrid>

      {/* Charts */}
      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <span>📈</span>
            <span>Historique des Analyses (30 derniers jours)</span>
          </ChartTitle>
          <Line data={scanHistoryData} options={chartOptions} />
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <span>📊</span>
            <span>Problèmes par Type</span>
          </ChartTitle>
          <Bar data={issuesData} options={chartOptions} />
        </ChartCard>

        <ChartCard style={{ gridColumn: 'span 2' }}>
          <ChartTitle>
            <span>🎯</span>
            <span>Distribution des Problèmes</span>
          </ChartTitle>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Doughnut data={distributionData} options={doughnutOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>
    </StatsContainer>
  );
};

export default Statistics;

