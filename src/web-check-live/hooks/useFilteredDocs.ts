/**
 * useFilteredDocs - Hook for getting filtered documentation
 * 
 * Combines wiki content from API with fallback to static docs.ts,
 * and applies plugin filtering for DPD users.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import docs from 'web-check-live/utils/docs';
import { fetchDisabledPlugins, isPluginAvailable } from 'web-check-live/utils/plugin-filter';

const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// ============================================
// Types
// ============================================

interface Resource {
  title: string;
  link: string;
}

export interface Doc {
  id: string;
  title: string;
  description: string;
  use: string;
  resources: (string | Resource)[];
  screenshot?: string;
}

interface UseFilteredDocsResult {
  docs: Doc[];
  loading: boolean;
  error: string | null;
}

// ============================================
// Hook
// ============================================

const useFilteredDocs = (): UseFilteredDocsResult => {
  const [filteredDocs, setFilteredDocs] = useState<Doc[]>(docs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadAndFilterDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('checkitAuthToken');
      
      // Try to fetch from API first
      let apiPlugins: Doc[] = [];
      let useApiData = false;
      
      try {
        const response = await fetch(`${API_BASE_URL}/wiki/plugins`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.plugins && data.plugins.length > 0) {
            // Transform API data to Doc format
            apiPlugins = data.plugins.map((p: any) => ({
              id: p.plugin_id,
              title: p.title,
              description: p.description,
              use: p.use_case,
              resources: p.resources || [],
              screenshot: p.screenshot_url || undefined
            }));
            useApiData = true;
          }
        }
      } catch (apiError) {
        console.log('API not available, using static docs');
      }
      
      // Use API data if available, otherwise fallback to static docs
      const baseDocs = useApiData ? apiPlugins : docs;
      
      // Get disabled plugins
      const disabledPlugins = await fetchDisabledPlugins();
      
      // Filter out disabled plugins
      const filtered = baseDocs.filter(doc => 
        isPluginAvailable(doc.id, disabledPlugins)
      );
      
      setFilteredDocs(filtered);
    } catch (err) {
      console.error('Error loading docs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to static docs on error
      setFilteredDocs(docs);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadAndFilterDocs();
  }, [loadAndFilterDocs]);
  
  return {
    docs: filteredDocs,
    loading,
    error
  };
};

export default useFilteredDocs;



