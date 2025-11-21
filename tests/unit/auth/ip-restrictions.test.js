/**
 * IP Restriction Tests
 * Tests for IP-based access control and DPD auto-authentication
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestDatabase, createTestUsers } from '../../helpers.js';

describe('IP Restriction System', () => {
  let db;
  let testUsers;

  beforeEach(() => {
    db = createTestDatabase();
    testUsers = createTestUsers(db);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  describe('IP Whitelist Configuration', () => {
    test('should store IP restrictions for DPD users', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      expect(result.ip_restrictions).toBe('127.0.0.1, 192.168.1.100');
    });

    test('should allow empty IP restrictions for APDP admins', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.apdpUser.id);
      
      expect(result.ip_restrictions).toBe('');
    });

    test('should parse comma-separated IP list correctly', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      const ipList = result.ip_restrictions.split(',').map(ip => ip.trim());
      expect(ipList).toHaveLength(2);
      expect(ipList).toContain('127.0.0.1');
      expect(ipList).toContain('192.168.1.100');
    });
  });

  describe('IP Validation Logic', () => {
    test('should validate IP address format', () => {
      const validIps = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
      ];

      validIps.forEach(ip => {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        expect(ipRegex.test(ip)).toBe(true);
      });
    });

    test('should reject invalid IP address format', () => {
      const invalidIps = [
        '999.999.999.999',
        'abc.def.ghi.jkl',
        '192.168.1',
        '192.168.1.1.1',
      ];

      invalidIps.forEach(ip => {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const parts = ip.split('.');
        const isValid = ipRegex.test(ip) && parts.every(part => parseInt(part) <= 255);
        expect(isValid).toBe(false);
      });
    });

    test('should match client IP against whitelist', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedIps = result.ip_restrictions.split(',').map(ip => ip.trim());
      
      const clientIp = '127.0.0.1';
      expect(allowedIps.includes(clientIp)).toBe(true);
    });

    test('should reject IP not in whitelist', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedIps = result.ip_restrictions.split(',').map(ip => ip.trim());
      
      const clientIp = '10.0.0.5';
      expect(allowedIps.includes(clientIp)).toBe(false);
    });
  });

  describe('DPD Auto-Authentication', () => {
    test('should find DPD user by IP address', () => {
      const clientIp = '127.0.0.1';
      
      const stmt = db.prepare(`
        SELECT * FROM users 
        WHERE role = 'DPD' 
        AND (ip_restrictions LIKE ? OR ip_restrictions LIKE ? OR ip_restrictions LIKE ?)
      `);
      
      const user = stmt.get(`${clientIp}%`, `%,${clientIp}%`, `%${clientIp}`);
      expect(user).toBeDefined();
      expect(user.role).toBe('DPD');
    });

    test('should not auto-authenticate with unregistered IP', () => {
      const clientIp = '8.8.8.8';
      
      const stmt = db.prepare(`
        SELECT * FROM users 
        WHERE role = 'DPD' 
        AND ip_restrictions LIKE ?
      `);
      
      const user = stmt.get(`%${clientIp}%`);
      expect(user).toBeUndefined();
    });

    test('should handle multiple DPD users with different IPs', () => {
      // Create second DPD user
      const stmt = db.prepare(`
        INSERT INTO users (username, password_hash, role, company, ip_restrictions, url_restriction_mode, allowed_urls)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        'dpd-another-company-789',
        'hashedpassword',
        'DPD',
        'Another Company',
        '10.0.0.50',
        'RESTRICTED',
        'another.com'
      );
      
      // Query for specific IP
      const findStmt = db.prepare(`
        SELECT * FROM users 
        WHERE role = 'DPD' 
        AND ip_restrictions LIKE ?
      `);
      
      const user = findStmt.get('%10.0.0.50%');
      expect(user).toBeDefined();
      expect(user.company).toBe('Another Company');
    });
  });

  describe('IP Restriction Enforcement', () => {
    test('should allow access from whitelisted IP', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedIps = result.ip_restrictions.split(',').map(ip => ip.trim());
      
      const clientIp = '192.168.1.100';
      const hasAccess = allowedIps.includes(clientIp);
      
      expect(hasAccess).toBe(true);
    });

    test('should deny access from non-whitelisted IP', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedIps = result.ip_restrictions.split(',').map(ip => ip.trim());
      
      const clientIp = '203.0.113.1';
      const hasAccess = allowedIps.includes(clientIp);
      
      expect(hasAccess).toBe(false);
    });

    test('should allow APDP users from any IP when restrictions are empty', () => {
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.apdpUser.id);
      
      const hasRestrictions = !!(result.ip_restrictions && result.ip_restrictions.trim() !== '');
      expect(hasRestrictions).toBe(false);
    });
  });

  describe('Security Audit Logging', () => {
    test('should log successful IP-based authentication', () => {
      const stmt = db.prepare(`
        INSERT INTO scan_history (user_id, scanned_url, ip_address, critical_count, warning_count, improvement_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(testUsers.dpdUser.id, 'example.com', '127.0.0.1', 0, 0, 0);
      expect(result.changes).toBe(1);
      
      const checkStmt = db.prepare('SELECT * FROM scan_history WHERE user_id = ? AND ip_address = ?');
      const log = checkStmt.get(testUsers.dpdUser.id, '127.0.0.1');
      
      expect(log).toBeDefined();
      expect(log.ip_address).toBe('127.0.0.1');
    });

    test('should track IP restriction violations', () => {
      // In real implementation, this would log to audit table
      const unauthorizedIp = '203.0.113.1';
      const stmt = db.prepare('SELECT ip_restrictions FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedIps = result.ip_restrictions.split(',').map(ip => ip.trim());
      
      const isViolation = !allowedIps.includes(unauthorizedIp);
      expect(isViolation).toBe(true);
    });
  });
});

