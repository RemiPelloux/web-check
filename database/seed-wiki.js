/**
 * Seed Wiki Content from docs.ts
 * 
 * This script populates the wiki_sections and wiki_plugin_docs tables
 * with the content from the docs.ts file - preserving all existing descriptions.
 * 
 * Run: node database/seed-wiki.js
 */

import { 
  db, 
  initDatabase, 
  upsertWikiSection, 
  upsertWikiPluginDoc, 
  isWikiSeeded 
} from './db.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default wiki sections (Introduction, How To Use, etc.)
const DEFAULT_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `<p>Notre outil d'analyse de la sécurité des sites Internet, « Je teste mon site », permet de détecter, en quelques minutes à peine et de manière anonyme, certaines vulnérabilités des sites Internet et applications.</p>
<p>Les tests réalisés ne sont pas exhaustifs et ne prétendent pas à une garantie absolue de conformité et/ou d'absence de failles. Néanmoins, ils offrent une couverture représentative de certaines menaces, permettant ainsi aux utilisateurs de renforcer la protection de leur(s) environnement(s) web grâce à des recommandations adaptées aux risques rencontrés.</p>`,
    order_index: 0,
    is_visible: true
  },
  {
    id: 'how-to-use',
    title: 'Comment Utiliser',
    content: `<p>L'Outil d'analyse de la sécurité est conçu pour être simple d'utilisation tout en fournissant des résultats professionnels et détaillés. Suivez ces étapes pour effectuer votre première analyse :</p>
<ol>
<li>Entrez l'URL complète du site web que vous souhaitez analyser (exemple: https://monsite.com)</li>
<li>Cliquez sur le bouton 'Analyser' pour lancer l'analyse</li>
<li>Patientez pendant que notre système effectue l'ensemble des vérifications (généralement 15-30 secondes)</li>
<li>Consultez les résultats organisés par catégories : Information des personnes concernées, Sécurité, etc.</li>
<li>Cliquez sur chaque section pour voir les détails complets de l'analyse</li>
<li>Utilisez les recommandations pour améliorer la conformité de votre site</li>
<li>Exportez ou partagez les résultats avec votre équipe</li>
</ol>
<div class="info-box"><strong>💡 Conseil :</strong> Pour de meilleurs résultats, analysez votre site en production plutôt qu'en développement, car certaines vérifications nécessitent un environnement réel (certificats SSL, DNS, etc.).</div>`,
    order_index: 1,
    is_visible: true
  },
  {
    id: 'understanding-results',
    title: 'Comprendre les Résultats',
    content: `<p>Chaque analyse retourne des informations structurées. Voici comment interpréter les résultats :</p>
<h4>Codes Couleur</h4>
<ul>
<li>🟢 Vert : Conforme - Aucune action requise</li>
<li>🟡 Orange : Attention - Amélioration recommandée</li>
<li>🔴 Rouge : Non-conforme - Action requise</li>
<li>⚪ Gris : Information - Pas de scoring</li>
</ul>
<h4>Types d'Analyses</h4>
<ul>
<li>Information des personnes concernées : Mentions légales, Politique de Confidentialité</li>
<li>Sécurité : SSL/TLS, en-têtes HTTP, certificats</li>
</ul>`,
    order_index: 2,
    is_visible: true
  },
  {
    id: 'best-practices',
    title: 'Meilleures Pratiques',
    content: `<p>Pour tirer le meilleur parti de l'Outil d'analyse de la sécurité et maintenir une sécurité optimale, suivez ces recommandations :</p>
<h4>Effectuer des Audits Réguliers</h4>
<p>Analysez votre site au moins une fois par mois pour détecter les nouvelles vulnérabilités ou non-conformités.</p>
<h4>Prioriser les Actions</h4>
<p>Commencez par corriger les problèmes critiques (rouge) avant de vous attaquer aux améliorations recommandées (orange).</p>
<h4>Documenter les Changements</h4>
<p>Gardez une trace des modifications effectuées suite aux recommandations pour suivre l'évolution de la conformité avec la Loi.</p>
<h4>Former Votre Équipe</h4>
<p>Partagez les résultats avec vos développeurs et équipes de conformité pour une meilleure compréhension.</p>
<h4>Surveiller les Réglementations</h4>
<p>Les lois sur la protection des données évoluent. Restez informé des changements réglementaires dans votre juridiction.</p>`,
    order_index: 3,
    is_visible: true
  },
  {
    id: 'faq',
    title: 'Questions Fréquentes',
    content: `<h4>Combien de temps prend une analyse ?</h4>
<p>Une analyse complète prend généralement entre 15 et 30 secondes selon la complexité du site et le nombre de vérifications à effectuer.</p>
<h4>Les données analysées sont-elles stockées ?</h4>
<p>Non, nous ne stockons aucune donnée personnelle ou sensible des sites analysés. Les analyses sont effectuées en temps réel et les résultats sont temporaires.</p>
<h4>Puis-je analyser n'importe quel site web ?</h4>
<p>Oui, vous pouvez analyser n'importe quel site web public. Cependant, n'utilisez cet outil que sur des sites dont vous êtes propriétaire ou pour lesquels vous avez l'autorisation d'effectuer un audit.</p>
<h4>Les résultats sont-ils conformes aux normes officielles ?</h4>
<p>Oui, nos analyses suivent les standards officiels : APDP, OWASP, W3C, WCAG, RFC, et les recommandations de sécurité internationales.</p>
<h4>Comment exporter les résultats ?</h4>
<p>Vous pouvez exporter les résultats en PDF ou JSON directement depuis la page de résultats en utilisant le bouton d'export.</p>
<h4>L'outil détecte-t-il tous les problèmes de conformité ?</h4>
<p>Notre outil détecte la majorité des problèmes techniques de conformité avec la Loi automatiquement. Cependant, certains aspects (comme le contenu des politiques de confidentialité) nécessitent une revue manuelle par un expert juridique.</p>
<h4>Support</h4>
<p>Pour toute question ou assistance, contactez L'APDP.</p>`,
    order_index: 4,
    is_visible: true
  },
  {
    id: 'terms',
    title: 'Conditions d\'Utilisation',
    content: `<h4>Licence</h4>
<p><strong>Outil d'analyse de la sécurité est distribué sous licence MIT, © L'APDP 2025</strong></p>
<h4>Usage Équitable</h4>
<ul>
<li>N'utilisez cet outil que sur des sites web dont vous êtes propriétaire ou pour lesquels vous avez obtenu l'autorisation explicite.</li>
<li>Ne l'utilisez pas pour des activités malveillantes, du hacking non éthique, ou pour surcharger des serveurs tiers.</li>
<li>Respectez les limites de taux et n'abusez pas du service avec des analyses automatisées excessives.</li>
<li>Les résultats sont fournis à titre informatif. Consultez des experts juridiques et de sécurité pour des audits officiels.</li>
<li>N'utilisez pas les informations découvertes pour exploiter des vulnérabilités sans l'autorisation du propriétaire du site.</li>
</ul>
<h4>Conditions d'Utilisation</h4>
<p>La mise en place de cet outil par l'APDP est justifiée par l'existence d'un motif d'intérêt public puisqu'il permet à l'APDP d'accompagner les responsables du traitement dans leurs démarches de mise en conformité avec la Loi.</p>
<p>Les seules données collectées sont le nom de l'entité concernée, l'URL ou les URL(s) du ou des sites Internet à tester et l'Adresse IP publique utilisée par le DPD.</p>
<p>Ces données sont conservées 1 an renouvelable, avec le consentement de l'utilisateur.</p>
<p>L'exercice des droits d'accès, de rectification, d'effacement, de limitation du traitement et d'opposition s'exerce par e-mail à l'adresse dpd@apdp.mc.</p>`,
    order_index: 5,
    is_visible: true
  }
];

