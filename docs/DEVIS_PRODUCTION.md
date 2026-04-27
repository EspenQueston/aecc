# Déploiement & Exploitation Production — AECC

Ce document remplace l’ancienne version orientée “devis” et décrit un **process de déploiement réel, opérationnel et maintenable** pour l’architecture actuelle du projet.

---

## 1) Architecture de déploiement (état cible)

- **Reverse proxy** : Nginx
- **Process manager Node** : PM2 (`ecosystem.config.js`)
- **Application** :
  - Backend Express : `server/server.js`
  - Frontend React buildé : `client-react/dist` (servi par Express)
- **Base de données** : MongoDB (Atlas recommandé)
- **DNS / SSL / WAF / CDN** : Cloudflare
- **Monitoring erreurs** : Sentry (backend + frontend)

---

## 2) Pré-requis serveur

- Ubuntu 22.04 LTS+ (ou équivalent)
- Node.js 20 LTS
- Nginx
- PM2
- Git
- Accès MongoDB (URI Atlas recommandé)

Ports ouverts :
- `22` (SSH)
- `80` (HTTP)
- `443` (HTTPS)

Le port applicatif (`5000` / `5001`) reste en local (`127.0.0.1`).

---

## 3) Variables d’environnement production

Créer `.env` à la racine du projet.

Exemple production (à adapter) :

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<long_random_secret_min_32_chars>
CORS_ORIGINS=https://scholarquest.shop,https://www.scholarquest.shop
ADMIN_EMAILS=admin@aecc.org,admin2@aecc.org

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_pass>
EMAIL_FROM=AECC <noreply@aecc.org>

SENTRY_DSN=<backend_dsn_optional>
VITE_SENTRY_DSN=<frontend_dsn_optional>

# Optionnel Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET=
R2_PUBLIC_URL=
```

Important :
- En production, `server/config/keys.js` exige plusieurs variables critiques (`JWT_SECRET`, `MONGO_URI`, `EMAIL_*`, `CORS_ORIGINS`, `ADMIN_EMAILS`).
- `JWT_SECRET` doit faire au moins 32 caractères.

---

## 4) Installation application (serveur)

```bash
# 1) Cloner
cd /var/www
git clone <repo-url> aecc
cd aecc

# 2) Installer dépendances backend
npm install --production

# 3) Installer dépendances frontend + build
cd client-react
npm install
npm run build
cd ..

# 4) Créer dossiers runtime
mkdir -p uploads logs backups
```

---

## 5) Démarrage avec PM2

Le projet fournit `ecosystem.config.js` avec 2 apps :
- `aecc` (production, port 5000, cluster)
- `aecc-staging` (staging, port 5001)

### Production

```bash
pm2 start ecosystem.config.js --only aecc
pm2 save
pm2 startup
```

### Staging (optionnel)

```bash
pm2 start ecosystem.config.js --only aecc-staging
pm2 save
```

Vérification :

```bash
pm2 status
pm2 logs aecc
```

---

## 6) Configuration Nginx

Deux fichiers exemples existent déjà :
- `nginx.conf` (principal)
- `server/config/staging.scholarquest.shop.nginx` (staging)

### Production (concept)

- `server_name scholarquest.shop www.scholarquest.shop`
- proxy vers `http://127.0.0.1:5000`
- `client_max_body_size 10M`

### Staging (concept)

- `server_name staging.scholarquest.shop`
- proxy vers `http://127.0.0.1:5001`

Après mise en place :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7) Déploiement continu (workflow recommandé)

À chaque release :

```bash
cd /var/www/aecc
git pull origin main
npm install --production
cd client-react && npm install && npm run build && cd ..
pm2 restart aecc
```

Le script `prod:deploy` du `package.json` illustre ce workflow pour votre serveur actuel.

---

## 8) Cloudflare (recommandé)

- DNS A record vers le VPS (`@` + `www`)
- Proxy activé (orange cloud)
- SSL/TLS mode : **Full (Strict)**
- Always HTTPS : activé
- Règles cache :
  - cacher `/assets/*`
  - bypass `/api/*`

---

## 9) Monitoring, logs, alertes

## PM2
- logs `./logs/*.log`
- restart automatique en cas de crash
- `max_memory_restart` configuré dans `ecosystem.config.js`

## Sentry
- backend : `@sentry/node`
- frontend : `@sentry/react`
- activer avec `SENTRY_DSN` et `VITE_SENTRY_DSN`

## Uptime
- monitor conseillé :
  - `https://scholarquest.shop`
  - `https://scholarquest.shop/api/system/health`
  - `https://staging.scholarquest.shop` (si actif)

---

## 10) Sauvegardes

Script disponible : `npm run db:backup`

Recommandations :
- backup quotidien via cron
- conservation glissante (ex: 14 ou 30 jours)
- test de restauration mensuel

Commandes utiles :

```bash
npm run db:backup
npm run db:list-backups
npm run db:restore -- backups/<file>.json
```

---

## 11) Sécurité opérationnelle minimale

- Utiliser un firewall (UFW)
- Désactiver login root SSH + auth par mot de passe si possible
- Rotation régulière des secrets
- Ne jamais commiter de credentials dans `docs/` ou code
- Maintenir dépendances à jour (backend + frontend)

---

## 12) Checklist release production

- [ ] Tests critiques exécutés (au minimum API auth, users, events)
- [ ] Build frontend réussi (`client-react/dist` généré)
- [ ] Variables `.env` validées
- [ ] `pm2 status` healthy
- [ ] `nginx -t` OK
- [ ] Endpoint `/api/system/health` OK
- [ ] Vérification login admin
- [ ] Vérification upload fichier
- [ ] Monitoring actif (Sentry + uptime)

---

## 13) Fichiers de référence

- `ecosystem.config.js`
- `deploy.sh`
- `nginx.conf`
- `server/config/staging.scholarquest.shop.nginx`
- `server/config/keys.js`
- `server/server.js`
