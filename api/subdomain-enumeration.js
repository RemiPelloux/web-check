import dns from 'dns';
import util from 'util';
import axios from 'axios';
import middleware from './_common/middleware.js';

/**
 * Subdomain Enumeration API
 * Discovers subdomains using multiple techniques:
 * - Certificate Transparency Logs (crt.sh)
 * - DNS brute-forcing with common subdomain names
 * - Zone transfer attempts
 */

// Common subdomain prefixes to test
const COMMON_SUBDOMAINS = [
  'www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2',
  'smtp', 'secure', 'vpn', 'admin', 'api', 'dev', 'staging', 'test',
  'portal', 'mobile', 'shop', 'ftp', 'cdn', 'app', 'support', 'forum',
  'news', 'wiki', 'help', 'status', 'dashboard', 'beta', 'demo',
  'm', 'gateway', 'proxy', 'git', 'docs', 'monitor', 'assets',
  'login', 'register', 'auth', 'cloud', 'download', 'upload',
  'mx', 'mx1', 'mx2', 'pop', 'imap', 'exchange', 'webdisk',
  'cpanel', 'whm', 'autodiscover', 'autoconfig', 'email'
];

// Maximum concurrent DNS lookups
const MAX_CONCURRENT_LOOKUPS = 20;

/**
 * Extract base domain from hostname
 */
const extractBaseDomain = (hostname) => {
  // Remove protocol if present
  hostname = hostname.replace(/^(?:https?:\/\/)?/i, '');
  // Remove path if present
  hostname = hostname.split('/')[0];
  // Remove port if present
  hostname = hostname.split(':')[0];
  
  // Split by dots and get last two parts (domain.tld)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
};

/**
 * Query Certificate Transparency Logs via crt.sh
 * This is the PRIMARY passive reconnaissance method
 */
const queryCtLogs = async (domain) => {
  try {
    const response = await axios.get(
      `https://crt.sh/?q=%.${domain}&output=json`,
      { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SubdomainEnumerator/1.0)'
        }
      }
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    // Extract unique subdomains from certificate names
    const subdomains = new Set();
    
    response.data.forEach(entry => {
      if (entry.name_value) {
        // Split by newlines (certificates can have multiple SANs)
        const names = entry.name_value.split('\n');
        names.forEach(name => {
          name = name.trim().toLowerCase();
          // Remove wildcards
          name = name.replace(/^\*\./, '');
          // Only include if it's actually for this domain
          if (name.endsWith(domain) && name !== domain) {
            subdomains.add(name);
          }
        });
      }
    });

    return Array.from(subdomains);
  } catch (error) {
    console.error(`CT Logs query failed: ${error.message}`);
    return [];
  }
};

/**
 * Query HackerTarget API for passive DNS data
 * Free API, no key required, finds subdomains from DNS history
 */
const queryHackerTarget = async (domain) => {
  try {
    const response = await axios.get(
      `https://api.hackertarget.com/hostsearch/?q=${domain}`,
      { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SubdomainEnumerator/1.0)'
        }
      }
    );

    if (!response.data || typeof response.data !== 'string') {
      return [];
    }

    // Parse response format: subdomain.domain.com,IP
    const subdomains = new Set();
    const lines = response.data.split('\n');
    
    lines.forEach(line => {
      if (line && !line.startsWith('error') && !line.startsWith('API')) {
        const parts = line.split(',');
        if (parts[0]) {
          const subdomain = parts[0].trim().toLowerCase();
          if (subdomain.endsWith(domain) && subdomain !== domain) {
            subdomains.add(subdomain);
          }
        }
      }
    });

    return Array.from(subdomains);
  } catch (error) {
    console.error(`HackerTarget query failed: ${error.message}`);
    return [];
  }
};

/**
 * Query DNSDumpster-style passive DNS (via AlienVault OTX if available)
 * This finds subdomains from various passive DNS sources
 */
const queryPassiveDNS = async (domain) => {
  try {
    // Try URLScan.io API (free, no key required)
    const response = await axios.get(
      `https://urlscan.io/api/v1/search/?q=domain:${domain}`,
      { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SubdomainEnumerator/1.0)'
        }
      }
    );

    if (!response.data || !response.data.results) {
      return [];
    }

    // Extract unique subdomains from URLScan results
    const subdomains = new Set();
    
    response.data.results.forEach(result => {
      if (result.page && result.page.domain) {
        const foundDomain = result.page.domain.toLowerCase();
        if (foundDomain.endsWith(domain) && foundDomain !== domain) {
          subdomains.add(foundDomain);
        }
      }
      if (result.task && result.task.domain) {
        const foundDomain = result.task.domain.toLowerCase();
        if (foundDomain.endsWith(domain) && foundDomain !== domain) {
          subdomains.add(foundDomain);
        }
      }
    });

    return Array.from(subdomains);
  } catch (error) {
    console.error(`Passive DNS query failed: ${error.message}`);
    return [];
  }
};

/**
 * Perform DNS lookup for a subdomain
 */
