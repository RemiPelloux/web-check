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

    // 2. Information disclosure
    if (headers['server']) {
      const server = headers['server'].toLowerCase();
      if (server.includes('apache/') || server.includes('nginx/') || server.includes('iis/')) {
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

      // Check for admin/debug pages exposure
      if (body.includes('phpinfo()') || body.includes('PHP Version')) {
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
    // Get tech stack info to check for outdated software
    const response = await axios.get(`http://localhost:3001/api/tech-stack?url=${encodeURIComponent(url)}`);
    const techData = response.data;

    if (techData && techData.technologies) {
      const vulnerabilities = [];

      techData.technologies.forEach(tech => {
        const name = tech.name.toLowerCase();
        const version = tech.version;

        // Check for known outdated software
        if (name.includes('wordpress') && version) {
          if (compareVersions(version, '6.0') < 0) {
            vulnerabilities.push({
              type: 'outdated_cms',
              severity: 'high',
              title: 'Outdated WordPress Version',
              description: `WordPress ${version} has security vulnerabilities`,
              recommendation: 'Update WordPress to latest version',
              cve: 'Multiple CVEs',
              impact: 'Remote code execution, privilege escalation'
            });
          }
        }

        if (name.includes('drupal') && version) {
          if (compareVersions(version, '9.0') < 0) {
            vulnerabilities.push({
              type: 'outdated_cms',
              severity: 'high',
              title: 'Outdated Drupal Version',
              description: `Drupal ${version} may have vulnerabilities`,
              recommendation: 'Update Drupal to supported version',
              cve: 'Multiple CVEs',
              impact: 'Various security vulnerabilities'
            });
          }
        }

        if (name.includes('apache') && version) {
          if (compareVersions(version, '2.4.50') < 0) {
            vulnerabilities.push({
              type: 'outdated_server',
              severity: 'medium',
              title: 'Outdated Apache Version',
              description: `Apache ${version} may have vulnerabilities`,
              recommendation: 'Update Apache to latest stable version',
              cve: 'Multiple CVEs',
              impact: 'Various server vulnerabilities'
            });
          }
        }
      });

      results.vulnerabilities.push(...vulnerabilities);
    }
  } catch (error) {
    console.error('Outdated software check failed:', error);
  }
}

async function checkWeakConfigurations(url, results) {
  try {
    const vulnerabilities = [];

    // Check SSL/TLS configuration
    const sslResponse = await axios.get(`http://localhost:3001/api/ssl?url=${encodeURIComponent(url)}`);
    const sslData = sslResponse.data;

    if (sslData && !sslData.error) {
      // Check for weak SSL configurations
      if (sslData.protocol && sslData.protocol.includes('TLSv1.0')) {
        vulnerabilities.push({
          type: 'weak_ssl',
          severity: 'medium',
          title: 'Weak TLS Protocol',
          description: 'TLS 1.0 is deprecated and vulnerable',
          recommendation: 'Disable TLS 1.0 and 1.1, use TLS 1.2+',
          cve: 'CVE-2014-3566 (POODLE)',
          impact: 'Man-in-the-middle attacks'
        });
      }

      if (sslData.cipher && (sslData.cipher.includes('RC4') || sslData.cipher.includes('DES'))) {
        vulnerabilities.push({
          type: 'weak_cipher',
          severity: 'high',
          title: 'Weak Cipher Suite',
          description: 'Weak encryption ciphers detected',
          recommendation: 'Use strong cipher suites (AES-256, ChaCha20)',
          cve: 'Multiple cipher-related CVEs',
          impact: 'Encryption can be broken'
        });
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

    // Check for common sensitive files
    const sensitiveFiles = [
      '/.env',
      '/config.php',
      '/wp-config.php',
      '/.git/config',
      '/admin',
      '/phpmyadmin',
      '/robots.txt'
    ];

    const fileChecks = sensitiveFiles.map(async (file) => {
      try {
        const response = await axios.get(domain + file, { 
          timeout: 5000,
          validateStatus: (status) => status < 500 // Check for 200-499 responses
        });

        if (response.status === 200) {
          let severity = 'medium';
          let impact = 'Information disclosure';

          if (file.includes('.env') || file.includes('config')) {
            severity = 'critical';
            impact = 'Database credentials and secrets exposed';
          } else if (file.includes('.git')) {
            severity = 'high';
            impact = 'Source code and development history exposed';
          } else if (file.includes('admin') || file.includes('phpmyadmin')) {
            severity = 'high';
            impact = 'Administrative interface accessible';
          }

          vulnerabilities.push({
            type: 'sensitive_file_exposure',
            severity,
            title: `Sensitive File Exposed: ${file}`,
            description: `File ${file} is publicly accessible`,
            recommendation: `Restrict access to ${file} or remove it`,
            cve: null,
            impact
          });
        }
      } catch (error) {
        // File not found or error - this is good
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
