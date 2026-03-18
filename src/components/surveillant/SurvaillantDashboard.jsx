
import { useState } from "react";
import Layout from "../shared/Layout";
import GestionEDT from "../admin/GestionEDT";
import GestionGroupes from "../admin/GestionGroupes";

export default function SurvaillantDashboard({ user, data, setData, onLogout }) {
  const [tab, setTab] = useState("edt");
  const nav = [
    { id:"edt",     label:"Emplois du temps", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id:"groupes", label:"Groupes TD/TP",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id:"profil",  label:"Mon profil",       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <Layout user={user} role="surveillant" onLogout={onLogout} data={data}
      navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab==="edt"     && <GestionEDT     data={data} setData={setData}/>}
      {tab==="groupes" && <GestionGroupes data={data} setData={setData}/>}
      {tab==="profil"  && (
        <div>
          <h2 style={{fontSize:24,fontWeight:700,color:"#fb923c",marginBottom:24}}>Mon profil</h2>
          <div style={{maxWidth:460,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px"}}>
            {[["Identifiant",user.id],["Nom",user.name],["Role","Surveillant / Gestionnaire EDT"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
                <span style={{color:"var(--text)",fontWeight:600,fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
