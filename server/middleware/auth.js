import jwt from 'jsonwebtoken';
import { findUserById, addAuditLog, getFailedLoginAttempts, findDPDUserByIP } from '../../database/db.js';

// JWT secret key - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'apdp-checkit-secret-key-change-in-production';
const JWT_EXPIRATION = '8h';

/**
 * Generate JWT token for authenticated user
 * @param {object} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {object} req - Express request object
 * @returns {string|null} Token or null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Get client IP address from request
 * @param {object} req - Express request object
 * @returns {string} Client IP address
 */
export const getClientIp = (req) => {
  // Development mode: use configured IP
  if (process.env.NODE_ENV === 'development' && process.env.DEV_PUBLIC_IP) {
    return process.env.DEV_PUBLIC_IP;
  }
  
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

/**
 * Check if IP matches any in the restriction list
 * @param {string} clientIp - Client IP address
 * @param {string} restrictions - Comma-separated IP addresses
 * @returns {boolean} True if IP is allowed
 */
const checkIpRestrictions = (clientIp, restrictions) => {
  if (!restrictions || restrictions.trim() === '') {
    return true; // No restrictions
  }
  
  const allowedIps = restrictions.split(',').map(ip => ip.trim());
  return allowedIps.includes(clientIp);
};

/**
 * IP-based auto-authentication middleware for DPD users
 * Checks if client IP matches any DPD user's whitelist and auto-generates token
 * Only logs on first authentication, not on every call
 */
export const ipAutoAuthMiddleware = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    
    // Try to find DPD user by IP
    const dpdUser = findDPDUserByIP(clientIp);
    
    if (!dpdUser) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: `Votre adresse IP (${clientIp}) n'est pas autorisée. Veuillez contacter l'administrateur APDP.`,
        clientIp
      });
    }
    
    // Generate JWT token for auto-authenticated user
    const token = generateToken({
      id: dpdUser.id,
      username: dpdUser.username,
      role: dpdUser.role
    });
    
    // ONLY log if this is a new login (check if 'logAuth' query param is present)
    // This prevents logging every auto-auth API call
    if (req.query.logAuth === 'true') {
      addAuditLog(dpdUser.id, 'IP_AUTO_AUTH', `Auto-authenticated via IP: ${clientIp}`, clientIp);
    }
    
    return res.json({
      success: true,
      token,
      user: {
        id: dpdUser.id,
        username: dpdUser.username,
        role: dpdUser.role,
        company: dpdUser.company,
        allowedUrls: dpdUser.allowed_urls,
        urlRestrictionMode: dpdUser.url_restriction_mode
      },
      message: 'Authentification automatique réussie'
    });
    
  } catch (error) {
    console.error('IP auto-auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'authentification automatique'
    });
  }
};

/**
 * Authentication middleware - Verify JWT token
 * Adds user object to req.user if authenticated
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        message: 'Token manquant'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      });
    }
    
    // Fetch full user from database
    const user = findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable',
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Check IP restrictions for DPD users
    if (user.role === 'DPD' && user.ip_restrictions) {
      const clientIp = getClientIp(req);
      if (!checkIpRestrictions(clientIp, user.ip_restrictions)) {
        // Log unauthorized access attempt
        addAuditLog(user.id, 'IP_RESTRICTION_VIOLATION', `Attempted access from ${clientIp}`, clientIp);
        
        return res.status(403).json({
          success: false,
          error: 'Accès refusé',
          message: 'Votre adresse IP n\'est pas autorisée à accéder à ce système'
        });
      }
    }
    
    // Attach user to request (without password)
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'authentification'
    });
  }
};

/**
 * Admin-only middleware - Requires APDP role
 * Must be used after authMiddleware
 */
export const adminOnlyMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise',
      message: 'Non authentifié'
    });
  }
  
  if (req.user.role !== 'APDP') {
    // Log unauthorized admin access attempt
    addAuditLog(req.user.id, 'UNAUTHORIZED_ADMIN_ACCESS', `Attempted admin access by ${req.user.role} user`, getClientIp(req));
    
    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
      message: 'Vous n\'avez pas les droits d\'accès à cette section'
    });
  }
  
  next();
};

/**
 * Rate limiting for login attempts
 * @param {string} username - Username
 * @returns {object} Rate limit status
 */
export const checkLoginRateLimit = (username) => {
  const failedAttempts = getFailedLoginAttempts(username, 15);
  const maxAttempts = 5;
  
  if (failedAttempts >= maxAttempts) {
    return {
      allowed: false,
      remainingTime: 15, // minutes
      message: `Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.`
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - failedAttempts
  };
};

/**
 * Plugin access middleware - Check if DPD user can access plugin
 * Must be used after authMiddleware
 */
export const pluginAccessMiddleware = (disabledPluginsList) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }
    
    // APDP users have access to all plugins
    if (req.user.role === 'APDP') {
      return next();
    }
    
    // Extract plugin name from URL
    // URL format: /api/plugin-name
    const urlParts = req.path.split('/');
    const pluginName = urlParts[urlParts.length - 1];
    
    // Check if plugin is disabled for DPD users
    if (disabledPluginsList.includes(pluginName)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: `Vous n'avez pas accès à cette fonctionnalité`
      });
    }
    
    next();
  };
};

export default {
  authMiddleware,
  adminOnlyMiddleware,
  ipAutoAuthMiddleware,
  generateToken,
  verifyToken,
  getClientIp,
  checkLoginRateLimit,
  pluginAccessMiddleware
};

