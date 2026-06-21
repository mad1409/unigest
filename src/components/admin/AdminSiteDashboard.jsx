import { useState, useEffect } from "react";
import Layout from "../shared/Layout";
import { api } from "../../api";

const svg = (paths) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d,i) => <path key={i} d={d}/>)}
  </svg>
);
const ICONS = {
  dashboard: svg(["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"]),
  users:     svg(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]),
  profil:    svg(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]),
};

const inp = {
  width:"100%", padding:"10px 12px", background:"rgba(255,255,255,0.05)",
  border:"1px solid var(--border)", borderRadius:8, color:"var(--text)",
  fontSize:13, boxSizing:"border-box",
};

// ── Vue d'ensemble ────────────────────────────────────
function SiteOverview({ user, data }) {
  const annexe    = (data.annexes||[]).find(a => a.id === user.annexe_id);
  const etudiants = (data.etudiants||[]).filter(e => e.annexe_id === user.annexe_id && !e.archive);
  const profs     = (data.professeurs||[]).filter(p => p.annexe_id === user.annexe_id);
  const edts      = (data.emploisDuTemps||[]).filter(e => e.annexe_id === user.annexe_id);

  return (
    <div>
      {annexe ? (
        <div style={{background:"rgba(240,192,64,0.08)",border:"1px solid rgba(240,192,64,0.2)",
          borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#f0c040"}}>{annexe.nom}</div>
            {annexe.adresse && <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{annexe.adresse}</div>}
          </div>
        </div>
      ) : (
        <div style={{background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",
          borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:13,color:"#fb923c"}}>
          ⚠ Aucune annexe associée — contactez l'administrateur principal
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
        {[
          {label:"Étudiants actifs", value:etudiants.length, color:"#34d399"},
          {label:"Professeurs",      value:profs.length,     color:"#818cf8"},
          {label:"Emplois du temps", value:edts.length,      color:"#f0c040"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:12,padding:"18px 16px"}}>
            <div style={{fontSize:32,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:"var(--text2)",marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.2)",
        borderRadius:12,padding:"16px 20px"}}>
        <div style={{fontWeight:700,color:"#34d399",marginBottom:10}}>Vos responsabilités</div>
        <ul style={{color:"var(--text2)",fontSize:13,paddingLeft:20,lineHeight:2,margin:0}}>
          <li>Créer les comptes <strong style={{color:"#38bdf8"}}>secrétaires</strong> et <strong style={{color:"#f0c040"}}>surveillants</strong> de votre annexe</li>
          <li>La secrétaire crée et gère les comptes étudiants</li>
          <li>Le surveillant gère les emplois du temps</li>
        </ul>
      </div>
    </div>
  );
}

// ── Gestion du personnel ──────────────────────────────
function GestionPersonnel({ user, data, onMessage }) {
  const [users,     setUsers]     = useState([]);
  const [form,      setForm]      = useState({id:"",password:"",name:"",role:"secretaire"});
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd,    setNewPwd]    = useState("");
  const [loading,   setLoading]   = useState(false);

  const annexe = (data.annexes||[]).find(a => a.id === user.annexe_id);

  useEffect(() => { chargerUsers(); }, []);

  async function chargerUsers() {
    try {
      const all = await api.getUsers();
      setUsers(all.filter(u =>
        u.annexe_id === user.annexe_id &&
        (u.role === "secretaire" || u.role === "surveillant")
      ));
    } catch { setUsers([]); }
  }

  async function createUser(e) {
    e.preventDefault();
    if (!form.id || !form.password || !form.name)
      return onMessage("Tous les champs sont requis", "error");
    if (!user.annexe_id)
      return onMessage("Aucune annexe associée à votre compte", "error");
    setLoading(true);
    try {
      await api.createUser({ ...form, annexe_id: user.annexe_id });
      onMessage(`Compte ${form.role} créé avec succès`, "success");
      setForm({id:"",password:"",name:"",role:"secretaire"});
      chargerUsers();
    } catch(err) { onMessage("Erreur : " + err.message, "error"); }
    setLoading(false);
  }

  async function deleteUser(id) {
    if (!confirm("Supprimer ce compte ?")) return;
    try { await api.deleteUser(id); chargerUsers(); onMessage("Supprimé", "success"); }
    catch(e) { onMessage("Erreur : " + e.message, "error"); }
  }

  async function handleChangePwd() {
    if (!newPwd || !pwdTarget) return;
    setLoading(true);
    try {
      await api.resetPassword(pwdTarget, newPwd);
      onMessage("Mot de passe modifié !", "success");
      setPwdTarget(null); setNewPwd("");
    } catch(e) { onMessage("Erreur : " + e.message, "error"); }
    setLoading(false);
  }

  const badge = (role) => {
    const c = role==="secretaire" ? "#38bdf8" : "#f0c040";
    return <span style={{padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:600,
      background:c+"20",color:c,textTransform:"uppercase"}}>{role}</span>;
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      {/* Formulaire */}
      <form onSubmit={createUser} style={{background:"var(--bg2)",padding:22,
        borderRadius:12,border:"1px solid var(--border)"}}>
        <h3 style={{color:"#f0c040",marginBottom:6,fontSize:16}}>Créer un compte</h3>
        {annexe && <div style={{fontSize:11,color:"var(--text3)",marginBottom:16}}>
          Annexe : <strong style={{color:"#f0c040"}}>{annexe.nom}</strong>
        </div>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <select style={inp} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="secretaire">Secrétaire</option>
            <option value="surveillant">Surveillant</option>
          </select>
          <input style={inp} placeholder="Identifiant (login)" value={form.id}
            onChange={e=>setForm({...form,id:e.target.value})} required/>
          <input style={inp} type="password" placeholder="Mot de passe" value={form.password}
            onChange={e=>setForm({...form,password:e.target.value})} required/>
          <input style={inp} placeholder="Nom complet" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})} required/>
          <button type="submit" disabled={loading} style={{
            padding:11,background:"#f0c040",border:"none",borderRadius:8,
            color:"#1a1200",fontWeight:700,cursor:"pointer",opacity:loading?0.6:1,
          }}>{loading?"Création...":"Créer le compte"}</button>
        </div>
      </form>

      {/* Liste */}
      <div style={{background:"var(--bg2)",padding:22,borderRadius:12,border:"1px solid var(--border)"}}>
        <h3 style={{color:"#f0c040",marginBottom:16,fontSize:16}}>
          Personnel ({users.length})
        </h3>
        {users.length===0 ? (
          <p style={{color:"var(--text3)",fontSize:13}}>Aucun compte créé.</p>
        ) : users.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
            gap:10,padding:"12px 14px",marginBottom:8,background:"rgba(255,255,255,0.03)",
            borderRadius:8,border:"1px solid var(--border)"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:600,color:"var(--text)",fontSize:13}}>{u.name}</span>
                {badge(u.role)}
              </div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Login : <strong>{u.id}</strong></div>
              {pwdTarget===u.id ? (
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input type="password" placeholder="Nouveau mdp" value={newPwd}
                    onChange={e=>setNewPwd(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleChangePwd()}
                    style={{...inp,width:"60%",padding:"6px 10px",fontSize:12}} autoFocus/>
                  <button onClick={handleChangePwd} disabled={loading} style={{
                    padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",
                    background:"rgba(52,211,153,0.15)",color:"#34d399",fontWeight:700}}>✓</button>
                  <button onClick={()=>{setPwdTarget(null);setNewPwd("");}} style={{
                    padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",
                    background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700}}>✗</button>
                </div>
              ) : (
                <button onClick={()=>setPwdTarget(u.id)} style={{
                  marginTop:6,padding:"3px 10px",borderRadius:6,border:"none",
                  cursor:"pointer",background:"rgba(240,192,64,0.1)",color:"#f0c040",
                  fontSize:11,fontWeight:600}}>🔑 Modifier le mot de passe</button>
              )}
            </div>
            <button onClick={()=>deleteUser(u.id)} style={{
              padding:"5px 10px",background:"rgba(239,68,68,0.1)",
              border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,
              color:"#ef4444",cursor:"pointer",fontSize:11,flexShrink:0}}>Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profil ────────────────────────────────────────────
function SiteProfil({ user, data }) {
  const annexe = (data.annexes||[]).find(a => a.id === user.annexe_id);
  return (
    <div style={{maxWidth:460}}>
      <h2 style={{fontSize:22,fontWeight:700,color:"#f0c040",marginBottom:20}}>Mon profil</h2>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px"}}>
        {[
          ["Identifiant", user.id],
          ["Nom",         user.name],
          ["Rôle",        "Administrateur d'annexe"],
          ["Annexe",      annexe?.nom     || "Non affecté"],
          ["Adresse",     annexe?.adresse || "—"],
        ].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",
            padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
            <span style={{color:"var(--text)",fontWeight:600,fontSize:13}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────
export default function AdminSiteDashboard({ user, data, setData, onLogout }) {
  const [tab,     setTab]     = useState("overview");
  const [message, setMessage] = useState({text:"",type:""});

  const handleMessage = (text, type="info") => {
    setMessage({text,type});
    setTimeout(()=>setMessage({text:"",type:""}), 5000);
  };

  const nav = [
    {id:"overview",  icon:ICONS.dashboard, label:"Vue d'ensemble"},
    {id:"personnel", icon:ICONS.users,     label:"Personnel"},
    {id:"profil",    icon:ICONS.profil,    label:"Mon profil"},
  ];

  return (
    <Layout user={user} role="admin_site" onLogout={onLogout} data={data}
      navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {message.text && (
        <div style={{padding:"11px 16px",borderRadius:8,marginBottom:16,fontSize:13,
          background:message.type==="success"?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.1)",
          color:message.type==="success"?"#34d399":"#ef4444",
          border:`1px solid ${message.type==="success"?"#34d399":"#ef4444"}`}}>
          {message.text}
        </div>
      )}
      {tab==="overview"  && <SiteOverview   user={user} data={data||{}}/>}
      {tab==="personnel" && <GestionPersonnel user={user} data={data||{}} onMessage={handleMessage}/>}
      {tab==="profil"    && <SiteProfil     user={user} data={data||{}}/>}
    </Layout>
  );
}
