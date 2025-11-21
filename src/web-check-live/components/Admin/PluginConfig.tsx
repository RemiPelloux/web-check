import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// Smart categorization and French translation for plugins
const getPluginInfo = (pluginId: string): { name: string; category: string } => {
  // Translation map for common terms
  const translations: Record<string, string> = {
    'apdp': 'APDP',
    'rgpd': 'RGPD',
    'cookie': 'Cookie',
    'cookies': 'Cookies',
    'banner': 'Bannière',
    'privacy': 'Confidentialité',
    'policy': 'Politique',
    'legal': 'Légal',
    'notices': 'Mentions',
    'pages': 'Pages',
    'compliance': 'Conformité',
    'vulnerabilities': 'Vulnérabilités',
    'ssl': 'Certificat SSL',
    'tls': 'TLS',
    'cipher': 'Chiffrement',
    'suites': 'Suites',
    'security': 'Sécurité',
    'config': 'Configuration',
    'client': 'Client',
    'support': 'Support',
    'headers': 'En-têtes',
    'http': 'HTTP',
    'hsts': 'HSTS',
    'txt': 'TXT',
    'firewall': 'Pare-feu',
    'ports': 'Ports',
    'block': 'Blocage',
    'lists': 'Listes',
    'threats': 'Menaces',
    'secrets': 'Secrets',
    'exposed': 'Exposés',
    'files': 'Fichiers',
    'mixed': 'Mixte',
    'content': 'Contenu',
    'subdomain': 'Sous-domaine',
    'takeover': 'Prise de Contrôle',
    'third': 'Tiers',
    'party': 'Partie',
    'risk': 'Risque',
    'dns': 'DNS',
    'server': 'Serveur',
    'dnssec': 'DNSSEC',
    'records': 'Enregistrements',
    'enumeration': 'Énumération',
    'whois': 'WHOIS',
    'ip': 'Adresse IP',
    'get': 'Obtenir',
    'trace': 'Tracer',
    'route': 'Route',
    'status': 'Statut',
    'cdn': 'CDN',
    'resources': 'Ressources',
    'quality': 'Qualité',
    'carbon': 'Empreinte Carbone',
    'lighthouse': 'Lighthouse',
    'performance': 'Performance',
    'metrics': 'Métriques',
    'social': 'Social',
    'tags': 'Balises',
    'rank': 'Classement',
    'legacy': 'Legacy',
    'linked': 'Liées',
    'robots': 'Robots',
    'sitemap': 'Plan du Site',
    'seo': 'SEO',
    'analysis': 'Analyse',
    'tech': 'Technologies',
    'stack': 'Stack',
    'redirects': 'Redirections',
    'features': 'Fonctionnalités',
    'api': 'API',
    'surface': 'Surface',
    'pwa': 'PWA',
    'audit': 'Audit',
    'screenshot': 'Capture d\'écran',
    'mail': 'E-mail',
    'accessibility': 'Accessibilité',
    'check': 'Vérification',
    'link': 'Liens',
    'archives': 'Archives',
  };

  // Smart translation
  const words = pluginId.split('-');
  const translatedWords = words.map(word => translations[word.toLowerCase()] || word);
  let name = translatedWords.join(' ');
  
  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Categorization logic
  let category = 'Technique';
  
  if (pluginId.includes('apdp') || pluginId.includes('rgpd') || pluginId.includes('cookie') || 
      pluginId.includes('privacy') || pluginId.includes('legal') || pluginId.includes('compliance')) {
    category = 'Conformité';
  } else if (pluginId.includes('vulnerab') || pluginId.includes('ssl') || pluginId.includes('tls') || 
             pluginId.includes('security') || pluginId.includes('header') || pluginId.includes('hsts') ||
             pluginId.includes('firewall') || pluginId.includes('port') || pluginId.includes('threat') ||
             pluginId.includes('secret') || pluginId.includes('exposed') || pluginId.includes('mixed') ||
             pluginId.includes('takeover') || pluginId.includes('risk') || pluginId.includes('block')) {
    category = 'Sécurité';
  } else if (pluginId.includes('dns') || pluginId.includes('whois') || pluginId.includes('subdomain') ||
             pluginId.includes('txt-record')) {
    category = 'DNS';
  } else if (pluginId.includes('ip') || pluginId.includes('trace') || pluginId.includes('status')) {
    category = 'Réseau';
  } else if (pluginId.includes('cdn') || pluginId.includes('quality') || pluginId.includes('carbon') ||
             pluginId.includes('lighthouse') || pluginId.includes('performance')) {
    category = 'Performance';
  } else if (pluginId.includes('seo') || pluginId.includes('social') || pluginId.includes('rank') ||
             pluginId.includes('linked') || pluginId.includes('robots') || pluginId.includes('sitemap')) {
    category = 'SEO';
  } else if (pluginId.includes('mail')) {
    category = 'E-mail';
  } else if (pluginId.includes('accessibility') || pluginId.includes('audit') || pluginId.includes('link-audit')) {
    category = 'Audit';
  } else if (pluginId.includes('archive')) {
    category = 'Historique';
  }

  return { name, category };
};

