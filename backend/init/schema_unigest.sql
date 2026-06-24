--
-- PostgreSQL database dump
--

\restrict GO24zqKSsBP6Z6KB3XjxN3bKIXK7V9okqvc4tCSMnEDMgXXUyH1opx0ROmXwmWe

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tenant_bazo; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tenant_bazo;


--
-- Name: tenant_technolab; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tenant_technolab;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: annexes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annexes (
    id integer NOT NULL,
    nom text NOT NULL,
    adresse text,
    tenant_id integer
);


--
-- Name: annexes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.annexes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: annexes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.annexes_id_seq OWNED BY public.annexes.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id text,
    user_role text,
    action text NOT NULL,
    table_name text,
    record_id text,
    details jsonb,
    ip text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: calendrier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendrier (
    id integer NOT NULL,
    titre text NOT NULL,
    type text DEFAULT 'autre'::text NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    description text,
    annee_academique text DEFAULT '2025/2026'::text,
    tenant_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: calendrier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calendrier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calendrier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calendrier_id_seq OWNED BY public.calendrier.id;


--
-- Name: deliberations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliberations (
    id integer NOT NULL,
    etudiant_id integer,
    semestre integer NOT NULL,
    annee_academique text NOT NULL,
    moyenne_generale numeric(5,2),
    credits_valides integer DEFAULT 0,
    credits_total integer DEFAULT 0,
    statut text DEFAULT 'en_attente'::text,
    statut_jury text,
    observations text,
    delibere_par text,
    delibere_le timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: deliberations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deliberations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deliberations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deliberations_id_seq OWNED BY public.deliberations.id;


--
-- Name: edt_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edt_slots (
    id integer NOT NULL,
    edt_id integer,
    jour text NOT NULL,
    session text DEFAULT 'jour'::text,
    heure_debut text,
    heure_fin text,
    matiere text,
    type text DEFAULT 'Cours'::text,
    salle text,
    groupe text,
    prof_nom text,
    prof_tel text,
    tronc boolean DEFAULT false,
    tenant_id integer,
    site_id integer,
    annexe_id integer
);


--
-- Name: edt_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edt_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edt_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edt_slots_id_seq OWNED BY public.edt_slots.id;


--
-- Name: emplois_du_temps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emplois_du_temps (
    id integer NOT NULL,
    name text NOT NULL,
    filiere_ids integer[] DEFAULT '{}'::integer[],
    tenant_id integer,
    site_id integer,
    annexe_id integer
);


--
-- Name: emplois_du_temps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emplois_du_temps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emplois_du_temps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emplois_du_temps_id_seq OWNED BY public.emplois_du_temps.id;


--
-- Name: etudiants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.etudiants (
    id integer NOT NULL,
    matricule text NOT NULL,
    name text NOT NULL,
    email text,
    tel text,
    filiere_id integer,
    annee_academique text,
    session text DEFAULT 'jour'::text,
    archive boolean DEFAULT false,
    tenant_id integer,
    site_id integer,
    annexe_id integer
);


--
-- Name: etudiants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.etudiants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: etudiants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.etudiants_id_seq OWNED BY public.etudiants.id;


--
-- Name: filieres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filieres (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    cycle text DEFAULT 'Licence'::text NOT NULL,
    tenant_id integer
);


--
-- Name: filieres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.filieres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filieres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.filieres_id_seq OWNED BY public.filieres.id;


--
-- Name: groupes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groupes (
    id integer NOT NULL,
    nom text NOT NULL,
    filiere_id integer,
    type text DEFAULT 'TD'::text,
    effectif integer DEFAULT 30,
    tenant_id integer,
    site_id integer
);


--
-- Name: groupes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groupes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groupes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groupes_id_seq OWNED BY public.groupes.id;


--
-- Name: matieres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matieres (
    id integer NOT NULL,
    name text NOT NULL,
    credit_ecue numeric DEFAULT 1 NOT NULL,
    ue_id integer,
    tenant_id integer
);


--
-- Name: matieres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.matieres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: matieres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.matieres_id_seq OWNED BY public.matieres.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    etudiant_id integer,
    ue_id integer,
    matiere_id integer,
    note_classe numeric,
    note_examen numeric,
    semestre integer,
    tenant_id integer
);


--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: parametres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parametres (
    id integer NOT NULL,
    nom_etablissement text DEFAULT 'Universite'::text NOT NULL,
    annee_academique text DEFAULT '2025/2026'::text NOT NULL,
    annee_active text DEFAULT '2025/2026'::text NOT NULL,
    semestre_actif integer DEFAULT 1 NOT NULL,
    annees_disponibles text DEFAULT '2025/2026'::text NOT NULL,
    logo text,
    couleur_principale text DEFAULT '#f0c040'::text,
    semestres_par_cycle jsonb DEFAULT '{"L1": 1, "L2": 3, "L3": 5, "M1": 7, "M2": 9}'::jsonb,
    tenant_id integer
);


--
-- Name: parametres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parametres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parametres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parametres_id_seq OWNED BY public.parametres.id;


--
-- Name: professeurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professeurs (
    id integer NOT NULL,
    name text NOT NULL,
    tel text,
    matieres integer[] DEFAULT '{}'::integer[],
    tenant_id integer,
    site_ids integer[],
    annexe_id integer,
    cycle text DEFAULT 'Licence'::text,
    filiere_ids integer[] DEFAULT '{}'::integer[]
);


--
-- Name: professeurs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.professeurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: professeurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.professeurs_id_seq OWNED BY public.professeurs.id;


--
-- Name: sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites (
    id integer NOT NULL,
    nom text NOT NULL,
    adresse text,
    tel text,
    actif boolean DEFAULT true,
    tenant_id integer,
    created_at timestamp without time zone DEFAULT now(),
    code text
);


--
-- Name: sites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sites_id_seq OWNED BY public.sites.id;


--
-- Name: superadmin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.superadmin (
    id text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    nom text NOT NULL,
    code text NOT NULL,
    email text,
    tel text,
    ville text,
    date_debut date DEFAULT now(),
    date_expiration date,
    statut text DEFAULT 'actif'::text,
    max_etudiants integer DEFAULT 500,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: transferts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transferts (
    id integer NOT NULL,
    etudiant_id integer,
    filiere_id integer,
    site_ancien_id integer,
    site_nouveau_id integer,
    date_transfert date DEFAULT now(),
    motif text,
    fait_par text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: transferts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transferts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transferts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transferts_id_seq OWNED BY public.transferts.id;


--
-- Name: ues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ues (
    id integer NOT NULL,
    code text NOT NULL,
    intitule text NOT NULL,
    semestre integer DEFAULT 1 NOT NULL,
    credit_ue integer DEFAULT 3 NOT NULL,
    filiere_ids integer[] DEFAULT '{}'::integer[],
    tenant_id integer
);


--
-- Name: ues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ues_id_seq OWNED BY public.ues.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    name text NOT NULL,
    prof_id integer,
    etudiant_id integer,
    archive boolean DEFAULT false,
    tenant_id integer,
    site_id integer,
    site_ids integer[] DEFAULT '{}'::integer[],
    annexe_id integer,
    must_change_password boolean DEFAULT false
);


--
-- Name: edt_slots; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.edt_slots (
    id integer DEFAULT nextval('public.edt_slots_id_seq'::regclass) NOT NULL,
    edt_id integer,
    jour text NOT NULL,
    session text DEFAULT 'jour'::text,
    heure_debut text,
    heure_fin text,
    matiere text,
    type text DEFAULT 'Cours'::text,
    salle text,
    groupe text,
    prof_nom text,
    prof_tel text,
    tronc boolean DEFAULT false,
    tenant_id integer
);


--
-- Name: emplois_du_temps; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.emplois_du_temps (
    id integer DEFAULT nextval('public.emplois_du_temps_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    filiere_ids integer[] DEFAULT '{}'::integer[],
    tenant_id integer
);


--
-- Name: etudiants; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.etudiants (
    id integer DEFAULT nextval('public.etudiants_id_seq'::regclass) NOT NULL,
    matricule text NOT NULL,
    name text NOT NULL,
    email text,
    tel text,
    filiere_id integer,
    annee_academique text,
    session text DEFAULT 'jour'::text,
    archive boolean DEFAULT false,
    tenant_id integer
);


--
-- Name: filieres; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.filieres (
    id integer DEFAULT nextval('public.filieres_id_seq'::regclass) NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    cycle text DEFAULT 'Licence'::text NOT NULL,
    tenant_id integer
);


--
-- Name: groupes; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.groupes (
    id integer DEFAULT nextval('public.groupes_id_seq'::regclass) NOT NULL,
    nom text NOT NULL,
    filiere_id integer,
    type text DEFAULT 'TD'::text,
    effectif integer DEFAULT 30,
    tenant_id integer
);


--
-- Name: matieres; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.matieres (
    id integer DEFAULT nextval('public.matieres_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    credit_ecue numeric DEFAULT 1 NOT NULL,
    ue_id integer,
    tenant_id integer
);


--
-- Name: notes; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.notes (
    id integer DEFAULT nextval('public.notes_id_seq'::regclass) NOT NULL,
    etudiant_id integer,
    ue_id integer,
    matiere_id integer,
    note_classe numeric,
    note_examen numeric,
    semestre integer,
    tenant_id integer
);


--
-- Name: parametres; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.parametres (
    id integer DEFAULT nextval('public.parametres_id_seq'::regclass) NOT NULL,
    nom_etablissement text DEFAULT 'Universite'::text NOT NULL,
    annee_academique text DEFAULT '2025/2026'::text NOT NULL,
    annee_active text DEFAULT '2025/2026'::text NOT NULL,
    semestre_actif integer DEFAULT 1 NOT NULL,
    annees_disponibles text DEFAULT '2025/2026'::text NOT NULL,
    logo text,
    couleur_principale text DEFAULT '#f0c040'::text,
    semestres_par_cycle jsonb DEFAULT '{"L1": 1, "L2": 3, "L3": 5, "M1": 7, "M2": 9}'::jsonb,
    tenant_id integer
);


--
-- Name: professeurs; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.professeurs (
    id integer DEFAULT nextval('public.professeurs_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    tel text,
    matieres integer[] DEFAULT '{}'::integer[],
    tenant_id integer
);


--
-- Name: ues; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.ues (
    id integer DEFAULT nextval('public.ues_id_seq'::regclass) NOT NULL,
    code text NOT NULL,
    intitule text NOT NULL,
    semestre integer DEFAULT 1 NOT NULL,
    credit_ue integer DEFAULT 3 NOT NULL,
    filiere_ids integer[] DEFAULT '{}'::integer[],
    tenant_id integer
);


--
-- Name: users; Type: TABLE; Schema: tenant_bazo; Owner: -
--

CREATE TABLE tenant_bazo.users (
    id text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    name text NOT NULL,
    prof_id integer,
    etudiant_id integer,
    archive boolean DEFAULT false,
    tenant_id integer
);


--
-- Name: edt_slots; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.edt_slots (
    id integer,
    edt_id integer,
    jour text,
    session text,
    heure_debut text,
    heure_fin text,
    matiere text,
    type text,
    salle text,
    groupe text,
    prof_nom text,
    prof_tel text,
    tronc boolean,
    tenant_id integer
);


--
-- Name: emplois_du_temps; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.emplois_du_temps (
    id integer,
    name text,
    filiere_ids integer[],
    tenant_id integer
);


--
-- Name: etudiants; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.etudiants (
    id integer,
    matricule text,
    name text,
    email text,
    tel text,
    filiere_id integer,
    annee_academique text,
    session text,
    archive boolean,
    tenant_id integer
);


--
-- Name: filieres; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.filieres (
    id integer,
    code text,
    name text,
    cycle text,
    tenant_id integer
);


--
-- Name: groupes; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.groupes (
    id integer,
    nom text,
    filiere_id integer,
    type text,
    effectif integer,
    tenant_id integer
);


--
-- Name: matieres; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.matieres (
    id integer,
    name text,
    credit_ecue numeric,
    ue_id integer,
    tenant_id integer
);


--
-- Name: notes; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.notes (
    id integer,
    etudiant_id integer,
    ue_id integer,
    matiere_id integer,
    note_classe numeric,
    note_examen numeric,
    semestre integer,
    tenant_id integer
);


--
-- Name: parametres; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.parametres (
    id integer,
    nom_etablissement text,
    annee_academique text,
    annee_active text,
    semestre_actif integer,
    annees_disponibles text,
    logo text,
    couleur_principale text,
    semestres_par_cycle jsonb,
    tenant_id integer
);


--
-- Name: professeurs; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.professeurs (
    id integer,
    name text,
    tel text,
    matieres integer[],
    tenant_id integer
);


--
-- Name: ues; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.ues (
    id integer,
    code text,
    intitule text,
    semestre integer,
    credit_ue integer,
    filiere_ids integer[],
    tenant_id integer
);


--
-- Name: users; Type: TABLE; Schema: tenant_technolab; Owner: -
--

CREATE TABLE tenant_technolab.users (
    id text,
    password text,
    role text,
    name text,
    prof_id integer,
    etudiant_id integer,
    archive boolean,
    tenant_id integer
);


--
-- Name: annexes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annexes ALTER COLUMN id SET DEFAULT nextval('public.annexes_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: calendrier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendrier ALTER COLUMN id SET DEFAULT nextval('public.calendrier_id_seq'::regclass);


--
-- Name: deliberations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliberations ALTER COLUMN id SET DEFAULT nextval('public.deliberations_id_seq'::regclass);


--
-- Name: edt_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots ALTER COLUMN id SET DEFAULT nextval('public.edt_slots_id_seq'::regclass);


--
-- Name: emplois_du_temps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emplois_du_temps ALTER COLUMN id SET DEFAULT nextval('public.emplois_du_temps_id_seq'::regclass);


--
-- Name: etudiants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants ALTER COLUMN id SET DEFAULT nextval('public.etudiants_id_seq'::regclass);


--
-- Name: filieres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filieres ALTER COLUMN id SET DEFAULT nextval('public.filieres_id_seq'::regclass);


--
-- Name: groupes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupes ALTER COLUMN id SET DEFAULT nextval('public.groupes_id_seq'::regclass);


--
-- Name: matieres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matieres ALTER COLUMN id SET DEFAULT nextval('public.matieres_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: parametres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres ALTER COLUMN id SET DEFAULT nextval('public.parametres_id_seq'::regclass);


--
-- Name: professeurs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professeurs ALTER COLUMN id SET DEFAULT nextval('public.professeurs_id_seq'::regclass);


--
-- Name: sites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites ALTER COLUMN id SET DEFAULT nextval('public.sites_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: transferts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts ALTER COLUMN id SET DEFAULT nextval('public.transferts_id_seq'::regclass);


--
-- Name: ues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ues ALTER COLUMN id SET DEFAULT nextval('public.ues_id_seq'::regclass);


--
-- Name: annexes annexes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annexes
    ADD CONSTRAINT annexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: calendrier calendrier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendrier
    ADD CONSTRAINT calendrier_pkey PRIMARY KEY (id);


--
-- Name: deliberations deliberations_etudiant_id_semestre_annee_academique_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliberations
    ADD CONSTRAINT deliberations_etudiant_id_semestre_annee_academique_key UNIQUE (etudiant_id, semestre, annee_academique);


--
-- Name: deliberations deliberations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliberations
    ADD CONSTRAINT deliberations_pkey PRIMARY KEY (id);


--
-- Name: edt_slots edt_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots
    ADD CONSTRAINT edt_slots_pkey PRIMARY KEY (id);


--
-- Name: emplois_du_temps emplois_du_temps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emplois_du_temps
    ADD CONSTRAINT emplois_du_temps_pkey PRIMARY KEY (id);


--
-- Name: etudiants etudiants_matricule_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_matricule_key UNIQUE (matricule);


--
-- Name: etudiants etudiants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_pkey PRIMARY KEY (id);


--
-- Name: filieres filieres_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filieres
    ADD CONSTRAINT filieres_code_key UNIQUE (code);


--
-- Name: filieres filieres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filieres
    ADD CONSTRAINT filieres_pkey PRIMARY KEY (id);


--
-- Name: groupes groupes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_pkey PRIMARY KEY (id);


--
-- Name: matieres matieres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matieres
    ADD CONSTRAINT matieres_pkey PRIMARY KEY (id);


--
-- Name: notes notes_etudiant_id_matiere_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_etudiant_id_matiere_id_key UNIQUE (etudiant_id, matiere_id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: parametres parametres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_pkey PRIMARY KEY (id);


--
-- Name: professeurs professeurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professeurs
    ADD CONSTRAINT professeurs_pkey PRIMARY KEY (id);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: superadmin superadmin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmin
    ADD CONSTRAINT superadmin_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_code_key UNIQUE (code);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: transferts transferts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT transferts_pkey PRIMARY KEY (id);


--
-- Name: ues ues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ues
    ADD CONSTRAINT ues_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: edt_slots edt_slots_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.edt_slots
    ADD CONSTRAINT edt_slots_pkey PRIMARY KEY (id);


--
-- Name: emplois_du_temps emplois_du_temps_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.emplois_du_temps
    ADD CONSTRAINT emplois_du_temps_pkey PRIMARY KEY (id);


--
-- Name: etudiants etudiants_matricule_key; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.etudiants
    ADD CONSTRAINT etudiants_matricule_key UNIQUE (matricule);


--
-- Name: etudiants etudiants_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.etudiants
    ADD CONSTRAINT etudiants_pkey PRIMARY KEY (id);


--
-- Name: filieres filieres_code_key; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.filieres
    ADD CONSTRAINT filieres_code_key UNIQUE (code);


--
-- Name: filieres filieres_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.filieres
    ADD CONSTRAINT filieres_pkey PRIMARY KEY (id);


--
-- Name: groupes groupes_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.groupes
    ADD CONSTRAINT groupes_pkey PRIMARY KEY (id);


--
-- Name: matieres matieres_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.matieres
    ADD CONSTRAINT matieres_pkey PRIMARY KEY (id);


--
-- Name: notes notes_etudiant_id_matiere_id_key; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.notes
    ADD CONSTRAINT notes_etudiant_id_matiere_id_key UNIQUE (etudiant_id, matiere_id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: parametres parametres_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.parametres
    ADD CONSTRAINT parametres_pkey PRIMARY KEY (id);


--
-- Name: professeurs professeurs_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.professeurs
    ADD CONSTRAINT professeurs_pkey PRIMARY KEY (id);


--
-- Name: ues ues_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.ues
    ADD CONSTRAINT ues_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: tenant_bazo; Owner: -
--

ALTER TABLE ONLY tenant_bazo.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: annexes annexes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annexes
    ADD CONSTRAINT annexes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: calendrier calendrier_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendrier
    ADD CONSTRAINT calendrier_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: deliberations deliberations_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliberations
    ADD CONSTRAINT deliberations_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id);


--
-- Name: edt_slots edt_slots_annexe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots
    ADD CONSTRAINT edt_slots_annexe_id_fkey FOREIGN KEY (annexe_id) REFERENCES public.annexes(id);


--
-- Name: edt_slots edt_slots_edt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots
    ADD CONSTRAINT edt_slots_edt_id_fkey FOREIGN KEY (edt_id) REFERENCES public.emplois_du_temps(id) ON DELETE CASCADE;


--
-- Name: edt_slots edt_slots_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots
    ADD CONSTRAINT edt_slots_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: edt_slots edt_slots_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edt_slots
    ADD CONSTRAINT edt_slots_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: emplois_du_temps emplois_du_temps_annexe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emplois_du_temps
    ADD CONSTRAINT emplois_du_temps_annexe_id_fkey FOREIGN KEY (annexe_id) REFERENCES public.annexes(id);


--
-- Name: emplois_du_temps emplois_du_temps_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emplois_du_temps
    ADD CONSTRAINT emplois_du_temps_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: emplois_du_temps emplois_du_temps_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emplois_du_temps
    ADD CONSTRAINT emplois_du_temps_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: etudiants etudiants_annexe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_annexe_id_fkey FOREIGN KEY (annexe_id) REFERENCES public.annexes(id);


--
-- Name: etudiants etudiants_filiere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_filiere_id_fkey FOREIGN KEY (filiere_id) REFERENCES public.filieres(id);


--
-- Name: etudiants etudiants_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: etudiants etudiants_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT etudiants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: filieres filieres_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filieres
    ADD CONSTRAINT filieres_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: groupes groupes_filiere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_filiere_id_fkey FOREIGN KEY (filiere_id) REFERENCES public.filieres(id);


--
-- Name: groupes groupes_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: groupes groupes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: matieres matieres_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matieres
    ADD CONSTRAINT matieres_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: matieres matieres_ue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matieres
    ADD CONSTRAINT matieres_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES public.ues(id) ON DELETE CASCADE;


--
-- Name: notes notes_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id) ON DELETE CASCADE;


--
-- Name: notes notes_matiere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_matiere_id_fkey FOREIGN KEY (matiere_id) REFERENCES public.matieres(id);


--
-- Name: notes notes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: notes notes_ue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES public.ues(id);


--
-- Name: parametres parametres_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: professeurs professeurs_annexe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professeurs
    ADD CONSTRAINT professeurs_annexe_id_fkey FOREIGN KEY (annexe_id) REFERENCES public.annexes(id);


--
-- Name: professeurs professeurs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professeurs
    ADD CONSTRAINT professeurs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: sites sites_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: transferts transferts_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT transferts_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id);


--
-- Name: transferts transferts_filiere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT transferts_filiere_id_fkey FOREIGN KEY (filiere_id) REFERENCES public.filieres(id);


--
-- Name: transferts transferts_site_ancien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT transferts_site_ancien_id_fkey FOREIGN KEY (site_ancien_id) REFERENCES public.sites(id);


--
-- Name: transferts transferts_site_nouveau_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT transferts_site_nouveau_id_fkey FOREIGN KEY (site_nouveau_id) REFERENCES public.sites(id);


--
-- Name: ues ues_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ues
    ADD CONSTRAINT ues_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users users_annexe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_annexe_id_fkey FOREIGN KEY (annexe_id) REFERENCES public.annexes(id);


--
-- Name: users users_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id);


--
-- Name: users users_prof_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_prof_id_fkey FOREIGN KEY (prof_id) REFERENCES public.professeurs(id);


--
-- Name: users users_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- PostgreSQL database dump complete
--

\unrestrict GO24zqKSsBP6Z6KB3XjxN3bKIXK7V9okqvc4tCSMnEDMgXXUyH1opx0ROmXwmWe

