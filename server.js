
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import historyApiFallback from 'connect-history-api-fallback';

// Load environment variables from .env file
dotenv.config();

// Create the Express app
const app = express();

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import authentication and database modules
import {
  authMiddleware,
  adminOnlyMiddleware,
  ipAutoAuthMiddleware,
  generateToken,
  getClientIp,
  checkLoginRateLimit
} from './server/middleware/auth.js';

import {
  verifyUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  findUserById,
  getDisabledPlugins,
  setDisabledPlugins,
  addAuditLog,
  recordLoginAttempt,
  getScanHistory,
  getAggregateStatistics,
  recordScan,
  updateScanStatistics,
  getAuditLogs,
  cleanAuditLogs,
  db
} from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000; // The port to run the server on
const API_DIR = '/api'; // Name of the dir containing the lambda functions
const dirPath = path.join(__dirname, API_DIR); // Path to the lambda functions dir
const guiPath = path.join(__dirname, 'dist', 'client');
const placeholderFilePath = path.join(__dirname, 'public', 'placeholder.html');
const handlers = {}; // Will store list of API endpoints
process.env.WC_SERVER = 'true'; // Tells middleware to return in non-lambda mode

// Enable CORS
app.use(cors({
  origin: process.env.API_CORS_ORIGIN || '*',
}));

// Define max requests within each time frame
const limits = [
  { timeFrame: 10 * 60, max: 100, messageTime: '10 minutes' },
  { timeFrame: 60 * 60, max: 250, messageTime: '1 hour' },
  { timeFrame: 12 * 60 * 60, max: 500, messageTime: '12 hours' },
];

// Construct a message to be returned if the user has been rate-limited
const makeLimiterResponseMsg = (retryAfter) => {
  const why = 'This keeps the service running smoothly for everyone. '
  + 'You can get around these limits by running your own instance of Outil d\'Audit de Conformité.';
  return `You've been rate-limited, please try again in ${retryAfter} seconds.\n${why}`;
};

// Create rate limiters for each time frame
const limiters = limits.map(limit => rateLimit({
  windowMs: limit.timeFrame * 1000,
  max: limit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: makeLimiterResponseMsg(limit.messageTime) }
}));

// If rate-limiting enabled, then apply the limiters to the /api endpoint
if (process.env.API_ENABLE_RATE_LIMIT === 'true') {
  app.use(API_DIR, limiters);
}

// ==================== Authentication Routes ====================

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * APDP users: username + password required
 * DPD users: username only + IP check
 */
