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
  };
}

const CookiesSection: React.FC<CookiesSectionProps> = ({ cookies }) => {
  if (!cookies?.cookies) {
    return (
      <div style={{ color: colors.textColorThirdly }}>
        Aucun cookie détecté
      </div>
    );
  }

  const totalCookies = cookies.cookies.length;
  const secureCookies = cookies.cookies.filter(c => c.secure).length;
  const httpOnlyCookies = cookies.cookies.filter(c => c.httpOnly).length;
  const sameSiteCookies = cookies.cookies.filter(c => c.sameSite).length;

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
            {cookies.cookies.slice(0, 10).map((cookie, i) => (
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
