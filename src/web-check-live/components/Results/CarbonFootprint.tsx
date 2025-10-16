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
  const htmlSizeKB = props.data?.htmlSizeKB;
  const hasError = props.data?.error || props.data?.skipped;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      { hasError && (
        <div>
          <p><strong>À propos</strong></p>
          <p>L'empreinte carbone d'un site web est calculée en fonction de la taille des données transférées, de l'énergie consommée par les serveurs et les réseaux, et des émissions de CO2 associées.</p>
          <p style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', borderRadius: '6px', color: '#991b1b' }}>
            ⚠️ Impossible de calculer l'empreinte carbone pour ce site.<br />
            {props.data?.error || props.data?.skipped || 'Données insuffisantes'}
          </p>
        </div>
      )}
      { !hasError && !carbons?.adjustedBytes && (
        <p>Aucune donnée disponible pour calculer l'empreinte carbone.</p>
      )}
      { !hasError && carbons?.adjustedBytes > 0 && <>
        {htmlSizeKB && <Row lbl="Taille HTML" val={`${htmlSizeKB} KB`} />}
        <Row lbl="Taille ajustée" val={`${Math.round(carbons.adjustedBytes / 1024)} KB`} />
        <Row lbl="CO2 par visite" val={`${carbons.co2.grid.grams.toFixed(3)} grammes`} />
        <Row lbl="Énergie consommée" val={`${(carbons.energy * 1000).toFixed(5)} KWh`} />
        {rating && (
          <Row 
            lbl="Note environnementale" 
            val={<span style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold', 
              color: rating === 'A+' ? '#16a34a' : rating.startsWith('A') ? '#22c55e' : rating.startsWith('B') ? '#84cc16' : '#eab308' 
            }}>
              {rating}
            </span>} 
          />
        )}
        {cleanerThan !== undefined && (
          <Row 
            lbl="Plus propre que" 
            val={<span style={{ fontWeight: 'bold', color: cleanerThan > 0.8 ? '#16a34a' : cleanerThan > 0.5 ? '#84cc16' : '#eab308' }}>
              {(cleanerThan * 100).toFixed(0)}% des sites testés
            </span>} 
          />
        )}
        <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.9em' }}>
          <strong>Impact environnemental :</strong><br />
          • 1 000 visites = {(carbons.co2.grid.grams * 1000).toFixed(1)}g CO2<br />
          • 1 000 000 visites = {(carbons.co2.grid.grams * 1000000 / 1000).toFixed(1)}kg CO2
        </div>
      </>}
      <br />
      <LearnMoreInfo>En savoir plus sur <a href="https://www.websitecarbon.com/" target="_blank" rel="noopener noreferrer">websitecarbon.com</a></LearnMoreInfo>
    </Card>
  );
}

export default CarbonCard;
