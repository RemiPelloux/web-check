import axios from 'axios';
import middleware from './_common/middleware.js';

/**
 * API Security Scanner Plugin
 * Detects API security misconfigurations and vulnerabilities
 * 
 * NO SCORE - Just finds and reports issues
 */

const TIMEOUT = 5000;
const SHORT_TIMEOUT = 3000;

const handler = async (url) => {
  try {
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    const results = await analyzeApiSecurity(url);
    return results;
  } catch (error) {
    console.error('API Security analysis error:', error);
    return { 
      error: `Failed to analyze API security: ${error.message}`,
      statusCode: 500 
    };
  }
};

async function analyzeApiSecurity(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    issues: [],
    findings: [],
    apiEndpoints: [],
    graphql: null,
    openapi: null,
    corsConfig: null,
    authInfo: null,
    exposedData: []
  };

  // Run all checks in parallel
  await Promise.all([
    checkGraphQL(url, results),
    checkOpenAPI(url, results),
    checkCORS(url, results),
    discoverApiEndpoints(url, results),
    checkApiKeyExposure(url, results),
    checkAuthenticationMechanisms(url, results),
    checkDebugEndpoints(url, results),
    checkVersionDisclosure(url, results),
    checkRateLimiting(url, results),
    checkJWTWeakness(url, results),
    checkServerHeaders(url, results),
    checkWebsocket(url, results)
  ]);

  return results;
}

/**
 * Check for GraphQL endpoint and security issues
 */
