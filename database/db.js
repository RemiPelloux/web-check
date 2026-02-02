import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'checkit.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with schema
const initDatabase = () => {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('✅ Database initialized successfully');
};

// User Management Functions

/**
 * Create a new user
 * @param {string} username - Username
 * @param {string} password - Plain text password (will be hashed)
 * @param {string} role - User role (APDP or DPD)
 * @param {string} ipRestrictions - Comma-separated IP addresses
 * @param {string} urlRestrictionMode - 'ALL' or 'RESTRICTED'
 * @param {string} allowedUrls - Comma-separated URLs (only used when urlRestrictionMode = 'RESTRICTED')
 * @returns {object} Created user (without password)
 */
export const createUser = (username, password, role = 'DPD', ipRestrictions = '', urlRestrictionMode = 'ALL', allowedUrls = '', company = '') => {
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, role, ip_restrictions, url_restriction_mode, allowed_urls, company)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(username, passwordHash, role, ipRestrictions, urlRestrictionMode, allowedUrls, company);
  
  return {
    id: result.lastInsertRowid,
    username,
    role,
    ipRestrictions,
    urlRestrictionMode,
    allowedUrls,
    company,
    createdAt: new Date().toISOString()
  };
};

/**
 * Find user by username
 * @param {string} username
 * @returns {object|null} User object or null
 */
export const findUser = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
};

/**
 * Find user by ID
 * @param {number} id
 * @returns {object|null} User object or null
 */
export const findUserById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
};

/**
 * Verify user password
 * @param {string} username
 * @param {string} password
 * @returns {object|null} User object (without password) or null
 */
export const verifyUser = (username, password) => {
  const user = findUser(username);
  if (!user) return null;
  
  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) return null;
  
  // Return user without password
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get all users
 * @returns {Array} List of users (without passwords)
 */
