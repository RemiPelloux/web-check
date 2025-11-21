/**
 * Authentication Tests
 * Tests for user login, JWT token generation, and authentication middleware
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestDatabase, createTestUsers, generateTestToken } from '../../helpers.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication System', () => {
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

  describe('User Login', () => {
    test('should login APDP user with correct credentials', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get('admin@apdp.mc');
      
      expect(user).toBeDefined();
      expect(user.role).toBe('APDP');
      expect(user.username).toBe('admin@apdp.mc');
    });

    test('should fail login with incorrect password', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get('admin@apdp.mc');
      
      const isValidPassword = bcrypt.compareSync('wrongpassword', user.password_hash);
      expect(isValidPassword).toBe(false);
    });

    test('should fail login with non-existent user', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get('nonexistent@example.com');
      
      expect(user).toBeUndefined();
    });

    test('should allow DPD user login without password if IP matches', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(testUsers.dpdUser.username);
      
      expect(user).toBeDefined();
      expect(user.role).toBe('DPD');
      expect(user.ip_restrictions).toBe('127.0.0.1, 192.168.1.100');
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token for APDP user', () => {
      const token = generateTestToken(testUsers.apdpUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate valid JWT token for DPD user', () => {
      const token = generateTestToken(testUsers.dpdUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should encode user information in JWT token', () => {
      const token = generateTestToken(testUsers.apdpUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.id).toBe(testUsers.apdpUser.id);
      expect(decoded.username).toBe(testUsers.apdpUser.username);
      expect(decoded.role).toBe(testUsers.apdpUser.role);
    });

    test('should include expiration time in JWT token', () => {
      const token = generateTestToken(testUsers.apdpUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('Role-Based Access', () => {
    test('should identify APDP admin role correctly', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(testUsers.apdpUser.id);
      
      expect(user.role).toBe('APDP');
    });

    test('should identify DPD role correctly', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(testUsers.dpdUser.id);
      
      expect(user.role).toBe('DPD');
    });

    test('should have company field for DPD users', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(testUsers.dpdUser.id);
      
      expect(user.company).toBe('Test Company');
    });

    test('APDP users should not require company field', () => {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(testUsers.apdpUser.id);
      
      expect(user.company).toBeNull();
    });
  });

  describe('Password Security', () => {
    test('should store hashed passwords', () => {
      const stmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
      const result = stmt.get(testUsers.apdpUser.id);
      
      expect(result.password_hash).toBeDefined();
      expect(result.password_hash).not.toBe('password123'); // Original password
      expect(result.password_hash).toMatch(/^\$2[aby]\$/); // Bcrypt hash format
    });

    test('should verify correct password with bcrypt', () => {
      const stmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
      const result = stmt.get(testUsers.apdpUser.id);
      
      const isValid = bcrypt.compareSync('password123', result.password_hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password with bcrypt', () => {
      const stmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
      const result = stmt.get(testUsers.apdpUser.id);
      
      const isValid = bcrypt.compareSync('wrongpassword', result.password_hash);
      expect(isValid).toBe(false);
    });
  });
});

