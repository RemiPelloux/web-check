import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  user_role: string;
  action: string;
  details: string | null;
  ip_address: string;
  timestamp: string;
}

interface LogCategory {
  id: string;
  label: string;
  abbr: string;
}

const LOG_CATEGORIES: LogCategory[] = [
  { id: 'all', label: 'Tous', abbr: 'ALL' },
  { id: 'connection', label: 'Connexion', abbr: 'AUTH' },
  { id: 'scan', label: 'Analyses', abbr: 'SCAN' },
  { id: 'admin', label: 'Actions Admin', abbr: 'ADM' },
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

const FilterIcon = styled.span<{ active: boolean; variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
  background: ${props => {
    if (props.active) return 'rgba(255, 255, 255, 0.2)';
    switch (props.variant) {
      case 'all': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      case 'connection': return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      case 'scan': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'admin': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
`;

const TypeIcon = styled.span<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-right: 6px;
  background: ${props => {
    switch (props.variant) {
      case 'connection': return 'rgba(37, 99, 235, 0.15)';
      case 'scan': return 'rgba(5, 150, 105, 0.15)';
      case 'admin': return 'rgba(220, 38, 38, 0.15)';
      default: return 'rgba(107, 114, 128, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'connection': return '#2563eb';
      case 'scan': return '#059669';
      case 'admin': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${colors.backgroundLighter} 0%, ${colors.background} 100%);
  border: 2px solid ${colors.borderColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 11px;
  font-weight: 700;
  color: ${colors.textColorSecondary};
  letter-spacing: 0.5px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const DateFilter = styled.input`
  padding: 10px 16px;
  background: ${colors.background};
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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
  flex: 1;
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

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.danger 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    : 'linear-gradient(135deg, #059669 0%, #047857 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.danger
      ? '0 8px 16px rgba(220, 38, 38, 0.3)'
      : '0 8px 16px rgba(5, 150, 105, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LogsTable = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${colors.background};
  border-radius: 12px;
  border: 1px solid ${colors.borderColor};
  flex-wrap: wrap;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${colors.textColorSecondary};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  min-width: 40px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    : colors.backgroundLighter};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: 2px solid ${props => props.active ? '#dc2626' : colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const PerPageSelect = styled.select`
  padding: 8px 12px;
  background: ${colors.backgroundLighter};
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
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
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, activeFilter, searchQuery, dateFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilter, searchQuery, dateFilter]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/audit-log?limit=10000`, {
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

  const handleCleanLogs = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')) {
      return;
    }

    setCleaning(true);
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/audit-log/clean`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Échec du nettoyage des logs');
      }

      toast.success('Tous les logs ont été supprimés', {
        position: 'bottom-right',
        theme: 'dark',
      });

      // Refresh logs
      await fetchLogs();
    } catch (error) {
      console.error('Error cleaning logs:', error);
      toast.error('Impossible de supprimer les logs', {
        position: 'bottom-right',
        theme: 'dark',
      });
    } finally {
      setCleaning(false);
    }
  };

  const getLogType = (action: string): string => {
    const a = action.toUpperCase();
    // Connection-related actions
    if (a.includes('LOGIN') || a.includes('LOGOUT') || a.includes('AUTH') || a.includes('SESSION')) {
      return 'connection';
    }
    // Scan/Analysis actions
    if (a.includes('SCAN') || a.includes('ANALYZ') || a.includes('CHECK') || a.includes('REPORT')) {
      return 'scan';
    }
    // Everything else is admin
    return 'admin';
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(log => getLogType(log.action) === activeFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === filterDate.toDateString();
      });
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
    // SQLite stores timestamps in UTC without timezone suffix
    // Append 'Z' to ensure JavaScript parses it as UTC
    const utcTimestamp = timestamp.includes('Z') || timestamp.includes('+') ? timestamp : timestamp + 'Z';
    const date = new Date(utcTimestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
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

  // Mask IP addresses in details for DPD users
  const maskIpInDetails = (details: string | null, userRole: string): string | null => {
    if (!details || userRole !== 'DPD') return details;
    // Replace IPv4 and IPv6 addresses with masked text
    return details
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***masquée***')
      .replace(/\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g, '***masquée***')
      .replace(/\b([0-9a-fA-F]{1,4}:){1,7}:\b/g, '***masquée***')
      .replace(/\b:([0-9a-fA-F]{1,4}:){1,7}\b/g, '***masquée***')
      .replace(/\b([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g, '***masquée***');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return <span key={`ellipsis-${index}`} style={{ padding: '0 8px', color: colors.textColorSecondary }}>...</span>;
      }
      return (
        <PageButton
          key={page}
          active={currentPage === page}
          onClick={() => goToPage(page as number)}
        >
          {page}
        </PageButton>
      );
    });
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
              <FilterIcon active={activeFilter === category.id} variant={category.id}>{category.abbr}</FilterIcon>
              <span>{category.label}</span>
            </FilterTab>
          ))}
        </FilterTabs>
      </Header>

      <ControlsRow>
        <DateFilter
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          title="Filtrer par date"
        />
        <SearchBox
          type="text"
          placeholder="Rechercher (utilisateur, action, IP...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ActionButton danger onClick={handleCleanLogs} disabled={cleaning || logs.length === 0}>
          {cleaning ? 'Nettoyage...' : 'Nettoyer les logs'}
        </ActionButton>
      </ControlsRow>

      {filteredLogs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>LOGS</EmptyIcon>
          <div className="message">
            {searchQuery || dateFilter ? 'Aucun log ne correspond à votre recherche' : 'Aucun log disponible'}
          </div>
        </EmptyState>
      ) : (
        <>
          <LogsTable>
            <TableHeader>
              <div>Horodatage</div>
              <div>Type</div>
              <div>Action</div>
              <div>Utilisateur</div>
              <div>Adresse IP</div>
            </TableHeader>
            {currentLogs.map((log) => {
              const logType = getLogType(log.action);
              return (
                <TableRow key={log.id} type={logType}>
                  <Cell data-label="Horodatage:">{formatTimestamp(log.timestamp)}</Cell>
                  <Cell data-label="Type:">
                    <Badge type={logType}>
                      <TypeIcon variant={logType}>
                        {logType === 'connection' && 'AUTH'}
                        {logType === 'scan' && 'SCAN'}
                        {logType === 'admin' && 'ADM'}
                      </TypeIcon>
                      {logType === 'connection' && 'Connexion'}
                      {logType === 'scan' && 'Analyse'}
                      {logType === 'admin' && 'Admin'}
                    </Badge>
                  </Cell>
                  <Cell data-label="Action:">
                    <div>
                      <div style={{ fontWeight: 500 }}>{translateAction(log.action)}</div>
                      {log.details && (
                        <div style={{ fontSize: '12px', color: colors.textColorSecondary, marginTop: '4px' }}>
                          {maskIpInDetails(log.details, log.user_role)}
                        </div>
                      )}
                    </div>
                  </Cell>
                  <Cell data-label="Utilisateur:">
                    <UserInfo>
                      <span className="username">{log.user_role === 'DPD' ? '— masqué —' : log.username}</span>
                      <span className="user-id">{log.user_role === 'DPD' ? '' : `ID: ${log.user_id}`}</span>
                    </UserInfo>
                  </Cell>
                  <Cell data-label="IP:">{log.user_role === 'DPD' ? '— masquée —' : log.ip_address}</Cell>
                </TableRow>
              );
            })}
          </LogsTable>

          <PaginationContainer>
            <PaginationInfo>
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredLogs.length)} sur {filteredLogs.length} logs
            </PaginationInfo>
            <PaginationControls>
              <PageButton onClick={() => goToPage(1)} disabled={currentPage === 1}>
                «
              </PageButton>
              <PageButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ‹
              </PageButton>
              {renderPageNumbers()}
              <PageButton onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                ›
              </PageButton>
              <PageButton onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                »
              </PageButton>
              <PerPageSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </PerPageSelect>
            </PaginationControls>
          </PaginationContainer>
        </>
      )}
    </Container>
  );
};

export default Logs;
