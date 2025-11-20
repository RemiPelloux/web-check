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
    },
    technologies: [] // Track detected technologies for context
  };

  // Run vulnerability checks in parallel
  await Promise.all([
    checkSecurityHeaders(url, results),
    checkTechnologySpecifics(url, results),
    checkSensitiveFiles(url, results),
    checkSSLAndConfiguration(url, results)
  ]);

  // Calculate overall security score
  calculateSecurityScore(results);

  return results;
}

async function checkSecurityHeaders(url, results) {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true
    });

    const headers = response.headers;
    const vulnerabilities = [];

    // Security Headers Checklist
    const headerChecks = [
      {
        header: 'x-frame-options',
        missing: {
          type: 'missing_security_header',
          severity: 'medium',
          title: 'Missing X-Frame-Options',
          description: 'Site is vulnerable to clickjacking attacks. This header prevents your site from being embedded in iframes on other sites.',
          recommendation: 'Add "X-Frame-Options: DENY" or "SAMEORIGIN" to your HTTP response headers.',
          effort: 'Low',
          category: 'Headers'
        }
      },
      {
        header: 'x-content-type-options',
        missing: {
          type: 'missing_security_header',
          severity: 'low',
          title: 'Missing X-Content-Type-Options',
          description: 'MIME type sniffing is possible. This header prevents the browser from interpreting files as a different MIME type.',
          recommendation: 'Add "X-Content-Type-Options: nosniff" to your HTTP response headers.',
          effort: 'Low',
          category: 'Headers'
        }
      },
      {
        header: 'strict-transport-security',
        condition: url.startsWith('https://'),
        missing: {
          type: 'missing_hsts',
          severity: 'medium',
          title: 'Missing HSTS Header',
          description: 'HTTP Strict Transport Security (HSTS) is not enabled. This leaves users vulnerable to SSL stripping attacks.',
          recommendation: 'Add "Strict-Transport-Security" header with a long max-age (e.g., max-age=31536000; includeSubDomains).',
          effort: 'Low',
          category: 'Headers'
        }
      },
      {
        header: 'content-security-policy',
        missing: {
          type: 'missing_csp',
          severity: 'medium',
          title: 'Missing Content Security Policy',
          description: 'No Content Security Policy (CSP) detected. CSP is a powerful layer of security that helps detect and mitigate certain types of attacks, including XSS and data injection.',
          recommendation: 'Implement a Content Security Policy header to restrict where resources can be loaded from.',
          effort: 'High',
          category: 'Headers'
        },
        checkValue: (val) => {
          if (val.includes('unsafe-inline') || val.includes('unsafe-eval')) {
            return {
              type: 'weak_csp',
              severity: 'medium',
              title: 'Weak Content Security Policy',
              description: 'CSP includes "unsafe-inline" or "unsafe-eval", which reduces its effectiveness against XSS.',
              recommendation: 'Refactor code to avoid inline scripts and eval(), then remove these directives.',
              effort: 'High',
              category: 'Headers'
            };
          }
          return null;
        }
      },
      {
        header: 'permissions-policy',
        missing: {
          type: 'missing_permissions_policy',
          severity: 'low',
          title: 'Missing Permissions Policy',
          description: 'Permissions Policy (formerly Feature Policy) allows you to control which features and APIs can be used in the browser.',
          recommendation: 'Add a Permissions-Policy header to explicitly disable powerful features you don\'t use (e.g., "camera=(), microphone=(), geolocation=()").',
          effort: 'Medium',
          category: 'Headers'
        }
      },
      {
        header: 'referrer-policy',
        missing: {
          type: 'missing_referrer_policy',
          severity: 'low',
          title: 'Missing Referrer Policy',
          description: 'Referrer Policy controls how much referrer information is sent with requests.',
          recommendation: 'Add "Referrer-Policy: strict-origin-when-cross-origin" (or similar) to protect user privacy.',
          effort: 'Low',
          category: 'Headers'
        }
      }
    ];

    headerChecks.forEach(check => {
      if (check.condition === false) return;
      
      const headerValue = Object.keys(headers).find(h => h.toLowerCase() === check.header);
      
      if (!headerValue) {
        vulnerabilities.push(check.missing);
      } else if (check.checkValue) {
        const issue = check.checkValue(headers[headerValue]);
        if (issue) vulnerabilities.push(issue);
      }
    });

    // Information Disclosure in Headers
    if (headers['server']) {
      results.technologies.push(`Server: ${headers['server']}`);
      vulnerabilities.push({
        type: 'info_disclosure_server',
        severity: 'info',
        title: 'Server Header Disclosure',
        description: `Server header reveals technology: "${headers['server']}"`,
        recommendation: 'Configure your server to suppress the "Server" header or use a generic value.',
        effort: 'Low',
        category: 'Information Disclosure'
      });
    }

    if (headers['x-powered-by']) {
      results.technologies.push(`Powered By: ${headers['x-powered-by']}`);
      vulnerabilities.push({
        type: 'info_disclosure_tech',
        severity: 'low',
        title: 'X-Powered-By Header Disclosure',
        description: `Header reveals technology stack: "${headers['x-powered-by']}"`,
        recommendation: 'Remove the X-Powered-By header from your server configuration.',
        effort: 'Low',
        category: 'Information Disclosure'
      });
    }

    if (headers['x-aspnet-version']) {
      results.technologies.push(`ASP.NET: ${headers['x-aspnet-version']}`);
      vulnerabilities.push({
        type: 'info_disclosure_aspnet',
        severity: 'low',
        title: 'ASP.NET Version Disclosure',
        description: `Header reveals ASP.NET version: "${headers['x-aspnet-version']}"`,
        recommendation: 'Remove X-AspNet-Version header in web.config.',
        effort: 'Low',
        category: 'Information Disclosure'
      });
    }

    results.vulnerabilities.push(...vulnerabilities);

  } catch (error) {
    console.error('Header check failed:', error);
  }
}