/**
 * Parse docs.ts to extract plugin documentation
 * This reads your existing content directly from docs.ts
 */
const parseDocsFile = () => {
  try {
    // Read the docs.ts file
    const docsPath = join(__dirname, '../src/web-check-live/utils/docs.ts');
    const docsContent = fs.readFileSync(docsPath, 'utf-8');
    
    // Parse the docs array from the file
    // Extract content between 'const docs: Doc[] = [' and the closing '];'
    const docsMatch = docsContent.match(/const docs: Doc\[\] = \[([\s\S]*?)\];/);
    if (!docsMatch) {
      console.error('Could not find docs array in docs.ts');
      return [];
    }
    
    const docsArrayContent = docsMatch[1];
    
    // Parse each doc object
    const pluginDocs = [];
    const docRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;
    
    while ((match = docRegex.exec(docsArrayContent)) !== null) {
      const docContent = match[1];
      
      // Extract id
      const idMatch = docContent.match(/id:\s*["']([^"']+)["']/);
      if (!idMatch) continue;
      
      // Extract title and clean it - handle escaped quotes in string
      const titleMatch = docContent.match(/title:\s*['"](.+?)['"](?:,|\s*\n)/);
      let title = idMatch[1];
      if (titleMatch) {
        // Handle escaped apostrophes and quotes
        title = titleMatch[1]
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .trim();
      }
      
      // Helper to clean text content
      const cleanText = (text) => {
        if (!text) return '';
        return text
          .replace(/\\'/g, "'")      // Unescape apostrophes
          .replace(/\\"/g, '"')      // Unescape quotes
          .replace(/\\n/g, ' ')      // Replace newlines
          .replace(/\s+/g, ' ')      // Normalize whitespace
          .trim();
      };
      
      // Extract description - handle multiline strings
      let description = '';
      const descMatch = docContent.match(/description:\s*["'`]([\s\S]*?)["'`](?:,\s*\n|\s*,)/);
      if (descMatch) {
        description = cleanText(descMatch[1]);
      } else {
        // Try to match concatenated strings
        const descConcatMatch = docContent.match(/description:\s*([\s\S]*?)(?:,\s*use:|,\s*resources:)/);
        if (descConcatMatch) {
          description = cleanText(
            descConcatMatch[1]
              .replace(/["'`]\s*\+\s*["'`]/g, ' ')
              .replace(/["'`]/g, '')
          );
        }
      }
      
      // Extract use case - handle multiline strings
      let useCase = '';
      const useMatch = docContent.match(/use:\s*["'`]([\s\S]*?)["'`](?:,\s*\n|\s*,|\s*resources:)/);
      if (useMatch) {
        useCase = cleanText(useMatch[1]);
      } else {
        const useConcatMatch = docContent.match(/use:\s*([\s\S]*?)(?:,\s*resources:)/);
        if (useConcatMatch) {
          useCase = cleanText(
            useConcatMatch[1]
              .replace(/["'`]\s*\+\s*["'`]/g, ' ')
              .replace(/["'`]/g, '')
          );
        }
      }
      
      // Extract screenshot
      const screenshotMatch = docContent.match(/screenshot:\s*["']([^"']+)["']/);
      
      // Extract resources - simplified extraction
      const resources = [];
      const resourcesMatch = docContent.match(/resources:\s*\[([\s\S]*?)\]/);
      if (resourcesMatch) {
        // Match {title, link} objects
        const objRegex = /\{\s*title:\s*["']([^"']+)["'],\s*link:\s*["']([^"']+)["']\s*\}/g;
        let resMatch;
        while ((resMatch = objRegex.exec(resourcesMatch[1])) !== null) {
          resources.push({ title: resMatch[1], link: resMatch[2] });
        }
        // Match plain strings
        const strRegex = /["'](https?:\/\/[^"']+)["']/g;
        while ((resMatch = strRegex.exec(resourcesMatch[1])) !== null) {
          // Only add if not already part of a {title, link} object
          if (!resources.some(r => r.link === resMatch[1])) {
            resources.push({ title: resMatch[1], link: resMatch[1] });
          }
        }
      }
      
      pluginDocs.push({
        plugin_id: idMatch[1],
        title: title,
        description: description,
        use_case: useCase,
        resources: resources,
        screenshot_url: screenshotMatch ? screenshotMatch[1] : ''
      });
    }
    
    return pluginDocs;
  } catch (error) {
    console.error('Error parsing docs.ts:', error);
    return [];
  }
};

/**
 * Seed wiki content into database
 * @param {boolean} force - Force re-seed even if content exists
 */
const seedWikiContent = (force = false) => {
  // Initialize database schema first
  initDatabase();
  
  // CRITICAL: Never auto-seed in production - this would overwrite admin edits!
  // The upsert functions use ON CONFLICT DO UPDATE which REPLACES existing content
  if (!force) {
    console.log('⛔ SAFETY: Wiki seeding is disabled by default to protect production data.');
    console.log('   If you REALLY want to overwrite all wiki content, use: node database/seed-wiki.js --force');
    console.log('   ⚠️  WARNING: This will REPLACE all wiki sections and plugin docs with defaults!');
    return false;
  }
  
  // Double-check with isWikiSeeded
  if (isWikiSeeded()) {
    console.log('⚠️  Wiki already has content! Running with --force will OVERWRITE everything.');
    console.log('   Proceeding because --force flag was provided...');
  }

  console.log('🌱 Seeding wiki content...');

  // Seed sections
  console.log('📝 Seeding wiki sections...');
  for (const section of DEFAULT_SECTIONS) {
    upsertWikiSection(section);
    console.log(`   ✅ ${section.title}`);
  }

  // Parse and seed plugin docs from docs.ts
  console.log('📚 Seeding plugin documentation from docs.ts...');
  const pluginDocs = parseDocsFile();
  
  if (pluginDocs.length === 0) {
    console.log('   ⚠️  No plugin docs found in docs.ts');
  } else {
    for (const doc of pluginDocs) {
      upsertWikiPluginDoc(doc);
      console.log(`   ✅ ${doc.title}`);
    }
  }

  console.log('✅ Wiki content seeded successfully!');
  console.log(`   📝 ${DEFAULT_SECTIONS.length} sections`);
  console.log(`   📚 ${pluginDocs.length} plugin docs`);
  
  return true;
};

// Only run if called directly (not when imported as a module)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('seed-wiki.js');

if (isMainModule) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  seedWikiContent(force);
}

export { seedWikiContent, DEFAULT_SECTIONS };
