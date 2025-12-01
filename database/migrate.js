#!/usr/bin/env node
/**
 * APDP Checkit - Database Migration System
 * 
 * Similar to Symfony/Doctrine migrations:
 * - Tracks executed migrations in a `migrations` table
 * - Only runs new migrations
 * - Supports rollback (down) migrations
 * - Migrations are versioned with timestamps
 * 
 * Usage:
 *   node database/migrate.js              # Run pending migrations
 *   node database/migrate.js --status     # Show migration status
 *   node database/migrate.js --seed       # Run migrations + seed wiki
 *   node database/migrate.js --force      # Force re-run all migrations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const showStatus = args.includes('--status');
const seedWiki = args.includes('--seed');
const forceAll = args.includes('--force');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`)
};

/**
 * Initialize database connection
 */
async function getDatabase() {
  const { db, initDatabase } = await import('./db.js');
  
  // Ensure migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      description TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(version);
  `);
  
  return db;
}

/**
 * Get list of executed migrations from database
 */
function getExecutedMigrations(db) {
  const stmt = db.prepare('SELECT version FROM migrations ORDER BY version');
  return stmt.all().map(row => row.version);
}

/**
 * Record a migration as executed
 */
function recordMigration(db, version, description, executionTimeMs) {
  const stmt = db.prepare(`
    INSERT INTO migrations (version, description, execution_time_ms)
    VALUES (?, ?, ?)
  `);
  stmt.run(version, description, executionTimeMs);
}

/**
 * Remove a migration record (for rollback)
 */
function removeMigration(db, version) {
  const stmt = db.prepare('DELETE FROM migrations WHERE version = ?');
  stmt.run(version);
}

/**
 * Get all migration files from the migrations directory
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // Ensures chronological order if using timestamp prefixes
}

/**
 * Load and execute a migration
 */
async function runMigration(db, filename) {
  const migrationPath = path.join(__dirname, 'migrations', filename);
  const startTime = Date.now();
  
  try {
    const migration = await import(migrationPath);
    
    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${filename} does not export an 'up' function`);
    }
    
    // Run the migration
    await migration.up(db);
    
    const executionTime = Date.now() - startTime;
    const description = migration.description || filename;
    
    // Record successful migration
    recordMigration(db, filename, description, executionTime);
    
    return { success: true, time: executionTime, description };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Show migration status
 */
async function showMigrationStatus(db) {
  const executedMigrations = getExecutedMigrations(db);
  const allMigrations = getMigrationFiles();
  
  console.log('\n📋 Migration Status\n');
  console.log('─'.repeat(60));
  
  if (allMigrations.length === 0) {
    log.info('No migration files found');
    return;
  }
  
  for (const migration of allMigrations) {
    const isExecuted = executedMigrations.includes(migration);
    const status = isExecuted ? `${colors.green}✓ Executed${colors.reset}` : `${colors.yellow}○ Pending${colors.reset}`;
    console.log(`  ${status}  ${migration}`);
  }
  
  console.log('─'.repeat(60));
  
  const pendingCount = allMigrations.length - executedMigrations.length;
  if (pendingCount > 0) {
    log.warning(`${pendingCount} migration(s) pending`);
  } else {
    log.success('All migrations are up to date');
  }
  
  console.log('');
}

/**
 * Run pending migrations
 */
async function runPendingMigrations(db) {
  const executedMigrations = forceAll ? [] : getExecutedMigrations(db);
  const allMigrations = getMigrationFiles();
  const pendingMigrations = allMigrations.filter(m => !executedMigrations.includes(m));
  
  if (pendingMigrations.length === 0) {
    log.success('No pending migrations');
    return true;
  }
  
  console.log(`\n🚀 Running ${pendingMigrations.length} migration(s)...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const migration of pendingMigrations) {
    process.stdout.write(`  Running: ${migration}... `);
    
    const result = await runMigration(db, migration);
    
    if (result.success) {
      console.log(`${colors.green}OK${colors.reset} (${result.time}ms)`);
      successCount++;
    } else {
      console.log(`${colors.red}FAILED${colors.reset}`);
      log.error(`  Error: ${result.error}`);
      failCount++;
      // Continue with other migrations instead of stopping
    }
  }
  
  console.log('');
  
  if (failCount === 0) {
    log.success(`All ${successCount} migration(s) completed successfully`);
  } else {
    log.warning(`${successCount} succeeded, ${failCount} failed`);
  }
  
  return failCount === 0;
}

/**
 * Seed wiki content
 */
async function seedWikiContent() {
  console.log('\n🌱 Seeding wiki content...\n');
  
  try {
    // Dynamically import and run the seed script
    const seedPath = path.join(__dirname, 'seed-wiki.js');
    
    if (!fs.existsSync(seedPath)) {
      log.warning('seed-wiki.js not found, skipping wiki seeding');
      return;
    }
    
    // Use child process to run seed script
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [seedPath], {
        stdio: 'inherit',
        cwd: path.dirname(seedPath)
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Seed script exited with code ${code}`));
        }
      });
    });
  } catch (error) {
    log.error(`Wiki seeding failed: ${error.message}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     APDP Checkit - Database Migrations     ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  try {
    const db = await getDatabase();
    
    if (showStatus) {
      await showMigrationStatus(db);
      return;
    }
    
    if (forceAll) {
      log.warning('Force mode: will re-run all migrations');
      // Clear migrations table
      db.exec('DELETE FROM migrations');
    }
    
    const success = await runPendingMigrations(db);
    
    if (seedWiki) {
      await seedWikiContent();
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();

