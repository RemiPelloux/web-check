# 🔧 Page 502 - Guide Rapide

## ✨ Ce qui a été créé

Une **belle page de maintenance 502** qui s'affiche automatiquement pendant les déploiements.

### Caractéristiques:
- 🎨 Design moderne avec logo APDP Monaco
- 💫 Animations fluides (particules, barre de progression, pulse)
- 🔄 Auto-refresh toutes les 5 secondes
- 📱 Responsive (mobile & desktop)
- 🇫🇷 Traduction française complète

## 🚀 Installation sur le Serveur

### Méthode Automatique (Recommandée)

```bash
# 1. SSH vers le serveur
ssh sysadm@jetestemonsite.apdp.mc

# 2. Aller dans le répertoire du projet
cd /var/www/checkit

# 3. Lancer le script d'installation
sudo bash setup-502.sh
```

C'est tout! ✅ Le script s'occupe de tout automatiquement.

### Méthode Manuelle

Si le script automatique ne fonctionne pas:

```bash
# 1. SSH vers le serveur
ssh sysadm@jetestemonsite.apdp.mc

# 2. Créer le répertoire public
sudo mkdir -p /var/www/checkit/public

# 3. Le fichier 502.html devrait déjà être là après le déploiement
ls -la /var/www/checkit/public/502.html

# 4. Définir les permissions
sudo chown www-data:www-data /var/www/checkit/public/502.html
sudo chmod 644 /var/www/checkit/public/502.html

# 5. Copier la config nginx
sudo cp /var/www/checkit/nginx-jetestemonsite.conf /etc/nginx/sites-available/jetestemonsite.apdp.mc

# 6. Tester et recharger nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Tester la Page 502

```bash
# Sur le serveur
cd /var/www/checkit
docker compose stop

# Ouvrir le navigateur: https://jetestemonsite.apdp.mc
# Vous devriez voir la belle page de maintenance

# Redémarrer
docker compose start
```

## 📋 Fichiers Créés

- ✅ `public/502.html` - Page de maintenance
- ✅ `nginx-jetestemonsite.conf` - Configuration nginx mise à jour
- ✅ `setup-502.sh` - Script d'installation automatique
- ✅ `DEPLOYMENT_502.md` - Documentation complète

## 🎯 Quand la Page s'Affiche

La page 502 apparaît automatiquement:
- ✅ Pendant `./deploy.sh`
- ✅ Quand Docker redémarre
- ✅ Si le backend est inaccessible
- ✅ En cas de timeout

## 🔍 Vérification

Après installation, vérifier:

```bash
# Fichier existe
ls -la /var/www/checkit/public/502.html

# Nginx OK
sudo nginx -t

# Logs nginx
sudo tail -f /var/log/nginx/jetestemonsite_apdp_mc_error.log
```

## 📚 Documentation Complète

Pour plus de détails, voir: `DEPLOYMENT_502.md`

## 🆘 Support

Si la page ne s'affiche pas:
1. Vérifier que le fichier `502.html` existe
2. Vérifier les permissions (www-data:www-data)
3. Vérifier la config nginx avec `sudo nginx -t`
4. Consulter les logs nginx

---

**APDP Monaco** - Usage professionnel interne

