/**
 * useWikiContent - Hook for fetching wiki content
 * 
 * Fetches wiki sections and plugin documentation from the API,
 * with automatic filtering based on disabled plugins for DPD users.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// ============================================
// Types
// ============================================

interface Resource {
  title: string;
  link: string;
}

export interface WikiSection {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_visible: boolean;
}

export interface PluginDoc {
  plugin_id: string;
  title: string;
  description: string;
  use_case: string;
  resources: Resource[];
  screenshot_url: string;
}

interface WikiContent {
  sections: WikiSection[];
  plugins: PluginDoc[];
  isSeeded: boolean;
}

interface UseWikiContentResult {
  sections: WikiSection[];
  plugins: PluginDoc[];
  loading: boolean;
  error: string | null;
  isSeeded: boolean;
  refresh: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

const useWikiContent = (): UseWikiContentResult => {
  const [sections, setSections] = useState<WikiSection[]>([]);
  const [plugins, setPlugins] = useState<PluginDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeded, setIsSeeded] = useState(false);
  
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('checkitAuthToken');
      
      const response = await fetch(`${API_BASE_URL}/wiki/content`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wiki content');
      }
      
      const data: WikiContent = await response.json();
      
      setSections(data.sections || []);
      setPlugins(data.plugins || []);
      setIsSeeded(data.isSeeded);
    } catch (err) {
      console.error('Error fetching wiki content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  return {
    sections,
    plugins,
    loading,
    error,
    isSeeded,
    refresh: fetchContent
  };
};

export default useWikiContent;

