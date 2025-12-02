/**
 * WikiTableOfContents - Table of contents for wiki
 * 
 * Displays a numbered list of chapters with anchor links
 */

import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';

// ============================================
// Types
// ============================================

interface DocItem {
  id: string;
  title: string;
}

interface WikiTableOfContentsProps {
  docs: DocItem[];
  className?: string;
}

// ============================================
// Styled Components
// ============================================

const TOCContainer = styled.div`
  background: ${colors.backgroundDarker};
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
`;

const TOCList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2;
  column-gap: 24px;
  
  @media (max-width: 768px) {
    columns: 1;
  }
`;

const TOCItem = styled.li`
  break-inside: avoid;
  margin-bottom: 8px;
`;

const TOCLink = styled.a`
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: ${colors.textColor};
  text-decoration: none;
  font-size: 14px;
  line-height: 1.6;
  transition: color 0.2s;
  
  &:hover {
    color: ${colors.primary};
  }
  
  &:visited {
    opacity: 0.9;
  }
`;

const TOCNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(220, 38, 38, 0.1);
  color: ${colors.primary};
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;

const TOCTitle = styled.span`
  flex: 1;
`;

// ============================================
// Helper
// ============================================

const makeAnchor = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "-");
};

// ============================================
// Component
// ============================================

const WikiTableOfContents = ({ 
  docs, 
  className 
}: WikiTableOfContentsProps): JSX.Element => {
  if (docs.length === 0) {
    return <></>;
  }
  
  return (
    <TOCContainer className={className}>
      <TOCList>
        {docs.map((doc, index) => (
          <TOCItem key={doc.id}>
            <TOCLink href={`#${makeAnchor(doc.title)}`}>
              <TOCNumber>{index + 1}</TOCNumber>
              <TOCTitle>{doc.title}</TOCTitle>
            </TOCLink>
          </TOCItem>
        ))}
      </TOCList>
    </TOCContainer>
  );
};

export default WikiTableOfContents;



