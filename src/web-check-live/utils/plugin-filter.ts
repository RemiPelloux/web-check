const API_BASE_URL = import.meta.env.PUBLIC_API_ENDPOINT || '/api';

let cachedDisabledPlugins: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

/**
 * Fetch disabled plugins from the server
 * @returns Promise<string[]> List of disabled plugin names
 */
export const fetchDisabledPlugins = async (): Promise<string[]> => {
  // SSR safety check
  if (!isBrowser()) {
    return [];
  }

  // Check cache first
  const now = Date.now();
  if (cachedDisabledPlugins !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedDisabledPlugins;
  }

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
    cacheTimestamp = now;
    
    return cachedDisabledPlugins;
  } catch (error) {
    console.error('Error fetching disabled plugins:', error);
    return [];
  }
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
};

export default {
  fetchDisabledPlugins,
  isPluginAvailable,
  filterAvailablePlugins,
  getUserRole,
  isAPDPUser,
  clearPluginCache
};

