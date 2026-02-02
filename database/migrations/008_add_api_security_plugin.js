/**
 * Migration: Add api-security plugin to wiki
 * 
 * Adds the API Security Scanner plugin documentation to wiki_plugin_docs
 * without touching any existing content.
 */

export const version = '008_add_api_security_plugin';
export const description = 'Add API Security Scanner plugin to wiki documentation';

export function up(db) {
  const pluginId = 'api-security';
  
  // Check if already exists
  const existing = db.prepare('SELECT plugin_id FROM wiki_plugin_docs WHERE plugin_id = ?').get(pluginId);
  
  if (existing) {
    console.log(`  ℹ Plugin ${pluginId} already exists, skipping`);
    return;
  }
  
  const plugin = {
    plugin_id: pluginId,
    title: 'Scanner de Sécurité API',
    description: `Ce scanner analyse de manière exhaustive la sécurité des APIs exposées par le site web. Il détecte les endpoints GraphQL avec introspection activée (risque majeur d'exposition du schéma), les documentations OpenAPI/Swagger exposées publiquement, les mauvaises configurations CORS (wildcard, reflection d'origine), les clés API exposées dans le code source ou les URLs, et évalue les mécanismes d'authentification. L'analyse couvre également la découverte d'endpoints REST via robots.txt, sitemap et chemins courants (/api, /api/v1, /api/admin, etc.).`,
    use_case: `Essentiel pour les audits de sécurité API modernes. Les applications web actuelles reposent massivement sur des APIs REST et GraphQL qui peuvent exposer des vulnérabilités critiques. Ce scanner identifie les risques OWASP API Security Top 10, notamment l'exposition excessive de données (introspection GraphQL), les problèmes d'authentification (Basic Auth faible, absence de tokens), et les mauvaises configurations de contrôle d'accès (CORS). Les résultats permettent de prioriser les corrections et de documenter la posture de sécurité API pour les audits de conformité.`,
    resources: JSON.stringify([
      { title: 'OWASP API Security Top 10', link: 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/' },
      { title: 'GraphQL Security Best Practices', link: 'https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html' },
      { title: 'CORS Security (Mozilla)', link: 'https://developer.mozilla.org/fr/docs/Web/HTTP/CORS' },
      { title: 'API Key Best Practices', link: 'https://cloud.google.com/docs/authentication/api-keys' },
      { title: 'OpenAPI Security Guide', link: 'https://swagger.io/docs/specification/authentication/' }
    ]),
    screenshot_url: ''
  };
  
  const stmt = db.prepare(`
    INSERT INTO wiki_plugin_docs (plugin_id, title, description, use_case, resources, screenshot_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  
  stmt.run(
    plugin.plugin_id,
    plugin.title,
    plugin.description,
    plugin.use_case,
    plugin.resources,
    plugin.screenshot_url
  );
  
  console.log(`  ✓ Added plugin: ${plugin.title} (${plugin.plugin_id})`);
}

export function down(db) {
  const pluginId = 'api-security';
  
  const result = db.prepare('DELETE FROM wiki_plugin_docs WHERE plugin_id = ?').run(pluginId);
  
  if (result.changes > 0) {
    console.log(`  ✓ Removed plugin: ${pluginId}`);
  } else {
    console.log(`  ℹ Plugin ${pluginId} not found, skipping`);
  }
}

