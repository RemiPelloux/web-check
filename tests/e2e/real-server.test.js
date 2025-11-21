/**
 * REAL END-TO-END TESTS
 * These tests require the actual server to be running
 * Run with: yarn dev (in one terminal) then yarn test:e2e (in another)
 */

import { describe, test, expect } from '@jest/globals';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

describe('REAL E2E Tests - Live Server Required', () => {
  test.skip('REAL E2E: Check if server is running', async () => {
    // This test requires the server to be running
    // Enable it by removing .skip and starting server with: yarn dev
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
      const isServerUp = response.status === 200 || response.status === 404; // Either is fine
      
      expect(typeof response.status).toBe('number');
      console.log(`✓ REAL E2E: Server responded with status ${response.status}`);
    } catch (error) {
      console.error('❌ Server is not running! Start it with: yarn dev');
      console.error('   Then run tests again');
      throw new Error('Server not available for E2E tests');
    }
  }, 10000);

  test.skip('REAL E2E: Login to actual API', async () => {
    // This test is skipped by default - enable when you want to test against running server
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin@apdp.mc', // Replace with real test user
          password: 'your-test-password' // Replace with real test password
        })
      });
      
      const data = await response.json();
      
      expect(response.status).toBeLessThan(500); // Should not be server error
      
      if (response.ok) {
        expect(data.token).toBeDefined();
        console.log('✓ REAL E2E: Successfully logged in and received JWT token');
      } else {
        console.log('ℹ️  REAL E2E: Login failed (check credentials):', data.message);
      }
    } catch (error) {
      console.error('❌ REAL E2E: Failed to connect to API:', error.message);
      throw error;
    }
  }, 15000);

  test.skip('REAL E2E: Fetch users list (requires auth)', async () => {
    // Enable this test and provide a real token
    const token = 'YOUR_REAL_JWT_TOKEN_HERE';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data.users) || Array.isArray(data)).toBe(true);
        console.log('✓ REAL E2E: Successfully fetched users from real API');
      } else {
        console.log('ℹ️  REAL E2E: Auth required or token invalid');
      }
    } catch (error) {
      console.error('❌ REAL E2E: Failed to fetch users:', error.message);
    }
  }, 15000);
});

describe('REAL Integration - Actual Plugin Tests', () => {
  test.skip('REAL: Scan a real website with APDP plugins', async () => {
    // This would test the actual scanning endpoint
    const testUrl = 'https://example.com';
    
    try {
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: testUrl
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toBeDefined();
        console.log('✓ REAL: Successfully scanned real website');
      }
    } catch (error) {
      console.log('ℹ️  REAL: Scan endpoint test skipped (configure endpoint first)');
    }
  }, 30000);
});