async function checkGraphQL(url, results) {
  const graphqlPaths = [
    '/graphql', '/api/graphql', '/v1/graphql', '/v2/graphql',
    '/query', '/gql', '/graphiql', '/playground',
    '/api/gql', '/graphql/console', '/__graphql'
  ];
  
  for (const path of graphqlPaths) {
    try {
      const graphqlUrl = new URL(path, url).toString();
      
      // Test introspection
      const introspectionQuery = {
        query: `{__schema{types{name kind description}queryType{name}mutationType{name}subscriptionType{name}}}`
      };
      
      const response = await axios.post(graphqlUrl, introspectionQuery, {
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data?.data?.__schema) {
        const schema = response.data.data.__schema;
        const types = schema.types || [];
        const sensitiveTypes = types.filter(t => 
          /user|admin|auth|password|token|secret|key|credential|account|payment|billing/i.test(t.name)
        );
        
        results.graphql = {
          endpoint: graphqlUrl,
          introspectionEnabled: true,
          typeCount: types.length,
          hasQueryType: !!schema.queryType,
          hasMutationType: !!schema.mutationType,
          hasSubscriptionType: !!schema.subscriptionType,
          sensitiveTypesFound: sensitiveTypes.map(t => t.name)
        };
        
        results.issues.push({
          type: 'graphql_introspection',
          severity: 'high',
          title: 'Introspection GraphQL Activée',
          description: `L'introspection expose le schéma complet (${types.length} types). Types sensibles détectés: ${sensitiveTypes.length > 0 ? sensitiveTypes.map(t => t.name).join(', ') : 'aucun'}`,
          endpoint: graphqlUrl,
          recommendation: 'Désactiver l\'introspection en production'
        });
        
        if (schema.mutationType) {
          results.issues.push({
            type: 'graphql_mutations',
            severity: 'medium',
            title: 'Mutations GraphQL Exposées',
            description: 'Des mutations sont disponibles, permettant de modifier des données',
            endpoint: graphqlUrl,
            recommendation: 'Vérifier l\'authentification sur toutes les mutations'
          });
        }
        
        // Test for batching attacks
        try {
          const batchQuery = [
            { query: '{ __typename }' },
            { query: '{ __typename }' },
            { query: '{ __typename }' }
          ];
          const batchResponse = await axios.post(graphqlUrl, batchQuery, {
            timeout: SHORT_TIMEOUT,
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
          });
          
          if (Array.isArray(batchResponse.data)) {
            results.issues.push({
              type: 'graphql_batching',
              severity: 'medium',
              title: 'Batching GraphQL Activé',
              description: 'Le serveur accepte les requêtes en batch, permettant des attaques par force brute',
              endpoint: graphqlUrl,
              recommendation: 'Limiter ou désactiver le batching de requêtes'
            });
          }
        } catch (e) { /* Batching not supported */ }
        
        results.apiEndpoints.push({ type: 'graphql', url: graphqlUrl, method: 'POST' });
        return;
      }
      
      // Check if GraphQL exists but introspection disabled (good)
      if (response.status === 200 && response.data?.errors) {
        results.graphql = { endpoint: graphqlUrl, introspectionEnabled: false };
        results.findings.push({
          type: 'graphql_secure',
          title: 'GraphQL Introspection Désactivée',
          description: `Endpoint GraphQL trouvé à ${path} avec introspection désactivée`,
          endpoint: graphqlUrl
        });
        results.apiEndpoints.push({ type: 'graphql', url: graphqlUrl, method: 'POST', secure: true });
        return;
      }
    } catch (e) { /* Continue */ }
  }
}

/**
 * Check for exposed OpenAPI/Swagger documentation
 */
async function checkOpenAPI(url, results) {
  const swaggerPaths = [
    '/swagger.json', '/swagger.yaml', '/swagger-ui.html', '/swagger-ui/',
    '/openapi.json', '/openapi.yaml', '/openapi/', '/api-docs', '/api-docs.json',
    '/api/swagger.json', '/api/v1/swagger.json', '/api/v2/swagger.json', '/api/v3/swagger.json',
    '/v1/swagger.json', '/v2/swagger.json', '/v3/swagger.json',
    '/docs/api.json', '/api/docs', '/documentation', '/docs',
    '/.well-known/openapi.json', '/spec/openapi.json', '/spec.json',
    '/swagger-resources', '/swagger-resources/configuration/ui',
    '/api/swagger/v1/swagger.json', '/api/swagger-ui.html',
    '/redoc', '/api/redoc'
  ];
  
  for (const path of swaggerPaths) {
    try {
      const specUrl = new URL(path, url).toString();
      const response = await axios.get(specUrl, { 
        timeout: SHORT_TIMEOUT, 
        validateStatus: () => true,
        maxContentLength: 10 * 1024 * 1024
      });
      
      if (response.status === 200) {
        const content = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        
        const isOpenAPI = /swagger|openapi|"paths"|"info"|"basePath"/i.test(content);
        
        if (isOpenAPI) {
          let apiInfo = null;
          let sensitiveEndpoints = [];
          
          try {
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            const paths = Object.keys(data.paths || {});
            
            // Find sensitive endpoints
            sensitiveEndpoints = paths.filter(p => 
              /admin|user|auth|login|password|token|secret|key|internal|debug|test|config|setting/i.test(p)
            );
            
            apiInfo = {
              title: data.info?.title,
              version: data.info?.version,
              pathCount: paths.length,
              sensitiveEndpoints,
              hasAuth: !!(data.securityDefinitions || data.components?.securitySchemes),
              servers: data.servers?.map(s => s.url) || [data.basePath].filter(Boolean)
            };
          } catch (e) { /* Not JSON */ }
          
          results.openapi = { found: true, url: specUrl, path, ...apiInfo };
          
          results.issues.push({
            type: 'openapi_exposed',
            severity: 'high',
            title: 'Documentation API Exposée',
            description: `Swagger/OpenAPI accessible à ${path}${apiInfo ? `. ${apiInfo.pathCount} endpoints dont ${sensitiveEndpoints.length} sensibles` : ''}`,
            endpoint: specUrl,
            sensitiveEndpoints: sensitiveEndpoints.slice(0, 10),
            recommendation: 'Protéger la documentation API par authentification'
          });
          
          results.apiEndpoints.push({ type: 'openapi', url: specUrl, method: 'GET', pathCount: apiInfo?.pathCount });
          return;
        }
      }
    } catch (e) { /* Continue */ }
  }
  
  results.openapi = { found: false };
}

/**
 * Check CORS configuration
 */
async function checkCORS(url, results) {
  try {
    const maliciousOrigins = [
      'https://evil-attacker.com',
      'https://null',
      'null'
    ];
    
    for (const origin of maliciousOrigins) {
      const response = await axios.options(url, {
        timeout: TIMEOUT,
        headers: { 
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        },
        validateStatus: () => true
      });
      
      const acao = response.headers['access-control-allow-origin'];
      const acac = response.headers['access-control-allow-credentials'];
      
      if (acao === '*') {
        results.corsConfig = {
          allowOrigin: '*',
          allowCredentials: acac,
          vulnerable: true
        };
        
        results.issues.push({
          type: 'cors_wildcard',
          severity: 'high',
          title: 'CORS Wildcard (*)',
          description: 'Le serveur accepte n\'importe quelle origine. Risque de vol de données cross-origin.',
          recommendation: 'Configurer une liste blanche d\'origines spécifiques'
        });
        
        if (acac === 'true') {
          results.issues.push({
            type: 'cors_credentials_wildcard',
            severity: 'critical',
            title: 'CORS Credentials avec Wildcard',
            description: 'Configuration CORS critique: wildcard avec credentials autorisés',
            recommendation: 'Ne jamais combiner Access-Control-Allow-Origin: * avec credentials'
          });
        }
        return;
      }
      
      if (acao === origin) {
        results.corsConfig = { allowOrigin: origin, reflected: true, vulnerable: true };
        
        results.issues.push({
          type: 'cors_reflection',
          severity: 'critical',
          title: 'CORS Origin Reflection',
          description: `Le serveur reflète l'origine demandée (${origin}). Équivalent à un wildcard.`,
          recommendation: 'Implémenter une validation stricte des origines'
        });
        return;
      }
    }
    
    // CORS seems OK
    results.corsConfig = { vulnerable: false };
    results.findings.push({
      type: 'cors_secure',
      title: 'Configuration CORS Sécurisée',
      description: 'Le serveur n\'accepte pas les origines malveillantes'
    });
    
  } catch (e) {
    results.corsConfig = { error: e.message };
  }
}

/**
 * Discover API endpoints
 */
async function discoverApiEndpoints(url, results) {
  const endpoints = [
    // REST API
    { path: '/api', name: 'API Root' },
    { path: '/api/v1', name: 'API v1' },
    { path: '/api/v2', name: 'API v2' },
    { path: '/api/v3', name: 'API v3' },
    { path: '/rest', name: 'REST' },
    { path: '/v1', name: 'v1 Root' },
    { path: '/v2', name: 'v2 Root' },
    
    // Sensitive endpoints
    { path: '/api/users', name: 'Users', sensitive: true },
    { path: '/api/user', name: 'User', sensitive: true },
    { path: '/api/admin', name: 'Admin', sensitive: true },
    { path: '/api/config', name: 'Config', sensitive: true },
    { path: '/api/settings', name: 'Settings', sensitive: true },
    { path: '/api/internal', name: 'Internal', sensitive: true },
    { path: '/api/private', name: 'Private', sensitive: true },
    { path: '/api/account', name: 'Account', sensitive: true },
    { path: '/api/profile', name: 'Profile', sensitive: true },
    { path: '/api/auth', name: 'Auth', sensitive: true },
    { path: '/api/login', name: 'Login', sensitive: true },
    { path: '/api/token', name: 'Token', sensitive: true },
    { path: '/api/tokens', name: 'Tokens', sensitive: true },
    { path: '/api/keys', name: 'API Keys', sensitive: true },
    { path: '/api/secrets', name: 'Secrets', sensitive: true },
    
    // Debug/Test
    { path: '/api/debug', name: 'Debug', sensitive: true },
    { path: '/api/test', name: 'Test', sensitive: true },
    { path: '/api/dev', name: 'Dev', sensitive: true },
    { path: '/debug', name: 'Debug Root', sensitive: true },
    { path: '/test', name: 'Test Root', sensitive: true },
    { path: '/_debug', name: '_Debug', sensitive: true },
    { path: '/__debug', name: '__Debug', sensitive: true },
    
    // Health/Status (info disclosure)
    { path: '/api/health', name: 'Health' },
    { path: '/api/status', name: 'Status' },
    { path: '/api/info', name: 'Info', sensitive: true },
    { path: '/api/version', name: 'Version' },
    { path: '/health', name: 'Health Root' },
    { path: '/healthz', name: 'Healthz' },
    { path: '/ready', name: 'Ready' },
    { path: '/metrics', name: 'Metrics', sensitive: true },
    { path: '/actuator', name: 'Actuator', sensitive: true },
    { path: '/actuator/health', name: 'Actuator Health', sensitive: true },
    { path: '/actuator/env', name: 'Actuator Env', sensitive: true },
    
    // Common frameworks
    { path: '/.well-known/jwks.json', name: 'JWKS' },
    { path: '/oauth/token', name: 'OAuth Token', sensitive: true },
    { path: '/oauth2/token', name: 'OAuth2 Token', sensitive: true },
    { path: '/.well-known/openid-configuration', name: 'OpenID Config' },
    
    // Environment files (critical)
    { path: '/.env', name: 'Env File', critical: true },
    { path: '/api/.env', name: 'API Env File', critical: true },
    { path: '/.env.local', name: 'Env Local', critical: true },
    { path: '/.env.production', name: 'Env Production', critical: true },
    { path: '/config.json', name: 'Config JSON', sensitive: true },
    { path: '/config.yaml', name: 'Config YAML', sensitive: true },
    { path: '/config.yml', name: 'Config YML', sensitive: true }
  ];
  
  const checkPromises = endpoints.map(async (ep) => {
    try {
      const endpointUrl = new URL(ep.path, url).toString();
      const response = await axios.get(endpointUrl, {
        timeout: SHORT_TIMEOUT,
        validateStatus: () => true,
        maxRedirects: 2
      });
      
      if (response.status === 200) {
        const endpoint = {
          type: 'rest',
          url: endpointUrl,
          path: ep.path,
          name: ep.name,
          status: 200,
          accessible: true
        };
        results.apiEndpoints.push(endpoint);
        
        if (ep.critical) {
          results.issues.push({
            type: 'critical_file_exposed',
            severity: 'critical',
            title: `Fichier Critique Exposé: ${ep.name}`,
            description: `${ep.path} est accessible publiquement!`,
            endpoint: endpointUrl,
            recommendation: 'Bloquer immédiatement l\'accès à ce fichier'
          });
        } else if (ep.sensitive) {
          results.issues.push({
            type: 'sensitive_endpoint',
            severity: 'medium',
            title: `Endpoint Sensible Accessible: ${ep.name}`,
            description: `${ep.path} accessible sans authentification apparente`,
            endpoint: endpointUrl,
            recommendation: 'Protéger cet endpoint par authentification'
          });
        }
        
        // Check response for sensitive data
        const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        if (content && content.length < 50000) {
          checkSensitiveDataInResponse(content, endpointUrl, results);
        }
      }
      else if (response.status === 401 || response.status === 403) {
        results.apiEndpoints.push({
          type: 'rest',
          url: endpointUrl,
          path: ep.path,
          name: ep.name,
          status: response.status,
          protected: true
        });
      }
    } catch (e) { /* Endpoint not found */ }
  });
  
  await Promise.all(checkPromises);
}

/**
 * Check for sensitive data in response
 */
function checkSensitiveDataInResponse(content, endpoint, results) {
  const patterns = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
    { name: 'AWS Secret', pattern: /(?:aws)?_?secret_?(?:access)?_?key["']?\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}/gi, severity: 'critical' },
    { name: 'Google API Key', pattern: /AIza[0-9A-Za-z_-]{35}/g, severity: 'high' },
    { name: 'Stripe Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/g, severity: 'critical' },
    { name: 'Stripe Publishable', pattern: /pk_live_[0-9a-zA-Z]{24,}/g, severity: 'medium' },
    { name: 'GitHub Token', pattern: /gh[pousr]_[0-9a-zA-Z]{36,}/g, severity: 'critical' },
    { name: 'Slack Token', pattern: /xox[baprs]-[0-9]{10,13}-[0-9a-zA-Z-]{24,}/g, severity: 'high' },
    { name: 'Private Key', pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g, severity: 'critical' },
    { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, severity: 'high' },
    { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_-]{20,}/gi, severity: 'high' },
    { name: 'Password in JSON', pattern: /"password"\s*:\s*"[^"]+"/gi, severity: 'critical' },
    { name: 'API Key in JSON', pattern: /"(?:api[_-]?key|apikey|api_secret|access[_-]?token)"\s*:\s*"[^"]{10,}"/gi, severity: 'high' },
    { name: 'Database URL', pattern: /(?:mongodb|mysql|postgres|redis):\/\/[^\s"']+/gi, severity: 'critical' },
    { name: 'Internal IP', pattern: /(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})/g, severity: 'low' },
    { name: 'Email Address', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, severity: 'info' },
    { name: 'SendGrid API Key', pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, severity: 'high' },
    { name: 'Twilio Token', pattern: /SK[0-9a-fA-F]{32}/g, severity: 'high' },
    { name: 'Firebase Key', pattern: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g, severity: 'high' }
  ];
  
  for (const { name, pattern, severity } of patterns) {
    const matches = content.match(pattern);
    if (matches && severity !== 'info') {
      results.exposedData.push({
        type: name,
        count: matches.length,
        endpoint,
        sample: matches[0].substring(0, 30) + '...'
      });
      
      if (!results.issues.some(i => i.type === 'exposed_' + name.toLowerCase().replace(/\s/g, '_'))) {
        results.issues.push({
          type: 'exposed_' + name.toLowerCase().replace(/\s/g, '_'),
          severity,
          title: `${name} Exposé`,
          description: `${matches.length} occurrence(s) de ${name} détectée(s)`,
          endpoint,
          recommendation: 'Révoquer et remplacer immédiatement ces credentials'
        });
      }
    }
  }
}

/**
 * Check for API key exposure in main page
 */
async function checkApiKeyExposure(url, results) {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      checkSensitiveDataInResponse(content, url, results);
    }
    
    // Check URL for API keys
    const urlLower = url.toLowerCase();
    if (urlLower.includes('api_key=') || urlLower.includes('apikey=') || 
        urlLower.includes('access_token=') || urlLower.includes('auth_token=')) {
      results.issues.push({
        type: 'api_key_in_url',
        severity: 'high',
        title: 'Credentials dans l\'URL',
        description: 'L\'URL contient des tokens/clés API visibles dans les logs',
        recommendation: 'Passer les credentials via headers Authorization'
      });
    }
  } catch (e) { /* Page fetch failed */ }
}

/**
 * Check authentication mechanisms
 */
async function checkAuthenticationMechanisms(url, results) {
  try {
    // Try accessing with no auth
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    const wwwAuth = response.headers['www-authenticate'];
    
    if (wwwAuth) {
      const authLower = wwwAuth.toLowerCase();
      
      if (authLower.includes('basic')) {
        results.authInfo = { method: 'Basic', header: wwwAuth };
        results.issues.push({
          type: 'basic_auth',
          severity: 'medium',
          title: 'Basic Authentication Utilisée',
          description: 'Basic Auth transmet les credentials en base64 à chaque requête',
          recommendation: 'Utiliser OAuth 2.0 ou JWT pour plus de sécurité'
        });
      }
      
      if (authLower.includes('digest')) {
        results.authInfo = { method: 'Digest', header: wwwAuth };
        results.findings.push({
          type: 'digest_auth',
          title: 'Digest Authentication Détectée',
          description: 'Plus sécurisé que Basic Auth'
        });
      }
      
      if (authLower.includes('bearer')) {
        results.authInfo = { method: 'Bearer', header: wwwAuth };
        results.findings.push({
          type: 'bearer_auth',
          title: 'Bearer Token Authentication',
          description: 'Méthode d\'authentification moderne recommandée'
        });
      }
    }
  } catch (e) { /* Auth check failed */ }
}

/**
 * Check for debug endpoints
 */
async function checkDebugEndpoints(url, results) {
  const debugPaths = [
    '/phpinfo.php', '/info.php', '/test.php',
    '/debug/pprof/', '/debug/vars', '/debug/requests',
    '/_profiler', '/_wdt', '/trace',
    '/server-status', '/server-info',
    '/elmah.axd', '/trace.axd',
    '/console', '/shell', '/cmd',
    '/.git/config', '/.git/HEAD',
    '/.svn/entries', '/.hg/requires',
    '/composer.json', '/package.json', '/yarn.lock',
    '/Gemfile', '/requirements.txt', '/Pipfile',
    '/web.config', '/wp-config.php.bak', '/configuration.php.bak',
    '/.DS_Store', '/Thumbs.db',
    '/backup.sql', '/dump.sql', '/database.sql',
    '/.htaccess', '/.htpasswd'
  ];
  
  for (const path of debugPaths) {
    try {
      const debugUrl = new URL(path, url).toString();
      const response = await axios.get(debugUrl, {
        timeout: SHORT_TIMEOUT,
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data) {
        const content = typeof response.data === 'string' ? response.data : '';
        
        // Verify it's actual content, not error page
        const isReal = content.length > 50 && 
          !content.includes('404') && 
          !content.includes('not found') &&
          !content.includes('Page Not Found');
        
        if (isReal) {
          const severity = path.includes('.git') || path.includes('.sql') || 
                          path.includes('config') || path.includes('.env') 
                          ? 'critical' : 'high';
          
          results.issues.push({
            type: 'debug_endpoint',
            severity,
            title: `Fichier/Endpoint Debug Exposé: ${path}`,
            description: `${path} est accessible publiquement`,
            endpoint: debugUrl,
            recommendation: 'Supprimer ou bloquer l\'accès à ce fichier'
          });
        }
      }
    } catch (e) { /* Not found */ }
  }
}

/**
 * Check for version disclosure
 */
async function checkVersionDisclosure(url, results) {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    const headers = response.headers;
    const versionHeaders = ['x-powered-by', 'server', 'x-aspnet-version', 'x-aspnetmvc-version'];
    
    for (const header of versionHeaders) {
      if (headers[header]) {
        results.issues.push({
          type: 'version_disclosure',
          severity: 'low',
          title: `Version Serveur Exposée: ${header}`,
          description: `Header ${header}: ${headers[header]}`,
          recommendation: 'Masquer les headers de version en production'
        });
      }
    }
  } catch (e) { /* Failed */ }
}

/**
 * Check rate limiting
 */
async function checkRateLimiting(url, results) {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    const rateLimitHeaders = [
      'x-ratelimit-limit', 'x-rate-limit-limit', 'ratelimit-limit',
      'x-ratelimit-remaining', 'retry-after', 'x-retry-after'
    ];
    
    const hasRateLimit = rateLimitHeaders.some(h => response.headers[h]);
    
    if (!hasRateLimit) {
      results.issues.push({
        type: 'no_rate_limiting',
        severity: 'medium',
        title: 'Rate Limiting Non Détecté',
        description: 'Aucun header de rate limiting trouvé. Risque d\'attaques par force brute.',
        recommendation: 'Implémenter un rate limiting avec headers informatifs'
      });
    } else {
      results.findings.push({
        type: 'rate_limiting',
        title: 'Rate Limiting Configuré',
        description: 'Des headers de rate limiting sont présents'
      });
    }
  } catch (e) { /* Failed */ }
}

