import { useState } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

interface CopyableLinkProps {
  url: string;
  label?: string;
  showIcon?: boolean;
  isCode?: boolean;
}

const LinkContainer = styled.span<{ isCode?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  
  a {
    color: ${colors.primary};
    text-decoration: none;
    &:visited { 
      opacity: 0.8; 
    }
    &:hover {
      text-decoration: underline;
    }
  }

  ${props => props.isCode && `
    background: ${colors.background};
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-family: 'PTMono', monospace;
    font-size: 0.9em;
  `}
`;

const CopyButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.primary};
  border-radius: 4px;
  padding: 0.25rem 0.4rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: ${colors.primary};
  
  &:hover {
    background: ${colors.primary};
    color: ${colors.background};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Toast = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: ${colors.primary};
  color: ${colors.background};
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 9999;
  opacity: ${props => props.show ? 1 : 0};
  transform: translateY(${props => props.show ? 0 : '10px'});
  transition: all 0.3s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

const CopyableLink = ({ url, label, showIcon = true, isCode = false }: CopyableLinkProps): JSX.Element => {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <LinkContainer isCode={isCode}>
        <a href={url} target="_blank" rel="noreferrer">
          {label || url}
        </a>
        {showIcon && (
          <CopyButton onClick={handleCopy} title="Copier le lien">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </CopyButton>
        )}
      </LinkContainer>
      <Toast show={showToast}>
        ✓ Lien copié dans le presse-papiers
      </Toast>
    </>
  );
};

export default CopyableLink;

