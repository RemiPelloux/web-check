import React from 'react';
import colors from 'web-check-live/styles/colors';

interface ThirdPartySectionProps {
  cdnResources?: {
    summary?: {
      externalDomains?: number;
      googleServices?: number;
      cdnResources?: number;
      trackingResources?: number;
    };
    resources?: Array<{
      domain: string;
      type: string;
    }>;
  };
}

const ThirdPartySection: React.FC<ThirdPartySectionProps> = ({ cdnResources }) => {
  if (!cdnResources) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Aucun service tiers détecté
      </div>
    );
  }

  const { summary, resources } = cdnResources;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'google': return { bg: '#fef2f2', color: '#991b1b' };
      case 'cdn': return { bg: '#f0fdf4', color: '#166534' };
      default: return { bg: '#eff6ff', color: '#1e40af' };
    }
  };

  return (
    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Domaines externes:</strong> {summary?.externalDomains || 0} domaines détectés
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Services Google:</strong> {summary?.googleServices || 0} services (Analytics, Fonts, APIs)
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Ressources CDN:</strong> {summary?.cdnResources || 0} fichiers via CDN
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Tracking/Analytics:</strong> {summary?.trackingResources || 0} outils de suivi
      </div>
      
      {/* Show detailed breakdown if available */}
      {summary && (summary.externalDomains > 0 || summary.googleServices > 0) && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: colors.backgroundDarker, 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Impact Conformité:</div>
          {summary.googleServices > 0 && (
            <div style={{ color: colors.warning, marginBottom: '2px' }}>
              ⚠️ Services US détectés - Risque Cloud Act
            </div>
          )}
          {summary.trackingResources > 0 && (
            <div style={{ color: colors.info, marginBottom: '2px' }}>
              ℹ️ Outils de tracking - Consentement requis (APDP Art. 7)
            </div>
          )}
          {summary.externalDomains > 5 && (
            <div style={{ color: colors.textColorSecondary }}>
              📋 Complexité élevée - Audit des transferts recommandé
            </div>
          )}
        </div>
      )}
      
      {resources && resources.length > 0 && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            Domaines externes ({resources.length})
          </summary>
          <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
            {resources.slice(0, 10).map((resource, i) => {
              const typeColors = getTypeColor(resource.type);
              return (
                <div key={i} style={{ 
                  fontSize: '11px', 
                  padding: '4px 8px', 
                  margin: '2px 0',
                  background: colors.backgroundDarker,
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ wordBreak: 'break-all' }}>{resource.domain}</span>
                  <span style={{ 
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: typeColors.bg,
                    color: typeColors.color
                  }}>
                    {resource.type}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
};

export default ThirdPartySection;