/**
 * Check for JWT weaknesses
 */
async function checkJWTWeakness(url, results) {
  // Already checked in API key exposure
  // Additional check: try to find JWT in common endpoints
  const jwtEndpoints = ['/api/token', '/api/auth/token', '/oauth/token', '/login'];
  
  for (const path of jwtEndpoints) {
    try {
      const tokenUrl = new URL(path, url).toString();
      const response = await axios.post(tokenUrl, {}, {
        timeout: SHORT_TIMEOUT,
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      
      // Check for JWT in response (even error responses sometimes leak tokens)
      const jwtMatch = content.match(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
      if (jwtMatch) {
        // Try to decode header to check algorithm
        try {
          const header = JSON.parse(Buffer.from(jwtMatch[0].split('.')[0], 'base64').toString());
          if (header.alg === 'none' || header.alg === 'HS256') {
            results.issues.push({
              type: 'jwt_weak_algorithm',
              severity: header.alg === 'none' ? 'critical' : 'medium',
              title: `JWT Algorithme Faible: ${header.alg}`,
              description: `Le JWT utilise l'algorithme ${header.alg}`,
              endpoint: tokenUrl,
              recommendation: header.alg === 'none' ? 'CRITIQUE: Algorithme "none" permet de forger des tokens!' : 'Préférer RS256 ou ES256'
            });
          }
        } catch (e) { /* Can't decode */ }
      }
    } catch (e) { /* Endpoint not found */ }
  }
}

/**
 * Check server security headers
 */
async function checkServerHeaders(url, results) {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    const headers = response.headers;
    
    // Check for security headers specifically for APIs
    if (!headers['x-content-type-options']) {
      results.issues.push({
        type: 'missing_xcto',
        severity: 'low',
        title: 'Header X-Content-Type-Options Manquant',
        description: 'Permet les attaques MIME sniffing',
        recommendation: 'Ajouter X-Content-Type-Options: nosniff'
      });
    }
    
    if (!headers['x-frame-options'] && !headers['content-security-policy']?.includes('frame-ancestors')) {
      results.issues.push({
        type: 'missing_xfo',
        severity: 'low',
        title: 'Protection Clickjacking Absente',
        description: 'X-Frame-Options ou CSP frame-ancestors manquant',
        recommendation: 'Ajouter X-Frame-Options: DENY ou CSP frame-ancestors'
      });
    }
  } catch (e) { /* Failed */ }
}

/**
 * Check for WebSocket endpoints
 */
async function checkWebsocket(url, results) {
  const wsPaths = ['/ws', '/websocket', '/socket', '/socket.io', '/sockjs', '/cable', '/realtime'];
  
  for (const path of wsPaths) {
    try {
      const wsUrl = new URL(path, url).toString();
      const response = await axios.get(wsUrl, {
        timeout: SHORT_TIMEOUT,
        validateStatus: () => true,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      });
      
      if (response.status === 101 || response.status === 426 || 
          response.headers['upgrade'] === 'websocket') {
        results.apiEndpoints.push({
          type: 'websocket',
          url: wsUrl,
          path
        });
        
        results.findings.push({
          type: 'websocket_found',
          title: 'WebSocket Endpoint Détecté',
          description: `Endpoint WebSocket trouvé à ${path}`,
          endpoint: wsUrl
        });
      }
    } catch (e) { /* Not found */ }
  }
}

export default middleware(handler);
