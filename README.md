# AECC — Association des Étudiants Congolais en Chine

Plateforme communautaire pour les étudiants congolais (RDC) en Chine. Recensement des étudiants, blogs, événements, ressources partagées et gestion administrative.

## Stack technique

| Couche | Technologie |
|--------|------------|
| **Runtime** | Node.js |
| **Backend** | Express 4.18 |
| **Base de données** | MongoDB (Mongoose 7.5) |
| **Auth** | JWT + bcryptjs |
| **Uploads** | Multer (stockage disque) |
| **Validation** | express-validator |
| **Frontend** | HTML / CSS / JavaScript (vanilla) |

## Fonctionnalités

- **Inscription** multi-étapes avec upload de documents (passeport, visa, admission)
- **Blogs** WordPress-style avec catégories, tags, commentaires
- **Événements** avec filtres (type, date, lieu) et pagination
- **Ressources** partagées (documents, vidéos, bourses, liens Telegram)
- **Profils** étendus (compétences, réseaux sociaux)
- **Contact** formulaire avec gestion admin
- **Newsletter** abonnement/désabonnement
- **Admin panel** complet (dashboard, CRUD, settings)

## Démarrage rapide

### Prérequis

- Node.js v16+
- MongoDB (local ou Atlas)

### Installation

```bash
git clone <repository-url>
cd congolese-students-china
npm install
```

### Configuration

Créer un fichier `.env` à la racine :

```env
MONGO_URI=mongodb://localhost:27017/congolese_students
JWT_SECRET=votre_secret_jwt_securise
PORT=5000
CORS_ORIGINS=http://localhost:5000,http://localhost:3000
```

### Lancement

```bash
# Développement (avec nodemon)
npm run dev

# Production
npm start
```

Le serveur démarre sur `http://localhost:5000`.

## Structure du projet

```
├── server/                    # Backend (Node.js + Express)
│   ├── server.js              # Point d'entrée
│   ├── config/
│   │   ├── db.js              # Connexion MongoDB
│   │   └── keys.js            # Config centralisée
│   ├── controllers/           # Logique métier (10 controllers)
│   ├── middleware/
│   │   ├── auth.js            # Vérification JWT
│   │   ├── adminAuth.js       # JWT + rôle admin + whitelist
│   │   ├── errorHandler.js    # Gestion d'erreurs centralisée
│   │   └── upload.js          # Config Multer
│   ├── models/                # Schémas Mongoose (7 modèles)
│   ├── routes/api/            # Routes API (10 fichiers)
│   ├── scripts/               # Scripts utilitaires DB
│   └── utils/
│
├── client/                    # Frontend (HTML/CSS/JS)
│   ├── *.html                 # Pages publiques (12 pages)
│   ├── css/                   # Stylesheets (18 fichiers)
│   ├── js/                    # Scripts frontend (10 fichiers)
│   └── admin/                 # Panneau d'administration
│
├── uploads/                   # Fichiers uploadés
├── backups/                   # Sauvegardes DB
└── docs/                      # Documentation
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm start` | Lancer le serveur en production |
| `npm run dev` | Lancer avec nodemon (dev) |
| `npm run create-admin` | Créer un utilisateur admin |
| `npm run db:init` | Initialiser la base de données |
| `npm run db:backup` | Sauvegarder la base |
| `npm run db:restore` | Restaurer une sauvegarde |
| `npm run migrate:wordpress` | Migrer vers le système blog WordPress |

## API

Toutes les routes API sont préfixées par `/api/`. Voir [PROJECT_TRACKER.md](PROJECT_TRACKER.md) pour la liste complète des endpoints.

| Ressource | Base URL |
|-----------|----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Blogs | `/api/blogs` |
| Events | `/api/events` |
| Profiles | `/api/profile` |
| Resources | `/api/resources` |
| Contact | `/api/contact` |
| Newsletter | `/api/newsletter` |
| System | `/api/system` |
| Upload | `/api/upload` |

## Licence

MIT
