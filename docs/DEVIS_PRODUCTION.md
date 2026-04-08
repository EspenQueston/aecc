# Devis de Production — AECC Platform

---

## 1. Serveur (VPS / Cloud)

### Option A — DigitalOcean (Recommandé — actuel)

| Ressource | Spécification | Prix/mois |
|---|---|---|
| **Droplet (VPS)** | 2 vCPU, 4 Go RAM, 80 Go SSD NVMe | **$24** |
| Bande passante | 4 To/mois inclus | Inclus |
| Datacenter | Frankfurt (EU) ou Singapore (Asie) | — |

### Option B — Hetzner (Alternative économique)

| Ressource | Spécification | Prix/mois |
|---|---|---|
| **CPX21** | 3 vCPU, 4 Go RAM, 80 Go SSD | **€5,39** (~$6) |
| **CPX31** | 4 vCPU, 8 Go RAM, 160 Go SSD | **€10,49** (~$11) |
| Bande passante | 20 To/mois inclus | Inclus |
| Datacenter | Falkenstein/Nuremberg (Allemagne) | — |

---

## 2. Base de Données (MongoDB)

### Option A — MongoDB Atlas (Recommandé — actuel)

| Plan | Spécification | Prix/mois |
|---|---|---|
| **M0 (Free)** | 512 Mo stockage, cluster partagé | **$0** (dev/staging) |
| **M10 (Production)** | 2 Go RAM, 10 Go stockage, backups auto, monitoring | **$57** |
| **M20** | 4 Go RAM, 20 Go stockage, analytics avancé | **$140** |

### Option B — MongoDB auto-hébergé sur le VPS

| Configuration | Détail | Prix |
|---|---|---|
| MongoDB Community | Installé sur le même VPS | **$0** (inclus dans le VPS) |
| Backup quotidien | Script `mongodump` → Cloudflare R2 ou S3 | ~$1-3/mois stockage |

### Option C — MongoDB Atlas Serverless (⭐ Recommandé 2025-2026)

> Modèle **pay-per-use** — vous ne payez que ce que vous utilisez, sans cluster actif 24h/24.

| Métrique | Prix |
|---|---|
| Lectures | $0,10 / million d'opérations |
| Écritures | $1,00 / million d'opérations |
| Stockage | $0,25 / Go/mois |
| **Estimé pour AECC (< 2 000 users)** | **~$5–15/mois** |

**Avantages :**
- Même API MongoDB → **zéro migration**, code inchangé
- Pas de cluster actif 24h/24 → coût lié à l'usage réel
- Scale automatique (pic de trafic → pas de crash)
- Backups automatiques inclus
- Migration vers M10 en 1 clic si le trafic explose

**Recommandation pour 2 000 utilisateurs** :
- **Court terme** (< 500 utilisateurs) : **MongoDB Atlas Serverless** (~$5-15/mois) — économie de $40-50/mois vs M10
- **Moyen terme** (500-2 000) : Atlas Serverless ou Atlas M10 ($57/mois) selon la croissance du trafic
- La base de données AECC avec 2 000 utilisateurs occupera environ **500 Mo – 1 Go** (12 collections)

---

## 3. Nom de Domaine

| Domaine | Registrar | Prix/an |
|---|---|---|
| `scholarquest.shop` (actuel) | Namecheap / Cloudflare Registrar | **$11/an** |
| **Alternative recommandée** : `aecc-cg.org` ou `aecc-chine.org` | Cloudflare Registrar | **$15/an** |

**Recommandation** : Transférer l'enregistrement vers **Cloudflare Registrar** (prix coûtant, pas de markup). Budget annuel : **~$15/an**.

---

## 4. CDN & Protection DDoS

| Service | Plan | Prix/mois |
|---|---|---|
| **Cloudflare** (actuel) | Free — CDN, DDoS protection, SSL, cache | **$0** |

**Recommandation** : Le plan gratuit Cloudflare suffit largement. Il fournit :
- CDN global (cache des assets statiques)
- Protection DDoS illimitée
- SSL/TLS gratuit (certificat auto-renouvelé)

## 5. Stockage Fichiers (Images, CVs, Documents)

| Service | Spécification | Prix/mois |
|---|---|---|
| **Cloudflare R2** (actuel) | 10 Go gratuits, puis $0,015/Go/mois. Pas de frais de sortie (egress) | **$0 – $3** |
| AWS S3 | $0,023/Go/mois + frais egress | **$3 – $10** |

**Recommandation** : Cloudflare R2 — les 10 Go gratuits couvrent largement les uploads de l'AECC. Pas de frais de bande passante sortante (contrairement à S3).

---

## 6. Service Email (Transactionnel)

