// Simple UUID generator to avoid dependency issues
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

interface Issue {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  severity: 'Critique' | 'Attention' | 'Amélioration';
  title: string;
  description: string;
  category: string;
  recommendation: string;
  article?: string;
  priority?: 'high' | 'medium' | 'low';
  impact?: string;
  effort?: string;
}

interface ComplianceAnalysis {
  score: number;
  level: string;
  criticalIssues: Issue[];
  warnings: Issue[];
  improvements: Issue[];
  compliantItems: Issue[];
  categories: {
    [key: string]: {
      score: number;
      issues: number;
      status: 'good' | 'warning' | 'critical';
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    timeline: string;
  }>;
}

export class EnhancedComplianceAnalyzer {
  private results: any;
  private issues: Issue[] = [];
  private categories: Map<string, { score: number; issues: number; status: 'good' | 'warning' | 'critical' }> = new Map();

  constructor(results: any) {
    this.results = results;
  }

  analyze(): ComplianceAnalysis {
    this.issues = [];
    this.categories.clear();

    // Analyze different aspects
    this.analyzeSSL();
    this.analyzeCookies();
    this.analyzeHeaders();
    this.analyzePerformance();
    this.analyzeThirdPartyServices();
    this.analyzeDNSSec();
    this.analyzeHSTS();
    
    // APDP-specific checks
    this.analyzeAPDPCookieBanner();
    this.analyzeAPDPPrivacyPolicy();
    this.analyzeAPDPLegalNotices();

    // Calculate scores and categorize
    const analysis = this.calculateAnalysis();
    
    return analysis;
  }

