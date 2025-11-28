/**
 * Système de Référencement des Plugins
 * 
 * Mappe les identifiants de plugins vers des codes de référence uniques
 * basés sur leur catégorie pour une identification facile entre
 * la configuration admin et les cartes de résultats.
 * 
 * Format: {PREFIXE_CATEGORIE}-{NUMERO_SEQUENTIEL}
 * Exemple: SEC-01, CONF-02, DNS-03
 * 
 * NOTE: Cette liste doit correspondre à PLUGINS dans PluginConfig.tsx
 *       et ACTIVE_PLUGINS dans server.js
 */

// Préfixes de catégories
export const CATEGORY_PREFIXES = {
  CONFORMITE: 'CONF',
  SECURITE: 'SEC',
  DNS: 'DNS',
  RESEAU: 'NET',
  PERFORMANCE: 'PERF',
  SEO: 'SEO',
  EMAIL: 'MAIL',
  AUDIT: 'AUD',
  HISTORIQUE: 'HIST',
  TECHNIQUE: 'TECH',
} as const;

/**
 * Interface de documentation d'un plugin
 */
interface PluginDoc {
  refCode: string;
  name: string;
  description: string;
  category: string;
  checkPerformed: string;
  complianceImpact: string;
}

/**
 * Documentation complète de tous les plugins actifs
 */
