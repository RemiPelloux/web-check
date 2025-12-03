/**
 * Admin Routes
 * Handles user management, plugin configuration, statistics, and audit logs
 * All routes require APDP admin role
 */
import express from 'express';
import {
  authMiddleware,
  adminOnlyMiddleware,
  getClientIp
} from '../middleware/auth.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getDisabledPlugins,
  setDisabledPlugins,
  addAuditLog,
  getAuditLogs,
  cleanAuditLogs,
  getScanHistory,
  resetStatistics,
  db
} from '../../database/db.js';

const router = express.Router();

// Active plugins list - matches the jobNames in ProgressBar.tsx
const ACTIVE_PLUGINS = [
  'rgpd-compliance', 'vulnerabilities', 'cdn-resources', 'get-ip', 'location',
  'ssl', 'tls', 'domain', 'quality', 'tech-stack', 'secrets', 'link-audit',
  'server-info', 'cookies', 'headers', 'dns', 'subdomain-enumeration', 'hosts',
  'http-security', 'social-tags', 'trace-route', 'security-txt', 'dns-server',
  'firewall', 'dnssec', 'hsts', 'threats', 'mail-config', 'archives', 'rank',
  'tls-cipher-suites', 'tls-security-config', 'tls-client-support', 'redirects',
  'linked-pages', 'robots-txt', 'status', 'ports', 'txt-records', 'block-lists',
  'sitemap', 'carbon', 'apdp-cookie-banner', 'apdp-privacy-policy',
  'apdp-legal-notices', 'exposed-files', 'subdomain-takeover', 'lighthouse'
];

// ==================== User Management ====================

/**
 * GET /api/admin/users
 * Get all users (APDP only)
 */
router.get('/users', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const users = getAllUsers();
    return res.json({ success: true, users });
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
router.post('/users', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { username, password, role, ipRestrictions, urlRestrictionMode, allowedUrls, company } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Données requises',
        message: 'Nom d\'utilisateur requis'
      });
    }
    
    const finalPassword = password || Math.random().toString(36).slice(-12);
    
    const newUser = createUser(
      username, finalPassword, role || 'DPD', 
      ipRestrictions || '', urlRestrictionMode || 'RESTRICTED',
      allowedUrls || '', company || ''
    );
    
    addAuditLog(req.user.id, 'CREATE_USER', `Created user: ${username} (${role || 'DPD'})`, getClientIp(req));
    
    return res.json({ success: true, user: newUser, message: 'Utilisateur créé avec succès' });
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
router.put('/users/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
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
    return res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
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
router.delete('/users/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
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
    return res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'utilisateur'
    });
  }
});

// ==================== Plugin Management ====================

/**
 * GET /api/admin/plugins/available
 * Get list of all active plugins (APDP only)
 */
router.get('/plugins/available', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    return res.json({ success: true, plugins: ACTIVE_PLUGINS.sort() });
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
router.get('/plugins', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const disabledPlugins = getDisabledPlugins();
    return res.json({ success: true, disabledPlugins });
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
router.put('/plugins', authMiddleware, adminOnlyMiddleware, (req, res) => {
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
    
    return res.json({ success: true, message: 'Configuration des plugins mise à jour avec succès' });
  } catch (error) {
    console.error('Update plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la configuration des plugins'
    });
  }
});

// ==================== Statistics & Audit ====================

/**
 * GET /api/admin/statistics
 * Get anonymous aggregate statistics (APDP only)
 */
router.get('/statistics', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const range = req.query.range || '30days';
    
    let dateFilter = '';
    switch (range) {
      case '7days':
        dateFilter = "AND sh.timestamp >= datetime('now', '-7 days')";
        break;
      case '30days':
        dateFilter = "AND sh.timestamp >= datetime('now', '-30 days')";
        break;
      case 'all':
        dateFilter = '';
        break;
      default:
        dateFilter = "AND sh.timestamp >= datetime('now', '-30 days')";
    }
    
    // Exclude test accounts from statistics
    const scanCountStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM scan_history sh
      JOIN users u ON sh.user_id = u.id
      WHERE (u.is_test_account = 0 OR u.is_test_account IS NULL) ${dateFilter}
    `);
    const totalScans = scanCountStmt.get()?.total || 0;
    
    const uniqueUsersStmt = db.prepare(`
      SELECT COUNT(DISTINCT sh.user_id) as count 
      FROM scan_history sh
      JOIN users u ON sh.user_id = u.id
      WHERE (u.is_test_account = 0 OR u.is_test_account IS NULL) ${dateFilter}
    `);
    const uniqueUsers = uniqueUsersStmt.get()?.count || 0;
    
    // Only count non-test DPD accounts
    const allUsers = getAllUsers();
    const dpdUsers = allUsers.filter(user => user.role === 'DPD' && !user.is_test_account).length;
    
    return res.json({
      success: true,
      data: { totalScans, uniqueUsers, dpdUsers },
      range
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
 * DELETE /api/admin/statistics/reset
 * Reset all scan statistics (APDP only)
 */
router.delete('/statistics/reset', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const result = resetStatistics();
    addAuditLog(
      req.user.id,
      'RESET_STATISTICS',
      `Reset statistics: ${result.statsDeleted} stats, ${result.historyDeleted} history records deleted`,
      getClientIp(req)
    );
    return res.json({
      success: true,
      message: 'Statistiques réinitialisées avec succès',
      deleted: result
    });
  } catch (error) {
    console.error('Reset statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de réinitialiser les statistiques'
    });
  }
});

/**
 * GET /api/admin/audit-log
 * Get full audit log with filters (APDP only)
 */
router.get('/audit-log', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAuditLogs(limit);
    return res.json({ success: true, logs, count: logs.length });
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
router.delete('/audit-log/clean', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const deletedCount = cleanAuditLogs();
    addAuditLog(req.user.id, 'LOGS_CLEANED', `Suppression de ${deletedCount} logs`, getClientIp(req));
    return res.json({ success: true, message: `${deletedCount} logs supprimés avec succès`, deletedCount });
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
router.get('/scan-history', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const filters = {
      userId: req.query.userId ? parseInt(req.query.userId) : undefined,
      role: req.query.role,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 100
    };
    
    const history = getScanHistory(filters);
    return res.json({ success: true, history, count: history.length });
  } catch (error) {
    console.error('Get scan history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'historique des scans'
    });
  }
});

export default router;




