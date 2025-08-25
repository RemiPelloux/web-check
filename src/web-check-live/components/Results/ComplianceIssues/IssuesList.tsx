import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import IssueCard from './IssueCard';

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

interface IssuesListProps {
  issues: Issue[];
  title: string;
  totalCount: number;
  type: 'critical' | 'warning' | 'improvement';
}

const Container = styled.div`
  background: ${colors.background};
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${colors.borderColor};
  margin-bottom: 24px;
`;

const Header = styled.div<{ type: string }>`
  background: ${({ type }) => 
    type === 'critical' ? 'rgba(220, 38, 38, 0.05)' :
    type === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
    'rgba(16, 185, 129, 0.05)'
  };
  border-bottom: 1px solid ${colors.borderColor};
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: ${({ type }) => 
    type === 'critical' ? '#dc2626' :
    type === 'warning' ? '#f59e0b' :
    '#10b981'
  };
  color: white;
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textColor};
  margin: 0;
`;

const CountBadge = styled.span<{ type: string }>`
  background: ${({ type }) => 
    type === 'critical' ? '#dc2626' :
    type === 'warning' ? '#f59e0b' :
    '#10b981'
  };
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const Content = styled.div`
  padding: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textColorThirdly};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${({ active }) => active ? colors.primary : colors.backgroundLighter};
  color: ${({ active }) => active ? 'white' : colors.textColorSecondary};
  border: 1px solid ${({ active }) => active ? colors.primary : colors.borderColor};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${({ active }) => active ? colors.primary : colors.backgroundDarker};
  }
`;

const IssuesList: React.FC<IssuesListProps> = ({ issues, title, totalCount, type }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(issues.map(issue => issue.category)));
    return ['all', ...cats];
  }, [issues]);

  const priorities = useMemo(() => {
    const pris = Array.from(new Set(issues.map(issue => issue.priority).filter(Boolean)));
    return ['all', ...pris];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || issue.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [issues, selectedCategory, selectedPriority]);

  const getHeaderIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  const getEmptyIcon = (type: string) => {
    switch (type) {
      case 'critical': return '✅';
      case 'warning': return '👍';
      default: return '🎯';
    }
  };

  const getEmptyMessage = (type: string) => {
    switch (type) {
      case 'critical': return 'Aucun problème critique détecté';
      case 'warning': return 'Aucun avertissement à signaler';
      default: return 'Aucune amélioration suggérée';
    }
  };

  const handleActionClick = (issueId: string) => {
    // Handle issue action (e.g., show details, mark as resolved, etc.)
    console.log('Action clicked for issue:', issueId);
  };

  return (
    <Container>
      <Header type={type}>
        <HeaderLeft>
          <HeaderIcon type={type}>
            {getHeaderIcon(type)}
          </HeaderIcon>
          <HeaderTitle>{title}</HeaderTitle>
        </HeaderLeft>
        <CountBadge type={type}>{totalCount} éléments</CountBadge>
      </Header>

      <Content>
        {issues.length === 0 ? (
          <EmptyState>
            <EmptyIcon>{getEmptyIcon(type)}</EmptyIcon>
            <EmptyText>{getEmptyMessage(type)}</EmptyText>
          </EmptyState>
        ) : (
          <>
            <FilterBar>
              {categories.map(category => (
                <FilterButton
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Toutes catégories' : category}
                </FilterButton>
              ))}
              {priorities.length > 1 && priorities.map(priority => (
                <FilterButton
                  key={`priority-${priority}`}
                  active={selectedPriority === priority}
                  onClick={() => setSelectedPriority(priority || 'all')}
                >
                  {priority === 'all' ? 'Toutes priorités' : `Priorité ${priority}`}
                </FilterButton>
              ))}
            </FilterBar>

            {filteredIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onActionClick={handleActionClick}
              />
            ))}

            {filteredIssues.length !== issues.length && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: colors.textColorThirdly,
                fontSize: '14px'
              }}>
                Affichage de {filteredIssues.length} sur {issues.length} éléments
              </div>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default IssuesList;
