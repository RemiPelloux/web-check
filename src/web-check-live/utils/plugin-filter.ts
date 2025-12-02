const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

// Cache state
let cachedDisabledPlugins: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Singleton promise to prevent N+1 API calls
// When multiple hooks call fetchDisabledPlugins() simultaneously,
// they all await the same in-flight request instead of making 40+ separate calls
let pendingFetchPromise: Promise<string[]> | null = null;

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

/**
 * Fetch disabled plugins from the server
 * Uses singleton promise pattern - all concurrent calls share the same request
 * @returns Promise<string[]> List of disabled plugin names
 */
export const fetchDisabledPlugins = async (): Promise<string[]> => {
  // SSR safety check
  if (!isBrowser()) {
    return [];
  }

  // Check cache first (synchronous - fastest path)
  const now = Date.now();
  if (cachedDisabledPlugins !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedDisabledPlugins;
  }

  // If there's already a fetch in progress, reuse it (prevents N+1 calls)
  if (pendingFetchPromise !== null) {
    return pendingFetchPromise;
  }

  // Start the actual fetch and store the promise
  pendingFetchPromise = (async (): Promise<string[]> => {
    try {
      const token = localStorage.getItem('checkitAuthToken');
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/plugins/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch disabled plugins');
        return [];
      }

      const data = await response.json();
      cachedDisabledPlugins = data.disabledPlugins || [];
      cacheTimestamp = Date.now();
      
      return cachedDisabledPlugins;
    } catch (error) {
      console.error('Error fetching disabled plugins:', error);
      return [];
    } finally {
      // Clear the pending promise after completion
      pendingFetchPromise = null;
    }
  })();

  return pendingFetchPromise;
};

/**
 * Check if a plugin is available for the current user
 * @param pluginName Plugin identifier
 * @param disabledPlugins List of disabled plugins
 * @returns boolean True if plugin is available
 */
export const isPluginAvailable = (pluginName: string, disabledPlugins: string[]): boolean => {
  return !disabledPlugins.includes(pluginName);
};

/**
 * Filter an array of plugin names based on user role
 * @param plugins Array of plugin names
 * @param disabledPlugins List of disabled plugins
 * @returns Filtered array of available plugins
 */
export const filterAvailablePlugins = <T extends string>(
  plugins: readonly T[],
  disabledPlugins: string[]
): T[] => {
  return plugins.filter(plugin => isPluginAvailable(plugin, disabledPlugins));
};

/**
 * Get user role from localStorage
 * @returns 'APDP' | 'DPD' | null
 */
export const getUserRole = (): 'APDP' | 'DPD' | null => {
  // SSR safety check
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem('checkitUserRole') as 'APDP' | 'DPD' | null;
};

/**
 * Check if current user is APDP admin
 * @returns boolean
 */
export const isAPDPUser = (): boolean => {
  return getUserRole() === 'APDP';
};

/**
 * Clear the disabled plugins cache (useful after admin updates)
 */
export const clearPluginCache = (): void => {
  cachedDisabledPlugins = null;
  cacheTimestamp = 0;
  pendingFetchPromise = null;
};

export default {
  fetchDisabledPlugins,
  isPluginAvailable,
  filterAvailablePlugins,
  getUserRole,
  isAPDPUser,
  clearPluginCache
};