app.post(`${API_DIR}/auth/login`, async (req, res) => {
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
      // Record failed login attempt
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
      // APDP must provide password
      if (!password) {
        recordLoginAttempt(username, clientIp, false);
        return res.status(401).json({
          success: false,
          error: 'Mot de passe requis',
          message: 'Les administrateurs APDP doivent fournir un mot de passe',
          remainingAttempts: rateLimit.remainingAttempts - 1
        });
      }
      
      // Verify password for APDP
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
app.get(`${API_DIR}/auth/verify`, authMiddleware, (req, res) => {
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
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
app.post(`${API_DIR}/auth/logout`, authMiddleware, (req, res) => {
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
app.get(`${API_DIR}/auth/ip-auto`, ipAutoAuthMiddleware);

/**
 * POST /api/audit/scan
 * Record a scan in the audit history
 */
app.post(`${API_DIR}/audit/scan`, authMiddleware, (req, res) => {
  try {
    const { url, results } = req.body;
    
    if (!url || !results) {
      return res.status(400).json({
        success: false,
        error: 'Données requises',
        message: 'URL et résultats du scan requis'
      });
    }
    
    const scanId = recordScan(
      req.user.id,
      url,
      getClientIp(req),
      results
    );
    
    // Update anonymous statistics
    updateScanStatistics(
      req.user.role,
      results.criticalCount || 0,
      results.warningCount || 0,
      results.improvementCount || 0
    );
    
    // Add to audit log
    addAuditLog(
      req.user.id,
      'SCAN_COMPLETED',
      `Scanned URL (score: ${results.numericScore || 'N/A'})`,
      getClientIp(req)
    );
    
    return res.json({
      success: true,
      scanId,
      message: 'Scan enregistré avec succès'
    });
  } catch (error) {
    console.error('Record scan error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible d\'enregistrer le scan'
    });
  }
});

// ==================== Admin Routes ====================

/**
 * GET /api/admin/users
 * Get all users (APDP only)
 */
app.get(`${API_DIR}/admin/users`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const users = getAllUsers();
    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la liste des utilisateurs'
    });
  }
});

/**
 * POST /api/admin/users
 * Create new user (APDP only)
 */
app.post(`${API_DIR}/admin/users`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { username, password, role, ipRestrictions, urlRestrictionMode, allowedUrls, company } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Données requises',
        message: 'Nom d\'utilisateur requis'
      });
    }
    
    // For DPD users, password is optional (auto-generate random one)
    const finalPassword = password || Math.random().toString(36).slice(-12);
    
    const newUser = createUser(
      username, 
      finalPassword, 
      role || 'DPD', 
      ipRestrictions || '',
      urlRestrictionMode || 'RESTRICTED',
      allowedUrls || '',
      company || ''
    );
    
    addAuditLog(req.user.id, 'CREATE_USER', `Created user: ${username} (${role || 'DPD'})`, getClientIp(req));
    
    return res.json({
      success: true,
      user: newUser,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur existe déjà',
        message: 'Ce nom d\'utilisateur est déjà utilisé'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'utilisateur'
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user (APDP only)
 */
app.put(`${API_DIR}/admin/users/:id`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = {};
    
    if (req.body.username !== undefined) updates.username = req.body.username;
    if (req.body.password !== undefined) updates.password = req.body.password;
    if (req.body.role !== undefined) updates.role = req.body.role;
    if (req.body.ipRestrictions !== undefined) updates.ipRestrictions = req.body.ipRestrictions;
    if (req.body.urlRestrictionMode !== undefined) updates.urlRestrictionMode = req.body.urlRestrictionMode;
    if (req.body.allowedUrls !== undefined) updates.allowedUrls = req.body.allowedUrls;
    if (req.body.company !== undefined) updates.company = req.body.company;
    
    const success = updateUser(userId, updates);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable',
        message: 'Utilisateur non trouvé'
      });
    }
    
    addAuditLog(req.user.id, 'UPDATE_USER', `Updated user ID: ${userId}`, getClientIp(req));
    
    return res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour l\'utilisateur'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (APDP only)
 */
app.delete(`${API_DIR}/admin/users/:id`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting own account
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Action interdite',
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    const success = deleteUser(userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable',
        message: 'Utilisateur non trouvé'
      });
    }
    
    addAuditLog(req.user.id, 'DELETE_USER', `Deleted user ID: ${userId}`, getClientIp(req));
    
    return res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'utilisateur'
    });
  }
});

/**
 * GET /api/admin/plugins/available
 * Get list of all available plugins by scanning the API folder (APDP only)
 */
app.get(`${API_DIR}/admin/plugins/available`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const apiPath = path.join(__dirname, 'api');
    const files = fs.readdirSync(apiPath);
    
    // Filter only .js files, exclude _common folder and middleware files
    const plugins = files
      .filter(file => {
        if (!file.endsWith('.js')) return false;
        if (file.startsWith('_')) return false;
        return true;
      })
      .map(file => {
        // Remove .js extension to get plugin ID
        const pluginId = file.replace('.js', '');
        return pluginId;
      })
      .sort();
    
    return res.json({
      success: true,
      plugins
    });
  } catch (error) {
    console.error('Get available plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la liste des plugins disponibles'
    });
  }
});

