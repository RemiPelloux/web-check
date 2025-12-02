/**
 * Migration: Add Wiki CMS tables
 * 
 * Adds:
 * - wiki_sections: Static sections (Introduction, FAQ, etc.)
 * - wiki_plugin_docs: Documentation for each plugin
 */

export const description = 'Add Wiki CMS tables for editable documentation';

export async function up(db) {
  // Create wiki_sections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wiki_sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      order_index INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create wiki_plugin_docs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wiki_plugin_docs (
      plugin_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      use_case TEXT DEFAULT '',
      resources TEXT DEFAULT '[]',
      screenshot_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wiki_sections_order ON wiki_sections(order_index)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wiki_sections_visible ON wiki_sections(is_visible)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wiki_plugin_docs_plugin ON wiki_plugin_docs(plugin_id)`);
}

export async function down(db) {
  db.exec(`DROP TABLE IF EXISTS wiki_plugin_docs`);
  db.exec(`DROP TABLE IF EXISTS wiki_sections`);
}



