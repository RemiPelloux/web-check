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
  
  // Check if user is DPD
  const userProfile = localStorage.getItem('checkitUser');
  const isDPD = userProfile ? JSON.parse(userProfile).role === 'DPD' : false;
  
  // Don't render for DPD users
  if (isDPD) {
    return null;
  }

  const makeResults = () => {
    const result: {[key: string]: any} = {};
    props.everything.forEach((item: {id: string, result: any}) => {
      result[item.id] = item.result;
    });
    return result;
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
      </div>
      
      {showViewer && (
        <>
          <ViewerToggle>
            <label>Visualiseur JSON intégré avec coloration syntaxique et arbres repliables ▼</label>
          </ViewerToggle>
          <JsonViewer data={makeResults()} />
        </>
      )}
      
      <small style={{ display: 'block', marginTop: '1rem', opacity: 0.7 }}>
        Ces données brutes au format JSON peuvent être importées dans votre propre programme pour analyse approfondie.
      </small>
    </Card>
  );
};

export default ViewRaw;
