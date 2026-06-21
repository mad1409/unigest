import { useState } from "react";
import Layout from "../shared/Layout";
import GestionEDT from "../admin/GestionEDT";
import GestionGroupes from "../admin/GestionGroupes";
import ChangerMotDePasse from "../shared/ChangerMotDePasse";

export default function SurvaillantDashboard({ user, data, setData, onLogout }) {
  const [tab, setTab] = useState("edt");

  const monAnnexe = (data.annexes||[]).find(a => a.id === user.annexe_id);

  // Filtrer les données à l'annexe du surveillant
  const dataFiltered = {
    ...data,
    emploisDuTemps: user.annexe_id
      ? (data.emploisDuTemps||[]).filter(e => e.annexe_id === user.annexe_id || e.annexe_id == null)
      : data.emploisDuTemps,
  };

  const nav = [
    { id:"edt", label:"Emplois du temps", icon:
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg> },
    { id:"groupes", label:"Groupes TD/TP", icon:
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg> },
    { id:"profil", label:"Mon profil", icon:
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg> },
  ];

  return (
    <Layout user={user} role="surveillant" onLogout={onLogout} data={data}
      navItems={nav} activeTab={tab} setActiveTab={setTab}>

      {/* Bandeau annexe */}
      {monAnnexe ? (
        <div style={{
          background:"rgba(240,192,64,0.08)",border:"1px solid rgba(240,192,64,0.2)",
          borderRadius:10,padding:"10px 16px",marginBottom:20,
          display:"flex",alignItems:"center",gap:10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <div>
            <span style={{fontSize:13,fontWeight:700,color:"#f0c040"}}>{monAnnexe.nom}</span>
            {monAnnexe.adresse && (
              <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{monAnnexe.adresse}</span>
            )}
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:10}}>
            <span style={{fontSize:11,color:"#34d399"}}>
              {(data.etudiants||[]).filter(e=>e.annexe_id===monAnnexe.id).length} étudiants
            </span>
            <span style={{fontSize:11,color:"#818cf8"}}>
              {(data.professeurs||[]).filter(p=>p.annexe_id===monAnnexe.id).length} profs
            </span>
          </div>
        </div>
      ) : user.annexe_id ? (
        <div style={{background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",
          borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:13,color:"#fb923c"}}>
          ⚠ Annexe non trouvée — contactez l'administrateur
        </div>
      ) : null}

      {tab==="edt"     && <GestionEDT     data={dataFiltered} setData={setData}/>}
      {tab==="groupes" && <GestionGroupes data={dataFiltered} setData={setData}/>}
      {tab==="profil"  && (
        <div style={{maxWidth:500}}>
          <h2 style={{fontSize:22,fontWeight:700,color:"#fb923c",marginBottom:20}}>Mon profil</h2>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:14,padding:"20px 24px",marginBottom:20}}>
            {[
              ["Identifiant",  user.id],
              ["Nom",          user.name],
              ["Rôle",         "Surveillant / Gestionnaire EDT"],
              ["Annexe",       monAnnexe?.nom || "Non affecté"],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",
                padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
                <span style={{color:"var(--text)",fontWeight:600,fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
          <ChangerMotDePasse user={user}/>
        </div>
      )}
    </Layout>
  );
}
