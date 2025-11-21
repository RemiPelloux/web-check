/**
 * Comprehensive Compliance Analysis Engine
 * Aggregates all scan results to provide expert-level compliance assessment
 * with specific focus on GDPR, Cloud Act, and Monaco APDP requirements
 */

interface ComplianceIssue {
  id: string;
  type: 'critical' | 'warning' | 'improvement' | 'compliant';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  article?: string;
  category: string;
  priority: number;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  cloudActRelated?: boolean;
  googleServiceDetected?: boolean;
}

interface ComplianceAnalysisResult {
  overallScore: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'E' | 'F';
  numericScore: number;
  complianceLevel: string;
  criticalIssues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  improvements: ComplianceIssue[];
  compliantItems: ComplianceIssue[];
  cloudActWarnings: ComplianceIssue[];
  googleServicesDetected: string[];
  scoreBreakdown: {
    baseScore: number;
    penalties: number;
    bonuses: number;
    finalScore: number;
  };
  detailedAnalysis: {
    cookies: {
      total: number;
      secure: number;
      httpOnly: number;
      sameSite: number;
      thirdParty: number;
      analytics: number;
      advertising: number;
    };
    securityHeaders: {
      present: number;
      total: number;
      missing: string[];
      critical: string[];
    };
    dataCollection: {
      analyticsTools: number;
      trackingPixels: number;
      socialMedia: number;
      advertising: number;
    };
    thirdPartyServices: {
      count: number;
      domains: string[];
      googleServices: string[];
      cloudActSubject: string[];
    };
    encryption: {
      tlsVersion: string;
      cipherStrength: string;
      certificateValid: boolean;
      hstsEnabled: boolean;
    };
    dataTransfers: {
      internationalTransfers: boolean;
      adequacyDecision: boolean;
      safeguards: string[];
    };
  };
  recommendations: Array<{
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actions: string[];
    timeline: string;
    impact: string;
  }>;
  complianceFrameworks: {
    gdpr: { score: number; issues: number; compliant: boolean };
    cloudAct: { risk: 'low' | 'medium' | 'high'; affected: boolean; services: string[] };
    apdp: { score: number; requirements: number; compliant: boolean };
  };
  executiveSummary: string;
  url: string;
  timestamp: string;
}

export class ComplianceAnalyzer {
  private issues: ComplianceIssue[] = [];
  private googleServices: string[] = [];
  private cloudActServices: string[] = [];
  private baseScore = 100;

  /**
   * Main analysis method that aggregates all scan results
   */
  analyzeCompliance(allResults: Record<string, any>, url: string): ComplianceAnalysisResult {
    this.resetAnalysis();
    
    // Analyze each category of results
    this.analyzeCookies(allResults.cookies);
    this.analyzeHeaders(allResults.headers);
    this.analyzeSSL(allResults.ssl);
    this.analyzeTechStack(allResults['tech-stack']);
    this.analyzeCDNResources(allResults['cdn-resources']);
    this.analyzeServerLocation(allResults.location);
    this.analyzeDNS(allResults.dns);
    this.analyzeHSTS(allResults.hsts);
    this.analyzeVulnerabilities(allResults.vulnerabilities);
    this.analyzeLegalPages(allResults['legal-pages']);
    this.analyzeThirdPartyServices(allResults);
    
    // Calculate final scores and categorize issues
    const categorizedIssues = this.categorizeIssues();
    const scoreBreakdown = this.calculateScoreBreakdown();
    const detailedAnalysis = this.generateDetailedAnalysis(allResults);
    
    return {
      overallScore: this.calculateOverallGrade(scoreBreakdown.finalScore),
      numericScore: scoreBreakdown.finalScore,
      complianceLevel: this.getComplianceLevel(scoreBreakdown.finalScore),
      ...categorizedIssues,
      cloudActWarnings: this.generateCloudActWarnings(),
      googleServicesDetected: this.googleServices,
      scoreBreakdown,
      detailedAnalysis,
      recommendations: this.generateRecommendations(),
      complianceFrameworks: this.assessComplianceFrameworks(),
      executiveSummary: this.generateExecutiveSummary(scoreBreakdown.finalScore),
      url,
      timestamp: new Date().toISOString(),
    };
  }

