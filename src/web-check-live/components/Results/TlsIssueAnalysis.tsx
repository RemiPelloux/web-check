
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Button from 'web-check-live/components/Form/Button';
import Row, { ExpandableRow } from 'web-check-live/components/Form/Row';

const Expandable = styled.details`
margin-top: 0.5rem;
cursor: pointer;
summary::marker {
  color: ${colors.primary};
}
`;

const SecurityBadge = styled.span<{ level: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => {
    switch (props.level) {
      case 'excellent': return colors.success;
      case 'good': return colors.success;
      case 'acceptable': return colors.warning;
      case 'weak': return colors.danger;
      case 'insecure': return colors.danger;
      default: return colors.textColorSecondary;
    }
  }};
  color: ${colors.background};
`;

// Check if data is from fallback (direct TLS) or Mozilla Observatory
const isFallbackData = (results: any) => {
  return results && (results.protocol || results.cipher || results.securityLevel) && !results.analysis;
};

// Process fallback TLS data
const makeFallbackResults = (results: any) => {
  const rows: { lbl: string; val?: any; plaintext?: string; list?: string[] }[] = [];
  if (!results || !isFallbackData(results)) return rows;

  if (results.hostname) rows.push({ lbl: 'Hôte', val: results.hostname });
  if (results.protocol) rows.push({ lbl: 'Version TLS', val: results.protocol });
  if (results.cipher) rows.push({ lbl: 'Suite de chiffrement', val: results.cipher });
  if (results.bits) rows.push({ lbl: 'Force de chiffrement', val: `${results.bits} bits` });
  if (results.securityLevel) rows.push({ lbl: 'Niveau de sécurité', val: results.securityLevel });
  
  if (results.certificate) {
    const cert = results.certificate;
    if (cert.subject?.CN) rows.push({ lbl: 'Certificat CN', val: cert.subject.CN });
    if (cert.issuer?.O) rows.push({ lbl: 'Émetteur', val: cert.issuer.O });
    if (cert.validFrom) rows.push({ lbl: 'Valide depuis', val: cert.validFrom });
    if (cert.validTo) rows.push({ lbl: 'Expire le', val: cert.validTo });
    if (cert.daysRemaining !== null) {
      rows.push({ 
        lbl: 'Jours restants', 
        val: cert.daysRemaining > 30 ? `${cert.daysRemaining} jours ✅` : 
             cert.daysRemaining > 0 ? `${cert.daysRemaining} jours ⚠️` : 
             'Expiré ❌'
      });
    }
  }

  if (results.note) rows.push({ lbl: 'Note', val: results.note });
  if (results.error) rows.push({ lbl: 'Erreur', val: results.error });

  return rows;
};

const makeExpandableData = (results: any) => {
  if (!results || !results.analysis || results.analysis.length === 0) {
    return [];
  }
  return results.analysis.map((analysis: any) => {
    const fields = Object.keys(analysis.result).map((label) => {
      const lbl = isNaN(parseInt(label, 10)) ? label : '';
      const val = analysis.result[label] || 'None';
      if (typeof val !== 'object') {
        return { lbl, val };
      }
      return { lbl, val: '', plaintext: JSON.stringify(analysis.result[label])};
    });
    return {
      title: analysis.analyzer,
      value: analysis.success ? '✅' : '❌',
      fields,
    };
  });
};

const makeResults = (results: any) => {
  const rows: { lbl: string; val?: any; plaintext?: string; list?: string[] }[] = [];
  if (!results || !results.analysis || results.analysis.length === 0) {
    return rows;
  }
  
  try {
    const caaWorker = results.analysis.find((a: any) => a.analyzer === 'caaWorker');
    if (caaWorker?.result?.host) rows.push({ lbl: 'Hôte', val: caaWorker.result.host });
    if (caaWorker && typeof caaWorker.result?.has_caa === 'boolean') rows.push({ lbl: 'Autorisation CA', val: caaWorker.result.has_caa });
    if (caaWorker?.result?.issue) rows.push({ lbl: 'CAs autorisés à émettre', plaintext: caaWorker.result.issue.join('\n') });

    const mozillaGradingWorker = results.analysis.find((a: any) => a.analyzer === 'mozillaGradingWorker')?.result;
    if (mozillaGradingWorker?.grade) rows.push({ lbl: 'Note Mozilla', val: mozillaGradingWorker.grade });
    if (mozillaGradingWorker?.gradeTrust) rows.push({ lbl: 'Confiance Mozilla', val: mozillaGradingWorker.gradeTrust });

    const symantecDistrust = results.analysis.find((a: any) => a.analyzer === 'symantecDistrust')?.result;
    if (symantecDistrust && typeof symantecDistrust.isDistrusted === 'boolean') rows.push({ lbl: 'SSL Symantec valide ?', val: !symantecDistrust.isDistrusted });
    if (symantecDistrust?.reasons) rows.push({ lbl: 'Raison de défiance', plaintext: symantecDistrust.reasons.join('\n') });

    const top1m = results.analysis.find((a: any) => a.analyzer === 'top1m')?.result;
    if (top1m?.certificate?.rank) rows.push({ lbl: 'Rang du certificat', val: top1m.certificate.rank.toLocaleString() });

    const mozillaEvaluationWorker = results.analysis.find((a: any) => a.analyzer === 'mozillaEvaluationWorker')?.result;
    if (mozillaEvaluationWorker?.level) rows.push({ lbl: 'Niveau évaluation Mozilla', val: mozillaEvaluationWorker.level });
    if (mozillaEvaluationWorker?.failures) {
      const { bad, old, intermediate, modern } = mozillaEvaluationWorker.failures;
      if (bad) rows.push({ lbl: `Analyses critiques (${bad.length})`, list: bad });
      if (old) rows.push({ lbl: `Analyses compatibilité (${old.length})`, list: old });
      if (intermediate) rows.push({ lbl: `Analyses intermédiaires (${intermediate.length})`, list: intermediate });
      if (modern) rows.push({ lbl: `Analyses modernes (${modern.length})`, list: modern });
    }
  } catch (e) {
    console.error('Error parsing Mozilla TLS results:', e);
  }
  return rows;
};

const TlsCard = (props: {data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const isFallback = isFallbackData(props.data);
  
  const [tlsRowData, setTlsRowWata] = useState(isFallback ? [] : makeExpandableData(props.data));
  const [tlsResults, setTlsResults] = useState(
    isFallback ? makeFallbackResults(props.data) : makeResults(props.data)
  );
  const [loadState, setLoadState] = useState<undefined | 'loading' | 'success' | 'error'>(undefined);

  useEffect(() => {
    const fallback = isFallbackData(props.data);
    setTlsRowWata(fallback ? [] : makeExpandableData(props.data));
    setTlsResults(fallback ? makeFallbackResults(props.data) : makeResults(props.data));
  }, [props.data]);

  const updateData = (id: number) => {
    setTlsRowWata([]);
    setLoadState('loading');
    const fetchUrl = `https://tls-observatory.services.mozilla.com/api/v1/results?id=${id}`;
    fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        setTlsRowWata(makeExpandableData(data));
        setTlsResults(makeResults(data));
        setLoadState('success');
    }).catch(() => {
      setLoadState('error');
    });
  };
  
  const scanId = props.data?.id;
  const hasResults = tlsResults.length > 0;
  const securityLevel = props.data?.securityLevel;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      
      {hasResults && tlsResults.map((row: any, index: number) => {
        return (
          <Row
            lbl={row.lbl}
            val={row.val}
            plaintext={row.plaintext}
            listResults={row.list}
            key={`tls-issues-${index}`}
          />
        );
      })}
      
      {!isFallback && tlsRowData.length > 0 && (
        <Expandable>
          <summary>Résultats d'analyse complets</summary>
          {tlsRowData.map((cipherSuite: any, index: number) => {
            return (
              <ExpandableRow 
                key={`cipher-suite-${index}-${cipherSuite.title}`}
                lbl={cipherSuite.title} 
                val={cipherSuite.value || '?'} 
                rowList={cipherSuite.fields} 
              />
            );
          })}
        </Expandable>
      )}
      
      {!hasResults && !isFallback && (
        <div>
          <p>Aucune entrée disponible pour l'analyse.<br />
            Cela arrive parfois lorsque le rapport n'a pas fini de se générer à temps, vous pouvez essayer de le redemander.
          </p>
          {scanId && (
            <Button loadState={loadState} onClick={() => updateData(scanId)}>Relancer le rapport</Button>
          )}
        </div>
      )}
      
      {props.data?.error && (
        <Row lbl="Erreur" val={props.data.error} />
      )}
    </Card>
  );
}

export default TlsCard;
