import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Heading from 'web-check-live/components/Form/Heading';

interface SubdomainResult {
  subdomain: string;
  ipv4: string[];
  cname: string[];
  found: boolean;
}

interface SubdomainAnalysis {
  totalFound: number;
  uniqueIPs: string[];
  hasCDN: boolean;
  hasWildcard: boolean;
  categories: {
    development: SubdomainResult[];
    production: SubdomainResult[];
    mail: SubdomainResult[];
    infrastructure: SubdomainResult[];
    application: SubdomainResult[];
    other: SubdomainResult[];
  };
}

interface SubdomainData {
  domain: string;
  queryDomain: string;
  subdomains: SubdomainResult[];
  analysis: SubdomainAnalysis;
  methods: {
    wildcardDetection: {
      detected: boolean;
      wildcardIPs: string[];
      message: string;
      impact: string;
    };
    certificateTransparency: {
      attempted: boolean;
      found: number;
      verified: number;
      reliability: string;
    };
    dnsBruteForce: {
      attempted: boolean;
      tested: number;
      found: number;
      filtered: boolean;
      reliability: string;
    };
    zoneTransfer: {
      attempted: boolean;
      success: boolean;
      message: string;
    };
  };
  summary: {
    totalSubdomains: number;
    uniqueIPAddresses: number;
    hasCDN: boolean;
    hasWildcard: boolean;
    wildcardNote?: string | null;
    executionTimeMs: number;
  };
}

const CategorySection = styled.div`
  margin: 1.5rem 0;
  
  h4 {
    margin: 1rem 0 0.75rem 0;
    color: ${colors.primary};
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .count-badge {
      background: ${colors.primary};
      color: ${colors.background};
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;
    }
  }
`;

const SubdomainList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubdomainItem = styled.div`
  background: ${colors.backgroundDarker};
  border-left: 3px solid ${colors.success};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.bgShadowColor};
    transform: translateX(4px);
  }
  
  .subdomain-name {
    font-family: 'PTMono', monospace;
    font-size: 1rem;
    color: ${colors.textColor};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .subdomain-details {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.85rem;
    
    .detail-item {
      color: ${colors.textColorSecondary};
      
      .detail-label {
        font-weight: 600;
        color: ${colors.primary};
        margin-right: 0.25rem;
      }
      
      .detail-value {
        font-family: 'PTMono', monospace;
        color: ${colors.textColor};
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${colors.textColorSecondary};
  font-style: italic;
`;

const ScrollableContent = styled.div`
  max-height: 60rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.backgroundDarker};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.primary};
    border-radius: 4px;
    
    &:hover {
      background: ${colors.primaryDarker};
    }
  }
`;

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    development: '🔧',
    production: '🌐',
    mail: '📧',
    infrastructure: '🔌',
    application: '📱',
    other: '📂'
  };
  return icons[category] || '📄';
};

const SubdomainEnumerationCard = (props: { data: SubdomainData, title: string, actionButtons: any }): JSX.Element => {
  const { data } = props;
  
  if (!data || !data.subdomains) {
    return (
      <Card heading={props.title} actionButtons={props.actionButtons}>
        <EmptyState>No subdomain data available</EmptyState>
      </Card>
    );
  }

  const renderSubdomain = (sub: SubdomainResult) => (
    <SubdomainItem key={sub.subdomain}>
      <div className="subdomain-name">{sub.subdomain}</div>
      <div className="subdomain-details">
        {sub.ipv4 && sub.ipv4.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">IPv4:</span>
            <span className="detail-value">{sub.ipv4.join(', ')}</span>
          </div>
        )}
        {sub.cname && sub.cname.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">CNAME:</span>
            <span className="detail-value">{sub.cname.join(', ')}</span>
          </div>
        )}
      </div>
    </SubdomainItem>
  );

  const renderCategory = (categoryName: keyof SubdomainAnalysis['categories']) => {
    const category = data.analysis.categories[categoryName];
    if (!category || category.length === 0) return null;

    return (
      <CategorySection key={categoryName}>
        <h4>
          <span>{getCategoryIcon(categoryName)}</span>
          <span style={{ textTransform: 'capitalize' }}>{categoryName}</span>
          <span className="count-badge">{category.length}</span>
        </h4>
        <SubdomainList>
          {category.map(renderSubdomain)}
        </SubdomainList>
      </CategorySection>
    );
  };

  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles="grid-row: span 3;">
      <ScrollableContent>
        {/* Categorized Subdomains */}
        {data.subdomains.length > 0 ? (
          <>
            <Heading as="h3" size="small" color={colors.primary}>
              Discovered Subdomains by Category
            </Heading>
            {Object.keys(data.analysis.categories).map(cat => 
              renderCategory(cat as keyof SubdomainAnalysis['categories'])
            )}
          </>
        ) : (
          <EmptyState>No subdomains discovered for {data.domain}</EmptyState>
        )}
      </ScrollableContent>
    </Card>
  );
};

export default SubdomainEnumerationCard;

