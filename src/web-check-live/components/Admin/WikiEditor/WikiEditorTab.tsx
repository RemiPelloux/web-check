/**
 * WikiEditorTab - Main wiki editor component for admin panel
 * 
 * Provides a sidebar with sections/plugins list and main editor area
 */

import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { toast } from 'react-toastify';
import SectionEditor, { WikiSection } from './SectionEditor';
import PluginDocEditor, { PluginDoc } from './PluginDocEditor';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// ============================================
// Types
// ============================================

type EditorMode = 'section' | 'plugin' | null;

interface WikiState {
  sections: WikiSection[];
  plugins: PluginDoc[];
  disabledPlugins: string[];
  isSeeded: boolean;
}

// ============================================
// Styled Components
// ============================================

const Container = styled.div`
  display: flex;
  height: calc(100vh - 200px);
  min-height: 500px;
  background: ${colors.backgroundLighter};
  border-radius: 16px;
  border: 1px solid ${colors.borderColor};
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid ${colors.borderColor};
  display: flex;
  flex-direction: column;
  background: ${colors.background};
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${colors.borderColor};
`;

const SidebarTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textColor};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  padding-left: 36px;
  background: ${colors.backgroundDarker};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  color: ${colors.textColor};
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  
  &::placeholder {
    color: ${colors.textColorSecondary};
  }
  
  &:focus {
    border-color: ${colors.primary};
    background: ${colors.background};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    pointer-events: none;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SidebarSection = styled.div`
  padding: 8px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${colors.textColorSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  margin-bottom: 4px;
`;

const SidebarItem = styled.button<{ active?: boolean; variant?: 'section' | 'plugin' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: ${props => props.active 
    ? 'rgba(220, 38, 38, 0.1)' 
    : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? colors.primary : colors.textColor};
  font-size: 13px;
  font-weight: ${props => props.active ? 600 : 400};
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: ${props => props.active 
      ? 'rgba(220, 38, 38, 0.15)' 
      : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const ItemIcon = styled.span<{ variant: 'section' | 'plugin'; enabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  background: ${props => {
    if (props.variant === 'section') return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
    return props.enabled 
      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
      : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
  }};
  color: white;
`;

const ItemText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusDot = styled.span<{ visible: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.visible ? '#059669' : '#dc2626'};
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${colors.backgroundLighter};
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textColor};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.textColorSecondary};
  max-width: 400px;
`;

const SeedButton = styled.button`
  margin-top: 24px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textColorSecondary};
  font-size: 14px;
`;

const SidebarFooter = styled.div`
  padding: 12px;
  border-top: 1px solid ${colors.borderColor};
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px dashed ${colors.borderColor};
  border-radius: 8px;
  color: ${colors.textColorSecondary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    background: rgba(220, 38, 38, 0.05);
  }
`;

// ============================================
// Component
// ============================================

const WikiEditorTab = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wikiState, setWikiState] = useState<WikiState>({
    sections: [],
    plugins: [],
    disabledPlugins: [],
    isSeeded: false
  });
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Fetch wiki content
  const fetchWikiContent = useCallback(async () => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      
      // Fetch wiki content
      const wikiRes = await fetch(`${API_BASE_URL}/wiki/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!wikiRes.ok) throw new Error('Failed to fetch wiki content');
      const wikiData = await wikiRes.json();
      
      // Fetch disabled plugins
      const pluginsRes = await fetch(`${API_BASE_URL}/admin/plugins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const pluginsData = pluginsRes.ok ? await pluginsRes.json() : { disabledPlugins: [] };
      
      setWikiState({
        sections: wikiData.sections || [],
        plugins: wikiData.plugins || [],
        disabledPlugins: pluginsData.disabledPlugins || [],
        isSeeded: wikiData.isSeeded
      });
    } catch (error) {
      console.error('Error fetching wiki:', error);
      toast.error('Erreur lors du chargement du contenu wiki');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchWikiContent();
  }, [fetchWikiContent]);
  
  // Seed wiki content
  const handleSeed = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/wiki/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: false })
      });
      
      if (!response.ok) throw new Error('Failed to seed wiki');
      
      toast.success('Contenu wiki initialisé avec succès');
      await fetchWikiContent();
    } catch (error) {
      console.error('Error seeding wiki:', error);
      toast.error('Erreur lors de l\'initialisation du wiki');
    } finally {
      setSaving(false);
    }
  };
  
  // Save section
  const handleSaveSection = async (section: WikiSection) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/wiki/sections/${section.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(section)
      });
      
      if (!response.ok) throw new Error('Failed to save section');
      
      toast.success('Section enregistrée avec succès');
      await fetchWikiContent();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Erreur lors de l\'enregistrement de la section');
    } finally {
      setSaving(false);
    }
  };
  
  // Save plugin doc
  const handleSavePlugin = async (plugin: PluginDoc) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('checkitAuthToken');
      const response = await fetch(`${API_BASE_URL}/admin/wiki/plugins/${plugin.plugin_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plugin)
      });
      
      if (!response.ok) throw new Error('Failed to save plugin');
      
      toast.success('Documentation du plugin enregistrée');
      await fetchWikiContent();
    } catch (error) {
      console.error('Error saving plugin:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle item selection
  const handleSelectSection = (id: string) => {
    setEditorMode('section');
    setSelectedId(id);
  };
  
  const handleSelectPlugin = (id: string) => {
    setEditorMode('plugin');
    setSelectedId(id);
  };
  
  // Get selected item
  const getSelectedSection = (): WikiSection | null => {
    if (editorMode !== 'section' || !selectedId) return null;
    return wikiState.sections.find(s => s.id === selectedId) || null;
  };
  
  const getSelectedPlugin = (): PluginDoc | null => {
    if (editorMode !== 'plugin' || !selectedId) return null;
    return wikiState.plugins.find(p => p.plugin_id === selectedId) || null;
  };
  
  const isPluginEnabled = (pluginId: string): boolean => {
    return !wikiState.disabledPlugins.includes(pluginId);
  };
  
  // Filter sections and plugins based on search query
  const normalizeText = (text: string) => 
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const filteredSections = wikiState.sections.filter(section =>
    normalizeText(section.title).includes(normalizeText(searchQuery))
  );
  
  const filteredPlugins = wikiState.plugins.filter(plugin =>
    normalizeText(plugin.title).includes(normalizeText(searchQuery))
  );
  
  // Loading state
  if (loading) {
    return (
      <Container>
        <LoadingState>Chargement du contenu wiki...</LoadingState>
      </Container>
    );
  }
  
  // Not seeded state
  if (!wikiState.isSeeded) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>📚</EmptyIcon>
          <EmptyTitle>Wiki non initialisé</EmptyTitle>
          <EmptyText>
            Le contenu wiki n'a pas encore été initialisé. 
            Cliquez sur le bouton ci-dessous pour créer le contenu par défaut 
            à partir de la documentation existante.
          </EmptyText>
          <SeedButton onClick={handleSeed} disabled={saving}>
            {saving ? 'Initialisation...' : 'Initialiser le Wiki'}
          </SeedButton>
        </EmptyState>
      </Container>
    );
  }
  
  const selectedSection = getSelectedSection();
  const selectedPlugin = getSelectedPlugin();
  
  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Contenu Wiki</SidebarTitle>
          <SearchWrapper>
            <SearchInput
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>
        </SidebarHeader>
        
        <SidebarContent>
          {filteredSections.length > 0 && (
            <SidebarSection>
              <SectionLabel>Sections ({filteredSections.length})</SectionLabel>
              {filteredSections.map(section => (
                <SidebarItem
                  key={section.id}
                  active={editorMode === 'section' && selectedId === section.id}
                  onClick={() => handleSelectSection(section.id)}
                >
                  <ItemIcon variant="section">S</ItemIcon>
                  <ItemText>{section.title}</ItemText>
                  <StatusDot visible={section.is_visible} />
                </SidebarItem>
              ))}
            </SidebarSection>
          )}
          
          {filteredPlugins.length > 0 && (
            <SidebarSection>
              <SectionLabel>Plugins ({filteredPlugins.length})</SectionLabel>
              {filteredPlugins.map(plugin => (
                <SidebarItem
                  key={plugin.plugin_id}
                  active={editorMode === 'plugin' && selectedId === plugin.plugin_id}
                  onClick={() => handleSelectPlugin(plugin.plugin_id)}
                >
                  <ItemIcon 
                    variant="plugin" 
                    enabled={isPluginEnabled(plugin.plugin_id)}
                  >
                    P
                  </ItemIcon>
                  <ItemText>{plugin.title}</ItemText>
                  <StatusDot visible={plugin.is_visible !== false} title={plugin.is_visible !== false ? 'Visible' : 'Masqué'} />
                </SidebarItem>
              ))}
            </SidebarSection>
          )}
          
          {searchQuery && filteredSections.length === 0 && filteredPlugins.length === 0 && (
            <EmptyState style={{ padding: '24px' }}>
              <EmptyText>Aucun résultat pour "{searchQuery}"</EmptyText>
            </EmptyState>
          )}
        </SidebarContent>
        
        {/* Hidden for now - feature coming later
        <SidebarFooter>
          <AddButton onClick={() => toast.info('Fonctionnalité à venir')}>
            + Nouvelle section
          </AddButton>
        </SidebarFooter>
        */}
      </Sidebar>
      
      <MainArea>
        {editorMode === 'section' && selectedSection && (
          <SectionEditor
            section={selectedSection}
            onSave={handleSaveSection}
            onCancel={() => {
              setEditorMode(null);
              setSelectedId(null);
            }}
            saving={saving}
          />
        )}
        
        {editorMode === 'plugin' && selectedPlugin && (
          <PluginDocEditor
            plugin={selectedPlugin}
            isEnabled={isPluginEnabled(selectedPlugin.plugin_id)}
            onSave={handleSavePlugin}
            onCancel={() => {
              setEditorMode(null);
              setSelectedId(null);
            }}
            saving={saving}
          />
        )}
        
        {!editorMode && (
          <EmptyState>
            <EmptyIcon>✏️</EmptyIcon>
            <EmptyTitle>Sélectionnez un élément</EmptyTitle>
            <EmptyText>
              Choisissez une section ou un plugin dans la liste de gauche 
              pour modifier son contenu.
            </EmptyText>
          </EmptyState>
        )}
      </MainArea>
    </Container>
  );
};

export default WikiEditorTab;

