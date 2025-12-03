/**
 * Authentication Routes
 * Handles login, logout, token verification, and IP-based auto-auth
 */
import express from 'express';
import {
  authMiddleware,
  ipAutoAuthMiddleware,
  generateToken,
  getClientIp,
  checkLoginRateLimit
} from '../middleware/auth.js';
import {
  verifyUser,
  getAllUsers,
  addAuditLog,
  recordLoginAttempt
} from '../../database/db.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * APDP users: username + password required
 * DPD users: username only + IP check
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Identifiant requis',
        message: 'Nom d\'utilisateur requis'
      });
    }
    
    // Check rate limit
    const rateLimit = checkLoginRateLimit(username);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Trop de tentatives',
        message: rateLimit.message,
        remainingTime: rateLimit.remainingTime
      });
    }
    
    // Get user from database
    const dbUser = getAllUsers().find(u => u.username === username);
    const clientIp = getClientIp(req);
    
    if (!dbUser) {
      recordLoginAttempt(username, clientIp, false);
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
        message: 'Nom d\'utilisateur incorrect',
        remainingAttempts: rateLimit.remainingAttempts - 1
      });
    }
    
    // For APDP users: require password
    // For DPD users: skip password, only check IP
    if (dbUser.role === 'APDP') {
      if (!password) {
        recordLoginAttempt(username, clientIp, false);
        return res.status(401).json({
          success: false,
          error: 'Mot de passe requis',
          message: 'Les administrateurs APDP doivent fournir un mot de passe',
          remainingAttempts: rateLimit.remainingAttempts - 1
        });
      }
      
      const user = verifyUser(username, password);
      if (!user) {
        recordLoginAttempt(username, clientIp, false);
        return res.status(401).json({
          success: false,
          error: 'Identifiants invalides',
          message: 'Mot de passe incorrect',
          remainingAttempts: rateLimit.remainingAttempts - 1
        });
      }
    } else {
      // DPD users: check IP restrictions only
      if (dbUser.ip_restrictions && dbUser.ip_restrictions.trim() !== '') {
        const allowedIps = dbUser.ip_restrictions.split(',').map(ip => ip.trim());
        if (!allowedIps.includes(clientIp)) {
          recordLoginAttempt(username, clientIp, false);
          addAuditLog(dbUser.id, 'IP_RESTRICTION_VIOLATION', `Login attempt from unauthorized IP: ${clientIp}`, clientIp);
          
          return res.status(403).json({
            success: false,
            error: 'Accès refusé',
            message: `Votre adresse IP (${clientIp}) n'est pas autorisée. Contactez l'administrateur APDP.`
          });
        }
      }
    }
    
    // Record successful login
    recordLoginAttempt(username, clientIp, true);
    addAuditLog(dbUser.id, 'LOGIN', `Successful login from ${clientIp}`, clientIp);
    
    // Generate JWT token
    const token = generateToken({
      id: dbUser.id,
      username: dbUser.username,
      role: dbUser.role
    });
    
    return res.json({
      success: true,
      token,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion'
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token and return user info
 */
router.get('/verify', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

/**
 * GET /api/auth/profile
 * Get fresh user profile from database (for refreshing cached data)
 * Returns full profile including allowedUrls, company, etc.
 */
router.get('/profile', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      company: req.user.company,
      allowedUrls: req.user.allowed_urls,
      urlRestrictionMode: req.user.url_restriction_mode,
      ipRestrictions: req.user.ip_restrictions
    }
  });
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authMiddleware, (req, res) => {
  addAuditLog(req.user.id, 'LOGOUT', `User logged out`, getClientIp(req));
  return res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

/**
 * GET /api/auth/ip-auto
 * IP-based auto-authentication for DPD users
 */
router.get('/ip-auto', ipAutoAuthMiddleware);

export default router;



