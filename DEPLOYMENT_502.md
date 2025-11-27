# Configuration de la Page 502 - Guide de Déploiement

## 📋 Vue d'ensemble

Une belle page 502 a été créée pour s'afficher pendant les déploiements et les maintenances.

## 🎨 Caractéristiques de la Page

✅ Design moderne et professionnel
✅ Animation de chargement
✅ Barre de progression animée
✅ Logo APDP Monaco avec effet pulse
✅ Particules animées en arrière-plan
✅ Auto-refresh toutes les 5 secondes
✅ Responsive (mobile/desktop)
✅ Traduction française complète

## 📁 Fichiers Créés/Modifiés

1. **`public/502.html`** - Page de maintenance
2. **`nginx-jetestemonsite.conf`** - Configuration nginx mise à jour

## 🚀 Instructions de Déploiement

### Étape 1: Déployer les fichiers

```bash
# Déployer le code comme d'habitude
./deploy.sh
```

### Étape 2: Copier la page 502 sur le serveur

```bash
# SSH vers le serveur
ssh sysadm@jetestemonsite.apdp.mc

# Créer le répertoire public si nécessaire
sudo mkdir -p /var/www/checkit/public

# Copier le fichier 502.html
sudo cp /var/www/checkit/public/502.html /var/www/checkit/public/502.html

# Vérifier que le fichier existe
ls -la /var/www/checkit/public/502.html
```

### Étape 3: Mettre à jour la configuration nginx

```bash
# Sur le serveur
sudo cp /var/www/checkit/nginx-jetestemonsite.conf /etc/nginx/sites-available/jetestemonsite.apdp.mc

# Vérifier la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

## 🧪 Tester la Page 502

### Méthode 1: Arrêter temporairement le service

```bash
# Sur le serveur
cd /var/www/checkit
docker compose stop

# Tester dans le navigateur: https://jetestemonsite.apdp.mc
# Vous devriez voir la page 502

# Redémarrer le service
docker compose start
```

### Méthode 2: Simuler une erreur nginx

```bash
# Créer une règle temporaire pour forcer le 502
sudo nano /etc/nginx/sites-available/jetestemonsite.apdp.mc

# Ajouter temporairement dans location /:
return 502;

# Recharger
sudo nginx -t && sudo systemctl reload nginx

# Tester, puis retirer la ligne et recharger
```

## 📝 Configuration Nginx Expliquée

### Nouvelles directives ajoutées:

```nginx
# Définir quelle page afficher pour les erreurs 502, 503, 504
error_page 502 503 504 /502.html;

# Localisation de la page 502
location = /502.html {
    root /var/www/checkit/public;  # Chemin vers le fichier
    internal;                       # Empêche l'accès direct
}

# Intercepter les erreurs des proxies
proxy_intercept_errors on;  # Ajouté aux locations / et /api

# Permettre l'accès aux assets même pendant la maintenance
location /assets/ {
    root /var/www/checkit/dist/client;
    try_files $uri =404;
}
```

## 🎯 Comportement

### Quand la page 502 s'affiche:

1. **Pendant un déploiement** - Quand Docker redémarre
2. **Service arrêté** - Quand le conteneur n'est pas running
3. **Backend inaccessible** - Erreur de connexion au port 3003/3004
4. **Timeout** - Si le service ne répond pas

### Auto-refresh:

La page se rafraîchit automatiquement toutes les 5 secondes pour vérifier si le service est de retour.

## 🔧 Personnalisation

### Modifier le délai de rafraîchissement:

Dans `public/502.html`, ligne ~358:

```javascript
setTimeout(function() {
    window.location.reload();
}, 5000);  // Changer 5000 (5 secondes) selon vos besoins
```

### Modifier les messages:

Éditez directement le fichier HTML, toutes les traductions sont en français.

## ✅ Vérification

Après le déploiement, vérifier:

1. ✅ Le fichier existe: `/var/www/checkit/public/502.html`
2. ✅ Nginx est rechargé sans erreur
3. ✅ La page s'affiche correctement pendant un redémarrage
4. ✅ L'auto-refresh fonctionne
5. ✅ Le logo APDP s'affiche correctement

## 🐛 Dépannage

### La page 502 ne s'affiche pas:

```bash
# Vérifier que le fichier existe
ls -la /var/www/checkit/public/502.html

# Vérifier les permissions
sudo chmod 644 /var/www/checkit/public/502.html
sudo chown www-data:www-data /var/www/checkit/public/502.html

# Vérifier les logs nginx
sudo tail -f /var/log/nginx/error.log
```

### Le logo ne s'affiche pas:

Le logo utilise le chemin `/assets/images/Logo-APDP.svg`. Vérifier que:

1. Le fichier existe dans `dist/client/assets/images/`
2. La location `/assets/` est configurée dans nginx

## 📊 Logs

Pour surveiller les erreurs 502:

```bash
# Voir les erreurs en temps réel
sudo tail -f /var/log/nginx/jetestemonsite_apdp_mc_error.log

# Compter les occurrences de 502
sudo grep "502" /var/log/nginx/jetestemonsite_apdp_mc_access.log | wc -l
```

## 🎨 Aperçu Visuel

La page 502 inclut:

- 🎨 Dégradé de fond sombre élégant
- 💫 Particules animées flottantes
- 🔧 Icône de maintenance animée
- 📊 Barre de progression en boucle
- ✅ Liste des étapes de déploiement
- 🔄 Bouton de rafraîchissement manuel
- 📱 Design responsive

## 🚀 Prochaines Étapes

Une fois déployé, la page 502 s'affichera automatiquement pendant:

1. Les déploiements avec `./deploy.sh`
2. Les redémarrages Docker
3. Les maintenances planifiées
4. Les erreurs temporaires de service

Aucune intervention manuelle nécessaire! 🎉

