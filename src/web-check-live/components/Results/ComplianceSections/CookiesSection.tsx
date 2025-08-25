import React from 'react';
import colors from 'web-check-live/styles/colors';

interface CookiesSectionProps {
  cookies?: {
    cookies?: Array<{
      name: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: string;
    }>;
    clientCookies?: Array<{
      name: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: string;
      categories?: string[];
      security?: {
        warnings?: string[];
      };
    }>;
    summary?: {
      total?: number;
      securityScore?: number;
    };
  };
}

const CookiesSection: React.FC<CookiesSectionProps> = ({ cookies }) => {
  // Use clientCookies if available, otherwise fall back to cookies
  const cookieArray = cookies?.clientCookies || cookies?.cookies || [];
  
  if (cookieArray.length === 0) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Aucun cookie détecté
      </div>
    );
  }

  const totalCookies = cookieArray.length;
  const secureCookies = cookieArray.filter(c => c.secure).length;
  const httpOnlyCookies = cookieArray.filter(c => c.httpOnly).length;
  const sameSiteCookies = cookieArray.filter(c => c.sameSite && c.sameSite !== 'None').length;

  return (
    <div style={{ fontSize: '13px', color: colors.textColorSecondary, lineHeight: '1.5' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Total:</strong> {totalCookies} cookies
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Sécurisés:</strong> {secureCookies}/{totalCookies}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>HttpOnly:</strong> {httpOnlyCookies}/{totalCookies}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>SameSite:</strong> {sameSiteCookies}/{totalCookies}
      </div>
      
      {totalCookies > 0 && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            Voir les cookies ({totalCookies})
          </summary>
          <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto' }}>
            {cookieArray.slice(0, 10).map((cookie, i) => (
              <div key={i} style={{ 
                fontSize: '11px', 
                padding: '4px 8px', 
                margin: '2px 0',
                background: colors.backgroundDarker,
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                <strong>{cookie.name}</strong>
                {cookie.domain && (
                  <span style={{ color: colors.textColorThirdly }}>
                    {' '}({cookie.domain})
                  </span>
                )}
                {cookie.categories && (
                  <span style={{ color: colors.textColorSecondary, fontSize: '10px' }}>
                    {' '}- {cookie.categories.join(', ')}
                  </span>
                )}
                {cookie.security?.warnings && cookie.security.warnings.length > 0 && (
                  <span style={{ color: colors.danger, fontSize: '10px' }}>
                    {' '}⚠️ {cookie.security.warnings.length}
                  </span>
                )}
              </div>
            ))}
            {totalCookies > 10 && (
              <div style={{ 
                fontSize: '10px', 
                color: colors.textColorThirdly, 
                textAlign: 'center', 
                marginTop: '4px' 
              }}>
                ... et {totalCookies - 10} autres
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

export default CookiesSection;
