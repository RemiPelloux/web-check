import React from 'react';
import colors from 'web-check-live/styles/colors';

interface SecurityHeadersSectionProps {
  headers?: Record<string, any>;
}

const SecurityHeadersSection: React.FC<SecurityHeadersSectionProps> = ({ headers }) => {
  if (!headers) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Aucun en-tête analysé
      </div>
    );
  }

  const criticalHeaders = [
    'strict-transport-security',
    'content-security-policy', 
    'x-frame-options',
    'x-content-type-options'
  ];

  const headerEntries = Object.entries(headers);
  const totalHeaders = headerEntries.length;

  return (
    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Total analysés:</strong> {totalHeaders} en-têtes
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        {criticalHeaders.map(header => (
          <div key={header} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '12px' }}>{header}:</span>
            <span style={{ 
              fontSize: '11px',
              color: headers[header] ? colors.success : colors.error,
              fontWeight: '600'
            }}>
              {headers[header] ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>
      
      <details style={{ marginTop: '12px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
          Tous les en-têtes ({totalHeaders})
        </summary>
        <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
          {headerEntries.slice(0, 15).map(([key, value]) => (
            <div key={key} style={{ 
              fontSize: '10px', 
              padding: '4px 8px', 
              margin: '2px 0',
              background: colors.backgroundDarker,
              borderRadius: '4px',
              wordBreak: 'break-all'
            }}>
              <strong>{key}:</strong> {
                typeof value === 'string' 
                  ? value.substring(0, 50) + (value.length > 50 ? '...' : '')
                  : String(value)
              }
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default SecurityHeadersSection;














