import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

const CardContainer = styled.div`
  background: ${colors.backgroundLighter};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${colors.borderColor};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const CardHeader = styled.div`
  font-weight: 700;
  color: ${colors.textColor};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface DetailCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, title, children }) => {
  return (
    <CardContainer>
      <CardHeader>
        {icon} {title}
      </CardHeader>
      {children}
    </CardContainer>
  );
};

export default DetailCard;






