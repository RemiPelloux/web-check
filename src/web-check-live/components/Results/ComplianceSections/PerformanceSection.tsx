import React from 'react';
import colors from 'web-check-live/styles/colors';

interface PerformanceSectionProps {
  quality?: {
    categories?: {
      performance?: { score?: number };
      accessibility?: { score?: number };
      'best-practices'?: { score?: number };
      seo?: { score?: number };
    };
  };
  techStack?: {
    technologies?: Array<{
      name: string;
      version?: string;
    }>;
  };
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({ quality, techStack }) => {
  const hasQualityData = quality?.categories;
  const hasTechData = techStack?.technologies && techStack.technologies.length > 0;

  if (!hasQualityData && !hasTechData) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Données de performance et technologies non disponibles
      </div>
    );
  }

  return (
    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
      {hasQualityData && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <strong>Score Performance:</strong> {Math.round((quality.categories.performance?.score || 0) * 100)}/100
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Accessibilité:</strong> {Math.round((quality.categories.accessibility?.score || 0) * 100)}/100
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Bonnes pratiques:</strong> {Math.round((quality.categories['best-practices']?.score || 0) * 100)}/100
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>SEO:</strong> {Math.round((quality.categories.seo?.score || 0) * 100)}/100
          </div>
        </>
      )}
      
      {hasTechData && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            Technologies ({techStack?.technologies?.length || 0})
          </summary>
          <div style={{ marginTop: '8px', maxHeight: '100px', overflow: 'auto' }}>
            {techStack?.technologies?.slice(0, 8).map((tech, i) => (
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
                <span>{tech.name}</span>
                {tech.version && (
                  <span style={{ color: colors.textColorThirdly }}>
                    v{tech.version}
                  </span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default PerformanceSection;
