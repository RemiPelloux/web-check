
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const cardStyles = `
span.val {
  &.up { color: ${colors.success}; }
  &.down { color: ${colors.danger}; }
}
`;

const DomainLookupCard = (props: { data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const domain = props.data.internicData || {};
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles={cardStyles} refCode={props.refCode}>
      { domain.Domain_Name && <Row lbl="Domaine enregistré" val={domain.Domain_Name} /> }
      { domain.Creation_Date && <Row lbl="Date de création" val={domain.Creation_Date} /> }
      { domain.Updated_Date && <Row lbl="Date de mise à jour" val={domain.Updated_Date} /> }
      { domain.Registry_Expiry_Date && <Row lbl="Date d'expiration" val={domain.Registry_Expiry_Date} /> }
      { domain.Registry_Domain_ID && <Row lbl="ID du domaine" val={domain.Registry_Domain_ID} /> }
      { domain.Registrar_WHOIS_Server && <Row lbl="Serveur WHOIS" val={domain.Registrar_WHOIS_Server} /> }
      { domain.Registrar && <Row lbl="" val="">
        <span className="lbl">Registraire</span>
        <span className="val"><a href={domain.Registrar_URL || '#'}>{domain.Registrar}</a></span>
      </Row> }
      { domain.Registrar_IANA_ID && <Row lbl="ID IANA Registraire" val={domain.Registrar_IANA_ID} /> }
    </Card>
  );
}

export default DomainLookupCard;
