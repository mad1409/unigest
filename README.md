# UniGest — Plateforme de Gestion Universitaire

> Plateforme web complète pour la gestion universitaire : étudiants, notes, emplois du temps, bulletins, comptes utilisateurs.

**Stack :** Vite + React · Express.js + PostgreSQL · JWT

---

## Rôles et accès

| Rôle | URL | Permissions |
|---|---|---|
| **Etudiant** | `/` | Notes, bulletin, EDT, profil |
| **Enseignant** | `/administration` | Saisie notes, EDT, profil |
| **Administrateur** | `/administration` | Tout gérer |
| **Secrétaire** | `/administration` | Inscrire étudiants, imprimer cartes |
| **Surveillant** | `/administration` | Créer/modifier EDT |

---

## Déploiement rapide sur VPS (Ubuntu)

### 1. Installer les dépendances
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx postgresql postgresql-contrib
```

### 2. Cloner et configurer
```bash
git clone https://github.com/mad1409/unigest.git
cd unigest
cp .env.example .env
nano .env  # Remplir les valeurs
```

### 3. Créer la base de données
```bash
sudo -u postgres psql << EOF
CREATE USER unigest WITH PASSWORD 'VOTRE_MOT_DE_PASSE';
CREATE DATABASE unigest OWNER unigest;
GRANT ALL PRIVILEGES ON DATABASE unigest TO unigest;
EOF
```

### 4. Démarrer le backend
```bash
cd backend && npm install
sudo npm install -g pm2
pm2 start server.js --name unigest-backend
pm2 save && pm2 startup
```

### 5. Builder le frontend
```bash
cd .. && npm install && npm run build
```

### 6. Configurer Nginx
```bash
sudo nano /etc/nginx/sites-available/unigest
```
```nginx
server {
    listen 80;
    server_name VOTRE_IP_OU_DOMAINE;

    root /home/ubuntu/unigest/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/unigest /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx
```

---

## Déploiement sur hébergement classique OVH

> OVH mutualisé ne supporte pas Node.js. Le backend doit tourner sur un VPS séparé.

### 1. Backend sur VPS (voir section ci-dessus)

### 2. Frontend sur OVH
```bash
# Sur votre PC
git clone https://github.com/mad1409/unigest.git
cd unigest
echo "VITE_API_URL=https://api.votre-domaine.com/api" > .env.local
npm install && npm run build
# Uploader dist/ via FileZilla vers public_html/
```

Créer `.htaccess` à la racine :
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Déploiement depuis Windows

### Option 1 — Développement local

1. Installer [Node.js LTS](https://nodejs.org)
2. Installer [Git](https://git-scm.com)
3. Installer [PostgreSQL](https://www.postgresql.org/download/windows/)
```powershell
git clone https://github.com/mad1409/unigest.git
cd unigest
cp .env.example .env
# Terminal 1
cd backend && npm install && node server.js
# Terminal 2
cd .. && npm install && npm run dev
```

### Option 2 — Déployer sur VPS depuis Windows

- SSH : [PuTTY](https://putty.org)
- Transfert fichiers : [WinSCP](https://winscp.net)

### Option 3 — GitHub Actions (CI/CD automatique)

Créer `.github/workflows/deploy.yml` :
```yaml
name: Deploy UniGest
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install && npm run build
      - name: Deploy SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ubuntu
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /home/ubuntu/unigest && git pull
            npm install && npm run build
            cd backend && npm install
            pm2 restart unigest-backend
```

Ajouter dans les Secrets GitHub : `VPS_HOST` et `VPS_KEY`.

---

## Activer HTTPS — Let's Encrypt

> Nécessite un nom de domaine pointant vers votre IP.
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

Le renouvellement est automatique.

**Sur OVH mutualisé :**
Espace client → Web Cloud → Hébergements → Multisite → Modifier → Activer SSL

---

## Nom de domaine

### Configurer le DNS

Dans votre gestionnaire DNS :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `VOTRE_IP_VPS` |
| A | `www` | `VOTRE_IP_VPS` |

Attendre 10–60 minutes pour la propagation.

### Mettre à jour Nginx
```bash
sudo nano /etc/nginx/sites-available/unigest
# Remplacer server_name avec votre domaine
sudo nginx -t && sudo systemctl reload nginx
```

### Mettre à jour l'URL API
```bash
nano /home/ubuntu/unigest/.env.local
# VITE_API_URL=https://votre-domaine.com/api
cd /home/ubuntu/unigest && npm run build
```

---

## Adapter pour un nouveau client

### Fichier .env
```env
NOM_ETABLISSEMENT="Université de Bamako"
ANNEE_ACADEMIQUE="2025/2026"
ANNEES_DISPONIBLES="2024/2025,2025/2026"
ADMIN_ID=admin
ADMIN_PASSWORD=MotDePasseSecurise123!
ADMIN_NAME="Direction des Etudes"
DB_PASSWORD=MotDePasseDB_Securise!
JWT_SECRET=ChaineAleatoire64Caracteres...
PORT=4000
```

**Générer JWT_SECRET :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Réinitialiser pour un nouveau client
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS unigest;"
sudo -u postgres psql -c "CREATE DATABASE unigest OWNER unigest;"
pm2 restart unigest-backend
```

### Après le premier démarrage

1. Connexion admin → **Paramètres** → nom établissement
2. Créer les **Filières** (L1, L2, M1, M2...)
3. Créer les **UE/Matières**
4. Ajouter les **Enseignants**
5. Générer les **Groupes TD/TP**
6. Créer les comptes **Secrétaire / Surveillant**

---

## Changer le logo

### Logo page de connexion

Fichier : `src/components/shared/LoginEtudiant.jsx`

Trouver l'emoji 🏛️ et remplacer par :
```jsx
<img src="/logo.png" alt="Logo" style={{ width:80, height:80, marginBottom:12, objectFit:"contain" }}/>
```

Placer `logo.png` dans `public/`.

### Logo sidebar (tableau de bord)

Fichier : `src/components/shared/Layout.jsx`

Trouver "UniGest" et remplacer par :
```jsx
<img src="/logo-blanc.png" alt="Logo" style={{ height:40 }}/>
```

### Favicon (onglet navigateur)

Remplacer `public/vite.svg` par votre `favicon.ico`.

Dans `index.html` :
```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

---

## Docker Compose
```bash
cp .env.example .env && nano .env
docker-compose up -d
```
```bash
docker-compose down       # Arrêter
docker-compose restart    # Redémarrer
docker-compose logs -f    # Logs
```

---

## Sauvegarde automatique
```bash
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /home/ubuntu/backups
pg_dump -U unigest unigest > /home/ubuntu/backups/unigest_$DATE.sql
ls -t /home/ubuntu/backups/*.sql | tail -n +8 | xargs rm -f
EOF
chmod +x /home/ubuntu/backup.sh
# Tous les jours à 2h
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
```

**Restaurer :**
```bash
psql -U unigest unigest < /home/ubuntu/backups/unigest_20250315.sql
```

---

## Mise à jour
```bash
cd /home/ubuntu/unigest
git pull origin main
npm install && npm run build
cd backend && npm install
pm2 restart unigest-backend
```

---

## Architecture
```
unigest/
├── src/                    Frontend React
│   ├── components/         Composants par rôle
│   ├── api.js              Client API
│   └── utils/              Calculs notes, conflits EDT
├── backend/                API Express.js
│   ├── routes/             Une route par ressource
│   ├── middleware/         Auth JWT, Admin
│   └── init/               Schema SQL, Seed
├── public/                 Logo, favicon
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

---

## Sécurité

- JWT tokens (7 jours)
- Bcrypt (mots de passe hashés)
- Helmet (headers HTTP)
- Rate limiting (200 req/15min, 50 login/15min)
- CORS configuré
```bash
# Pare-feu production
sudo ufw allow 22 80 443
sudo ufw deny 4000  # API uniquement via Nginx
sudo ufw enable
```

---

*UniGest v2.0 — Gestion universitaire*
