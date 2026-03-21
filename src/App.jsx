
// Mettre à jour le favicon dynamiquement
function updateFavicon(logoUrl) {
  try {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoUrl;
    link.type = 'image/png';
  } catch(e) {}
}
import { lazy, Suspense } from "react";
import ParticlesBackground from "./components/shared/ParticlesBackground";

// ── Fond animé ─────────────────────────────────────
function AnimatedBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
    }}>
      {/* Gradient de fond */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #071510 0%, #0a1f14 50%, #071510 100%)",
      }}/>
      {/* Orbes lumineux */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        borderRadius: "50%", top: "-10%", left: "-10%",
        background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 60%)",
        animation: "float 8s ease-in-out infinite",
      }}/>
      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", top: "30%", right: "-5%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)",
        animation: "float 10s ease-in-out infinite reverse",
      }}/>
      <div style={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", bottom: "-5%", left: "30%",
        background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        animation: "float 12s ease-in-out infinite",
      }}/>
      {/* Grille subtile */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.3,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}/>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import LoginEtudiant from "./components/shared/LoginEtudiant";
import LoginStaff from "./components/shared/LoginStaff";
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const ProfDashboard = lazy(() => import("./components/prof/ProfDashboard"));
const EtudiantDashboard = lazy(() => import("./components/etudiant/EtudiantDashboard"));
const SecretaireDashboard = lazy(() => import("./components/secretaire/SecretaireDashboard"));
const SurvaillantDashboard = lazy(() => import("./components/surveillant/SurvaillantDashboard"));

// ── Error Boundary ────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        height:"100vh",background:"#0a0d14",color:"#fff",gap:12,padding:20,textAlign:"center"}}>
        <div style={{fontSize:16,color:"#ef4444"}}>Erreur</div>
        <div style={{fontSize:12,color:"#888",maxWidth:320,wordBreak:"break-all"}}>
          {this.state.error?.message || String(this.state.error)}
        </div>
        <button onClick={()=>window.location.reload()}
          style={{background:"#f0c040",border:"none",borderRadius:8,padding:"10px 24px",
            color:"#1a1200",fontWeight:700,cursor:"pointer"}}>
          Recharger
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── Normalisation des données ─────────────────────────
function normalize(raw) {
  if (!raw) return null;
  try {
    return {
      ...raw,
      filieres: (raw.filieres||[]),
      etudiants: (raw.etudiants||[]).map(e => ({
        ...e,
        filiereId:       e.filiere_id       ?? e.filiereId,
        anneeAcademique: e.annee_academique  ?? e.anneeAcademique,
      })),
      professeurs: (raw.professeurs||[]).map(p => ({
        ...p,
        ueIds:    Array.isArray(p.matieres) ? p.matieres : (p.ueIds||[]),
        matieres: Array.isArray(p.matieres) ? p.matieres : (p.ueIds||[]),
      })),
      ues: (raw.ues||[]).map(u => ({
        ...u,
        creditUE:   parseFloat(u.credit_ue   ?? u.creditUE   ?? 1),
        filiereIds: u.filiere_ids ?? u.filiereIds ?? [],
        matieres:   (u.matieres||[]).map(m => ({
          ...m,
          creditECUE: parseFloat(m.credit_ecue ?? m.creditECUE ?? 1),
        })),
      })),
      groupes: (raw.groupes||[]).map(g => ({
        ...g,
        filiereId: g.filiere_id ?? g.filiereId,
      })),
      emploisDuTemps: (raw.emploisDuTemps||[]).map(e => ({
        ...e,
        filiereIds: e.filiere_ids ?? e.filiereIds ?? [],
        slots: (e.slots||[]).map(s => ({
          ...s,
          heureDebut: s.heure_debut ?? s.heureDebut ?? "",
          heureFin:   s.heure_fin   ?? s.heureFin   ?? "",
          profNom:    s.prof_nom    ?? s.profNom     ?? "",
          profTel:    s.prof_tel    ?? s.profTel     ?? "",
        })),
      })),
      notes: (raw.notes||[]).map(n => ({
        ...n,
        etudiantId: n.etudiant_id ?? n.etudiantId,
        ueId:       n.ue_id       ?? n.ueId,
        matiereId:  n.matiere_id  ?? n.matiereId,
        noteClasse: n.note_classe != null ? parseFloat(n.note_classe) : (n.noteClasse ?? null),
        noteExamen: n.note_examen != null ? parseFloat(n.note_examen) : (n.noteExamen ?? null),
      })),
      users: (raw.users||[]).map(u => ({
        ...u,
        profId:     u.prof_id     ?? u.profId     ?? null,
        etudiantId: u.etudiant_id ?? u.etudiantId ?? null,
      })),
      parametres: {
        nomEtablissement:  raw.parametres?.nom_etablissement ?? raw.parametres?.nomEtablissement  ?? "Universite",
        anneeAcademique:   raw.parametres?.annee_academique  ?? raw.parametres?.anneeAcademique   ?? "2025/2026",
        anneeActive:       raw.parametres?.annee_active      ?? raw.parametres?.anneeActive       ?? "2025/2026",
        semestreActif:     raw.parametres?.semestre_actif    ?? raw.parametres?.semestreActif     ?? 1,
        logo:             raw.parametres?.logo              || null,
      couleurPrincipale: raw.parametres?.couleur_principale || raw.parametres?.couleurPrincipale || '#f0c040',
      anneesDisponibles: (() => {
          const v = raw.parametres?.annees_disponibles ?? raw.parametres?.anneesDisponibles ?? "2025/2026";
          if (Array.isArray(v)) return v.map(String);
          return String(v).split(",").map(s=>s.trim());
        })(),
      },
    };
  } catch(e) {
    console.error("Erreur normalisation:", e);
    return raw;
  }
}

