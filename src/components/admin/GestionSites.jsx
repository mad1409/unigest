import { useState, useEffect } from "react";
import { api } from "../../api";

const KeyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/>
  </svg>
);

const inp = {
  width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.05)",
  border:"1px solid var(--border)", borderRadius:9, padding:"10px 14px",
  color:"var(--text)", fontSize:13, marginBottom:10,
};
const btnPrimary = {
  background:"#f0c040", border:"none", borderRadius:9,
  padding:"10px 22px", color:"#1a1200", fontSize:13, fontWeight:700, cursor:"pointer",
};

export default function GestionSites() {
  const [annexes,   setAnnexes]   = useState([]);
  const [admins,    setAdmins]    = useState([]);
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState({ nom:"", adresse:"" });
  const [loading,   setLoading]   = useState(false);
  const [newAdmin,  setNewAdmin]  = useState({ id:"", password:"", name:"", annexe_id:"" });
  const [message,   setMessage]   = useState({ text:"", type:"" });
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd,    setNewPwd]    = useState("");

  useEffect(() => { charger(); fetchAdmins(); }, []);

  async function charger() {
    try { setAnnexes(await api.getAnnexes() || []); } catch { setAnnexes([]); }
  }
  async function fetchAdmins() {
    try {
      const users = await api.getUsers();
      setAdmins((users||[]).filter(u => u.role === "admin_site"));
    } catch { setAdmins([]); }
  }

  function openNew()   { setForm({nom:"",adresse:""}); setEditing(null); setModal(true); }
  function openEdit(a) { setForm({nom:a.nom,adresse:a.adresse||""}); setEditing(a.id); setModal(true); }

  async function save() {
    if (!form.nom) return;
    setLoading(true);
    try {
      editing ? await api.updateAnnexe(editing, form) : await api.createAnnexe(form);
      await charger(); setModal(false);
    } catch(e) { alert(e.message); }
    setLoading(false);
  }

  async function del(id) {
    if (!confirm("Supprimer cette annexe ?")) return;
    try { await api.deleteAnnexe(id); await charger(); } catch(e) { alert(e.message); }
  }

  function showMsg(text, type="error") {
    setMessage({text,type});
    setTimeout(()=>setMessage({text:"",type:""}), 5000);
  }

  async function createAdminAnnexe() {
    if (!newAdmin.id || !newAdmin.password || !newAdmin.name || !newAdmin.annexe_id)
      return showMsg("Tous les champs sont requis");
    setLoading(true);
    try {
      await api.createAdminSite({
        id:        newAdmin.id,
        password:  newAdmin.password,
        name:      newAdmin.name,
        annexe_id: parseInt(newAdmin.annexe_id),
      });
      showMsg("Administrateur d'annexe créé avec succès", "success");
      setNewAdmin({id:"",password:"",name:"",annexe_id:""});
      await fetchAdmins();
    } catch(err) { showMsg("Erreur : " + err.message); }
    setLoading(false);
  }

  async function handleChangePwd() {
    if (!newPwd || !pwdTarget) return;
    setLoading(true);
    try {
      await api.resetPassword(pwdTarget, newPwd);
      showMsg("Mot de passe modifié avec succès", "success");
      setPwdTarget(null); setNewPwd("");
    } catch(err) { showMsg("Erreur : " + err.message); }
    setLoading(false);
  }

  const getAnnexeName = (id) => (annexes.find(a => a.id === parseInt(id))?.nom) || "—";

  const actionBtn = (color) => ({
    padding:"5px 12px", borderRadius:6, border:"none", cursor:"pointer",
    fontSize:12, fontWeight:600, background:color+"20", color,
  });

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Gestion des Annexes & Comptes
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
            {annexes.length} annexe(s) — Technolab Bamako
          </p>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ Nouvelle annexe</button>
      </div>

      {/* Cards annexes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:24}}>
        {annexes.map(a=>(
          <div key={a.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:12,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#f0c040"}}>{a.nom}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>ID : {a.id}</div>
                {a.adresse && <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>{a.adresse}</div>}
              </div>
            </div>
            {/* Stats */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[
                {l:"Étudiants", v:parseInt(a.nb_etudiants)||0, c:"#34d399"},
                {l:"Profs",     v:parseInt(a.nb_professeurs)||0, c:"#818cf8"},
              ].map(s=>(
                <div key={s.l} style={{flex:1,background:"rgba(255,255,255,0.04)",
                  borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,color:"var(--text3)"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>openEdit(a)} style={actionBtn("#38bdf8")}>Modifier</button>
              <button onClick={()=>del(a.id)}   style={actionBtn("#ef4444")}>Supprimer</button>
            </div>
          </div>
        ))}
        {annexes.length===0 && (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"var(--text3)",fontSize:13}}>
            Aucune annexe créée — cliquez sur "+ Nouvelle annexe"
          </div>
        )}
      </div>

      {/* Créer admin d'annexe */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:22,marginBottom:24}}>
        <h3 style={{fontSize:16,fontWeight:700,color:"#f0c040",marginBottom:16}}>
          Créer un administrateur d'annexe
        </h3>
        {message.text && (
          <div style={{padding:"10px 14px",borderRadius:8,marginBottom:14,fontSize:13,
            background:message.type==="success"?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.1)",
            color:message.type==="success"?"#34d399":"#ef4444",
            border:`1px solid ${message.type==="success"?"#34d399":"#ef4444"}`}}>
            {message.text}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
          <select style={inp} value={newAdmin.annexe_id}
            onChange={e=>setNewAdmin({...newAdmin,annexe_id:e.target.value})}>
            <option value="">-- Sélectionner une annexe --</option>
            {annexes.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>
          <input style={inp} placeholder="Identifiant admin" value={newAdmin.id}
            onChange={e=>setNewAdmin({...newAdmin,id:e.target.value})}/>
          <input style={inp} type="password" placeholder="Mot de passe" value={newAdmin.password}
            onChange={e=>setNewAdmin({...newAdmin,password:e.target.value})}/>
          <input style={inp} placeholder="Nom complet" value={newAdmin.name}
            onChange={e=>setNewAdmin({...newAdmin,name:e.target.value})}/>
        </div>
        <button onClick={createAdminAnnexe} disabled={loading}
          style={{...btnPrimary,opacity:loading?0.6:1}}>
          {loading?"Création...":"Créer administrateur"}
        </button>
      </div>

      {/* Liste des admins d'annexe */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:22}}>
        <h3 style={{fontSize:16,fontWeight:700,color:"#f0c040",marginBottom:16}}>
          Administrateurs d'annexe ({admins.length})
        </h3>
        {admins.length===0 ? (
          <p style={{color:"var(--text3)",fontSize:13}}>Aucun administrateur d'annexe créé.</p>
        ) : admins.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
            gap:10,padding:"12px 14px",marginBottom:8,background:"rgba(255,255,255,0.03)",
            borderRadius:8,border:"1px solid var(--border)"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>{u.name}</span>
                <span style={{padding:"3px 9px",borderRadius:10,fontSize:10,fontWeight:700,
                  background:"rgba(240,192,64,0.15)",color:"#f0c040"}}>ADMIN ANNEXE</span>
              </div>
              <div style={{fontSize:11,color:"var(--text3)"}}>
                Login : <strong>{u.id}</strong>
                {u.annexe_id && <> · Annexe : <strong style={{color:"#f0c040"}}>{getAnnexeName(u.annexe_id)}</strong></>}
              </div>
              {pwdTarget===u.id ? (
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input type="password" placeholder="Nouveau mot de passe" value={newPwd}
                    onChange={e=>setNewPwd(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleChangePwd()}
                    style={{...inp,width:200,marginBottom:0,padding:"6px 10px",fontSize:12}} autoFocus/>
                  <button onClick={handleChangePwd} disabled={loading} style={{
                    padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",
                    background:"rgba(52,211,153,0.15)",color:"#34d399",fontWeight:700}}>
                    Confirmer
                  </button>
                  <button onClick={()=>{setPwdTarget(null);setNewPwd("");}} style={{
                    padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",
                    background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700}}>
                    Annuler
                  </button>
                </div>
              ) : (
                <button onClick={()=>setPwdTarget(u.id)} style={{
                  marginTop:6,display:"inline-flex",alignItems:"center",gap:5,
                  padding:"3px 10px",borderRadius:6,border:"none",cursor:"pointer",
                  background:"rgba(240,192,64,0.1)",color:"#f0c040",fontSize:11,fontWeight:600}}>
                  <KeyIcon/> Modifier le mot de passe
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}
          onClick={()=>setModal(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:16,padding:24,width:"90%",maxWidth:400}}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,color:"#f0c040",marginBottom:20}}>
              {editing?"Modifier l'annexe":"Nouvelle annexe"}
            </h3>
            <input style={inp} placeholder="Nom de l'annexe *" value={form.nom}
              onChange={e=>setForm({...form,nom:e.target.value})} autoFocus/>
            <input style={inp} placeholder="Adresse" value={form.adresse}
              onChange={e=>setForm({...form,adresse:e.target.value})}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button onClick={()=>setModal(false)} style={{
                ...btnPrimary,background:"transparent",
                color:"var(--text2)",border:"1px solid var(--border)"}}>
                Annuler
              </button>
              <button onClick={save} disabled={loading||!form.nom} style={{...btnPrimary,opacity:loading?0.6:1}}>
                {loading?"...":(editing?"Modifier":"Créer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
