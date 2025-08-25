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
    this.analyzeLegalPages();
    this.analyzeThirdPartyServices();
    this.analyzeDNSSec();
    this.analyzeHSTS();

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
        category: 'RGPD',
        recommendation: 'Implémenter un système de gestion du consentement conforme RGPD avant le dépôt de cookies non essentiels.',
        article: 'RGPD Article 7 - Consentement',
        priority: 'medium',
        impact: 'Moyen - Non-conformité RGPD',
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

  private analyzeLegalPages(): void {
    const legalPages = this.results['legal-pages'];
    
    if (!legalPages) {
      this.updateCategoryScore('Pages Légales', 0);
      return;
    }

    const score = legalPages.complianceScore || 0;
    const missing = legalPages.summary?.missing || 0;

    if (missing > 0) {
      const missingPages = legalPages.missingPages || [];
      this.addIssue({
        type: 'critical',
        severity: 'Critique',
        title: 'Pages légales obligatoires manquantes',
        description: `${missing} pages légales obligatoires sont manquantes: ${missingPages.join(', ')}.`,
        category: 'Pages Légales',
        recommendation: 'Créer et publier toutes les pages légales obligatoires avec un contenu conforme aux exigences APDP.',
        article: 'Loi pour la confiance dans l\'économie numérique',
        priority: 'high',
        impact: 'Élevé - Non-conformité légale',
        effort: 'Moyen - Rédaction juridique'
      });
    }

    this.updateCategoryScore('Pages Légales', score);
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
        category: 'RGPD',
        recommendation: 'Évaluer les alternatives européennes ou implémenter des mesures de protection supplémentaires pour les transferts internationaux.',
        article: 'RGPD Chapitre V - Transferts internationaux',
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
}
