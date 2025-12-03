
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Button from 'web-check-live/components/Form/Button';
import Row, { ExpandableRow } from 'web-check-live/components/Form/Row';

const InfoBox = styled.div`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.primary}40;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
`;

// Check if data is from direct TLS fallback
const isDirectTlsData = (results: any) => {
  return results && (results.protocol || results.cipher) && !results.analysis;
};

// Create fallback display for direct TLS data
const makeFallbackSupport = (results: any) => {
  if (!isDirectTlsData(results)) return null;
  
  return {
    protocol: results.protocol,
    cipher: results.cipher,
    bits: results.bits,
    securityLevel: results.securityLevel,
    hostname: results.hostname,
  };
};

const makeClientSupport = (results: any) => {
  if (!results?.analysis || results.analysis.length < 1) return [];
  
  try {
    const target = results.target;
    const sslLabsAnalyzer = results.analysis.find((a: any) => a.analyzer === 'sslLabsClientSupport');
    
    if (!sslLabsAnalyzer?.result) return [];
    
    const sslLabsClientSupport = sslLabsAnalyzer.result;

    return sslLabsClientSupport.map((sup: any) => {
      return {
        title: `${sup.name} ${sup.platform ? `(on ${sup.platform})` : sup.version}`,
        value: sup.is_supported ? '✅' : '❌',
        fields: sup.is_supported ? [
          sup.curve ? { lbl: 'Courbe', val: sup.curve } : {},
          { lbl: 'Protocole', val: sup.protocol },
          { lbl: 'Suite de chiffrement', val: sup.ciphersuite },
          { lbl: 'Code protocole', val: sup.protocol_code },
          { lbl: 'Code suite', val: sup.ciphersuite_code },
          { lbl: 'Code courbe', val: sup.curve_code },
        ] : [
          { lbl: '', val: '',
          plaintext: `L'hôte ${target} ne supporte pas ${sup.name} `
            + `${sup.version ? `version ${sup.version} ` : ''} `
            + `${sup.platform ? `sur ${sup.platform} ` : ''}`}
        ],
      };
    });
  } catch (e) {
    console.error('Error parsing TLS client support:', e);
    return [];
  }
};

const TlsCard = (props: {data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const isFallback = isDirectTlsData(props.data);
  const fallbackData = makeFallbackSupport(props.data);
  
  const [clientSupport, setClientSupport] = useState(makeClientSupport(props.data));
  const [loadState, setLoadState] = useState<undefined | 'loading' | 'success' | 'error'>(undefined);

  useEffect(() => {
    setClientSupport(makeClientSupport(props.data));
  }, [props.data]);

  const updateData = (id: number) => {
    setClientSupport([]);
    setLoadState('loading');
    const fetchUrl = `https://tls-observatory.services.mozilla.com/api/v1/results?id=${id}`;
    fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        setClientSupport(makeClientSupport(data));
        setLoadState('success');
    }).catch(() => {
      setLoadState('error');
    });
  };
  
  const scanId = props.data?.id;
  
  // Show fallback TLS info when Mozilla Observatory is unavailable
  if (isFallback && fallbackData) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
        <InfoBox>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            ℹ️ Analyse simplifiée (Mozilla TLS Observatory non disponible)
          </p>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
            L'analyse détaillée des clients n'est pas disponible. 
            Voici les informations de connexion TLS du serveur.
          </p>
        </InfoBox>
        <div style={{ marginTop: '1rem' }}>
          {fallbackData.protocol && <Row lbl="Protocole TLS" val={fallbackData.protocol} />}
          {fallbackData.cipher && <Row lbl="Suite de chiffrement" val={fallbackData.cipher} />}
          {fallbackData.bits && <Row lbl="Force" val={`${fallbackData.bits} bits`} />}
          {fallbackData.securityLevel && (
            <Row 
              lbl="Niveau de sécurité" 
              val={
                fallbackData.securityLevel === 'excellent' ? '🛡️ Excellent' :
                fallbackData.securityLevel === 'good' ? '✅ Bon' :
                fallbackData.securityLevel === 'acceptable' ? '⚠️ Acceptable' :
                fallbackData.securityLevel === 'weak' ? '❌ Faible' :
                fallbackData.securityLevel === 'insecure' ? '🚨 Non sécurisé' :
                '❓ Inconnu'
              } 
            />
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      {clientSupport.map((support: any, index: number) => {
        return (
        <ExpandableRow
          key={`tls-client-${index}`}
          lbl={support.title}
          val={support.value || '?'}
          rowList={support.fields}
        />
      )
      })}
      { !clientSupport.length && (
        <div>
          <p>Aucune entrée disponible pour l'analyse.<br />
            Cela arrive parfois lorsque le rapport n'a pas fini de se générer à temps.
          </p>
          {scanId && <Button loadState={loadState} onClick={() => updateData(scanId)}>Récupérer le rapport</Button>}
        </div>
      )}
    </Card>
  );
}

export default TlsCard;
