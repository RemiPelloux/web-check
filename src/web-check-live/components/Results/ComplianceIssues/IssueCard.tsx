import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

interface Issue {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  severity: 'Critique' | 'Attention' | 'Amélioration';
  title: string;
  description: string;
  category: string;
  recommendation: string;
  article?: string;
  priority?: 'high' | 'medium' | 'low';
  impact?: string;
  effort?: string;
}

interface IssueCardProps {
  issue: Issue;
  onActionClick?: (issueId: string) => void;
}

const CardContainer = styled.div<{ severity: string }>`
  background: ${colors.background};
  border: 1px solid ${({ severity }) => 
    severity === 'Critique' ? '#dc2626' :
    severity === 'Attention' ? '#f59e0b' :
    '#10b981'
  };
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ severity }) => 
      severity === 'Critique' ? '#dc2626' :
      severity === 'Attention' ? '#f59e0b' :
      '#10b981'
    };
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const IssueHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`;

const SeverityIcon = styled.div<{ severity: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: ${({ severity }) => 
    severity === 'Critique' ? '#dc2626' :
    severity === 'Attention' ? '#f59e0b' :
    '#10b981'
  };
`;

const IssueTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0;
  line-height: 1.3;
`;

const CategoryBadge = styled.span`
  background: ${colors.backgroundLighter};
  color: ${colors.textColorSecondary};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background: ${({ severity }) => 
    severity === 'Critique' ? 'rgba(220, 38, 38, 0.1)' :
    severity === 'Attention' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(16, 185, 129, 0.1)'
  };
  color: ${({ severity }) => 
    severity === 'Critique' ? '#dc2626' :
    severity === 'Attention' ? '#f59e0b' :
    '#10b981'
  };
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const IssueDescription = styled.p`
  color: ${colors.textColorSecondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  padding-left: 56px;
`;

const RecommendationSection = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  padding: 16px;
  margin-left: 56px;
  border-left: 3px solid ${colors.primary};
`;

const RecommendationTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendationText = styled.p`
  color: ${colors.textColorSecondary};
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
`;

const ActionButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${colors.textColorThirdly};
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.backgroundLighter};
    color: ${colors.textColorSecondary};
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-left: 56px;
  font-size: 12px;
  color: ${colors.textColorThirdly};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IssueCard: React.FC<IssueCardProps> = ({ issue, onActionClick }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critique': return '⚠';
      case 'Attention': return '⚡';
      default: return '💡';
    }
  };

  return (
    <CardContainer severity={issue.severity}>
      <ActionButton onClick={() => onActionClick?.(issue.id)}>
        👁
      </ActionButton>
      
      <IssueHeader>
        <SeverityIcon severity={issue.severity}>
          {getSeverityIcon(issue.severity)}
        </SeverityIcon>
        <IssueTitle>{issue.title}</IssueTitle>
        <CategoryBadge>{issue.category}</CategoryBadge>
        <SeverityBadge severity={issue.severity}>{issue.severity}</SeverityBadge>
      </IssueHeader>

      <IssueDescription>{issue.description}</IssueDescription>

      <RecommendationSection>
        <RecommendationTitle>
          🔧 RECOMMANDATION
        </RecommendationTitle>
        <RecommendationText>{issue.recommendation}</RecommendationText>
      </RecommendationSection>

      {(issue.article || issue.priority || issue.impact || issue.effort) && (
        <MetaInfo>
          {issue.article && <MetaItem>📋 {issue.article}</MetaItem>}
          {issue.priority && <MetaItem>⚡ Priorité: {issue.priority}</MetaItem>}
          {issue.impact && <MetaItem>📊 Impact: {issue.impact}</MetaItem>}
          {issue.effort && <MetaItem>⏱️ Effort: {issue.effort}</MetaItem>}
        </MetaInfo>
      )}
    </CardContainer>
  );
};

export default IssueCard;










