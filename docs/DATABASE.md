# Documentation Base de Données — AECC

Ce document décrit l’état **actuel** de la couche données du projet AECC.

---

## 1) Technologie et connexion

- **SGBD** : MongoDB
- **ODM** : Mongoose
- **Connexion** : `server/config/db.js`
- **Config env** : `server/config/keys.js`

Variables principales :

```env
MONGO_URI=mongodb://127.0.0.1:27017/congolese_students
NODE_ENV=development
```

> En production, `MONGO_URI` est obligatoire.

---

## 2) Collections principales (modèles actifs)

## `users`
Modèle : `server/models/User.js`

Contient :
- identité (nom, date de naissance, genre, passeport, contact)
- infos académiques (université, filière, niveau, bourse)
- compte (email, password hash, role)
- sécurité/auth (email verification, reset password, 2FA)

Points clés :
- email unique
- passportNumber unique (`OA` + 7 chiffres)
- mot de passe hashé via bcrypt (`pre('save')`)
- rôle : `student | admin`

Indexes déclarés :
- `{ role: 1, createdAt: -1 }`
- `{ university: 1 }`
- `{ emailVerificationToken: 1 }` (sparse)
- `{ passwordResetToken: 1 }` (sparse)

---

## `profiles`
Modèle : `server/models/Profile.js`

Profil étendu par utilisateur :
- `bio`, `yearOfStudy`, `skills[]`, `social.*`, `avatar`
- référence `user` (ObjectId -> User)

Index :
- unique sur `{ user: 1 }`

---

## `events`
Modèle : `server/models/Event.js`

Événements communautaires :
- `title`, `description`, `location`, `startDate`, `endDate`
- `type` (`seminar`, `workshop`, `networking`, `cultural`, `academic`, `general`)
- `organizer` (User), `attendees[]`
- `image`, `externalLink`, `attachmentFile`

Indexes :
- `{ type: 1, startDate: -1 }`
- `{ organizer: 1 }`
- `{ createdAt: -1 }`

---

## `resources`
Modèle : `server/models/Resource.js`

Ressources partagées :
- `title`, `description`
- `type` (Document, Video, Blog, Tutorial, Course, Telegram, Scholarship, External Link)
- `category` (Academic, Administrative, Cultural, Career, Employment, Scholarship, General)
- `fileUrl` ou `externalUrl` (au moins un requis)

Validation :
- hook `pre('save')` impose la présence de `fileUrl` ou `externalUrl`

Indexes :
- `{ type: 1, category: 1 }`
- `{ user: 1 }`
- `{ createdAt: -1 }`

---

## `learningresources`
Modèle : `server/models/LearningResource.js`

Section Learning :
- `type` (`formation`, `youtube`, `useful-link`)
- `title`, `description`, `longDescription`
- `advantages[]`, `disadvantages[]`, `details[]`
- `url` ou fichier (`filePath`, `fileName`)
- métadonnées : `icon`, `color`, `level`, `slug`, `featured`, `status`, `order`

Indexes :
- `{ type: 1, status: 1 }`
- index texte `{ title: 'text', description: 'text' }`
- `{ slug: 1 }` unique sparse
- `{ featured: 1, status: 1 }`

---

## `faqs`
Modèle : `server/models/FAQ.js`

Questions fréquentes :
- `question`, `answer`, `category`, `order`, `isActive`

Index :
- `{ category: 1, order: 1 }`

---

## `telegramchannels`
Modèle : `server/models/TelegramChannel.js`

Canaux Telegram recommandés :
- `name`, `description`, `url`, `category`
- `language`, `featured`, `status`, `subscribers`

Indexes :
- `{ category: 1, status: 1 }`
- `{ featured: 1 }`
- `{ language: 1 }`

---

## `contacts`
Modèle : `server/models/Contact.js`

Messages envoyés via formulaire contact :
- `name`, `email`, `subject`, `message`
- `status` (`unread`, `read`, `replied`, `archived`)
- `replies[]`

Indexes :
- `{ status: 1, createdAt: -1 }`
- `{ email: 1 }`

---

## `newsletters`
Modèle : `server/models/Newsletter.js`

Abonnements newsletter :
- `email` (unique)
- `active`, `subscribedAt`, `unsubscribedAt`

Index :
- `{ active: 1, subscribedAt: -1 }`

---

## `chatconversations`
Modèle : `server/models/ChatConversation.js`

Conversations chat :
- visiteur (`visitorName`, `visitorEmail`)
- `status` (`active`, `closed`)
- `messages[]` (sender: user/admin/bot)
- `lastMessageAt`

Index :
- `{ status: 1, lastMessageAt: -1 }`

---

## `sitesettings`
Modèle : `server/models/SiteSetting.js`

Paramètres de site clé/valeur, manipulés via `/api/settings`.

---

## Modules WordPress (legacy/migration)

Le dossier `server/models/wordpress/` contient des modèles de compatibilité/migration WordPress (`Post`, `Term`, `Comment`, etc.).
Ils ne remplacent pas les modèles core listés ci-dessus.

---

## 3) Scripts de gestion DB (état réel)

Depuis la racine du projet :

```bash
npm run db:init
npm run db:reset
npm run db:info
npm run db:backup
npm run db:list-backups
npm run db:restore
npm run db:list-users
npm run db:create-admin
npm run db:clear-users
npm run db:clear-blogs
npm run db:clear-events
npm run db:clear-resources
npm run db:clear-profiles
```

> Les scripts sont dans `server/scripts/`.

---

## 4) Backup / restore

Script : `server/scripts/backup-restore.js`

Fonctions actuelles :
- backup JSON horodaté
- listing des backups
- restauration avec purge préalable des collections ciblées

Collections sauvegardées/restaurées par ce script :
- users
- profiles
- blogs
- events
- resources

> Pour couvrir d’autres collections (learning, faq, contacts, newsletter, chat), étendre explicitement le script.

---

## 5) Bonnes pratiques recommandées (production)

- Utiliser MongoDB Atlas (ou instance managée) + backups automatiques.
- Ne jamais exposer d’identifiants DB dans les docs.
- Garder `JWT_SECRET` long et unique par environnement.
- Vérifier régulièrement les index via `db:info` et métriques de requêtes.
- Planifier un backup quotidien + test de restauration mensuel.

---

## 6) Limites connues

- Les tests automatisés actuels ne sont pas encore totalement alignés avec tous les flux applicatifs actuels (ex: email verification à l’inscription).
- Le script de backup ne couvre pas encore l’intégralité des collections métier.

---

## 7) Références code

- Connexion DB : `server/config/db.js`
- Config env : `server/config/keys.js`
- Modèles : `server/models/*.js`
- Scripts DB : `server/scripts/*.js`
