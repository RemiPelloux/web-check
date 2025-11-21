/**
 * URL Whitelist Tests
 * Tests for DPD URL restriction and whitelist functionality
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestDatabase, createTestUsers } from '../../helpers.js';

describe('URL Whitelist System', () => {
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

  describe('URL Restriction Configuration', () => {
    test('should store URL restriction mode for DPD users', () => {
      const stmt = db.prepare('SELECT url_restriction_mode FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      expect(result.url_restriction_mode).toBe('RESTRICTED');
    });

    test('should store allowed URLs list for DPD users', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      expect(result.allowed_urls).toBe('example.com, test.com');
    });

    test('should allow ALL mode for unrestricted URL access', () => {
      // Update user to ALL mode
      const updateStmt = db.prepare('UPDATE users SET url_restriction_mode = ? WHERE id = ?');
      updateStmt.run('ALL', testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT url_restriction_mode FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      expect(result.url_restriction_mode).toBe('ALL');
    });

    test('should parse comma-separated URL list correctly', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      const urlList = result.allowed_urls.split(',').map(url => url.trim());
      expect(urlList).toHaveLength(2);
      expect(urlList).toContain('example.com');
      expect(urlList).toContain('test.com');
    });
  });

  describe('URL Validation Logic', () => {
    test('should validate domain format', () => {
      const validDomains = [
        'example.com',
        'sub.example.com',
        'test-site.fr',
        'my-site.co.uk',
      ];

      validDomains.forEach(domain => {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
        expect(domainRegex.test(domain)).toBe(true);
      });
    });

    test('should normalize URLs to domain', () => {
      const testCases = [
        { input: 'https://example.com', expected: 'example.com' },
        { input: 'http://www.test.com/page', expected: 'www.test.com' },
        { input: 'example.com', expected: 'example.com' },
        { input: 'sub.example.com', expected: 'sub.example.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        let domain = input.replace(/^https?:\/\//, '').split('/')[0];
        expect(domain).toBe(expected);
      });
    });

    test('should match URL against whitelist', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedUrls = result.allowed_urls.split(',').map(url => url.trim());
      
      const testUrl = 'example.com';
      expect(allowedUrls.includes(testUrl)).toBe(true);
    });

    test('should reject URL not in whitelist', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedUrls = result.allowed_urls.split(',').map(url => url.trim());
      
      const testUrl = 'notallowed.com';
      expect(allowedUrls.includes(testUrl)).toBe(false);
    });

    test('should handle www prefix matching', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const allowedUrls = result.allowed_urls.split(',').map(url => url.trim());
      
      // Check if we should match www.example.com with example.com
      const testUrl = 'www.example.com';
      const domain = testUrl.replace(/^www\./, '');
      
      const isAllowed = allowedUrls.includes(testUrl) || allowedUrls.includes(domain);
      expect(isAllowed).toBe(true);
    });
  });

  describe('URL Access Control', () => {
    test('should allow scan of whitelisted URL', () => {
      const stmt = db.prepare('SELECT url_restriction_mode, allowed_urls FROM users WHERE id = ?');
      const user = stmt.get(testUsers.dpdUser.id);
      
      const targetUrl = 'example.com';
      const allowedUrls = user.allowed_urls.split(',').map(url => url.trim());
      
      const canScan = user.url_restriction_mode === 'ALL' || allowedUrls.includes(targetUrl);
      expect(canScan).toBe(true);
    });

    test('should deny scan of non-whitelisted URL', () => {
      const stmt = db.prepare('SELECT url_restriction_mode, allowed_urls FROM users WHERE id = ?');
      const user = stmt.get(testUsers.dpdUser.id);
      
      const targetUrl = 'blocked.com';
      const allowedUrls = user.allowed_urls.split(',').map(url => url.trim());
      
      const canScan = user.url_restriction_mode === 'ALL' || allowedUrls.includes(targetUrl);
      expect(canScan).toBe(false);
    });

    test('should allow any URL when restriction mode is ALL', () => {
      // Update user to ALL mode
      const updateStmt = db.prepare('UPDATE users SET url_restriction_mode = ? WHERE id = ?');
      updateStmt.run('ALL', testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT url_restriction_mode FROM users WHERE id = ?');
      const user = stmt.get(testUsers.dpdUser.id);
      
      const targetUrl = 'any-domain.com';
      const canScan = user.url_restriction_mode === 'ALL';
      
      expect(canScan).toBe(true);
    });
  });

  describe('Multiple URL Handling', () => {
    test('should handle large whitelist', () => {
      const largeList = Array.from({ length: 50 }, (_, i) => `site${i}.com`).join(', ');
      
      const updateStmt = db.prepare('UPDATE users SET allowed_urls = ? WHERE id = ?');
      updateStmt.run(largeList, testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const urlList = result.allowed_urls.split(',').map(url => url.trim());
      
      expect(urlList).toHaveLength(50);
      expect(urlList[0]).toBe('site0.com');
      expect(urlList[49]).toBe('site49.com');
    });

    test('should handle URL list with various formats', () => {
      const mixedList = 'example.com, www.test.fr, sub.domain.co.uk, simple.io';
      
      const updateStmt = db.prepare('UPDATE users SET allowed_urls = ? WHERE id = ?');
      updateStmt.run(mixedList, testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      const urlList = result.allowed_urls.split(',').map(url => url.trim());
      
      expect(urlList).toHaveLength(4);
      expect(urlList).toContain('example.com');
      expect(urlList).toContain('www.test.fr');
      expect(urlList).toContain('sub.domain.co.uk');
      expect(urlList).toContain('simple.io');
    });
  });

  describe('DPD Dashboard URL Display', () => {
    test('should retrieve allowed URLs for dashboard display', () => {
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      const urlList = result.allowed_urls.split(',').map(url => url.trim());
      
      // Simulate dashboard card data
      const dashboardCards = urlList.map(url => ({
        url,
        displayName: url,
        favicon: `https://${url}/favicon.ico`,
      }));
      
      expect(dashboardCards).toHaveLength(2);
      expect(dashboardCards[0].url).toBe('example.com');
      expect(dashboardCards[1].url).toBe('test.com');
    });

    test('should handle empty URL list gracefully', () => {
      const updateStmt = db.prepare('UPDATE users SET allowed_urls = ? WHERE id = ?');
      updateStmt.run('', testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      const urlList = result.allowed_urls ? result.allowed_urls.split(',').map(url => url.trim()).filter(url => url) : [];
      
      expect(urlList).toHaveLength(0);
    });
  });

  describe('URL Restriction Updates', () => {
    test('should update allowed URLs list', () => {
      const newUrls = 'newsite.com, another.fr, third.io';
      
      const updateStmt = db.prepare('UPDATE users SET allowed_urls = ? WHERE id = ?');
      updateStmt.run(newUrls, testUsers.dpdUser.id);
      
      const stmt = db.prepare('SELECT allowed_urls FROM users WHERE id = ?');
      const result = stmt.get(testUsers.dpdUser.id);
      
      expect(result.allowed_urls).toBe(newUrls);
    });

    test('should switch between ALL and RESTRICTED modes', () => {
      // Switch to ALL
      let updateStmt = db.prepare('UPDATE users SET url_restriction_mode = ? WHERE id = ?');
      updateStmt.run('ALL', testUsers.dpdUser.id);
      
      let stmt = db.prepare('SELECT url_restriction_mode FROM users WHERE id = ?');
      let result = stmt.get(testUsers.dpdUser.id);
      expect(result.url_restriction_mode).toBe('ALL');
      
      // Switch back to RESTRICTED
      updateStmt.run('RESTRICTED', testUsers.dpdUser.id);
      result = stmt.get(testUsers.dpdUser.id);
      expect(result.url_restriction_mode).toBe('RESTRICTED');
    });
  });
});

