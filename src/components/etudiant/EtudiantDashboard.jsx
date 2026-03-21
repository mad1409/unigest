import { useState } from "react";
import Layout from "../shared/Layout";
import MesNotes from "./MesNotes";
import Bulletin from "./Bulletin";
import MonEDT from "./MonEDT";
import MonCalendrier from "./MonCalendrier";
import MonProfil from "./MonProfil";

const svg = (d,d2) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>{d2 && <path d={d2}/>}
  </svg>
);

export default function EtudiantDashboard({ user, data, setData, onLogout }) {
  const [tab, setTab] = useState("notes");
  const etudiantId = user?.etudiantId || user?.etudiant_id || null;
  const etudiant = etudiantId ? (data.etudiants||[]).find(e => e.id === etudiantId) : null;

  const nav = [
    { id: "notes",    icon: svg("M18 20V10","M12 20V4","M6 20v-6"), label: "Mes Notes" },
    { id: "bulletin", icon: svg("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6M16 13H8M16 17H8M10 9H8"), label: "Bulletin" },
    { id: "edt",        icon: svg("M8 2v4M16 2v4M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"), label: "Emploi du temps" },
    { id: "calendrier",  icon: svg("M8 2v4M16 2v4M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"), label: "Calendrier" },
    { id: "profil",   icon: svg("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"), label: "Mon profil" },
  ];

  return (
    <Layout user={user} role="etudiant" onLogout={onLogout} data={data} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab === "notes"    && <MesNotes  etudiant={etudiant} data={data} />}
      {tab === "bulletin" && <Bulletin  etudiant={etudiant} data={data} />}
      {tab === "edt"        && <MonEDT        etudiant={etudiant} data={data} />}
      {tab === "calendrier"  && <MonCalendrier  data={data} />}
      {tab === "profil"   && <MonProfil user={user} etudiant={etudiant} data={data} setData={setData} />}
    </Layout>
  );
}