// ── Lecture session locale ────────────────────────────
function getSaved() {
  try { return JSON.parse(localStorage.getItem('unigest_session')); }
  catch { return null; }
}

// ── Composant Loading ─────────────────────────────────
function Loading() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",height:"100vh",background:"#0a0d14",gap:16}}>
      <div style={{width:48,height:48,border:"4px solid rgba(240,192,64,0.2)",
        borderTop:"4px solid #f0c040",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:"rgba(255,255,255,0.6)",fontSize:15}}>Chargement...</div>
      <style>{"@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

// ── App ───────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(null);
  const [publicParams, setPublicParams] = useState({});
  const [data,    setData]    = useState(null);
  const [status,  setStatus]  = useState("init"); // init | loading | ready | error | login
  const [errMsg,  setErrMsg]  = useState("");

  // Charger parametres publics (logo, nom) sans authentification
  useEffect(() => {
    api.getPublicParametres().then(p => {
      setPublicParams(p || {});
      // Mettre à jour le favicon avec le logo de l'université
      if (p?.logo) {
        updateFavicon(p.logo);
      }
      // Mettre à jour le titre de la page
      if (p?.nom_etablissement) {
        document.title = p.nom_etablissement + ' — UniGest';
      }
      });
  }, []);

  // Au démarrage — vérifier session existante
  useEffect(() => {
    const saved = getSaved();
    if (saved && saved.token) {
      setUser(saved);
      fetchData(saved.token);
    } else {
      setStatus("login");
    }
  }, []);

  async function fetchData(token, silent = false) {
    if (!silent) setStatus("loading");
    try {
      const [filieres, etudiants, ues, notes, edt, groupes, professeurs, users, parametres] =
        await Promise.all([
          api.getFilieres(),
          api.getEtudiants(),
          api.getUEs(),
          api.getNotes({}),
          api.getEDT(),
          api.getGroupes(),
          api.getProfesseurs(),
          api.getUsers(),
          api.getParametres(),
        ]);
      const normalized = normalize({ filieres, etudiants, ues, notes,
        emploisDuTemps:edt, groupes, professeurs, users, parametres });
      setData(normalized);
      // Mettre à jour favicon et titre
      if (normalized?.parametres?.logo) {
        updateFavicon(normalized.parametres.logo);
      }
      const nomEtab = normalized?.parametres?.nomEtablissement || 'UniGest';
      const role = user?.role || '';
      const roleLabel = {
        admin: 'Administration',
        prof: 'Espace Professeur',
        secretaire: 'Secretariat',
        surveillant: 'Surveillance',
        etudiant: 'Espace Etudiant',
      }[role] || '';
      document.title = roleLabel ? nomEtab + ' — ' + roleLabel : nomEtab;
      // Appliquer la couleur principale
      const couleur = normalized?.parametres?.couleurPrincipale || normalized?.parametres?.couleur_principale || '#f0c040';
      document.documentElement.style.setProperty('--primary', couleur);
      document.documentElement.style.setProperty('--gold', couleur);
      // Mettre à jour aussi publicParams
      setPublicParams(prev => ({...prev, couleur_principale: couleur}));
      setStatus("ready");
    } catch(e) {
      console.error("Erreur fetchData:", e);
      setErrMsg(e.message || "Erreur réseau");
      setStatus("error");
    }
  }

  async function refreshData() {
    const saved = getSaved();
    if (saved) await fetchData(saved.token, true);
    // Rafraichir aussi les params publics
    api.getPublicParametres().then(p => {
      if (p) {
        setPublicParams(p);
        const couleur = p.couleur_principale || '#f0c040';
        document.documentElement.style.setProperty('--primary', couleur);
        document.documentElement.style.setProperty('--gold', couleur);
      }
    });
  }

  async function handleLogin(id, password, role) {
    try {
      const result = await api.login(id, password, role);
      return { success:true, user:{ ...result.user, token:result.token } };
    } catch { return { success:false }; }
  }

  function handleSetUser(u) {
    const userData = u.user || u;
    if (userData.prof_id     != null) userData.profId     = userData.prof_id;
    if (userData.etudiant_id != null) userData.etudiantId = userData.etudiant_id;
    localStorage.setItem('unigest_session', JSON.stringify(userData));
    setUser(userData);
    fetchData(userData.token);
  }

  function onLogout() {
    localStorage.removeItem('unigest_session');
    setUser(null);
    setData(null);
    setStatus("login");
    setErrMsg("");
  }

  // Rendu selon status
  if (status === "init" || status === "loading") return <Loading/>;

  if (status === "error") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",height:"100vh",background:"#0a0d14",gap:14,padding:20,textAlign:"center"}}>
      <div style={{fontSize:16,color:"#ef4444"}}>Erreur de chargement</div>
      <div style={{fontSize:12,color:"#888",maxWidth:300,wordBreak:"break-all"}}>{errMsg}</div>
      <button onClick={refreshData}
        style={{background:"#f0c040",border:"none",borderRadius:8,padding:"10px 24px",
          color:"#1a1200",fontWeight:700,cursor:"pointer"}}>Reessayer</button>
      <button onClick={onLogout}
        style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,
          padding:"8px 20px",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:13}}>
        Se deconnecter
      </button>
    </div>
  );

  if (status === "ready" && user && data) {
    const props = { user, data, setData:refreshData, onLogout };
    return (
      <ErrorBoundary>
        <ParticlesBackground/>
        <Suspense fallback={
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#34d399",fontSize:16}}>
            Chargement...
          </div>
        }>
          {user.role === "admin"       && <AdminDashboard       {...props} onReset={refreshData} onExport={()=>{}} onImport={()=>{}} />}
          {user.role === "prof"        && <ProfDashboard        {...props}/>}
          {user.role === "etudiant"    && <EtudiantDashboard    {...props}/>}
          {user.role === "secretaire"  && <SecretaireDashboard  {...props}/>}
          {user.role === "surveillant" && <SurvaillantDashboard {...props}/>}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Routes>
      <Route path="/"               element={<LoginEtudiant onLogin={handleLogin} onSuccess={handleSetUser} parametres={publicParams}/>}/>
      <Route path="/administration" element={<LoginStaff    onLogin={handleLogin} onSuccess={handleSetUser} parametres={publicParams}/>}/>
      <Route path="*"               element={<Navigate to="/"/>}/>
    </Routes>
  );
}
