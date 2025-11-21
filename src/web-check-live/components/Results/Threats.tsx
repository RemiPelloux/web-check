
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row, { ExpandableRow } from 'web-check-live/components/Form/Row';

const Expandable = styled.details`
margin-top: 0.5rem;
cursor: pointer;
summary::marker {
  color: ${colors.primary};
}
`;

const getExpandableTitle = (urlObj: any) => {
  let pathName = '';
  try {
    pathName = new URL(urlObj.url).pathname;
  } catch(e) {}
  return `${pathName} (${urlObj.id})`;
}

const convertToDate = (dateString: string): string => {
  const [date, time] = dateString.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second] = time.split(':').map(Number);
  const dateObject = new Date(year, month - 1, day, hour, minute, second);
  if (isNaN(dateObject.getTime())) {
    return dateString;
  }
  return dateObject.toString();
}

const MalwareCard = (props: {data: any, title: string, actionButtons: any }): JSX.Element => {
  const urlHaus = props.data.urlHaus || {};
  const phishTank = props.data.phishTank || {};
  const cloudmersive = props.data.cloudmersive || {};
  const safeBrowsing = props.data.safeBrowsing || {};
  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      { safeBrowsing && !safeBrowsing.error && (
        <Row lbl="Google Safe Browsing" val={safeBrowsing.unsafe ? '❌ Non sécurisé' : '✅ Sécurisé'} />
      )}
      { ((cloudmersive && !cloudmersive.error) || safeBrowsing?.details) && (
        <Row lbl="Type de menace" val={safeBrowsing?.details?.threatType || cloudmersive.WebsiteThreatType || 'Aucune :)'} />
      )}
      { phishTank && !phishTank.error && (
        <Row lbl="Statut de phishing" val={phishTank?.url0?.in_database !== 'false' ? '❌ Phishing identifié' : '✅ Aucun phishing détecté'} />
      )}
      { phishTank.url0 && phishTank.url0.phish_detail_page && (
        <Row lbl="" val="">
          <span className="lbl">Infos phishing</span>
          <span className="val"><a href={phishTank.url0.phish_detail_page}>{phishTank.url0.phish_id}</a></span>  
        </Row>
      )}
      { urlHaus.query_status === 'no_results' && <Row lbl="Statut malware" val="✅ Aucun malware détecté" />}
      { urlHaus.query_status === 'ok' && (
        <>
        <Row lbl="Statut" val="❌ Malware identifié" />
        <Row lbl="Première détection" val={convertToDate(urlHaus.firstseen)} />
        <Row lbl="Nombre d'URLs malveillantes" val={urlHaus.url_count} />
        </>
      )}
      {urlHaus.urls && (
        <Expandable>
          <summary>Afficher les résultats</summary>
          { urlHaus.urls.map((urlResult: any, index: number) => {
          const rows = [
            { lbl: 'ID', val: urlResult.id },
            { lbl: 'Statut', val: urlResult.url_status },
            { lbl: 'Date d\'ajout', val: convertToDate(urlResult.date_added) },
            { lbl: 'Type de menace', val: urlResult.threat },
            { lbl: 'Signalé par', val: urlResult.reporter },
            { lbl: 'Temps de retrait', val: urlResult.takedown_time_seconds },
            { lbl: 'Larted', val: urlResult.larted },
            { lbl: 'Tags', val: (urlResult.tags || []).join(', ') },
            { lbl: 'Référence', val: urlResult.urlhaus_reference },      
            { lbl: 'Chemin du fichier', val: urlResult.url },      
          ];
          return (<ExpandableRow lbl={getExpandableTitle(urlResult)} val="" rowList={rows} />)
        })}
        </Expandable>
      )}
    </Card>
  );
}

export default MalwareCard;
