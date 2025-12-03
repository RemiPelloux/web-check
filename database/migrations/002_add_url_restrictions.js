/**
 * Migration: Add URL restriction columns
 * 
 * Adds to users table:
 * - url_restriction_mode: 'ALL' or 'RESTRICTED'
 * - allowed_urls: Comma-separated list of allowed URLs
 */

export const description = 'Add URL restriction columns to users table';

export async function up(db) {
  // Check if columns already exist
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  const hasUrlRestrictionMode = tableInfo.some(col => col.name === 'url_restriction_mode');
  const hasAllowedUrls = tableInfo.some(col => col.name === 'allowed_urls');

  // Add url_restriction_mode column if it doesn't exist
  if (!hasUrlRestrictionMode) {
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN url_restriction_mode TEXT DEFAULT 'ALL' 
      CHECK(url_restriction_mode IN ('ALL', 'RESTRICTED'))
    `);
  }

  // Add allowed_urls column if it doesn't exist
  if (!hasAllowedUrls) {
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN allowed_urls TEXT
    `);
  }
}

export async function down(db) {
  // SQLite doesn't support DROP COLUMN easily
  // Would need to recreate the table without these columns
  console.log('Rollback not supported for this migration');
}





