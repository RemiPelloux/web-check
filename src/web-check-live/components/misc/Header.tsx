import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import ThemeToggle from './ThemeToggle';

const HeaderContainer = styled.header`
  background: ${colors.backgroundLighter};
  border-bottom: 1px solid ${colors.borderColor};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 16px;
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  height: 28px;
  width: auto;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LogoDivider = styled.div`
  border-left: 1px solid ${colors.borderColor};
  padding-left: 12px;
`;

const LogoText = styled.div`
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  h1 {
    font-size: 16px;
    font-weight: 600;
    color: ${colors.textColor};
    margin: 0;
  }
  p {
    font-size: 12px;
    color: ${colors.primary};
    font-weight: 500;
    margin: 0;
  }
`;

const HomeButton = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VersionBadge = styled.div`
  background: ${colors.backgroundDarker};
  color: ${colors.textColorSecondary};
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
`;

const WikiLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.backgroundLighter};
    color: ${colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.backgroundLighter};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  transition: transform 0.2s;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s;
  overflow: hidden;
  z-index: 100;
`;

const MenuSection = styled.div`
  padding: 8px;
`;

const MenuItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: ${colors.textColor};
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${colors.backgroundDarker};
    color: ${colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: ${colors.borderColor};
  margin: 4px 0;
`;

const LogoutMenuItem = styled(MenuItem)`
  color: ${colors.primary};
  
  &:hover {
    background: rgba(220, 38, 38, 0.1);
    color: ${colors.primary};
  }
`;

const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUsername = localStorage.getItem('checkitUsername');
    const storedRole = localStorage.getItem('checkitUserRole');
    
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setUserRole(storedRole);

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.checkitLogout) {
      window.checkitLogout();
    }
  };

  const getUserInitial = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const isAdmin = userRole === 'APDP';

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <HeaderInner>
          <LogoSection>
            <LogoImage 
              src="https://i.postimg.cc/W4Lfm5Zs/image.png" 
              alt="APDP Logo" 
              onClick={handleGoHome}
              title="Retour à l'accueil"
            />
            <LogoDivider>
              <LogoText onClick={handleGoHome} title="Retour à l'accueil">
                <h1>Outil d'analyse de la sécurité</h1>
                <p>Usage interne - Contrôleurs APDP Monaco</p>
              </LogoText>
            </LogoDivider>
          </LogoSection>
          <RightSection>
            <HomeButton href="/" title="Retour à l'accueil">
              <span>🏠</span>
              <span>Accueil</span>
            </HomeButton>
            <VersionBadge>
              Version 2.1.0
            </VersionBadge>
            <WikiLink href="/wiki" target="_blank" rel="noopener noreferrer" title="Consulter le Wiki">
              <span>📖</span>
              <span>Wiki</span>
            </WikiLink>
            <ThemeToggle />
            
            {username && (
              <UserMenuContainer ref={menuRef}>
                <UserButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <UserIcon>{getUserInitial()}</UserIcon>
                  <span>{username.split('@')[0]}</span>
                  <ChevronIcon isOpen={isMenuOpen}>▼</ChevronIcon>
                </UserButton>
                
                <DropdownMenu isOpen={isMenuOpen}>
                  <MenuSection>
                    {isAdmin && (
                      <>
                        <MenuItem href="/admin">
                          <span>Admin</span>
                          <span>Administration</span>
                        </MenuItem>
                        <MenuDivider />
                      </>
                    )}
                    <LogoutMenuItem onClick={handleLogout}>
                      <span>🚪</span>
                      <span>Déconnexion</span>
                    </LogoutMenuItem>
                  </MenuSection>
                </DropdownMenu>
              </UserMenuContainer>
            )}
          </RightSection>
        </HeaderInner>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;






