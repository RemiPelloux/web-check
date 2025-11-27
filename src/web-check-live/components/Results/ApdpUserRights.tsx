import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const Badge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.type === 'Conforme' ? colors.success : props.type === 'Partiellement conforme' ? colors.warning : colors.warning};
  color: white;
`;

const ListItem = styled.div<{ status?: string }>`
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: ${colors.backgroundLighter};
  border-radius: 4px;
  border-left: 3px solid ${props => props.status === 'success' ? colors.success : props.status === 'error' ? colors.danger : colors.primary};
`;

const ApdpUserRights = (props: { data: any, title: string, actionButtons: any, refCode?: string }): JSX.Element => {
  const { data } = props;
  
  if (!data || data.error) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
        <Row lbl="Erreur" val={data?.error || 'Aucune donnée'} />
      </Card>
    );
  }

  return (
    <Card heading={props.title} actionButtons={props.actionButtons} refCode={props.refCode}>
      <Row lbl="Conformité" val={<Badge type={data.compliance?.level || 'Non conforme'}>{data.compliance?.level || 'Non conforme'}</Badge>} />
      <Row lbl="Score" val={`${data.compliance?.score || 0}/100`} />
      <Row lbl="Droits implémentés" val={`${data.implementedRights?.length || 0}/6`} />
      
      {data.implementedRights && data.implementedRights.length > 0 && data.implementedRights.map((right: string, idx: number) => (
        <ListItem key={idx} status="success">✓ {right}</ListItem>
      ))}
      
      {data.missingRights && data.missingRights.length > 0 && data.missingRights.map((right: string, idx: number) => (
        <ListItem key={idx} status="error">✗ {right}</ListItem>
      ))}
      
      {data.availableMechanisms && data.availableMechanisms.length > 0 && (
        <Row lbl="Moyens exercice" val={data.availableMechanisms.join(', ')} />
      )}
    </Card>
  );
};

export default ApdpUserRights;
