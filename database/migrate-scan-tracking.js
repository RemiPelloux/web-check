import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'checkit.db');
const MIGRATION_SQL = join(__dirname, 'migrations', 'add-scan-tracking.sql');

console.log('🔄 Running migration: add-scan-tracking');
console.log(`📁 Database: ${DB_PATH}`);
console.log(`📄 SQL file: ${MIGRATION_SQL}`);

try {
  // Check if migration SQL exists
  if (!fs.existsSync(MIGRATION_SQL)) {
    console.error('❌ Migration SQL file not found!');
    process.exit(1);
  }

  // Read the migration SQL
  const sql = fs.readFileSync(MIGRATION_SQL, 'utf8');
  
  // Connect to database
  const db = new Database(DB_PATH);
  
  // Check if migration is needed
  console.log('🔍 Checking if migration is needed...');
  
  try {
    // Try to check if company column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasCompanyColumn = tableInfo.some(col => col.name === 'company');
    
    if (hasCompanyColumn) {
      console.log('✅ Migration already applied (company column exists)');
      db.close();
      process.exit(0);
    }
  } catch (err) {
    // If we can't check, proceed with migration
    console.log('⚠️  Could not verify migration status, proceeding...');
  }
  
  console.log('📝 Applying migration...');
  
  // Split SQL into individual statements and execute
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  db.exec('BEGIN TRANSACTION');
  
  try {
    statements.forEach((statement, index) => {
      if (statement && !statement.startsWith('--')) {
        console.log(`  • Executing statement ${index + 1}/${statements.length}...`);
        db.exec(statement);
      }
    });
    
    db.exec('COMMIT');
    console.log('✅ Migration completed successfully!');
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Tables in database:');
    tables.forEach(table => console.log(`  • ${table.name}`));
    
    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    const hasCompany = userColumns.some(col => col.name === 'company');
    
    if (hasCompany) {
      console.log('✅ Verified: company column added to users table');
    } else {
      console.log('⚠️  Warning: company column not found after migration');
    }
    
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  
  db.close();
  console.log('✅ Database connection closed');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error(error);
  process.exit(1);
}


