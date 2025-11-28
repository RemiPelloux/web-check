import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const Note = styled.small`
opacity: 0.5;
display: block;
margin-top: 0.5rem;
a {
  color: ${colors.primary};
}
`;

const ArchivesCard = (props: { data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const data = props.data;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      <Row lbl="Premier scan" val={data.firstScan} />
      <Row lbl="Dernier scan" val={data.lastScan} />
      <Row lbl="Total des scans" val={data.totalScans} />
      <Row lbl="Nombre de changements" val={data.changeCount} />
      <Row lbl="Taille moyenne" val={`${data.averagePageSize} octets`} />
      { data.scanFrequency?.scansPerDay > 1 ?
        <Row lbl="Scans par jour (moy.)" val={data.scanFrequency.scansPerDay} /> :
        <Row lbl="Jours entre scans (moy.)" val={data.scanFrequency.daysBetweenScans} />
      }

      <Note>
        Consulter les versions historiques de cette page <a rel="noreferrer" target="_blank" href={`https://web.archive.org/web/*/${data.scanUrl}`}>ici</a>,
        via la Wayback Machine d'Internet Archive.
      </Note>
    </Card>
  );
}

export default ArchivesCard;
