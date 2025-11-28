import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const Note = styled.small`
opacity: 0.5;
display: block;
margin-top: 0.5rem;
`;

const FirewallCard = (props: { data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const data = props.data;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      <Row lbl="Pare-feu" val={data.hasWaf ? '✅ Oui' : '❌ Non*' } />
      { data.waf && <Row lbl="WAF" val={data.waf} /> }
      { !data.hasWaf && (<Note>
        *Le domaine peut être protégé par un WAF propriétaire ou personnalisé que nous n'avons pas pu identifier automatiquement
      </Note>) }
    </Card>
  );
}

export default FirewallCard;