export const pluginDocumentation: Record<string, PluginDoc> = {
  // === CONFORMITÉ (CONF-XX) ===
  'rgpd-compliance': {
    refCode: 'CONF-01',
    name: 'Conformité RGPD',
    description: 'Analyse complète de la conformité au Règlement Général sur la Protection des Données',
    category: 'Conformité',
    checkPerformed: 'Vérifie la présence des mentions légales obligatoires, politique de confidentialité, bannière cookies, et droits des utilisateurs',
    complianceImpact: 'Critique - Obligatoire selon le RGPD pour tout site traitant des données personnelles de résidents européens'
  },
  'apdp-cookie-banner': {
    refCode: 'CONF-02',
    name: 'Bannière Cookies APDP',
    description: 'Vérifie la présence et la conformité de la bannière de consentement aux cookies',
    category: 'Conformité',
    checkPerformed: 'Détecte la bannière cookies, vérifie les options de refus/acceptation, et la présence de choix granulaires',
    complianceImpact: 'Élevé - Requis par la directive ePrivacy et le RGPD pour le consentement aux traceurs'
  },
  'apdp-privacy-policy': {
    refCode: 'CONF-03',
    name: 'Politique de Confidentialité APDP',
    description: 'Vérifie la présence d\'une politique de confidentialité conforme aux exigences APDP',
    category: 'Conformité',
    checkPerformed: 'Recherche les liens vers la politique de confidentialité, vérifie les termes obligatoires',
    complianceImpact: 'Critique - Document obligatoire informant les utilisateurs sur le traitement de leurs données'
  },
  'apdp-legal-notices': {
    refCode: 'CONF-04',
    name: 'Mentions Légales APDP',
    description: 'Vérifie la présence des mentions légales obligatoires pour les sites monégasques',
    category: 'Conformité',
    checkPerformed: 'Recherche la page des mentions légales, vérifie les informations requises (éditeur, hébergeur, contact)',
    complianceImpact: 'Critique - Obligation légale pour tout site web commercial ou professionnel'
  },
  'cookies': {
    refCode: 'CONF-05',
    name: 'Cookies',
    description: 'Analyse détaillée des cookies utilisés par le site',
    category: 'Conformité',
    checkPerformed: 'Liste tous les cookies, leur durée, type (session/persistant), sécurité (HttpOnly, Secure, SameSite)',
    complianceImpact: 'Élevé - Les cookies de tracking nécessitent un consentement préalable'
  },
  'enhanced-compliance-summary': {
    refCode: 'CONF-00',
    name: 'Tableau de Bord Conformité',
    description: 'Vue d\'ensemble synthétique de tous les résultats de conformité',
    category: 'Conformité',
    checkPerformed: 'Agrège tous les résultats d\'analyse pour calculer un score global de conformité',
    complianceImpact: 'N/A - Outil de synthèse et visualisation'
  },

  // === SÉCURITÉ (SEC-XX) ===
  'ssl': {
    refCode: 'SEC-01',
    name: 'Certificat SSL',
    description: 'Analyse du certificat SSL/TLS du site',
    category: 'Sécurité',
    checkPerformed: 'Vérifie la validité, émetteur, date d\'expiration, algorithme de chiffrement du certificat',
    complianceImpact: 'Critique - HTTPS obligatoire pour la protection des données en transit'
  },
  'tls': {
    refCode: 'SEC-02',
    name: 'Configuration TLS',
    description: 'Analyse de la configuration TLS du serveur',
    category: 'Sécurité',
    checkPerformed: 'Vérifie les versions TLS supportées, la configuration et les vulnérabilités potentielles',
    complianceImpact: 'Élevé - TLS 1.2+ requis pour une sécurité adéquate des communications'
  },
  'vulnerabilities': {
    refCode: 'SEC-03',
    name: 'Vulnérabilités',
    description: 'Scan des vulnérabilités connues sur les technologies détectées',
    category: 'Sécurité',
    checkPerformed: 'Recherche les CVE associées aux versions des technologies identifiées',
    complianceImpact: 'Critique - Les vulnérabilités non corrigées exposent les données personnelles'
  },
  'secrets': {
    refCode: 'SEC-04',
    name: 'Secrets Exposés',
    description: 'Recherche de secrets et données sensibles dans le code source',
    category: 'Sécurité',
    checkPerformed: 'Analyse le code source pour détecter clés API, tokens, mots de passe, PII exposés',
    complianceImpact: 'Critique - L\'exposition de secrets peut compromettre la sécurité des données'
  },
  'http-security': {
    refCode: 'SEC-05',
    name: 'Sécurité HTTP',
    description: 'Évaluation globale de la sécurité HTTP du site',
    category: 'Sécurité',
    checkPerformed: 'Analyse les en-têtes de sécurité, redirections HTTPS, configuration serveur',
    complianceImpact: 'Élevé - Bonnes pratiques de sécurité web obligatoires'
  },
  'firewall': {
    refCode: 'SEC-06',
    name: 'Pare-feu',
    description: 'Détection des pare-feu applicatifs (WAF)',
    category: 'Sécurité',
    checkPerformed: 'Identifie la présence d\'un WAF et son type (CloudFlare, AWS WAF, etc.)',
    complianceImpact: 'Moyen - Recommandé pour la protection contre les attaques web'
  },
  'hsts': {
    refCode: 'SEC-07',
    name: 'HSTS',
    description: 'Vérification de HTTP Strict Transport Security',
    category: 'Sécurité',
    checkPerformed: 'Vérifie la présence et configuration de l\'en-tête HSTS (max-age, includeSubDomains, preload)',
    complianceImpact: 'Élevé - Force l\'utilisation de HTTPS et protège contre les attaques downgrade'
  },
  'threats': {
    refCode: 'SEC-08',
    name: 'Menaces',
    description: 'Vérification du site contre les bases de données de menaces',
    category: 'Sécurité',
    checkPerformed: 'Interroge Google Safe Browsing, PhishTank, URLHaus pour détecter malware et phishing',
    complianceImpact: 'Critique - Un site compromis expose les visiteurs et l\'organisation'
  },
  'block-lists': {
    refCode: 'SEC-09',
    name: 'Listes de Blocage',
    description: 'Vérification de la présence du domaine sur les listes noires',
    category: 'Sécurité',
    checkPerformed: 'Vérifie le domaine contre les principales listes de blocage (DNSBL, RBL)',
    complianceImpact: 'Élevé - Un domaine bloqué affecte la réputation et la délivrabilité'
  },
  'tls-cipher-suites': {
    refCode: 'SEC-10',
    name: 'Suites de Chiffrement TLS',
    description: 'Analyse des suites de chiffrement TLS supportées',
    category: 'Sécurité',
    checkPerformed: 'Liste les cipher suites, identifie celles obsolètes ou faibles',
    complianceImpact: 'Élevé - Les algorithmes faibles compromettent la confidentialité des données'
  },
  'tls-security-config': {
    refCode: 'SEC-11',
    name: 'Configuration Sécurité TLS',
    description: 'Évaluation de la configuration sécurité TLS',
    category: 'Sécurité',
    checkPerformed: 'Vérifie Perfect Forward Secrecy, OCSP Stapling, certificat intermédiaires',
    complianceImpact: 'Élevé - Configuration critique pour la sécurité des communications'
  },
  'tls-client-support': {
    refCode: 'SEC-12',
    name: 'Support Client TLS',
    description: 'Compatibilité TLS avec différents clients et navigateurs',
    category: 'Sécurité',
    checkPerformed: 'Teste la compatibilité avec différentes versions de navigateurs et clients',
    complianceImpact: 'Moyen - Équilibre entre sécurité et accessibilité'
  },
  'security-txt': {
    refCode: 'SEC-13',
    name: 'Security.txt',
    description: 'Vérification du fichier security.txt standard',
    category: 'Sécurité',
    checkPerformed: 'Vérifie la présence et le contenu du fichier /.well-known/security.txt',
    complianceImpact: 'Moyen - Bonne pratique pour la divulgation responsable des vulnérabilités'
  },
  'exposed-files': {
    refCode: 'SEC-14',
    name: 'Fichiers Exposés',
    description: 'Recherche de fichiers sensibles exposés publiquement',
    category: 'Sécurité',
    checkPerformed: 'Teste l\'accès aux fichiers sensibles (.env, .git, backup, config, etc.)',
    complianceImpact: 'Critique - Les fichiers exposés peuvent révéler des informations sensibles'
  },
  'subdomain-takeover': {
    refCode: 'SEC-15',
    name: 'Subdomain Takeover',
    description: 'Détection de risque de prise de contrôle de sous-domaines',
    category: 'Sécurité',
    checkPerformed: 'Vérifie les CNAME pointant vers des services non réclamés (dangling DNS)',
    complianceImpact: 'Critique - Permet à un attaquant de contrôler un sous-domaine légitime'
  },
  'headers': {
    refCode: 'SEC-16',
    name: 'En-têtes HTTP',
    description: 'Analyse des en-têtes de sécurité HTTP',
    category: 'Sécurité',
    checkPerformed: 'Vérifie CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, etc.',
    complianceImpact: 'Élevé - En-têtes essentiels pour la protection contre les attaques XSS, clickjacking'
  },
  'ports': {
    refCode: 'SEC-17',
    name: 'Ports Ouverts',
    description: 'Scan des ports TCP ouverts sur le serveur',
    category: 'Sécurité',
    checkPerformed: 'Identifie les ports ouverts et les services associés',
    complianceImpact: 'Moyen - Les ports non nécessaires augmentent la surface d\'attaque'
  },

  // === DNS (DNS-XX) ===
  'dns': {
    refCode: 'DNS-01',
    name: 'Enregistrements DNS',
    description: 'Récupération des enregistrements DNS du domaine',
    category: 'DNS',
    checkPerformed: 'Liste les enregistrements A, AAAA, MX, NS, CNAME, SOA, PTR',
    complianceImpact: 'Informatif - Comprendre l\'infrastructure DNS du domaine'
  },
  'dns-server': {
    refCode: 'DNS-02',
    name: 'Serveurs DNS',
    description: 'Analyse des serveurs DNS autoritaires',
    category: 'DNS',
    checkPerformed: 'Identifie les serveurs DNS, leur localisation et configuration',
    complianceImpact: 'Moyen - La résilience DNS affecte la disponibilité du service'
  },
  'dnssec': {
    refCode: 'DNS-03',
    name: 'DNSSEC',
    description: 'Vérification de la signature DNSSEC',
    category: 'DNS',
    checkPerformed: 'Vérifie la présence et validité des enregistrements DNSKEY, DS, RRSIG',
    complianceImpact: 'Moyen - DNSSEC protège contre les attaques DNS spoofing'
  },
  'subdomain-enumeration': {
    refCode: 'DNS-04',
    name: 'Énumération Sous-domaines',
    description: 'Découverte des sous-domaines du domaine analysé',
    category: 'DNS',
    checkPerformed: 'Utilise Certificate Transparency, DNS brute force, zone transfer pour découvrir les sous-domaines',
    complianceImpact: 'Informatif - Cartographie de l\'infrastructure web'
  },
  'txt-records': {
    refCode: 'DNS-05',
    name: 'Enregistrements TXT',
    description: 'Analyse des enregistrements TXT DNS',
    category: 'DNS',
    checkPerformed: 'Liste les enregistrements TXT (SPF, DKIM, DMARC, vérifications de propriété)',
    complianceImpact: 'Moyen - SPF/DKIM/DMARC protègent contre le spoofing email'
  },
  'domain': {
    refCode: 'DNS-06',
    name: 'Informations Domaine',
    description: 'Informations WHOIS du domaine',
    category: 'DNS',
    checkPerformed: 'Récupère les informations d\'enregistrement, dates de création/expiration, registraire',
    complianceImpact: 'Informatif - Identification du propriétaire du domaine'
  },
  'hosts': {
    refCode: 'DNS-07',
    name: 'Noms d\'hôtes',
    description: 'Résolution des noms d\'hôtes associés',
    category: 'DNS',
    checkPerformed: 'Identifie tous les noms d\'hôtes résolvant vers les mêmes IPs',
    complianceImpact: 'Informatif - Vue d\'ensemble de l\'hébergement'
  },

  // === RÉSEAU (NET-XX) ===
  'get-ip': {
    refCode: 'NET-01',
    name: 'Adresse IP',
    description: 'Résolution de l\'adresse IP du serveur',
    category: 'Réseau',
    checkPerformed: 'Récupère les adresses IPv4 et IPv6 du domaine',
    complianceImpact: 'Informatif - Identification du serveur d\'hébergement'
  },
  'location': {
    refCode: 'NET-02',
    name: 'Géolocalisation Serveur',
    description: 'Localisation géographique du serveur',
    category: 'Réseau',
    checkPerformed: 'Identifie le pays, ville, fournisseur d\'accès, coordonnées GPS',
    complianceImpact: 'Élevé - Le RGPD impose des restrictions sur les transferts hors UE'
  },
  'trace-route': {
    refCode: 'NET-03',
    name: 'Traceroute',
    description: 'Trace le chemin réseau vers le serveur',
    category: 'Réseau',
    checkPerformed: 'Affiche les sauts réseau entre le scanner et le serveur cible',
    complianceImpact: 'Informatif - Diagnostic de latence et routage'
  },
  'status': {
    refCode: 'NET-04',
    name: 'Statut Serveur',
    description: 'Vérification de la disponibilité du serveur',
    category: 'Réseau',
    checkPerformed: 'Teste l\'accessibilité HTTP/HTTPS et les codes de réponse',
    complianceImpact: 'Moyen - La disponibilité est essentielle pour les services en ligne'
  },
  'server-info': {
    refCode: 'NET-05',
    name: 'Informations Serveur',
    description: 'Informations détaillées sur le serveur d\'hébergement',
    category: 'Réseau',
    checkPerformed: 'Identifie l\'organisation, fournisseur, ASN, système d\'exploitation',
    complianceImpact: 'Informatif - Contexte sur l\'infrastructure d\'hébergement'
  },

  // === PERFORMANCE (PERF-XX) ===
  'quality': {
    refCode: 'PERF-01',
    name: 'Qualité du Site',
    description: 'Évaluation globale de la qualité du site',
    category: 'Performance',
    checkPerformed: 'Analyse les métriques de performance, accessibilité, bonnes pratiques',
    complianceImpact: 'Moyen - L\'accessibilité est une obligation légale'
  },
  'lighthouse': {
    refCode: 'PERF-02',
    name: 'Lighthouse',
    description: 'Audit Lighthouse complet du site',
    category: 'Performance',
    checkPerformed: 'Exécute les audits Performance, Accessibilité, Bonnes pratiques, SEO',
    complianceImpact: 'Moyen - Metrics Core Web Vitals et accessibilité WCAG'
  },
  'cdn-resources': {
    refCode: 'PERF-03',
    name: 'Ressources CDN',
    description: 'Analyse des ressources tierces chargées',
    category: 'Performance',
    checkPerformed: 'Liste tous les domaines tiers utilisés (CDN, analytics, fonts, etc.)',
    complianceImpact: 'Élevé - Les services tiers US peuvent poser problème pour la conformité RGPD'
  },
  'carbon': {
    refCode: 'PERF-04',
    name: 'Empreinte Carbone',
    description: 'Estimation de l\'empreinte carbone du site',
    category: 'Performance',
    checkPerformed: 'Calcule les émissions CO2 par visite basé sur le poids de page',
    complianceImpact: 'Informatif - Conscience environnementale et responsabilité numérique'
  },

  // === SEO (SEO-XX) ===
  'social-tags': {
    refCode: 'SEO-01',
    name: 'Balises Sociales',
    description: 'Analyse des meta tags pour les réseaux sociaux',
    category: 'SEO',
    checkPerformed: 'Vérifie Open Graph, Twitter Cards, meta description, titre',
    complianceImpact: 'Informatif - Optimisation du partage sur réseaux sociaux'
  },
  'sitemap': {
    refCode: 'SEO-02',
    name: 'Plan du Site',
    description: 'Vérification du sitemap XML',
    category: 'SEO',
    checkPerformed: 'Vérifie la présence et validité du sitemap.xml',
    complianceImpact: 'Informatif - Facilite l\'indexation par les moteurs de recherche'
  },
  'robots-txt': {
    refCode: 'SEO-03',
    name: 'Robots.txt',
    description: 'Analyse du fichier robots.txt',
    category: 'SEO',
    checkPerformed: 'Vérifie les directives d\'indexation pour les moteurs de recherche',
    complianceImpact: 'Informatif - Contrôle de l\'indexation du contenu'
  },
  'linked-pages': {
    refCode: 'SEO-04',
    name: 'Pages Liées',
    description: 'Analyse des liens internes et externes',
    category: 'SEO',
    checkPerformed: 'Liste les liens sortants, identifie les liens cassés',
    complianceImpact: 'Moyen - Les liens vers des sites non sécurisés peuvent exposer les utilisateurs'
  },
  'rank': {
    refCode: 'SEO-05',
    name: 'Classement',
    description: 'Estimation du classement et popularité du site',
    category: 'SEO',
    checkPerformed: 'Récupère les métriques de ranking (Tranco, Umbrella, etc.)',
    complianceImpact: 'Informatif - Indicateur de popularité et confiance'
  },

  // === EMAIL (MAIL-XX) ===
  'mail-config': {
    refCode: 'MAIL-01',
    name: 'Configuration Email',
    description: 'Analyse de la configuration email du domaine',
    category: 'Email',
    checkPerformed: 'Vérifie SPF, DKIM, DMARC, BIMI, enregistrements MX',
    complianceImpact: 'Élevé - Protection contre le spoofing et phishing par email'
  },

  // === AUDIT (AUD-XX) ===
  'link-audit': {
    refCode: 'AUD-01',
    name: 'Audit des Liens',
    description: 'Audit complet des liens et contenu de la page',
    category: 'Audit',
    checkPerformed: 'Vérifie les liens cassés, contenu mixte HTTP/HTTPS, qualité des liens',
    complianceImpact: 'Moyen - Le contenu mixte compromet la sécurité HTTPS'
  },

  // === HISTORIQUE (HIST-XX) ===
  'archives': {
    refCode: 'HIST-01',
    name: 'Archives',
    description: 'Historique du site via Wayback Machine',
    category: 'Historique',
    checkPerformed: 'Récupère l\'historique des scans, changements, versions archivées',
    complianceImpact: 'Informatif - Traçabilité et historique du site'
  },

  // === TECHNIQUE (TECH-XX) ===
  'tech-stack': {
    refCode: 'TECH-01',
    name: 'Technologies Utilisées',
    description: 'Détection des technologies web utilisées',
    category: 'Technique',
    checkPerformed: 'Identifie CMS, frameworks, librairies, services tiers via Wappalyzer',
    complianceImpact: 'Moyen - Certaines technologies peuvent avoir des implications de conformité'
  },
  'redirects': {
    refCode: 'TECH-02',
    name: 'Redirections',
    description: 'Analyse de la chaîne de redirections',
    category: 'Technique',
    checkPerformed: 'Trace les redirections HTTP, vérifie HTTPS redirect, codes de statut',
    complianceImpact: 'Moyen - Les redirections affectent la sécurité et le SEO'
  },
};