| Service | Plan | Prix/mois |
|---|---|---|
| **Brevo (ex-Sendinblue)** | 300 emails/jour gratuit | **$0** |
| **Resend** | 3 000 emails/mois gratuit, puis $20/mois pour 50 000 | **$0 – $20** |

**Usage estimé** :
- Emails de bienvenue, réinitialisation mot de passe, notifications
- ~500-1 000 emails/mois pour 2 000 utilisateurs
- **Recommandation** : Brevo plan gratuit (300/jour = 9 000/mois) suffit largement

---

## 7. SSL / Certificat HTTPS

| Solution | Prix |
|---|---|
| **Cloudflare Universal SSL** (actuel) | **$0** |

**Recommandation** : Cloudflare SSL gratuit + Full (Strict) mode. Déjà en place.

---

## 8. Monitoring & Logging

| Service | Plan gratuit | Prix pro/mois |
|---|---|---|
| **UptimeRobot** | 50 monitors, vérification 5 min | **$0** |
| **PM2 Plus** | Dashboard, monitoring métriques | **$0** (plan gratuit) |
| **Sentry** | 5 000 erreurs/mois, alertes | **$0** |

**Recommandation** : UptimeRobot (uptime) + PM2 (process) + Sentry (erreurs frontend/backend) = **$0 total**.

---

## 9. Backups & Disaster Recovery

| Type | Fréquence | Stockage | Prix |
|---|---|---|---|
| **Backup DB (mongodump)** | Quotidien automatique | Cloudflare R2 | ~$0 |
| **Snapshot VPS** | Hebdomadaire | DigitalOcean Snapshots | $4,80/mois (20% du Droplet) |
| **Code source** | Chaque commit | GitHub (privé) | **$0** |

**Recommandation** : Script cron `mongodump` quotidien + snapshots VPS hebdomadaires.

---

## 10. Sécurité

| Mesure | Implémentation | Coût |
|---|---|---|
| **Rate limiting** | `express-rate-limit` (déjà en place) | $0 |
| **Helmet.js** | Headers sécurité (déjà en place) | $0 |
| **CORS strict** | Origins configurées (déjà en place) | $0 |
| **JWT avec expiration** | 24h tokens (déjà en place) | $0 |
| **bcrypt password hashing** | Salt rounds 10+ (déjà en place) | $0 |
| **Cloudflare WAF** | Protection gratuite (plan Free) | $0 |
| **Fail2ban** | Bloquer brute force SSH | $0 |

---

## 11. Performance — Configuration Recommandée

| Composant | Configuration | Impact |
|---|---|---|
| **PM2 Cluster Mode** | `pm2 start server.js -i 2` (2 workers) | +100% throughput |
| **Gzip / Brotli** | Cloudflare compresse automatiquement | -60% taille des transferts |
| **Cache Cloudflare** | `Cache-Control: max-age=31536000` pour assets | -70% requêtes au serveur |
| **MongoDB Index** | Indexes sur `email`, `slug`, `createdAt` | Requêtes < 5ms |
| **Vite build optimisé** | Code-splitting, tree-shaking | Bundle ~620 Ko gzip |

### Capacité estimée avec cette configuration :

| Métrique | Valeur |
|---|---|
| Requêtes API/seconde | ~500-800 (PM2 cluster 2 workers) |
| Connexions WebSocket simultanées | ~200 (chat en direct) |
| Temps de réponse moyen API | < 50ms |
| Temps chargement initial (cache froid) | < 2.5s |
| Temps chargement (cache chaud / CDN) | < 0.8s |

---

## 12. Résumé des Coûts

### Scénario Économique (< 500 utilisateurs)

| Service | Prix/mois | Prix/an |
|---|---|---|
| VPS DigitalOcean 4 Go RAM | $24 | $288 |
| MongoDB auto-hébergé | $0 | $0 |
| Cloudflare Free (CDN + SSL) | $0 | $0 |
| Cloudflare R2 (stockage) | $0 | $0 |
| Nom de domaine | — | $12 |
| Email transactionnel (Brevo) | $0 | $0 |
| Monitoring (UptimeRobot + Sentry) | $0 | $0 |
| **TOTAL** | **$28.80/mois** | **$357.60/an** |

### Scénario Production (2 000+ utilisateurs, 100+ simultanés)

| Service | Prix/mois | Prix/an |
|---|---|---|
| VPS DigitalOcean 4 Go RAM | $24 | $288 |
| MongoDB Atlas M10 | $57 | $684 |
| Cloudflare Free (CDN + SSL) | $0 | $0 |
| Cloudflare R2 (stockage) | $0 | $0 |
| Nom de domaine | — | $12 |
| Email transactionnel (Brevo) | $0 | $0 |
| Monitoring (UptimeRobot + Sentry) | $0 | $0 |
| **TOTAL** | **$85.80/mois** | **$1,041.60/an** |

