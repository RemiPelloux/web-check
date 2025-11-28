import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from 'web-check-live/components/misc/ErrorBoundary';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';

export const StyledCard = styled.section<{ styles?: string}>`
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  margin: 0.5rem;
  max-height: 64rem;
  overflow: auto;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    margin: 0.375rem;
    border-radius: 8px;
  }
  
  @media (max-width: 599px) {
    padding: 0.75rem;
    margin: 0.25rem 0;
    border-radius: 8px;
    max-height: none;
  }
  
  /* Ensure content doesn't overflow */
  img, video, iframe, embed, object {
    max-width: 100%;
    height: auto;
  }
  
  pre, code {
    overflow-x: auto;
    max-width: 100%;
    word-break: break-all;
    
    @media (max-width: 599px) {
      font-size: 12px;
    }
  }
  
  table {
    width: 100%;
    overflow-x: auto;
    display: block;
    
    @media (max-width: 599px) {
      font-size: 13px;
    }
  }
  
  ${props => props.styles}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 599px) {
    gap: 8px;
    margin-bottom: 0.375rem;
  }
`;

const HeadingWrapper = styled.div`
  flex: 1;
  min-width: 0;
  
  .inner-heading {
    @media (max-width: 599px) {
      font-size: 14px !important;
    }
  }
`;

const RefCodeBadge = styled.span`
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 10px;
  background: rgba(100, 100, 100, 0.25);
  padding: 3px 8px;
  border-radius: 4px;
  color: ${colors.textColorSecondary};
  white-space: nowrap;
  letter-spacing: 0.5px;
  font-weight: 600;
  flex-shrink: 0;
  
  @media (max-width: 599px) {
    font-size: 9px;
    padding: 2px 6px;
  }
`;

interface CardProps {
  children: ReactNode;
  heading?: string;
  refCode?: string;
  styles?: string;
  actionButtons?: ReactNode | undefined;
}

export const Card = (props: CardProps): JSX.Element => {
  const { children, heading, refCode, styles, actionButtons } = props;
  return (
    <ErrorBoundary title={heading}>
      <StyledCard styles={styles}>
        { actionButtons && actionButtons }
        { heading && (
          <CardHeader>
            <HeadingWrapper>
              <Heading className="inner-heading" as="h3" align="left" color={colors.primary}>{heading}</Heading>
            </HeadingWrapper>
            {refCode && <RefCodeBadge>{refCode}</RefCodeBadge>}
          </CardHeader>
        )}
        {children}
      </StyledCard>
    </ErrorBoundary>
  );
}

export default StyledCard;