async function checkTechnologySpecifics(url, results) {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      validateStatus: () => true
    });

    const html = typeof response.data === 'string' ? response.data : '';
    const vulnerabilities = [];

    // 1. WordPress Detection & Checks
    if (html.includes('wp-content') || html.includes('wp-includes')) {
      results.technologies.push('WordPress');
      
      const wpVersion = html.match(/content="WordPress (\d+\.\d+\.?\d*)"/);
      if (wpVersion) {
        const version = wpVersion[1];
        results.technologies.push(`WordPress ${version}`);
        
        vulnerabilities.push({
          type: 'wp_version_disclosure',
          severity: 'low',
          title: 'WordPress Version Disclosure',
          description: `WordPress version ${version} is visible in the HTML source.`,
          recommendation: 'Remove the generator meta tag to hide your WordPress version.',
          effort: 'Low',
          category: 'Information Disclosure'
        });

        // Simple check for outdated WP (assuming 6.0 as baseline for "modern")
        if (compareVersions(version, '6.0') < 0) {
          vulnerabilities.push({
            type: 'outdated_cms',
            severity: 'high',
            title: 'Outdated WordPress Version',
            description: `You are using WordPress ${version}, which may have known security vulnerabilities.`,
            recommendation: 'Update WordPress to the latest version immediately.',
            effort: 'Medium',
            category: 'Technology'
          });
        }
      }

      // Check for exposed WP API users endpoint
      try {
        const apiResponse = await axios.get(new URL('/wp-json/wp/v2/users', url).toString(), { timeout: 3000, validateStatus: () => true });
        if (apiResponse.status === 200 && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
          vulnerabilities.push({
            type: 'wp_user_enumeration',
            severity: 'medium',
            title: 'WordPress User Enumeration',
            description: 'The WordPress REST API exposes user information (usernames, IDs) publicly.',
            recommendation: 'Disable user enumeration via the REST API or install a security plugin.',
            effort: 'Low',
            category: 'Configuration'
          });
        }
      } catch (e) { /* API check failed/timed out, ignore */ }
    }

    // 2. Modern Framework Detection
    if (html.includes('data-reactroot') || html.includes('_NEXT_DATA_')) {
      results.technologies.push('React/Next.js');
    } else if (html.includes('data-v-') || html.includes('__NUXT__')) {
      results.technologies.push('Vue/Nuxt.js');
    } else if (html.includes('svelte-')) {
      results.technologies.push('Svelte');
    }

    // 3. jQuery Check
    const jqueryMatch = html.match(/jquery[/-](\d+\.\d+\.\d+)/i);
    if (jqueryMatch) {
      const version = jqueryMatch[1];
      results.technologies.push(`jQuery ${version}`);
      if (compareVersions(version, '3.5.0') < 0) {
        vulnerabilities.push({
          type: 'outdated_library',
          severity: 'medium',
          title: 'Outdated jQuery Version',
          description: `jQuery ${version} has known vulnerabilities (XSS).`,
          recommendation: 'Update jQuery to version 3.6.0 or later.',
          effort: 'Low',
          category: 'Technology'
        });
      }
    }

    // 4. PHP Info exposure (aggressive check via pattern matching)
    if (html.includes('phpinfo()') && html.includes('PHP Version') && html.includes('System')) {
      vulnerabilities.push({
        type: 'phpinfo_exposed',
        severity: 'critical',
        title: 'PHP Info Page Exposed',
        description: 'A phpinfo() page is publicly accessible, revealing server environment variables, paths, and configuration.',
        recommendation: 'Remove the file containing phpinfo() immediately.',
        effort: 'Low',
        category: 'Configuration'
      });
    }

    // 5. Debug Mode Detection (Laravel/Django/Rails)
    if (html.includes('Whoops! There was an error.') || // Laravel
        html.includes('DisallowedHost') || // Django
        html.includes('Action Controller: Exception caught') // Rails
    ) {
      vulnerabilities.push({
        type: 'debug_mode_enabled',
        severity: 'high',
        title: 'Debug Mode Enabled',
        description: 'The application appears to be running with debug mode enabled, showing stack traces to users.',
        recommendation: 'Disable debug mode (set APP_DEBUG=false or DEBUG=False) in production.',
        effort: 'Low',
        category: 'Configuration'
      });
    }

    results.vulnerabilities.push(...vulnerabilities);

  } catch (error) {
    console.error('Tech check failed:', error);
  }
}

