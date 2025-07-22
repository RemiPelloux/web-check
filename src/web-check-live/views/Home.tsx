import styled from '@emotion/styled';
import { type ChangeEvent, type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

import Heading from 'web-check-live/components/Form/Heading';
import Input from 'web-check-live/components/Form/Input'
import Button from 'web-check-live/components/Form/Button';
import { StyledCard } from 'web-check-live/components/Form/Card';
import Footer from 'web-check-live/components/misc/Footer';
import FancyBackground from 'web-check-live/components/misc/FancyBackground';

import docs from 'web-check-live/utils/docs';
import colors from 'web-check-live/styles/colors';
import { determineAddressType } from 'web-check-live/utils/address-type-checker';

const HomeContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 6rem 1rem;
  footer {
    z-index: 1;
  }
`;

const UserInputMain = styled.form`
  background: ${colors.backgroundCard};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 3rem 2rem;
  margin: 2rem auto;
  width: calc(100% - 2rem);
  max-width: 48rem;
  z-index: 2;
  backdrop-filter: blur(10px);
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
  margin: 2rem auto;
  width: calc(100% - 2rem);
  max-width: 48rem;
  z-index: 2;
  background: ${colors.backgroundCard};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 2rem;
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
  const submit = () => {
    let address = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
    const addressType = determineAddressType(address);
  
    if (addressType === 'empt') {
      setErrMsg('Field must not be empty');
    } else if (addressType === 'err') {
      setErrMsg('Must be a valid URL, IPv4 or IPv6 Address');
    } else {
      // if the addressType is 'url' and address doesn't start with 'http://' or 'https://', prepend 'https://'
      if (addressType === 'url' && !/^https?:\/\//i.test(address)) {
        address = 'https://' + address;
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
      <FancyBackground />
      <UserInputMain onSubmit={formSubmitEvent}>
        <a href="/" style={{ textDecoration: 'none', marginBottom: '2rem', display: 'block' }}>
          <Heading as="h1" size="xLarge" align="center" color={colors.primary} style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <img width="48" src="/web-check.png" alt="BeCompliant Icon" style={{ borderRadius: '8px' }} />
            BeCompliant
          </Heading>
        </a>
        <div style={{ width: '100%', marginBottom: '1.5rem' }}>
          <Input
            id="user-input"
            value={userInput}
            label="Enter URL for Compliance Assessment"
            size="large"
            orientation="vertical"
            name="url"
            placeholder={placeholder}
            disabled={inputDisabled}
            handleChange={inputChange}
            handleKeyDown={handleKeyPress}
          />
        </div>
        {/* <FindIpButton onClick={findIpAddress}>Or, find my IP</FindIpButton> */}
        { errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        <Button 
          type="submit" 
          styles="width: 100%; height: 56px; font-size: 1.1rem; font-weight: 600;" 
          size="large" 
          onClick={submit}
        >
          Start Compliance Assessment
        </Button>
      </UserInputMain>
      <SiteFeaturesWrapper>
        <div className="features">
          <Heading as="h2" size="small" color={colors.primary}>Compliance Assessments</Heading>
          <ul>
            {docs.map((doc, index) => (<li key={index}>{doc.title}</li>))}
            <li><Link to="/check/about">+ more assessments!</Link></li>
          </ul>
        </div>
        <div className="links">
          <Link to="/check" title="Start compliance assessment with our professional auditing platform">
            <Button>Start Assessment</Button>
          </Link>
          <Link to="/check/about#api-documentation" title="View the API documentation, to use BeCompliant programmatically">
            <Button>API Documentation</Button>
          </Link>
        </div>
      </SiteFeaturesWrapper>
      <Footer isFixed={true} />
    </HomeContainer>
  );
}

export default Home;
