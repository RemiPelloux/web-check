import styled from '@emotion/styled';
import docs, { type Doc } from 'web-check-live/utils/docs';
import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';

const JobDocsContainer = styled.div`
p.doc-desc, p.doc-uses, ul {
  margin: 0.25rem auto 1.5rem auto;
}
ul {
  padding: 0 0.5rem 0 1rem;
}
summary { color: ${colors.primary};}
h4 {
  border-top: 1px solid ${colors.primary};
  color: ${colors.primary};
  opacity: 0.75;
  padding: 0.5rem 0;
}
`;

const ReferenceItem = styled.li`
  margin-bottom: 0.75rem;
  list-style: decimal;
  
  .ref-title {
    font-weight: 600;
    color: ${colors.textColor};
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .ref-url-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: ${colors.backgroundDarker};
    padding: 0.35rem 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
  }
  
  .ref-url {
    color: ${colors.textColorSecondary};
    word-break: break-all;
    flex: 1;
    user-select: all;
  }
  
  .copy-btn {
    background: ${colors.primary};
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.75rem;
    white-space: nowrap;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.8;
    }
    
    &:active {
      opacity: 0.6;
    }
  }
`;

const copyToClipboard = (text: string, btn: HTMLButtonElement) => {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✓ Copié';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1500);
  });
};

const DocContent = (id: string) => {
  console.log('[DocContent] Looking for id:', id);
  console.log('[DocContent] Available IDs:', docs.map(d => d.id));
  const doc = docs.filter((doc: Doc) => doc.id === id)[0] || null;
  console.log('[DocContent] Found doc:', doc ? doc.title : 'NULL');
  return (
    doc? (<JobDocsContainer>
      <Heading as="h3" size="medium" color={colors.primary}>{doc.title}</Heading>
      <Heading as="h4" size="small">À propos</Heading>
      <p className="doc-desc">{doc.description}</p>
      <Heading as="h4" size="small">Cas d'usage</Heading>
      <p className="doc-uses">{doc.use}</p>
      <Heading as="h4" size="small">Liens de référence</Heading>
      <ol>
        {doc.resources.map((resource: string | { title: string, link: string } , index: number) => {
          const url = typeof resource === 'string' ? resource : resource.link;
          const title = typeof resource === 'string' ? resource : resource.title;
          return (
            <ReferenceItem key={`ref-${index}`}>
              <span className="ref-title">{title}</span>
              <div className="ref-url-container">
                <span className="ref-url">{url}</span>
                <button 
                  className="copy-btn"
                  onClick={(e) => copyToClipboard(url, e.currentTarget)}
                >
                  Copier
                </button>
              </div>
            </ReferenceItem>
          );
        })}
      </ol>
      {doc.screenshot && (
        <details>
          <summary><Heading as="h4" size="small">Exemple</Heading></summary>
          <img width="300" src={doc.screenshot} alt="Capture d'écran" />
        </details>
      )}
    </JobDocsContainer>)
  : (
    <JobDocsContainer>
      <p>Aucune documentation n'est encore disponible pour ce widget.</p>
    </JobDocsContainer>
    ));
};

export default DocContent;