interface Plugin {
  id: string;
  name: string;
  category: string;
}

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
  gap: 8px;
`;

const PluginGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const PluginItem = styled.label<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.disabled ? 'rgba(220, 38, 38, 0.05)' : colors.background};
  border: 2px solid ${props => props.disabled ? 'rgba(220, 38, 38, 0.2)' : colors.borderColor};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    background: ${props => props.disabled ? 'rgba(220, 38, 38, 0.1)' : colors.backgroundDarker};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${colors.primary};
  flex-shrink: 0;
`;

const PluginLabel = styled.span`
  font-size: 14px;
  color: ${colors.textColor};
  font-weight: 500;
  user-select: none;
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
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [disabledPlugins, setDisabledPlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPluginsAndDisabled();
  }, []);

  const fetchPluginsAndDisabled = async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      
      // Fetch available plugins
      const pluginsResponse = await fetch(`${API_BASE_URL}/admin/plugins/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!pluginsResponse.ok) {
        throw new Error('Échec de la récupération des plugins disponibles');
      }

      const pluginsData = await pluginsResponse.json();
      
      // Convert plugin IDs to full plugin objects with names and categories
      const pluginList: Plugin[] = pluginsData.plugins.map((id: string) => {
        const info = getPluginInfo(id);
        return {
          id,
          name: info.name,
          category: info.category
        };
      });
      
      setPlugins(pluginList);

      // Fetch disabled plugins
      const disabledResponse = await fetch(`${API_BASE_URL}/admin/plugins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!disabledResponse.ok) {
        throw new Error('Échec de la récupération de la configuration');
      }

      const disabledData = await disabledResponse.json();
      setDisabledPlugins(disabledData.disabledPlugins || []);
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
    setDisabledPlugins(prev => {
      if (prev.includes(pluginId)) {
        return prev.filter(id => id !== pluginId);
      } else {
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
    fetchPluginsAndDisabled();
    toast.info('Modifications annulées', {
      position: 'bottom-right',
      theme: 'dark',
      autoClose: 2000,
    });
  };

  // Group plugins by category
  const groupedPlugins = plugins.reduce((acc, plugin) => {
    if (!acc[plugin.category]) {
      acc[plugin.category] = [];
    }
    acc[plugin.category].push(plugin);
    return acc;
  }, {} as Record<string, Plugin[]>);

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
          <strong>Note :</strong> Les plugins <strong>cochés</strong> ci-dessous seront <strong>désactivés</strong> pour
          tous les utilisateurs DPD. Cette configuration s'applique globalement à tous les comptes DPD.
        </InfoText>
      </InfoBox>

      {Object.entries(groupedPlugins).map(([category, plugins]) => (
        <CategorySection key={category}>
          <CategoryTitle>
            {category === 'Conformité' && '📋'}
            {category === 'Sécurité' && '🔒'}
            {category === 'DNS' && '🌐'}
            {category === 'Réseau' && '📡'}
            {category === 'Performance' && '⚡'}
            {category === 'SEO' && '🔍'}
            {category === 'E-mail' && '📧'}
            {category === 'Technique' && '⚙️'}
            {category === 'Audit' && '🔍'}
            {category === 'Historique' && '📚'}
            {category}
          </CategoryTitle>
          <PluginGrid>
            {plugins.map(plugin => (
              <PluginItem
                key={plugin.id}
                disabled={disabledPlugins.includes(plugin.id)}
              >
                <Checkbox
                  type="checkbox"
                  checked={disabledPlugins.includes(plugin.id)}
                  onChange={() => handleTogglePlugin(plugin.id)}
                />
                <PluginLabel>{plugin.name}</PluginLabel>
              </PluginItem>
            ))}
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

