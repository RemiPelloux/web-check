/**
 * Wiki Routes
 * Handles Wiki CMS content management for sections and plugin documentation
 */
import express from 'express';
import {
  authMiddleware,
  adminOnlyMiddleware,
  getClientIp
} from '../middleware/auth.js';
import {
  getWikiSections,
  getVisibleWikiSections,
  getWikiSectionById,
  upsertWikiSection,
  updateWikiSection,
  deleteWikiSection,
  getWikiPluginDocs,
  getVisibleWikiPluginDocs,
  getWikiPluginDocById,
  upsertWikiPluginDoc,
  updateWikiPluginDoc,
  isWikiSeeded,
  getDisabledPlugins,
  addAuditLog
} from '../../database/db.js';

const router = express.Router();

// ==================== Wiki Sections ====================

/**
 * GET /api/wiki/sections
 * Get all wiki sections (admin sees all, DPD sees visible only)
 */
router.get('/sections', authMiddleware, (req, res) => {
  try {
    const isAdmin = req.user?.role === 'APDP';
    const sections = isAdmin ? getWikiSections() : getVisibleWikiSections();
    
    return res.json({
      success: true,
      sections: sections.map(s => ({ ...s, is_visible: Boolean(s.is_visible) }))
    });
  } catch (error) {
    console.error('Get wiki sections error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les sections wiki'
    });
  }
});

/**
 * GET /api/wiki/sections/:id
 * Get single wiki section
 */
router.get('/sections/:id', authMiddleware, (req, res) => {
  try {
    const section = getWikiSectionById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section introuvable',
        message: 'Section wiki non trouvée'
      });
    }
    
    return res.json({
      success: true,
      section: { ...section, is_visible: Boolean(section.is_visible) }
    });
  } catch (error) {
    console.error('Get wiki section error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la section wiki'
    });
  }
});

/**
 * GET /api/wiki/plugins
 * Get all plugin documentation (filtered by disabled plugins AND visibility for DPD users)
 */
router.get('/plugins', authMiddleware, (req, res) => {
  try {
    const isAdmin = req.user?.role === 'APDP';
    // Admin sees all plugins, DPD sees only visible ones
    let pluginDocs = isAdmin ? getWikiPluginDocs() : getVisibleWikiPluginDocs();
    
    // Also filter out disabled plugins for DPD
    if (!isAdmin) {
      const disabledPlugins = getDisabledPlugins();
      pluginDocs = pluginDocs.filter(doc => !disabledPlugins.includes(doc.plugin_id));
    }
    
    return res.json({ 
      success: true, 
      plugins: pluginDocs.map(p => ({ ...p, is_visible: p.is_visible !== false }))
    });
  } catch (error) {
    console.error('Get wiki plugins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la documentation des plugins'
    });
  }
});

/**
 * GET /api/wiki/plugins/:id
 * Get single plugin documentation
 */
router.get('/plugins/:id', authMiddleware, (req, res) => {
  try {
    const pluginDoc = getWikiPluginDocById(req.params.id);
    
    if (!pluginDoc) {
      return res.status(404).json({
        success: false,
        error: 'Plugin introuvable',
        message: 'Documentation du plugin non trouvée'
      });
    }
    
    return res.json({ success: true, plugin: pluginDoc });
  } catch (error) {
    console.error('Get wiki plugin error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la documentation du plugin'
    });
  }
});

/**
 * GET /api/wiki/content
 * Get full wiki content (public endpoint for wiki page, respects plugin filtering and visibility)
 */
router.get('/content', authMiddleware, (req, res) => {
  try {
    const isAdmin = req.user?.role === 'APDP';
    const sections = isAdmin ? getWikiSections() : getVisibleWikiSections();
    // Admin sees all plugins, DPD sees only visible ones
    let pluginDocs = isAdmin ? getWikiPluginDocs() : getVisibleWikiPluginDocs();
    
    // Also filter out disabled plugins for DPD
    if (!isAdmin) {
      const disabledPlugins = getDisabledPlugins();
      pluginDocs = pluginDocs.filter(doc => !disabledPlugins.includes(doc.plugin_id));
    }
    
    return res.json({
      success: true,
      sections: sections.map(s => ({ ...s, is_visible: Boolean(s.is_visible) })),
      plugins: pluginDocs.map(p => ({ ...p, is_visible: p.is_visible !== false })),
      isSeeded: isWikiSeeded()
    });
  } catch (error) {
    console.error('Get wiki content error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le contenu wiki'
    });
  }
});

