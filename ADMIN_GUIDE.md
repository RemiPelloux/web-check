# Guide d'Administration APDP Checkit

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Accès au panneau d'administration](#accès-au-panneau-dadministration)
3. [Gestion des utilisateurs](#gestion-des-utilisateurs)
4. [Configuration des plugins](#configuration-des-plugins)
5. [Restrictions IP](#restrictions-ip)
6. [Journal d'audit](#journal-daudit)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Dépannage](#dépannage)

## Vue d'ensemble

Le système APDP Checkit est conçu pour permettre à l'équipe APDP (Autorité de Protection des Données Personnelles) de gérer les accès et les fonctionnalités disponibles pour les utilisateurs DPD (Délégués à la Protection des Données) des différentes entreprises.

### Hiérarchie des rôles

- **APDP** (Administrateur)
  - Accès complet à toutes les fonctionnalités
  - Panneau d'administration
  - Gestion des utilisateurs DPD
  - Configuration des plugins
  - Aucune restriction

- **DPD** (Utilisateur)
  - Accès aux outils d'audit de conformité
  - Restrictions de plugins configurables
  - Restrictions IP optionnelles
  - Pas d'accès à l'administration

## Accès au panneau d'administration

### Connexion

1. Connectez-vous avec vos identifiants APDP :
   - URL : `https://votre-domaine.com/login`
   - Identifiant par défaut : `admin@apdp.mc`
   - Mot de passe par défaut : `Admin@APDP2025!`

2. Une fois connecté, cliquez sur votre nom d'utilisateur dans l'en-tête

3. Sélectionnez **"Administration"** dans le menu déroulant

### Interface d'administration

Le panneau d'administration comprend deux onglets principaux :

1. **👥 Gestion des Utilisateurs** : Créer, modifier et supprimer des comptes DPD
2. **🔌 Configuration des Plugins** : Activer/désactiver des plugins pour les utilisateurs DPD

## Gestion des utilisateurs

### Créer un utilisateur DPD

1. Dans l'onglet "Gestion des Utilisateurs"
2. Cliquez sur **"➕ Ajouter un utilisateur"**
3. Remplissez le formulaire :

   **Nom d'utilisateur** *
   - Format recommandé : `prenom.nom@entreprise.mc`
   - Doit être unique
   - Exemple : `jean.dupont@montecarlosbm.mc`

   **Mot de passe** *
   - Cliquez sur "🎲 Générer" pour créer un mot de passe sécurisé
   - Ou saisissez un mot de passe personnalisé (min. 8 caractères)
   - **Important** : Notez le mot de passe, il ne sera plus visible après la création

   **Rôle**
   - Sélectionnez "DPD - Délégué à la Protection des Données"
   - (Ou "APDP" pour créer un autre administrateur)

   **Restrictions IP** (optionnel)
   - Cochez "Activer les restrictions IP" si nécessaire
   - Saisissez les adresses IP autorisées, séparées par des virgules
   - Exemple : `192.168.1.100, 10.0.0.50, 172.16.0.10`

4. Cliquez sur **"Créer"**

5. **Transmettez les identifiants** à l'utilisateur de manière sécurisée

### Modifier un utilisateur

1. Dans la liste des utilisateurs, cliquez sur **"✏️ Modifier"**
2. Modifiez les champs nécessaires :
   - Nom d'utilisateur
   - Mot de passe (laisser vide pour ne pas changer)
   - Restrictions IP
3. Cliquez sur **"Mettre à jour"**

### Supprimer un utilisateur

1. Dans la liste des utilisateurs, cliquez sur **"🗑️ Supprimer"**
2. Confirmez la suppression dans la boîte de dialogue
3. L'utilisateur est immédiatement supprimé et ne peut plus se connecter

**⚠️ Attention** : Vous ne pouvez pas supprimer votre propre compte.

## Configuration des plugins

### Vue d'ensemble

Les plugins représentent les différentes analyses disponibles dans l'outil. Vous pouvez désactiver certains plugins pour tous les utilisateurs DPD.

**Important** : Les utilisateurs APDP ont toujours accès à tous les plugins, quelles que soient les configurations.

### Catégories de plugins

Les plugins sont organisés par catégorie :

- **📋 Conformité** : Vérifications RGPD, cookies, droits utilisateurs
- **🔒 Sécurité** : SSL/TLS, vulnérabilités, pare-feu, en-têtes HTTP
- **🌐 DNS** : Enregistrements DNS, DNSSEC, sous-domaines
- **📡 Réseau** : Informations serveur, traceroute, ports
- **⚡ Performance** : Qualité du site, empreinte carbone
- **🔍 SEO** : Balises sociales, sitemap, robots.txt
- **📧 Email** : Configuration email
- **⚙️ Technique** : Technologies utilisées, redirections
- **📚 Historique** : Archives du site

### Désactiver des plugins pour les DPD

1. Dans l'onglet "Configuration des Plugins"
2. **Cochez les plugins** que vous souhaitez **désactiver** pour les DPD
3. Un plugin coché = désactivé pour les DPD
4. Cliquez sur **"Enregistrer la configuration"**

**Note** : La configuration s'applique immédiatement à tous les utilisateurs DPD.

### Exemples de configurations

**Restriction minimale (recommandé pour la plupart des DPD)**
- Tous les plugins activés
- Permet une analyse complète

**Restriction modérée (pour les DPD externes)**
- Désactiver : `trace-route`, `ports`, `vulnerabilities`
- Masque certaines informations sensibles du réseau

**Restriction maximale (pour les utilisateurs limités)**
- Activer uniquement les plugins de conformité :
  - Cookies
  - Politique de confidentialité
  - Mentions légales
  - Droits utilisateurs APDP

## Restrictions IP

### Quand utiliser les restrictions IP

Les restrictions IP sont recommandées pour :
- **DPD travaillant depuis des bureaux fixes** avec IP statique
- **Comptes sensibles** nécessitant une sécurité renforcée
- **Conformité avec les politiques de sécurité** de l'entreprise

### Format des adresses IP

```
192.168.1.100, 10.0.0.50, 172.16.0.10
```

- Séparez les adresses par des virgules
- Espaces optionnels
- Format IPv4 standard
- Pas de CIDR (pas de /24)

### Obtenir l'adresse IP d'un utilisateur

1. Demandez à l'utilisateur de visiter : `https://www.whatismyip.com`
2. Ou vérifiez les logs d'audit lors de sa première tentative de connexion
3. Ajoutez l'IP dans les restrictions

### Gérer les IP dynamiques

Si l'utilisateur a une IP dynamique (connexion internet domestique) :
- **Option 1** : Ne pas activer les restrictions IP
- **Option 2** : Demander l'utilisation d'un VPN d'entreprise avec IP fixe
- **Option 3** : Mettre à jour régulièrement la liste des IPs

## Journal d'audit

### Consulter les logs

Les logs d'audit sont stockés automatiquement pour toutes les actions sensibles :

**Actions enregistrées** :
- Connexions et déconnexions
- Création d'utilisateurs
- Modification d'utilisateurs
- Suppression d'utilisateurs
- Modifications de la configuration des plugins
- Violations des restrictions IP
- Tentatives d'accès admin par des DPD

### Accéder aux logs (via database)

```javascript
// Dans le terminal du serveur
node -e "
import { getAuditLogs } from './database/db.js';
const logs = await getAuditLogs(50);
console.table(logs);
"
```

### Informations dans les logs

Chaque entrée contient :
- **ID utilisateur** : Qui a effectué l'action
- **Action** : Type d'action (LOGIN, CREATE_USER, etc.)
- **Détails** : Informations supplémentaires
- **Adresse IP** : D'où l'action a été effectuée
- **Horodatage** : Quand l'action a eu lieu

## Bonnes pratiques

### Sécurité

1. **Changez les mots de passe par défaut immédiatement**
   - admin@apdp.mc
   - dpd@example.mc

2. **Utilisez des mots de passe forts**
   - Minimum 12 caractères
   - Mélange de majuscules, minuscules, chiffres et symboles
   - Utilisez le générateur intégré

3. **Activez les restrictions IP pour les comptes sensibles**
   - Surtout pour les DPD avec accès à des données sensibles

4. **Révisez régulièrement les utilisateurs**
   - Supprimez les comptes inactifs
   - Vérifiez les dernières connexions

5. **Surveillez le journal d'audit**
   - Vérifiez les tentatives de connexion échouées
   - Identifiez les comportements suspects

### Gestion des utilisateurs

1. **Nommez les comptes clairement**
   - Utilisez le format : `prenom.nom@entreprise.mc`
   - Facilite l'identification

2. **Documentez les comptes DPD**
   - Tenez un registre externe avec :
     - Nom complet de l'utilisateur
     - Entreprise
     - Date de création
     - Raison de l'accès
     - Contact

3. **Définissez une politique de rotation des mots de passe**
   - Recommandation : changement tous les 90 jours
   - Informez les DPD à l'avance

4. **Utilisez la fonction de génération de mot de passe**
   - Garantit des mots de passe sécurisés
   - Évite les mots de passe faibles

### Configuration des plugins

1. **Commencez par tout activer**
   - Évaluez les besoins réels avant de restreindre

2. **Testez avec un compte DPD de test**
   - Créez un compte test
   - Vérifiez que les restrictions fonctionnent
   - Supprimez le compte test après validation

3. **Documentez vos choix de configuration**
   - Notez pourquoi certains plugins sont désactivés
   - Facilite la maintenance future

4. **Communiquez les changements aux DPD**
   - Prévenez avant de désactiver des plugins
   - Expliquez les raisons

## Dépannage

### Un utilisateur ne peut pas se connecter

**Problème** : "Identifiants invalides"

**Solutions** :
1. Vérifiez que le nom d'utilisateur est correct (sensible à la casse)
2. Réinitialisez le mot de passe via le panneau admin
3. Vérifiez que le compte existe dans la liste des utilisateurs

**Problème** : "Trop de tentatives"

**Solutions** :
1. L'utilisateur a échoué 5 fois en 15 minutes
2. Attendez 15 minutes et réessayez
3. Ou supprimez les tentatives dans la base de données (avancé)

**Problème** : "Votre adresse IP n'est pas autorisée"

**Solutions** :
1. Vérifiez l'IP actuelle de l'utilisateur
2. Ajoutez l'IP dans les restrictions via le panneau admin
3. Ou désactivez temporairement les restrictions IP

### Un DPD voit le message "Vous n'avez pas accès à cette fonctionnalité"

**Cause** : Le plugin est désactivé pour les DPD

**Solutions** :
1. Allez dans "Configuration des Plugins"
2. Décochez le plugin concerné
3. Enregistrez la configuration
4. Demandez au DPD de rafraîchir la page

### Le panneau admin n'est pas accessible

**Problème** : Le lien "Administration" n'apparaît pas

**Solutions** :
1. Vérifiez que vous êtes connecté avec un compte APDP
2. Vérifiez dans le localStorage : `checkitUserRole` doit être `"APDP"`
3. Déconnectez-vous et reconnectez-vous

**Problème** : Erreur 403 lors de l'accès à /admin

**Solutions** :
1. Token expiré : reconnectez-vous
2. Pas les droits : utilisez un compte APDP

### Erreurs de base de données

**Problème** : "Database locked"

**Cause** : Deux opérations simultanées sur SQLite

**Solutions** :
1. Attendez quelques secondes et réessayez
2. Normal pour des opérations admin concurrentes
3. Si persistant, redémarrez le serveur

**Problème** : "User not found" après création

**Solutions** :
1. Rafraîchissez la liste des utilisateurs
2. Vérifiez que la création a réussi (message de confirmation)
3. Vérifiez dans la base de données directement

### Réinitialiser la base de données

**⚠️ ATTENTION** : Cette opération supprime tous les utilisateurs et la configuration !

```bash
# Sauvegarde
cp database/checkit.db database/checkit.db.backup

# Suppression
rm database/checkit.db

# Réinitialisation
node database/setup.js
```

## Maintenance régulière

### Tâches hebdomadaires

- [ ] Vérifier les tentatives de connexion échouées
- [ ] Examiner le journal d'audit
- [ ] Vérifier les comptes actifs

### Tâches mensuelles

- [ ] Nettoyer les anciennes tentatives de connexion
- [ ] Réviser les restrictions IP
- [ ] Sauvegarder la base de données
- [ ] Vérifier les comptes inactifs (> 30 jours)

### Tâches trimestrielles

- [ ] Forcer le changement des mots de passe
- [ ] Réviser la configuration des plugins
- [ ] Auditer tous les comptes DPD
- [ ] Mettre à jour la documentation

## Commandes utiles

### Lister tous les utilisateurs

```bash
sqlite3 database/checkit.db "SELECT id, username, role, created_at FROM users;"
```

### Voir les dernières connexions

```bash
sqlite3 database/checkit.db "SELECT username, timestamp FROM login_attempts WHERE success=1 ORDER BY timestamp DESC LIMIT 10;"
```

### Compter les tentatives échouées par utilisateur

```bash
sqlite3 database/checkit.db "SELECT username, COUNT(*) as failures FROM login_attempts WHERE success=0 AND timestamp > datetime('now', '-1 day') GROUP BY username;"
```

### Voir les plugins désactivés

```bash
sqlite3 database/checkit.db "SELECT plugin_name FROM disabled_plugins;"
```

### Sauvegarder la base de données

```bash
cp database/checkit.db database/backups/checkit-$(date +%Y%m%d-%H%M%S).db
```

## Contacts et support

### Support technique APDP
- **Email** : support.technique@apdp.mc
- **Téléphone** : +377 XX XX XX XX
- **Horaires** : Lundi-Vendredi, 9h-17h

### Documentation complémentaire
- `AUTHENTICATION.md` : Détails techniques sur l'authentification
- `README.md` : Installation et configuration générale
- Panneau admin : Aide contextuelle disponible

---

**Version** : 2.1.0 - Système Multi-Utilisateurs APDP
**Dernière mise à jour** : Novembre 2025
**Langue** : Français