export const getAllUsers = () => {
  const stmt = db.prepare('SELECT id, username, role, company, ip_restrictions, url_restriction_mode, allowed_urls, created_at, updated_at, is_test_account FROM users');
  return stmt.all();
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {object} updates - Fields to update
 * @returns {boolean} Success status
 */
export const updateUser = (id, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.password !== undefined) {
    fields.push('password_hash = ?');
    values.push(bcrypt.hashSync(updates.password, 10));
  }
  if (updates.role !== undefined) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.ipRestrictions !== undefined) {
    fields.push('ip_restrictions = ?');
    values.push(updates.ipRestrictions);
  }
  if (updates.urlRestrictionMode !== undefined) {
    fields.push('url_restriction_mode = ?');
    values.push(updates.urlRestrictionMode);
  }
  if (updates.allowedUrls !== undefined) {
    fields.push('allowed_urls = ?');
    values.push(updates.allowedUrls);
  }
  if (updates.company !== undefined) {
    fields.push('company = ?');
    values.push(updates.company);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = stmt.run(...values);
  return result.changes > 0;
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {boolean} Success status
 */
export const deleteUser = (id) => {
  // Use transaction to delete user and all related records
  const deleteTransaction = db.transaction(() => {
    // First, delete related records that have foreign key constraints
    db.prepare('DELETE FROM audit_log WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM scan_history WHERE user_id = ?').run(id);
    
    // Then delete the user
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  });
  
  return deleteTransaction();
};

// Plugin Management Functions

/**
 * Get all disabled plugins
 * @returns {Array} List of disabled plugin names
 */
export const getDisabledPlugins = () => {
  const stmt = db.prepare('SELECT plugin_name FROM disabled_plugins');
  const rows = stmt.all();
  return rows.map(row => row.plugin_name);
};

/**
 * Set disabled plugins (replaces existing list)
 * @param {Array} pluginNames - Array of plugin names to disable
 * @returns {boolean} Success status
 */
export const setDisabledPlugins = (pluginNames) => {
  const deleteStmt = db.prepare('DELETE FROM disabled_plugins');
  deleteStmt.run();
  
  if (pluginNames.length === 0) return true;
  
  const insertStmt = db.prepare('INSERT INTO disabled_plugins (plugin_name) VALUES (?)');
  
  const transaction = db.transaction((names) => {
    for (const name of names) {
      insertStmt.run(name);
    }
  });
  
  transaction(pluginNames);
  return true;
};

// Audit Log Functions

/**
 * Add audit log entry
 * @param {number} userId - User ID
 * @param {string} action - Action description
 * @param {string} details - Additional details
 * @param {string} ipAddress - IP address
 */
export const addAuditLog = (userId, action, details = '', ipAddress = '') => {
  const stmt = db.prepare(`
    INSERT INTO audit_log (user_id, action, details, ip_address)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, action, details, ipAddress);
};

/**
 * Get audit logs
 * @param {number} limit - Number of logs to retrieve
 * @returns {Array} List of audit log entries
 */
export const getAuditLogs = (limit = 100) => {
  const stmt = db.prepare(`
    SELECT a.*, u.username, u.role as user_role
    FROM audit_log a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC
    LIMIT ?
  `);
  return stmt.all(limit);
};

/**
 * Clean all audit logs
 * @returns {number} Number of deleted logs
 */
export const cleanAuditLogs = () => {
  const stmt = db.prepare('DELETE FROM audit_log');
  const result = stmt.run();
  return result.changes;
};

// Login Attempts Functions

/**
 * Record login attempt
 * @param {string} username
 * @param {string} ipAddress
 * @param {boolean} success
 */
export const recordLoginAttempt = (username, ipAddress, success) => {
  const stmt = db.prepare(`
    INSERT INTO login_attempts (username, ip_address, success)
    VALUES (?, ?, ?)
  `);
  stmt.run(username, ipAddress, success ? 1 : 0);
};

/**
 * Get recent failed login attempts
 * @param {string} username
 * @param {number} minutes - Time window in minutes
 * @returns {number} Count of failed attempts
 */
export const getFailedLoginAttempts = (username, minutes = 15) => {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM login_attempts
    WHERE username = ?
    AND success = 0
    AND timestamp > datetime('now', '-' || ? || ' minutes')
  `);
  const result = stmt.get(username, minutes);
  return result.count;
};

/**
 * Clear old login attempts
 * @param {number} days - Remove attempts older than this many days
 */
export const clearOldLoginAttempts = (days = 7) => {
  const stmt = db.prepare(`
    DELETE FROM login_attempts
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `);
  stmt.run(days);
};

// Scan History Functions

/**
 * Record a scan in history
 * @param {number} userId - User ID
 * @param {string} scannedUrl - URL that was scanned
 * @param {string} ipAddress - IP address of user
 * @param {object} resultsSummary - Scan results summary object
 * @returns {number} Insert ID
 */
export const recordScan = (userId, scannedUrl, ipAddress, resultsSummary) => {
  const stmt = db.prepare(`
    INSERT INTO scan_history (user_id, scanned_url, ip_address, scan_results_summary, critical_count, warning_count, improvement_count, numeric_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    userId,
    scannedUrl,
    ipAddress,
    JSON.stringify(resultsSummary),
    resultsSummary.criticalCount || 0,
    resultsSummary.warningCount || 0,
    resultsSummary.improvementCount || 0,
    resultsSummary.numericScore || 0
  );
  
  return result.lastInsertRowid;
};

/**
 * Get scan history with filters
 * @param {object} filters - Filter options
 * @returns {Array} List of scan history entries
 */
export const getScanHistory = (filters = {}) => {
  let query = `
    SELECT h.*, u.username, u.company, u.role
    FROM scan_history h
    JOIN users u ON h.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (filters.userId) {
    query += ' AND h.user_id = ?';
    params.push(filters.userId);
  }
  
  if (filters.startDate) {
    query += ' AND h.timestamp >= ?';
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    query += ' AND h.timestamp <= ?';
    params.push(filters.endDate);
  }
  
  if (filters.role) {
    query += ' AND u.role = ?';
    params.push(filters.role);
  }
  
  query += ' ORDER BY h.timestamp DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const stmt = db.prepare(query);
  return stmt.all(...params);
};

/**
 * Update scan statistics (aggregate anonymous data)
 * @param {string} userRole - User role (APDP or DPD)
 * @param {number} criticalCount - Critical issues found
 * @param {number} warningCount - Warnings found
 * @param {number} improvementCount - Improvements found
 */
export const updateScanStatistics = (userRole, criticalCount, warningCount, improvementCount) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const stmt = db.prepare(`
    INSERT INTO scan_statistics (date, user_role, total_scans, total_critical, total_warnings, total_improvements)
    VALUES (?, ?, 1, ?, ?, ?)
    ON CONFLICT(date, user_role) DO UPDATE SET
      total_scans = total_scans + 1,
      total_critical = total_critical + ?,
      total_warnings = total_warnings + ?,
      total_improvements = total_improvements + ?
  `);
  
  stmt.run(today, userRole, criticalCount, warningCount, improvementCount, criticalCount, warningCount, improvementCount);
};

/**
 * Get anonymous aggregate statistics
 * @param {object} options - Query options
 * @returns {object} Aggregate statistics
 */
export const getAggregateStatistics = (options = {}) => {
  const { startDate, endDate, days = 30 } = options;
  
  // Get total counts
  const totalStmt = db.prepare(`
    SELECT 
      SUM(total_scans) as totalScans,
      SUM(total_critical) as totalCritical,
      SUM(total_warnings) as totalWarnings,
      SUM(total_improvements) as totalImprovements
    FROM scan_statistics
    WHERE date >= date('now', '-' || ? || ' days')
  `);
  const totals = totalStmt.get(days);
  
  // Get user counts
  const userCountStmt = db.prepare(`
    SELECT role, COUNT(*) as count
    FROM users
    GROUP BY role
  `);
  const userCounts = userCountStmt.all();
  
  // Get scans by role
  const roleStmt = db.prepare(`
    SELECT user_role, SUM(total_scans) as scans
    FROM scan_statistics
    WHERE date >= date('now', '-' || ? || ' days')
    GROUP BY user_role
  `);
  const scansByRole = roleStmt.all(days);
  
  // Get daily scan counts for charts
  const dailyStmt = db.prepare(`
    SELECT date, user_role, total_scans, total_critical, total_warnings
    FROM scan_statistics
    WHERE date >= date('now', '-' || ? || ' days')
    ORDER BY date DESC
  `);
  const dailyStats = dailyStmt.all(days);
  
  return {
    totals: {
      scans: totals.totalScans || 0,
      critical: totals.totalCritical || 0,
      warnings: totals.totalWarnings || 0,
      improvements: totals.totalImprovements || 0
    },
    userCounts: userCounts.reduce((acc, row) => {
      acc[row.role] = row.count;
      return acc;
    }, {}),
    scansByRole: scansByRole.reduce((acc, row) => {
      acc[row.user_role] = row.scans;
      return acc;
    }, {}),
    dailyStats,
    scansPerUser: userCounts.reduce((acc, row) => {
      const scans = scansByRole.find(s => s.user_role === row.role)?.scans || 0;
      acc[row.role] = row.count > 0 ? (scans / row.count).toFixed(2) : 0;
      return acc;
    }, {})
  };
};

/**
 * Reset all statistics (scan_statistics and scan_history tables)
 * @returns {object} Number of deleted records
 */
export const resetStatistics = () => {
  const statsResult = db.prepare('DELETE FROM scan_statistics').run();
  const historyResult = db.prepare('DELETE FROM scan_history').run();
  
  return {
    statsDeleted: statsResult.changes,
    historyDeleted: historyResult.changes
  };
};

/**
 * Check if a user is a test/certified account
 * Test accounts are excluded from statistics
 * @param {number} userId - User ID
 * @returns {boolean} True if test account
 */
export const isTestAccount = (userId) => {
  try {
    const stmt = db.prepare('SELECT is_test_account FROM users WHERE id = ?');
    const result = stmt.get(userId);
    return result?.is_test_account === 1;
  } catch (e) {
    // Column might not exist yet (pre-migration)
    return false;
  }
};

/**
 * Find DPD user by IP address
 * @param {string} ipAddress - Client IP address
 * @returns {object|null} User object or null
 */
export const findDPDUserByIP = (ipAddress) => {
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE role = 'DPD' 
    AND ip_restrictions != '' 
    AND ip_restrictions IS NOT NULL
  `);
  
  const dpdUsers = stmt.all();
  
  for (const user of dpdUsers) {
    const allowedIps = user.ip_restrictions.split(',').map(ip => ip.trim());
    if (allowedIps.includes(ipAddress)) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  
  return null;
};

// ============================================
// Wiki Sections Functions
// ============================================

/**
 * Get all wiki sections
 * @returns {Array} List of wiki sections ordered by order_index
 */
export const getWikiSections = () => {
  const stmt = db.prepare('SELECT * FROM wiki_sections ORDER BY order_index ASC');
  return stmt.all();
};

/**
 * Get visible wiki sections only
 * @returns {Array} List of visible wiki sections
 */
export const getVisibleWikiSections = () => {
  const stmt = db.prepare('SELECT * FROM wiki_sections WHERE is_visible = 1 ORDER BY order_index ASC');
  return stmt.all();
};

/**
 * Get wiki section by ID
 * @param {string} id - Section ID
 * @returns {object|null} Section object or null
 */
export const getWikiSectionById = (id) => {
  const stmt = db.prepare('SELECT * FROM wiki_sections WHERE id = ?');
  return stmt.get(id);
};

/**
 * Create or update wiki section
 * @param {object} section - Section data
 * @returns {boolean} Success status
 */
export const upsertWikiSection = (section) => {
  const stmt = db.prepare(`
    INSERT INTO wiki_sections (id, title, content, order_index, is_visible, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      order_index = excluded.order_index,
      is_visible = excluded.is_visible,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  const result = stmt.run(
    section.id,
    section.title,
    section.content || '',
    section.order_index || 0,
    section.is_visible !== undefined ? (section.is_visible ? 1 : 0) : 1
  );
  
  return result.changes > 0;
};

/**
 * Update wiki section
 * @param {string} id - Section ID
 * @param {object} updates - Fields to update
 * @returns {boolean} Success status
 */
export const updateWikiSection = (id, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(updates.order_index);
  }
  if (updates.is_visible !== undefined) {
    fields.push('is_visible = ?');
    values.push(updates.is_visible ? 1 : 0);
  }
  
  if (fields.length === 0) return false;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE wiki_sections SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
};

/**
 * Delete wiki section
 * @param {string} id - Section ID
 * @returns {boolean} Success status
 */
export const deleteWikiSection = (id) => {
  const stmt = db.prepare('DELETE FROM wiki_sections WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

// ============================================
// Wiki Plugin Docs Functions
// ============================================

/**
 * Get all plugin docs
 * @returns {Array} List of plugin documentation
 */
export const getWikiPluginDocs = () => {
  const stmt = db.prepare('SELECT * FROM wiki_plugin_docs ORDER BY plugin_id ASC');
  const rows = stmt.all();
  return rows.map(row => ({
    ...row,
    resources: JSON.parse(row.resources || '[]'),
    is_visible: row.is_visible !== undefined ? Boolean(row.is_visible) : true
  }));
};

/**
 * Get visible plugin docs only
 * @returns {Array} List of visible plugin documentation
 */
export const getVisibleWikiPluginDocs = () => {
  const stmt = db.prepare('SELECT * FROM wiki_plugin_docs WHERE is_visible = 1 ORDER BY plugin_id ASC');
  const rows = stmt.all();
  return rows.map(row => ({
    ...row,
    resources: JSON.parse(row.resources || '[]'),
    is_visible: true
  }));
};

/**
 * Get plugin doc by ID
 * @param {string} pluginId - Plugin ID
 * @returns {object|null} Plugin doc or null
 */
export const getWikiPluginDocById = (pluginId) => {
  const stmt = db.prepare('SELECT * FROM wiki_plugin_docs WHERE plugin_id = ?');
  const row = stmt.get(pluginId);
  if (!row) return null;
  return {
    ...row,
    resources: JSON.parse(row.resources || '[]')
  };
};

/**
 * Create or update plugin doc
 * @param {object} doc - Plugin doc data
 * @returns {boolean} Success status
 */
export const upsertWikiPluginDoc = (doc) => {
  const stmt = db.prepare(`
    INSERT INTO wiki_plugin_docs (plugin_id, title, description, use_case, resources, screenshot_url, is_visible, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(plugin_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      use_case = excluded.use_case,
      resources = excluded.resources,
      screenshot_url = excluded.screenshot_url,
      is_visible = excluded.is_visible,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  const resources = typeof doc.resources === 'string' 
    ? doc.resources 
    : JSON.stringify(doc.resources || []);
  
  const result = stmt.run(
    doc.plugin_id,
    doc.title,
    doc.description || '',
    doc.use_case || '',
    resources,
    doc.screenshot_url || '',
    doc.is_visible !== undefined ? (doc.is_visible ? 1 : 0) : 1
  );
  
  return result.changes > 0;
};

/**
 * Update plugin doc
 * @param {string} pluginId - Plugin ID
 * @param {object} updates - Fields to update
 * @returns {boolean} Success status
 */
export const updateWikiPluginDoc = (pluginId, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.use_case !== undefined) {
    fields.push('use_case = ?');
    values.push(updates.use_case);
  }
  if (updates.resources !== undefined) {
    fields.push('resources = ?');
    const resources = typeof updates.resources === 'string'
      ? updates.resources
      : JSON.stringify(updates.resources);
    values.push(resources);
  }
  if (updates.screenshot_url !== undefined) {
    fields.push('screenshot_url = ?');
    values.push(updates.screenshot_url);
  }
  if (updates.is_visible !== undefined) {
    fields.push('is_visible = ?');
    values.push(updates.is_visible ? 1 : 0);
  }
  
  if (fields.length === 0) return false;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(pluginId);
  
  const stmt = db.prepare(`UPDATE wiki_plugin_docs SET ${fields.join(', ')} WHERE plugin_id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
};

/**
 * Check if wiki has been seeded
 * @returns {boolean} True if wiki content exists
 */
export const isWikiSeeded = () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM wiki_plugin_docs');
  const result = stmt.get();
  return result.count > 0;
};

// Export database instance for direct queries if needed
export { db, initDatabase };

export default {
  createUser,
  findUser,
  findUserById,
  verifyUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getDisabledPlugins,
  setDisabledPlugins,
  addAuditLog,
  getAuditLogs,
  cleanAuditLogs,
  recordLoginAttempt,
  getFailedLoginAttempts,
  clearOldLoginAttempts,
  recordScan,
  getScanHistory,
  updateScanStatistics,
  getAggregateStatistics,
  resetStatistics,
  isTestAccount,
  findDPDUserByIP,
  // Wiki functions
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
  initDatabase,
  db
};

