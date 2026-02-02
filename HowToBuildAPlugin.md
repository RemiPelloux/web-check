# Guide Complet : Comment Créer un Plugin pour BeCompliant/Checkit

Ce guide exhaustif détaille toutes les étapes nécessaires pour créer un nouveau plugin, de A à Z.

---

## Table des Matières

1. [Vue d'ensemble de l'Architecture](#1-vue-densemble-de-larchitecture)
2. [Partie 1 : Créer l'API Backend](#2-partie-1--créer-lapi-backend)
3. [Partie 2 : Créer le Composant Frontend](#3-partie-2--créer-le-composant-frontend)
4. [Partie 3 : Intégrer dans le Système](#4-partie-3--intégrer-dans-le-système)
5. [Partie 4 : Ajouter la Documentation](#5-partie-4--ajouter-la-documentation)
6. [Partie 5 : Intégrer dans les Rapports PDF](#6-partie-5--intégrer-dans-les-rapports-pdf)
7. [Partie 6 : Configuration Admin & Base de Données](#7-partie-6--configuration-admin--base-de-données)
8. [Partie 7 : Checklist Finale](#8-partie-7--checklist-finale)
9. [Exemple Complet : Plugin "api-security"](#9-exemple-complet--plugin-api-security)

---

## 1. Vue d'ensemble de l'Architecture

### Structure des Fichiers à Créer/Modifier

```
web-check/
├── api/
│   └── mon-plugin.js                    # [CRÉER] API Backend
├── src/web-check-live/
│   ├── components/Results/
│   │   └── MonPlugin.tsx                # [CRÉER] Composant Frontend
│   ├── components/misc/
│   │   └── ProgressBar.tsx              # [MODIFIER] Ajouter job name
│   ├── components/Admin/
│   │   └── PluginConfig.tsx             # [MODIFIER] Ajouter au panel admin
│   ├── views/
│   │   └── Results.tsx                  # [MODIFIER] Importer et afficher le composant
│   └── utils/
│       ├── docs.ts                      # [MODIFIER] Ajouter documentation
│       ├── fullResultsPdfGenerator.ts   # [MODIFIER] Ajouter renderer PDF
│       └── htmlPdfGenerator.ts          # [MODIFIER] Ajouter section HTML
├── database/
│   └── migrations/
│       └── XXX_add_mon_plugin.js        # [CRÉER] Migration wiki
└── server.js                            # [AUTOMATIQUE] Routes auto-enregistrées
```

### Convention de Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Fichier API | `kebab-case.js` | `api-security.js` |
| Job Name | `kebab-case` | `api-security` |
| Composant React | `PascalCase.tsx` | `ApiSecurity.tsx` |
| Variable résultat | `camelCase` | `apiSecurityResults` |

---

## 2. Partie 1 : Créer l'API Backend

### Emplacement
```
web-check/api/mon-plugin.js
```

### Structure du Handler

```javascript
import axios from 'axios';
import middleware from './_common/middleware.js';

/**
 * Handler principal du plugin
 * @param {string} url - URL normalisée (toujours avec https://)
 * @returns {Object} Résultats de l'analyse
 */
const handler = async (url) => {
  try {
    // 1. Validation
    if (!url) {
      return { error: 'URL parameter is required', statusCode: 400 };
    }

    // 2. Analyse principale
    const results = await analyzeTarget(url);
    
    // 3. Retour des résultats
    return results;

  } catch (error) {
    console.error('Mon plugin error:', error);
    return { 
      error: `Failed to analyze: ${error.message}`,
      statusCode: 500 
    };
  }
};

/**
 * Fonction d'analyse principale
 */
async function analyzeTarget(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    score: 0,
    issues: [],
    passed: [],
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };

  // Logique d'analyse...
  
  return results;
}

// IMPORTANT: Toujours exporter avec le middleware
export default middleware(handler);
```

### Bonnes Pratiques API

```javascript
// ✅ Timeouts appropriés
const response = await axios.get(url, { 
  timeout: 10000,  // 10 secondes max
  maxRedirects: 5,
  validateStatus: () => true  // Ne pas rejeter sur erreurs HTTP
});

// ✅ Gestion des erreurs gracieuse
try {
  const data = await fetchData(url);
} catch (error) {
  // Ne pas faire échouer tout le plugin
  console.error('Fetch failed:', error.message);
  results.warnings.push({ type: 'fetch_error', message: error.message });
}

// ✅ Parallélisation pour performance
await Promise.all([
  checkSecurity(url, results),
  checkConfiguration(url, results),
  checkVulnerabilities(url, results)
]);

// ✅ Structure de résultat standardisée
return {
  url,
  timestamp: new Date().toISOString(),
  score: calculatedScore,        // Nombre 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F',
  issues: [],                    // Array d'objets issue
  passed: [],                    // Array d'éléments conformes
  summary: { critical, high, medium, low },
  recommendations: []            // Actions recommandées
};
```

### Format Standard des Issues

```javascript
const issue = {
  type: 'unique_issue_identifier',
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
  title: 'Titre court et descriptif',
  description: 'Description détaillée du problème détecté.',
  recommendation: 'Action recommandée pour corriger le problème.',
  effort: 'Low' | 'Medium' | 'High',
  category: 'Security' | 'Compliance' | 'Performance' | 'Configuration',
  article: 'Article 32 APDP'  // Référence légale optionnelle
};
```

---

## 3. Partie 2 : Créer le Composant Frontend

### Emplacement
```
web-check/src/web-check-live/components/Results/MonPlugin.tsx
```

### Structure du Composant

```tsx
import { Card } from 'web-check-live/components/Form/Card';
import Row, { ExpandableRow } from 'web-check-live/components/Form/Row';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';
import styled from '@emotion/styled';

// --- Interfaces TypeScript ---

interface MonPluginData {
  url: string;
  timestamp: string;
  score: number;
  grade: string;
  issues: Issue[];
  passed: PassedItem[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Issue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation?: string;
}

interface PassedItem {
  type: string;
  title: string;
  description?: string;
}

interface MonPluginProps {
  data: MonPluginData;
  title: string;
  actionButtons: React.ReactNode;
  refCode?: string;
}

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div<{ color?: string }>`
  background: ${colors.backgroundLighter};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.color || colors.textColor};
  }
  
  .label {
    font-size: 0.8rem;
    color: ${colors.textColorSecondary};
    text-transform: uppercase;
  }
`;

const IssueItem = styled.div<{ severity: string }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${props => {
    switch (props.severity) {
      case 'critical': return 'rgba(220, 38, 38, 0.1)';
      case 'high': return 'rgba(234, 88, 12, 0.1)';
      case 'medium': return 'rgba(202, 138, 4, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return '#ca8a04';
      default: return colors.info;
    }
  }};
`;

// --- Composant Principal ---

const MonPluginCard = (props: MonPluginProps): JSX.Element => {
  const { data, title, actionButtons, refCode } = props;
  
  // Gestion des erreurs
  if (!data || data.error) {
    return (
      <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
        <p style={{ color: colors.textColorSecondary, textAlign: 'center' }}>
          {data?.error || 'Aucune donnée disponible'}
        </p>
      </Card>
    );
  }

  const { score, summary, issues, passed } = data;

  return (
    <Card heading={title} actionButtons={actionButtons} refCode={refCode}>
      <Container>
        {/* Score Global */}
        <SummaryGrid>
          <StatCard color={score >= 80 ? colors.success : score >= 50 ? colors.warning : colors.danger}>
            <div className="value">{score}</div>
            <div className="label">Score</div>
          </StatCard>
          <StatCard color={colors.danger}>
            <div className="value">{summary.critical}</div>
            <div className="label">Critiques</div>
          </StatCard>
          <StatCard color={colors.warning}>
            <div className="value">{summary.high}</div>
            <div className="label">Élevés</div>
          </StatCard>
          <StatCard color={colors.success}>
            <div className="value">{passed?.length || 0}</div>
            <div className="label">Conformes</div>
          </StatCard>
        </SummaryGrid>

        {/* Liste des Issues */}
        {issues && issues.length > 0 && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>
              Analyses Détectées ({issues.length})
            </Heading>
            {issues.map((issue, idx) => (
              <IssueItem key={idx} severity={issue.severity}>
                <strong>{issue.title}</strong>
                <p style={{ margin: '0.5rem 0', color: colors.textColorSecondary }}>
                  {issue.description}
                </p>
                {issue.recommendation && (
                  <p style={{ margin: 0, fontStyle: 'italic', color: colors.info }}>
                    → {issue.recommendation}
                  </p>
                )}
              </IssueItem>
            ))}
          </div>
        )}

        {/* Éléments Conformes */}
        {passed && passed.length > 0 && (
          <div>
            <Heading as="h3" size="small" color={colors.textColor}>
              Points Conformes ({passed.length})
            </Heading>
            {passed.map((item, idx) => (
              <Row key={idx} lbl={item.title} val="✓ Conforme" />
            ))}
          </div>
        )}
      </Container>
    </Card>
  );
};

export default MonPluginCard;
```

### Composants Réutilisables Disponibles

```tsx
// Card - Conteneur principal avec titre et actions
import { Card } from 'web-check-live/components/Form/Card';
<Card heading="Titre" actionButtons={actionButtons} refCode={refCode}>
  {/* contenu */}
</Card>

// Row - Ligne simple clé/valeur
import Row from 'web-check-live/components/Form/Row';
<Row lbl="Clé" val="Valeur" />

// ExpandableRow - Ligne avec détails déroulants
import { ExpandableRow } from 'web-check-live/components/Form/Row';
<ExpandableRow 
  lbl="Titre" 
  val="Résumé" 
  rowList={[
    { lbl: "Détail 1", val: "Valeur 1" },
    { lbl: "Détail 2", val: "Valeur 2" }
  ]}
/>

// Heading - Titres stylisés
import Heading from 'web-check-live/components/Form/Heading';
<Heading as="h3" size="small" color={colors.textColor}>
  Titre de Section
</Heading>

// Colors - Palette de couleurs
import colors from 'web-check-live/styles/colors';
// colors.primary, colors.danger, colors.warning, colors.success, colors.info
// colors.textColor, colors.textColorSecondary
// colors.background, colors.backgroundLighter, colors.borderColor
```

---

## 4. Partie 3 : Intégrer dans le Système

### Étape 1 : Ajouter au ProgressBar (job list)

**Fichier:** `web-check/src/web-check-live/components/misc/ProgressBar.tsx`

Trouver le tableau `jobNames` et ajouter le nom du plugin:

```tsx
const jobNames = [
  'rgpd-compliance',
  'vulnerabilities',
  // ... autres plugins existants ...
  'lighthouse',
  'mon-plugin',  // ← AJOUTER ICI (kebab-case, même nom que le fichier API)
] as const;
```

### Étape 2 : Importer dans Results.tsx

**Fichier:** `web-check/src/web-check-live/views/Results.tsx`

#### 2.1 Ajouter l'import lazy-loaded

```tsx
// En haut du fichier, avec les autres imports lazy
const MonPluginCard = lazy(() => import('web-check-live/components/Results/MonPlugin'));
```

#### 2.2 Ajouter le hook de fetch

Dans la fonction `Results`, ajouter:

```tsx
// Dans la section des hooks (vers ligne 350-400)
const [monPluginResults, updateMonPluginResults] = useMotherHook({
  jobId: 'mon-plugin',
  updateLoadingJobs,
  addressInfo: { address, addressType, expectedAddressTypes: defined },
});
```

#### 2.3 Ajouter le composant dans le rendu

Dans le JSX, ajouter le composant dans la section `ResultsContent`:

```tsx
{monPluginResults && !monPluginResults.error && (
  <Suspense fallback={<CardLoadingFallback>Chargement...</CardLoadingFallback>}>
    <MonPluginCard 
      data={monPluginResults}
      title="Mon Plugin"
      actionButtons={actionButtons(monPluginResults, 'mon-plugin')}
      refCode={getPluginRefCode('mon-plugin')}
    />
  </Suspense>
)}
```

---

## 5. Partie 4 : Ajouter la Documentation

### Fichier docs.ts

**Fichier:** `web-check/src/web-check-live/utils/docs.ts`

Ajouter une entrée dans le tableau `docs`:

```typescript
{
  id: "mon-plugin",  // Doit correspondre au job name
  title: "Titre du Plugin",
  description: 
    "Description complète du plugin. Expliquez ce qu'il fait, "
    + "comment il fonctionne techniquement, et pourquoi c'est important "
    + "pour la conformité et la sécurité.",
  use: 
    "Décrivez les cas d'usage pratiques. Expliquez à qui ce plugin "
    + "est utile (auditeurs, DPO, développeurs) et quelles décisions "
    + "il peut aider à prendre.",
  resources: [
    { title: 'Documentation Officielle', link: 'https://example.com/docs' },
    { title: 'OWASP Guide', link: 'https://owasp.org/guide' },
    { title: 'RFC Pertinent', link: 'https://tools.ietf.org/html/rfcXXXX' },
  ],
  screenshot: 'https://example.com/screenshot.png',  // Optionnel
},
```

### Structure des Resources

```typescript
resources: string[] | { title: string, link: string }[];

// Format simple (déprécié)
resources: [
  'https://example.com/doc1',
  'https://example.com/doc2',
]

// Format recommandé avec titres
resources: [
  { title: 'Titre descriptif', link: 'https://example.com/doc1' },
  { title: 'Autre ressource', link: 'https://example.com/doc2' },
]
```

---

## 6. Partie 5 : Intégrer dans les Rapports PDF

### 6.1 Full Results PDF Generator

**Fichier:** `web-check/src/web-check-live/utils/fullResultsPdfGenerator.ts`

Ajouter un renderer dans l'objet `pluginRenderers`:

```typescript
const pluginRenderers: Record<string, (data: any, key: string) => string> = {
  // ... autres renderers ...
  
  'mon-plugin': (data) => {
    if (!data || data.error) return '';
    
    const score = data.score || 0;
    const issues = data.issues || [];
    const passed = data.passed || [];
    
    // Déterminer la classe de statut
    let statusClass = 'success';
    let statusText = 'Conforme';
    if (data.summary?.critical > 0) {
      statusClass = 'error';
      statusText = 'Non conforme';
    } else if (data.summary?.high > 0) {
      statusClass = 'warning';
      statusText = 'Attention requise';
    }
    
    return `
      <div class="plugin-card">
        <div class="plugin-header">
          <span class="plugin-icon">🔍</span>
          <h3>Mon Plugin</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="plugin-content">
          <div class="score-box">
            <span class="score-value">${score}</span>
            <span class="score-label">Score</span>
          </div>
          
          ${issues.length > 0 ? `
            <div class="issues-section">
              <h4>Analyses Détectées (${issues.length})</h4>
              <ul>
                ${issues.slice(0, 10).map((issue: any) => `
                  <li>
                    <strong>${escapeHtml(issue.title)}</strong>
                    <p>${escapeHtml(issue.description)}</p>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${passed.length > 0 ? `
            <div class="passed-section">
              <h4>Points Conformes (${passed.length})</h4>
              <ul>
                ${passed.slice(0, 10).map((item: any) => `
                  <li>✓ ${escapeHtml(item.title)}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },
};
```

### 6.2 HTML PDF Generator (Rapport de Conformité)

**Fichier:** `web-check/src/web-check-live/utils/htmlPdfGenerator.ts`

Dans la section `analysisResults`, ajouter:

```typescript
// Mon Plugin
if (allResults['mon-plugin']) {
  const pluginData = allResults['mon-plugin'];
  const score = pluginData.score || 0;
  const status = score >= 80 ? '✓' : score >= 50 ? '!' : '✗';
  const detail = score >= 80 ? 'Excellent' : score >= 50 ? 'Acceptable' : 'À améliorer';
  
  analysisResults.push({
    name: 'Mon Plugin',
    status: status,
    detail: detail
  });
}
```

---

## 7. Partie 6 : Configuration Admin & Base de Données

### 7.1 Ajout au Wiki (Migration)

Pour que le plugin apparaisse dans l'éditeur wiki admin, créez une migration:

**Fichier:** `web-check/database/migrations/XXX_add_mon_plugin.js`

```javascript
/**
 * Migration: Add mon-plugin to wiki
 */

export const version = 'XXX_add_mon_plugin';
export const description = 'Add Mon Plugin to wiki documentation';

export function up(db) {
  const pluginId = 'mon-plugin';
  
  // Check if already exists
  const existing = db.prepare('SELECT plugin_id FROM wiki_plugin_docs WHERE plugin_id = ?').get(pluginId);
  if (existing) {
    console.log(`  ℹ Plugin ${pluginId} already exists, skipping`);
    return;
  }
  
  const stmt = db.prepare(`
    INSERT INTO wiki_plugin_docs (plugin_id, title, description, use_case, resources, screenshot_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  
  stmt.run(
    pluginId,
    'Mon Plugin',  // title
    'Description complète du plugin...',  // description
    'Cas d\'usage du plugin...',  // use_case
    JSON.stringify([  // resources
      { title: 'Documentation', link: 'https://example.com' }
    ]),
    ''  // screenshot_url
  );
  
  console.log(`  ✓ Added plugin: ${pluginId}`);
}

export function down(db) {
  db.prepare('DELETE FROM wiki_plugin_docs WHERE plugin_id = ?').run('mon-plugin');
  console.log('  ✓ Removed plugin: mon-plugin');
}
```

**Exécuter la migration:**

```bash
cd web-check
node database/migrate.js
```

✅ Cette méthode **préserve** toutes les modifications existantes dans le wiki.

### 7.2 Ajouter au Panel Admin (OBLIGATOIRE)

**Fichier:** `web-check/src/web-check-live/components/Admin/PluginConfig.tsx`

Pour que le plugin apparaisse dans la configuration admin (`/admin`), vous devez l'ajouter au tableau `AVAILABLE_PLUGINS`:

```tsx
// Trouver la section appropriée (Sécurité, DNS, Réseau, Performance, SEO, Conformité)
const AVAILABLE_PLUGINS = [
  // Sécurité
  { id: 'ssl', name: 'Certificat SSL', category: 'Sécurité' },
  // ... autres plugins ...
  { id: 'mon-plugin', name: 'Mon Plugin', category: 'Sécurité' },  // ← AJOUTER ICI
  
  // ... autres catégories ...
];
```

**Catégories disponibles:**
- `Sécurité` - Plugins de sécurité (SSL, TLS, vulnérabilités...)
- `DNS` - Plugins liés au DNS
- `Réseau` - Plugins réseau (IP, géoloc, traceroute...)
- `Performance` - Plugins de performance (Lighthouse, CDN...)
- `SEO` - Plugins SEO (sitemap, robots.txt...)
- `Conformité` - Plugins de conformité RGPD/APDP

### 7.3 Gestion de la Visibilité (Base de Données)

Les plugins sont activés/désactivés via la table `disabled_plugins` dans SQLite:

```sql
-- Pour désactiver un plugin pour les utilisateurs DPD
INSERT INTO disabled_plugins (plugin_name) VALUES ('mon-plugin');

-- Pour réactiver
DELETE FROM disabled_plugins WHERE plugin_name = 'mon-plugin';
```

L'admin UI dans `/admin` permet de gérer cela visuellement (après avoir ajouté le plugin à `PluginConfig.tsx`).

### 7.4 Routes API (Automatique)

Le fichier `server.js` enregistre automatiquement tous les fichiers `.js` du dossier `/api`:

```javascript
// server.js - Extrait (pas besoin de modifier)
fs.readdirSync(dirPath, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
  .forEach(async dirent => {
    const routeName = dirent.name.split('.')[0];
    const route = `${API_DIR}/${routeName}`;
    // Auto-registration...
  });
```

Votre plugin sera accessible à: `GET /api/mon-plugin?url=https://example.com`

---

## 8. Partie 7 : Checklist Finale

### Fichiers à Créer

- [ ] `web-check/api/mon-plugin.js` - API handler
- [ ] `web-check/src/web-check-live/components/Results/MonPlugin.tsx` - Composant React
- [ ] `web-check/database/migrations/XXX_add_mon_plugin.js` - Migration wiki

### Fichiers à Modifier

- [ ] `web-check/src/web-check-live/components/misc/ProgressBar.tsx` - Ajouter job name
- [ ] `web-check/src/web-check-live/views/Results.tsx` - Import + hook + rendu
- [ ] `web-check/src/web-check-live/utils/docs.ts` - Documentation
- [ ] `web-check/src/web-check-live/utils/fullResultsPdfGenerator.ts` - Renderer PDF
- [ ] `web-check/src/web-check-live/utils/htmlPdfGenerator.ts` - Section rapport HTML
- [ ] `web-check/src/web-check-live/components/Admin/PluginConfig.tsx` - Panel admin

### Tests à Effectuer

1. **API Endpoint**
   ```bash
   curl "http://localhost:3000/api/mon-plugin?url=https://example.com"
   ```

2. **Interface Utilisateur**
   - Vérifier que la carte s'affiche dans les résultats
   - Vérifier la gestion des erreurs
   - Tester les états de chargement

3. **Documentation**
   - Vérifier l'affichage dans la page Wiki (`/wiki`)
   - Vérifier l'apparition dans l'éditeur wiki admin (`/admin`)
   - Tester le modal d'info au clic sur le job dans ProgressBar

4. **Rapports**
   - Générer un rapport PDF complet
   - Vérifier que les données du plugin apparaissent

5. **Admin**
   - Vérifier que le plugin apparaît dans `/admin` (Configuration des plugins)
   - Vérifier la possibilité de désactiver le plugin
   - Tester le filtrage pour les utilisateurs DPD

---

## 9. Exemple Complet : Plugin "api-security"

### api/api-security.js

```javascript
import axios from 'axios';
import middleware from './_common/middleware.js';

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
    score: 100,
    grade: 'A',
    issues: [],
    passed: [],
    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    apiEndpoints: [],
    corsConfig: null,
    authenticationMethods: []
  };

  await Promise.all([
    checkGraphQL(url, results),
    checkOpenAPI(url, results),
    checkCORS(url, results),
    checkCommonEndpoints(url, results)
  ]);

  calculateScore(results);
  return results;
}

async function checkGraphQL(url, results) {
  try {
    const graphqlUrl = new URL('/graphql', url).toString();
    
    // Check introspection query
    const introspectionQuery = {
      query: '{ __schema { types { name } } }'
    };
    
    const response = await axios.post(graphqlUrl, introspectionQuery, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data?.data?.__schema) {
      results.issues.push({
        type: 'graphql_introspection_enabled',
        severity: 'high',
        title: 'GraphQL Introspection Enabled',
        description: 'L\'introspection GraphQL est activée, exposant le schéma complet de l\'API.',
        recommendation: 'Désactiver l\'introspection en production.',
        effort: 'Low',
        category: 'API Security'
      });
      results.summary.high++;
      results.apiEndpoints.push({ type: 'graphql', url: graphqlUrl, introspection: true });
    }
  } catch (e) { /* GraphQL non disponible */ }
}

async function checkOpenAPI(url, results) {
  const swaggerPaths = [
    '/swagger.json', '/swagger.yaml', '/openapi.json', '/openapi.yaml',
    '/api/swagger.json', '/api/v1/swagger.json', '/docs/api.json'
  ];
  
  for (const path of swaggerPaths) {
    try {
      const specUrl = new URL(path, url).toString();
      const response = await axios.get(specUrl, { 
        timeout: 3000, 
        validateStatus: () => true 
      });
      
      if (response.status === 200) {
        const content = typeof response.data === 'string' 
          ? response.data.toLowerCase() 
          : JSON.stringify(response.data).toLowerCase();
        
        if (content.includes('swagger') || content.includes('openapi')) {
          results.issues.push({
            type: 'openapi_exposed',
            severity: 'medium',
            title: 'OpenAPI/Swagger Documentation Exposed',
            description: `Documentation API exposée publiquement à ${path}`,
            recommendation: 'Restreindre l\'accès à la documentation API ou la désactiver en production.',
            effort: 'Low',
            category: 'API Security'
          });
          results.summary.medium++;
          results.apiEndpoints.push({ type: 'openapi', url: specUrl });
          break;
        }
      }
    } catch (e) { /* Continue */ }
  }
}

async function checkCORS(url, results) {
  try {
    const response = await axios.options(url, {
      timeout: 5000,
      headers: { 'Origin': 'https://evil-site.com' },
      validateStatus: () => true
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (corsHeader === '*') {
      results.issues.push({
        type: 'cors_wildcard',
        severity: 'high',
        title: 'CORS Wildcard Configuration',
        description: 'Le serveur accepte les requêtes de n\'importe quelle origine (Access-Control-Allow-Origin: *).',
        recommendation: 'Configurer CORS avec une liste blanche d\'origines autorisées.',
        effort: 'Medium',
        category: 'API Security'
      });
      results.summary.high++;
    } else if (corsHeader === 'https://evil-site.com') {
      results.issues.push({
        type: 'cors_reflection',
        severity: 'critical',
        title: 'CORS Origin Reflection',
        description: 'Le serveur reflète l\'origine demandée, permettant à n\'importe quel site d\'accéder à l\'API.',
        recommendation: 'Implémenter une validation stricte des origines CORS.',
        effort: 'Medium',
        category: 'API Security'
      });
      results.summary.critical++;
    } else if (corsHeader && corsHeader !== url) {
      results.passed.push({
        type: 'cors_configured',
        title: 'CORS Correctement Configuré',
        description: `Origin autorisée: ${corsHeader}`
      });
    }
    
    results.corsConfig = {
      allowOrigin: corsHeader || 'Non défini',
      allowMethods: response.headers['access-control-allow-methods'] || 'Non défini',
      allowHeaders: response.headers['access-control-allow-headers'] || 'Non défini'
    };
    
  } catch (e) { /* CORS check failed */ }
}

async function checkCommonEndpoints(url, results) {
  const endpoints = [
    { path: '/api', name: 'API Root' },
    { path: '/api/v1', name: 'API v1' },
    { path: '/api/v2', name: 'API v2' },
    { path: '/api/users', name: 'Users Endpoint' },
    { path: '/api/admin', name: 'Admin Endpoint' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const endpointUrl = new URL(endpoint.path, url).toString();
      const response = await axios.get(endpointUrl, {
        timeout: 3000,
        validateStatus: () => true
      });
      
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        results.apiEndpoints.push({
          type: 'rest',
          url: endpointUrl,
          status: response.status,
          name: endpoint.name
        });
      }
    } catch (e) { /* Continue */ }
  }
}

function calculateScore(results) {
  let score = 100;
  
  results.summary.critical && (score -= results.summary.critical * 25);
  results.summary.high && (score -= results.summary.high * 15);
  results.summary.medium && (score -= results.summary.medium * 8);
  results.summary.low && (score -= results.summary.low * 3);
  
  results.score = Math.max(0, Math.round(score));
  
  if (results.score >= 90) results.grade = 'A';
  else if (results.score >= 80) results.grade = 'B';
  else if (results.score >= 70) results.grade = 'C';
  else if (results.score >= 60) results.grade = 'D';
  else results.grade = 'F';
}

export default middleware(handler);
```

### Résumé des Emplacements Clés

| Quoi | Où |
|------|-----|
| API Backend | `web-check/api/{plugin-name}.js` |
| Composant Frontend | `web-check/src/web-check-live/components/Results/{PluginName}.tsx` |
| Liste des Jobs | `ProgressBar.tsx` → `jobNames` array |
| Intégration Résultats | `Results.tsx` → import, hook, JSX |
| Documentation | `docs.ts` → `docs` array |
| PDF Full Results | `fullResultsPdfGenerator.ts` → `pluginRenderers` |
| PDF HTML Report | `htmlPdfGenerator.ts` → `analysisResults` |
| **Panel Admin** | `PluginConfig.tsx` → `AVAILABLE_PLUGINS` array |
| **Wiki Editor** | `migrations/XXX_add_mon_plugin.js` → INSERT |
| Visibilité Admin | Table `disabled_plugins` dans SQLite |

---

**Auteur:** OpenPro/APDP  
**Dernière mise à jour:** Décembre 2025  
**Version:** 1.0