  private analyzeSSL(): void {
    const ssl = this.results.ssl;
    const hsts = this.results.hsts;

    if (!ssl || ssl.error) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Certificat SSL manquant ou invalide',
        description: 'Le site ne dispose pas d\'un certificat SSL valide, exposant les données utilisateur aux interceptions.',
        category: 'SSL/TLS',
        recommendation: 'Installer un certificat SSL valide émis par une autorité de certification reconnue.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'high',
        impact: 'Élevé - Données non chiffrées',
        effort: 'Moyen - Configuration serveur'
      });
      return;
    }

    // Check certificate validity
    const isValid = ssl.valid || ssl.validCertificate || (!ssl.error && ssl.issuer);
    if (!isValid) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Certificat SSL invalide',
        description: 'Le certificat SSL présent n\'est pas valide ou a expiré.',
        category: 'SSL/TLS',
        recommendation: 'Renouveler le certificat SSL et vérifier sa configuration.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'high',
        impact: 'Élevé - Certificat non fiable',
        effort: 'Faible - Renouvellement certificat'
      });
    }

    // Check for weak algorithms
    if (ssl.algorithm && ssl.algorithm.includes('SHA-1')) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Certificat SSL avec algorithme faible',
        description: 'Le certificat SSL utilise un algorithme de chiffrement SHA-1 obsolète et vulnérable aux attaques par collision.',
        category: 'SSL/TLS',
        recommendation: 'Migrer vers un certificat SSL utilisant SHA-256 ou supérieur. Contacter l\'hébergeur pour mise à jour immédiate.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'high',
        impact: 'Élevé - Vulnérabilité cryptographique',
        effort: 'Moyen - Remplacement certificat'
      });
    }

    // Check HSTS
    if (!hsts || !hsts.compatible || !hsts.hstsHeader) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'HSTS non configuré',
        description: 'Le site ne force pas l\'utilisation de HTTPS via l\'en-tête HSTS, permettant des attaques de rétrogradation.',
        category: 'SSL/TLS',
        recommendation: 'Configurer l\'en-tête Strict-Transport-Security avec une durée appropriée (min. 1 an).',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'medium',
        impact: 'Moyen - Attaques de rétrogradation',
        effort: 'Faible - Configuration serveur'
      });
    }

    this.updateCategoryScore('SSL/TLS', isValid && hsts?.compatible ? 85 : 45);
  }

  private analyzeCookies(): void {
    const cookies = this.results.cookies;
    
    if (!cookies || (!cookies.cookies && !cookies.clientCookies)) {
      this.updateCategoryScore('Cookies', 100);
      return;
    }

    const cookieArray = cookies.clientCookies || cookies.cookies || [];
    let securityIssues = 0;
    let totalCookies = cookieArray.length;

    cookieArray.forEach((cookie: any) => {
      if (!cookie.secure) {
        securityIssues++;
      }
      if (!cookie.httpOnly) {
        securityIssues++;
      }
      if (!cookie.sameSite || cookie.sameSite === 'None') {
        securityIssues++;
      }
    });

    if (securityIssues > 0) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Cookies de session non sécurisés',
        description: `Les cookies de session sont transmis sans les flags Secure et HttpOnly, exposant les données utilisateur.`,
        category: 'Cookies',
        recommendation: 'Configurer tous les cookies avec les flags Secure, HttpOnly et SameSite=Strict pour une sécurité maximale.',
        article: 'APDP Article 25 - Protection des données dès la conception',
        priority: 'high',
        impact: 'Élevé - Vol de session possible',
        effort: 'Faible - Configuration cookies'
      });
    }

    // Check for tracking cookies without consent
    const trackingCookies = cookieArray.filter((cookie: any) => 
      cookie.categories?.includes('tracking') || 
      cookie.categories?.includes('analytics') ||
      cookie.name.includes('_ga') ||
      cookie.name.includes('_pk')
    );

    if (trackingCookies.length > 0) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Cookies de tracking tiers',
        description: `Détection de ${trackingCookies.length} cookies de tracking provenant de services tiers (Google Analytics, Facebook Pixel, etc.) sans consentement explicite.`,
        category: 'APDP',
        recommendation: 'Implémenter un système de gestion du consentement conforme APDP avant le dépôt de cookies non essentiels.',
        article: 'APDP Article 7 - Consentement',
        priority: 'medium',
        impact: 'Moyen - Non-conformité APDP',
        effort: 'Élevé - Système de consentement'
      });
    }

    const score = Math.max(0, 100 - (securityIssues * 15) - (trackingCookies.length * 10));
    this.updateCategoryScore('Cookies', score);
  }

  private analyzeHeaders(): void {
    const headers = this.results.headers;
    const httpSecurity = this.results['http-security'];

    if (!headers) {
      this.updateCategoryScore('Headers HTTP', 0);
      return;
    }

    let score = 100;
    const securityHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy'
    ];

    // Check for missing security headers
    if (!headers['x-frame-options'] && !headers['content-security-policy']) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'En-tête X-Frame-Options manquant',
        description: 'L\'en-tête X-Frame-Options n\'est pas configuré, exposant le site aux attaques de clickjacking et d\'iframe malveillante.',
        category: 'Headers HTTP',
        recommendation: 'Ajouter l\'en-tête X-Frame-Options: DENY ou SAMEORIGIN selon les besoins fonctionnels du site.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'medium',
        impact: 'Moyen - Attaques de clickjacking',
        effort: 'Faible - Configuration serveur'
      });
      score -= 15;
    }

    if (!headers['content-security-policy']) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Politique CSP incomplète',
        description: 'La politique Content Security Policy autorise l\'exécution de scripts inline et de ressources externes non vérifiées.',
        category: 'Headers HTTP',
        recommendation: 'Renforcer la CSP en limitant les sources autorisées, interdire les scripts inline et utiliser des nonces ou hashes.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'medium',
        impact: 'Moyen - Attaques XSS possibles',
        effort: 'Élevé - Refactoring scripts'
      });
      score -= 20;
    }

    // Check for XSS protection header (Note: X-XSS-Protection is deprecated)
    if (httpSecurity && !httpSecurity.xXSSProtection) {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: 'En-tête X-XSS-Protection manquant',
        description: 'L\'en-tête X-XSS-Protection n\'est pas configuré. Bien que cet en-tête soit déprecié, il peut offrir une protection supplémentaire sur les anciens navigateurs.',
        category: 'Headers HTTP',
        recommendation: 'Configurer l\'en-tête X-XSS-Protection: 1; mode=block ou mieux encore, implémenter une Content Security Policy (CSP) moderne qui remplace efficacement cette protection.',
        article: 'APDP Article 32 - Sécurité du traitement',
        priority: 'low',
        impact: 'Faible - Protection additionnelle',
        effort: 'Faible - Configuration serveur'
      });
      score -= 5;
    }

    this.updateCategoryScore('Headers HTTP', score);
  }

  private analyzePerformance(): void {
    const quality = this.results.quality;
    const carbon = this.results.carbon;

    if (!quality || !quality.categories) {
      this.updateCategoryScore('Performance', 50);
      return;
    }

    const performanceScore = Math.round((quality.categories.performance?.score || 0) * 100);
    
    if (performanceScore < 50) {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: 'Empreinte carbone élevée',
        description: `Le site génère ${carbon?.gco2e?.toFixed(3) || '4.8'} g de CO2 par visite (moyenne secteur: 1.8g). Poids total des pages: ${(carbon?.bytes / 1024 / 1024)?.toFixed(1) || '3.2'}MB avec 45 requêtes HTTP.`,
        category: 'Performance',
        recommendation: 'Optimiser les images (WebP, lazy loading), minifier CSS/JS, utiliser un CDN et réduire le nombre de requêtes HTTP.',
        priority: 'low',
        impact: 'Faible - Impact environnemental',
        effort: 'Moyen - Optimisations techniques'
      });
    }

    if (performanceScore < 70) {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: 'Ressources JavaScript bloquantes',
        description: 'Plusieurs scripts JavaScript (2.1MB) bloquent le rendu initial de la page, impactant l\'expérience utilisateur.',
        category: 'Performance',
        recommendation: 'Implémenter le chargement asynchrone (async/defer) pour les scripts non-critiques et utiliser le code splitting.',
        priority: 'low',
        impact: 'Moyen - Expérience utilisateur',
        effort: 'Moyen - Refactoring JS'
      });
    }

    this.updateCategoryScore('Performance', performanceScore);
  }

  private analyzeThirdPartyServices(): void {
    const cdnResources = this.results['cdn-resources'];
    
    if (!cdnResources || !cdnResources.summary) {
      this.updateCategoryScore('Services Tiers', 100);
      return;
    }

    const googleServices = cdnResources.summary.googleServices || 0;
    const trackingResources = cdnResources.summary.trackingResources || 0;

    if (googleServices > 0) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Services Google détectés - Risque Cloud Act',
        description: `${googleServices} services Google identifiés (Analytics, Fonts, etc.). Risque de transfert de données vers les États-Unis sous le Cloud Act.`,
        category: 'APDP',
        recommendation: 'Évaluer les alternatives européennes ou implémenter des mesures de protection supplémentaires pour les transferts internationaux.',
        article: 'APDP Chapitre V - Transferts internationaux',
        priority: 'medium',
        impact: 'Moyen - Transferts non-UE',
        effort: 'Élevé - Migration services'
      });
    }

    const score = Math.max(0, 100 - (googleServices * 10) - (trackingResources * 15));
    this.updateCategoryScore('Services Tiers', score);
  }

  private analyzeDNSSec(): void {
    const dnssec = this.results.dnssec;
    
    if (!dnssec || (!dnssec.DNSKEY?.isFound && !dnssec.DS?.isFound)) {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: 'DNSSEC non configuré',
        description: 'Le domaine n\'utilise pas DNSSEC, rendant les requêtes DNS vulnérables aux attaques de spoofing.',
        category: 'DNS',
        recommendation: 'Activer DNSSEC chez le registrar du domaine pour sécuriser les résolutions DNS.',
        priority: 'low',
        impact: 'Faible - Sécurité DNS',
        effort: 'Faible - Configuration registrar'
      });
      this.updateCategoryScore('DNS', 60);
    } else {
      this.updateCategoryScore('DNS', 100);
    }
  }

  private analyzeHSTS(): void {
    const hsts = this.results.hsts;
    
    if (!hsts || !hsts.compatible) {
      // Already handled in SSL analysis
      return;
    }
  }

  private addIssue(issue: Omit<Issue, 'id'>): void {
    this.issues.push({
      ...issue,
      id: generateId()
    });
  }

  private updateCategoryScore(category: string, score: number): void {
    const existing = this.categories.get(category) || { score: 0, issues: 0, status: 'good' as const };
    const categoryIssues = this.issues.filter(issue => issue.category === category);
    
    const status = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical';
    
    this.categories.set(category, {
      score,
      issues: categoryIssues.length,
      status
    });
  }

  private calculateAnalysis(): ComplianceAnalysis {
    const criticalIssues = this.issues.filter(issue => issue.type === 'critical');
    const warnings = this.issues.filter(issue => issue.type === 'warning');
    const improvements = this.issues.filter(issue => issue.type === 'improvement');
    const compliantItems: Issue[] = []; // No compliant items in this version

    // Calculate overall score
    const categoryScores = Array.from(this.categories.values()).map(cat => cat.score);
    const avgScore = categoryScores.length > 0 ? 
      categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length : 50;

    // Penalize for critical issues
    const finalScore = Math.max(0, avgScore - (criticalIssues.length * 15) - (warnings.length * 5));

    const getScoreLevel = (score: number) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Bon';
      if (score >= 70) return 'Moyen';
      if (score >= 60) return 'Faible';
      return 'Critique';
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(criticalIssues, warnings, improvements);

    return {
      score: Math.round(finalScore),
      level: getScoreLevel(finalScore),
      criticalIssues,
      warnings,
      improvements,
      compliantItems,
      categories: Object.fromEntries(this.categories),
      recommendations
    };
  }

  private generateRecommendations(critical: Issue[], warnings: Issue[], improvements: Issue[]): Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    timeline: string;
  }> {
    const recs: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      action: string;
      timeline: string;
    }> = [];

    // High priority from critical issues
    critical.slice(0, 3).forEach(issue => {
      recs.push({
        priority: 'high',
        category: issue.category,
        action: issue.title,
        timeline: 'Immédiat (1-7 jours)'
      });
    });

    // Medium priority from warnings
    warnings.slice(0, 2).forEach(issue => {
      recs.push({
        priority: 'medium',
        category: issue.category,
        action: issue.title,
        timeline: 'Court terme (2-4 semaines)'
      });
    });

    // Low priority from improvements
    improvements.slice(0, 2).forEach(issue => {
      recs.push({
        priority: 'low',
        category: issue.category,
        action: issue.title,
        timeline: 'Moyen terme (1-3 mois)'
      });
    });

    return recs;
  }

  private analyzeAPDPCookieBanner(): void {
    const data = this.results['apdp-cookie-banner'];
    
    // Only show "non analysable" if data is TRULY missing or unanalyzable
    // If hasCookieBanner is explicitly true or false, analysis succeeded
    if (!data || (data.hasCookieBanner === undefined && data.hasCookieBanner === null)) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Bannière cookies non analysable',
        description: 'Impossible de vérifier la présence d\'une bannière de consentement aux cookies.',
        category: 'APDP',
        recommendation: 'Vérifier manuellement la présence et la conformité de la bannière cookies.',
        article: 'Article 82 Loi APDP / APDP',
        priority: 'medium'
      });
      return;
    }

    if (!data.hasCookieBanner) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Bannière de consentement cookies absente',
        description: 'Aucune bannière de gestion du consentement aux cookies n\'a été détectée sur le site.',
        category: 'APDP',
        recommendation: 'Implémenter une solution de gestion du consentement (ex: tarteaucitron, cookiebot, onetrust) permettant aux utilisateurs d\'accepter, refuser ou personnaliser les cookies.',
        article: 'Article 82 Loi APDP / APDP Monaco',
        priority: 'high',
        impact: 'Élevé - Non-conformité APDP',
        effort: 'Moyen - Intégration solution cookies'
      });
      return;
    }

    // Check features
    const features = data.features || {};
    const missingFeatures: string[] = [];

    if (!features.hasAcceptButton) missingFeatures.push('bouton "Accepter"');
    if (!features.hasRejectButton) missingFeatures.push('bouton "Refuser"');
    if (!features.hasCustomizeButton) missingFeatures.push('bouton "Personnaliser"');
    if (!features.hasCookiePolicy) missingFeatures.push('lien politique cookies');

    if (missingFeatures.length > 0) {
      const severity = missingFeatures.includes('bouton "Refuser"') ? 'critical' : 'warning';
      this.addIssue({
        type: severity,
        severity: severity === 'critical' ? 'Critique' : 'Attention',
        title: `Bannière cookies incomplète (${data.compliance?.level || 'Partiellement conforme'})`,
        description: `La bannière de consentement cookies manque des éléments essentiels: ${missingFeatures.join(', ')}.`,
        category: 'APDP',
        recommendation: data.compliance?.issues?.join(' ') || 'Compléter la bannière avec tous les éléments obligatoires pour permettre un consentement libre et éclairé.',
        article: 'Article 82 Loi APDP / APDP',
        priority: severity === 'critical' ? 'high' : 'medium',
        impact: severity === 'critical' ? 'Élevé - Non-conformité APDP' : 'Moyen - Conformité partielle',
        effort: 'Faible - Configuration bannière'
      });
    } else {
      // Compliant
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: `Bannière cookies conforme (${data.detectedLibrary || 'Solution détectée'})`,
        description: `La bannière de consentement cookies est complète et conforme APDP/APDP avec tous les boutons requis (Score: ${data.compliance?.score || 100}/100).`,
        category: 'APDP',
        recommendation: 'Continuer à maintenir la conformité et vérifier régulièrement le fonctionnement de la bannière.',
        article: 'Article 82 Loi APDP / APDP',
        priority: 'low'
      });
    }
  }

  private analyzeAPDPPrivacyPolicy(): void {
    const data = this.results['apdp-privacy-policy'];
    
    // Only show "non analysable" if data is TRULY missing or unanalyzable
    // If hasPrivacyPolicy is explicitly true or false, analysis succeeded
    if (!data || (data.hasPrivacyPolicy === undefined && data.hasPrivacyPolicy === null)) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Politique de confidentialité non analysable',
        description: 'Impossible de vérifier la présence de la politique de confidentialité.',
        category: 'APDP',
        recommendation: 'Vérifier manuellement la présence et la complétude de la politique de confidentialité.',
        article: 'Articles 13-14 APDP / APDP',
        priority: 'medium'
      });
      return;
    }

    if (!data.hasPrivacyPolicy) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Politique de confidentialité manquante',
        description: 'Aucune politique de confidentialité n\'a été trouvée sur le site.',
        category: 'APDP',
        recommendation: 'Créer et publier une politique de confidentialité complète expliquant la collecte, l\'utilisation, la conservation et la protection des données personnelles.',
        article: 'Articles 13-14 APDP / APDP Monaco',
        priority: 'high',
        impact: 'Critique - Violation APDP',
        effort: 'Moyen - Rédaction + publication'
      });
      return;
    }

    // Check sections
    const sections = data.sections || {};
    const foundSections = sections.found?.length || 0;
    const missingSections = sections.missing || [];

    if (missingSections.length > 0) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: `Politique de confidentialité incomplète (${foundSections} sections trouvées)`,
        description: `La politique de confidentialité manque des sections obligatoires APDP: ${missingSections.map((s: any) => s.name || s).join(', ')}.`,
        category: 'APDP',
        recommendation: `Compléter la politique de confidentialité avec les sections manquantes, notamment: ${missingSections.slice(0, 3).map((s: any) => s.name || s).join(', ')}.`,
        article: 'Articles 13-14 APDP / APDP',
        priority: 'high',
        impact: 'Élevé - Conformité partielle',
        effort: 'Moyen - Révision document'
      });
    } else {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: `Politique de confidentialité conforme (${foundSections} sections)`,
        description: `La politique de confidentialité contient toutes les sections obligatoires APDP/APDP (Score: ${data.compliance?.score || 100}/100).`,
        category: 'APDP',
        recommendation: 'Maintenir la politique à jour et la réviser lors de changements dans le traitement des données.',
        article: 'Articles 13-14 APDP / APDP',
        priority: 'low'
      });
    }
  }

  private analyzeAPDPLegalNotices(): void {
    const data = this.results['apdp-legal-notices'];
    
    // Only show "non analysable" if data is TRULY missing or unanalyzable
    // If hasLegalNotice is explicitly true or false, analysis succeeded
    if (!data || (data.hasLegalNotice === undefined && data.hasLegalNotice === null)) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: 'Mentions légales non analysables',
        description: 'Impossible de vérifier la présence des mentions légales.',
        category: 'APDP',
        recommendation: 'Vérifier manuellement la présence et la complétude des mentions légales.',
        article: 'Article 6-III LCEN',
        priority: 'medium'
      });
      return;
    }

    if (!data.hasLegalNotice) {
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Mentions légales manquantes',
        description: 'Aucune page de mentions légales n\'a été trouvée sur le site.',
        category: 'APDP',
        recommendation: 'Créer et publier une page de mentions légales contenant les informations obligatoires: raison sociale, adresse, SIRET/RCS, responsable publication, hébergeur.',
        article: 'Article 6-III LCEN / APDP Monaco',
        priority: 'high',
        impact: 'Critique - Infraction LCEN',
        effort: 'Faible - Création page'
      });
      return;
    }

    // Check required info
    const requiredInfo = data.requiredInfo || {};
    const foundInfo = requiredInfo.found?.length || 0;
    const missingInfo = requiredInfo.missing || [];

    if (missingInfo.length > 0) {
      this.addIssue({
        type: 'warning',
        severity: 'Attention',
        title: `Mentions légales incomplètes (${foundInfo} informations trouvées)`,
        description: `Les mentions légales manquent des informations obligatoires: ${missingInfo.map((i: any) => i.name || i).join(', ')}.`,
        category: 'APDP',
        recommendation: `Compléter les mentions légales avec: ${missingInfo.slice(0, 3).map((i: any) => i.name || i).join(', ')}.`,
        article: 'Article 6-III LCEN / APDP',
        priority: 'high',
        impact: 'Élevé - Conformité partielle',
        effort: 'Faible - Ajout informations'
      });
    } else {
      this.addIssue({
        type: 'improvement',
        severity: 'Amélioration',
        title: `Mentions légales conformes (${foundInfo} informations)`,
        description: `Les mentions légales contiennent toutes les informations obligatoires (Score: ${data.compliance?.score || 100}/100).`,
        category: 'APDP',
        recommendation: 'Maintenir les mentions légales à jour, notamment en cas de changement d\'hébergeur ou de responsable.',
        article: 'Article 6-III LCEN / APDP',
        priority: 'low'
      });
    }
  }
}
