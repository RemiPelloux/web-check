
import { useState, useEffect } from 'react';
import { Card } from 'web-check-live/components/Form/Card';
import Button from 'web-check-live/components/Form/Button';
import { ExpandableRow } from 'web-check-live/components/Form/Row';

const makeCipherSuites = (results: any) => {
  // Backend sends supportedCiphers array
  if (!results || (!results.supportedCiphers && !results.connection_info)) {
    return [];
  }
  
  // Try new backend format first (supportedCiphers)
  const ciphers = results.supportedCiphers || results.connection_info?.ciphersuite || [];
  
  if (ciphers.length === 0) {
    return [];
  }

  return ciphers.map((ciphersuite: any) => {
    // New format: { name, version, bits }
    if (ciphersuite.name) {
      return {
        title: ciphersuite.name,
        fields: [
          { lbl: 'Version TLS', val: results.tlsVersions?.[0] || ciphersuite.version || 'N/A' },
          { lbl: 'Force de chiffrement', val: `${ciphersuite.bits} bits` },
          { lbl: 'Niveau de sécurité', val: results.securityLevel || 'inconnu' },
        ]
      };
    }
    
    // Old format: Mozilla Observatory
    return {
      title: ciphersuite.cipher,
      fields: [
        { lbl: 'Code', val: ciphersuite.code },
        { lbl: 'Protocoles', val: ciphersuite.protocols?.join(', ') || 'N/A' },
        { lbl: 'Clé publique', val: ciphersuite.pubkey },
        { lbl: 'Algorithme signature', val: ciphersuite.sigalg },
        { lbl: 'OCSP Stapling', val: ciphersuite.ocsp_stapling ? '✅ Activé' : '❌ Désactivé' },
        { lbl: 'PFS', val: ciphersuite.pfs },
        ciphersuite.curves ? { lbl: 'Courbes', val: ciphersuite.curves.join(', ') } : {},
      ]
    };
  });
};

const TlsCard = (props: {data: any, title: string, actionButtons: any }): JSX.Element => {

  const [cipherSuites, setCipherSuites] = useState(makeCipherSuites(props.data));
  const [loadState, setLoadState] = useState<undefined | 'loading' | 'success' | 'error'>(undefined);

  useEffect(() => { // Update cipher suites when data changes
    setCipherSuites(makeCipherSuites(props.data));
  }, [props.data]);

  const updateData = (id: number) => {
    setCipherSuites([]);
    setLoadState('loading');
    const fetchUrl = `https://tls-observatory.services.mozilla.com/api/v1/results?id=${id}`;
    fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        setCipherSuites(makeCipherSuites(data));
        setLoadState('success');
    }).catch((error) => {
      setLoadState('error');
    });
  };
  
  const scanId = props.data?.id;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      { cipherSuites.length > 0 && cipherSuites.map((cipherSuite: any, index: number) => {
        return (
          <ExpandableRow key={`tls-cipher-${index}`} lbl={cipherSuite.title} val="" rowList={cipherSuite.fields} />
        );
      })}
      { !cipherSuites.length && (
        <div>
          <p><strong>À propos</strong></p>
          <p>Les suites de chiffrement sont des combinaisons d'algorithmes cryptographiques utilisées par le serveur pour établir une connexion sécurisée. Elles incluent l'algorithme d'échange de clés, l'algorithme de chiffrement, l'algorithme MAC et la fonction PRF (fonction pseudoaléatoire).</p>
          
          <p><strong>Cas d'usage</strong></p>
          <p>Ces informations sont importantes d'un point de vue sécurité. Une suite de chiffrement n'est aussi sûre que les algorithmes qu'elle contient. Si la version du chiffrement ou de l'algorithme d'authentification présente des vulnérabilités connues, la suite de chiffrement et la connexion TLS peuvent être vulnérables à une attaque.</p>
          
          <p style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', borderRadius: '6px', color: '#991b1b' }}>
            ⚠️ Aucune suite de chiffrement trouvée.<br />
            Cela peut arriver si le rapport n'a pas fini de se générer à temps, ou si l'analyse TLS a échoué.
          </p>
          {scanId && <Button loadState={loadState} onClick={() => updateData(scanId)}>Récupérer le rapport</Button>}
        </div>
      )}
    </Card>
  );
}

export default TlsCard;
