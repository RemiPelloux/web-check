-- Migration: Add scan tracking and company field
-- Date: 2025-01-21
-- Description: Adds scan_history, scan_statistics tables and company field to users table

-- Add company field to users table
ALTER TABLE users ADD COLUMN company TEXT;

-- Create scan history table
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
);

-- Create scan statistics table
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_date ON scan_statistics(date);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_role ON scan_statistics(user_role);




