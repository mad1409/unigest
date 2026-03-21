# UniGest v2.0 — Plateforme de Gestion Universitaire

## Description
Plateforme complète de gestion universitaire.
- Frontend : React + Vite
- Backend : Node.js + Express.js
- Base de données : PostgreSQL
- Serveur : Ubuntu (AWS EC2 ou Contabo VPS)

---

# PARTIE 1 — CHOISIR ET CRÉER SON SERVEUR

## Option A — AWS EC2 (Amazon)

### A1. Créer un compte AWS
1. Aller sur https://aws.amazon.com/fr/
2. Cliquer "Créer un compte AWS"
3. Remplir : email, mot de passe, nom
4. Entrer une carte bancaire (verification uniquement)
5. Verification par SMS
6. Choisir le plan Gratuit (Basic)

### A2. Créer le serveur EC2
1. Se connecter sur https://console.aws.amazon.com
2. Rechercher EC2 dans la barre de recherche
3. Cliquer "Lancer des instances"
4. Nom : unigest-server
5. Image : Ubuntu Server 22.04 LTS
6. Type d instance :
   - t2.micro : gratuit mais lent (1 universite)
   - t2.small : 15$/mois recommande (2-3 universites)
   - t2.medium : 30$/mois (5+ universites)
7. Paire de cles :
   - Cliquer "Creer une paire de cles"
   - Nom : unigest-key
   - Type : RSA, Format : .pem
   - Cliquer "Creer" -> le fichier unigest-key.pem se telecharge
   - IMPORTANT : Gardez ce fichier, sans lui vous ne pouvez plus vous connecter
8. Groupe de securite - ouvrir ces ports :
   - 22 (SSH)
   - 4000 (API Backend)
   - 5173 (Frontend)
   - 80 (HTTP)
   - 443 (HTTPS)
9. Stockage : 20 Go minimum
10. Cliquer "Lancer l instance"
11. Copier l Adresse IPv4 publique (ex: 13.38.166.249)
    NOTEZ CETTE IP - vous en aurez besoin partout

### A3. Se connecter au serveur AWS

Depuis Windows :
1. Telecharger PuTTY : https://www.putty.org/
2. Convertir le .pem en .ppk avec PuTTYgen
3. Dans PuTTY : Host = ubuntu@VOTRE_IP, charger le .ppk

Depuis Mac/Linux (dans le terminal) :
    cd Downloads
    chmod 400 unigest-key.pem
    ssh -i unigest-key.pem ubuntu@VOTRE_IP

---

## Option B — Contabo VPS (moins cher, recommande)

### B1. Créer un compte Contabo
1. Aller sur https://contabo.com
2. Cliquer "Sign Up" en haut a droite
3. Remplir : prenom, nom, email, telephone, adresse
4. Verifier votre email
5. Se connecter sur https://my.contabo.com

### B2. Commander un VPS
1. Aller sur https://contabo.com/en/vps/
2. Choisir :
   - VPS S : 4 euros/mois - 4 vCPU, 8 Go RAM (3-5 universites)
   - VPS M : 7 euros/mois - 6 vCPU, 16 Go RAM (10+ universites)
3. Region : EU-Germany (plus proche de lAfrique)
4. Image : Ubuntu 22.04
5. Mot de passe root :
   - Choisissez un mot de passe fort (ex: UniGest@2025!)
   - NOTEZ-LE PRECISEMENT - c est le mot de passe du serveur
6. Payer
7. Recevoir un email dans 30-60 minutes avec :
   - IP du serveur (ex: 194.163.xxx.xxx)
   - Nom d utilisateur : root
   - Mot de passe : celui que vous avez choisi

### B3. Se connecter au serveur Contabo

Depuis Windows avec PuTTY :
- Host Name : root@VOTRE_IP_CONTABO
- Port : 22
- Cliquer Open, entrer le mot de passe

Depuis Mac/Linux :
    ssh root@VOTRE_IP_CONTABO
    # Entrer le mot de passe

