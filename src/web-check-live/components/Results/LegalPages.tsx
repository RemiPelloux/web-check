import React from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const LegalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ComplianceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ComplianceScore = styled.div<{ score: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: ${props => {
    if (props.score >= 8) return '#22c55e';
    if (props.score >= 6) return '#eab308';
    if (props.score >= 4) return '#f59e0b';
    return '#ef4444';
  }};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ status: 'found' | 'missing' | 'accessible' | 'error' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'found': return '#22c55e';
      case 'accessible': return '#22c55e';
      case 'missing': return '#ef4444';
      case 'error': return '#f59e0b';
      default: return colors.borderColor;
    }
  }};
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textColor};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${colors.textColorSecondary};
  font-weight: 500;
  text-transform: uppercase;
`;

const PagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PageItem = styled.div<{ status: 'found' | 'missing' | 'accessible' | 'error' }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'found': return '#22c55e';
      case 'accessible': return '#22c55e';
      case 'missing': return '#ef4444';
      case 'error': return '#f59e0b';
      default: return colors.borderColor;
    }
  }};
`;

const PageTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PageName = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
`;

const StatusBadge = styled.span<{ status: 'found' | 'missing' | 'accessible' | 'error' }>`
  background: ${props => {
    switch (props.status) {
      case 'found': return '#f0fdf4';
      case 'accessible': return '#f0fdf4';
      case 'missing': return '#fef2f2';
      case 'error': return '#fffbeb';
      default: return colors.backgroundLighter;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'found': return '#166534';
      case 'accessible': return '#166534';
      case 'missing': return '#991b1b';
      case 'error': return '#92400e';
      default: return colors.textColor;
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PageDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  color: ${colors.textColorSecondary};
  line-height: 1.4;
`;

const PageUrl = styled.a`
  font-size: 11px;
  color: ${colors.primary};
  text-decoration: none;
  word-break: break-all;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RequirementsList = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  border: 1px solid ${colors.borderColor};
`;

interface LegalPagesCardProps {
  data: {
    pages?: Array<{
      type: string;
      name: string;
      url?: string;
      status: 'found' | 'missing' | 'accessible' | 'error';
      description?: string;
      requirements?: string[];
    }>;
    score?: number;
    compliance?: {
      total: number;
      found: number;
      accessible: number;
      missing: number;
    };
    error?: string;
  };
  title: string;
  actionButtons?: any;
}

const LegalPagesCard: React.FC<LegalPagesCardProps> = ({ data, title, actionButtons }) => {
  if (data?.error) {
    return (
      <Card heading={title} actionButtons={actionButtons}>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textColorSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ margin: '0 0 8px 0', color: colors.textColor }}>Analyse des pages légales indisponible</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {data.error || 'Impossible d\'analyser les pages légales pour ce site.'}
          </p>
        </div>
      </Card>
    );
  }

  const pages = data?.pages || [];
  const compliance = data?.compliance || {
    total: pages.length,
    found: pages.filter(p => p.status === 'found' || p.status === 'accessible').length,
    accessible: pages.filter(p => p.status === 'accessible').length,
    missing: pages.filter(p => p.status === 'missing').length
  };
  const score = data?.score || Math.round((compliance.found / Math.max(compliance.total, 1)) * 10);

  const requiredPages = [
    {
      type: 'privacy-policy',
      name: 'Politique de Confidentialité',
      description: 'Document obligatoire RGPD décrivant le traitement des données personnelles',
      requirements: [
        'Identité du responsable de traitement',
        'Finalités et base légale du traitement',
        'Durées de conservation',
        'Droits des personnes concernées',
        'Coordonnées du DPD si applicable'
      ]
    },
    {
      type: 'terms-of-service',
      name: 'Conditions Générales d\'Utilisation',
      description: 'Conditions contractuelles régissant l\'utilisation du service',
      requirements: [
        'Identification de l\'éditeur',
        'Conditions d\'accès et d\'utilisation',
        'Responsabilités et limitations',
        'Propriété intellectuelle',
        'Droit applicable et juridiction'
      ]
    },
    {
      type: 'cookie-policy',
      name: 'Politique de Cookies',
      description: 'Information sur l\'utilisation des cookies et traceurs',
      requirements: [
        'Types de cookies utilisés',
        'Finalités des cookies',
        'Durées de conservation',
        'Moyens de s\'opposer aux cookies',
        'Cookies tiers et partenaires'
      ]
    },
    {
      type: 'legal-notice',
      name: 'Mentions Légales',
      description: 'Informations légales obligatoires sur l\'éditeur du site',
      requirements: [
        'Raison sociale et forme juridique',
        'Adresse du siège social',
        'Numéro d\'immatriculation',
        'Capital social',
        'Coordonnées de contact'
      ]
    }
  ];

  // Merge required pages with found pages
  const allPages = requiredPages.map(required => {
    const found = pages.find(p => p.type === required.type);
    return {
      ...required,
      url: found?.url,
      status: found?.status || 'missing' as const
    };
  });

  return (
    <Card heading={title} actionButtons={actionButtons}>
      <LegalContainer>
        <ComplianceHeader>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: colors.textColor, fontSize: '16px' }}>
              Conformité Légale APDP
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textColorSecondary }}>
              {compliance.found}/{compliance.total} page{compliance.total > 1 ? 's' : ''} requise{compliance.total > 1 ? 's' : ''} trouvée{compliance.found > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ComplianceScore score={score}>
              {score}
            </ComplianceScore>
            <div>
              <div style={{ fontSize: '12px', color: colors.textColorSecondary }}>Score de conformité</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textColor }}>
                {score >= 8 ? 'Conforme' : 
                 score >= 6 ? 'Partiellement conforme' : 
                 score >= 4 ? 'Non conforme' : 'Critique'}
              </div>
            </div>
          </div>
        </ComplianceHeader>

        <StatsGrid>
          <StatCard status="found">
            <StatNumber>{compliance.found}</StatNumber>
            <StatLabel>Trouvées</StatLabel>
          </StatCard>
          <StatCard status="accessible">
            <StatNumber>{compliance.accessible}</StatNumber>
            <StatLabel>Accessibles</StatLabel>
          </StatCard>
          <StatCard status="missing">
            <StatNumber>{compliance.missing}</StatNumber>
            <StatLabel>Manquantes</StatLabel>
          </StatCard>
          <StatCard status="error">
            <StatNumber>{pages.filter(p => p.status === 'error').length}</StatNumber>
            <StatLabel>Erreurs</StatLabel>
          </StatCard>
        </StatsGrid>

        <PagesList>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.textColor }}>
            Pages Légales Analysées
          </h4>
          {allPages.map((page, index) => (
            <PageItem key={page.type} status={page.status}>
              <PageTitle>
                <PageName>{page.name}</PageName>
                <StatusBadge status={page.status}>
                  {page.status === 'found' ? 'Trouvée' :
                   page.status === 'accessible' ? 'Accessible' :
                   page.status === 'missing' ? 'Manquante' : 'Erreur'}
                </StatusBadge>
              </PageTitle>
              <PageDescription>{page.description}</PageDescription>
              {page.url && (
                <PageUrl href={page.url} target="_blank" rel="noopener noreferrer">
                  {page.url}
                </PageUrl>
              )}
              {page.status === 'missing' && (
                <RequirementsList>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: colors.textColor, marginBottom: '8px' }}>
                    ⚠️ Éléments requis pour cette page:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: colors.textColorSecondary }}>
                    {page.requirements?.map((req, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{req}</li>
                    ))}
                  </ul>
                </RequirementsList>
              )}
            </PageItem>
          ))}
        </PagesList>

        <div style={{ 
          fontSize: '11px', 
          color: colors.textColorThirdly, 
          textAlign: 'center',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.borderColor}`
        }}>
          Conformité RGPD • APDP Monaco • Articles 13-14 du RGPD
        </div>
      </LegalContainer>
    </Card>
  );
};

export default LegalPagesCard;