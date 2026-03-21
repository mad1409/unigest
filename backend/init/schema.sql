-- UniGest v2.0 — Schema PostgreSQL exact

CREATE TABLE IF NOT EXISTS tenants (
  id          SERIAL PRIMARY KEY,
  nom         TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  email       TEXT,
  tel         TEXT,
  ville       TEXT,
  date_debut  DATE DEFAULT NOW(),
  date_expiration DATE,
  statut      TEXT DEFAULT 'actif',
  max_etudiants INTEGER DEFAULT 500,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS superadmin (
  id         TEXT PRIMARY KEY,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professeurs (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  tel       TEXT,
  matieres  INTEGER[] DEFAULT '{}',
  tenant_id INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS etudiants (
  id               SERIAL PRIMARY KEY,
  matricule        TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  email            TEXT,
  tel              TEXT,
  filiere_id       INTEGER REFERENCES filieres(id),
  annee_academique TEXT,
  session          TEXT DEFAULT 'jour',
  archive          BOOLEAN DEFAULT FALSE,
  tenant_id        INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS filieres (
  id        SERIAL PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  cycle     TEXT NOT NULL DEFAULT 'Licence',
  tenant_id INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL,
  name        TEXT NOT NULL,
  prof_id     INTEGER REFERENCES professeurs(id),
  etudiant_id INTEGER REFERENCES etudiants(id),
  archive     BOOLEAN DEFAULT FALSE,
  tenant_id   INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS ues (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL,
  intitule    TEXT NOT NULL,
  semestre    INTEGER NOT NULL DEFAULT 1,
  credit_ue   INTEGER NOT NULL DEFAULT 3,
  filiere_ids INTEGER[] DEFAULT '{}',
  tenant_id   INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS matieres (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  credit_ecue NUMERIC NOT NULL DEFAULT 1,
  ue_id       INTEGER REFERENCES ues(id) ON DELETE CASCADE,
  tenant_id   INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS notes (
  id          SERIAL PRIMARY KEY,
  etudiant_id INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
  ue_id       INTEGER REFERENCES ues(id),
  matiere_id  INTEGER REFERENCES matieres(id),
  note_classe NUMERIC,
  note_examen NUMERIC,
  semestre    INTEGER,
  tenant_id   INTEGER REFERENCES tenants(id),
  UNIQUE(etudiant_id, matiere_id)
);

CREATE TABLE IF NOT EXISTS groupes (
  id         SERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  filiere_id INTEGER REFERENCES filieres(id),
  type       TEXT DEFAULT 'TD',
  effectif   INTEGER DEFAULT 30,
  tenant_id  INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS emplois_du_temps (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  filiere_ids INTEGER[] DEFAULT '{}',
  tenant_id   INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS edt_slots (
  id          SERIAL PRIMARY KEY,
  edt_id      INTEGER REFERENCES emplois_du_temps(id) ON DELETE CASCADE,
  jour        TEXT NOT NULL,
  session     TEXT DEFAULT 'jour',
  heure_debut TEXT,
  heure_fin   TEXT,
  matiere     TEXT,
  type        TEXT DEFAULT 'Cours',
  salle       TEXT,
  groupe      TEXT,
  prof_nom    TEXT,
  prof_tel    TEXT,
  tronc       BOOLEAN DEFAULT FALSE,
  tenant_id   INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS parametres (
  id                  SERIAL PRIMARY KEY,
  nom_etablissement   TEXT NOT NULL DEFAULT 'Universite',
  annee_academique    TEXT NOT NULL DEFAULT '2025/2026',
  annee_active        TEXT NOT NULL DEFAULT '2025/2026',
  semestre_actif      INTEGER NOT NULL DEFAULT 1,
  annees_disponibles  TEXT NOT NULL DEFAULT '2025/2026',
  logo                TEXT,
  couleur_principale  TEXT DEFAULT '#f0c040',
  semestres_par_cycle JSONB DEFAULT '{"L1":1,"L2":3,"L3":5,"M1":7,"M2":9}',
  tenant_id           INTEGER REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS deliberations (
  id               SERIAL PRIMARY KEY,
  etudiant_id      INTEGER REFERENCES etudiants(id),
  semestre         INTEGER NOT NULL,
  annee_academique TEXT NOT NULL,
  moyenne_generale DECIMAL(5,2),
  credits_valides  INTEGER DEFAULT 0,
  credits_total    INTEGER DEFAULT 0,
  statut           TEXT DEFAULT 'en_attente',
  statut_jury      TEXT,
  observations     TEXT,
  delibere_par     TEXT,
  delibere_le      TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(etudiant_id, semestre, annee_academique)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT,
  user_role  TEXT,
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  TEXT,
  details    JSONB,
  ip         TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO unigest;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO unigest;
