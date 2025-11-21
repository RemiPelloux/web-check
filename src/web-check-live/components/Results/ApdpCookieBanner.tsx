import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const Badge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => 
    props.type === 'Conforme' ? colors.success :
    props.type === 'Partiellement conforme' ? colors.warning :
    colors.warning
  };
  color: white;
`;

const List = styled.div`
  margin: 0.5rem 0;
`;

const ListItem = styled.div<{ status?: string }>`
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: ${colors.backgroundLighter};
  border-radius: 4px;
  border-left: 3px solid ${props => 
    props.status === 'success' ? colors.success :
    props.status === 'error' ? colors.danger :
    colors.primary
  };
`;

const ApdpCookieBanner = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const { data } = props;
  
  if (!data || data.error) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons}>
        <Row lbl="Erreur" val={data?.error || 'Aucune donnée'} />
      </Card>
    );
  }

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      <Row lbl="Bannière cookies" val={data.hasCookieBanner ? 'Détectée ✓' : 'Non détectée ✗'} />
      
      {data.detectedLibrary && (
        <Row lbl="Solution" val={data.detectedLibrary} />
      )}
      
      <Row lbl="Conformité Loi 1.565" val={<Badge type={data.compliance?.level || 'Non conforme'}>{data.compliance?.level || 'Non conforme'}</Badge>} />
      
      {data.features && (
        <>
          <ListItem status={data.features.hasAcceptButton ? 'success' : 'error'}>
            Bouton accepter: {data.features.hasAcceptButton ? '✓' : '✗'}
          </ListItem>
          <ListItem status={data.features.hasRejectButton ? 'success' : 'error'}>
            Bouton refuser: {data.features.hasRejectButton ? '✓' : '✗'}
          </ListItem>
          <ListItem status={data.features.hasCustomizeButton ? 'success' : 'error'}>
            Personnalisation: {data.features.hasCustomizeButton ? '✓' : '✗'}
          </ListItem>
        </>
      )}
      
      {data.compliance?.issues && data.compliance.issues.length > 0 && (
        <List>
          {data.compliance.issues.map((issue: string, idx: number) => (
            <ListItem key={idx} status="error">✗ {issue}</ListItem>
          ))}
        </List>
      )}
    </Card>
  );
};

export default ApdpCookieBanner;

