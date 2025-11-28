
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
  const caaWorker = results.analysis.find((a: any) => a.analyzer === 'caaWorker');
  if (caaWorker.result.host) rows.push({ lbl: 'Hôte', val: caaWorker.result.host });
  if (typeof caaWorker.result.has_caa === 'boolean') rows.push({ lbl: 'Autorisation CA', val: caaWorker.result.has_caa });
  if (caaWorker.result.issue) rows.push({ lbl: 'CAs autorisés à émettre', plaintext: caaWorker.result.issue.join('\n') });

  const mozillaGradingWorker = (results.analysis.find((a: any) => a.analyzer === 'mozillaGradingWorker')).result;
  if (mozillaGradingWorker.grade) rows.push({ lbl: 'Note Mozilla', val: mozillaGradingWorker.grade });
  if (mozillaGradingWorker.gradeTrust) rows.push({ lbl: 'Confiance Mozilla', val: mozillaGradingWorker.gradeTrust });

  const symantecDistrust = (results.analysis.find((a: any) => a.analyzer === 'symantecDistrust')).result;
  if (typeof symantecDistrust.isDistrusted === 'boolean') rows.push({ lbl: 'SSL Symantec valide ?', val: !symantecDistrust.isDistrusted });
  if (symantecDistrust.reasons) rows.push({ lbl: 'Raison de défiance', plaintext: symantecDistrust.reasons.join('\n') });

  const top1m = (results.analysis.find((a: any) => a.analyzer === 'top1m')).result;
  if (top1m.certificate.rank) rows.push({ lbl: 'Rang du certificat', val: top1m.certificate.rank.toLocaleString() });

  const mozillaEvaluationWorker = (results.analysis.find((a: any) => a.analyzer === 'mozillaEvaluationWorker')).result;
  if (mozillaEvaluationWorker.level) rows.push({ lbl: 'Niveau évaluation Mozilla', val: mozillaEvaluationWorker.level });
  if (mozillaEvaluationWorker.failures) {
    const { bad, old, intermediate, modern } = mozillaEvaluationWorker.failures;
    if (bad) rows.push({ lbl: `Problèmes critiques (${bad.length})`, list: bad });
    if (old) rows.push({ lbl: `Problèmes compatibilité (${old.length})`, list: old });
    if (intermediate) rows.push({ lbl: `Problèmes intermédiaires (${intermediate.length})`, list: intermediate });
    if (modern) rows.push({ lbl: `Problèmes modernes (${modern.length})`, list: modern });
  }
  return rows;
};

const TlsCard = (props: {data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {

  const [tlsRowData, setTlsRowWata] = useState(makeExpandableData(props.data));
  const [tlsResults, setTlsResults] = useState(makeResults(props.data));
  const [loadState, setLoadState] = useState<undefined | 'loading' | 'success' | 'error'>(undefined);

  useEffect(() => {
    setTlsRowWata(makeExpandableData(props.data));
    setTlsResults(makeResults(props.data));
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
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      { tlsResults.length > 0 && tlsResults.map((row: any, index: number) => {
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
      <Expandable>
        <summary>Résultats d'analyse complets</summary>
        { tlsRowData.length > 0 && tlsRowData.map((cipherSuite: any, index: number) => {
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
      { !tlsRowData.length && (
        <div>
          <p>Aucune entrée disponible pour l'analyse.<br />
            Cela arrive parfois lorsque le rapport n'a pas fini de se générer à temps, vous pouvez essayer de le redemander.
          </p>
          <Button loadState={loadState} onClick={() => updateData(scanId)}>Relancer le rapport</Button>
        </div>
      )}
    </Card>
  );
}

export default TlsCard;
