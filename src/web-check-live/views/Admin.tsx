import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import colors from 'web-check-live/styles/colors';
import UserManagement from 'web-check-live/components/Admin/UserManagement';
import PluginConfig from 'web-check-live/components/Admin/PluginConfig';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  display: flex;
`;

const Sidebar = styled.aside`
  width: 280px;
  min-height: 100vh;
  background: ${colors.backgroundLighter};
  border-right: 1px solid ${colors.borderColor};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${colors.borderColor};
  }
`;

const SidebarHeader = styled.div`
  padding: 32px 24px;
  border-bottom: 1px solid ${colors.borderColor};
`;

const SidebarTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SidebarSubtitle = styled.p`
  font-size: 13px;
  color: ${colors.textColorSecondary};
  margin: 0;
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
`;

const NavItem = styled.button<{ active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${props => props.active ? colors.backgroundDarker : 'transparent'};
  color: ${props => props.active ? colors.primary : colors.textColor};
  border: none;
  border-left: 3px solid ${props => props.active ? colors.primary : 'transparent'};
  border-radius: 8px;
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  margin-bottom: 4px;

  &:hover {
    background: ${colors.backgroundDarker};
    color: ${colors.primary};
    border-left-color: ${colors.primary};
  }

  span:first-of-type {
    font-size: 20px;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SidebarFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${colors.borderColor};
`;

const BackButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    transform: translateX(-2px);
  }

  span:first-of-type {
    font-size: 18px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 32px;
`;

const ContentTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  span:first-of-type {
    font-size: 32px;
  }
`;

const ContentDescription = styled.p`
  font-size: 15px;
  color: ${colors.textColorSecondary};
  margin: 0;
  line-height: 1.6;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 16px;
`;

const Admin = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'users' | 'plugins'>('users');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is APDP admin
    const userRole = localStorage.getItem('checkitUserRole');
    
    if (userRole !== 'APDP') {
      // Not authorized, redirect to home
      window.location.href = '/';
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <AdminContainer>
        <LoadingMessage>Vérification des autorisations...</LoadingMessage>
      </AdminContainer>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  const getContentTitle = () => {
    if (activeTab === 'users') {
      return {
        icon: '👥',
        title: 'Gestion des Utilisateurs',
        description: 'Créez et gérez les comptes DPD, configurez les restrictions IP et les autorisations.'
      };
    }
    return {
      icon: '🔌',
      title: 'Configuration des Plugins',
      description: 'Activez ou désactivez les plugins disponibles pour tous les utilisateurs DPD.'
    };
  };

  const content = getContentTitle();

  return (
    <AdminContainer>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>
            <span>⚙️</span>
            Administration APDP
          </SidebarTitle>
          <SidebarSubtitle>Panneau de contrôle</SidebarSubtitle>
        </SidebarHeader>

        <SidebarNav>
          <NavItem
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span>
            <span>Gestion des Utilisateurs</span>
          </NavItem>
          <NavItem
            active={activeTab === 'plugins'}
            onClick={() => setActiveTab('plugins')}
          >
            <span>🔌</span>
            <span>Configuration des Plugins</span>
          </NavItem>
        </SidebarNav>

        <SidebarFooter>
          <BackButton href="/">
            <span>←</span>
            <span>Retour à l'accueil</span>
          </BackButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <ContentTitle>
            <span>{content.icon}</span>
            <span>{content.title}</span>
          </ContentTitle>
          <ContentDescription>{content.description}</ContentDescription>
        </ContentHeader>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'plugins' && <PluginConfig />}
      </MainContent>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={5}
      />
    </AdminContainer>
  );
};

export default Admin;