/**
 * GET /api/admin/plugins
 * Get disabled plugins list (APDP only)
 */
app.get(`${API_DIR}/admin/plugins`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const disabledPlugins = getDisabledPlugins();
    return res.json({
      success: true,
      disabledPlugins
    });
  } catch (error) {
    console.error('Get plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la liste des plugins'
    });
  }
});

/**
 * PUT /api/admin/plugins
 * Update disabled plugins list (APDP only)
 */
app.put(`${API_DIR}/admin/plugins`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { disabledPlugins } = req.body;
    
    if (!Array.isArray(disabledPlugins)) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        message: 'La liste des plugins doit être un tableau'
      });
    }
    
    setDisabledPlugins(disabledPlugins);
    
    addAuditLog(
      req.user.id,
      'UPDATE_PLUGINS',
      `Updated disabled plugins: ${disabledPlugins.join(', ') || 'none'}`,
      getClientIp(req)
    );
    
    return res.json({
      success: true,
      message: 'Configuration des plugins mise à jour avec succès'
    });
  } catch (error) {
    console.error('Update plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la configuration des plugins'
    });
  }
});

/**
 * GET /api/admin/statistics
 * Get anonymous aggregate statistics (APDP only)
 */
app.get(`${API_DIR}/admin/statistics`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const rawStats = getAggregateStatistics({ days });
    
    // Get DPD user count
    const allUsers = getAllUsers();
    const dpdUsers = allUsers.filter(user => user.role === 'DPD').length;
    
    // Get scan history for chart (last 30 days)
    const scanHistoryStmt = db.prepare(`
      SELECT date, SUM(total_scans) as scans
      FROM scan_statistics
      WHERE date >= date('now', '-30 days')
      GROUP BY date
      ORDER BY date ASC
    `);
    const scanHistory = scanHistoryStmt.all();
    
    // If no scan history, generate empty data for last 7 days
    let formattedScanHistory = scanHistory;
    if (scanHistory.length === 0) {
      formattedScanHistory = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        formattedScanHistory.push({
          date: date.toISOString().split('T')[0],
          scans: 0
        });
      }
    }
    
    // Format data for frontend
    const stats = {
      totalScans: rawStats?.totalScans || 0,
      criticalIssues: rawStats?.totalCritical || 0,
      warningIssues: rawStats?.totalWarnings || 0,
      dpdUsers: dpdUsers,
      scansPerUser: dpdUsers > 0 ? (rawStats?.totalScans || 0) / dpdUsers : 0,
      scanHistory: formattedScanHistory.map(row => ({
        date: row.date,
        scans: row.scans || 0
      })),
      issuesByType: {
        critical: rawStats?.totalCritical || 0,
        warnings: rawStats?.totalWarnings || 0,
        improvements: rawStats?.totalImprovements || 0
      }
    };
    
    return res.json({
      success: true,
      data: stats,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les statistiques',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/audit-log
 * Get full audit log with filters (APDP only)
 */
app.get(`${API_DIR}/admin/audit-log`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAuditLogs(limit);
    
    return res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le journal d\'audit'
    });
  }
});

/**
 * DELETE /api/admin/audit-log/clean
 * Clean all audit logs (APDP only)
 */
app.delete(`${API_DIR}/admin/audit-log/clean`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const deletedCount = cleanAuditLogs();
    
    // Log the action
    addAuditLog(
      req.user.id,
      'LOGS_CLEANED',
      `Suppression de ${deletedCount} logs`,
      getClientIp(req)
    );
    
    return res.json({
      success: true,
      message: `${deletedCount} logs supprimés avec succès`,
      deletedCount
    });
  } catch (error) {
    console.error('Clean audit log error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de nettoyer le journal d\'audit'
    });
  }
});

/**
 * GET /api/admin/scan-history
 * Get scan history with filters (APDP only)
 */