Sur Contabo, creer un utilisateur ubuntu :
    adduser ubuntu
    usermod -aG sudo ubuntu
    passwd ubuntu
    exit
    ssh ubuntu@VOTRE_IP_CONTABO

---

# PARTIE 2 — INSTALLER UNIGEST

Les etapes suivantes sont identiques pour AWS et Contabo.
Remplacez VOTRE_IP par votre adresse IP reelle partout.

## ETAPE 1 - Mettre a jour le systeme
    sudo apt update && sudo apt upgrade -y

## ETAPE 2 - Installer Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    node --version  # doit afficher v20.x.x
    npm --version   # doit afficher 10.x.x

## ETAPE 3 - Installer PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    sudo systemctl status postgresql  # doit afficher : active (running)

## ETAPE 4 - Installer Git
    sudo apt install -y git
    git --version  # doit afficher : git version 2.x.x

## ETAPE 5 - Configurer la base de donnees PostgreSQL

Se connecter a PostgreSQL :
    sudo -u postgres psql

Vous etes dans PostgreSQL (vous voyez postgres=#)
Tapez exactement ces commandes :

    CREATE USER unigest WITH PASSWORD 'unigest_secret';
    CREATE DATABASE unigest OWNER unigest;
    GRANT ALL PRIVILEGES ON DATABASE unigest TO unigest;
    \q

Explication :
- unigest = nom de l utilisateur PostgreSQL (ne pas changer)
- unigest_secret = mot de passe PostgreSQL (vous pouvez changer, notez-le)
- unigest = nom de la base de donnees (ne pas changer)

Tester la connexion :
    PGPASSWORD="unigest_secret" psql -U unigest -h localhost unigest -c "SELECT 1;"
    # Doit afficher : 1

## ETAPE 6 - Cloner le projet
    cd /home/ubuntu
    git clone https://github.com/mad1409/unigest.git
    cd unigest
    ls  # vous devez voir les fichiers du projet

## ETAPE 7 - Generer le JWT Secret

Le JWT Secret protege les sessions de connexion.
Chaque installation doit avoir son propre secret unique.

    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Vous obtenez quelque chose comme :
    b9474a72574aab28a6ef422e2cb9c7f872ab3e4e...

COPIEZ CE RESULTAT - vous en aurez besoin a l etape suivante.

## ETAPE 8 - Creer le fichier .env (configuration principale)

    nano /home/ubuntu/unigest/.env

Coller ce contenu en remplacant les valeurs :

    NOM_ETABLISSEMENT="Nom de votre Universite"
    ANNEE_ACADEMIQUE="2025/2026"
    ANNEES_DISPONIBLES="2024/2025,2025/2026"
    SEMESTRE_ACTIF=1
    ADMIN_ID=admin
    ADMIN_PASSWORD=ChoisissezVotreMotDePasseAdmin
    ADMIN_NAME="Administration Centrale"
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=unigest
    DB_USER=unigest
    DB_PASSWORD=unigest_secret
    PORT=4000
    JWT_SECRET=COLLEZ_ICI_LE_SECRET_DE_LETAPE_7
    NODE_ENV=production

Explication de chaque ligne :
- NOM_ETABLISSEMENT : Le nom de votre universite
- ADMIN_PASSWORD : Le mot de passe que VOUS choisissez pour le compte admin (min 8 caracteres)
- DB_PASSWORD : Le mot de passe PostgreSQL choisi a l etape 5 (unigest_secret par defaut)
- JWT_SECRET : Le resultat copie a l etape 7 (ne jamais partager)

Sauvegarder : Ctrl+O -> Entree -> Ctrl+X

## ETAPE 9 - Creer le fichier .env.local (URL de l API)

    nano /home/ubuntu/unigest/.env.local

Coller en remplacant VOTRE_IP :
    VITE_API_URL=http://VOTRE_IP:4000/api

Exemple : VITE_API_URL=http://13.38.166.249:4000/api

Sauvegarder : Ctrl+O -> Entree -> Ctrl+X

## ETAPE 10 - Installer les dependances

    # Backend
    cd /home/ubuntu/unigest/backend
    npm install

    # Frontend
    cd /home/ubuntu/unigest
    npm install

## ETAPE 11 - Initialiser la base de donnees

    sudo -u postgres psql unigest < /home/ubuntu/unigest/backend/init/schema.sql
    sudo -u postgres psql unigest -c "\dt"
    # Doit afficher la liste des tables

## ETAPE 12 - Creer le compte administrateur

    cd /home/ubuntu/unigest/backend

Remplacer ChoisissezVotreMotDePasseAdmin par votre mot de passe :

    node -e "
    const bcrypt = require('bcryptjs');
    const pwd = 'ChoisissezVotreMotDePasseAdmin';
    bcrypt.hash(pwd, 10).then(hash => {
      const { Pool } = require('pg');
      require('dotenv').config({ path: '../.env' });
      const pool = new Pool({ host:'localhost', port:5432, database:'unigest', user:'unigest', password:process.env.DB_PASSWORD });
      pool.query(
        'INSERT INTO users (id, password, name, role) VALUES (\$1,\$2,\$3,\$4) ON CONFLICT (id) DO UPDATE SET password=\$2',
        ['admin', hash, 'Administration Centrale', 'admin']
      ).then(() => {
        console.log('Compte admin cree !');
        console.log('Identifiant : admin');
        console.log('Mot de passe :', pwd);
        pool.end();
      });
    });
    "

## ETAPE 13 - Construire le frontend

    cd /home/ubuntu/unigest
    npm run build
    # Attendre 1-3 minutes
    # Doit afficher : built in X.XXs

## ETAPE 14 - Lancer les serveurs

    # Backend
    cd /home/ubuntu/unigest/backend
    nohup node server.js > /tmp/backend.log 2>&1 &

    # Frontend
    cd /home/ubuntu/unigest
    nohup npm run dev > /tmp/vite.log 2>&1 &

    # Verifier
    sleep 5
    tail -3 /tmp/backend.log
    tail -3 /tmp/vite.log

Le backend doit afficher :
    PostgreSQL connecte
    Tables creees/verifiees
    UniGest API sur le port 4000

## ETAPE 15 - Tester l installation

    curl -s http://localhost:4000/api/health
    # Doit afficher : {"status":"ok","version":"2.0"}

## ETAPE 16 - Demarrage automatique

    cat > /home/ubuntu/start.sh << EOF
    #!/bin/bash
    sleep 15
    pkill -f "node server.js" 2>/dev/null
    pkill -f vite 2>/dev/null
    sleep 2
    cd /home/ubuntu/unigest/backend
    nohup node server.js > /tmp/backend.log 2>&1 &
    cd /home/ubuntu/unigest
    nohup npm run dev > /tmp/vite.log 2>&1 &
    echo "UniGest demarre"
    EOF
    chmod +x /home/ubuntu/start.sh
    (crontab -l 2>/dev/null; echo "@reboot /home/ubuntu/start.sh") | crontab -

## ETAPE 17 - Sauvegarde automatique

    mkdir -p /home/ubuntu/backups
    cat > /home/ubuntu/backup_unigest.sh << EOF
    #!/bin/bash
    DATE=\$(date +%Y%m%d_%H%M%S)
    PGPASSWORD="unigest_secret" pg_dump -U unigest -h localhost unigest | gzip > /home/ubuntu/backups/unigest_\$DATE.sql.gz
    find /home/ubuntu/backups -name "unigest_*.sql.gz" -mtime +7 -delete
    echo "[\$DATE] Sauvegarde OK"
    EOF
    chmod +x /home/ubuntu/backup_unigest.sh
    (crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup_unigest.sh >> /home/ubuntu/backups/backup.log 2>&1") | crontab -
    /home/ubuntu/backup_unigest.sh

---

# PARTIE 3 - ACCEDER A L APPLICATION

    Espace Etudiant     : http://VOTRE_IP:5173
    Espace Admin        : http://VOTRE_IP:5173/administration
    API Backend         : http://VOTRE_IP:4000/api

---

# PARTIE 4 - CONFIGURATION INITIALE

Apres installation, connectez-vous en admin et :
1. Mon profil -> Parametres
   - Nom de l etablissement
   - Annee academique active
   - Logo (PNG/JPG/WEBP max 5MB)
2. Creer les Filieres
3. Creer les UE et Matieres
4. Ajouter les Enseignants
5. Inscrire les Etudiants

---

# PARTIE 5 - CHANGER DE SERVEUR (MIGRATION)

Sur l ancien serveur - Sauvegarder :
    PGPASSWORD="unigest_secret" pg_dump -U unigest -h localhost unigest | gzip > /home/ubuntu/migration.sql.gz

Telecharger sur votre PC (Mac/Linux) :
    scp -i unigest-key.pem ubuntu@ANCIENNE_IP:/home/ubuntu/migration.sql.gz .

Installer UniGest sur le nouveau serveur (Parties 1 et 2).

Envoyer la sauvegarde sur le nouveau serveur :
    scp -i unigest-key.pem migration.sql.gz ubuntu@NOUVELLE_IP:/home/ubuntu/

Sur le nouveau serveur - Restaurer :
    gunzip -c /home/ubuntu/migration.sql.gz | PGPASSWORD="unigest_secret" psql -U unigest -h localhost unigest
    echo "Migration terminee !"

Mettre a jour l IP :
    nano /home/ubuntu/unigest/.env.local
    # Changer : VITE_API_URL=http://NOUVELLE_IP:4000/api
    cd /home/ubuntu/unigest && npm run build
    /home/ubuntu/start.sh

---

# PARTIE 6 - RESOLUTION DE PROBLEMES

Backend ne demarre pas :
    cd /home/ubuntu/unigest/backend
    node server.js
    # Lire le message d erreur

PostgreSQL ne se connecte pas :
    sudo systemctl start postgresql
    PGPASSWORD="unigest_secret" psql -U unigest -h localhost unigest -c "SELECT 1;"

Redemarrer tout :
    pkill -f "node server.js" && pkill -f vite
    sleep 3
    /home/ubuntu/start.sh

Mot de passe admin oublie :
    cd /home/ubuntu/unigest/backend
    node -e "
    const bcrypt = require('bcryptjs');
    bcrypt.hash('NouveauMotDePasse', 10).then(hash => {
      const { Pool } = require('pg');
      require('dotenv').config({ path: '../.env' });
      const pool = new Pool({ host:'localhost', port:5432, database:'unigest', user:'unigest', password:process.env.DB_PASSWORD });
      pool.query('UPDATE users SET password=\$1 WHERE id=\$2', [hash, 'admin'])
        .then(() => { console.log('OK'); pool.end(); });
    });
    "

---

# PARTIE 7 - MOTS DE PASSE A CHOISIR

    Mot de passe admin       -> ADMIN_PASSWORD dans .env (min 8 caracteres)
    Mot de passe PostgreSQL  -> DB_PASSWORD dans .env (unigest_secret par defaut)
    JWT Secret               -> JWT_SECRET dans .env (genere automatiquement etape 7)
    Mot de passe serveur     -> Choisi lors de la creation AWS/Contabo

---

# SECURITE IMPLEMENTEE
- SQL Injection : Bloque
- XSS : Bloque
- Brute Force : Blocage apres 5 tentatives (15 min)
- CSRF : Protege
- Rate limiting : 1000 req/15min
- JWT 24h avec blacklist
- Bcrypt pour les mots de passe
- Audit logs
- Sauvegarde automatique quotidienne

---

Developpe par Mad1409
GitHub : https://github.com/mad1409/unigest
