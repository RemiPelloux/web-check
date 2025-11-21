import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  details: string | null;
  ip_address: string;
  timestamp: string;
}

interface LogCategory {
  id: string;
  label: string;
  icon: string;
}

const LOG_CATEGORIES: LogCategory[] = [
  { id: 'all', label: 'Tous', icon: '📋' },
  { id: 'connection', label: 'Connexion', icon: '🔐' },
  { id: 'scan', label: 'Analyses', icon: '🔍' },
  { id: 'admin', label: 'Actions Admin', icon: '⚙️' },
];

const Container = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${colors.borderColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    : colors.background};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: 2px solid ${props => props.active ? '#dc2626' : colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 8px 16px rgba(220, 38, 38, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const SearchBox = styled.input`
  padding: 10px 16px;
  background: ${colors.background};
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  min-width: 280px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  &::placeholder {
    color: ${colors.textColorSecondary};
  }
`;

const LogsTable = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 180px 120px 1fr 140px 180px;
  background: ${colors.backgroundDarker};
  padding: 16px;
  font-weight: 600;
  font-size: 13px;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${colors.borderColor};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const TableRow = styled.div<{ type?: string }>`
  display: grid;
  grid-template-columns: 180px 120px 1fr 140px 180px;
  padding: 16px;
  border-bottom: 1px solid ${colors.borderColor};
  transition: all 0.2s;
  background: ${props => {
    if (props.type === 'connection') return 'rgba(59, 130, 246, 0.02)';
    if (props.type === 'scan') return 'rgba(16, 185, 129, 0.02)';
    if (props.type === 'admin') return 'rgba(220, 38, 38, 0.02)';
    return colors.background;
  }};

  &:hover {
    background: ${colors.backgroundLighter};
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${colors.textColor};
  word-break: break-word;
  
  @media (max-width: 1024px) {
    &::before {
      content: attr(data-label);
      font-weight: 600;
      color: ${colors.textColorSecondary};
      margin-right: 8px;
      min-width: 100px;
    }
  }
`;

const Badge = styled.span<{ type: string }>`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    if (props.type === 'connection') return 'rgba(59, 130, 246, 0.1)';
    if (props.type === 'scan') return 'rgba(16, 185, 129, 0.1)';
    if (props.type === 'admin') return 'rgba(220, 38, 38, 0.1)';
    return colors.backgroundDarker;
  }};
  color: ${props => {
    if (props.type === 'connection') return '#3b82f6';
    if (props.type === 'scan') return '#10b981';
    if (props.type === 'admin') return '#dc2626';
    return colors.textColor;
  }};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .username {
    font-weight: 600;
    color: ${colors.textColor};
  }
  
  .user-id {
    font-size: 12px;
    color: ${colors.textColorSecondary};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: ${colors.textColorSecondary};
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .message {
    font-size: 16px;
    font-weight: 500;
  }
`;

const Logs = (): JSX.Element => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, activeFilter, searchQuery]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/audit-log?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération des logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Impossible de récupérer les logs', {
        position: 'bottom-right',
        theme: 'dark',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogType = (action: string): string => {
    if (action.includes('login') || action.includes('logout') || action.includes('auth')) {
      return 'connection';
    }
    if (action.includes('scan') || action.includes('analyze')) {
      return 'scan';
    }
    return 'admin';
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(log => getLogType(log.action) === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.username.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.ip_address.includes(query)
      );
    }

    setFilteredLogs(filtered);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const translateAction = (action: string): string => {
    const translations: Record<string, string> = {
      'login_success': 'Connexion réussie',
      'login_failed': 'Échec de connexion',
      'logout': 'Déconnexion',
      'scan_started': 'Analyse lancée',
      'scan_completed': 'Analyse terminée',
      'user_created': 'Utilisateur créé',
      'user_updated': 'Utilisateur modifié',
      'user_deleted': 'Utilisateur supprimé',
      'plugins_updated': 'Configuration plugins modifiée',
      'settings_changed': 'Paramètres modifiés',
    };
    return translations[action] || action;
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Chargement des logs...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <FilterTabs>
          {LOG_CATEGORIES.map(category => (
            <FilterTab
              key={category.id}
              active={activeFilter === category.id}
              onClick={() => setActiveFilter(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </FilterTab>
          ))}
        </FilterTabs>
        <SearchBox
          type="text"
          placeholder="🔍 Rechercher (utilisateur, action, IP...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Header>

      {filteredLogs.length === 0 ? (
        <EmptyState>
          <div className="icon">📭</div>
          <div className="message">
            {searchQuery ? 'Aucun log ne correspond à votre recherche' : 'Aucun log disponible'}
          </div>
        </EmptyState>
      ) : (
        <LogsTable>
          <TableHeader>
            <div>Horodatage</div>
            <div>Type</div>
            <div>Action</div>
            <div>Utilisateur</div>
            <div>Adresse IP</div>
          </TableHeader>
          {filteredLogs.map((log) => {
            const logType = getLogType(log.action);
            return (
              <TableRow key={log.id} type={logType}>
                <Cell data-label="Horodatage:">{formatTimestamp(log.timestamp)}</Cell>
                <Cell data-label="Type:">
                  <Badge type={logType}>
                    {logType === 'connection' && '🔐 Connexion'}
                    {logType === 'scan' && '🔍 Analyse'}
                    {logType === 'admin' && '⚙️ Admin'}
                  </Badge>
                </Cell>
                <Cell data-label="Action:">
                  <div>
                    <div style={{ fontWeight: 500 }}>{translateAction(log.action)}</div>
                    {log.details && (
                      <div style={{ fontSize: '12px', color: colors.textColorSecondary, marginTop: '4px' }}>
                        {log.details}
                      </div>
                    )}
                  </div>
                </Cell>
                <Cell data-label="Utilisateur:">
                  <UserInfo>
                    <span className="username">{log.username}</span>
                    <span className="user-id">ID: {log.user_id}</span>
                  </UserInfo>
                </Cell>
                <Cell data-label="IP:">{log.ip_address}</Cell>
              </TableRow>
            );
          })}
        </LogsTable>
      )}
    </Container>
  );
};

export default Logs;