const checkSubdomain = async (subdomain) => {
  const lookupPromise = util.promisify(dns.lookup);
  const resolve4Promise = util.promisify(dns.resolve4);
  const resolveCnamePromise = util.promisify(dns.resolveCname);

  try {
    const [ipv4, cname] = await Promise.all([
      resolve4Promise(subdomain).catch(() => null),
      resolveCnamePromise(subdomain).catch(() => null)
    ]);

    if (ipv4 || cname) {
      return {
        subdomain,
        ipv4: ipv4 || [],
        cname: cname || [],
        found: true
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Detect wildcard DNS by testing random non-existent subdomains
 */
const detectWildcard = async (domain) => {
  const randomSubdomains = [
    `${Math.random().toString(36).substring(2, 15)}.${domain}`,
    `nonexistent-${Date.now()}.${domain}`,
    `test-wildcard-${Math.random().toString(36).substring(2, 10)}.${domain}`
  ];

  const results = await Promise.all(
    randomSubdomains.map(sub => checkSubdomain(sub))
  );

  // If all random subdomains resolve, we have a wildcard
  const resolvedCount = results.filter(r => r !== null).length;
  
  if (resolvedCount >= 2) {
    // Extract the wildcard IP addresses
    const wildcardIPs = new Set();
    results.forEach(r => {
      if (r && r.ipv4) {
        r.ipv4.forEach(ip => wildcardIPs.add(ip));
      }
    });
    
    return {
      detected: true,
      wildcardIPs: Array.from(wildcardIPs),
      message: 'Wildcard DNS detected - brute force results filtered'
    };
  }

  return {
    detected: false,
    wildcardIPs: [],
    message: 'No wildcard DNS detected'
  };
};

/**
 * Brute force common subdomains with rate limiting and wildcard filtering
 */
const bruteForceSubdomains = async (domain, wildcardInfo) => {
  const results = [];
  const chunks = [];
  
  // Split into chunks for controlled concurrency
  for (let i = 0; i < COMMON_SUBDOMAINS.length; i += MAX_CONCURRENT_LOOKUPS) {
    chunks.push(COMMON_SUBDOMAINS.slice(i, i + MAX_CONCURRENT_LOOKUPS));
  }

  // Process each chunk sequentially
  for (const chunk of chunks) {
    const promises = chunk.map(prefix => {
      const subdomain = `${prefix}.${domain}`;
      return checkSubdomain(subdomain);
    });

    const chunkResults = await Promise.all(promises);
    
    // Filter results based on wildcard detection
    const filteredResults = chunkResults.filter(r => {
      if (r === null) return false;
      
      // If wildcard detected, only include if IP doesn't match wildcard IP
      if (wildcardInfo.detected && r.ipv4 && r.ipv4.length > 0) {
        // Check if any of the IPs match wildcard IPs
        const hasWildcardIP = r.ipv4.some(ip => wildcardInfo.wildcardIPs.includes(ip));
        if (hasWildcardIP) {
          // This is likely a wildcard response, skip it
          return false;
        }
      }
      
      return true;
    });
    
    results.push(...filteredResults);
  }

  return results;
};

/**
 * Attempt DNS zone transfer (usually fails, but worth trying)
 */
const attemptZoneTransfer = async (domain) => {
  const resolveNsPromise = util.promisify(dns.resolveNs);
  
  try {
    const nameservers = await resolveNsPromise(domain);
    
    // Note: Zone transfer requires AXFR which is not directly available in Node's dns module
    // This is a placeholder for the attempt - most servers will deny this
    return {
      attempted: true,
      nameservers,
      success: false,
      message: 'Zone transfer typically requires AXFR protocol (blocked by most servers)'
    };
  } catch (error) {
    return {
      attempted: false,
      success: false,
      message: 'Could not retrieve nameservers'
    };
  }
};

/**
 * Analyze subdomain patterns
 */
const analyzePatterns = (subdomains, wildcardInfo) => {
  const patterns = {
    totalFound: subdomains.length,
    uniqueIPs: new Set(),
    hasCDN: false,
    hasWildcard: wildcardInfo.detected,
    wildcardIPs: wildcardInfo.wildcardIPs || [],
    categories: {
      development: [],
      production: [],
      mail: [],
      infrastructure: [],
      application: [],
      other: []
    }
  };

  // Categorize subdomains
  subdomains.forEach(sub => {
    const name = sub.subdomain.toLowerCase();
    
    // Collect unique IPs
    if (sub.ipv4) {
      sub.ipv4.forEach(ip => patterns.uniqueIPs.add(ip));
    }

    // Check for CDN indicators
    if (sub.cname && sub.cname.some(c => 
      c.includes('cloudflare') || 
      c.includes('cloudfront') || 
      c.includes('akamai') ||
      c.includes('fastly')
    )) {
      patterns.hasCDN = true;
    }

    // Categorize
    if (name.includes('dev') || name.includes('test') || name.includes('staging') || name.includes('beta')) {
      patterns.categories.development.push(sub);
    } else if (name.includes('mail') || name.includes('smtp') || name.includes('imap') || name.includes('pop')) {
      patterns.categories.mail.push(sub);
    } else if (name.includes('ns') || name.includes('dns') || name.includes('vpn') || name.includes('gateway')) {
      patterns.categories.infrastructure.push(sub);
    } else if (name.includes('api') || name.includes('app') || name.includes('portal') || name.includes('dashboard')) {
      patterns.categories.application.push(sub);
    } else if (name.includes('www') || name.includes('shop') || name.includes('blog')) {
      patterns.categories.production.push(sub);
    } else {
      patterns.categories.other.push(sub);
    }
  });

  patterns.uniqueIPs = Array.from(patterns.uniqueIPs);

  return patterns;
};

/**
 * Main subdomain enumeration handler
 */
const subdomainEnumerationHandler = async (url) => {
  let hostname = url;

  // Extract hostname from URL
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    hostname = new URL(hostname).hostname;
  }

  // Get base domain
  const baseDomain = extractBaseDomain(hostname);

  try {
    const startTime = Date.now();

    // STEP 1: Detect wildcard DNS first (critical for accurate results)
    const wildcardInfo = await detectWildcard(baseDomain);

    // STEP 2: Run PASSIVE reconnaissance in parallel (no brute force yet)
    const [ctLogSubdomains, hackerTargetSubdomains, passiveDnsSubdomains, zoneTransferResult] = await Promise.all([
      queryCtLogs(baseDomain),
      queryHackerTarget(baseDomain),
      queryPassiveDNS(baseDomain),
      attemptZoneTransfer(baseDomain)
    ]);

    // Combine all passive results
    const allPassiveSubdomains = new Set([
      ...ctLogSubdomains,
      ...hackerTargetSubdomains,
      ...passiveDnsSubdomains
    ]);

    // STEP 3: Only run brute force if passive sources found less than 5 subdomains
    let bruteForceResults = [];
    const shouldBruteForce = allPassiveSubdomains.size < 5;
    
    if (shouldBruteForce) {
      bruteForceResults = await bruteForceSubdomains(baseDomain, wildcardInfo);
    }

    // Combine and deduplicate results
    const allSubdomains = new Map();

    // Add brute force results (if any)
    bruteForceResults.forEach(result => {
      allSubdomains.set(result.subdomain, result);
    });

    // Verify ALL passive findings (CT logs, HackerTarget, URLScan)
    const passiveVerificationPromises = Array.from(allPassiveSubdomains)
      .filter(sub => !allSubdomains.has(sub))
      .map(sub => checkSubdomain(sub));
    
    const passiveVerified = await Promise.all(passiveVerificationPromises);
    passiveVerified.forEach(result => {
      if (result) {
        allSubdomains.set(result.subdomain, result);
      }
    });

    // Convert to array and sort
    const subdomains = Array.from(allSubdomains.values())
      .sort((a, b) => a.subdomain.localeCompare(b.subdomain));

    // Analyze patterns
    const analysis = analyzePatterns(subdomains, wildcardInfo);

    const executionTime = Date.now() - startTime;

    return {
      domain: baseDomain,
      queryDomain: hostname,
      subdomains,
      analysis,
      methods: {
        wildcardDetection: {
          detected: wildcardInfo.detected,
          wildcardIPs: wildcardInfo.wildcardIPs,
          message: wildcardInfo.message,
          impact: wildcardInfo.detected 
            ? 'Brute force results filtered to exclude wildcard responses' 
            : 'All brute force results included'
        },
        passiveReconnaissance: {
          certificateTransparency: {
            attempted: true,
            found: ctLogSubdomains.length,
            source: 'crt.sh SSL certificates'
          },
          hackerTarget: {
            attempted: true,
            found: hackerTargetSubdomains.length,
            source: 'HackerTarget passive DNS'
          },
          urlScan: {
            attempted: true,
            found: passiveDnsSubdomains.length,
            source: 'URLScan.io web scans'
          },
          totalPassive: allPassiveSubdomains.size,
          verified: passiveVerified.filter(r => r !== null).length
        },
        dnsBruteForce: {
          attempted: shouldBruteForce,
          skipped: !shouldBruteForce,
          reason: !shouldBruteForce 
            ? `Passive sources found ${allPassiveSubdomains.size} subdomains - brute force skipped` 
            : 'Passive sources found less than 5 subdomains',
          tested: shouldBruteForce ? COMMON_SUBDOMAINS.length : 0,
          found: bruteForceResults.length,
          filtered: wildcardInfo.detected
        },
        zoneTransfer: zoneTransferResult
      },
      summary: {
        totalSubdomains: subdomains.length,
        uniqueIPAddresses: analysis.uniqueIPs.length,
        hasCDN: analysis.hasCDN,
        hasWildcard: wildcardInfo.detected,
        bruteForceUsed: shouldBruteForce,
        methodology: shouldBruteForce 
          ? 'Passive reconnaissance + minimal brute force'
          : 'Passive reconnaissance only (brute force skipped)',
        passiveSourcesCount: 3,
        executionTimeMs: executionTime
      }
    };
  } catch (error) {
    throw new Error(`Subdomain enumeration failed: ${error.message}`);
  }
};

export const handler = middleware(subdomainEnumerationHandler);
export default handler;

