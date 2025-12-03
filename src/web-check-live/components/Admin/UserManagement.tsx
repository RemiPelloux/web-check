import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';
import UserModal from './UserModal';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

interface User {
  id: number;
  username: string;
  role: string;
  company?: string;
  ip_restrictions: string;
  url_restriction_mode: string;
  allowed_urls: string;
  created_at: string;
  is_test_account?: number;
}

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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  background: ${colors.backgroundDarker};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  color: ${colors.textColor};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
  
  &::placeholder {
    color: ${colors.textColorSecondary};
  }
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
    box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${colors.backgroundDarker};
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid ${colors.borderColor};

  &:first-of-type {
    border-radius: 8px 0 0 0;
  }

  &:last-of-type {
    border-radius: 0 8px 0 0;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${colors.borderColor};
  transition: background 0.15s;

  &:hover {
    background: ${colors.backgroundDarker};
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 16px;
  color: ${colors.textColor};
  font-size: 14px;
`;

const UsernameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Username = styled.div`
  font-weight: 600;
  color: ${colors.textColor};
`;

const CertifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #BF1D1D;
  border-radius: 50%;
  font-size: 12px;
  color: white;
  box-shadow: 0 2px 6px rgba(191, 29, 29, 0.4);
  flex-shrink: 0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background: ${props => props.active ? '#BF1D1D' : colors.backgroundDarker};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: 1px solid ${props => props.active ? '#BF1D1D' : colors.borderColor};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #BF1D1D;
    color: ${props => props.active ? 'white' : '#BF1D1D'};
  }
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${colors.textColorSecondary};
  cursor: pointer;
  user-select: none;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #BF1D1D;
    cursor: pointer;
  }
`;

const RoleBadge = styled.span<{ role: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.role === 'APDP' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(100, 116, 139, 0.1)'};
  color: ${props => props.role === 'APDP' ? colors.primary : colors.textColorSecondary};
`;

const IpInfo = styled.div`
  font-size: 13px;
  color: ${colors.textColorSecondary};
  font-family: 'PT Mono', monospace;
`;

const DateInfo = styled.div`
  font-size: 13px;
  color: ${colors.textColorSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 6px 12px;
  background: ${props => props.danger ? 'rgba(220, 38, 38, 0.1)' : colors.backgroundDarker};
  color: ${props => props.danger ? colors.primary : colors.textColor};
  border: 1px solid ${props => props.danger ? colors.primary : colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? colors.primary : colors.backgroundLighter};
    color: ${props => props.danger ? 'white' : colors.primary};
    border-color: ${colors.primary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${colors.borderColor};
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: ${colors.textColorSecondary};
`;

const PageButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 14px;
  background: ${props => props.active ? colors.primary : colors.backgroundDarker};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: 1px solid ${props => props.active ? colors.primary : colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    color: ${props => props.active ? 'white' : colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 14px;
`;

const ITEMS_PER_PAGE = 10;

type RoleFilter = 'ALL' | 'APDP' | 'DPD';

const UserManagement = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [hideCertified, setHideCertified] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération des utilisateurs');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Impossible de récupérer la liste des utilisateurs', {
        position: 'bottom-right',
        theme: 'dark',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query, role filter, and certified toggle
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Hide certified/test accounts if toggle is on
    if (hideCertified) {
      filtered = filtered.filter(user => user.is_test_account !== 1);
    }
    
    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        (user.company?.toLowerCase().includes(query)) ||
        user.role.toLowerCase().includes(query) ||
        (user.ip_restrictions?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [users, searchQuery, roleFilter, hideCertified]);

  // Paginate filtered users
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, hideCertified]);

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      return;
    }

    const toastId = toast.loading(`Suppression de "${user.username}"...`, {
      position: 'bottom-right',
      theme: 'dark',
    });

    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Échec de la suppression de l\'utilisateur');
      }

      toast.update(toastId, {
        render: `Utilisateur "${user.username}" supprimé avec succès`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.update(toastId, {
        render: `${error.message || 'Impossible de supprimer l\'utilisateur'}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    }
  };

  const handleModalClose = (refresh: boolean) => {
    setModalOpen(false);
    setEditingUser(null);
    if (refresh) {
      fetchUsers();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Chargement des utilisateurs...</LoadingState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <AddButton onClick={handleAddUser}>
            <span>+</span>
            <span>Ajouter un utilisateur</span>
          </AddButton>
        </Header>

        <FilterRow>
          <FilterTabs>
            <FilterTab active={roleFilter === 'ALL'} onClick={() => setRoleFilter('ALL')}>
              Tous ({hideCertified ? users.filter(u => u.is_test_account !== 1).length : users.length})
            </FilterTab>
            <FilterTab active={roleFilter === 'APDP'} onClick={() => setRoleFilter('APDP')}>
              APDP ({users.filter(u => u.role === 'APDP' && (hideCertified ? u.is_test_account !== 1 : true)).length})
            </FilterTab>
            <FilterTab active={roleFilter === 'DPD'} onClick={() => setRoleFilter('DPD')}>
              DPD ({users.filter(u => u.role === 'DPD' && (hideCertified ? u.is_test_account !== 1 : true)).length})
            </FilterTab>
          </FilterTabs>
          <ToggleLabel>
            <input
              type="checkbox"
              checked={hideCertified}
              onChange={(e) => setHideCertified(e.target.checked)}
            />
            Masquer les comptes certifiés
          </ToggleLabel>
        </FilterRow>

        {paginatedUsers.length === 0 ? (
          <EmptyState>
            {searchQuery ? 'Aucun utilisateur trouvé pour cette recherche.' : 'Aucun utilisateur trouvé. Créez-en un pour commencer.'}
          </EmptyState>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Utilisateur</Th>
                  <Th>Rôle</Th>
                  <Th>Restrictions IP</Th>
                  <Th>Restrictions URL</Th>
                  <Th>Créé le</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedUsers.map(user => (
                  <Tr key={user.id}>
                    <Td>
                      <UsernameContainer>
                        {user.is_test_account === 1 && (
                          <CertifiedBadge title="Compte certifié (exclu des statistiques)">
                            🛡️
                          </CertifiedBadge>
                        )}
                        <div>
                          <Username>
                            {user.role === 'DPD' && user.company ? user.company : user.username}
                          </Username>
                          {user.role === 'DPD' && user.company && (
                            <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginTop: '4px' }}>
                              {user.username}
                            </div>
                          )}
                        </div>
                      </UsernameContainer>
                    </Td>
                    <Td>
                      <RoleBadge role={user.role}>{user.role}</RoleBadge>
                    </Td>
                    <Td>
                      <IpInfo>
                        {user.ip_restrictions || 'Aucune restriction'}
                      </IpInfo>
                    </Td>
                    <Td>
                      <IpInfo>
                        {user.role === 'DPD' ? (
                          user.url_restriction_mode === 'ALL' 
                            ? 'Toutes les URLs' 
                            : `${user.allowed_urls?.split(',').length || 0} URL(s) autorisée(s)`
                        ) : (
                          '— N/A —'
                        )}
                      </IpInfo>
                    </Td>
                    <Td>
                      <DateInfo>{formatDate(user.created_at)}</DateInfo>
                    </Td>
                    <Td>
                      <ActionButtons>
                        <ActionButton onClick={() => handleEditUser(user)}>
                          Modifier
                        </ActionButton>
                        <ActionButton
                          danger
                          onClick={() => handleDeleteUser(user)}
                        >
                          Supprimer
                        </ActionButton>
                      </ActionButtons>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {totalPages > 1 && (
              <Pagination>
                <PageInfo>
                  Page {currentPage} sur {totalPages} ({filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''})
                </PageInfo>
                <PageButtons>
                  <PageButton 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Précédent
                  </PageButton>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <PageButton
                        key={page}
                        active={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PageButton>
                    );
                  })}
                  <PageButton 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant →
                  </PageButton>
                </PageButtons>
              </Pagination>
            )}
          </>
        )}
      </Container>

      {modalOpen && (
        <UserModal
          user={editingUser}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default UserManagement;
