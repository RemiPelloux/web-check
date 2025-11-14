// Authentication check script for APDP Checkit
(function() {
    // Don't check auth on login page
    if (window.location.pathname === '/login' || window.location.pathname === '/login.html') {
        return;
    }

    const API_BASE_URL = '/api';

    // Check if user is authenticated and session is valid (24h)
    const checkSessionValidity = () => {
        const token = localStorage.getItem('checkitAuthToken');
        const sessionExpiry = localStorage.getItem('checkitSessionExpiry');
        
        if (!token) {
            return false;
        }
        
        // Check if session has expired (24h limit)
        if (sessionExpiry) {
            const now = Date.now();
            const expiry = parseInt(sessionExpiry, 10);
            
            if (now >= expiry) {
                console.log('Session expired (24h limit reached)');
                return false;
            }
        }
        
        return true;
    };

    // Clear session data
    const clearSessionData = () => {
        localStorage.removeItem('checkitAuthToken');
        localStorage.removeItem('checkitUser');
        localStorage.removeItem('checkitUsername');
        localStorage.removeItem('checkitUserRole');
        localStorage.removeItem('checkitLoginTime');
        localStorage.removeItem('checkitSessionExpiry');
        sessionStorage.removeItem('authCheckDone');
    };

    // Check authentication on page load
    if (!checkSessionValidity() && !sessionStorage.getItem('authCheckDone')) {
        // Not authenticated or session expired, redirect to login
        clearSessionData();
        sessionStorage.setItem('authCheckDone', 'true');
        window.location.href = '/login';
        return;
    }

    const token = localStorage.getItem('checkitAuthToken');

    // Verify token with server
    const verifyToken = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Token invalid or expired
                console.log('Token verification failed, redirecting to login');
                clearSessionData();
                window.location.href = '/login';
                return;
            }

            const data = await response.json();
            
            // Store user role globally for access control
            window.checkitUserRole = data.user.role;
            localStorage.setItem('checkitUserRole', data.user.role);
            
            // Check token expiration (optional, for refresh logic)
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const timeUntilExpiration = expirationTime - Date.now();
            
            // Warn user 5 minutes before expiration
            if (timeUntilExpiration < 5 * 60 * 1000 && timeUntilExpiration > 0) {
                console.warn('Session will expire soon. Please save your work.');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            // On network error, allow user to continue (offline mode)
            // But set a flag to retry verification
            setTimeout(verifyToken, 60000); // Retry in 1 minute
        }
    };

    // Verify token on page load
    if (token) {
        verifyToken();
    }

    // Logout functionality
    window.checkitLogout = async function() {
        const token = localStorage.getItem('checkitAuthToken');
        
        if (token) {
            try {
                // Notify server of logout
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        // Clear all auth data including session timestamps
        clearSessionData();
        
        // Redirect to login
        window.location.href = '/login';
    };

    // Monitor session expiration periodically (every minute)
    const sessionMonitor = setInterval(() => {
        if (!checkSessionValidity()) {
            console.log('Session expired - logging out');
            clearSessionData();
            window.location.href = '/login';
            clearInterval(sessionMonitor);
        }
    }, 60000); // Check every minute

    // Add keyboard shortcut for logout (Ctrl+Shift+L)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            window.checkitLogout();
        }
    });
})();
