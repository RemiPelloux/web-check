/**
 * PluginDocRenderer - Shared plugin documentation rendering component
 * 
 * Renders plugin documentation content (title, description, use case, resources, screenshot).
 * Used by both WikiChapter and PluginDocModal for consistent documentation display.
 */

import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import CopyableLink from 'web-check-live/components/misc/CopyableLink';

// ============================================
// Types
// ============================================

export interface Resource {
  title: string;
  link: string;
}

export interface PluginDocData {
  id: string;
  title: string;
  description: string;
  use_case: string;
  resources: Resource[];
  screenshot_url?: string;
}

interface PluginDocRendererProps {
  doc: PluginDocData;
  showScreenshot?: boolean;
  screenshotIndex?: number;
}

// ============================================
// Styled Components
// ============================================

const Container = styled.div`
  line-height: 1.7;
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

const ClickableLink = styled.a`
  color: ${colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Disclaimer = styled.p`
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-bottom: 0.5rem;
  margin-top: -0.5rem;
  font-weight: bold;
`;

// ============================================
// Helpers
// ============================================

export const isApdpDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith('apdp.mc') || hostname === 'apdp.mc';
  } catch {
    return false;
  }
};

const renderContent = (content: string): JSX.Element => {
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return <Description dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <Description><p>{content}</p></Description>;
};

// ============================================
// Component
// ============================================

const PluginDocRenderer = ({ 
  doc, 
  showScreenshot = true,
  screenshotIndex
}: PluginDocRendererProps): JSX.Element => {
  const isPrivacyPolicy = doc.id === 'apdp-privacy-policy';
  
  return (
    <Container>
      <Heading as="h3" size="medium" color={colors.primary}>
        {doc.title}
      </Heading>
      
      {showScreenshot && doc.screenshot_url && (
        <Screenshot>
          <img 
            src={doc.screenshot_url} 
            alt={`Exemple ${doc.title}`}
            loading="lazy"
          />
          {screenshotIndex !== undefined && (
            <Caption>Fig.{screenshotIndex + 1} - Exemple de {doc.title}</Caption>
          )}
        </Screenshot>
      )}
      
      {doc.description && (
        <>
          <Heading as="h4" size="small">À propos</Heading>
          {renderContent(doc.description)}
        </>
      )}
      
      {doc.use_case && (
        <>
          <Heading as="h4" size="small">Cas d'usage</Heading>
          {renderContent(doc.use_case)}
        </>
      )}
      
      {doc.resources && doc.resources.length > 0 && (
        <>
          <Heading as="h4" size="small">Ressources Utiles</Heading>
          {!isPrivacyPolicy && (
            <Disclaimer>
              (Les liens ne sont pas cliquables mais uniquement copiables car l'APDP n'est pas en mesure de confirmer la conformité du site et de son contenu)
            </Disclaimer>
          )}
          <ResourceList>
            {doc.resources.map((resource, idx) => {
              const url = resource.link;
              const label = resource.title || resource.link;
              const isClickable = isApdpDomain(url);
              
              return (
                <li key={`resource-${idx}`}>
                  {isClickable ? (
                    <ClickableLink href={url} target="_blank" rel="noopener noreferrer">
                      {label}
                    </ClickableLink>
                  ) : (
                    <CopyableLink url={url} label={label !== url ? label : undefined} />
                  )}
                </li>
              );
            })}
          </ResourceList>
        </>
      )}
    </Container>
  );
};

export default PluginDocRenderer;