// ==================== Admin Wiki Routes ====================

/**
 * PUT /api/admin/wiki/sections/:id
 * Update wiki section (APDP only)
 */
router.put('/admin/sections/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { title, content, order_index, is_visible } = req.body;
    
    const success = updateWikiSection(req.params.id, { title, content, order_index, is_visible });
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Section introuvable',
        message: 'Section wiki non trouvée'
      });
    }
    
    addAuditLog(req.user.id, 'UPDATE_WIKI_SECTION', `Updated wiki section: ${req.params.id}`, getClientIp(req));
    return res.json({ success: true, message: 'Section wiki mise à jour avec succès' });
  } catch (error) {
    console.error('Update wiki section error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la section wiki'
    });
  }
});

/**
 * POST /api/admin/wiki/sections
 * Create new wiki section (APDP only)
 */
router.post('/admin/sections', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { id, title, content, order_index, is_visible } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        message: 'ID et titre requis'
      });
    }
    
    upsertWikiSection({
      id, title,
      content: content || '',
      order_index: order_index || 0,
      is_visible: is_visible !== false
    });
    
    addAuditLog(req.user.id, 'CREATE_WIKI_SECTION', `Created wiki section: ${id}`, getClientIp(req));
    return res.json({ success: true, message: 'Section wiki créée avec succès' });
  } catch (error) {
    console.error('Create wiki section error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de créer la section wiki'
    });
  }
});

/**
 * DELETE /api/admin/wiki/sections/:id
 * Delete wiki section (APDP only)
 */
router.delete('/admin/sections/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const success = deleteWikiSection(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Section introuvable',
        message: 'Section wiki non trouvée'
      });
    }
    
    addAuditLog(req.user.id, 'DELETE_WIKI_SECTION', `Deleted wiki section: ${req.params.id}`, getClientIp(req));
    return res.json({ success: true, message: 'Section wiki supprimée avec succès' });
  } catch (error) {
    console.error('Delete wiki section error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de supprimer la section wiki'
    });
  }
});

/**
 * PUT /api/admin/wiki/plugins/:id
 * Update plugin documentation (APDP only)
 */
router.put('/admin/plugins/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
  try {
    const { title, description, use_case, resources, screenshot_url, is_visible } = req.body;
    
    const success = updateWikiPluginDoc(req.params.id, {
      title, description, use_case, resources, screenshot_url, is_visible
    });
    
    if (!success) {
      const created = upsertWikiPluginDoc({
        plugin_id: req.params.id,
        title: title || req.params.id,
        description: description || '',
        use_case: use_case || '',
        resources: resources || [],
        screenshot_url: screenshot_url || '',
        is_visible: is_visible !== false
      });
      
      if (!created) {
        return res.status(500).json({
          success: false,
          error: 'Erreur création',
          message: 'Impossible de créer la documentation du plugin'
        });
      }
    }
    
    addAuditLog(req.user.id, 'UPDATE_WIKI_PLUGIN', `Updated plugin doc: ${req.params.id}`, getClientIp(req));
    return res.json({ success: true, message: 'Documentation du plugin mise à jour avec succès' });
  } catch (error) {
    console.error('Update wiki plugin error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la documentation du plugin'
    });
  }
});

/**
 * POST /api/admin/wiki/seed
 * Seed wiki content from defaults (APDP only)
 */
router.post('/admin/seed', authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const { force } = req.body;
    const { seedWikiContent } = await import('../../database/seed-wiki.js');
    const success = seedWikiContent(force);
    
    addAuditLog(req.user.id, 'SEED_WIKI', `Seeded wiki content${force ? ' (forced)' : ''}`, getClientIp(req));
    return res.json({
      success: true,
      message: success ? 'Contenu wiki initialisé avec succès' : 'Le contenu wiki existe déjà'
    });
  } catch (error) {
    console.error('Seed wiki error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Impossible d\'initialiser le contenu wiki'
    });
  }
});

export default router;

