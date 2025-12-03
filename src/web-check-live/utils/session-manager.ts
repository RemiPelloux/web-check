/**
 * Session Management Utility
 * Manages 24-hour persistent authentication sessions
 */

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if the current session is still valid (within 24h)
 * @returns boolean - true if session is valid, false otherwise
 */
export const isSessionValid = (): boolean => {
  const expiryTime = localStorage.getItem('checkitSessionExpiry');
  
  if (!expiryTime) {
    return false;
  }

  const now = Date.now();
  const expiry = parseInt(expiryTime, 10);

  return now < expiry;
};

/**
 * Check if user is authenticated with a valid session
 * @returns boolean - true if authenticated and session valid
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('checkitAuthToken');
  const username = localStorage.getItem('checkitUsername');
  
  return !!(token && username && isSessionValid());
};

/**
 * Clear all authentication data from localStorage
 */
export const clearSession = (): void => {
  localStorage.removeItem('checkitAuthToken');
  localStorage.removeItem('checkitUser');
  localStorage.removeItem('checkitUsername');
  localStorage.removeItem('checkitUserRole');
  localStorage.removeItem('checkitLoginTime');
  localStorage.removeItem('checkitSessionExpiry');
};

/**
 * Get remaining session time in milliseconds
 * @returns number - milliseconds remaining, or 0 if expired/no session
 */
export const getRemainingSessionTime = (): number => {
  const expiryTime = localStorage.getItem('checkitSessionExpiry');
  
  if (!expiryTime) {
    return 0;
  }

  const now = Date.now();
  const expiry = parseInt(expiryTime, 10);
  const remaining = expiry - now;

  return remaining > 0 ? remaining : 0;
};

/**
 * Get session info for display
 * @returns object with session details
 */
export const getSessionInfo = () => {
  const loginTime = localStorage.getItem('checkitLoginTime');
  const expiryTime = localStorage.getItem('checkitSessionExpiry');
  const username = localStorage.getItem('checkitUsername');
  const role = localStorage.getItem('checkitUserRole');

  if (!loginTime || !expiryTime) {
    return null;
  }

  const now = Date.now();
  const login = parseInt(loginTime, 10);
  const expiry = parseInt(expiryTime, 10);
  const remaining = expiry - now;

  return {
    username,
    role,
    loginTimestamp: login,
    expiryTimestamp: expiry,
    remainingMs: remaining > 0 ? remaining : 0,
    isValid: remaining > 0,
    remainingHours: remaining > 0 ? Math.floor(remaining / (60 * 60 * 1000)) : 0,
    remainingMinutes: remaining > 0 ? Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)) : 0,
  };
};

/**
 * Initialize session check on app load
 * Redirects to login if session expired
 */
export const initSessionCheck = (): void => {
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/wiki', '/about'];
  const currentPath = window.location.pathname;
  const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
  
  if (!isAuthenticated() && !isPublicPath) {
    // Only redirect if we're not on a public page
    if (currentPath !== '/') {
      clearSession();
      window.location.href = '/';
    }
  }
};

/**
 * Check if current page is a public path (no auth required)
 * @returns boolean - true if on public page
 */
export const isPublicPage = (): boolean => {
  const publicPaths = ['/login', '/wiki', '/about'];
  const currentPath = window.location.pathname;
  return publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
};

/**
 * Setup periodic session validation (checks every minute)
 * Skips redirect on public pages (wiki, about, login)
 * @param onExpire - Callback function to execute when session expires
 */
export const setupSessionMonitor = (onExpire?: () => void): NodeJS.Timeout => {
  const checkInterval = setInterval(() => {
    // Don't redirect on public pages
    if (isPublicPage()) {
      return;
    }
    
    if (!isSessionValid()) {
      clearSession();
      if (onExpire) {
        onExpire();
      } else {
        window.location.href = '/';
      }
      clearInterval(checkInterval);
    }
  }, 60000); // Check every minute

  return checkInterval;
};