app.get(`${API_DIR}/admin/scan-history`, authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const filters = {
      userId: req.query.userId ? parseInt(req.query.userId) : undefined,
      role: req.query.role,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 100
    };
    
    const history = getScanHistory(filters);
    
    return res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Get scan history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'historique des scans'
    });
  }
});

/**
 * POST /api/check-url
 * Check if a URL is allowed for the current user
 */
app.post(`${API_DIR}/check-url`, authMiddleware, (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL requise',
        message: 'Veuillez fournir une URL à vérifier'
      });
    }
    
    const user = findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable'
      });
    }
    
    // APDP users can scan any URL
    if (user.role === 'APDP') {
      return res.json({
        success: true,
        allowed: true,
        mode: 'ALL'
      });
    }
    
    // DPD users: check URL restriction mode
    if (user.url_restriction_mode === 'ALL') {
      return res.json({
        success: true,
        allowed: true,
        mode: 'ALL'
      });
    }
    
    // RESTRICTED mode: check if URL is in allowed list
    const allowedUrls = user.allowed_urls ? user.allowed_urls.split(',').map(u => u.trim()).filter(Boolean) : [];
    
    // Normalize URLs for comparison (remove protocol, www, trailing slashes)
    const normalizeUrl = (urlStr) => {
      try {
        const urlObj = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
        return urlObj.hostname.replace(/^www\./, '').toLowerCase();
      } catch {
        return urlStr.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
      }
    };
    
    const normalizedInputUrl = normalizeUrl(url);
    const isAllowed = allowedUrls.some(allowedUrl => {
      const normalizedAllowedUrl = normalizeUrl(allowedUrl);
      return normalizedInputUrl === normalizedAllowedUrl || normalizedInputUrl.endsWith(`.${normalizedAllowedUrl}`);
    });
    
    return res.json({
      success: true,
      allowed: isAllowed,
      mode: 'RESTRICTED',
      allowedUrls: allowedUrls
    });
    
  } catch (error) {
    console.error('Check URL error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de vérifier l\'URL'
    });
  }
});

/**
 * GET /api/plugins/available
 * Get available plugins for current user
 */
app.get(`${API_DIR}/plugins/available`, authMiddleware, (req, res) => {
  try {
    const disabledPlugins = getDisabledPlugins();
    
    // APDP users see all plugins, DPD users see filtered list
    if (req.user.role === 'APDP') {
      return res.json({
        success: true,
        disabledPlugins: []
      });
    }
    
    return res.json({
      success: true,
      disabledPlugins
    });
  } catch (error) {
    console.error('Get available plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// ==================== End of Authentication & Admin Routes ====================

// Read and register each API function as an Express routes
fs.readdirSync(dirPath, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
  .forEach(async dirent => {
    const routeName = dirent.name.split('.')[0];
    const route = `${API_DIR}/${routeName}`;
    // const handler = require(path.join(dirPath, dirent.name));

    const handlerModule = await import(path.join(dirPath, dirent.name));
    const handler = handlerModule.default || handlerModule;
    handlers[route] = handler;

    app.get(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

const renderPlaceholderPage = async (res, msgId, logs) => {
  const errorMessages = {
    notCompiled: 'Looks like the GUI app has not yet been compiled.<br />'
    + 'Run <code>yarn build</code> to continue, then restart the server.',
    notCompiledSsrHandler: 'Server-side rendering failed to initiate, as SSR handler not found.<br />'
    + 'This can be fixed by running <code>yarn build</code>, then restarting the server.<br />',
    disabledGui:  'Web-Check API is up and running!<br />Access the endpoints at '
    + `<a href="${API_DIR}"><code>${API_DIR}</code></a>`,
  };
  const logOutput = logs ? `<div class="logs"><code>${logs}</code></div>` : '';
  const errorMessage = (errorMessages[msgId] || 'An mystery error occurred.') + logOutput;
  const placeholderContent = await fs.promises.readFile(placeholderFilePath, 'utf-8');
  const htmlContent = placeholderContent.replace('<!-- CONTENT -->', errorMessage );
  res.status(500).send(htmlContent);
};

// Create a single API endpoint to execute all lambda functions
app.get(API_DIR, async (req, res) => {
  const results = {};
  const { url } = req.query;
  const maxExecutionTime = process.env.API_TIMEOUT_LIMIT || 20000;

  const executeHandler = async (handler, req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const mockRes = {
          status: () => mockRes,
          json: (body) => resolve({ body }),
        };
        await handler({ ...req, query: { url } }, mockRes);
      } catch (err) {
        reject(err);
      }
    });
  };

  const timeout = (ms, jobName = null) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(
          `Timed out after ${ms/1000} seconds${jobName ? `, when executing ${jobName}` : ''}`
        ));
      }, ms);
    });
  };

  const handlerPromises = Object.entries(handlers).map(async ([route, handler]) => {
    const routeName = route.replace(`${API_DIR}/`, '');

    try {
      const result = await Promise.race([
        executeHandler(handler, req, res),
        timeout(maxExecutionTime, routeName)
      ]);
      results[routeName] = result.body;
    } catch (err) {
      results[routeName] = { error: err.message };
    }
  });

  await Promise.all(handlerPromises);
  res.json(results);
});

