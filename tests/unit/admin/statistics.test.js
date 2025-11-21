/**
 * Admin Statistics Tests
 * Tests for anonymous statistics aggregation and reporting
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestDatabase, createTestUsers } from '../../helpers.js';

describe('Admin Statistics System', () => {
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

  describe('Scan Statistics Collection', () => {
    test('should record scan history', () => {
      const stmt = db.prepare(`
        INSERT INTO scan_history (user_id, scanned_url, ip_address, critical_count, warning_count, improvement_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(testUsers.dpdUser.id, 'example.com', '127.0.0.1', 2, 5, 3);
      expect(result.changes).toBe(1);
    });

    test('should retrieve scan history for user', () => {
      // Insert test data
      const insertStmt = db.prepare(`
        INSERT INTO scan_history (user_id, scanned_url, ip_address, critical_count, warning_count, improvement_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(testUsers.dpdUser.id, 'example.com', '127.0.0.1', 2, 5, 3);
      insertStmt.run(testUsers.dpdUser.id, 'test.com', '127.0.0.1', 1, 3, 2);
      
      // Query history
      const stmt = db.prepare('SELECT * FROM scan_history WHERE user_id = ?');
      const history = stmt.all(testUsers.dpdUser.id);
      
      expect(history).toHaveLength(2);
      expect(history[0].scanned_url).toBe('example.com');
      expect(history[1].scanned_url).toBe('test.com');
    });

    test('should aggregate statistics from scan history', () => {
      // Insert test data
      const insertStmt = db.prepare(`
        INSERT INTO scan_history (user_id, scanned_url, ip_address, critical_count, warning_count, improvement_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(testUsers.dpdUser.id, 'example.com', '127.0.0.1', 2, 5, 3);
      insertStmt.run(testUsers.dpdUser.id, 'test.com', '127.0.0.1', 1, 3, 2);
      insertStmt.run(testUsers.apdpUser.id, 'admin-scan.com', '192.168.1.1', 3, 4, 1);
      
      // Aggregate
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_scans,
          SUM(critical_count) as total_critical,
          SUM(warning_count) as total_warnings,
          SUM(improvement_count) as total_improvements
        FROM scan_history
      `);
      
      const stats = stmt.get();
      
      expect(stats.total_scans).toBe(3);
      expect(stats.total_critical).toBe(6);
      expect(stats.total_warnings).toBe(12);
      expect(stats.total_improvements).toBe(6);
    });
  });

  describe('Anonymous Statistics', () => {
    test('should count total DPD users', () => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
      const result = stmt.get('DPD');
      
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    test('should count total APDP users', () => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
      const result = stmt.get('APDP');
      
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    test('should calculate scans per user ratio', () => {
      // Insert test scans
      const insertStmt = db.prepare(`
        INSERT INTO scan_history (user_id, scanned_url, ip_address, critical_count, warning_count, improvement_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(testUsers.dpdUser.id, 'example.com', '127.0.0.1', 2, 5, 3);
      insertStmt.run(testUsers.dpdUser.id, 'test.com', '127.0.0.1', 1, 3, 2);
      
      // Calculate ratio
      const scanCountStmt = db.prepare('SELECT COUNT(*) as count FROM scan_history');
      const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
      
      const totalScans = scanCountStmt.get().count;
      const totalUsers = userCountStmt.get('DPD').count;
      
      const ratio = totalScans / totalUsers;
      
      expect(ratio).toBeGreaterThan(0);
      expect(typeof ratio).toBe('number');
    });

    test('should NOT expose URLs in anonymous statistics', () => {
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_scans,
          SUM(critical_count) as total_critical,
          SUM(warning_count) as total_warnings
        FROM scan_history
      `);
      
      const stats = stmt.get();
      
      // Verify no URL field in anonymous stats
      expect(stats.scanned_url).toBeUndefined();
      expect(stats.total_scans).toBeDefined();
    });

    test('should NOT expose user identifiers in anonymous statistics', () => {
      const stmt = db.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_scans
        FROM scan_history
      `);
      
      const stats = stmt.get();
      
      // Verify only aggregated counts, no individual user info
      expect(stats.unique_users).toBeDefined();
      expect(stats.total_scans).toBeDefined();
      expect(stats.username).toBeUndefined();
      expect(stats.email).toBeUndefined();
    });
  });

  describe('Statistics Aggregation Table', () => {
    test('should store aggregated statistics', () => {
      const stmt = db.prepare(`
        INSERT INTO scan_statistics (total_scans, critical_issues_count, warning_issues_count, dpd_users_count)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(100, 45, 120, 5);
      expect(result.changes).toBe(1);
    });

    test('should update statistics periodically', () => {
      // Initial insert
      const insertStmt = db.prepare(`
        INSERT INTO scan_statistics (total_scans, critical_issues_count, warning_issues_count, dpd_users_count)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(100, 45, 120, 5);
      
      // Update
      const updateStmt = db.prepare(`
        UPDATE scan_statistics 
        SET total_scans = ?, critical_issues_count = ?, warning_issues_count = ?
        WHERE id = (SELECT MAX(id) FROM scan_statistics)
      `);
      updateStmt.run(150, 60, 140);
      
      // Verify
      const selectStmt = db.prepare('SELECT * FROM scan_statistics ORDER BY id DESC LIMIT 1');
      const stats = selectStmt.get();
      
      expect(stats.total_scans).toBe(150);
      expect(stats.critical_issues_count).toBe(60);
      expect(stats.warning_issues_count).toBe(140);
    });

    test('should retrieve latest statistics', () => {
      // Insert multiple records
      const stmt = db.prepare(`
        INSERT INTO scan_statistics (total_scans, critical_issues_count, warning_issues_count, dpd_users_count)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(100, 45, 120, 5);
      stmt.run(150, 60, 140, 6);
      stmt.run(200, 75, 160, 7);
      
      // Get latest
      const selectStmt = db.prepare('SELECT * FROM scan_statistics ORDER BY timestamp DESC LIMIT 1');
      const latest = selectStmt.get();
      
      expect(latest.total_scans).toBe(200);
      expect(latest.dpd_users_count).toBe(7);
    });
  });

  describe('Time-Based Statistics', () => {
    test('should retrieve statistics for date range', () => {
      const stmt = db.prepare(`
        INSERT INTO scan_statistics (total_scans, critical_issues_count, warning_issues_count, dpd_users_count, timestamp)
        VALUES (?, ?, ?, ?, datetime('now', ?))
      `);
      
      stmt.run(100, 45, 120, 5, '-7 days');
      stmt.run(150, 60, 140, 6, '-3 days');
      stmt.run(200, 75, 160, 7, '-0 days');
      
      // Query last 30 days
      const selectStmt = db.prepare(`
        SELECT * FROM scan_statistics 
        WHERE timestamp >= datetime('now', '-30 days')
        ORDER BY timestamp ASC
      `);
      
      const stats = selectStmt.all();
      expect(stats.length).toBeGreaterThanOrEqual(3);
    });

    test('should calculate trend over time', () => {
      const stmt = db.prepare(`
        INSERT INTO scan_statistics (total_scans, critical_issues_count, warning_issues_count, dpd_users_count)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(100, 45, 120, 5);
      stmt.run(150, 60, 140, 6);
      stmt.run(200, 75, 160, 7);
      
      const selectStmt = db.prepare('SELECT total_scans FROM scan_statistics ORDER BY timestamp ASC');
      const results = selectStmt.all();
      
      // Verify increasing trend
      expect(results[0].total_scans).toBe(100);
      expect(results[1].total_scans).toBe(150);
      expect(results[2].total_scans).toBe(200);
      
      const trend = results[2].total_scans > results[0].total_scans;
      expect(trend).toBe(true);
    });
  });

  describe('Chart Data Preparation', () => {
    test('should format data for line chart (scans over time)', () => {
      const mockData = [
        { timestamp: '2024-01-01', total_scans: 100 },
        { timestamp: '2024-01-02', total_scans: 120 },
        { timestamp: '2024-01-03', total_scans: 150 },
      ];
      
      const chartData = mockData.map(d => ({
        date: d.timestamp,
        scans: d.total_scans,
      }));
      
      expect(chartData).toHaveLength(3);
      expect(chartData[0]).toEqual({ date: '2024-01-01', scans: 100 });
    });

    test('should format data for bar chart (issues by severity)', () => {
      const mockData = {
        critical: 75,
        warnings: 160,
        improvements: 200,
      };
      
      const chartData = [
        { name: 'Critique', value: mockData.critical },
        { name: 'Avertissement', value: mockData.warnings },
        { name: 'Amélioration', value: mockData.improvements },
      ];
      
      expect(chartData).toHaveLength(3);
      expect(chartData[0].name).toBe('Critique');
      expect(chartData[0].value).toBe(75);
    });

    test('should format data for pie chart (user types)', () => {
      const mockData = {
        apdp: 2,
        dpd: 7,
      };
      
      const chartData = [
        { name: 'APDP', value: mockData.apdp },
        { name: 'DPD', value: mockData.dpd },
      ];
      
      const total = mockData.apdp + mockData.dpd;
      const percentages = chartData.map(d => ({
        ...d,
        percentage: ((d.value / total) * 100).toFixed(1),
      }));
      
      expect(percentages[0].percentage).toBe('22.2');
      expect(percentages[1].percentage).toBe('77.8');
    });
  });
});

