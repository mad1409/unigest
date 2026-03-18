
-- UniGest — Schéma PostgreSQL
-- Créé automatiquement au premier démarrage

CREATE TABLE IF NOT EXISTS parametres (
  id                  SERIAL PRIMARY KEY,
  nom_etablissement   TEXT NOT NULL DEFAULT 'Universite',
  annee_academique    TEXT NOT NULL DEFAULT '2025/2026',
  annee_active        TEXT NOT NULL DEFAULT '2025/2026',
  semestre_actif      INT  NOT NULL DEFAULT 1,
  annees_disponibles  TEXT NOT NULL DEFAULT '2025/2026'
);

CREATE TABLE IF NOT EXISTS filieres (
  id    SERIAL PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  cycle TEXT NOT NULL DEFAULT 'Licence'
);

CREATE TABLE IF NOT EXISTS professeurs (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  tel      TEXT,
  matieres INT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS etudiants (
  id               SERIAL PRIMARY KEY,
  matricule        TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  email            TEXT,
  tel              TEXT,
  filiere_id       INT REFERENCES filieres(id),
  annee_academique TEXT,
  session          TEXT DEFAULT 'jour'
);

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL,
  name         TEXT NOT NULL,
  prof_id      INT REFERENCES professeurs(id),
  etudiant_id  INT REFERENCES etudiants(id)
);

CREATE TABLE IF NOT EXISTS ues (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL,
  intitule   TEXT NOT NULL,
  semestre   INT  NOT NULL DEFAULT 1,
  credit_ue  INT  NOT NULL DEFAULT 3,
  filiere_ids INT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS matieres (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  credit_ecue NUMERIC NOT NULL DEFAULT 1,
  ue_id       INT REFERENCES ues(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id           SERIAL PRIMARY KEY,
  etudiant_id  INT REFERENCES etudiants(id) ON DELETE CASCADE,
  ue_id        INT REFERENCES ues(id),
  matiere_id   INT REFERENCES matieres(id),
  note_classe  NUMERIC,
  note_examen  NUMERIC,
  semestre     INT,
  UNIQUE(etudiant_id, matiere_id)
);

CREATE TABLE IF NOT EXISTS groupes (
  id         SERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  filiere_id INT REFERENCES filieres(id),
  type       TEXT DEFAULT 'TD',
  effectif   INT  DEFAULT 30
);

CREATE TABLE IF NOT EXISTS emplois_du_temps (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  filiere_ids INT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS edt_slots (
  id       SERIAL PRIMARY KEY,
  edt_id   INT REFERENCES emplois_du_temps(id) ON DELETE CASCADE,
  jour     TEXT NOT NULL,
  session  TEXT DEFAULT 'jour',
  heure_debut TEXT,
  heure_fin   TEXT,
  matiere  TEXT,
  type     TEXT DEFAULT 'Cours',
  salle    TEXT,
  groupe   TEXT,
  prof_nom TEXT,
  prof_tel TEXT,
  tronc    BOOLEAN DEFAULT FALSE
);
