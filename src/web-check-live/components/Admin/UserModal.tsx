import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

interface User {
  id: number;
  username: string;
  role: string;
  ip_restrictions: string;
}

interface UserModalProps {
  user: User | null;
  onClose: (refresh: boolean) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  margin: 0;
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
  color: ${colors.textColor};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  background: ${colors.background};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  background: ${colors.background};
  font-family: 'PT Mono', monospace;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid ${colors.borderColor};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textColor};
  background: ${colors.background};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.textColor};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${colors.primary};
`;

const HelpText = styled.div`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  margin-top: 4px;
`;

const GenerateButton = styled.button`
  padding: 8px 16px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  background: ${props =>
    props.variant === 'primary'
      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
      : colors.backgroundDarker};
  color: ${props => props.variant === 'primary' ? 'white' : colors.textColor};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${colors.borderColor}`};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.variant === 'primary'
        ? '0 8px 16px rgba(220, 38, 38, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserModal = ({ user, onClose }: UserModalProps): JSX.Element => {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'APDP' | 'DPD'>(user?.role as 'APDP' | 'DPD' || 'DPD');
  const [ipRestrictions, setIpRestrictions] = useState(user?.ip_restrictions || '');
  const [enableIpRestrictions, setEnableIpRestrictions] = useState(!!user?.ip_restrictions);
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('checkitAuthToken');
      const url = user
        ? `${API_BASE_URL}/admin/users/${user.id}`
        : `${API_BASE_URL}/admin/users`;
      
      const body: any = {
        username,
        role,
        ipRestrictions: enableIpRestrictions ? ipRestrictions : ''
      };

      // Only include password if it's provided
      if (password) {
        body.password = password;
      }

      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Operation failed');
      }

      toast.success(user ? 'Utilisateur mis à jour avec succès' : 'Utilisateur créé avec succès');
      onClose(true);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={() => onClose(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{user ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}</Title>
          <Subtitle>
            {user
              ? 'Modifiez les informations de l\'utilisateur'
              : 'Créez un nouveau compte utilisateur DPD'}
          </Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Nom d'utilisateur *</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="utilisateur@example.mc"
              required
              disabled={loading}
            />
            <HelpText>Format recommandé : email@domaine.mc</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">
              Mot de passe {user ? '(laisser vide pour ne pas changer)' : role === 'DPD' ? '(optionnel pour DPD)' : '*'}
            </Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez un mot de passe sécurisé"
                required={!user && role === 'APDP'}
                disabled={loading}
                style={{ flex: 1 }}
              />
              <GenerateButton type="button" onClick={generatePassword}>
                🎲 Générer
              </GenerateButton>
            </div>
            <HelpText>
              {role === 'DPD' 
                ? 'Les DPD n\'ont pas besoin de mot de passe (connexion par IP uniquement)'
                : 'Minimum 8 caractères recommandés pour les administrateurs APDP'}
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="role">Rôle *</Label>
            <Select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'APDP' | 'DPD')}
              disabled={loading}
            >
              <option value="DPD">DPD - Délégué à la Protection des Données</option>
              <option value="APDP">APDP - Administrateur</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                checked={enableIpRestrictions}
                onChange={(e) => setEnableIpRestrictions(e.target.checked)}
                disabled={loading}
              />
              <span>Activer les restrictions IP</span>
            </CheckboxWrapper>
          </FormGroup>

          {enableIpRestrictions && (
            <FormGroup>
              <Label htmlFor="ipRestrictions">Adresses IP autorisées</Label>
              <Textarea
                id="ipRestrictions"
                value={ipRestrictions}
                onChange={(e) => setIpRestrictions(e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
                disabled={loading}
              />
              <HelpText>
                Séparez les adresses IP par des virgules. L'utilisateur ne pourra se connecter
                que depuis ces adresses.
              </HelpText>
            </FormGroup>
          )}

          <ButtonGroup>
            <Button type="button" onClick={() => onClose(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default UserModal;

