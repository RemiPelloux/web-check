/**
 * SectionEditor - Edit wiki section content
 * 
 * Provides form for editing wiki section title, content, visibility
 */

import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import RichTextEditor from './RichTextEditor';

// ============================================
// Types
// ============================================

export interface WikiSection {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_visible: boolean;
  updated_at?: string;
}

interface SectionEditorProps {
  section: WikiSection;
  onSave: (section: WikiSection) => Promise<void>;
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

const Badge = styled.span<{ variant: 'visible' | 'hidden' }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.variant === 'visible' 
    ? 'rgba(5, 150, 105, 0.15)' 
    : 'rgba(220, 38, 38, 0.15)'};
  color: ${props => props.variant === 'visible' ? '#059669' : '#dc2626'};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${colors.primary};
`;

const CheckboxLabel = styled.span`
  font-size: 14px;
  color: ${colors.textColor};
`;

const HelpText = styled.p`
  font-size: 12px;
  color: ${colors.textColorSecondary};
  margin-top: 6px;
  margin-bottom: 0;
`;

const UpdatedAt = styled.span`
  font-size: 12px;
  color: ${colors.textColorSecondary};
`;

// ============================================
// Component
// ============================================

const SectionEditor = ({
  section,
  onSave,
  onCancel,
  saving = false
}: SectionEditorProps): JSX.Element => {
  const [formData, setFormData] = useState<WikiSection>(section);
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form when section changes
  useEffect(() => {
    setFormData(section);
    setIsDirty(false);
  }, [section]);
  
  // Update field handler
  const updateField = useCallback(<K extends keyof WikiSection>(
    field: K,
    value: WikiSection[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);
  
  // Save handler
  const handleSave = async () => {
    await onSave(formData);
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
          <span>{section.id === 'new' ? 'Nouvelle Section' : section.title}</span>
          <Badge variant={formData.is_visible ? 'visible' : 'hidden'}>
            {formData.is_visible ? 'Visible' : 'Masqué'}
          </Badge>
        </Title>
        <Actions>
          {section.updated_at && (
            <UpdatedAt>Modifié: {formatDate(section.updated_at)}</UpdatedAt>
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
          <Label htmlFor="section-title">Titre de la section</Label>
          <Input
            id="section-title"
            type="text"
            value={formData.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="Entrez le titre de la section"
            disabled={saving}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Contenu</Label>
          <RichTextEditor
            value={formData.content}
            onChange={value => updateField('content', value)}
            placeholder="Rédigez le contenu de la section..."
            minHeight="300px"
            disabled={saving}
          />
          <HelpText>
            Utilisez la barre d'outils pour formater le texte. 
            Raccourcis: Ctrl+B (gras), Ctrl+I (italique), Ctrl+U (souligné)
          </HelpText>
        </FormGroup>
        
        <FormGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="section-visible"
              checked={formData.is_visible}
              onChange={e => updateField('is_visible', e.target.checked)}
              disabled={saving}
            />
            <CheckboxLabel>
              Section visible dans le Wiki
            </CheckboxLabel>
          </CheckboxGroup>
          <HelpText>
            Les sections masquées ne sont pas affichées aux utilisateurs DPD
          </HelpText>
        </FormGroup>
      </Content>
    </EditorContainer>
  );
};

export default SectionEditor;
export type { WikiSection };