async function checkSensitiveFiles(url, results) {
  const domain = new URL(url).origin;
  const filesToCheck = [
    { path: '/.env', severity: 'critical', title: 'Environment File Exposed', desc: 'Contains database credentials, API keys, and app secrets.' },
    { path: '/.git/config', severity: 'high', title: 'Git Config Exposed', desc: 'Exposes repository information and potential source code access.' },
    { path: '/package.json', severity: 'low', title: 'NPM Package File Exposed', desc: 'Reveals dependencies and versions, aiding targeted attacks.' },
    { path: '/composer.json', severity: 'low', title: 'Composer File Exposed', desc: 'Reveals PHP dependencies and versions.' },
    { path: '/wp-config.php.save', severity: 'critical', title: 'WP Config Backup Exposed', desc: 'Backup file likely contains database credentials.' },
    { path: '/phpinfo.php', severity: 'high', title: 'PHP Info File Found', desc: 'Standard name for PHP info file revealing server details.' },
    { path: '/.DS_Store', severity: 'low', title: 'DS_Store File Exposed', desc: 'Directory metadata file which may reveal file structure.' }
  ];

  try {
    const checks = filesToCheck.map(async (file) => {
      try {
        const targetUrl = domain + file.path;
        const response = await axios.get(targetUrl, { 
          timeout: 5000,
          validateStatus: (status) => status === 200,
          maxContentLength: 50000
        });

        if (response.status === 200) {
          const content = typeof response.data === 'string' ? response.data.toLowerCase() : JSON.stringify(response.data).toLowerCase();
          
          // False positive reduction
          if (content.includes('html') || content.includes('<!doctype') || content.includes('body') || content.length < 10) {
            return null; // Likely a custom 404 page served as 200
          }

          // Verification logic per file type
          let verified = false;
          if (file.path === '/.env' && (content.includes('app_key') || content.includes('db_password') || content.includes('secret'))) verified = true;
          else if (file.path.includes('.git') && content.includes('repositoryformatversion')) verified = true;
          else if (file.path.includes('json') && (content.includes('dependencies') || content.includes('name'))) verified = true;
          else if (file.path.includes('php') && content.includes('php')) verified = true;
          else if (file.path === '/.DS_Store') verified = true; // Binary content usually, hard to regex, but if 200 and not HTML, likely real

          if (verified) {
            return {
              type: 'sensitive_file',
              severity: file.severity,
              title: file.title,
              description: `File ${file.path} is publicly accessible. ${file.desc}`,
              recommendation: `Configure your server to deny access to ${file.path} or remove it.`,
              effort: 'Low',
              category: 'Information Disclosure'
            };
          }
        }
      } catch (e) { /* 404 or other error is good */ }
      return null;
    });

    const foundFiles = (await Promise.all(checks)).filter(f => f !== null);
    results.vulnerabilities.push(...foundFiles);

  } catch (error) {
    console.error('Sensitive file check failed:', error);
  }
}

