/**
 * WikiChapter - Single wiki chapter display
 * 
 * Renders a chapter with title, screenshot, description, use case, and resources
 */

import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import CopyableLink from 'web-check-live/components/misc/CopyableLink';

// ============================================
// Types
// ============================================

interface Resource {
  title: string;
  link: string;
}

export interface Doc {
  id: string;
  title: string;
  description: string;
  use: string;
  resources: (string | Resource)[];
  screenshot?: string;
}

interface WikiChapterProps {
  doc: Doc;
  index: number;
  showDivider?: boolean;
}

// ============================================
// Styled Components
// ============================================

const ChapterSection = styled.section`
  margin-bottom: 24px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed ${colors.primary};
  margin: 24px auto;
`;

const Screenshot = styled.figure`
  float: right;
  display: inline-flex;
  flex-direction: column;
  clear: both;
  max-width: 300px;
  margin-left: 24px;
  margin-bottom: 16px;
  margin-top: 0;
  
  @media (max-width: 768px) {
    float: none;
    max-width: 100%;
    margin-left: 0;
    margin-bottom: 20px;
  }
  
  img {
    max-width: 300px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid ${colors.borderColor};
    
    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
`;

const Caption = styled.figcaption`
  font-size: 12px;
  text-align: center;
  opacity: 0.7;
  margin-top: 8px;
  color: ${colors.textColorSecondary};
`;

const Description = styled.div`
  line-height: 1.7;
  margin-bottom: 16px;
  color: ${colors.textColor};
  
  p {
    margin: 0 0 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    padding-left: 20px;
    margin: 8px 0;
  }
  
  li {
    margin-bottom: 6px;
  }
  
  h4 {
    color: ${colors.primary};
    margin: 16px 0 8px;
    font-size: 14px;
    font-weight: 600;
  }
  
  code {
    background: ${colors.backgroundDarker};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  .info-box {
    background: rgba(220, 38, 38, 0.05);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const ResourceList = styled.ul`
  padding: 0 0 0 16px;
  list-style: circle;
  
  li {
    margin-bottom: 8px;
  }
`;

// ============================================
// Helpers
// ============================================

const makeAnchor = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "-");
};

const renderContent = (content: string): JSX.Element => {
  // If content contains HTML tags, render as HTML
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return <Description dangerouslySetInnerHTML={{ __html: content }} />;
  }
  // Otherwise render as plain text
  return <Description><p>{content}</p></Description>;
};

// ============================================
// Component
// ============================================

const WikiChapter = ({ 
  doc, 
  index, 
  showDivider = true 
}: WikiChapterProps): JSX.Element => {
  return (
    <ChapterSection>
      {showDivider && index > 0 && <Divider />}
      
      <Heading 
        as="h3" 
        size="small" 
        id={makeAnchor(doc.title)} 
        color={colors.primary}
      >
        {doc.title}
      </Heading>
      
      {doc.screenshot && (
        <Screenshot>
          <img 
            src={doc.screenshot} 
            alt={`Exemple ${doc.title}`}
            loading="lazy"
          />
          <Caption>Fig.{index + 1} - Exemple de {doc.title}</Caption>
        </Screenshot>
      )}
      
      {doc.description && (
        <>
          <Heading as="h4" size="small">Description</Heading>
          {renderContent(doc.description)}
        </>
      )}
      
      {doc.use && (
        <>
          <Heading as="h4" size="small">Cas d'Usage</Heading>
          {renderContent(doc.use)}
        </>
      )}
      
      {doc.resources && doc.resources.length > 0 && (
        <>
          <Heading as="h4" size="small">Ressources Utiles</Heading>
          <Description style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginBottom: '0.5rem', marginTop: '-0.5rem' }}>
            (Les liens ne sont pas cliquables mais uniquement copiable car l'APDP n'est pas en mesure de confirmer la conformité du site et de son contenu)
          </Description>
          <ResourceList>
            {doc.resources.map((link, linkIdx) => (
              typeof link === 'string' ? (
                <li key={`link-${linkIdx}`}>
                  <CopyableLink url={link} />
                </li>
              ) : (
                <li key={`link-${linkIdx}`}>
                  <CopyableLink url={link.link} label={link.title} />
                </li>
              )
            ))}
          </ResourceList>
        </>
      )}
    </ChapterSection>
  );
};

export default WikiChapter;



