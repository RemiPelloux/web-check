/**
 * Migration: Delete dpd@example.mc test account
 * 
 * Safely removes the test account and all related records
 * (audit_log, scan_history) to maintain referential integrity.
 */

export const version = '006_delete_example_user';
export const description = 'Delete dpd@example.mc test account and related records';

export function up(db) {
  const username = 'dpd@example.mc';
  
  // Find the user
  const user = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get(username);
  
  if (!user) {
    console.log(`  ℹ User ${username} not found, skipping`);
    return;
  }
  
  console.log(`  → Found user: ${user.username} (ID: ${user.id}, Role: ${user.role})`);
  
  // Delete related records first (foreign key constraints)
  const auditDeleted = db.prepare('DELETE FROM audit_log WHERE user_id = ?').run(user.id);
  console.log(`  ✓ Deleted ${auditDeleted.changes} audit_log records`);
  
  const scanDeleted = db.prepare('DELETE FROM scan_history WHERE user_id = ?').run(user.id);
  console.log(`  ✓ Deleted ${scanDeleted.changes} scan_history records`);
  
  // Delete the user
  const userDeleted = db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  console.log(`  ✓ Deleted user ${username} (${userDeleted.changes} record)`);
}

export function down(db) {
  // Cannot restore deleted user - this is a one-way migration
  console.log('  ℹ Down migration: Cannot restore deleted user');
}