/**
 * Mappage simplifié des identifiants de plugins vers leurs codes de référence
 */
export const pluginReferences: Record<string, string> = Object.fromEntries(
  Object.entries(pluginDocumentation).map(([id, doc]) => [id, doc.refCode])
);

/**
 * Obtient le code de référence pour un identifiant de plugin
 * @param pluginId - L'identifiant du plugin (ex: 'ssl', 'cookies')
 * @returns Le code de référence (ex: 'SEC-01') ou undefined si non trouvé
 */
export const getPluginRefCode = (pluginId: string): string | undefined => {
  return pluginReferences[pluginId];
};

/**
 * Obtient la documentation complète d'un plugin
 * @param pluginId - L'identifiant du plugin
 * @returns L'objet de documentation du plugin ou undefined
 */
export const getPluginDocumentation = (pluginId: string): PluginDoc | undefined => {
  return pluginDocumentation[pluginId];
};

/**
 * Obtient la catégorie depuis un code de référence
 * @param refCode - Le code de référence (ex: 'SEC-01')
 * @returns Le préfixe de catégorie (ex: 'SEC')
 */
export const getCategoryFromRefCode = (refCode: string): string => {
  return refCode.split('-')[0];
};

/**
 * Obtient le nom d'affichage de la catégorie en français
 * @param prefix - Le préfixe de catégorie (ex: 'SEC')
 * @returns Le nom de la catégorie en français (ex: 'Sécurité')
 */
export const getCategoryDisplayName = (prefix: string): string => {
  const categoryNames: Record<string, string> = {
    'CONF': 'Conformité',
    'SEC': 'Sécurité',
    'DNS': 'DNS',
    'NET': 'Réseau',
    'PERF': 'Performance',
    'SEO': 'SEO',
    'MAIL': 'E-mail',
    'AUD': 'Audit',
    'HIST': 'Historique',
    'TECH': 'Technique',
  };
  return categoryNames[prefix] || prefix;
};

/**
 * Obtient tous les plugins d'une catégorie
 * @param category - Le nom de la catégorie en français
 * @returns Liste des plugins de cette catégorie
 */
export const getPluginsByCategory = (category: string): PluginDoc[] => {
  return Object.values(pluginDocumentation).filter(doc => doc.category === category);
};

export default pluginReferences;
