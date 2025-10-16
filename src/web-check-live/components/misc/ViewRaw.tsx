import React, { useState } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Button from 'web-check-live/components/Form/Button';
import JsonViewer from './JsonViewer';

const CardStyles = `
margin: 0 auto 1rem auto;
width: 95vw;
position: relative;
transition: all 0.2s ease-in-out;
display: flex;
flex-direction: column;
a {
  color: ${colors.primary};
}
.controls {
  display: flex;
  flex-wrap: wrap;
  button {
    max-width: 300px;
  }
}
small {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.5;
}
`;

const ViewerToggle = styled.div`
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  
  label {
    font-size: 0.9rem;
    color: ${colors.textColorSecondary};
  }
`;

const ViewRaw = (props: { everything: { id: string, result: any}[] }) => {
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const makeResults = () => {
    const result: {[key: string]: any} = {};
    props.everything.forEach((item: {id: string, result: any}) => {
      result[item.id] = item.result;
    });
    return result;
  };

  const fetchResultsUrl = async () => {
    const resultContent = makeResults();
    const response = await fetch('https://jsonhero.io/api/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'web-check results',
        content: resultContent,
        readOnly: true,
        ttl: 3600,
      })
    });
    if (!response.ok) {
      setError(`HTTP error! status: ${response.status}`);
    } else {
      setError(null);
    }
    await response.json().then(
      (data) => setResultUrl(data.location)
    )
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(makeResults(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'web-check-results.json';
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Card heading="Voir / Télécharger les Données Brutes" styles={CardStyles}>
      <div className="controls">
        <Button onClick={handleDownload}>📥 Télécharger JSON</Button>
        <Button onClick={() => setShowViewer(!showViewer)}>
          {showViewer ? '🙈 Masquer' : '👁️ Visualiser'} les Données
        </Button>
        <Button onClick={fetchResultsUrl}>🔗 Partager via JSON Hero</Button>
      </div>
      
      {showViewer && (
        <>
          <ViewerToggle>
            <label>Visualiseur JSON intégré avec coloration syntaxique et arbres repliables ▼</label>
          </ViewerToggle>
          <JsonViewer data={makeResults()} />
        </>
      )}
      
      { resultUrl && !error && (
        <small style={{ display: 'block', marginTop: '1rem', padding: '0.75rem', background: colors.backgroundDarker, borderRadius: '6px' }}>
          ✅ Lien partageable créé : <a href={resultUrl} target="_blank" rel="noopener noreferrer">Ouvrir dans JSON Hero</a>
          <br />
          <em>Ce lien expirera dans 1 heure</em>
        </small>
      )}
      
      { error && (
        <p style={{ color: '#ef4444', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', marginTop: '1rem' }}>
          ⚠️ Erreur: {error}
        </p>
      )}
      
      <small style={{ display: 'block', marginTop: '1rem', opacity: 0.7 }}>
        Ces données brutes au format JSON peuvent être importées dans votre propre programme pour analyse approfondie.
      </small>
    </Card>
  );
};

export default ViewRaw;
