import axios from 'axios';
import middleware from './_common/middleware.js';

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const vulnerabilities = await scanVulnerabilities(url);
    return vulnerabilities;
  } catch (error) {
    console.error('Vulnerability scan error:', error);
    return { 
      error: `Failed to scan vulnerabilities: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function scanVulnerabilities(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    vulnerabilities: [],
    securityScore: 100,
    riskLevel: 'Low',
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    }
  };

  // Run vulnerability checks in parallel
  await Promise.all([
    checkCommonVulnerabilities(url, results),
    checkOutdatedSoftware(url, results),
    checkWeakConfigurations(url, results),
    checkInformationDisclosure(url, results)
  ]);

  // Calculate overall security score
  calculateSecurityScore(results);

  return results;
}

async function checkCommonVulnerabilities(url, results) {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true // Accept all status codes
    });

    const headers = response.headers;
    const body = response.data;

    // Check for common vulnerabilities
    const vulnerabilities = [];

    // 1. Missing security headers
    if (!headers['x-frame-options']) {
      vulnerabilities.push({
        type: 'missing_security_header',
        severity: 'medium',
        title: 'Missing X-Frame-Options Header',
        description: 'Site vulnerable to clickjacking attacks',
        recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN header',
        cve: null,
        impact: 'Clickjacking attacks possible'
      });
    }

    if (!headers['x-content-type-options']) {
      vulnerabilities.push({
        type: 'missing_security_header',
        severity: 'low',
        title: 'Missing X-Content-Type-Options',
        description: 'MIME type sniffing possible',
        recommendation: 'Add X-Content-Type-Options: nosniff header',
        cve: null,
        impact: 'MIME confusion attacks'
      });
    }

    if (!headers['strict-transport-security'] && url.startsWith('https://')) {
      vulnerabilities.push({
        type: 'missing_hsts',
        severity: 'medium',
        title: 'Missing HSTS Header',
        description: 'HTTPS connections not enforced',
        recommendation: 'Add Strict-Transport-Security header',
        cve: null,
        impact: 'Man-in-the-middle attacks via HTTP downgrade'
      });
    }

    // 2. Information disclosure (only if actually revealing sensitive info)
    if (headers['server']) {
      const server = headers['server'].toLowerCase();
      // Only flag if it reveals specific version numbers
      const versionRegex = /(\d+\.\d+\.\d+)/;
      if (versionRegex.test(server)) {
        vulnerabilities.push({
          type: 'information_disclosure',
          severity: 'low',
          title: 'Server Version Disclosure',
          description: `Server reveals version: ${headers['server']}`,
          recommendation: 'Hide server version in HTTP headers',
          cve: null,
          impact: 'Information gathering for targeted attacks'
        });
      }
    }

    if (headers['x-powered-by']) {
      vulnerabilities.push({
        type: 'information_disclosure',
        severity: 'low',
        title: 'Technology Stack Disclosure',
        description: `Technology revealed: ${headers['x-powered-by']}`,
        recommendation: 'Remove X-Powered-By header',
        cve: null,
        impact: 'Technology stack enumeration'
      });
    }

    // 3. Content Security Policy issues
    if (headers['content-security-policy']) {
      const csp = headers['content-security-policy'];
      if (csp.includes('unsafe-inline') || csp.includes('unsafe-eval')) {
        vulnerabilities.push({
          type: 'weak_csp',
          severity: 'high',
          title: 'Weak Content Security Policy',
          description: 'CSP allows unsafe-inline or unsafe-eval',
          recommendation: 'Remove unsafe directives from CSP',
          cve: null,
          impact: 'XSS attacks not prevented by CSP'
        });
      }
    } else {
      vulnerabilities.push({
        type: 'missing_csp',
        severity: 'medium',
        title: 'Missing Content Security Policy',
        description: 'No CSP header found',
        recommendation: 'Implement Content Security Policy',
        cve: null,
        impact: 'XSS and code injection attacks'
      });
    }

    // 4. Check for common vulnerable patterns in HTML
    if (typeof body === 'string') {
      // Check for jQuery versions (common vulnerability source)
      const jqueryMatch = body.match(/jquery[/-](\d+\.\d+\.\d+)/i);
      if (jqueryMatch) {
        const version = jqueryMatch[1];
        if (compareVersions(version, '3.5.0') < 0) {
          vulnerabilities.push({
            type: 'outdated_library',
            severity: 'medium',
            title: 'Outdated jQuery Version',
            description: `jQuery ${version} has known vulnerabilities`,
            recommendation: 'Update jQuery to latest version (3.6.0+)',
            cve: 'CVE-2020-11022, CVE-2020-11023',
            impact: 'XSS vulnerabilities in jQuery'
          });
        }
      }

      // Check for admin/debug pages exposure (only if actually phpinfo content)
      if (body.includes('phpinfo()') && body.includes('PHP Version') && body.includes('System')) {
        vulnerabilities.push({
          type: 'information_disclosure',
          severity: 'high',
          title: 'PHP Info Page Exposed',
          description: 'phpinfo() output accessible',
          recommendation: 'Remove or restrict access to phpinfo pages',
          cve: null,
          impact: 'Complete server configuration disclosure'
        });
      }
    }

    results.vulnerabilities.push(...vulnerabilities);

  } catch (error) {
    console.error('Common vulnerability check failed:', error);
  }
}

async function checkOutdatedSoftware(url, results) {
  try {
    // Since we removed tech-stack API dependency, we'll check for common patterns in HTML
    const response = await axios.get(url, { 
      timeout: 10000,
      validateStatus: () => true
    });

    if (typeof response.data === 'string') {
      const vulnerabilities = [];
      const html = response.data;

      // Check for WordPress version in HTML
      const wpVersionMatch = html.match(/wp-(?:content|includes)\/[^"']*\/(\d+\.\d+(?:\.\d+)?)/i);
      if (wpVersionMatch) {
        const version = wpVersionMatch[1];
        if (compareVersions(version, '6.0') < 0) {
          vulnerabilities.push({
            type: 'outdated_cms',
            severity: 'high',
            title: 'Outdated WordPress Version',
            description: `WordPress ${version} detected with security vulnerabilities`,
            recommendation: 'Update WordPress to latest version',
            cve: 'Multiple CVEs',
            impact: 'Remote code execution, privilege escalation'
          });
        }
      }

      // Check for common JavaScript libraries
      const angularMatch = html.match(/angular(?:\.min)?\.js[^"']*\/(\d+\.\d+\.\d+)/i);
      if (angularMatch) {
        const version = angularMatch[1];
        if (compareVersions(version, '1.8.0') < 0) {
          vulnerabilities.push({
            type: 'outdated_library',
            severity: 'medium',
            title: 'Outdated AngularJS Version',
            description: `AngularJS ${version} has known vulnerabilities`,
            recommendation: 'Update AngularJS or migrate to Angular',
            cve: 'Multiple CVEs',
            impact: 'XSS and injection vulnerabilities'
          });
        }
      }

      results.vulnerabilities.push(...vulnerabilities);
    }
  } catch (error) {
    console.error('Outdated software check failed:', error);
  }
}

async function checkWeakConfigurations(url, results) {
  try {
    const vulnerabilities = [];

    // Check for HTTP vs HTTPS
    if (url.startsWith('http://')) {
      vulnerabilities.push({
        type: 'weak_encryption',
        severity: 'high',
        title: 'Unencrypted HTTP Connection',
        description: 'Site accessible over unencrypted HTTP',
        recommendation: 'Implement HTTPS with valid SSL certificate',
        cve: null,
        impact: 'Data interception and man-in-the-middle attacks'
      });
    }

    // Check for mixed content (if HTTPS site loads HTTP resources)
    if (url.startsWith('https://')) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        if (typeof response.data === 'string') {
          const httpResourcesMatch = response.data.match(/src=["']http:\/\/[^"']+/gi);
          if (httpResourcesMatch && httpResourcesMatch.length > 0) {
            vulnerabilities.push({
              type: 'mixed_content',
              severity: 'medium',
              title: 'Mixed Content Detected',
              description: 'HTTPS page loads HTTP resources',
              recommendation: 'Update all resources to use HTTPS',
              cve: null,
              impact: 'Partial encryption bypass'
            });
          }
        }
      } catch (error) {
        // Ignore errors for this check
      }
    }

    results.vulnerabilities.push(...vulnerabilities);

  } catch (error) {
    console.error('Weak configuration check failed:', error);
  }
}

async function checkInformationDisclosure(url, results) {
  try {
    const vulnerabilities = [];
    const domain = new URL(url).origin;

    // Check for common sensitive files - but validate content to avoid false positives
    const sensitiveFiles = [
      { path: '/.env', severity: 'critical', keywords: ['DB_PASSWORD', 'API_KEY', 'SECRET'] },
      { path: '/config.php', severity: 'high', keywords: ['<?php', 'password', 'database'] },
      { path: '/wp-config.php', severity: 'critical', keywords: ['DB_PASSWORD', 'DB_USER', 'AUTH_KEY'] },
      { path: '/.git/config', severity: 'high', keywords: ['[core]', 'repositoryformatversion'] },
      { path: '/robots.txt', severity: 'info', keywords: ['Disallow:', 'User-agent:'] }
    ];

    const fileChecks = sensitiveFiles.map(async (file) => {
      try {
        const response = await axios.get(domain + file.path, { 
          timeout: 5000,
          validateStatus: (status) => status === 200, // Only check 200 responses
          maxContentLength: 10000 // Limit content size
        });

        if (response.status === 200 && response.data) {
          const content = response.data.toString().toLowerCase();
          
          // Validate that this is actually the expected file type
          const hasExpectedContent = file.keywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );

          // Additional check for config.php - avoid false positives from security pages
          if (file.path === '/config.php') {
            // Check if it's actually a security block page
            if (content.includes('navigation bloquée') || 
                content.includes('blocked') || 
                content.includes('sécurité') ||
                content.includes('security') ||
                content.includes('access denied')) {
              return; // Skip this as it's a security page, not actual config
            }
          }

          if (hasExpectedContent) {
            let impact = 'Information disclosure';
            if (file.path.includes('.env') || file.path.includes('config')) {
              impact = 'Database credentials and secrets exposed';
            } else if (file.path.includes('.git')) {
              impact = 'Source code and development history exposed';
            }

            vulnerabilities.push({
              type: 'sensitive_file_exposure',
              severity: file.severity,
              title: `Sensitive File Exposed: ${file.path}`,
              description: `File ${file.path} is publicly accessible`,
              recommendation: `Restrict access to ${file.path} or remove it`,
              cve: null,
              impact
            });
          }
        }
      } catch (error) {
        // File not found or error - this is good for security
      }
    });

    await Promise.all(fileChecks);
    results.vulnerabilities.push(...vulnerabilities);

  } catch (error) {
    console.error('Information disclosure check failed:', error);
  }
}

function calculateSecurityScore(results) {
  let score = 100;
  let critical = 0, high = 0, medium = 0, low = 0, info = 0;

  results.vulnerabilities.forEach(vuln => {
    switch (vuln.severity) {
      case 'critical':
        score -= 25;
        critical++;
        break;
      case 'high':
        score -= 15;
        high++;
        break;
      case 'medium':
        score -= 8;
        medium++;
        break;
      case 'low':
        score -= 3;
        low++;
        break;
      case 'info':
        score -= 1;
        info++;
        break;
    }
  });

  results.securityScore = Math.max(0, score);
  results.summary = { critical, high, medium, low, info };

  // Determine risk level
  if (critical > 0) {
    results.riskLevel = 'Critical';
  } else if (high > 0) {
    results.riskLevel = 'High';
  } else if (medium > 2) {
    results.riskLevel = 'Medium';
  } else if (medium > 0 || low > 3) {
    results.riskLevel = 'Low';
  } else {
    results.riskLevel = 'Minimal';
  }
}

// Helper function to compare version numbers
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

export default middleware(handler);