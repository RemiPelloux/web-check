import { useState } from 'react';
import styled from '@emotion/styled';

interface SiteFaviconProps {
  domain: string;
  size?: number;
}

const FaviconContainer = styled.div<{ size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.size * 0.5}px;
    color: #9ca3af;
  }
`;

const SiteFavicon = ({ domain, size = 32 }: SiteFaviconProps): JSX.Element => {
  const [hasError, setHasError] = useState(false);
  
  // Extract base domain from full URL if needed
  const getBaseDomain = (url: string) => {
    try {
      if (url.startsWith('http')) {
        return new URL(url).hostname;
      }
      // Remove protocol if present
      url = url.replace(/^https?:\/\//, '');
      // Get the main domain (remove path)
      return url.split('/')[0];
    } catch {
      return url;
    }
  };

  const baseDomain = getBaseDomain(domain);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${baseDomain}&sz=${size}`;

  if (hasError) {
    return (
      <FaviconContainer size={size}>
        <div className="fallback">🌐</div>
      </FaviconContainer>
    );
  }

  return (
    <FaviconContainer size={size}>
      <img 
        src={faviconUrl} 
        alt={`${baseDomain} favicon`}
        onError={() => setHasError(true)}
      />
    </FaviconContainer>
  );
};

export default SiteFavicon;


