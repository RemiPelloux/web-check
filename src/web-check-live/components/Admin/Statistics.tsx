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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
    transform: translateY(-2px);
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${colors.textColor};
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const StatUnit = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.textColorSecondary};
`;

const StatIcon = styled.div`
  font-size: 24px;
  opacity: 0.8;
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
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.danger};
  font-size: 16px;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.danger};
  border-radius: 12px;
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
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatLabel>Total Analyses</StatLabel>
          <StatValue>
            {stats.totalScans}
            <StatUnit>scans</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>🔴</StatIcon>
          <StatLabel>Problèmes Critiques</StatLabel>
          <StatValue>
            {stats.criticalIssues}
            <StatUnit>trouvés</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>⚠️</StatIcon>
          <StatLabel>Avertissements</StatLabel>
          <StatValue>
            {stats.warningIssues}
            <StatUnit>détectés</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatLabel>Utilisateurs DPD</StatLabel>
          <StatValue>
            {stats.dpdUsers}
            <StatUnit>actifs</StatUnit>
          </StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>📈</StatIcon>
          <StatLabel>Moyenne par Utilisateur</StatLabel>
          <StatValue>
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

