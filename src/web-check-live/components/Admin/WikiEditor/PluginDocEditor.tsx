/**
 * PluginDocEditor - Edit plugin documentation
 * 
 * Provides form for editing plugin title, description, use case,
 * resources list, and screenshot URL
 */

import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import RichTextEditor from './RichTextEditor';

// ============================================
// Types
// ============================================

export interface Resource {
  title: string;
  link: string;
}

export interface PluginDoc {
  plugin_id: string;
  title: string;
  description: string;
  use_case: string;
  resources: Resource[];
  screenshot_url: string;
  updated_at?: string;
}

interface PluginDocEditorProps {
  plugin: PluginDoc;
  isEnabled: boolean;
  onSave: (plugin: PluginDoc) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

// ============================================
// Styled Components
// ============================================

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.borderColor};
  background: ${colors.backgroundLighter};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textColor};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Badge = styled.span<{ variant: 'enabled' | 'disabled' }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.variant === 'enabled' 
    ? 'rgba(5, 150, 105, 0.15)' 
    : 'rgba(220, 38, 38, 0.15)'};
  color: ${props => props.variant === 'enabled' ? '#059669' : '#dc2626'};
`;

const PluginId = styled.span`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${colors.backgroundDarker};
  color: ${colors.textColorSecondary};
  font-family: monospace;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
    : colors.backgroundDarker};
  color: ${props => props.variant === 'primary' ? 'white' : colors.textColor};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${colors.borderColor}`};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.variant === 'primary' 
      ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textColor};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: ${colors.backgroundDarker};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  color: ${colors.textColor};
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
  
  &::placeholder {
    color: ${colors.textColorSecondary};
    opacity: 0.6;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  margin-top: 6px;
  margin-bottom: 0;
`;

const ResourcesContainer = styled.div`
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  overflow: hidden;
`;

const ResourceItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: ${colors.backgroundDarker};
  border-bottom: 1px solid ${colors.borderColor};
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const ResourceInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 6px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(220, 38, 38, 0.2);
  }
`;

const AddResourceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-top: 1px solid ${colors.borderColor};
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(220, 38, 38, 0.05);
  }
`;

const ScreenshotPreview = styled.div`
  margin-top: 12px;
  
  img {
    max-width: 300px;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid ${colors.borderColor};
  }
`;

const NoScreenshot = styled.div`
  padding: 24px;
  text-align: center;
  background: ${colors.backgroundDarker};
  border-radius: 8px;
  color: ${colors.textColorSecondary};
  font-size: 13px;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UpdatedAt = styled.span`
  font-size: 12px;
  color: ${colors.textColorSecondary};
`;

// ============================================
// Component
// ============================================

const PluginDocEditor = ({
  plugin,
  isEnabled,
  onSave,
  onCancel,
  saving = false
}: PluginDocEditorProps): JSX.Element => {
  const [formData, setFormData] = useState<PluginDoc>(plugin);
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form when plugin changes
  useEffect(() => {
    setFormData(plugin);
    setIsDirty(false);
  }, [plugin]);
  
  // Update field handler
  const updateField = useCallback(<K extends keyof PluginDoc>(
    field: K,
    value: PluginDoc[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);
  
  // Resource handlers
  const addResource = () => {
    const newResources = [...formData.resources, { title: '', link: '' }];
    updateField('resources', newResources);
  };
  
  const updateResource = (index: number, field: keyof Resource, value: string) => {
    const newResources = [...formData.resources];
    newResources[index] = { ...newResources[index], [field]: value };
    updateField('resources', newResources);
  };
  
  const removeResource = (index: number) => {
    const newResources = formData.resources.filter((_, i) => i !== index);
    updateField('resources', newResources);
  };
  
  // Save handler
  const handleSave = async () => {
    // Filter out empty resources
    const cleanedData = {
      ...formData,
      resources: formData.resources.filter(r => r.title || r.link)
    };
    await onSave(cleanedData);
    setIsDirty(false);
  };
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <EditorContainer>
      <Header>
        <Title>
          <PluginId>{plugin.plugin_id}</PluginId>
          <span>{formData.title || plugin.plugin_id}</span>
          <Badge variant={isEnabled ? 'enabled' : 'disabled'}>
            {isEnabled ? 'Activé' : 'Désactivé'}
          </Badge>
        </Title>
        <Actions>
          {plugin.updated_at && (
            <UpdatedAt>Modifié: {formatDate(plugin.updated_at)}</UpdatedAt>
          )}
          <Button onClick={onCancel} disabled={saving}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={saving || !isDirty}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Actions>
      </Header>
      
      <Content>
        <FormGroup>
          <Label htmlFor="plugin-title">Titre du plugin</Label>
          <Input
            id="plugin-title"
            type="text"
            value={formData.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="Entrez le titre du plugin"
            disabled={saving}
          />
        </FormGroup>
        
        <TwoColumn>
          <FormGroup>
            <Label>Description</Label>
            <RichTextEditor
              value={formData.description}
              onChange={value => updateField('description', value)}
              placeholder="Décrivez ce que fait ce plugin..."
              minHeight="150px"
              disabled={saving}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Cas d'usage</Label>
            <RichTextEditor
              value={formData.use_case}
              onChange={value => updateField('use_case', value)}
              placeholder="Quand et pourquoi utiliser ce plugin..."
              minHeight="150px"
              disabled={saving}
            />
          </FormGroup>
        </TwoColumn>
        
        <FormGroup>
          <Label htmlFor="screenshot-url">URL de la capture d'écran</Label>
          <Input
            id="screenshot-url"
            type="url"
            value={formData.screenshot_url}
            onChange={e => updateField('screenshot_url', e.target.value)}
            placeholder="https://exemple.com/image.png"
            disabled={saving}
          />
          <HelpText>
            Lien direct vers une image (PNG, JPG). Laissez vide si pas de capture.
          </HelpText>
          
          <ScreenshotPreview>
            {formData.screenshot_url ? (
              <img 
                src={formData.screenshot_url} 
                alt="Preview" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <NoScreenshot>Aucune capture d'écran</NoScreenshot>
            )}
          </ScreenshotPreview>
        </FormGroup>
        
        <FormGroup>
          <Label>Ressources Utiles</Label>
          <ResourcesContainer>
            {formData.resources.map((resource, index) => (
              <ResourceItem key={index}>
                <ResourceInput
                  type="text"
                  value={resource.title}
                  onChange={e => updateResource(index, 'title', e.target.value)}
                  placeholder="Titre du lien"
                  disabled={saving}
                />
                <ResourceInput
                  type="url"
                  value={resource.link}
                  onChange={e => updateResource(index, 'link', e.target.value)}
                  placeholder="https://..."
                  disabled={saving}
                />
                <RemoveButton 
                  onClick={() => removeResource(index)}
                  disabled={saving}
                >
                  Supprimer
                </RemoveButton>
              </ResourceItem>
            ))}
            <AddResourceButton onClick={addResource} disabled={saving}>
              + Ajouter une ressource
            </AddResourceButton>
          </ResourcesContainer>
          <HelpText>
            Ajoutez des liens vers la documentation officielle, tutoriels ou références
          </HelpText>
        </FormGroup>
      </Content>
    </EditorContainer>
  );
};

export default PluginDocEditor;
export type { PluginDoc, Resource };



