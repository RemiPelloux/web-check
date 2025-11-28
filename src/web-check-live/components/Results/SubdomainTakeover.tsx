
import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';
import colors from 'web-check-live/styles/colors';

const StatusBanner = styled.div<{ vulnerable: boolean }>`
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
  background: ${props => props.vulnerable ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.vulnerable ? colors.danger : colors.success};
  border: 1px solid ${props => props.vulnerable ? colors.danger : colors.success};
`;

const SubdomainTakeoverCard = (props: { data: any, title?: string, actionButtons?: any, refCode?: string }): JSX.Element => {
    const { data } = props;
    const isVulnerable = data?.vulnerable === true;

    return (
        <Card heading={props.title || "Prise de Contrôle Sous-domaine"} actionButtons={props.actionButtons} refCode={props.refCode}>
            <StatusBanner vulnerable={isVulnerable}>
                {isVulnerable ? '⚠️ VULNÉRABILITÉ DÉTECTÉE' : '✅ Aucun risque détecté'}
            </StatusBanner>

            <Row lbl="Statut" val={data?.status || 'Inconnu'} />
            {data?.cname && <Row lbl="Enregistrement CNAME" val={data.cname} />}
            {data?.service && <Row lbl="Service Détecté" val={data.service} />}

            {isVulnerable && (
                <div style={{ marginTop: '1rem', color: colors.textColorSecondary }}>
                    <p>Ce sous-domaine pointe vers un service tiers ({data?.service}) qui ne semble pas être réclamé. Un attaquant pourrait enregistrer ce service et prendre le contrôle du sous-domaine.</p>
                </div>
            )}
        </Card>
    );
};

export default SubdomainTakeoverCard;
