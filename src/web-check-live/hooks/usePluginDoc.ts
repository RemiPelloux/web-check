/**
 * usePluginDoc - Hook for fetching a single plugin documentation
 * 
 * Fetches plugin documentation from the wiki API by plugin ID.
 * Used by the Results page modal and anywhere else single plugin docs are needed.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

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
  is_visible?: boolean;
}

interface UsePluginDocResult {
  doc: PluginDoc | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

const usePluginDoc = (pluginId: string): UsePluginDocResult => {
  const [doc, setDoc] = useState<PluginDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDoc = useCallback(async () => {
    if (!pluginId) {
      setDoc(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('checkitAuthToken');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/wiki/plugins/${pluginId}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Documentation non trouvée');
        }
        throw new Error('Erreur lors du chargement de la documentation');
      }
      
      const data = await response.json();
      
      if (data.success && data.plugin) {
        setDoc(data.plugin);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Error fetching plugin doc:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [pluginId]);
  
  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);
  
  return {
    doc,
    loading,
    error,
    refresh: fetchDoc
  };
};

export default usePluginDoc;

