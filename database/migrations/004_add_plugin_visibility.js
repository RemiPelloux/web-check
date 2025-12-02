/**
 * Migration: Add is_visible column to wiki_plugin_docs table
 * 
 * This allows admins to hide specific plugin documentation from DPD users
 * in the wiki, independent of whether the plugin itself is disabled.
 */

export const version = '004_add_plugin_visibility';
export const description = 'Add is_visible column to wiki_plugin_docs for hiding plugin documentation';

export function up(db) {
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(wiki_plugin_docs)").all();
  const hasColumn = tableInfo.some(col => col.name === 'is_visible');
  
  if (!hasColumn) {
    db.exec(`
      ALTER TABLE wiki_plugin_docs ADD COLUMN is_visible INTEGER DEFAULT 1;
    `);
    
    // Create index for faster filtering
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_wiki_plugin_docs_visible ON wiki_plugin_docs(is_visible);
    `);
    
    console.log('  ✓ Added is_visible column to wiki_plugin_docs');
  } else {
    console.log('  ℹ is_visible column already exists');
  }
}

export function down(db) {
  // SQLite doesn't support DROP COLUMN directly in older versions
  // For safety, we don't remove the column in down migration
  console.log('  ℹ Down migration: Column not removed (SQLite limitation)');
}

