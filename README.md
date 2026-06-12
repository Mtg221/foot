# Terrain Foot Dakar — Plateforme de réservation

Application web de réservation pour un terrain de football unique au Sénégal.

## Structure

```
terrain-foot/
├── backend/   (Node.js + Express + MongoDB)
└── frontend/  (React + Vite)
```

## 1. Backend

```bash
cd backend
cp .env.example .env
# Remplir MONGODB_URI, ADMIN_PASSWORD, JWT_SECRET
npm install
node seed.js     # crée le terrain initial (une seule fois)
npm run dev       # ou npm start en production
```

### Variables d'environnement (.env)
- `MONGODB_URI` : chaîne de connexion MongoDB Atlas
- `PORT` : port du serveur (défaut 5000)
- `ADMIN_PASSWORD` : mot de passe unique du propriétaire (À CHANGER, ne pas laisser la valeur par défaut)
- `JWT_SECRET` : clé secrète pour signer les tokens admin (À CHANGER)
- `CORS_ORIGIN` : non utilisé activement (CORS ouvert par défaut, voir server.js)

### Routes API

**Public**
- `GET /terrain` — infos du terrain
- `GET /terrain/disponibilites?date=YYYY-MM-DD` — créneaux libres/occupés
- `POST /reservations` — créer une réservation
- `GET /reservations/:id` — suivi d'une réservation

**Admin** (header `Authorization: Bearer <token>`)
- `POST /admin/login` — `{ password }` → `{ token }`
- `GET /admin/stats?dateDebut=&dateFin=` — statistiques
- `GET /reservations?date=&statut=` — liste des réservations
- `PATCH /reservations/:id/statut` — `{ statutReservation }`
- `PATCH /reservations/:id/paiement` — `{ statutPaiement, methodePaiement }`
- `PUT /terrain` — mise à jour des infos du terrain
- `POST /terrain/bloquer` — `{ date, heure }`
- `POST /terrain/debloquer` — `{ date, heure }`

## 2. Frontend

```bash
cd frontend
cp .env.example .env
# Remplir VITE_API_URL avec l'URL du backend déployé
npm install
npm run dev       # développement
npm run build     # production
```

## 3. Déploiement

- **Backend** → Render (Web Service, root dir = `backend`, build = `npm install`, start = `npm start`)
- **Frontend** → Vercel (root dir = `frontend`, framework = Vite)
- Mettre à jour `VITE_API_URL` dans Vercel avec l'URL Render
- MongoDB Atlas : whitelister `0.0.0.0/0` (ou l'IP sortante de Render) dans Network Access

## 4. Sécurité — points à ne pas oublier

- **Changer `ADMIN_PASSWORD` et `JWT_SECRET`** avant mise en production. Les valeurs par défaut dans `.env.example` sont des exemples, pas des mots de passe utilisables.
- Le token admin expire après 12h (à reconnecter ensuite).
- Le système de réservation utilise une transaction MongoDB pour empêcher la double réservation simultanée — nécessite un MongoDB en replica set (le cas par défaut sur Atlas).

## 5. Notes sur le paiement

Le paiement se fait **uniquement sur place** en espèces. Il n'y a pas d'intégration API Orange Money / Wave.

**Délai de 10 minutes :** Après 10 minutes de retard, le créneau réservé sera donné à un autre client. Cette information est clairement affichée lors de la réservation et dans le récapitulatif.
# foot
