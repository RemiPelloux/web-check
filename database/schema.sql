-- APDP Checkit User Management Database Schema

-- Migrations tracking table: tracks which migrations have been executed (like Symfony Doctrine)
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,        -- Migration filename/version (e.g., '20241201_001_add_wiki_tables')
    description TEXT,                     -- Human-readable description
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER DEFAULT 0   -- How long the migration took
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(version);

-- Users table: stores authentication and profile information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('APDP', 'DPD')),
    company TEXT, -- Company name (for DPD users, displayed instead of username)
    ip_restrictions TEXT, -- Comma-separated IP addresses (empty = no restrictions)
    url_restriction_mode TEXT DEFAULT 'ALL' CHECK(url_restriction_mode IN ('ALL', 'RESTRICTED')), -- ALL = any URL, RESTRICTED = specific URLs only
    allowed_urls TEXT, -- Comma-separated URLs that DPD user can scan (only used when url_restriction_mode = 'RESTRICTED')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Disabled plugins table: stores which plugins are globally disabled for DPD users
CREATE TABLE IF NOT EXISTS disabled_plugins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plugin_name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table: tracks all admin actions for security
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Login attempts table: tracks failed login attempts for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    success INTEGER DEFAULT 0, -- 0 = failed, 1 = success
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scan history table: detailed audit trail of all scans
CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    scanned_url TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    scan_results_summary TEXT, -- JSON string with summary data
    critical_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    improvement_count INTEGER DEFAULT 0,
    numeric_score INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Scan statistics table: anonymous aggregated data for charts
CREATE TABLE IF NOT EXISTS scan_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- Date in YYYY-MM-DD format for aggregation
    user_role TEXT NOT NULL CHECK(user_role IN ('APDP', 'DPD')),
    total_scans INTEGER DEFAULT 0,
    total_critical INTEGER DEFAULT 0,
    total_warnings INTEGER DEFAULT 0,
    total_improvements INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, user_role) -- One row per date per role
);

-- Wiki sections table: stores static sections (Introduction, FAQ, Best Practices, etc.)
CREATE TABLE IF NOT EXISTS wiki_sections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    order_index INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wiki plugin documentation table: stores documentation for each plugin
CREATE TABLE IF NOT EXISTS wiki_plugin_docs (
    plugin_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    use_case TEXT DEFAULT '',
    resources TEXT DEFAULT '[]',
    screenshot_url TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_date ON scan_statistics(date);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_role ON scan_statistics(user_role);
CREATE INDEX IF NOT EXISTS idx_wiki_sections_order ON wiki_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_wiki_sections_visible ON wiki_sections(is_visible);
CREATE INDEX IF NOT EXISTS idx_wiki_plugin_docs_plugin ON wiki_plugin_docs(plugin_id);

