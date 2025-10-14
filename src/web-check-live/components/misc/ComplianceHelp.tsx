import styled from '@emotion/styled';
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';

const HelpContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
  
  h2 {
    color: ${colors.primary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid ${colors.primary};
    padding-bottom: 0.5rem;
  }
  
  h3 {
    color: ${colors.textColor};
    font-size: 1.2rem;
    margin: 1.5rem 0 0.8rem;
  }
  
  h4 {
    color: ${colors.textColor};
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: ${colors.textColorSecondary};
    margin-bottom: 1rem;
  }
  
  ul {
    color: ${colors.textColorSecondary};
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  .grade-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    background: ${colors.backgroundLighter};
    border-radius: 8px;
    overflow: hidden;
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid ${colors.borderColor};
    }
    
    th {
      background: ${colors.primary};
      color: white;
      font-weight: 600;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
  }
  
  .highlight-box {
    background: ${colors.backgroundDarker};
    border: 1px solid ${colors.borderColor};
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    
    &.warning {
      background: #fef3c7;
      border-color: #fcd34d;
      color: #92400e;
    }
    
    &.success {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }
    
    &.info {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
    }
  }
  
  .code-block {
    background: ${colors.backgroundDarker};
    border: 1px solid ${colors.borderColor};
    border-radius: 6px;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    overflow-x: auto;
    color: ${colors.textColor};
  }
`;

interface ComplianceHelpProps {
  section?: string;
}

const ComplianceHelp = ({ section = 'overview' }: ComplianceHelpProps): JSX.Element => {
  
  const renderOverview = () => (
    <>
      <h2>📋 Analyse de Conformité APDP</h2>
      
      <div className="highlight-box info">
        <strong>Outil Professionnel APDP Monaco</strong><br/>
        Ce module d'analyse est spécialement conçu pour les contrôleurs de l'Autorité de Protection 
        des Données Personnelles (APDP) de Monaco pour effectuer des audits de conformité professionnels.
      </div>

      <h3>🎯 Fonctionnalités Principales</h3>
      <ul>
        <li><strong>Analyse Multicritères</strong> - Sécurité SSL, cookies, en-têtes, politiques</li>
        <li><strong>Notation Avancée</strong> - Échelle A+ à F avec 12 niveaux de précision</li>
        <li><strong>Références Légales</strong> - Chaque problème lié aux articles APDP spécifiques</li>
        <li><strong>Recommandations Prioritaires</strong> - Actions classées par urgence et échéance</li>
        <li><strong>Rapports Détaillés</strong> - Analyse complète pour documentation officielle</li>
      </ul>

      <h3>🚀 Comment Utiliser</h3>
      <ol>
        <li><strong>Saisir l'URL</strong> - Entrer l'adresse du site à analyser</li>
        <li><strong>Lancer l'analyse</strong> - Cliquer sur "Analyser" pour démarrer</li>
        <li><strong>Consulter les résultats</strong> - Examiner le score et les recommandations</li>
        <li><strong>Planifier les actions</strong> - Suivre le plan d'action prioritaire</li>
        <li><strong>Documenter</strong> - Exporter ou imprimer pour les dossiers officiels</li>
      </ol>

      <div className="highlight-box warning">
        <strong>⚠️ Important</strong><br/>
        Cet outil fournit une assistance technique pour l'analyse de conformité. 
        Les résultats doivent être interprétés par des experts qualifiés et ne remplacent 
        pas l'expertise juridique spécialisée.
      </div>
    </>
  );

  const renderScoring = () => (
    <>
      <h2>📊 Système de Notation</h2>
      
      <h3>Échelle de Notation Détaillée</h3>
      <table className="grade-table">
        <thead>
          <tr>
            <th>Grade</th>
            <th>Score</th>
            <th>Niveau</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>A+</strong></td><td>95-100</td><td>Exemplaire</td><td>Conformité parfaite, modèle de référence</td></tr>
          <tr><td><strong>A</strong></td><td>90-94</td><td>Excellent</td><td>Très haute conformité, optimisations mineures</td></tr>
          <tr><td><strong>A-</strong></td><td>85-89</td><td>Très excellent</td><td>Bonne conformité avec améliorations possibles</td></tr>
          <tr><td><strong>B+</strong></td><td>80-84</td><td>Très bien</td><td>Conformité satisfaisante, corrections recommandées</td></tr>
          <tr><td><strong>B</strong></td><td>75-79</td><td>Bien</td><td>Niveau acceptable, améliorations nécessaires</td></tr>
          <tr><td><strong>B-</strong></td><td>70-74</td><td>Assez bien</td><td>Conformité de base, actions requises</td></tr>
          <tr><td><strong>C+</strong></td><td>65-69</td><td>Correct</td><td>Niveau minimum, surveillance nécessaire</td></tr>
          <tr><td><strong>C</strong></td><td>60-64</td><td>Passable</td><td>Conformité fragile, plan d'action requis</td></tr>
          <tr><td><strong>C-</strong></td><td>55-59</td><td>À améliorer</td><td>Problèmes identifiés, corrections urgentes</td></tr>
          <tr><td><strong>D</strong></td><td>50-54</td><td>Insuffisant</td><td>Non-conformité, actions immédiates</td></tr>
          <tr><td><strong>E</strong></td><td>40-49</td><td>Problématique</td><td>Violations multiples, audit complet</td></tr>
          <tr><td><strong>F</strong></td><td>0-39</td><td>Critique</td><td>Non-conformité grave, suspension recommandée</td></tr>
        </tbody>
      </table>

      <h3>🧮 Calcul du Score</h3>
      <div className="code-block">
        Score Final = Score Base (100) - Pénalités + Bonus<br/><br/>
        
        Pénalités = (Critiques × 15) + (Alertes × 8) + (Améliorations × 3)<br/>
        Bonus = (Éléments Conformes × 2.5) avec bonus dégressif
      </div>

      <h4>Pondération des Issues</h4>
      <ul>
        <li><strong>Problèmes Critiques</strong> - 15 points (vulnérabilités de sécurité majeures)</li>
        <li><strong>Alertes Importantes</strong> - 8 points (problèmes de conformité significatifs)</li>
        <li><strong>Améliorations</strong> - 3 points (optimisations recommandées)</li>
        <li><strong>Éléments Conformes</strong> - +2.5 points (bonnes pratiques détectées)</li>
      </ul>

      <div className="highlight-box success">
        <strong>💡 Conseil</strong><br/>
        Le système de notation privilégie la résolution des problèmes critiques. 
        Corriger une seule vulnérabilité critique peut améliorer significativement le score global.
      </div>
    </>
  );

  const renderCriteria = () => (
    <>
      <h2>🔍 Critères d'Analyse</h2>
      
      <h3>1. Sécurité SSL/TLS</h3>
      <ul>
        <li><strong>Validation du certificat</strong> - Vérification de la validité et de l'expiration</li>
        <li><strong>Algorithmes de chiffrement</strong> - Détection des algorithmes obsolètes (SHA-1)</li>
        <li><strong>Configuration TLS</strong> - Analyse des protocoles et cipher suites</li>
      </ul>
      <p><em>Article APDP concerné : Article 32 - Sécurité du traitement</em></p>

      <h3>2. Gestion des Cookies</h3>
      <ul>
        <li><strong>Attributs de sécurité</strong> - Secure, HttpOnly, SameSite</li>
        <li><strong>Cookies de tracking</strong> - Détection des cookies tiers (Google Analytics, Facebook)</li>
        <li><strong>Cookies d'authentification</strong> - Protection spéciale pour les cookies de session</li>
      </ul>
      <p><em>Articles APDP concernés : Article 6 et 7 - Licéité et consentement</em></p>

      <h3>3. En-têtes de Sécurité</h3>
      <ul>
        <li><strong>Content Security Policy (CSP)</strong> - Protection contre les attaques XSS</li>
        <li><strong>HSTS</strong> - Forcer les connexions HTTPS</li>
        <li><strong>X-Frame-Options</strong> - Protection contre le clickjacking</li>
        <li><strong>X-Content-Type-Options</strong> - Prévention du MIME sniffing</li>
      </ul>
      <p><em>Article APDP concerné : Article 32 - Sécurité du traitement</em></p>

      <h3>4. Politiques de Confidentialité</h3>
      <ul>
        <li><strong>Accessibilité</strong> - Présence et disponibilité des politiques</li>
        <li><strong>URLs standard</strong> - Vérification des emplacements habituels</li>
        <li><strong>Détection automatique</strong> - Recherche dans les liens courants</li>
      </ul>
      <p><em>Articles APDP concernés : Article 13 et 14 - Information des personnes concernées</em></p>

      <h3>5. Collecte de Données et Services Tiers</h3>
      <ul>
        <li><strong>Outils d'analyse</strong> - Google Analytics, Tag Manager, etc.</li>
        <li><strong>Technologies de tracking</strong> - Scripts de suivi et pixels</li>
        <li><strong>Services externes</strong> - Identification des processeurs de données</li>
      </ul>
      <p><em>Articles APDP concernés : Article 6 (Licéité) et Article 28 (Sous-traitant)</em></p>
    </>
  );

  const renderRecommendations = () => (
    <>
      <h2>🎯 Interprétation des Recommandations</h2>
      
      <h3>Classification par Priorité</h3>
      
      <div className="highlight-box warning">
        <h4>🚨 Traitement Immédiat (0-7 jours)</h4>
        <p>Vulnérabilités critiques nécessitant une action urgente :</p>
        <ul>
          <li>Certificats SSL expirés ou invalides</li>
          <li>Cookies d'authentification non sécurisés</li>
          <li>Absence totale de politique de confidentialité</li>
          <li>Failles de sécurité majeures</li>
        </ul>
      </div>

      <div className="highlight-box info">
        <h4>⚡ Correction Rapide (7-30 jours)</h4>
        <p>Problèmes de sécurité et conformité importants :</p>
        <ul>
          <li>En-têtes de sécurité manquants (CSP, HSTS)</li>
          <li>Cookies de tracking sans consentement</li>
          <li>Configuration SSL faible</li>
          <li>Politiques de confidentialité inaccessibles</li>
        </ul>
      </div>

      <div className="highlight-box success">
        <h4>📋 Planification (1-3 mois)</h4>
        <p>Améliorations et optimisations recommandées :</p>
        <ul>
          <li>Implémentation d'un système de gestion du consentement</li>
          <li>Révision des politiques de conservation des données</li>
          <li>Audit des accords avec les sous-traitants</li>
          <li>Formation du personnel à la conformité APDP</li>
        </ul>
      </div>

      <h3>📊 Actions par Type de Score</h3>
      
      <h4>Scores A+ à B+ (80-100 points)</h4>
      <p>Maintenir l'excellence et optimiser :</p>
      <ul>
        <li>Surveillance continue des nouvelles vulnérabilités</li>
        <li>Mise à jour régulière des politiques</li>
        <li>Formation continue des équipes</li>
      </ul>

      <h4>Scores B à C+ (65-79 points)</h4>
      <p>Plan d'amélioration structuré :</p>
      <ul>
        <li>Prioriser les corrections de sécurité</li>
        <li>Mettre à jour les politiques de confidentialité</li>
        <li>Implémenter les en-têtes de sécurité manquants</li>
      </ul>

      <h4>Scores C à D (50-64 points)</h4>
      <p>Action corrective urgente :</p>
      <ul>
        <li>Audit complet de sécurité requis</li>
        <li>Révision complète de la conformité APDP</li>
        <li>Plan d'action détaillé avec échéances</li>
      </ul>

      <h4>Scores E à F (0-49 points)</h4>
      <p>Intervention immédiate critique :</p>
      <ul>
        <li>Suspension recommandée jusqu'à correction</li>
        <li>Audit de sécurité par expert externe</li>
        <li>Refonte complète de l'architecture de sécurité</li>
      </ul>
    </>
  );

  const sections = {
    overview: renderOverview,
    scoring: renderScoring, 
    criteria: renderCriteria,
    recommendations: renderRecommendations
  };

  return (
    <Card heading="Documentation APDP Compliance" styles="grid-column: 1 / -1;">
      <HelpContainer>
        {sections[section as keyof typeof sections] || renderOverview()}
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: colors.backgroundDarker, borderRadius: '8px', fontSize: '0.9rem', color: colors.textColorSecondary }}>
          <p><strong>Support Technique :</strong> OpenPro - <a href="https://openpro.ai" style={{ color: colors.primary }}>https://openpro.ai</a></p>
          <p><strong>Usage Officiel :</strong> Réservé aux contrôleurs APDP Monaco agréés</p>
          <p><strong>Version :</strong> 2024.1 Professional Edition</p>
        </div>
      </HelpContainer>
    </Card>
  );
};

export default ComplianceHelp;






