# AECC — Association des Étudiants Congolais en Chine

Plateforme web communautaire pour les étudiants congolais en Chine : recensement, entraide, ressources, événements, blog, apprentissage et administration.

---

## Vue d’ensemble

Le projet est structuré en **2 applications principales** :

- **Backend API** : `server/` (Node.js + Express + MongoDB)
- **Frontend web** : `client-react/` (React + Vite)

Le backend sert les endpoints `/api/*` et, en production, sert aussi le build React (`client-react/dist`).

---

## Stack technique (réelle)

### Backend
- Node.js
- Express 4
- MongoDB + Mongoose
- JWT + bcryptjs
- express-validator
- Multer (upload local + option Cloudflare R2)
- helmet, cors, express-rate-limit
- Nodemailer
- Sentry (`@sentry/node`)

### Frontend
- React 19
- React Router 7
- Vite 6
- Recharts
- Markdown editor (`@uiw/react-md-editor`, `react-markdown`)
- Sentry (`@sentry/react`)

### Ops / Dev
- PM2 (`ecosystem.config.js`)
- Nginx (reverse proxy)
- GitHub Actions (tests + checks syntax)

---

## Architecture du repository

```text
congolese-students-china/
├─ server/
│  ├─ config/                # DB, clés/env, sentry
│  ├─ controllers/           # logique métier API
│  ├─ middleware/            # auth, adminAuth, upload, rate limit, errors
│  ├─ models/                # modèles Mongoose (core + modules)
│  ├─ routes/api/            # routes REST (/api/*)
│  ├─ scripts/               # scripts DB, seed, migration, maintenance
│  ├─ tests/                 # tests Jest/Supertest
│  └─ server.js              # entrypoint backend
├─ client-react/
│  ├─ src/                   # app React
│  ├─ public/
│  └─ vite.config.js
├─ docs/                     # documentation projet
├─ uploads/                  # fichiers uploadés localement (runtime)
├─ backups/                  # backups JSON DB (scripts)
├─ ecosystem.config.js       # PM2 prod + staging
└─ package.json              # scripts backend/root
```

---

## Prérequis

- Node.js **18+** (20 LTS recommandé)
- npm
- MongoDB (local ou Atlas)

---

## Installation

Depuis la racine du projet :

```bash
npm install
cd client-react && npm install
```

---

## Configuration (.env)

Créer un fichier `.env` à la racine du projet.

Exemple minimal pour développement local :

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/congolese_students
JWT_SECRET=change_me_with_a_long_random_secret_min_32_chars
CORS_ORIGINS=http://localhost:5173,http://localhost:5000,http://127.0.0.1:5000

# Admin whitelist (séparés par virgule)
ADMIN_EMAILS=admin@aecc.org

# Email (obligatoire en production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=AECC <noreply@aecc.org>

# Sentry (optionnel)
SENTRY_DSN=
VITE_SENTRY_DSN=

# Optionnel: Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET=
R2_PUBLIC_URL=
```

> En développement, le projet peut aussi charger `.env.local` (prioritaire hors production).

---

## Démarrage en développement

### Option A (recommandée) : 2 terminaux

Terminal 1 (API) :

```bash
npm run dev
```

Terminal 2 (React/Vite) :

```bash
npm run client
```

- API : `http://localhost:5000`
- Front React : `http://localhost:5173`

### Option B : commande unique

```bash
npm run dev:full
```

---

## Build et exécution production

1. Build frontend :

```bash
cd client-react && npm run build
```

2. Démarrer le backend :

```bash
cd ..
npm start
```

Le backend servira automatiquement le build React (`client-react/dist`).

---

## Scripts npm (racine)

### App
- `npm start` : démarrer le serveur (production)
- `npm run dev` : démarrer API avec nodemon
- `npm run client` : démarrer frontend Vite (`client-react`)
- `npm run dev:full` : backend + frontend en parallèle

### Base de données / administration
- `npm run db:init`
- `npm run db:reset`
- `npm run db:info`
- `npm run db:backup`
- `npm run db:restore`
- `npm run db:list-backups`
- `npm run db:list-users`
- `npm run db:create-admin`
- `npm run db:clear-users`
- `npm run db:clear-blogs`
- `npm run db:clear-events`
- `npm run db:clear-resources`
- `npm run db:clear-profiles`
- `npm run create-admin`

### Tests / performance
- `npm test`
- `npm run test:watch`
- `npm run test:load`
- `npm run test:load:prod`

---

## API (résumé)

Préfixe global : `/api`

Routes principales :
- `/api/auth`
- `/api/users`
- `/api/blogs`
- `/api/events`
- `/api/profile`
- `/api/resources`
- `/api/learning`
- `/api/contact`
- `/api/newsletter`
- `/api/search`
- `/api/faq`
- `/api/chat`
- `/api/settings`
- `/api/system`
- `/api/upload`

---

## Sécurité et observabilité

- JWT auth (`x-auth-token` ou `Authorization: Bearer ...` selon middleware)
- Whitelist admin par email (`ADMIN_EMAILS`)
- Rate limiting (`apiLimiter`, `authLimiter`, etc.)
- Headers de sécurité via Helmet
- Gestion d’erreurs centralisée
- Sentry frontend/backend (si DSN configuré)

---

## Déploiement

Voir la documentation détaillée :
- `docs/DEVIS_PRODUCTION.md` (guide de déploiement et exploitation)
- `deploy.sh` (script d’installation serveur, à adapter à votre contexte)

---

## Statut actuel

Le projet est actif, en production et en évolution. Certaines suites de tests nécessitent un alignement avec les flux actuels (notamment vérification email à l’inscription).

---

## Licence

MIT