async function checkSSLAndConfiguration(url, results) {
  try {
    const vulnerabilities = [];

    if (url.startsWith('http://')) {
      vulnerabilities.push({
        type: 'unencrypted_http',
        severity: 'high',
        title: 'Unencrypted HTTP Connection',
        description: 'The site is available via plain HTTP. Data transmitted is not encrypted.',
        recommendation: 'Implement HTTPS and redirect all HTTP traffic to HTTPS.',
        effort: 'Medium',
        category: 'Encryption'
      });
    }

    // Check mixed content if HTTPS
    if (url.startsWith('https://')) {
      try {
        const response = await axios.get(url, { timeout: 5000 });
        if (typeof response.data === 'string') {
          const mixedContent = response.data.match(/src=["']http:\/\/[^"']+/i);
          if (mixedContent) {
            vulnerabilities.push({
              type: 'mixed_content',
              severity: 'medium',
              title: 'Mixed Content Detected',
              description: 'HTTPS page loads resources via HTTP (scripts, images, or styles). This weakens encryption.',
              recommendation: 'Update all resource links to use HTTPS.',
              effort: 'Medium',
              category: 'Encryption'
            });
          }
        }
      } catch (e) {}
    }

    results.vulnerabilities.push(...vulnerabilities);
  } catch (error) {}
}

function calculateSecurityScore(results) {
  let score = 100;
  const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  results.vulnerabilities.forEach(vuln => {
    // Count per severity
    if (summary[vuln.severity] !== undefined) {
      summary[vuln.severity]++;
    }

    // Deduct points
    switch (vuln.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
      case 'info': score -= 0; break;
    }
  });

  results.securityScore = Math.max(0, Math.round(score));
  results.summary = { ...summary, totalVulnerabilities: results.vulnerabilities.length };

  // Determine Risk Level
  if (summary.critical > 0) results.riskLevel = 'Critical';
  else if (summary.high > 0 || results.securityScore < 50) results.riskLevel = 'High';
  else if (summary.medium > 2 || results.securityScore < 75) results.riskLevel = 'Medium';
  else if (summary.medium > 0 || summary.low > 2) results.riskLevel = 'Low';
  else results.riskLevel = 'Minimal';
}

function compareVersions(v1, v2) {
  const v1parts = v1.split('.').map(Number);
  const v2parts = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const p1 = v1parts[i] || 0;
    const p2 = v2parts[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

export default middleware(handler);
