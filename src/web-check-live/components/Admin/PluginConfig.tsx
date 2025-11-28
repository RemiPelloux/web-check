import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';
import { getPluginRefCode } from 'web-check-live/utils/pluginReferences';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// Plugin list with French translations - must match ACTIVE_PLUGINS in server.js
const PLUGINS = [
  // Conformité
  { id: 'rgpd-compliance', name: 'Conformité RGPD', category: 'Conformité' },
  { id: 'apdp-cookie-banner', name: 'Bannière Cookies APDP', category: 'Conformité' },
  { id: 'apdp-privacy-policy', name: 'Politique de Confidentialité APDP', category: 'Conformité' },
  { id: 'apdp-legal-notices', name: 'Mentions Légales APDP', category: 'Conformité' },
  { id: 'cookies', name: 'Cookies', category: 'Conformité' },
  
  // Sécurité
  { id: 'ssl', name: 'Certificat SSL', category: 'Sécurité' },
  { id: 'tls', name: 'Configuration TLS', category: 'Sécurité' },
  { id: 'vulnerabilities', name: 'Vulnérabilités', category: 'Sécurité' },
  { id: 'secrets', name: 'Secrets Exposés', category: 'Sécurité' },
  { id: 'http-security', name: 'Sécurité HTTP', category: 'Sécurité' },
  { id: 'firewall', name: 'Pare-feu', category: 'Sécurité' },
  { id: 'hsts', name: 'HSTS', category: 'Sécurité' },
  { id: 'threats', name: 'Menaces', category: 'Sécurité' },
  { id: 'block-lists', name: 'Listes de Blocage', category: 'Sécurité' },
  { id: 'tls-cipher-suites', name: 'Suites de Chiffrement TLS', category: 'Sécurité' },
  { id: 'tls-security-config', name: 'Configuration Sécurité TLS', category: 'Sécurité' },
  { id: 'tls-client-support', name: 'Support Client TLS', category: 'Sécurité' },
  { id: 'security-txt', name: 'Security.txt', category: 'Sécurité' },
  { id: 'exposed-files', name: 'Fichiers Exposés', category: 'Sécurité' },
  { id: 'subdomain-takeover', name: 'Subdomain Takeover', category: 'Sécurité' },
  { id: 'headers', name: 'En-têtes HTTP', category: 'Sécurité' },
  { id: 'ports', name: 'Ports Ouverts', category: 'Sécurité' },
  
  // DNS
  { id: 'dns', name: 'Enregistrements DNS', category: 'DNS' },
  { id: 'dns-server', name: 'Serveurs DNS', category: 'DNS' },
  { id: 'dnssec', name: 'DNSSEC', category: 'DNS' },
  { id: 'subdomain-enumeration', name: 'Énumération Sous-domaines', category: 'DNS' },
  { id: 'txt-records', name: 'Enregistrements TXT', category: 'DNS' },
  { id: 'domain', name: 'Informations Domaine', category: 'DNS' },
  { id: 'hosts', name: 'Noms d\'hôtes', category: 'DNS' },
  
  // Réseau
  { id: 'get-ip', name: 'Adresse IP', category: 'Réseau' },
  { id: 'location', name: 'Géolocalisation Serveur', category: 'Réseau' },
  { id: 'trace-route', name: 'Traceroute', category: 'Réseau' },
  { id: 'status', name: 'Statut Serveur', category: 'Réseau' },
  { id: 'server-info', name: 'Informations Serveur', category: 'Réseau' },
  
  // Performance
  { id: 'quality', name: 'Qualité du Site', category: 'Performance' },
  { id: 'lighthouse', name: 'Lighthouse', category: 'Performance' },
  { id: 'cdn-resources', name: 'Ressources CDN', category: 'Performance' },
  { id: 'carbon', name: 'Empreinte Carbone', category: 'Performance' },
  
  // SEO
  { id: 'social-tags', name: 'Balises Sociales', category: 'SEO' },
  { id: 'sitemap', name: 'Plan du Site', category: 'SEO' },
  { id: 'robots-txt', name: 'Robots.txt', category: 'SEO' },
  { id: 'linked-pages', name: 'Pages Liées', category: 'SEO' },
  { id: 'rank', name: 'Classement', category: 'SEO' },
  
  // Email
  { id: 'mail-config', name: 'Configuration Email', category: 'Email' },
  
  // Audit
  { id: 'link-audit', name: 'Audit des Liens', category: 'Audit' },
  
  // Historique
  { id: 'archives', name: 'Archives', category: 'Historique' },
  
  // Technique
  { id: 'tech-stack', name: 'Technologies Utilisées', category: 'Technique' },
  { id: 'redirects', name: 'Redirections', category: 'Technique' },
] as const;

// Group plugins by category
type Plugin = { id: string; name: string; category: string };
const groupedPlugins = PLUGINS.reduce((acc, plugin) => {
  if (!acc[plugin.category]) {
    acc[plugin.category] = [];
  }
  acc[plugin.category].push(plugin as Plugin);
  return acc;
}, {} as Record<string, Plugin[]>);

const Container = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${colors.borderColor};
`;

const InfoBox = styled.div`
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: ${colors.textColor};
  margin: 0;
  line-height: 1.6;

  strong {
    font-weight: 600;
    color: ${colors.primary};
  }
