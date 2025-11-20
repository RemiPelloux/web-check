import axios from 'axios';
import middleware from './_common/middleware.js';

/**
 * Exposed Files Scanner
 * Checks for common sensitive files that should not be publicly accessible.
 */

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const results = await scanExposedFiles(url);
    return results;
  } catch (error) {
    console.error('Exposed files scan error:', error);
    return {
      error: `Failed to scan for exposed files: ${error.message}`,
      statusCode: 500
    };
  }
};

const SENSITIVE_FILES = [
  // Environment & Config
  '.env',
  '.env.local',
  '.env.production',
  'config.json',
  'config.php',
  'wp-config.php',
  'wp-config.php.bak',
  'configuration.php',
  'LocalSettings.php',

  // Version Control
  '.git/HEAD',
  '.git/config',
  '.gitignore',
  '.svn/entries',
  '.hg/requires',

  // Backups & Dumps
  'backup.sql',
  'database.sql',
  'dump.sql',
  'users.sql',
  'backup.zip',
  'backup.tar.gz',
  'www.zip',

  // System & Logs
  '.DS_Store',
  'error_log',
  'access_log',
  'php_errors.log',
  'debug.log',

  // Keys & Secrets
  'id_rsa',
  'id_rsa.pub',
  'id_dsa',
  'key.pem',
  'cert.pem'
];

async function scanExposedFiles(baseUrl) {
  const results = {
    url: baseUrl,
    timestamp: new Date().toISOString(),
    exposedFiles: [],
    scannedCount: 0,
    score: 100
  };

  // Ensure trailing slash for base URL construction
  const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Limit concurrency to avoid triggering WAFs too aggressively
  const batchSize = 5;

  for (let i = 0; i < SENSITIVE_FILES.length; i += batchSize) {
    const batch = SENSITIVE_FILES.slice(i, i + batchSize);

    await Promise.all(batch.map(async (file) => {
      const fileUrl = formattedBaseUrl + file;
      try {
        const response = await axios.get(fileUrl, {
          timeout: 5000,
          validateStatus: (status) => status === 200, // Only care if it returns 200 OK
          maxContentLength: 100000, // Don't download huge files
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebCheck/1.0; +https://web-check.xyz)'
          }
        });

        const data = response.data.toString();

        // 1. Check for generic false positives (WAF block pages, soft 404s)
        const FALSE_POSITIVE_SIGNATURES = [
          'Navigation bloquée',
          'blocked for security reasons',
          'Access Denied',
          'Error 404',
          'Page Not Found',
          '404 Not Found',
          'not found',
          'cannot be found',
          'Request rejected',
          'Security Incident Detected',
          'Cloudflare', // Often in WAF challenges
          'Sucuri', // WAF
          'Incapsula', // WAF
          'Mod_Security',
          '<!DOCTYPE html>', // Most sensitive files (env, sql, git) are NOT full HTML pages
          '<html',
          '<body'
        ];

        // If the response contains any of these signatures, it's likely a false positive
        // UNLESS it's a file type that IS expected to be HTML (like some logs viewed in browser, though rare)
        // But for .env, .git, .sql, .php.bak, we definitely don't expect a full HTML page structure
        if (FALSE_POSITIVE_SIGNATURES.some(sig => data.includes(sig) || data.toLowerCase().includes(sig.toLowerCase()))) {
          // Special case: Some config files might be rendered as text but contain HTML-like error if misconfigured
          // But generally, if we see "Navigation bloquée", it's a pass.
          return;
        }

        // 2. Specific Content Validation

        // .git/HEAD must contain "ref:"
        if (file === '.git/HEAD' && !data.includes('ref:')) return;

        // .env files must contain key=value pairs
        if (file.includes('.env') && !data.includes('=')) return;

        // SQL files must contain SQL keywords
        if (file.endsWith('.sql') && !/CREATE|INSERT|TABLE|DROP|SELECT/i.test(data)) return;

        // PHP backup files (source code) should start with <?php or contain PHP tokens
        if ((file.endsWith('.php') || file.endsWith('.php.bak')) && !data.includes('<?php')) {
          // It might be a config file that doesn't print output (blank page), which is NOT an exposure
          // We are looking for SOURCE CODE exposure.
          // If we get a 200 OK for config.php but it's empty, that's normal behavior (script executed).
          // We only care if we see the actual code.
          return;
        }

        // Logs usually have timestamps
        if (file.endsWith('.log') && !/\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}/.test(data)) return;

        // ID_RSA must have the header
        if (file.includes('id_rsa') && !data.includes('BEGIN RSA PRIVATE KEY')) return;

        results.exposedFiles.push({
          file: file,
          url: fileUrl,
          severity: getSeverity(file),
          type: getFileType(file)
        });

      } catch (error) {
        // 404s and other errors are good, we ignore them
      }
    }));

    results.scannedCount += batch.length;
  }

  // Calculate score
  if (results.exposedFiles.length > 0) {
    const criticalCount = results.exposedFiles.filter(f => f.severity === 'Critical').length;
    const highCount = results.exposedFiles.filter(f => f.severity === 'High').length;
    const mediumCount = results.exposedFiles.filter(f => f.severity === 'Medium').length;

    results.score = Math.max(0, 100 - (criticalCount * 40) - (highCount * 20) - (mediumCount * 10));
  }

  return results;
}

function getSeverity(file) {
  if (file.includes('.env') || file.includes('config') || file.includes('id_rsa') || file.includes('shadow')) return 'Critical';
  if (file.includes('.git') || file.includes('.sql') || file.includes('backup')) return 'High';
  if (file.includes('.DS_Store') || file.includes('log')) return 'Medium';
  return 'Low';
}

function getFileType(file) {
  if (file.startsWith('.')) return 'Config/System';
  if (file.endsWith('.sql')) return 'Database';
  if (file.endsWith('.log')) return 'Log';
  if (file.endsWith('.php')) return 'Code';
  return 'Other';
}

export default middleware(handler);
export { handler };
