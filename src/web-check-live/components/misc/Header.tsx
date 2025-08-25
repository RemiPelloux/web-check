import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

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
`;

const LogoDivider = styled.div`
  border-left: 1px solid ${colors.borderColor};
  padding-left: 12px;
`;

const LogoText = styled.div`
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

const VersionBadge = styled.div`
  background: ${colors.backgroundDarker};
  color: ${colors.textColorSecondary};
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
`;

const Header = (): JSX.Element => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <HeaderInner>
          <LogoSection>
            <LogoImage 
              src="https://i.postimg.cc/W4Lfm5Zs/image.png" 
              alt="APDP Logo" 
            />
            <LogoDivider>
              <LogoText>
                <h1>Outil d'Audit de Conformité</h1>
                <p>Usage interne - Contrôleurs APDP Monaco</p>
              </LogoText>
            </LogoDivider>
          </LogoSection>
          <VersionBadge>
            Version 2.1.0
          </VersionBadge>
        </HeaderInner>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;

