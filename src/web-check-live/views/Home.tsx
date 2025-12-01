import styled from '@emotion/styled';
import { type ChangeEvent, type FormEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

import Input from 'web-check-live/components/Form/Input'
import Button from 'web-check-live/components/Form/Button';
import Header from 'web-check-live/components/misc/Header';
import Footer from 'web-check-live/components/misc/Footer';

import colors from 'web-check-live/styles/colors';
import { determineAddressType } from 'web-check-live/utils/address-type-checker';

const HomeContainer = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDarker} 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(220, 38, 38, 0) 100%);
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 16px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
  }
  
  @media (max-width: 599px) {
    padding: 24px 12px;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
  animation: fadeIn 0.8s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
  
  @media (max-width: 599px) {
    margin-bottom: 24px;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: white;
  border: 3px solid #dc2626;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
  animation: pulse 2s ease-in-out infinite;
  overflow: hidden;
  
  @media (max-width: 599px) {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  
  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    
    @media (max-width: 599px) {
      width: 48px;
      height: 48px;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  color: ${colors.textColor};
  margin: 0 0 16px 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
  
  @media (max-width: 599px) {
    font-size: 26px;
    margin-bottom: 12px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${colors.textColorSecondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
  
  @media (max-width: 599px) {
    font-size: 14px;
    padding: 0;
  }
`;

const UserInputMain = styled.form`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin: 0 auto;
  width: 100%;
  max-width: 720px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
  
  @media (max-width: 599px) {
    padding: 16px;
    border-radius: 12px;
    
    &:hover {
      transform: none;
    }
  }
`;



// const FindIpButton = styled.a`
//   margin: 0.5rem;
//   cursor: pointer;
//   display: block;
//   text-align: center;
//   color: ${colors.primary};
//   text-decoration: underline;
// `;

const ErrorMessage = styled.p`
  color: ${colors.danger};
  margin: 0;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 599px) {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  &::before {
    content: '⚠️';
    font-size: 16px;
  }
`;

const InfoNotice = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 24px;
  margin: 32px auto 0;
  max-width: 720px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    margin: 24px auto 0;
    padding: 20px;
  }
  
  @media (max-width: 599px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
    gap: 12px;
    margin: 20px 0 0;
  }
  
  .icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
  }
  
  .content {
    flex: 1;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: ${colors.textColor};
      margin: 0 0 8px 0;
      
      @media (max-width: 599px) {
        font-size: 15px;
      }
    }
    
    p {
      font-size: 14px;
      color: ${colors.textColorSecondary};
      margin: 0;
      line-height: 1.6;
      
      @media (max-width: 599px) {
        font-size: 13px;
      }
    }
  }
`;

const URLCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
  
  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 16px 0;
  }
`;

const URLCard = styled.div`
  background: ${colors.backgroundLighter};
  border: 2px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 599px) {
    padding: 16px;
    flex-direction: row;
    text-align: left;
    gap: 12px;
  }
  
  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.2);
    transform: translateY(-4px);
    background: ${colors.background};
    
    @media (max-width: 599px) {
      transform: none;
    }
  }
  
  &:active {
    @media (max-width: 599px) {
      transform: scale(0.98);
    }
  }
  
  .url-icon {
    width: 48px;
    height: 48px;
    display: none; /* Hidden by default, shown only if favicon loads */
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    background: ${colors.background};
    border-radius: 8px;
    padding: 8px;
    flex-shrink: 0;
    
    @media (max-width: 599px) {
      margin-bottom: 0;
      width: 40px;
      height: 40px;
    }
    
    &.loaded {
      display: flex; /* Show only when favicon is loaded */
    }
    
    img {
      width: 32px;
      height: 32px;
      
      @media (max-width: 599px) {
        width: 24px;
        height: 24px;
      }
    }
  }
  
  .url-text {
    font-size: 15px;
    font-weight: 600;
    color: ${colors.textColor};
    word-break: break-word;
    margin-bottom: 12px;
    line-height: 1.4;
    
    @media (max-width: 599px) {
      flex: 1;
      margin-bottom: 0;
      font-size: 14px;
    }
  }
  
  .url-action {
    font-size: 13px;
    color: ${colors.primary};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    @media (max-width: 599px) {
      font-size: 12px;
      flex-shrink: 0;
    }
  }
`;

const Home = (): JSX.Element => {
  const defaultPlaceholder = 'e.g. https://duck.com/';
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrMsg] = useState('');
  const [placeholder] = useState(defaultPlaceholder);
  const [inputDisabled] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const navigate = useNavigate();

  const location = useLocation();

  // Load user profile and allowed URLs
  useEffect(() => {
    const profileData = localStorage.getItem('checkitUser');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        // Load allowed URLs for DPD users
        if (profile.role === 'DPD' && profile.allowedUrls) {
          const urls = profile.allowedUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url);
          setAllowedUrls(urls);
        }
      } catch (e) {
        console.error('Error loading user profile:', e);
      }
    }
  }, []);

  /* Redirect strait to results, if somehow we land on /check?url=[] */
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlFromQuery = query.get('url');
    if (urlFromQuery) {
      navigate(`/check/${encodeURIComponent(urlFromQuery)}`, { replace: true });
    }
  }, [navigate, location.search]);

  /* Check is valid address, either show err or redirect to results page */
  const submit = async () => {
    let address = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
    const addressType = determineAddressType(address);
  
    if (addressType === 'empt') {
      setErrMsg('Le champ ne peut pas être vide');
    } else if (addressType === 'err') {
      setErrMsg('Doit être une URL, adresse IPv4 ou IPv6 valide');
    } else {
      // if the addressType is 'url' and address doesn't start with 'http://' or 'https://', prepend 'https://'
      if (addressType === 'url' && !/^https?:\/\//i.test(address)) {
        address = 'https://' + address;
      }

      // Check URL restrictions for DPD users
      const token = localStorage.getItem('checkitAuthToken');
      if (token) {
        try {
          const checkResponse = await fetch('/api/check-url', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: address })
          });

          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            if (!checkData.allowed) {
              setErrMsg('Vous n\'êtes pas autorisé à analyser cette URL. Contactez votre administrateur.');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking URL restrictions:', error);
          // Continue anyway if check fails (fail open)
        }
      }

      const resultRouteParams: NavigateOptions = { state: { address, addressType } };
      navigate(`/check/${encodeURIComponent(address)}`, resultRouteParams);
    }
  };
  

  /* Update user input state, and hide error message if field is valid */
  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
    const isError = ['err', 'empt'].includes(determineAddressType(event.target.value));
    if (!isError) setErrMsg('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  const formSubmitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  }

  // const findIpAddress = () => {
  //   setUserInput('');
  //   setPlaceholder('Looking up your IP...');
  //   setInputDisabled(true);
  //   fetch('https://ipapi.co/json/')
  //     .then(function(response) {
  //       response.json().then(jsonData => {
  //         setUserInput(jsonData.ip);
  //         setPlaceholder(defaultPlaceholder);
  //         setInputDisabled(true);
  //       });
  //     })
  //     .catch(function(error) {
  //       console.log('Failed to get IP address :\'(', error)
  //     });
  // };


  return (
    <HomeContainer>
      <Header />
      <MainContent>
        {/* Hero Section */}
        <HeroSection>
          <Logo>
            <img src="/assets/images/Logo-APDP.svg" alt="APDP Monaco" />
          </Logo>
          <Title>Analyse de Conformité Loi 1.565</Title>
          <Subtitle>
            Outil professionnel d'analyse de la sécurité. 
            Analysez la conformité avec la Loi et la posture de sécurité en quelques secondes.
          </Subtitle>
        </HeroSection>

        {/* Main Input Form */}
        <UserInputMain onSubmit={formSubmitEvent}>
          {userProfile?.role === 'DPD' && allowedUrls.length > 0 ? (
            // Show URL cards for DPD users
            <div>
              <p style={{ 
                fontSize: 16, 
                color: colors.textColorSecondary, 
                marginBottom: 24,
                textAlign: 'center',
                fontWeight: 500
              }}>
                Sélectionnez un site à analyser
              </p>
              <URLCardsGrid>
                {allowedUrls.map((url, index) => (
                  <URLCard 
                    key={index} 
                    onClick={() => {
                      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                      navigate(`/check/${encodeURIComponent(fullUrl)}`);
                    }}
                  >
                    <div className="url-icon">
                      <img 
                        src={`https://${url.replace(/^https?:\/\//, '')}/favicon.ico`}
                        alt=""
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          objectFit: 'contain'
                        }}
                        onLoad={(e) => { 
                          const icon = (e.target as HTMLImageElement).parentElement;
                          if (icon) icon.classList.add('loaded');
                        }}
                        onError={(e) => { 
                          const icon = (e.target as HTMLImageElement).parentElement;
                          if (icon) icon.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="url-text">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                    <div className="url-action">Analyser →</div>
                  </URLCard>
                ))}
              </URLCardsGrid>
            </div>
          ) : (
            // Show input for APDP users
            <>
              <div style={{ marginBottom: 16 }}>
                <Input
                  id="user-input"
                  value={userInput}
                  label=""
                  size="large"
                  orientation="vertical"
                  name="url"
                  placeholder="URL du site à analyser (ex: visitmonaco.com)"
                  disabled={inputDisabled}
                  handleChange={inputChange}
                  handleKeyDown={handleKeyPress}
                />
              </div>
              {errorMsg && <ErrorMessage style={{ marginBottom: 16 }}>{errorMsg}</ErrorMessage>}
              <Button 
                type="submit" 
                styles="width: 100%; height: 56px; font-size: 16px; font-weight: 600; border-radius: 12px;" 
                size="large" 
                onClick={submit}
              >
                🚀 Lancer l'analyse
              </Button>
            </>
          )}
        </UserInputMain>
        
        {/* Info Notice - Only show for APDP users */}
        {userProfile?.role === 'APDP' && (
          <InfoNotice>
            <div className="icon">🏛️</div>
            <div className="content">
              <h3>Outil professionnel APDP Monaco</h3>
              <p>
                Réservé aux contrôleurs pour les audits de conformité APDP et sécurité web. 
                Les rapports générés peuvent être utilisés dans le cadre des procédures officielles de contrôle.
              </p>
            </div>
          </InfoNotice>
        )}
        
        <Footer isFixed={false} />
      </MainContent>
    </HomeContainer>
  );
}

export default Home;
