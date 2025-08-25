import React from 'react';
import colors from 'web-check-live/styles/colors';

interface SSLSectionProps {
  ssl?: {
    protocol?: string;
    valid?: boolean;
    validCertificate?: boolean;
    issuer?: string | Record<string, any>;
    validTo?: string;
    validFrom?: string;
    subject?: string | Record<string, any>;
    subjectAltName?: string;
    expires?: string;
    renewed?: string;
    error?: string;
  };
  hsts?: {
    isEnabled?: boolean;
  };
}

// Helper function to safely convert SSL subject/issuer to string
const formatSSLField = (field: string | Record<string, any> | undefined): string => {
  if (!field) return 'N/A';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    // Handle SSL certificate subject/issuer objects like {C: "US", O: "Company", CN: "example.com"}
    const parts: string[] = [];
    if (field.CN) parts.push(`CN=${field.CN}`);
    if (field.O) parts.push(`O=${field.O}`);
    if (field.C) parts.push(`C=${field.C}`);
    if (field.OU) parts.push(`OU=${field.OU}`);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }
  return String(field);
};

const SSLSection: React.FC<SSLSectionProps> = ({ ssl, hsts }) => {
  if (!ssl) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Informations SSL/TLS non disponibles
      </div>
    );
  }

  // Determine certificate validity
  const isValidCert = ssl.valid || ssl.validCertificate || (!ssl.error && ssl.issuer);
  const tlsVersion = ssl.protocol || 'TLSv1.2'; // Default assumption for HTTPS sites
  const expirationDate = ssl.validTo || ssl.expires;
  const renewalDate = ssl.validFrom || ssl.renewed;

  return (
    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>TLS:</strong> {tlsVersion}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Certificat:</strong> {isValidCert ? '✅ Valide' : '❌ Invalide'}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Émetteur:</strong> {formatSSLField(ssl.issuer)}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Expiration:</strong> {
          expirationDate 
            ? new Date(expirationDate).toLocaleDateString('fr-FR') 
            : 'Non disponible'
        }
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>HSTS:</strong> {hsts?.isEnabled ? '✅ Activé' : '❌ Désactivé'}
      </div>
      
      {(ssl.subjectAltName || ssl.subject) && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            Détails certificat
          </summary>
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Sujet:</strong> {formatSSLField(ssl.subject)}
            </div>
            {ssl.subjectAltName && (
              <div style={{ marginBottom: '4px' }}>
                <strong>SAN:</strong> {ssl.subjectAltName}
              </div>
            )}
            <div style={{ marginBottom: '4px' }}>
              <strong>Valide depuis:</strong> {
                renewalDate 
                  ? new Date(renewalDate).toLocaleDateString('fr-FR') 
                  : 'N/A'
              }
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

export default SSLSection;
