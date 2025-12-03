/**
 * Migration: Add scan tracking and company column
 * 
 * Adds:
 * - company column to users table
 * - scan_history table for detailed scan audit trail
 * - scan_statistics table for aggregated analytics
 */

export const description = 'Add scan tracking tables and company column';

export async function up(db) {
  // Check if company column already exists
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  const hasCompanyColumn = tableInfo.some(col => col.name === 'company');
  
  if (!hasCompanyColumn) {
    // Add company column to users
    db.exec(`ALTER TABLE users ADD COLUMN company TEXT`);
  }
  
  // Create scan_history table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scanned_url TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      scan_results_summary TEXT,
      critical_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      improvement_count INTEGER DEFAULT 0,
      numeric_score INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Create scan_statistics table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS scan_statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      user_role TEXT NOT NULL CHECK(user_role IN ('APDP', 'DPD')),
      total_scans INTEGER DEFAULT 0,
      total_critical INTEGER DEFAULT 0,
      total_warnings INTEGER DEFAULT 0,
      total_improvements INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, user_role)
    )
  `);
  
  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scan_statistics_date ON scan_statistics(date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scan_statistics_role ON scan_statistics(user_role)`);
}

export async function down(db) {
  // Rollback - remove added tables and column
  // Note: SQLite doesn't support DROP COLUMN easily
  db.exec(`DROP TABLE IF EXISTS scan_statistics`);
  db.exec(`DROP TABLE IF EXISTS scan_history`);
  // Cannot easily remove company column from users in SQLite
}





