import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const LearnMoreInfo = styled.p`
font-size: 0.8rem;
margin-top: 0.5rem;
opacity: 0.75;
a { color: ${colors.primary}; }
`;

const CarbonCard = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const carbons = props.data?.statistics;
  const rating = props.data?.rating;
  const cleanerThan = props.data?.cleanerThan;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      { !carbons?.adjustedBytes && <p>Impossible de calculer l'empreinte carbone pour cet hôte</p>}
      { carbons?.adjustedBytes > 0 && <>
        <Row lbl="Taille HTML initiale" val={`${Math.round(carbons.adjustedBytes / 1024)} KB`} />
        <Row lbl="CO2 par chargement" val={`${carbons.co2.grid.grams.toFixed(2)} grammes`} />
        <Row lbl="Consommation énergétique" val={`${(carbons.energy * 1000).toFixed(4)} KWh`} />
        {rating && <Row lbl="Note Carbon" val={rating} />}
        {cleanerThan && <Row lbl="Plus propre que" val={`${(cleanerThan * 100).toFixed(0)}% des sites`} />}
      </>}
      <br />
      <LearnMoreInfo>En savoir plus sur <a href="https://www.websitecarbon.com/" target="_blank" rel="noopener noreferrer">websitecarbon.com</a></LearnMoreInfo>
    </Card>
  );
}

export default CarbonCard;
