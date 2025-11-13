# APDP Checkit Authentication System

## Overview
The APDP Checkit tool uses a comprehensive authentication system with JWT tokens, role-based access control (APDP/DPD), and IP restrictions for enhanced security.

## Architecture

### Tech Stack
- **Database**: SQLite (file-based, no external database required)
- **Authentication**: JWT (JSON Web Tokens) with 8-hour expiration
- **Password Hashing**: bcryptjs with salt rounds = 10
- **Rate Limiting**: 5 failed attempts = 15 minute lockout
- **IP Restrictions**: Optional per-user IP whitelisting

### User Roles

1. **APDP (Administrateur)**
   - Full access to all features
   - Admin panel access for user management
   - Plugin configuration management
   - Audit log access
   - No IP restrictions enforced

2. **DPD (Délégué à la Protection des Données)**
   - Restricted plugin access (configurable by APDP)
   - Optional IP restrictions
   - No admin panel access
   - Regular auditing

## Default Credentials

After running the database setup, two default users are created:

### APDP Admin
- **Username**: `admin@apdp.mc`
- **Password**: `Admin@APDP2025!`
- **Role**: APDP
- **IP Restrictions**: None

### Example DPD User
- **Username**: `dpd@example.mc`
- **Password**: `DPD@Monaco2025`
- **Role**: DPD
- **IP Restrictions**: None

**⚠️ IMPORTANT**: Change these passwords immediately after first login!

## Setup Instructions

### 1. Initial Setup

```bash
# Install dependencies (already done if you followed main setup)
npm install better-sqlite3 bcryptjs jsonwebtoken

# Initialize database and create default users
node database/setup.js
```

This creates:
- `database/checkit.db` - SQLite database file
- Default APDP admin user
- Example DPD user
- Empty disabled plugins list

### 2. First Login

1. Navigate to `https://your-domain.com/login`
2. Use the APDP admin credentials above
3. You'll be redirected to the home page
4. Your username and role dropdown will appear in the header

### 3. Access Admin Panel

1. Click on your username dropdown in the header
2. Click "Administration" (only visible to APDP users)
3. Manage users and configure plugins

## Authentication Flow

### Login Process

1. **User visits `/login`**
   - Professional French login page with APDP branding
   - APDP logo prominently displayed
   - Username and password fields
   - Password visibility toggle

2. **Credentials submitted**
   - POST request to `/api/auth/login`
   - Server checks rate limiting (5 attempts in 15 minutes)
   - Credentials verified against database (bcrypt)
   - IP address logged in audit log

3. **Success response**
   - JWT token generated (8-hour expiration)
   - Token includes: user ID, username, role
   - Client stores: token, username, role in localStorage

4. **Failed login**
   - Failed attempt recorded in database
   - Error message displayed in French
   - Remaining attempts shown
   - After 5 failures: 15-minute lockout

### Token Verification

On every authenticated request:
1. Client sends `Authorization: Bearer <token>` header
2. Server verifies JWT signature and expiration
3. User data extracted from token
4. IP restrictions checked (DPD users only)
5. Request proceeds or returns 401/403

### Logout Process

1. User clicks "Déconnexion" in dropdown menu
2. POST request to `/api/auth/logout` (logs audit entry)
3. Client clears localStorage
4. Redirect to `/login`

## Security Features

### Rate Limiting

Prevents brute force attacks:
- **Login attempts**: 5 failures in 15 minutes = lockout
- **Tracked per username** (not IP, to prevent lockout of legitimate users)
- Automatically expires after 15 minutes
- Old login attempts cleaned periodically

### IP Restrictions (DPD Users)

Optional whitelist per user:
- Configured in admin panel
- Comma-separated IP addresses
- Enforced on every request
- Bypass for APDP users
- Violations logged in audit log

Example:
```
192.168.1.100, 10.0.0.50, 172.16.0.10
```

### Audit Logging

All sensitive actions are logged:
- User login/logout
- User creation/modification/deletion
- Plugin configuration changes
- IP restriction violations
- Admin access attempts by DPD users

Audit log includes:
- User ID
- Action type
- Details
- IP address
- Timestamp

### Token Security

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 8 hours
- **Secret**: Environment variable (change in production!)
- **Payload**: Minimal data (ID, username, role)
- **No sensitive data** stored in token

## API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "username": "admin@apdp.mc",
  "password": "Admin@APDP2025!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin@apdp.mc",
    "role": "APDP"
  }
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Trop de tentatives",
  "message": "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  "remainingTime": 15
}
```

#### GET /api/auth/verify
Verify JWT token and get user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin@apdp.mc",
    "role": "APDP"
  }
}
```

#### POST /api/auth/logout
Logout user (logs audit entry).

**Headers:**
```
Authorization: Bearer <token>
```

### Admin Endpoints (APDP Only)

All admin endpoints require APDP role.

#### GET /api/admin/users
List all users.

