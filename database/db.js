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
export const createUser = (username, password, role = 'DPD', ipRestrictions = '', urlRestrictionMode = 'ALL', allowedUrls = '') => {
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, role, ip_restrictions, url_restriction_mode, allowed_urls)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(username, passwordHash, role, ipRestrictions, urlRestrictionMode, allowedUrls);
  
  return {
    id: result.lastInsertRowid,
    username,
    role,
    ipRestrictions,
    urlRestrictionMode,
    allowedUrls,
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
  const stmt = db.prepare('SELECT id, username, role, ip_restrictions, url_restriction_mode, allowed_urls, created_at, updated_at FROM users');
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
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
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
    SELECT a.*, u.username 
    FROM audit_log a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC
    LIMIT ?
  `);
  return stmt.all(limit);
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
  recordLoginAttempt,
  getFailedLoginAttempts,
  clearOldLoginAttempts,
  initDatabase,
  db
};

