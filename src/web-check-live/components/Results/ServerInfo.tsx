import type { ServerInfo } from 'web-check-live/utils/result-processor';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const ServerInfoCard = (props: { data: ServerInfo, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const info = props.data;
  const { org, asn, isp, os, ports, ip, loc, type } = info;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      { org && <Row lbl="Organisation" val={org} /> }
      { (isp && isp !== org) && <Row lbl="Fournisseur" val={isp} /> }
      { os && <Row lbl="Système d'exploitation" val={os} /> }
      { asn && <Row lbl="Code ASN" val={asn} /> }
      { ports && <Row lbl="Ports" val={ports} /> }
      { ip && <Row lbl="IP" val={ip} /> }
      { type && <Row lbl="Type" val={type} /> }
      { loc && <Row lbl="Localisation" val={loc} /> }
    </Card>
  );
}

export default ServerInfoCard;