  private resetAnalysis(): void {
    this.issues = [];
    this.googleServices = [];
    this.cloudActServices = [];
    this.baseScore = 100;
  }

  private analyzeCookies(cookiesData: any): void {
    if (!cookiesData || !cookiesData.cookies) return;

    const cookies = cookiesData.cookies;
    let insecureCookies = 0;
    let thirdPartyCookies = 0;
    let trackingCookies = 0;

    cookies.forEach((cookie: any) => {
      if (!cookie.secure || !cookie.httpOnly) {
        insecureCookies++;
      }
      
      if (cookie.domain && cookie.domain !== new URL(cookiesData.url || '').hostname) {
        thirdPartyCookies++;
      }

      // Detect tracking/advertising cookies
      if (cookie.name?.match(/(_ga|_gid|_fbp|_fbc|__utm|_hjid)/i)) {
        trackingCookies++;
        
        // Check for Google Analytics
        if (cookie.name?.match(/(_ga|_gid|__utm)/i)) {
          this.googleServices.push('Google Analytics');
          this.cloudActServices.push('Google Analytics');
        }
      }
    });

    if (insecureCookies > 0) {
      this.addIssue({
        id: 'insecure-cookies',
        type: 'critical',
        severity: 'critical',
        title: 'Cookies de session non sécurisés',
        description: `${insecureCookies} cookie(s) ne respectent pas les flags de sécurité (Secure, HttpOnly, SameSite)`,
        recommendation: 'Configurer tous les cookies avec les flags Secure, HttpOnly et SameSite=Strict pour une sécurité maximale',
        article: 'Article 32 APDP - Sécurité du traitement',
        category: 'Cookies',
        priority: 1,
        impact: 'Exposition des données utilisateur aux attaques XSS et MITM',
        effort: 'low'
      });
    }

    if (thirdPartyCookies > 0) {
      this.addIssue({
        id: 'third-party-cookies',
        type: 'warning',
        severity: 'high',
        title: 'Cookies tiers détectés',
        description: `${thirdPartyCookies} cookie(s) tiers détecté(s) - transfert de données vers des domaines externes`,
        recommendation: 'Implémenter un système de consentement conforme APDP pour tous les cookies tiers',
        article: 'Article 6 APDP - Licéité du traitement',
        category: 'Cookies',
        priority: 2,
        impact: 'Transfert non autorisé de données personnelles',
        effort: 'medium'
      });
    }

    if (trackingCookies > 0) {
      this.addIssue({
        id: 'tracking-cookies',
        type: 'warning',
        severity: 'medium',
        title: 'Cookies de suivi publicitaire',
        description: `${trackingCookies} cookie(s) de suivi détecté(s) sans consentement explicite apparent`,
        recommendation: 'Obtenir le consentement explicite avant le dépôt de cookies de suivi',
        article: 'Article 7 APDP - Conditions applicables au consentement',
        category: 'Cookies',
        priority: 3,
        impact: 'Profilage non autorisé des utilisateurs',
        effort: 'high'
      });
    }
  }

  private analyzeHeaders(headersData: any): void {
    if (!headersData) return;

    const criticalHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy'
    ];

    const missingCritical = criticalHeaders.filter(header => 
      !headersData.headers?.find((h: any) => h.name?.toLowerCase() === header.toLowerCase())
    );

    if (missingCritical.length > 0) {
      this.addIssue({
        id: 'missing-security-headers',
        type: 'critical',
        severity: 'high',
        title: 'En-têtes de sécurité manquants',
        description: `${missingCritical.length} en-tête(s) de sécurité critique(s) manquant(s): ${missingCritical.join(', ')}`,
        recommendation: 'Implémenter tous les en-têtes de sécurité critiques pour protéger contre les attaques XSS, clickjacking et injection',
        article: 'Article 32 APDP - Sécurité du traitement',
        category: 'Sécurité',
        priority: 1,
        impact: 'Vulnérabilités de sécurité critiques',
        effort: 'low'
      });
    }

    // Check for data exposure headers
    const exposureHeaders = ['Server', 'X-Powered-By', 'X-AspNet-Version'];
    const foundExposure = headersData.headers?.filter((h: any) => 
      exposureHeaders.includes(h.name)
    );

