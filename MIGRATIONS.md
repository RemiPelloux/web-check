# Database Migration System

## Overview

Checkit now has an automatic database migration system integrated into the deployment process. This ensures that database schema changes are never missed during deployments.

## How It Works

### Automatic Detection

When you run `./deploy.sh`, the script automatically:
1. Scans the `database/` directory for files matching `migrate-*.js`
2. Sorts them alphabetically
3. Runs each migration in order
4. Reports success or failure
5. Stops deployment if any migration fails

### Example Output

```bash
./deploy.sh

# ... deployment steps ...

==> Step 6/7: Checking and running database migrations...
Scanning for migration files...

Found migration files:
  • database/migrate-url-restrictions.js

Running migrations on production database...

Running: migrate-url-restrictions.js
  🔄 Starting migration: Add URL restriction columns...
  
  📝 Adding url_restriction_mode column...
  ✅ Added url_restriction_mode column
  
  📝 Adding allowed_urls column...
  ✅ Added allowed_urls column
  
  🎉 Migration completed successfully!

✓ migrate-url-restrictions.js completed

✓ All migrations completed successfully
```

## Creating a Migration

### 1. Create Migration File

Create a new file in `database/` with the `migrate-` prefix:

```bash
touch database/migrate-add-user-preferences.js
```

### 2. Write Migration Code

```javascript
/**
 * Migration: Add user preferences
 * Run date: 2025-11-14
 */

import { db } from './db.js';

console.log('🔄 Starting migration: Add user preferences...\n');

try {
  // Check if already applied (idempotent)
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  const hasPreferences = tableInfo.some(col => col.name === 'preferences');

  if (hasPreferences) {
    console.log('✅ Migration already applied. Skipping.\n');
    process.exit(0);
  }

  // Apply migration
  console.log('📝 Adding preferences column...');
  db.exec(`
    ALTER TABLE users 
    ADD COLUMN preferences TEXT DEFAULT '{}'
  `);
  console.log('✅ Added preferences column\n');

  console.log('🎉 Migration completed successfully!\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
```

### 3. Test Locally

```bash
node database/migrate-add-user-preferences.js
```

### 4. Commit and Deploy

```bash
git add database/migrate-add-user-preferences.js
git commit -m "Add user preferences migration"
./deploy.sh
```

The migration will run automatically during deployment!

## Best Practices

### ✅ DO

- **Make migrations idempotent**: Check if changes are already applied
- **Use descriptive names**: `migrate-add-feature-name.js`
- **Test locally first**: Run migrations on your dev database
- **Add comments**: Explain what and why
- **Handle errors**: Exit with proper error codes
- **Keep it simple**: One logical change per migration

### ❌ DON'T

- **Don't delete data** without explicit confirmation
- **Don't skip testing** - always test before deploying
- **Don't modify existing migrations** - create new ones instead
- **Don't use hardcoded values** - use defaults or environment variables

## Migration Checklist

Before deploying a migration:

- [ ] Migration file follows `migrate-*.js` naming convention
- [ ] Migration is idempotent (can run multiple times safely)
- [ ] Migration tested locally with SQLite
- [ ] Migration includes error handling
- [ ] Migration includes status messages (🔄, ✅, ❌)
- [ ] Code committed to git
- [ ] Documentation updated if needed

## Manual Migration

If you need to run a migration manually (troubleshooting):

```bash
# SSH into server
ssh sysadm@82.97.8.94

# Run migration
cd /opt/webcheck
docker exec Web-Check-Checkit node database/migrate-your-file.js
```

## Troubleshooting

### Migration Failed During Deployment

**Error**: Migration exits with error code

**Solution**:
1. Check deployment logs for specific error
2. SSH into server and run migration manually for details
3. Fix the migration code
4. Redeploy

### Migration Runs Every Time

**Issue**: Migration doesn't check if it's already applied

**Solution**: Add idempotency check at the start of your migration

```javascript
// Check if already applied
const tableInfo = db.prepare('PRAGMA table_info(table_name)').all();
const hasColumn = tableInfo.some(col => col.name === 'new_column');

if (hasColumn) {
  console.log('✅ Already applied. Skipping.\n');
  process.exit(0);
}
```

### Need to Rollback

**Issue**: Migration needs to be reversed

**Solution**: Create a new rollback migration

```javascript
// migrate-rollback-user-preferences.js
console.log('🔄 Rolling back: Remove user preferences...\n');

db.exec(`
  ALTER TABLE users DROP COLUMN preferences
`);

console.log('✅ Rollback completed\n');
```

## Deployment Options

```bash
# Normal deployment (runs migrations)
./deploy.sh

# Quick restart (skips migrations)
./deploy.sh --quick

# Full rebuild (runs migrations)
./deploy.sh --full

# Dry run (shows what would happen)
./deploy.sh --dry-run
```

## Database Access

### View Database Schema

```bash
ssh sysadm@82.97.8.94
cd /opt/webcheck
docker exec Web-Check-Checkit sqlite3 database/checkit.db "PRAGMA table_info(users);"
```

### Query Database

```bash
docker exec Web-Check-Checkit sqlite3 database/checkit.db "SELECT * FROM users;"
```

### Backup Database

```bash
docker exec Web-Check-Checkit sqlite3 database/checkit.db ".backup /app/database/checkit-backup.db"
```

## Future Enhancements

Planned improvements for the migration system:

- [ ] Migration tracking table (record which migrations have run)
- [ ] Automatic database backup before migrations
- [ ] Rollback on failure
- [ ] Migration versioning
- [ ] Dry-run mode for migrations
- [ ] Migration dependencies

## Related Files

- `database/README.md` - Detailed migration documentation
- `database/schema.sql` - Database schema definition
- `database/setup.js` - Initial database setup
- `database/db.js` - Database connection and utilities
- `deploy.sh` - Deployment script with migration support

## Questions?

For detailed migration documentation, see:
- `database/README.md`

For deployment help:
- `./deploy.sh --help`