// Skip the marketing homepage, for self-hosted users
app.use((req, res, next) => {
  if (req.path === '/' && process.env.BOSS_SERVER !== 'true' && !process.env.DISABLE_GUI) {
    req.url = '/check';
  }
  next();
});

// Serve up the GUI - if build dir exists, and GUI feature enabled
if (process.env.DISABLE_GUI && process.env.DISABLE_GUI !== 'false') {
  app.get('/', async (req, res) => {
    renderPlaceholderPage(res, 'disabledGui');
  });
} else if (!fs.existsSync(guiPath)) {
  app.get('/', async (req, res) => {
    renderPlaceholderPage(res, 'notCompiled');
  });
} else { // GUI enabled, and build files present, let's go!!
  app.use(express.static('dist/client/'));
  app.use(async (req, res, next) => {
    const ssrHandlerPath = path.join(__dirname, 'dist', 'server', 'entry.mjs');
    import(ssrHandlerPath).then(({ handler: ssrHandler }) => {
      ssrHandler(req, res, next);
    }).catch(async err => {
      renderPlaceholderPage(res, 'notCompiledSsrHandler', err.message);
    });
  });  
}

// Handle SPA routing
app.use(historyApiFallback({
  rewrites: [
    { from: new RegExp(`^${API_DIR}/.*$`), to: (context) => context.parsedUrl.path },
    { from: /^.*$/, to: '/index.html' }
  ]
}));

// Anything left unhandled (which isn't an API endpoint), return a 404
app.use((req, res, next) => {
  if (!req.path.startsWith(`${API_DIR}/`)) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'error.html'));
  } else {
    next();
  }
});

// Print nice welcome message to user
const printMessage = () => {
  console.log(
    `\x1b[36m\n` +
    '    __      __   _         ___ _           _   \n' +
    '    \\ \\    / /__| |__ ___ / __| |_  ___ __| |__\n' +
    '     \\ \\/\\/ / -_) \'_ \\___| (__| \' \\/ -_) _| / /\n' +
    '      \\_/\\_/\\___|_.__/    \\___|_||_\\___\\__|_\\_\\\n' +
    `\x1b[0m\n`,
    `\x1b[1m\x1b[32m🚀 Checkit is up and running at http://localhost:${port} \x1b[0m\n\n`,
    `\x1b[2m\x1b[36m🔍 For documentation and support, visit: ` +
    `https://jetestemonsite.apdp.mc \n`,
    `💼 Professional website compliance checking tool by APDP.\x1b[0m`
  );
};

// Create server
app.listen(port, () => {
  printMessage();
});