    if (foundExposure?.length > 0) {
      this.addIssue({
        id: 'information-disclosure',
        type: 'improvement',
        severity: 'low',
        title: 'Divulgation d\'informations techniques',
        description: `En-têtes révélant des informations sur l'infrastructure: ${foundExposure.map((h: any) => h.name).join(', ')}`,
        recommendation: 'Masquer ou supprimer les en-têtes révélant des informations sur la pile technologique',
        category: 'Sécurité',
        priority: 4,
        impact: 'Facilite la reconnaissance pour les attaquants',
        effort: 'low'
      });
    }
  }

  private analyzeSSL(sslData: any): void {
    if (!sslData) return;

    if (sslData.error || !sslData.validCertificate) {
      this.addIssue({
        id: 'invalid-ssl',
        type: 'critical',
        severity: 'critical',
        title: 'Certificat SSL invalide ou manquant',
        description: 'Le certificat SSL n\'est pas valide ou présente des erreurs critiques',
        recommendation: 'Installer un certificat SSL valide et configurer HTTPS obligatoire',
        article: 'Article 32 APDP - Sécurité du traitement',
        category: 'Chiffrement',
        priority: 1,
        impact: 'Communications non chiffrées exposant les données personnelles',
        effort: 'medium'
      });
    }

    // Check SSL/TLS version
    if (sslData.protocol && sslData.protocol < 'TLSv1.2') {
      this.addIssue({
        id: 'weak-tls',
        type: 'critical',
        severity: 'high',
        title: 'Version TLS obsolète',
        description: `Version TLS ${sslData.protocol} obsolète et vulnérable`,
        recommendation: 'Migrer vers TLS 1.2 minimum, idéalement TLS 1.3',
        article: 'Article 32 APDP - Sécurité du traitement',
        category: 'Chiffrement',
        priority: 1,
        impact: 'Chiffrement faible vulnérable aux attaques',
        effort: 'medium'
      });
    }
  }

  private analyzeTechStack(techStackData: any): void {
    if (!techStackData?.technologies) return;

    const technologies = techStackData.technologies;
    
    // Detect Google services
    const googleTech = technologies.filter((tech: any) => 
      tech.name?.toLowerCase().includes('google') || 
      tech.categories?.some((cat: any) => typeof cat === 'string' && cat.toLowerCase().includes('analytics'))
    );

    googleTech.forEach((tech: any) => {
      if (!this.googleServices.includes(tech.name)) {
        this.googleServices.push(tech.name);
        this.cloudActServices.push(tech.name);
      }
    });

    // Check for outdated technologies
    const outdatedTech = technologies.filter((tech: any) => 
      tech.version && this.isOutdatedVersion(tech.name, tech.version)
    );

    if (outdatedTech.length > 0) {
      this.addIssue({
        id: 'outdated-technologies',
        type: 'warning',
        severity: 'medium',
        title: 'Technologies obsolètes détectées',
        description: `${outdatedTech.length} technologie(s) obsolète(s) présentant des vulnérabilités connues`,
        recommendation: 'Mettre à jour toutes les technologies vers leurs versions les plus récentes',
        category: 'Sécurité',
        priority: 3,
        impact: 'Vulnérabilités de sécurité connues',
        effort: 'high'
      });
    }
  }

  private analyzeCDNResources(cdnData: any): void {
    if (!cdnData?.resources) return;

    const resources = cdnData.resources;
    const googleResources = resources.filter((resource: any) => 
      resource.domain?.includes('google') || 
      resource.domain?.includes('googleapis.com') ||
      resource.domain?.includes('googletagmanager.com')
    );

    if (googleResources.length > 0) {
      googleResources.forEach((resource: any) => {
        const serviceName = this.identifyGoogleService(resource.domain);
        if (!this.googleServices.includes(serviceName)) {
          this.googleServices.push(serviceName);
          this.cloudActServices.push(serviceName);
        }
      });
    }

    // Check for unsecured external resources
    const insecureResources = resources.filter((resource: any) => 
      resource.url?.startsWith('http://') && !resource.url.startsWith('https://')
    );

    if (insecureResources.length > 0) {
      this.addIssue({
        id: 'insecure-external-resources',
        type: 'warning',
        severity: 'medium',
        title: 'Ressources externes non sécurisées',
        description: `${insecureResources.length} ressource(s) externe(s) chargée(s) en HTTP non sécurisé`,
        recommendation: 'Migrer toutes les ressources externes vers HTTPS',
        category: 'Sécurité',
        priority: 2,
        impact: 'Risque d\'interception et de modification des ressources',
        effort: 'medium'
      });
    }
  }

  private analyzeServerLocation(locationData: any): void {
    if (!locationData) return;

    // Check if server is outside EU/EEA
    const nonEUCountries = ['US', 'CN', 'RU', 'IN', 'BR', 'JP', 'KR'];
    if (nonEUCountries.includes(locationData.countryCode)) {
      this.addIssue({
        id: 'non-eu-server',
        type: 'warning',
        severity: 'high',
        title: 'Serveur situé hors UE/EEE',
        description: `Serveur localisé en ${locationData.country} - transfert international de données`,
        recommendation: 'Vérifier les garanties appropriées pour le transfert international (clauses contractuelles types, décision d\'adéquation)',
        article: 'Article 44-49 APDP - Transferts internationaux',
        category: 'Transfert de données',
        priority: 2,
        impact: 'Transfert international non sécurisé',
        effort: 'high'
      });
    }

    // Specific Cloud Act warning for US servers
    if (locationData.countryCode === 'US') {
      this.addIssue({
        id: 'cloud-act-risk',
        type: 'warning',
        severity: 'high',
        title: 'Risque Cloud Act - Serveur US',
        description: 'Serveur localisé aux États-Unis, soumis au Cloud Act permettant l\'accès aux données par les autorités américaines',
        recommendation: 'Évaluer les risques liés au Cloud Act et considérer un hébergement dans l\'UE',
        article: 'Recommandations CNIL sur le Cloud Act',
        category: 'Souveraineté',
        priority: 2,
        impact: 'Accès potentiel aux données par les autorités étrangères',
        effort: 'high',
        cloudActRelated: true
      });
    }
  }

  private analyzeDNS(dnsData: any): void {
    if (!dnsData) return;

    // Check for DNSSEC
    if (dnsData.dnssec === false) {
      this.addIssue({
        id: 'dnssec-missing',
        type: 'improvement',
        severity: 'medium',
        title: 'DNSSEC non configuré',
        description: 'Le domaine ne dispose pas de DNSSEC, exposant aux attaques de manipulation DNS',
        recommendation: 'Activer DNSSEC pour sécuriser les requêtes DNS',
        category: 'Sécurité DNS',
        priority: 3,
        impact: 'Risque de redirection malveillante',
        effort: 'medium'
      });
    }

    // Check for suspicious DNS records
    if (dnsData.records) {
      const suspiciousRecords = dnsData.records.filter((record: any) => 
        record.type === 'TXT' && record.value?.includes('v=spf1 include:_spf.google.com')
      );
      
      if (suspiciousRecords.length > 0) {
        if (!this.googleServices.includes('Google Workspace')) {
          this.googleServices.push('Google Workspace');
          this.cloudActServices.push('Google Workspace');
        }
      }
    }
  }

  private analyzeHSTS(hstsData: any): void {
    if (!hstsData) return;

    if (!hstsData.isEnabled) {
      this.addIssue({
        id: 'hsts-missing',
        type: 'warning',
        severity: 'high',
        title: 'HSTS non configuré',
        description: 'HTTP Strict Transport Security n\'est pas activé',
        recommendation: 'Configurer HSTS avec une durée maximale et includeSubDomains',
        article: 'Article 32 APDP - Sécurité du traitement',
        category: 'Chiffrement',
        priority: 2,
        impact: 'Vulnérabilité aux attaques de downgrade HTTPS',
        effort: 'low'
      });
    }
  }

  private analyzeVulnerabilities(vulnData: any): void {
    if (!vulnData) return;

    if (vulnData.vulnerabilities?.length > 0) {
      const critical = vulnData.vulnerabilities.filter((v: any) => v.severity === 'critical').length;
      const high = vulnData.vulnerabilities.filter((v: any) => v.severity === 'high').length;
      
      if (critical > 0 || high > 0) {
        this.addIssue({
          id: 'security-vulnerabilities',
          type: 'critical',
          severity: 'critical',
          title: 'Vulnérabilités de sécurité détectées',
          description: `${critical} vulnérabilité(s) critique(s) et ${high} haute(s) détectée(s)`,
          recommendation: 'Corriger immédiatement toutes les vulnérabilités critiques et hautes',
          article: 'Article 32 APDP - Sécurité du traitement',
          category: 'Sécurité',
          priority: 1,
          impact: 'Risque de compromission des données',
          effort: 'high'
        });
      }
    }
  }

  private analyzeLegalPages(legalData: any): void {
    if (!legalData) return;

    const requiredPages = ['privacy-policy', 'terms-of-service', 'cookie-policy'];
    const missingPages = requiredPages.filter(page => 
      !legalData.pages?.find((p: any) => p.type === page)
    );

    if (missingPages.length > 0) {
      this.addIssue({
        id: 'missing-legal-pages',
        type: 'critical',
        severity: 'high',
        title: 'Pages légales manquantes',
        description: `${missingPages.length} page(s) légale(s) manquante(s): ${missingPages.join(', ')}`,
        recommendation: 'Créer et publier toutes les pages légales obligatoires',
        article: 'Article 13-14 APDP - Information des personnes',
        category: 'Conformité légale',
        priority: 1,
        impact: 'Non-conformité légale majeure',
        effort: 'medium'
      });
    }
  }

  private analyzeThirdPartyServices(allResults: Record<string, any>): void {
    // Aggregate all detected third-party services
    const allDomains = new Set<string>();
    
    // From CDN resources
    if (allResults['cdn-resources']?.resources) {
      allResults['cdn-resources'].resources.forEach((resource: any) => {
        if (resource.domain) allDomains.add(resource.domain);
      });
    }

    // From cookies
    if (allResults.cookies?.cookies) {
      allResults.cookies.cookies.forEach((cookie: any) => {
        if (cookie.domain) allDomains.add(cookie.domain);
      });
    }

    const thirdPartyCount = allDomains.size;
    
    if (thirdPartyCount > 10) {
      this.addIssue({
        id: 'excessive-third-parties',
        type: 'improvement',
        severity: 'medium',
        title: 'Nombre élevé de services tiers',
        description: `${thirdPartyCount} domaines tiers détectés - complexité de gestion de la conformité`,
        recommendation: 'Auditer et réduire le nombre de services tiers, documenter les DPA (Data Processing Agreements)',
        article: 'Article 28 APDP - Sous-traitant',
        category: 'Sous-traitance',
        priority: 3,
        impact: 'Multiplication des risques de transfert de données',
        effort: 'high'
      });
    }
  }

  private generateCloudActWarnings(): ComplianceIssue[] {
    const warnings: ComplianceIssue[] = [];

    if (this.googleServices.length > 0) {
      warnings.push({
        id: 'google-cloud-act-warning',
        type: 'warning',
        severity: 'high',
        title: 'Avertissement Cloud Act - Services Google détectés',
        description: `Services Google détectés (${this.googleServices.join(', ')}) - soumis au Cloud Act américain`,
        recommendation: 'Évaluer les risques liés au Cloud Act, considérer des alternatives européennes ou implémenter des mesures de protection supplémentaires',
        article: 'Recommandations CNIL et EDPB sur les transferts vers les États-Unis',
        category: 'Souveraineté',
        priority: 1,
        impact: 'Accès potentiel aux données par les autorités américaines',
        effort: 'high',
        cloudActRelated: true,
        googleServiceDetected: true
      });
    }

    return warnings;
  }

  private addIssue(issue: Omit<ComplianceIssue, 'id'> & { id: string }): void {
    this.issues.push(issue);
    
    // Apply score penalties based on severity
    switch (issue.severity) {
      case 'critical':
        this.baseScore -= 15;
        break;
      case 'high':
        this.baseScore -= 10;
        break;
      case 'medium':
        this.baseScore -= 5;
        break;
      case 'low':
        this.baseScore -= 2;
        break;
    }
  }

  private categorizeIssues() {
    return {
      criticalIssues: this.issues.filter(i => i.type === 'critical'),
      warnings: this.issues.filter(i => i.type === 'warning'),
      improvements: this.issues.filter(i => i.type === 'improvement'),
      compliantItems: this.issues.filter(i => i.type === 'compliant')
    };
  }

  private calculateScoreBreakdown() {
    const penalties = Math.max(0, 100 - this.baseScore);
    const bonuses = 0; // Could add bonus points for exemplary practices
    const finalScore = Math.max(0, Math.min(100, this.baseScore + bonuses));

    return {
      baseScore: 100,
      penalties,
      bonuses,
      finalScore
    };
  }

  private calculateOverallGrade(score: number): 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'E' | 'F' {
    if (score >= 98) return 'A+';
    if (score >= 95) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  }

  private getComplianceLevel(score: number): string {
    if (score >= 95) return 'Exemplaire - Conformité renforcée';
    if (score >= 85) return 'Excellent - Pleine conformité';
    if (score >= 75) return 'Satisfaisant - Conformité acceptable';
    if (score >= 65) return 'À améliorer - Non-conformités mineures';
    if (score >= 50) return 'Insuffisant - Non-conformités importantes';
    return 'Critique - Non-conformités majeures';
  }

  private generateDetailedAnalysis(allResults: Record<string, any>) {
    const cookies = allResults.cookies?.cookies || [];
    const headers = allResults.headers?.headers || [];
    
    return {
      cookies: {
        total: cookies.length,
        secure: cookies.filter((c: any) => c.secure).length,
        httpOnly: cookies.filter((c: any) => c.httpOnly).length,
        sameSite: cookies.filter((c: any) => c.sameSite).length,
        thirdParty: cookies.filter((c: any) => c.domain !== new URL(allResults.url || '').hostname).length,
        analytics: cookies.filter((c: any) => c.name?.match(/(_ga|_gid|__utm)/i)).length,
        advertising: cookies.filter((c: any) => c.name?.match(/(_fbp|_fbc)/i)).length,
      },
      securityHeaders: {
        present: headers.length,
        total: 8, // Expected security headers
        missing: this.getMissingSecurityHeaders(headers),
        critical: this.getCriticalMissingHeaders(headers),
      },
      dataCollection: {
        analyticsTools: this.googleServices.filter(s => s.toLowerCase().includes('analytics')).length,
        trackingPixels: 0, // Would need additional analysis
        socialMedia: 0, // Would need additional analysis
        advertising: this.googleServices.filter(s => s.toLowerCase().includes('ads')).length,
      },
      thirdPartyServices: {
        count: this.getAllThirdPartyDomains(allResults).length,
        domains: this.getAllThirdPartyDomains(allResults),
        googleServices: this.googleServices,
        cloudActSubject: this.cloudActServices,
      },
      encryption: {
        tlsVersion: allResults.ssl?.protocol || 'Unknown',
        cipherStrength: allResults.ssl?.cipher || 'Unknown',
        certificateValid: allResults.ssl?.validCertificate || false,
        hstsEnabled: allResults.hsts?.isEnabled || false,
      },
      dataTransfers: {
        internationalTransfers: allResults.location?.countryCode !== 'FR',
        adequacyDecision: this.hasAdequacyDecision(allResults.location?.countryCode),
        safeguards: this.getTransferSafeguards(allResults),
      },
    };
  }

  private generateRecommendations() {
    const criticalIssues = this.issues.filter(i => i.type === 'critical').length;
    const warnings = this.issues.filter(i => i.type === 'warning').length;

    const recommendations = [];

    if (criticalIssues > 0) {
      recommendations.push({
        priority: 'immediate' as const,
        title: 'Traitement immédiat des vulnérabilités critiques',
        description: `${criticalIssues} problème(s) critique(s) nécessitent une action immédiate pour assurer la conformité APDP`,
        actions: [
          'Corriger les configurations de sécurité critiques',
          'Implémenter le chiffrement manquant',
          'Sécuriser les cookies de session'
        ],
        timeline: '0-7 jours',
        impact: 'Réduction immédiate des risques de sécurité et de conformité'
      });
    }

    if (this.googleServices.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        title: 'Évaluation des risques Cloud Act',
        description: 'Services américains détectés nécessitant une évaluation des risques liés au Cloud Act',
        actions: [
          'Analyser l\'impact du Cloud Act sur les données traitées',
          'Considérer des alternatives européennes',
          'Implémenter des mesures de protection supplémentaires'
        ],
        timeline: '30-60 jours',
        impact: 'Conformité renforcée aux recommandations CNIL/EDPB'
      });
    }

    if (warnings > 0) {
      recommendations.push({
        priority: 'medium' as const,
        title: 'Correction des non-conformités secondaires',
        description: `${warnings} avertissement(s) à traiter pour optimiser la conformité`,
        actions: [
          'Réviser les politiques de cookies',
          'Améliorer les en-têtes de sécurité',
          'Documenter les transferts de données'
        ],
        timeline: '60-90 jours',
        impact: 'Amélioration globale de la posture de conformité'
      });
    }

    return recommendations;
  }

  private assessComplianceFrameworks() {
    const criticalCount = this.issues.filter(i => i.type === 'critical').length;
    const warningCount = this.issues.filter(i => i.type === 'warning').length;
    
    return {
      gdpr: {
        score: Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10)),
        issues: criticalCount + warningCount,
        compliant: criticalCount === 0 && warningCount < 3
      },
      cloudAct: {
        risk: this.googleServices.length > 0 ? 'high' as const : 'low' as const,
        affected: this.googleServices.length > 0,
        services: this.cloudActServices
      },
      apdp: {
        score: Math.max(0, 100 - (criticalCount * 15) - (warningCount * 8)),
        requirements: 12, // Monaco APDP specific requirements
        compliant: criticalCount === 0 && warningCount < 2
      }
    };
  }

  private generateExecutiveSummary(score: number): string {
    const grade = this.calculateOverallGrade(score);
    const criticalCount = this.issues.filter(i => i.type === 'critical').length;
    const cloudActRisk = this.googleServices.length > 0 ? 'élevé' : 'faible';
    
    return `Évaluation globale ${grade} (${score}/100). ${criticalCount > 0 ? `${criticalCount} problème(s) critique(s) identifié(s) nécessitant un traitement immédiat.` : 'Aucun problème critique identifié.'} Risque Cloud Act: ${cloudActRisk}${this.googleServices.length > 0 ? ` (${this.googleServices.length} service(s) américain(s) détecté(s))` : ''}. Recommandation: ${criticalCount > 0 ? 'Action immédiate requise' : 'Maintenir le niveau de conformité actuel'}.`;
  }

  // Helper methods
  private isOutdatedVersion(name: string, version: string): boolean {
    // Simplified version check - in real implementation, would check against vulnerability databases
    return false;
  }

  private identifyGoogleService(domain: string): string {
    if (domain.includes('analytics')) return 'Google Analytics';
    if (domain.includes('tagmanager')) return 'Google Tag Manager';
    if (domain.includes('googleapis')) return 'Google APIs';
    if (domain.includes('fonts')) return 'Google Fonts';
    return 'Google Service';
  }

  private getMissingSecurityHeaders(headers: any[]): string[] {
    const required = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
    
    const present = headers.map(h => h.name);
    return required.filter(h => !present.includes(h));
  }

  private getCriticalMissingHeaders(headers: any[]): string[] {
    return this.getMissingSecurityHeaders(headers).filter(h => 
      ['Content-Security-Policy', 'X-Frame-Options'].includes(h)
    );
  }

  private getAllThirdPartyDomains(allResults: Record<string, any>): string[] {
    const domains = new Set<string>();
    
    if (allResults['cdn-resources']?.resources) {
      allResults['cdn-resources'].resources.forEach((r: any) => {
        if (r.domain) domains.add(r.domain);
      });
    }
    
    return Array.from(domains);
  }

  private hasAdequacyDecision(countryCode: string): boolean {
    const adequacyCountries = ['AD', 'AR', 'CA', 'FO', 'GG', 'IL', 'IM', 'JE', 'JP', 'NZ', 'CH', 'UY', 'GB'];
    return adequacyCountries.includes(countryCode);
  }

  private getTransferSafeguards(allResults: Record<string, any>): string[] {
    const safeguards = [];
    if (allResults.ssl?.validCertificate) safeguards.push('Chiffrement en transit');
    if (allResults.hsts?.isEnabled) safeguards.push('HSTS activé');
    return safeguards;
  }
}

export default ComplianceAnalyzer;
