/**
 * Migration: Add is_test_account flag to users table
 * 
 * Test accounts are certified accounts that:
 * - Display a special badge in admin
 * - Are excluded from statistics
 */

export const version = '007_add_test_account_flag';
export const description = 'Add is_test_account flag to users table for certified accounts';

// Certified test account usernames (these won't count in stats)
const CERTIFIED_ACCOUNTS = [
  'admin@apdp.mc',
  'dpd-openpro-130838',
  'dpd-dpd-openpro-gauthier-141028',
  'dpd-apdp-test-824633'
];

export function up(db) {
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasColumn = tableInfo.some(col => col.name === 'is_test_account');
  
  if (!hasColumn) {
    // Add is_test_account column
    db.exec(`
      ALTER TABLE users ADD COLUMN is_test_account INTEGER DEFAULT 0;
    `);
    console.log('  ✓ Added is_test_account column to users');
    
    // Create index for faster filtering
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_test_account ON users(is_test_account);
    `);
    console.log('  ✓ Created index for is_test_account');
  } else {
    console.log('  ℹ is_test_account column already exists');
  }
  
  // Mark certified accounts as test accounts
  const updateStmt = db.prepare('UPDATE users SET is_test_account = 1 WHERE username = ?');
  
  for (const username of CERTIFIED_ACCOUNTS) {
    const result = updateStmt.run(username);
    if (result.changes > 0) {
      console.log(`  ✓ Marked ${username} as test account`);
    }
  }
}

export function down(db) {
  // Reset all test accounts
  db.exec('UPDATE users SET is_test_account = 0');
  console.log('  ✓ Reset all test account flags');
}

