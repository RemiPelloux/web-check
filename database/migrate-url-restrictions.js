/**
 * Migration script to add URL restriction columns to existing users table
 * Run this on the production server after deployment
 */

import { db } from './db.js';

console.log('🔄 Starting migration: Add URL restriction columns...\n');

try {
  // Check if columns already exist
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  const hasUrlRestrictionMode = tableInfo.some(col => col.name === 'url_restriction_mode');
  const hasAllowedUrls = tableInfo.some(col => col.name === 'allowed_urls');

  if (hasUrlRestrictionMode && hasAllowedUrls) {
    console.log('✅ Columns already exist. No migration needed.\n');
    process.exit(0);
  }

  // Add url_restriction_mode column if it doesn't exist
  if (!hasUrlRestrictionMode) {
    console.log('📝 Adding url_restriction_mode column...');
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN url_restriction_mode TEXT DEFAULT 'ALL' 
      CHECK(url_restriction_mode IN ('ALL', 'RESTRICTED'))
    `);
    console.log('✅ Added url_restriction_mode column\n');
  }

  // Add allowed_urls column if it doesn't exist
  if (!hasAllowedUrls) {
    console.log('📝 Adding allowed_urls column...');
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN allowed_urls TEXT
    `);
    console.log('✅ Added allowed_urls column\n');
  }

  console.log('🎉 Migration completed successfully!\n');
  console.log('All DPD users now have URL restriction mode set to "ALL" (no restrictions).');
  console.log('You can modify individual users in the admin panel.\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
