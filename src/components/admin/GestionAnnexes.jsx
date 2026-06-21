import { useState, useEffect } from "react";
import { api } from "../../api";

const inp = {
  width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.05)",
  border:"1px solid var(--border)", borderRadius:9, padding:"10px 14px",
  color:"var(--text)", fontSize:13, marginBottom:10,
};
const btnPrimary = {
  background:"#f0c040", border:"none", borderRadius:9,
  padding:"10px 22px", color:"#1a1200", fontSize:13, fontWeight:700, cursor:"pointer",
};
const actionBtn = (color) => ({
  padding:"5px 12px", borderRadius:6, border:"none", cursor:"pointer",
  fontSize:12, fontWeight:600, background:color+"20", color,
});

export default function GestionAnnexes({ data, setData }) {
  const [annexes,     setAnnexes]     = useState([]);
  const [etudiants,   setEtudiants]   = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState({ nom:"", adresse:"" });
  const [loading,     setLoading]     = useState(false);
  const [message,     setMessage]     = useState({ text:"", type:"" });
  const [activeTab,   setActiveTab]   = useState("annexes");
  const [survForm,    setSurvForm]    = useState({ id:"", password:"", name:"", annexe_id:"" });
  const [transfert,   setTransfert]   = useState({ type:"etudiant", id:"", annexe_id:"" });
  const [pwdTarget,   setPwdTarget]   = useState(null);
  const [newPwd,      setNewPwd]      = useState("");

  useEffect(() => { charger(); }, []);

  async function charger() {
    try {
      const [ann, etu, profs, usrs] = await Promise.all([
        api.getAnnexes().catch(()=>[]),
        api.getEtudiants().catch(()=>[]),
        api.getProfesseurs().catch(()=>[]),
        api.getUsers().catch(()=>[]),
      ]);
      setAnnexes(ann||[]); setEtudiants(etu||[]);
      setProfesseurs(profs||[]); setUsers(usrs||[]);
    } catch(e) { showMsg("Erreur : " + e.message); }
  }

  function showMsg(text, type="error") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text:"", type:"" }), 5000);
  }

  function openNew()   { setForm({ nom:"", adresse:"" }); setEditing(null); setModal(true); }
  function openEdit(a) { setForm({ nom:a.nom, adresse:a.adresse||"" }); setEditing(a.id); setModal(true); }

  async function saveAnnexe() {
    if (!form.nom) return;
    setLoading(true);
    try {
      editing ? await api.updateAnnexe(editing, form) : await api.createAnnexe(form);
      await charger(); setModal(false); if (setData) setData();
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  async function delAnnexe(id) {
    if (!confirm("Supprimer cette annexe ?")) return;
    try { await api.deleteAnnexe(id); await charger(); if (setData) setData(); }
    catch(e) { showMsg(e.message); }
  }

  async function createSurveillant() {
    if (!survForm.id || !survForm.password || !survForm.name || !survForm.annexe_id)
      return showMsg("Tous les champs sont requis");
    setLoading(true);
    try {
      await api.createUser({ id:survForm.id, password:survForm.password,
        name:survForm.name, role:"surveillant", annexe_id:parseInt(survForm.annexe_id) });
      showMsg("Surveillant créé avec succès", "success");
      setSurvForm({ id:"", password:"", name:"", annexe_id:"" });
      await charger();
    } catch(e) { showMsg("Erreur : " + e.message); }
    setLoading(false);
  }

  async function handleChangePwd() {
    if (!newPwd || !pwdTarget) return;
    setLoading(true);
    try {
      await api.resetPassword(pwdTarget, newPwd);
      showMsg("Mot de passe modifié", "success");
      setPwdTarget(null); setNewPwd("");
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  async function doTransfert() {
    if (!transfert.id || !transfert.annexe_id)
      return showMsg("Sélectionner un élément et une annexe cible");
    setLoading(true);
    try {
      await api.transfert({ type:transfert.type, id:parseInt(transfert.id), annexe_id:parseInt(transfert.annexe_id) });
      showMsg("Transfert effectué avec succès", "success");
      setTransfert({ type:"etudiant", id:"", annexe_id:"" });
      await charger(); if (setData) setData();
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  const getAnnexeName = (id) => annexes.find(a => a.id === parseInt(id))?.nom || "—";
  const surveillants  = users.filter(u => u.role === "surveillant");

  const tabStyle = (id) => ({
    padding:"8px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
    borderRadius:"8px 8px 0 0", marginRight:4,
    background: activeTab===id ? "var(--bg2)" : "transparent",
    color: activeTab===id ? "#f0c040" : "var(--text3)",
    borderBottom: activeTab===id ? "2px solid #f0c040" : "2px solid transparent",
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:"#f0c040" }}>
            Gestion des Annexes
          </h2>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:4 }}>
            {annexes.length} annexe(s) — Technolab Bamako
          </p>
        </div>
        {activeTab==="annexes" && <button onClick={openNew} style={btnPrimary}>+ Nouvelle annexe</button>}
      </div>

      {message.text && (
        <div style={{
          padding:"10px 14px", borderRadius:8, marginBottom:16, fontSize:13,
          background: message.type==="success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
          color: message.type==="success" ? "#34d399" : "#ef4444",
          border:`1px solid ${message.type==="success" ? "#34d399" : "#ef4444"}`,
        }}>{message.text}</div>
      )}

      <div style={{ borderBottom:"1px solid var(--border)", marginBottom:24 }}>
        {[{id:"annexes",label:"📍 Annexes"},{id:"surveillants",label:"👤 Surveillants"},{id:"transfer",label:"🔄 Transferts"}]
          .map(t => <button key={t.id} onClick={()=>setActiveTab(t.id)} style={tabStyle(t.id)}>{t.label}</button>)}
      </div>

      {activeTab==="annexes" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {annexes.map(a => (
            <div key={a.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:18 }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#f0c040" }}>{a.nom}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>ID : {a.id}</div>
                {a.adresse && <div style={{ fontSize:12, color:"var(--text2)", marginTop:4 }}>{a.adresse}</div>}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                {[
                  {l:"Étudiants",   v:etudiants.filter(e=>e.annexe_id===a.id).length,    c:"#34d399"},
                  {l:"Profs",       v:professeurs.filter(p=>p.annexe_id===a.id).length,  c:"#818cf8"},
                  {l:"Surveillants",v:surveillants.filter(u=>u.annexe_id===a.id).length, c:"#f0c040"},
                ].map(s => (
                  <div key={s.l} style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:7, padding:"6px 4px", textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:700, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:9, color:"var(--text3)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>openEdit(a)}    style={actionBtn("#38bdf8")}>Modifier</button>
                <button onClick={()=>delAnnexe(a.id)} style={actionBtn("#ef4444")}>Supprimer</button>
              </div>
            </div>
          ))}
          {!annexes.length && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:40, color:"var(--text3)", fontSize:13 }}>
              Aucune annexe — cliquez sur "+ Nouvelle annexe"
            </div>
          )}
        </div>
      )}

      {activeTab==="surveillants" && (
        <div>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:22, marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"#f0c040", marginBottom:16 }}>Créer un surveillant</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginBottom:14 }}>
              <select style={inp} value={survForm.annexe_id} onChange={e=>setSurvForm({...survForm,annexe_id:e.target.value})}>
                <option value="">-- Sélectionner une annexe --</option>
                {annexes.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              <input style={inp} placeholder="Identifiant (ex: SURV01)" value={survForm.id}
                onChange={e=>setSurvForm({...survForm,id:e.target.value})}/>
              <input style={inp} type="password" placeholder="Mot de passe" value={survForm.password}
                onChange={e=>setSurvForm({...survForm,password:e.target.value})}/>
              <input style={inp} placeholder="Nom complet" value={survForm.name}
                onChange={e=>setSurvForm({...survForm,name:e.target.value})}/>
            </div>
            <button onClick={createSurveillant} disabled={loading} style={{...btnPrimary,opacity:loading?0.6:1}}>
              {loading?"Création...":"Créer le surveillant"}
            </button>
          </div>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"#f0c040", marginBottom:16 }}>Surveillants ({surveillants.length})</h3>
            {!surveillants.length ? (
              <p style={{ color:"var(--text3)", fontSize:13 }}>Aucun surveillant créé.</p>
            ) : surveillants.map(u => (
              <div key={u.id} style={{
                display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                padding:"12px 14px", marginBottom:8,
                background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid var(--border)",
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontWeight:600, color:"var(--text)", fontSize:14 }}>{u.name}</span>
                    <span style={{ padding:"3px 9px", borderRadius:10, fontSize:10, fontWeight:700,
                      background:"rgba(240,192,64,0.15)", color:"#f0c040" }}>SURVEILLANT</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>
                    Login : <strong>{u.id}</strong>
                    {u.annexe_id && <> · Annexe : <strong style={{ color:"#f0c040" }}>{getAnnexeName(u.annexe_id)}</strong></>}
                  </div>
                  {pwdTarget===u.id ? (
                    <div style={{ display:"flex", gap:6, marginTop:8 }}>
                      <input type="password" placeholder="Nouveau mot de passe" value={newPwd}
                        onChange={e=>setNewPwd(e.target.value)}
                        style={{...inp,width:200,marginBottom:0,padding:"6px 10px",fontSize:12}} autoFocus/>
                      <button onClick={handleChangePwd} disabled={loading}
                        style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",background:"rgba(52,211,153,0.15)",color:"#34d399",fontWeight:700}}>
                        Confirmer
                      </button>
                      <button onClick={()=>{setPwdTarget(null);setNewPwd("");}}
                        style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700}}>
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button onClick={()=>setPwdTarget(u.id)} style={{
                      marginTop:6,padding:"3px 10px",borderRadius:6,border:"none",cursor:"pointer",
                      background:"rgba(240,192,64,0.1)",color:"#f0c040",fontSize:11,fontWeight:600}}>
                      🔑 Modifier mot de passe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==="transfer" && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:22, maxWidth:520 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"#f0c040", marginBottom:6 }}>Transfert entre annexes</h3>
          <p style={{ fontSize:12, color:"var(--text3)", marginBottom:20 }}>Les identifiants et mots de passe sont conservés.</p>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {["etudiant","professeur"].map(t => (
              <button key={t} onClick={()=>setTransfert({...transfert,type:t,id:""})} style={{
                flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
                background:transfert.type===t?"#f0c040":"rgba(255,255,255,0.05)",
                color:transfert.type===t?"#1a1200":"var(--text2)",
              }}>
                {t==="etudiant"?"👨‍🎓 Étudiant":"👨‍🏫 Professeur"}
              </button>
            ))}
          </div>
          <select style={inp} value={transfert.id} onChange={e=>setTransfert({...transfert,id:e.target.value})}>
            <option value="">-- Sélectionner {transfert.type==="etudiant"?"un étudiant":"un professeur"} --</option>
            {(transfert.type==="etudiant"?etudiants:professeurs).map(p=>(
              <option key={p.id} value={p.id}>
                {p.name}{p.annexe_id?` (${getAnnexeName(p.annexe_id)})`:" (sans annexe)"}
              </option>
            ))}
          </select>
          <select style={inp} value={transfert.annexe_id} onChange={e=>setTransfert({...transfert,annexe_id:e.target.value})}>
            <option value="">-- Annexe cible --</option>
            {annexes.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>
          <button onClick={doTransfert} disabled={loading||!transfert.id||!transfert.annexe_id}
            style={{...btnPrimary,width:"100%",opacity:(loading||!transfert.id||!transfert.annexe_id)?0.5:1}}>
            {loading?"Transfert en cours...":"🔄 Transférer"}
          </button>
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}
          onClick={()=>setModal(false)}>
          <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:16,padding:24,width:"90%",maxWidth:400 }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:17,fontWeight:700,color:"#f0c040",marginBottom:20 }}>
              {editing?"Modifier l'annexe":"Nouvelle annexe"}
            </h3>
            <input style={inp} placeholder="Nom de l'annexe *" value={form.nom}
              onChange={e=>setForm({...form,nom:e.target.value})} autoFocus/>
            <input style={inp} placeholder="Adresse" value={form.adresse}
              onChange={e=>setForm({...form,adresse:e.target.value})}/>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:6 }}>
              <button onClick={()=>setModal(false)} style={{...btnPrimary,background:"transparent",
                color:"var(--text2)",border:"1px solid var(--border)"}}>Annuler</button>
              <button onClick={saveAnnexe} disabled={loading||!form.nom}
                style={{...btnPrimary,opacity:loading?0.6:1}}>
                {loading?"...":(editing?"Modifier":"Créer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
