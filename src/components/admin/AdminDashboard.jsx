import { useState, useRef } from "react";
import Layout from "../shared/Layout";
import AdminOverview from "./AdminOverview";
import AdminNotifications from "./AdminNotifications";
import CalendrierAcademique from "./CalendrierAcademique";
import Deliberation from "./Deliberation";
import GestionSites from "./GestionSites";
import RapportPDF from "./RapportPDF";
import GestionFilieres from "./GestionFilieres";
import GestionUE from "./GestionUE";
import GestionEDT from "./GestionEDT";
import GestionEtudiants from "./GestionEtudiants";
import GestionProfs from "./GestionProfs";
import AdminProfil from "./AdminProfil";
import GestionGroupes from "./GestionGroupes";
import ImportCSV from "./ImportCSV";

const svg = (paths) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d}/>)}
  </svg>
);

const ICONS = {
  overview:  svg(["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"]),
  filieres:  svg(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]),
  ues:       svg(["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]),
  etudiants: svg(["M22 10v6M2 10l10-5 10 5-10 5z","M6 12v5c3 3 9 3 12 0v-5"]),
  profs:     svg(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]),
  groupes:   svg(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M16 3.13a4 4 0 0 1 0 7.75"]),
  edt:       svg(["M8 2v4M16 2v4M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"]),
  import:    svg(["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]),
  profil:    svg(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]),
};

export default function AdminDashboard({
  user, data, setData, onLogout,
  onReset, onExport, onImport,
}) {
  const [tab,   setTab]   = useState("overview");
  const importRef         = useRef();

  const nbAlertes = (() => {
    const filieres  = data?.filieres    || [];
    const etudiants = data?.etudiants   || [];
    const ues       = data?.ues         || [];
    const notes     = data?.notes       || [];
    const edts      = data?.emploisDuTemps || [];
    let n = 0;
    if (etudiants.filter(e => !notes.find(no => (no.etudiantId||no.etudiant_id)===e.id)).length > 0) n++;
    if (filieres.filter(f => !edts.some(e => (e.filiereIds||e.filiere_ids||[]).includes(f.id))).length > 0) n++;
    if (filieres.filter(f => !ues.some(u => (u.filiereIds||u.filiere_ids||[]).includes(f.id))).length > 0) n++;
    if (ues.filter(u => !(u.matieres||[]).length).length > 0) n++;
    if (etudiants.filter(e => !filieres.find(f => f.id===(e.filiereId||e.filiere_id))).length > 0) n++;
    return n;
  })();

  const nav = [
    { id: "overview",  icon: ICONS.overview,  label: "Vue d'ensemble"   },
    { id: "filieres",  icon: ICONS.filieres,  label: "Filieres"         },
    { id: "ues",       icon: ICONS.ues,       label: "UE / Matieres"    },
    { id: "etudiants", icon: ICONS.etudiants, label: "Etudiants"        },
    { id: "groupes",   icon: ICONS.groupes,   label: "Groupes TD/TP"    },
    { id: "profs",     icon: ICONS.profs,     label: "Enseignants"      },
    { id: "edt",       icon: ICONS.edt,       label: "Emplois du temps" },
    { id: "import",        icon: ICONS.import,    label: "Import CSV"       },
    { id: "notifications", icon: ICONS.overview,  label: "Notifications", badge: nbAlertes },
    { id: "calendrier",    icon: ICONS.edt,       label: "Calendrier"     },
    { id: "sites",         icon: ICONS.overview,  label: "Sites"          },
    { id: "deliberation",  icon: ICONS.overview,  label: "Deliberation"   },
    { id: "rapports",      icon: ICONS.overview,  label: "Rapports & Exports" },
    { id: "profil",    icon: ICONS.profil,    label: "Mon profil"       },
  ];

  return (
    <Layout
      user={user} role="admin"
      onLogout={onLogout}
      navItems={nav}
      activeTab={tab}
      setActiveTab={setTab}
      extra={
        <div style={{ display:"flex", flexDirection:"column", gap:6, padding:"12px 8px", borderTop:"1px solid var(--border)", marginTop:8 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"var(--text3)", marginBottom:4, paddingLeft:6 }}>
            Donnees
          </div>
          <button onClick={onExport} style={btnData("#34d399")}>Exporter JSON</button>
          <button onClick={() => importRef.current.click()} style={btnData("#38bdf8")}>Importer JSON</button>
          <input type="file" accept=".json" ref={importRef} style={{ display:"none" }}
            onChange={e => { if (e.target.files[0]) { onImport(e.target.files[0]); e.target.value=""; }}}
          />
          <button onClick={onReset} style={btnData("#ef4444")}>Reinitialiser</button>
        </div>
      }
    >
      {tab === "overview"  && <AdminOverview    data={data} />}
      {tab === "filieres"  && <GestionFilieres  data={data} setData={setData} />}
      {tab === "ues"       && <GestionUE        data={data} setData={setData} />}
      {tab === "etudiants" && <GestionEtudiants data={data} setData={setData} />}
      {tab === "groupes"   && <GestionGroupes   data={data} setData={setData} />}
      {tab === "profs"     && <GestionProfs     data={data} setData={setData} />}
      {tab === "edt"       && <GestionEDT       data={data} setData={setData} />}
      {tab === "import"        && <ImportCSV          data={data} setData={setData} />}
      {tab === "notifications" && <AdminNotifications data={data} />}
      {tab === "calendrier"    && <CalendrierAcademique data={data} />}
      {tab === "sites"         && <GestionSites />}
      {tab === "deliberation"  && <Deliberation data={data} />}
      {tab === "rapports"      && <RapportPDF data={data} />}
      {tab === "profil"    && <AdminProfil      user={user} data={data} setData={setData} />}
    </Layout>
  );
}

const btnData = (color) => ({
  background: color+"12", border:`1px solid ${color}30`,
  borderRadius:8, padding:"8px 12px", color,
  fontSize:12, fontWeight:600, textAlign:"left",
  cursor:"pointer", transition:"all 0.15s",
});