#### POST /api/admin/users
Create new user.

**Request:**
```json
{
  "username": "new.dpd@company.mc",
  "password": "SecurePass123!",
  "role": "DPD",
  "ipRestrictions": "192.168.1.100, 10.0.0.50"
}
```

#### PUT /api/admin/users/:id
Update user.

#### DELETE /api/admin/users/:id
Delete user (cannot delete self).

#### GET /api/admin/plugins
Get disabled plugins list.

#### PUT /api/admin/plugins
Update disabled plugins.

**Request:**
```json
{
  "disabledPlugins": ["trace-route", "ports", "vulnerabilities"]
}
```

### Plugin Access

#### GET /api/plugins/available
Get available plugins for current user.

**Response (APDP):**
```json
{
  "success": true,
  "disabledPlugins": []
}
```

**Response (DPD):**
```json
{
  "success": true,
  "disabledPlugins": ["trace-route", "ports"]
}
```

## Frontend Integration

### Login Page
- **File**: `src/pages/login.astro`
- **Component**: `src/web-check-live/components/Auth/LoginForm.tsx`
- Professional design with APDP branding
- Full French translation
- Real-time error messages
- Loading states

### Auth Guard
- **File**: `public/auth-check.js`
- Runs on every page load
- Verifies token with server
- Redirects to `/login` if unauthorized
- Handles token expiration
- Session timeout warnings

### User Dropdown
- **File**: `src/web-check-live/components/misc/Header.tsx`
- Displays username with dropdown
- "Administration" link (APDP only)
- "Déconnexion" logout option
- Click outside to close

### Admin Panel
- **File**: `src/pages/admin/index.astro`
- **Component**: `src/web-check-live/views/Admin.tsx`
- Role check (APDP only)
- User management interface
- Plugin configuration interface
- Real-time updates

## Database Schema

### users table
```sql
id               INTEGER PRIMARY KEY AUTOINCREMENT
username         TEXT NOT NULL UNIQUE
password_hash    TEXT NOT NULL
role             TEXT NOT NULL CHECK(role IN ('APDP', 'DPD'))
ip_restrictions  TEXT (comma-separated IPs or empty)
created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
```

### disabled_plugins table
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
plugin_name TEXT NOT NULL UNIQUE
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

### audit_log table
```sql
id         INTEGER PRIMARY KEY AUTOINCREMENT
user_id    INTEGER NOT NULL (FK to users)
action     TEXT NOT NULL
details    TEXT
ip_address TEXT
timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP
```

### login_attempts table
```sql
id         INTEGER PRIMARY KEY AUTOINCREMENT
username   TEXT NOT NULL
ip_address TEXT NOT NULL
success    INTEGER DEFAULT 0 (0=failed, 1=success)
timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP
```

## Troubleshooting

### Cannot login
1. Check credentials are correct
2. Wait 15 minutes if rate limited
3. Check browser console for errors
4. Verify database exists: `ls database/checkit.db`
5. Run setup again: `node database/setup.js`

### Token expired
- Tokens expire after 8 hours
- Simply login again
- Session data is cleared automatically

### IP restriction issues (DPD users)
1. Check IP restrictions in admin panel
2. Verify your current IP matches whitelist
3. Remove restrictions temporarily to test
4. Check audit log for violation attempts

### Admin panel not accessible
- Verify you're logged in as APDP user
- Check localStorage: `localStorage.getItem('checkitUserRole')`
- Should return `"APDP"`

### Database locked errors
- SQLite supports one writer at a time
- Normal for concurrent admin operations
- Operations retry automatically
- Check no other process is accessing database

## Production Recommendations

1. **Change JWT Secret**
   ```bash
   # Add to .env file
   JWT_SECRET=your-very-long-random-secret-here
   ```

2. **Change Default Passwords**
   - Login as admin
   - Go to admin panel
   - Edit both default users
   - Use strong, unique passwords

3. **Regular Backups**
   ```bash
   # Backup database
   cp database/checkit.db database/checkit.db.backup
   
   # Automated backup (cron)
   0 2 * * * cp /path/to/database/checkit.db /path/to/backups/checkit-$(date +\%Y\%m\%d).db
   ```

4. **Monitor Audit Logs**
   ```javascript
   // Check recent admin actions
   import { getAuditLogs } from './database/db.js';
   const logs = getAuditLogs(100);
   console.log(logs);
   ```

5. **Clean Old Login Attempts**
   ```javascript
   // Add to cron or startup
   import { clearOldLoginAttempts } from './database/db.js';
   clearOldLoginAttempts(7); // Remove attempts older than 7 days
   ```

## Support

For issues or questions:
1. Check this documentation
2. Review ADMIN_GUIDE.md for admin-specific tasks
3. Check audit logs for security events
4. Verify database integrity
5. Contact APDP technical team

---

**Last Updated**: November 2025
**Version**: 2.1.0 - APDP Multi-User System
