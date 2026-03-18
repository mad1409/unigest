import { useState } from "react";
import Layout from "../shared/Layout";
import SaisieNotes from "./SaisieNotes";
import ProfEDT from "./ProfEDT";
import ProfProfil from "./ProfProfil";
import ChangerMotDePasse from "../shared/ChangerMotDePasse";

const svg = (d,d2) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>{d2 && <path d={d2}/>}
  </svg>
);

export default function ProfDashboard({ user, data, setData, onLogout }) {
  const [tab, setTab] = useState("notes");
  const prof = data.professeurs.find(p =>
    p.id === user.profId ||
    p.id === user.prof_id ||
    p.name === user.name
  );

  const nav = [
    { id: "notes",  icon: svg("M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"), label: "Saisie des notes" },
    { id: "edt",    icon: svg("M8 2v4M16 2v4M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"), label: "Emploi du temps" },
    { id: "profil", icon: svg("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"), label: "Mon profil" },
  ];

  return (
    <Layout user={user} role="prof" onLogout={onLogout} data={data} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab === "notes"  && <SaisieNotes user={user} data={data} setData={setData} prof={prof} />}
      {tab === "edt"    && <ProfEDT prof={prof} data={data} />}
      {tab === "profil" && (
        <div>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#38bdf8", marginBottom:24 }}>Mon Profil</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
            <ProfProfil prof={prof} data={data} />
            <ChangerMotDePasse user={user} data={data} setData={setData} color="#38bdf8" />
          </div>
        </div>
      )}
    </Layout>
  );
}
