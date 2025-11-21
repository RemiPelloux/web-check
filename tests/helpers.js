import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a test database in memory
 */
export const createTestDatabase = () => {
  const db = new Database(':memory:');
  
  // Create schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('APDP', 'DPD')),
      company TEXT,
      ip_restrictions TEXT,
      url_restriction_mode TEXT DEFAULT 'ALL' CHECK(url_restriction_mode IN ('ALL', 'RESTRICTED')),
      allowed_urls TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_scans INTEGER DEFAULT 0,
      critical_issues_count INTEGER DEFAULT 0,
      warning_issues_count INTEGER DEFAULT 0,
      dpd_users_count INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scanned_url TEXT NOT NULL,
      ip_address TEXT,
      critical_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      improvement_count INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE INDEX IF NOT EXISTS idx_scan_statistics_timestamp ON scan_statistics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp);
  `);

  return db;
};

/**
 * Create test users
 */
export const createTestUsers = (db) => {
  const passwordHash = bcrypt.hashSync('password123', 10);
  
  // APDP Admin
  const apdpStmt = db.prepare(`
    INSERT INTO users (username, password_hash, role, ip_restrictions, url_restriction_mode, allowed_urls)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const apdpResult = apdpStmt.run('admin@apdp.mc', passwordHash, 'APDP', '', 'ALL', '');
  
  // DPD User with IP restrictions
  const dpdStmt = db.prepare(`
    INSERT INTO users (username, password_hash, role, company, ip_restrictions, url_restriction_mode, allowed_urls)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const dpdResult = dpdStmt.run(
    'dpd-test-company-123456',
    passwordHash,
    'DPD',
    'Test Company',
    '127.0.0.1, 192.168.1.100',
    'RESTRICTED',
    'example.com, test.com'
  );
  
  return {
    apdpUser: {
      id: apdpResult.lastInsertRowid,
      username: 'admin@apdp.mc',
      role: 'APDP',
    },
    dpdUser: {
      id: dpdResult.lastInsertRowid,
      username: 'dpd-test-company-123456',
      role: 'DPD',
      company: 'Test Company',
      ip_restrictions: '127.0.0.1, 192.168.1.100',
      allowed_urls: 'example.com, test.com',
    },
  };
};

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '8h' }
  );
};

/**
 * Mock IP address in request
 */
export const mockIpAddress = (req, ip) => {
  req.headers['x-forwarded-for'] = ip;
  req.connection = { remoteAddress: ip };
  req.socket = { remoteAddress: ip };
  return req;
};

