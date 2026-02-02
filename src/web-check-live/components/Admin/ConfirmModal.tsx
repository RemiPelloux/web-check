import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  padding: 28px;
  max-width: 420px;
  width: 90%;
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
`;

const IconContainer = styled.div<{ danger?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.danger 
    ? 'rgba(220, 38, 38, 0.1)' 
    : 'rgba(59, 130, 246, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textColor};
  text-align: center;
  margin: 0 0 12px;
`;

const Message = styled.p`
  font-size: 14px;
  color: ${colors.textColorSecondary};
  text-align: center;
  margin: 0 0 24px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
          }
        `;
      case 'primary':
        return `
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
          }
        `;
      default:
        return `
          background: ${colors.backgroundDarker};
          color: ${colors.textColor};
          border: 1px solid ${colors.borderColor};
          
          &:hover:not(:disabled) {
            background: ${colors.background};
            border-color: ${colors.textColorSecondary};
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}: ConfirmModalProps): JSX.Element | null => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <IconContainer danger={danger}>
          {danger ? '⚠️' : 'ℹ️'}
        </IconContainer>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner />}
            {confirmText}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ConfirmModal;

