import { useState, useEffect } from 'react';
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
}

const Container = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${colors.borderColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
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

const Username = styled.div`
  font-weight: 600;
  color: ${colors.textColor};
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

const UserManagement = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
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
        throw new Error(data.message || 'Failed to delete user');
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
          <AddButton onClick={handleAddUser}>
            <span>➕</span>
            <span>Ajouter un utilisateur</span>
          </AddButton>
        </Header>

        {users.length === 0 ? (
          <EmptyState>
            Aucun utilisateur trouvé. Créez-en un pour commencer.
          </EmptyState>
        ) : (
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
              {users.map(user => (
                <Tr key={user.id}>
                  <Td>
                    <Username>
                      {user.role === 'DPD' && user.company ? user.company : user.username}
                    </Username>
                    {user.role === 'DPD' && user.company && (
                      <div style={{ fontSize: '11px', color: colors.textColorSecondary, marginTop: '4px' }}>
                        {user.username}
                      </div>
                    )}
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
                          ? '✅ Toutes les URLs' 
                          : `🔒 ${user.allowed_urls?.split(',').length || 0} URL(s)`
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
                        ✏️ Modifier
                      </ActionButton>
                      <ActionButton
                        danger
                        onClick={() => handleDeleteUser(user)}
                      >
                        🗑️ Supprimer
                      </ActionButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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

