import styled from '@emotion/styled';
import { type ChangeEvent, type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

import Heading from 'web-check-live/components/Form/Heading';
import Input from 'web-check-live/components/Form/Input'
import Button from 'web-check-live/components/Form/Button';
import { StyledCard } from 'web-check-live/components/Form/Card';
import Header from 'web-check-live/components/misc/Header';
import Footer from 'web-check-live/components/misc/Footer';

import docs from 'web-check-live/utils/docs';
import colors from 'web-check-live/styles/colors';
import { determineAddressType } from 'web-check-live/utils/address-type-checker';

const HomeContainer = styled.section`
  min-height: 100vh;
  background: ${colors.background};
`;

const MainContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 16px;
`;

const UserInputMain = styled.form`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 24px;
  margin: 24px auto;
  width: 100%;
  max-width: 48rem;
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
  margin: 0.5rem;
`;

const SiteFeaturesWrapper = styled(StyledCard)`
  margin: 24px auto;
  width: 100%;
  max-width: 48rem;
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 24px;
  .links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    a {
      flex: 1;
      button {
        width: 100%;
        height: 48px;
        font-weight: 500;
      }
    }
    @media(max-width: 600px) {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
  ul {
    -webkit-column-width: 180px;
    -moz-column-width: 180px;
    column-width: 180px;
    list-style: none;
    padding: 0;
    font-size: 0.95rem;
    color: ${colors.textColorSecondary};
    line-height: 1.6;
    li {
      margin: 0.5rem 0;
      text-indent: -1.5rem;
      break-inside: avoid-column;
      padding-left: 1.5rem;
    }
    li:before {
      content: '✓';
      color: ${colors.primary};
      margin-right: 0.75rem;
      font-weight: 600;
    }
  }
  a {
    color: ${colors.primary};
  }
  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const Home = (): JSX.Element => {
  const defaultPlaceholder = 'e.g. https://duck.com/';
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrMsg] = useState('');
  const [placeholder] = useState(defaultPlaceholder);
  const [inputDisabled] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

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
        <UserInputMain onSubmit={formSubmitEvent}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: colors.primary,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px'
              }}>
                🔍
              </div>
              <Heading as="h2" size="large" color={colors.textColor} style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0'
              }}>
                Analyse de Conformité APDP
              </Heading>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
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
          { errorMsg && <ErrorMessage style={{
            color: colors.error,
            fontSize: '14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            padding: '12px',
            margin: '0 0 16px 0'
          }}>{errorMsg}</ErrorMessage>}
          <Button 
            type="submit" 
            styles="width: 100%; height: 48px; font-size: 16px; font-weight: 500;" 
            size="large" 
            onClick={submit}
          >
            Analyser
          </Button>
        </UserInputMain>
        
        <SiteFeaturesWrapper>
          <div className="features">
            <Heading as="h2" size="small" color={colors.primary} style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>Capacités d'Analyse</Heading>
            <ul>
              {docs.map((doc, index) => (<li key={index}>{doc.title}</li>))}
              <li><Link to="/wiki" target="_blank" rel="noopener noreferrer">+ plus d'analyses!</Link></li>
            </ul>
          </div>
          <div className="links">
            <Link to="/check" title="Démarrer une analyse de conformité avec notre plateforme d'audit professionnel">
              <Button>Commencer l'Analyse</Button>
            </Link>
            <Link to="/wiki" target="_blank" rel="noopener noreferrer" title="Consulter le Wiki de l'Outil d'Audit de Conformité">
              <Button>Wiki</Button>
            </Link>
          </div>
        </SiteFeaturesWrapper>
        
        {/* Info Notice */}
        <div style={{
          backgroundColor: colors.backgroundDarker,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px',
          padding: '16px',
          margin: '24px auto',
          maxWidth: '48rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: colors.textColorThirdly,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: '0',
              marginTop: '2px'
            }}>
              <span style={{ color: 'white', fontSize: '12px' }}>ℹ</span>
            </div>
            <div>
              <p style={{ 
                fontSize: '14px', 
                color: colors.textColorSecondary,
                margin: '0',
                lineHeight: '1.5'
              }}>
                <strong>Outil professionnel APDP Monaco</strong> - Réservé aux contrôleurs pour les audits de conformité APDP et sécurité web. 
                Les rapports générés peuvent être utilisés dans le cadre des procédures officielles de contrôle.
              </p>
            </div>
          </div>
        </div>
        
        <Footer isFixed={false} />
      </MainContent>
    </HomeContainer>
  );
}

export default Home;