### Scénario Hetzner Économique (2 000+ utilisateurs)

| Service | Prix/mois | Prix/an |
|---|---|---|
| VPS Hetzner CPX31 (8 Go RAM) | ~$11 | ~$132 |
| MongoDB auto-hébergé | $0 | $0 |
| Cloudflare Free | $0 | $0 |
| Cloudflare R2 | $0 | $0 |
| Nom de domaine | — | $12 |
| Brevo (email) | $0 | $0 |
| Monitoring | $0 | $0 |
| Backup (Hetzner snapshot) | ~$2.20 | ~$26.40 |
| **TOTAL** | **~$13.20/mois** | **~$170.40/an** |

---

## 13. Checklist Pré-Production

- [x] Configurer PM2 en mode cluster (`-i 2`) — `ecosystem.config.js` créé
- [ ] Activer les snapshots automatiques sur DigitalOcean
- [ ] Configurer un script cron de backup MongoDB quotidien
- [x] Vérifier les index MongoDB — 20+ index ajoutés sur 8 modèles (User, Profile, Event, Resource, Contact, Newsletter, LearningResource, TelegramChannel)
- [x] Configurer Fail2ban sur le VPS — jails `sshd` (3 max, ban 2h) + `nginx-http-auth` (5 max, ban 1h)
- [x] Activer le firewall UFW (ports 22, 80, 443 uniquement) — `deny incoming` + `allow outgoing`
- [ ] Configurer UptimeRobot pour surveiller `https://scholarquest.shop` — voir guide §14
- [x] Intégrer Sentry pour le tracking d'erreurs — `@sentry/node` + `@sentry/react` installés, code prêt (ajouter `SENTRY_DSN` + `VITE_SENTRY_DSN` dans `.env`)
- [ ] Configurer les Cloudflare Page Rules pour le cache des assets — voir guide §15
- [x] Tester la charge avec `autocannon` — script `npm run test:load` prêt (7 scénarios, 100 connexions, 30s/scénario)
- [x] Configurer les alertes CPU > 80% / RAM > 85% — cron toutes les 5 min sur VPS (`/usr/local/bin/aecc-monitor.sh`)
- [x] Mettre en place un domaine de staging — `staging.scholarquest.shop` → port 5001, nginx configuré, PM2 `aecc-staging` prêt

---

## 14. Guide : Configuration UptimeRobot

> **Service gratuit** : https://uptimerobot.com (50 monitors, vérification 5 min)

### Étapes de configuration

1. Créer un compte sur https://uptimerobot.com
2. Cliquer **"Add New Monitor"**
3. Configurer les monitors suivants :

| Monitor | Type | URL/Host | Intervalle | Alerte |
|---|---|---|---|---|
| **Site principal** | HTTPS | `https://scholarquest.shop` | 5 min | Email |
| **API Health** | HTTPS (keyword) | `https://scholarquest.shop/api/system/health` | 5 min | Keyword: `"status"` |
| **Staging** | HTTPS | `https://staging.scholarquest.shop` | 5 min | Email |

4. Dans **Alert Contacts** → Ajouter l'email `cluivertmoukendi@gmail.com`
5. Activer les **Status Pages** (optionnel) pour une page publique de statut

---

## 15. Guide : Cloudflare Page Rules & Cache

> **Dashboard** : https://dash.cloudflare.com → Domaine `scholarquest.shop`

### Page Rules à configurer (3 règles gratuites)

| Règle | URL Pattern | Action |
|---|---|---|
| **1. Cache assets statiques** | `scholarquest.shop/assets/*` | Cache Level: Cache Everything, Edge Cache TTL: 1 month |
| **2. Bypass API** | `scholarquest.shop/api/*` | Cache Level: Bypass |
| **3. Forcer HTTPS** | `http://scholarquest.shop/*` | Always Use HTTPS |

### Configuration DNS pour staging

| Type | Nom | Contenu | Proxy |
|---|---|---|---|
| A | `staging` | `165.227.77.180` | Proxied (orange cloud) |

### Configuration recommandée (onglet Speed)

- **Auto Minify** : activer HTML, CSS, JS
- **Brotli** : activer
- **Early Hints** : activer
- **HTTP/2** : activer (par défaut)

### Configuration SSL/TLS

- Mode : **Full (Strict)**
- Always Use HTTPS : **On**
- Min TLS Version : **TLS 1.2**
- Automatic HTTPS Rewrites : **On**
- [ ] Configurer les alertes email pour utilisation CPU > 80% / RAM > 85%
- [ ] Mettre en place un domaine de staging pour les tests 
