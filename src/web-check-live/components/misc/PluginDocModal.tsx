/**
 * PluginDocModal - Modal content for plugin documentation
 * 
 * Fetches and displays plugin documentation from the wiki API.
 * Used in the Results page modal when clicking the "info" button on result cards.
 */

import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import usePluginDoc from 'web-check-live/hooks/usePluginDoc';
import PluginDocRenderer from './PluginDocRenderer';

// ============================================
// Types
// ============================================

interface PluginDocModalProps {
  pluginId: string;
}

// ============================================
// Styled Components
// ============================================

const Container = styled.div`
  min-height: 100px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: ${colors.textColorSecondary};
  font-size: 14px;
  
  &::before {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid ${colors.primary};
    border-top-color: transparent;
    border-radius: 50%;
    margin-right: 12px;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${colors.textColorSecondary};
  
  p {
    margin: 0 0 8px;
  }
  
  .error-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .error-message {
    font-size: 14px;
    opacity: 0.7;
  }
`;

const NotFoundState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${colors.textColorSecondary};
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

// ============================================
// Component
// ============================================

const PluginDocModal = ({ pluginId }: PluginDocModalProps): JSX.Element => {
  const { doc, loading, error } = usePluginDoc(pluginId);
  
  if (loading) {
    return (
      <Container>
        <LoadingState>
          Chargement de la documentation...
        </LoadingState>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorState>
          <div className="error-icon">⚠️</div>
          <p>Impossible de charger la documentation</p>
          <p className="error-message">{error}</p>
        </ErrorState>
      </Container>
    );
  }
  
  if (!doc) {
    return (
      <Container>
        <NotFoundState>
          <p>Aucune documentation n'est encore disponible pour ce widget.</p>
        </NotFoundState>
      </Container>
    );
  }
  
  return (
    <Container>
      <PluginDocRenderer 
        doc={{
          id: doc.plugin_id,
          title: doc.title,
          description: doc.description,
          use_case: doc.use_case,
          resources: doc.resources || [],
          screenshot_url: doc.screenshot_url
        }}
        showScreenshot={true}
      />
    </Container>
  );
};

export default PluginDocModal;

