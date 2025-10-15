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

const ApdpPrivacyPolicy = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
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
      <Row lbl="Politique confidentialité" val={data.hasPrivacyPolicy ? 'Trouvée ✓' : 'Manquante ✗'} />
      {data.privacyPolicyUrl && <Row lbl="URL" val={data.privacyPolicyUrl} />}
      {data.detectedVia && <Row lbl="Détecté via" val={data.detectedVia} />}
      <Row lbl="Conformité" val={<Badge type={data.compliance?.level || 'Non conforme'}>{data.compliance?.level || 'Non conforme'}</Badge>} />
      <Row lbl="Score" val={`${data.compliance?.score || 0}/100`} />
      
      {data.foundSections && data.foundSections.length > 0 && data.foundSections.map((section: string, idx: number) => (
        <ListItem key={idx} status="success">✓ {section}</ListItem>
      ))}
      
      {data.missingSections && data.missingSections.length > 0 && data.missingSections.map((section: string, idx: number) => (
        <ListItem key={idx} status="error">✗ {section}</ListItem>
      ))}
      
      {!data.hasPrivacyPolicy && data.footerLinksFound && data.footerLinksFound.length > 0 && (
        <>
          <Row lbl="Liens footer trouvés" val={`${data.footerLinksFound.length} liens`} />
          {data.footerLinksFound.slice(0, 5).map((link: any, idx: number) => (
            <ListItem key={idx}>{link.text}: {link.href}</ListItem>
          ))}
        </>
      )}
    </Card>
  );
};

export default ApdpPrivacyPolicy;
