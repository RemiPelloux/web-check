/**
 * Clean up old DPD test users
 * Run with: node database/cleanup-old-users.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'checkit.db');
const db = new Database(dbPath);

console.log('🔍 Finding old DPD users...\n');

// Find all DPD users
const users = db.prepare('SELECT * FROM users WHERE role = ?').all('DPD');

console.log(`Found ${users.length} DPD user(s):\n`);

users.forEach((user, index) => {
  console.log(`${index + 1}. ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Company: ${user.company || '(none)'}`);
  console.log(`   IP Restrictions: ${user.ip_restrictions || '(none)'}`);
  console.log(`   URL Restriction Mode: ${user.url_restriction_mode}`);
  console.log(`   Allowed URLs: ${user.allowed_urls || '(none)'}`);
  console.log(`   Created: ${user.created_at}`);
  console.log('');
});

// Option to delete specific users
if (process.argv[2] === 'delete' && process.argv[3]) {
  const userIdToDelete = parseInt(process.argv[3]);
  const user = users.find(u => u.id === userIdToDelete);
  
  if (!user) {
    console.log(`❌ User ID ${userIdToDelete} not found!`);
    process.exit(1);
  }
  
  console.log(`🗑️  Deleting user: ${user.username} (ID: ${user.id})...`);
  
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(userIdToDelete);
  
  if (result.changes > 0) {
    console.log(`✅ User deleted successfully!`);
  } else {
    console.log(`❌ Failed to delete user!`);
  }
} else if (process.argv[2] === 'delete-all-dpd') {
  console.log('⚠️  Are you sure you want to delete ALL DPD users?');
  console.log('   This will delete all users with role=DPD');
  console.log('   Run: node database/cleanup-old-users.js delete-all-dpd confirm');
  
  if (process.argv[3] === 'confirm') {
    const result = db.prepare('DELETE FROM users WHERE role = ?').run('DPD');
    console.log(`✅ Deleted ${result.changes} DPD user(s)`);
  }
} else {
  console.log('📝 Usage:');
  console.log('  List all DPD users:');
  console.log('    node database/cleanup-old-users.js');
  console.log('');
  console.log('  Delete specific user by ID:');
  console.log('    node database/cleanup-old-users.js delete <user_id>');
  console.log('');
  console.log('  Delete ALL DPD users:');
  console.log('    node database/cleanup-old-users.js delete-all-dpd confirm');
}

db.close();


