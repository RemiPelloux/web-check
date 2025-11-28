
import styled from '@emotion/styled';
import type { Whois } from 'web-check-live/utils/result-processor';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Heading from 'web-check-live/components/Form/Heading';

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem;
  &:not(:last-child) { border-bottom: 1px solid ${colors.primaryTransparent}; }
  span.lbl { font-weight: bold; }
  span.val {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return formatter.format(date);
}

const DataRow = (props: { lbl: string, val: string }) => {
  const { lbl, val } = props;
  return (
  <Row>
    <span className="lbl">{lbl}</span>
    <span className="val" title={val}>{val}</span>
  </Row>
  );
};

const ListRow = (props: { list: string[], title: string }) => {
  const { list, title } = props;
  return (
  <>
    <Heading as="h3" size="small" align="left" color={colors.primary}>{title}</Heading>
    { list.map((entry: string, index: number) => {
      return (
      <Row key={`${title.toLocaleLowerCase()}-${index}`}><span>{ entry }</span></Row>
      )}
    )}
  </>
);
}

const WhoIsCard = (props: { data: Whois, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const whois = props.data;
  const { created, updated, expires, nameservers } = whois;
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      { created && <DataRow lbl="Créé le" val={formatDate(created)} /> }
      { updated && <DataRow lbl="Mis à jour" val={formatDate(updated)} /> }
      { expires && <DataRow lbl="Expire le" val={formatDate(expires)} /> }
      { nameservers && <ListRow title="Serveurs de noms" list={nameservers} /> }
    </Card>
  );
}

export default WhoIsCard;
