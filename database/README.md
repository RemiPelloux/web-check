# Database Migrations

This directory contains database migration scripts for the Checkit application.

## How Migrations Work

Migrations are automatically detected and run during deployment by the `deploy.sh` script.

### Migration File Naming Convention

All migration files MUST follow this pattern:
```
migrate-<description>.js
```

Examples:
- `migrate-url-restrictions.js`
- `migrate-add-user-preferences.js`
- `migrate-update-plugins-table.js`

### Creating a New Migration

1. Create a new file in `database/` with the `migrate-` prefix:

```javascript
/**
 * Migration: Add new feature columns
 * Description: Adds columns needed for the new feature
 */

import { db } from './db.js';

console.log('🔄 Starting migration: Add new feature...\n');

try {
  // Check if migration already applied
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  const hasNewColumn = tableInfo.some(col => col.name === 'new_column');

  if (hasNewColumn) {
    console.log('✅ Migration already applied. Skipping.\n');
    process.exit(0);
  }

  // Apply migration
  console.log('📝 Adding new_column...');
  db.exec(`
    ALTER TABLE users 
    ADD COLUMN new_column TEXT DEFAULT 'default_value'
  `);
  console.log('✅ Added new_column\n');

  console.log('🎉 Migration completed successfully!\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
```

2. Test locally:
```bash
node database/migrate-your-feature.js
```

3. Commit the migration file to git

4. Deploy - the migration will run automatically:
```bash
./deploy.sh
```

### Migration Best Practices

1. **Idempotent**: Migrations should check if they've already been applied
2. **Reversible**: Consider how to undo changes if needed
3. **Safe**: Don't delete data without confirmation
4. **Documented**: Include clear comments explaining what the migration does
5. **Tested**: Test migrations on a development database first

### Deployment Process

The deployment script automatically:
1. Scans the `database/` directory for `migrate-*.js` files
2. Runs each migration in alphabetical order
3. Reports success or failure for each migration
4. Stops deployment if any migration fails

### Manual Migration Execution

If you need to run a migration manually:

```bash
# SSH into the server
ssh sysadm@82.97.8.94

# Navigate to the app directory
cd /opt/webcheck

# Run the migration inside the Docker container
docker exec Web-Check-Checkit node database/migrate-your-feature.js
```

### Checking Migration Status

To see what's in the database:

```bash
# SSH into server
ssh sysadm@82.97.8.94

# Check table schema
docker exec Web-Check-Checkit sqlite3 database/checkit.db "PRAGMA table_info(users);"

# View data
docker exec Web-Check-Checkit sqlite3 database/checkit.db "SELECT * FROM users;"
```

## Current Migrations

- `migrate-url-restrictions.js` - Adds URL restriction columns for DPD users

## Troubleshooting

### Migration Failed During Deployment

1. Check the deployment logs for the specific error
2. SSH into the server and run the migration manually to see detailed output
3. Fix the migration file if needed
4. Redeploy

### Migration Already Applied

Migrations check if they've been applied before running. You'll see:
```
✅ Migration already applied. Skipping.
```

This is normal and safe.

### Need to Rollback

Currently, there's no automatic rollback. To rollback:
1. Create a new migration that reverses the changes
2. Deploy the new migration

Example rollback migration:
```javascript
// migrate-rollback-feature.js
db.exec(`ALTER TABLE users DROP COLUMN new_column`);
```

## Future Improvements

- Migration tracking table to record which migrations have run
- Automatic rollback on failure
- Migration versioning system
- Database backup before migrations

