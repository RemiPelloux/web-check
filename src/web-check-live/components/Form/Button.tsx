import { type ReactNode, type MouseEventHandler } from 'react';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import colors from 'web-check-live/styles/colors';
import { type InputSize, applySize } from 'web-check-live/styles/dimensions';

type LoadState = 'loading' | 'success' | 'error';

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: InputSize,
  bgColor?: string,
  fgColor?: string,
  styles?: string,
  title?: string,
  type?: 'button' | 'submit' | 'reset' | undefined,
  loadState?: LoadState,
};

const StyledButton = styled.button<ButtonProps>`
  cursor: pointer;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  box-sizing: border-box; 
  width: -moz-available;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  &:hover {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primaryTransparent};
  }
  ${props => applySize(props.size)};
  ${(props) => props.bgColor ?
    `background: ${props.bgColor};` : `background: ${colors.primary};`
  }
  ${(props) => props.fgColor ?
    `color: ${props.fgColor};` : `color: white;`
  }
  &:hover {
    ${(props) => props.bgColor ?
      `background: ${props.bgColor};` : `background: ${colors.primaryDarker};`
    }
  }
  ${props => props.styles}
`;


const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const SimpleLoader = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${colors.background};
  width: 1rem;
  height: 1rem;
  animation: ${spinAnimation} 1s linear infinite;
`;

const Loader = (props: { loadState: LoadState }) => {
  if (props.loadState === 'loading') return <SimpleLoader />
  if (props.loadState === 'success') return <span>✔</span>
  if (props.loadState === 'error') return <span>✗</span>
  return <span></span>;
};

const Button = (props: ButtonProps): JSX.Element => {
  const { children, size, bgColor, fgColor, onClick, styles, title, loadState, type } = props;
  return (
    <StyledButton
      onClick={onClick || (() => null) }
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      styles={styles}
      title={title?.toString()}
      type={type || 'button'}
      >
      { loadState && <Loader loadState={loadState} /> }
      {children}
    </StyledButton>
  );
};

export default Button;
