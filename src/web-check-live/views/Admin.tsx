import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import colors from 'web-check-live/styles/colors';
import UserManagement from 'web-check-live/components/Admin/UserManagement';
import PluginConfig from 'web-check-live/components/Admin/PluginConfig';
import Statistics from 'web-check-live/components/Admin/Statistics';
import Logs from 'web-check-live/components/Admin/Logs';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDarker} 100%);
  display: flex;
`;

const Sidebar = styled.aside`
  width: 300px;
  min-height: 100vh;
  background: ${colors.backgroundLighter};
  border-right: 1px solid ${colors.borderColor};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);

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
  background: linear-gradient(135deg, ${colors.primary} 0%, #b91c1c 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
`;

const SidebarTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SidebarSubtitle = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  position: relative;
  z-index: 1;
  font-weight: 500;
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
  gap: 14px;
  padding: 16px 20px;
  background: ${props => props.active ? `linear-gradient(135deg, ${colors.primary} 0%, #b91c1c 100%)` : 'transparent'};
  color: ${props => props.active ? 'white' : colors.textColor};
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: ${props => props.active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none'};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.active ? 'white' : colors.primary};
    transform: ${props => props.active ? 'scaleY(1)' : 'scaleY(0)'};
    transition: transform 0.3s ease;
  }

  &:hover {
    background: ${props => props.active ? `linear-gradient(135deg, ${colors.primary} 0%, #b91c1c 100%)` : colors.backgroundDarker};
    color: ${props => props.active ? 'white' : colors.primary};
    transform: translateX(4px);
    box-shadow: ${props => props.active ? '0 6px 16px rgba(220, 38, 38, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }

  &:hover::before {
    transform: scaleY(1);
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }

  span:first-of-type {
    font-size: 22px;
    min-width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: ${props => props.active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'};
  }
`;

const SidebarFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${colors.borderColor};
`;

const BackButton = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColor};
  border: 2px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  &:active {
    transform: translateX(-2px) scale(0.98);
  }

  span:first-of-type {
    font-size: 20px;
    transition: transform 0.3s ease;
  }

  &:hover span:first-of-type {
    transform: translateX(-2px);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 2px solid ${colors.borderColor};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary} 0%, transparent 100%);
  }
`;

const ContentTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: ${colors.textColor};
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 14px;

  span:first-of-type {
    font-size: 36px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const ContentDescription = styled.p`
  font-size: 16px;
  color: ${colors.textColorSecondary};
  margin: 0;
  line-height: 1.7;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 16px;
`;

const Admin = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'users' | 'plugins' | 'statistics'>('users');
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
    if (activeTab === 'statistics') {
      return {
        icon: '📊',
        title: 'Statistiques',
        description: 'Visualisez les statistiques anonymes des analyses et des problèmes détectés.'
      };
    }
    if (activeTab === 'logs') {
      return {
        icon: '📋',
        title: 'Journal d\'Audit',
        description: 'Consultez l\'historique complet des connexions, analyses et actions administratives.'
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
            active={activeTab === 'statistics'}
            onClick={() => setActiveTab('statistics')}
          >
            <span>📊</span>
            <span>Statistiques</span>
          </NavItem>
          <NavItem
            active={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
          >
            <span>📋</span>
            <span>Journal d'Audit</span>
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
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'logs' && <Logs />}
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

