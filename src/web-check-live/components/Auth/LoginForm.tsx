import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
  animation: slideIn 0.4s ease-out;

  @media (max-width: 640px) {
    padding: 32px 24px;
  }

  @keyframes slideIn {
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

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.img`
  height: 80px;
  width: auto;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  ${props => props.hasIcon && 'padding-right: 44px;'}
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: #1e293b;
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #dc2626;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: shake 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const FooterText = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
`;

const InfoText = styled.div`
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'APDP' | 'DPD'>('DPD');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Periodic IP validation for DPD users (every 5 minutes)
  useEffect(() => {
    const validateIPPeriodically = async () => {
      const userRole = localStorage.getItem('checkitUserRole');
      const authToken = localStorage.getItem('checkitAuthToken');
      
      // Only validate for DPD users who are logged in
      if (userRole === 'DPD' && authToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/ip-auto`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            // IP no longer valid - logout
            console.log('IP validation failed - logging out');
            localStorage.clear();
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('IP validation error:', error);
        }
      }
    };
    
    // Check immediately on mount
    validateIPPeriodically();
    
    // Then check every 5 minutes
    const intervalId = setInterval(validateIPPeriodically, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For DPD users, use IP-based auto-authentication
      if (userType === 'DPD') {
        const response = await fetch(`${API_BASE_URL}/auth/ip-auto`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setError(data.message || `Votre adresse IP n'est pas autorisée. Veuillez contacter l'administrateur APDP.`);
            if (data.clientIp) {
              setError(`Votre adresse IP (${data.clientIp}) n'est pas autorisée. Veuillez contacter l'administrateur APDP.`);
            }
          } else {
            setError(data.message || 'Une erreur est survenue lors de l\'authentification automatique');
          }
          setLoading(false);
          return;
        }

        // Store authentication data
        const loginTimestamp = Date.now();
        const expiryTime = loginTimestamp + (24 * 60 * 60 * 1000); // 24 hours
        
        localStorage.setItem('checkitAuthToken', data.token);
        localStorage.setItem('checkitUser', JSON.stringify(data.user));
        localStorage.setItem('checkitUsername', data.user.username);
        localStorage.setItem('checkitUserRole', data.user.role);
        localStorage.setItem('checkitLoginTime', loginTimestamp.toString());
        localStorage.setItem('checkitSessionExpiry', expiryTime.toString());
        
        if (data.user.allowedUrls) {
          localStorage.setItem('checkitAllowedUrls', data.user.allowedUrls);
        }
        if (data.user.urlRestrictionMode) {
          localStorage.setItem('checkitUrlRestrictionMode', data.user.urlRestrictionMode);
        }
        if (data.user.company) {
          localStorage.setItem('checkitCompany', data.user.company);
        }

        setLoading(false);
        
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = '/check';
        }
        return;
      }

      // For APDP users, use traditional username/password login
      const body: any = { username };
      
      if (password) {
        body.password = password;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.message || 'Trop de tentatives. Veuillez réessayer plus tard.');
        } else if (response.status === 401) {
          setError(data.message || 'Identifiants invalides');
        } else if (response.status === 403) {
          setError(data.message || 'Accès refusé - IP non autorisée');
        } else {
          setError(data.message || 'Une erreur est survenue');
        }
        setLoading(false);
        return;
      }

      // Store authentication data with timestamp for 24h session
      const loginTimestamp = Date.now();
      const expiryTime = loginTimestamp + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
      localStorage.setItem('checkitAuthToken', data.token);
      localStorage.setItem('checkitUser', JSON.stringify(data.user));
      localStorage.setItem('checkitUsername', data.user.username);
      localStorage.setItem('checkitUserRole', data.user.role);
      localStorage.setItem('checkitLoginTime', loginTimestamp.toString());
      localStorage.setItem('checkitSessionExpiry', expiryTime.toString());

      // Redirect to home page
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Impossible de se connecter. Vérifiez votre connexion internet.');
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <Logo src="/assets/images/Logo-APDP.svg" alt="APDP Monaco" />
          <Title>Connexion</Title>
          <Subtitle>Outil d'Audit de Conformité - Accès Sécurisé</Subtitle>
        </LogoContainer>

        {error && (
          <ErrorMessage>
            <span>⚠️</span>
            <span>{error}</span>
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="userType">Type de connexion</Label>
            <Select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'APDP' | 'DPD')}
              disabled={loading}
            >
              <option value="DPD">🏢 DPD - Délégué à la Protection des Données</option>
              <option value="APDP">⚙️ APDP - Administrateur</option>
            </Select>
          </FormGroup>

          {/* Username field - only shown for APDP users */}
          {userType === 'APDP' && (
            <FormGroup>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                required
                autoComplete="username"
                disabled={loading}
              />
            </FormGroup>
          )}

          {userType === 'APDP' && (
            <FormGroup>
              <Label htmlFor="password">Mot de passe</Label>
              <InputWrapper>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  hasIcon
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>
          )}

          {userType === 'DPD' && (
            <FormGroup>
              <InfoText style={{ 
                fontSize: '13px', 
                color: '#64748b', 
                fontStyle: 'italic',
                padding: '12px 16px',
                background: 'rgba(100, 116, 139, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(100, 116, 139, 0.1)'
              }}>
                ℹ️ Authentification automatique par adresse IP.
                <br />
                Cliquez sur "Se connecter" pour vérifier votre autorisation d'accès.
              </InfoText>
            </FormGroup>
          )}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </SubmitButton>
        </Form>

        <Footer>
          <FooterText>
            Autorité de Protection des Données Personnelles
            <br />
            Monaco
          </FooterText>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginForm;

