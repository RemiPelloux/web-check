# Test Suite for Checkit/Web-Check

Comprehensive test suite for the APDP compliance checking platform.

## Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── helpers.js                  # Test utilities and helpers
├── unit/                       # Unit tests
│   ├── auth/
│   │   ├── authentication.test.js
│   │   ├── ip-restrictions.test.js
│   │   └── url-whitelist.test.js
│   ├── admin/
│   │   └── statistics.test.js
│   └── plugins/
│       └── compliance-checks.test.js
├── integration/               # Integration tests (API endpoints)
│   ├── auth/
│   ├── api/
│   └── admin/
└── e2e/                       # End-to-end tests
    └── (future UI automation tests)
```

## Running Tests

### Run All Tests
```bash
yarn test
```

### Run Specific Test File
```bash
yarn test authentication
yarn test ip-restrictions
yarn test url-whitelist
yarn test statistics
yarn test compliance-checks
```

### Run Tests in Watch Mode
```bash
yarn test:watch
```

### Run Tests with Coverage
```bash
yarn test:coverage
```

## Test Categories

### 1. Authentication Tests (`unit/auth/authentication.test.js`)
- ✅ User login (APDP and DPD)
- ✅ JWT token generation and validation
- ✅ Role-based access control
- ✅ Password hashing and verification
- ✅ Login failure scenarios

**Key Tests:**
- APDP login with username/password
- DPD IP-based auto-authentication
- Token expiration handling
- Password security (bcrypt)

### 2. IP Restriction Tests (`unit/auth/ip-restrictions.test.js`)
- ✅ IP whitelist configuration
- ✅ IP address validation
- ✅ Client IP matching
- ✅ DPD auto-authentication by IP
- ✅ Multi-IP handling
- ✅ IP restriction enforcement
- ✅ Security audit logging

**Key Tests:**
- IP format validation (IPv4)
- Whitelist matching logic
- Unauthorized IP rejection
- Multiple DPD users with different IPs
- Audit log for IP violations

### 3. URL Whitelist Tests (`unit/auth/url-whitelist.test.js`)
- ✅ URL restriction configuration (ALL vs RESTRICTED mode)
- ✅ URL whitelist storage and parsing
- ✅ Domain format validation
- ✅ URL normalization (http/https, www prefix)
- ✅ Access control enforcement
- ✅ Dashboard URL display
- ✅ Large whitelist handling

**Key Tests:**
- Domain format validation
- URL matching with/without www
- Whitelist enforcement for scan requests
- ALL mode (unrestricted access)
- RESTRICTED mode (specific URLs only)

### 4. Admin Statistics Tests (`unit/admin/statistics.test.js`)
- ✅ Scan history recording
- ✅ Anonymous statistics aggregation
- ✅ Privacy compliance (no URLs/user IDs exposed)
- ✅ Time-based statistics
- ✅ Chart data preparation
- ✅ Statistics trends over time

**Key Tests:**
- Total scans counting
- Critical/warning/improvement aggregation
- Scans per user ratio
- Anonymous data (no URLs or identifiers)
- Chart data formatting (line, bar, pie charts)

### 5. Compliance Plugin Tests (`unit/plugins/compliance-checks.test.js`)
- ✅ Cookie banner detection
- ✅ Privacy policy detection and validation
- ✅ Legal notices detection and validation
- ✅ SSL/TLS security checks
- ✅ DNS configuration validation
- ✅ Security headers validation
- ✅ Accessibility checks
- ✅ Performance checks
- ✅ SEO analysis

**Key Tests:**
- Cookie consent banner presence
- Privacy policy required sections
- Legal notices required information
- HTTPS enforcement
- Security headers (HSTS, CSP, X-Frame-Options)
- Alt text on images
- Meta tags validation

## Test Helpers

### `createTestDatabase()`
Creates an in-memory SQLite database with full schema for testing.

### `createTestUsers(db)`
Populates database with test users:
- APDP admin: `admin@apdp.mc` (password: `password123`)
- DPD user: `dpd-test-company-123456` (IPs: `127.0.0.1, 192.168.1.100`, URLs: `example.com, test.com`)

### `generateTestToken(user)`
Generates a valid JWT token for testing authenticated requests.

### `mockIpAddress(req, ip)`
Mocks client IP address in Express request object.

## Code Coverage

The test suite aims for:
- ✅ 90%+ coverage for authentication logic
- ✅ 90%+ coverage for authorization (IP/URL restrictions)
- ✅ 85%+ coverage for admin features
- ✅ 80%+ coverage for plugins

## Writing New Tests

### Example Test Structure

```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createTestDatabase, createTestUsers } from '../helpers.js';

describe('Feature Name', () => {
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

  describe('Sub-feature', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = someFunction(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

## Continuous Integration

Tests should be run:
- ✅ Before every commit
- ✅ On pull requests
- ✅ Before deployment to production
- ✅ On scheduled intervals (daily)

## Test Environment

- **Node.js**: v16+
- **Jest**: v29+
- **Database**: SQLite (in-memory for tests)
- **Test Timeout**: 30 seconds per test

## Debugging Tests

### Run Single Test
```bash
yarn test --testNamePattern="should login APDP user"
```

### Enable Verbose Output
```bash
yarn test --verbose
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Known Issues

- Tests run in isolated in-memory database (no persistence between test runs)
- Network-dependent plugin tests may need mocking in CI environment
- Some compliance checks require external services (may be slow)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain >80% code coverage
4. Update this README with new test descriptions

## Test Results

Run `yarn test` to see current test status:

```
Test Suites: X passed, X total
Tests:       X passed, X total
Coverage:    XX% Statements XX% Branches XX% Functions XX% Lines
```

---

**Last Updated**: January 2025
**Maintained By**: APDP Development Team

