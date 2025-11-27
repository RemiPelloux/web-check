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
  ${props => props.styles}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0.5rem;
`;

const HeadingWrapper = styled.div`
  flex: 1;
  min-width: 0;
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