`;

const CategorySection = styled.div`
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textColor};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${colors.borderColor};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategoryIcon = styled.span<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.variant) {
      case 'Conformité': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'Sécurité': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'DNS': return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      case 'Réseau': return 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
      case 'Performance': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'SEO': return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
      case 'Email': return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
      case 'Audit': return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
      case 'Technique': return 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
      case 'Historique': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const getCategoryAbbr = (category: string): string => {
  switch (category) {
    case 'Conformité': return 'CF';
    case 'Sécurité': return 'SEC';
    case 'DNS': return 'DNS';
    case 'Réseau': return 'NET';
    case 'Performance': return 'PRF';
    case 'SEO': return 'SEO';
    case 'Email': return 'ML';
    case 'Audit': return 'AUD';
    case 'Technique': return 'TCH';
    case 'Historique': return 'HST';
    default: return '—';
  }
};

const PluginGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const PluginItem = styled.label<{ enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.enabled 
    ? 'rgba(5, 150, 105, 0.08)' 
    : 'rgba(220, 38, 38, 0.08)'};
  border: 2px solid ${props => props.enabled 
    ? 'rgba(5, 150, 105, 0.3)' 
    : 'rgba(220, 38, 38, 0.3)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.enabled ? '#059669' : '#dc2626'};
    background: ${props => props.enabled 
      ? 'rgba(5, 150, 105, 0.15)' 
      : 'rgba(220, 38, 38, 0.15)'};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${colors.primary};
  flex-shrink: 0;
`;

const PluginBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColorSecondary};
  border: 1px solid ${colors.borderColor};
  flex-shrink: 0;
`;

const PluginLabel = styled.span`
  font-size: 14px;
  color: ${colors.textColor};
  font-weight: 500;
  user-select: none;
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${colors.borderColor};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  background: ${props =>
    props.variant === 'primary'
      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
      : colors.backgroundDarker};
  color: ${props => props.variant === 'primary' ? 'white' : colors.textColor};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${colors.borderColor}`};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.variant === 'primary'
        ? '0 8px 16px rgba(220, 38, 38, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 14px;
`;

const PluginConfig = (): JSX.Element => {
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // All plugin IDs
  const allPluginIds = PLUGINS.map(p => p.id);

  useEffect(() => {
    fetchPluginConfig();
  }, []);

  const fetchPluginConfig = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/plugins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plugins');
      }

      const data = await response.json();
      const disabledPlugins = data.disabledPlugins || [];
      // Convert disabled to enabled: all plugins except disabled ones
      const enabled = allPluginIds.filter(id => !disabledPlugins.includes(id));
      setEnabledPlugins(enabled);
    } catch (error) {
      console.error('Error fetching plugins:', error);
      toast.error('Impossible de récupérer la configuration des plugins', {
        position: 'bottom-right',
        theme: 'dark',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlugin = (pluginId: string) => {
    setEnabledPlugins(prev => {
      if (prev.includes(pluginId)) {
        // Remove from enabled = disable it
        return prev.filter(id => id !== pluginId);
      } else {
        // Add to enabled = enable it
        return [...prev, pluginId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Toast de progression
    const toastId = toast.loading('Enregistrement de la configuration...', {
      position: 'bottom-right',
      theme: 'dark',
    });
    
    try {
      const token = localStorage.getItem('checkitAuthToken');
      // Convert enabled to disabled for API
      const disabledPlugins = allPluginIds.filter(id => !enabledPlugins.includes(id));
      const response = await fetch(`${API_BASE_URL}/admin/plugins`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disabledPlugins })
      });

      if (!response.ok) {
        throw new Error('Failed to update plugins');
      }

      // Success toast
      toast.update(toastId, {
        render: 'Configuration enregistrée avec succès',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
    } catch (error) {
      console.error('Error updating plugins:', error);
      // Error toast
      toast.update(toastId, {
        render: 'Erreur lors de l\'enregistrement de la configuration',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchPluginConfig();
    toast.info('Modifications annulées', {
      position: 'bottom-right',
      theme: 'dark',
      autoClose: 2000,
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Chargement de la configuration...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <InfoBox>
        <InfoText>
          <strong>Note :</strong> Les plugins <strong style={{color: '#059669'}}>cochés (vert)</strong> sont <strong>activés</strong>, 
          les plugins <strong style={{color: '#dc2626'}}>non cochés (rouge)</strong> sont <strong>désactivés</strong> pour les utilisateurs DPD.
        </InfoText>
      </InfoBox>

      <ActionButtons style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <Button onClick={handleReset} disabled={saving}>
          Annuler les modifications
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </Button>
      </ActionButtons>

      {Object.entries(groupedPlugins).map(([category, plugins]) => (
        <CategorySection key={category}>
          <CategoryTitle>
            <CategoryIcon variant={category}>{getCategoryAbbr(category)}</CategoryIcon>
            {category}
          </CategoryTitle>
          <PluginGrid>
            {plugins.map((plugin) => {
              const refCode = getPluginRefCode(plugin.id);
              return (
                <PluginItem
                  key={plugin.id}
                  enabled={enabledPlugins.includes(plugin.id)}
                >
                  <Checkbox
                    type="checkbox"
                    checked={enabledPlugins.includes(plugin.id)}
                    onChange={() => handleTogglePlugin(plugin.id)}
                  />
                  {refCode && <PluginBadge>{refCode}</PluginBadge>}
                  <PluginLabel>{plugin.name}</PluginLabel>
                </PluginItem>
              );
            })}
          </PluginGrid>
        </CategorySection>
      ))}

      <ActionButtons>
        <Button onClick={handleReset} disabled={saving}>
          Annuler les modifications
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default PluginConfig;

