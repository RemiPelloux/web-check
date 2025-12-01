import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// ============================================
// Types
// ============================================

type DateRange = '7days' | '30days' | 'all';

interface StatisticsData {
  totalScans: number;
  uniqueUsers: number;
  dpdUsers: number;
}

// ============================================
// Styled Components
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
    : colors.backgroundDarker};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: 1px solid ${props => props.active ? 'transparent' : colors.borderColor};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.active 
      ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div<{ variant: string }>`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.variant) {
        case 'primary': return 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)';
        case 'success': return 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
        case 'info': return 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)';
        default: return colors.primary;
      }
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div<{ variant: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 24px;
  color: white;
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'success': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'info': return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${colors.textColor};
  line-height: 1;
`;

const StatDescription = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.borderColor};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
`;

const LoadingIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

const LoadingText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
  background: ${colors.background};
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 16px;
`;

const ErrorIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
`;

const ErrorText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #dc2626;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.35);
  }
`;

// ============================================
// Component
// ============================================

const Statistics = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  const fetchStatistics = async (range: DateRange) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/statistics?range=${range}`, {
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
    fetchStatistics(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7days': return 'les 7 derniers jours';
      case '30days': return 'les 30 derniers jours';
      case 'all': return 'depuis le début';
    }
  };

  if (loading) {
    return (
      <LoadingState>
        <LoadingIcon>📊</LoadingIcon>
        <LoadingText>Chargement des statistiques...</LoadingText>
      </LoadingState>
    );
  }

  if (error) {
    return (
      <ErrorState>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>{error}</ErrorText>
        <RetryButton onClick={() => fetchStatistics(dateRange)}>Réessayer</RetryButton>
      </ErrorState>
    );
  }

  if (!stats) {
    return (
      <ErrorState>
        <ErrorIcon>📭</ErrorIcon>
        <ErrorText>Aucune statistique disponible</ErrorText>
      </ErrorState>
    );
  }

  return (
    <Container>
      {/* Date Range Filter */}
      <FilterSection>
        <FilterLabel>📅 Période :</FilterLabel>
        <FilterButtons>
          <FilterButton 
            active={dateRange === '7days'} 
            onClick={() => handleDateRangeChange('7days')}
          >
            7 derniers jours
          </FilterButton>
          <FilterButton 
            active={dateRange === '30days'} 
            onClick={() => handleDateRangeChange('30days')}
          >
            30 derniers jours
          </FilterButton>
          <FilterButton 
            active={dateRange === 'all'} 
            onClick={() => handleDateRangeChange('all')}
          >
            Depuis le début
          </FilterButton>
        </FilterButtons>
      </FilterSection>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard variant="success">
          <StatHeader>
            <StatIcon variant="success">👥</StatIcon>
            <StatInfo>
              <StatLabel>Utilisateurs actifs</StatLabel>
              <StatValue>{stats.uniqueUsers.toLocaleString()}</StatValue>
            </StatInfo>
          </StatHeader>
          <StatDescription>
            Nombre d'utilisateurs ayant effectué au moins une analyse {getDateRangeLabel()}
          </StatDescription>
        </StatCard>

        <StatCard variant="primary">
          <StatHeader>
            <StatIcon variant="primary">🔍</StatIcon>
            <StatInfo>
              <StatLabel>Analyses effectuées</StatLabel>
              <StatValue>{stats.totalScans.toLocaleString()}</StatValue>
            </StatInfo>
          </StatHeader>
          <StatDescription>
            Nombre total de scans réalisés {getDateRangeLabel()}
          </StatDescription>
        </StatCard>

        <StatCard variant="info">
          <StatHeader>
            <StatIcon variant="info">📋</StatIcon>
            <StatInfo>
              <StatLabel>Comptes DPD</StatLabel>
              <StatValue>{stats.dpdUsers.toLocaleString()}</StatValue>
            </StatInfo>
          </StatHeader>
          <StatDescription>
            Nombre total de comptes DPD créés dans le système
          </StatDescription>
        </StatCard>
      </StatsGrid>
    </Container>
  );
};

export default Statistics;
