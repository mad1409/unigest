
import { useState, useMemo } from "react";
import { api } from "../../api";
import SearchSelect from "../shared/SearchSelect";
import ChangerMotDePasse from "../shared/ChangerMotDePasse";
import { inputStyle, btnPrimary, btnSecondary } from "./GestionFilieres";

const ROLES_CONFIG = {
  prof:        { label:"Enseignant",   color:"#38bdf8", bg:"rgba(56,189,248,0.1)"  },
  secretaire:  { label:"Secretaire",   color:"#34d399", bg:"rgba(52,211,153,0.1)"  },
  surveillant: { label:"Surveillant",  color:"#fb923c", bg:"rgba(251,146,60,0.1)"  },
  admin:       { label:"Administrateur",color:"#f0c040",bg:"rgba(240,192,64,0.1)"  },
};

const PER_PAGE = 10;

export default function AdminProfil({ user, data, setData }) {
  const [tab, setTab] = useState("parametres");

  const tabs = [
    { id:"parametres", label:"Parametres" },
    { id:"comptes",    label:"Creer un compte" },
    { id:"liste",      label:"Comptes staff" },
    { id:"mdp",        label:"Mon mot de passe" },
  ];

  return (
    <div>
      <h2 style={{fontSize:24,fontWeight:700,color:"#f0c040",marginBottom:20}}>Mon profil & Parametres</h2>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",
            background:tab===t.id?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
            border:tab===t.id?"1.5px solid rgba(240,192,64,0.6)":"1px solid var(--border)",
            color:tab===t.id?"#f0c040":"var(--text2)",
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="parametres" && <OngletParametres data={data} setData={setData}/>}
      {tab==="comptes"    && <OngletCreerCompte data={data} setData={setData}/>}
      {tab==="liste"      && <OngletListeComptes data={data} setData={setData}/>}
      {tab==="mdp"        && (
        <div style={{maxWidth:500}}>
          <ChangerMotDePasse user={user} data={data} setData={setData} color="#f0c040"/>
        </div>
      )}
    </div>
  );
}

// ── Onglet Paramètres ─────────────────────────────────
function OngletParametres({ data, setData }) {
  const p = data.parametres || {};
  const [form, setForm] = useState({
    nomEtablissement: p.nomEtablissement || "",
    anneeActive:      p.anneeActive      || "",
    semestreActif:    p.semestreActif    || 1,
    anneesDisponibles: (p.anneesDisponibles||[]).join(","),
    logo:            p.logo             || "",
    semestresCycles: p.semestresCycles  || {"Licence 1":1,"Licence 2":3,"Licence 3":5,"Master 1":7,"Master 2":9},

  });
  const [msg, setMsg] = useState(null);

  async function save() {
    try {
      await api.updateParametres({
        nomEtablissement: form.nomEtablissement,
        anneeActive:      form.anneeActive,
        semestreActif:    parseInt(form.semestreActif),
        anneesDisponibles: form.anneesDisponibles,
        logo:            form.logo,
        semestresCycles: form.semestresCycles,

      });
      await setData();
      setMsg({type:"success", text:"Parametres mis a jour."});
    } catch(e) { setMsg({type:"error", text:e.message}); }
  }

  const card = { background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"24px", marginBottom:20 };
  const lbl  = t => <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)",marginBottom:6}}>{t}</div>;

  return (
    <div style={{maxWidth:600}}>
      {msg && (
        <div style={{
          background:msg.type==="success"?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.1)",
          border:"1px solid "+(msg.type==="success"?"rgba(52,211,153,0.3)":"rgba(239,68,68,0.3)"),
          borderRadius:10,padding:"12px 16px",marginBottom:16,
          color:msg.type==="success"?"#34d399":"#ef4444",fontSize:13,
        }}>{msg.text}</div>
      )}
      <div style={card}>
        <h3 style={{fontSize:16,fontWeight:700,color:"#f0c040",marginBottom:18}}>Etablissement</h3>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            {lbl("Nom de l'etablissement")}
            <input style={inputStyle} value={form.nomEtablissement}
              onChange={e=>setForm({...form,nomEtablissement:e.target.value})}
              placeholder="Universite de ..."/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              {lbl("Annee active")}
              <input style={inputStyle} value={form.anneeActive}
                onChange={e=>setForm({...form,anneeActive:e.target.value})}
                placeholder="2025/2026"/>
            </div>
            <div>
              {lbl("Semestre actif par cycle")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  ["Licence 1","Licence 1","S1","S2"],
                  ["Licence 2","Licence 2","S3","S4"],
                  ["Licence 3","Licence 3","S5","S6"],
                  ["Master 1", "Master 1", "S7","S8"],
                  ["Master 2", "Master 2", "S9","S10"],
                ].map(([cycle,label,s1,s2])=>{
                  const current = (form.semestresCycles||{})[cycle] || parseInt(s1.replace("S",""));
                  const v1 = parseInt(s1.replace("S",""));
                  const v2 = parseInt(s2.replace("S",""));
                  return (
                    <div key={cycle} style={{background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--text2)",marginBottom:8}}>{label}</div>
                      <div style={{display:"flex",gap:6}}>
                        {[[v1,s1],[v2,s2]].map(([v,sl])=>(
                          <button key={v} onClick={()=>setForm({...form,semestresCycles:{...form.semestresCycles,[cycle]:v}})} style={{
                            flex:1,padding:"7px 4px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,
                            background:current===v?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.03)",
                            border:current===v?"1.5px solid rgba(240,192,64,0.6)":"1px solid var(--border)",
                            color:current===v?"#f0c040":"var(--text3)",
                          }}>{sl}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>
                Choisissez le semestre en cours pour chaque cycle.
              </div>
            </div>
          </div>
          <div>
            {lbl("Annees disponibles (separees par virgule)")}
            <input style={inputStyle} value={form.anneesDisponibles}
              onChange={e=>setForm({...form,anneesDisponibles:e.target.value})}
              placeholder="2024/2025,2025/2026,2026/2027"/>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
              Ces annees apparaissent dans les formulaires d'inscription.
            </div>
          </div>
        </div>
        {/* Upload logo */}
        <div style={{marginTop:16}}>
          {lbl("Logo de l'etablissement")}
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            {form.logo && (
              <img src={form.logo} alt="Logo" style={{height:60,maxWidth:180,objectFit:"contain",borderRadius:8,background:"rgba(255,255,255,0.05)",padding:4}}/>
            )}
            <label style={{
              background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",
              borderRadius:8,padding:"8px 16px",color:"#f0c040",fontWeight:700,
              fontSize:13,cursor:"pointer",
            }}>
              {form.logo ? "Changer le logo" : "Choisir un logo"}
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif" style={{display:"none"}}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.size > 5000000) { alert("Logo trop grand — max 5MB"); return; }
                  const reader = new FileReader();
                  reader.onload = ev => setForm({...form, logo:ev.target.result});
                  reader.readAsDataURL(file);
                }}/>
            </label>
            {form.logo && (
              <button onClick={()=>setForm({...form,logo:""})} style={{
                background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:8,padding:"8px 12px",color:"#ef4444",fontWeight:700,fontSize:13,cursor:"pointer",
              }}>Supprimer</button>
            )}
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
            PNG, JPG, WEBP, SVG — max 5MB. Apparait dans la sidebar et les pages de connexion.
          </div>
        </div>

        <button onClick={save} style={{...btnPrimary("#f0c040"), marginTop:18, width:"100%"}}>
          Enregistrer les parametres
        </button>
      </div>

      {/* Infos admin */}
      <div style={card}>
        <h3 style={{fontSize:16,fontWeight:700,color:"#f0c040",marginBottom:14}}>Informations systeme</h3>
        {[
          ["Etudiants",    (data.etudiants||[]).length],
          ["Enseignants",  (data.professeurs||[]).length],
          ["Filieres",     (data.filieres||[]).length],
          ["UEs",          (data.ues||[]).length],
          ["Groupes",      (data.groupes||[]).length],
          ["EDT",          (data.emploisDuTemps||[]).length],
        ].map(([l,v]) => (
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
            <span style={{color:"#f0c040",fontWeight:700,fontSize:13}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Onglet Créer Compte ───────────────────────────────
function OngletCreerCompte({ data, setData }) {
  const [form,    setForm]    = useState({ name:"", role:"prof", password:"" });
  const [profId,  setProfId]  = useState("");
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);

  // Preview ID généré
  function previewId() {
    const prefixes = { admin:"ADM", prof:"ENS", secretaire:"SEC", surveillant:"SUR" };
    const prefix   = prefixes[form.role] || "USR";
    const parts    = (form.name||"").trim().split(" ");
    const init     = parts.map(p=>(p[0]||"").toUpperCase()).join("").slice(0,3) || "XXX";
    return prefix + init + "01";
  }

  async function creer() {
    if (!form.name.trim()) { setMsg({type:"error",text:"Le nom est obligatoire."}); return; }
    if (!form.password)    { setMsg({type:"error",text:"Le mot de passe est obligatoire."}); return; }
    setLoading(true);
    try {
      const payload = {
        role:    form.role,
        name:    form.name.trim(),
        password:form.password,
        profId:  form.role==="prof" ? (parseInt(profId)||null) : null,
      };
      const result = await api.createUser(payload);
      setMsg({
        type:"success",
        text:"Compte cree avec succes",
        id: result.generatedId || result.id,
        name: form.name,
        role: form.role,
        password: form.password,
      });
      setForm({name:"",role:"prof",password:""});
      setProfId("");
      await setData();
    } catch(e) { setMsg({type:"error",text:e.message}); }
    finally { setLoading(false); }
  }

  const cfg = ROLES_CONFIG[form.role] || ROLES_CONFIG.prof;
  const lbl = t => <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)",marginBottom:6}}>{t}</div>;

  return (
    <div style={{maxWidth:560}}>
      <h3 style={{fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:6}}>Creer un compte</h3>
      <p style={{color:"var(--text2)",fontSize:13,marginBottom:20}}>L'identifiant est genere automatiquement.</p>

      {msg?.type==="success" && (
        <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:14,padding:"20px 24px",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:"#34d399",marginBottom:14}}>Compte cree avec succes</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Nom",msg.name],["Role",ROLES_CONFIG[msg.role]?.label],["Identifiant",msg.id],["Mot de passe",msg.password]].map(([l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:3}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:l==="Identifiant"?"#34d399":"var(--text)"}}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setMsg(null)} style={{marginTop:14,background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.4)",borderRadius:8,padding:"8px 18px",color:"#34d399",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            Nouveau compte
          </button>
        </div>
      )}

      {msg?.type==="error" && (
        <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#ef4444",fontSize:13}}>
          {msg.text}
        </div>
      )}

      {(!msg || msg.type==="error") && (
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"24px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Role */}
            <div>
              {lbl("Role *")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {Object.entries(ROLES_CONFIG).map(([r,c])=>(
                  <button key={r} onClick={()=>setForm({...form,role:r})} style={{
                    padding:"10px 12px",borderRadius:9,cursor:"pointer",textAlign:"left",
                    background:form.role===r?c.bg:"rgba(255,255,255,0.03)",
                    border:form.role===r?"1.5px solid "+c.color:"1px solid var(--border)",
                    color:form.role===r?c.color:"var(--text2)",
                    fontWeight:form.role===r?700:400,fontSize:13,
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div>
              {lbl("Nom complet *")}
              <input style={inputStyle} value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})}
                placeholder="Prenom Nom"/>
              {form.name.trim() && (
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Identifiant prévu : <strong style={{color:cfg.color}}>{previewId()}</strong>
                </div>
              )}
            </div>

            {/* Lier à un prof existant si role=prof */}
            {form.role==="prof" && (
              <div>
                {lbl("Lier a un enseignant existant (optionnel)")}
                <SearchSelect value={profId}
                  onChange={v=>setProfId(v)}
                  options={(data.professeurs||[]).map(p=>({value:String(p.id),label:p.name,sub:p.tel||""}))}
                  allLabel="Nouveau enseignant"
                  placeholder="Rechercher enseignant..."
                  color="#38bdf8"/>
              </div>
            )}

            {/* Mot de passe */}
            <div>
              {lbl("Mot de passe *")}
              <input type="password" style={inputStyle} value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})}
                placeholder="Mot de passe initial"/>
            </div>

            <button onClick={creer} disabled={loading||!form.name.trim()||!form.password} style={{
              ...btnPrimary("#f0c040"),
              opacity:(!form.name.trim()||!form.password)?0.5:1,
              cursor:(!form.name.trim()||!form.password)?"not-allowed":"pointer",
            }}>
              {loading?"Creation en cours...":"Creer le compte"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Onglet Liste Comptes ──────────────────────────────
function OngletListeComptes({ data, setData }) {
  const [filterRole, setFilterRole] = useState("all");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [resetId,    setResetId]    = useState(null);
  const [newPwd,     setNewPwd]     = useState("");
  const [msg,        setMsg]        = useState(null);

  const users = (data.users||[]).filter(u => u.role !== "etudiant");

  const filtered = useMemo(() => users.filter(u => {
    const roleOk   = filterRole==="all" || u.role===filterRole;
    const q = search.toLowerCase();
    const searchOk = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    return roleOk && searchOk;
  }), [users, filterRole, search]);

  const tot    = Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  const pg2    = Math.min(page,tot);
  const paged  = filtered.slice((pg2-1)*PER_PAGE, pg2*PER_PAGE);

  async function deleteUser(id) {
    if (id==="admin") { alert("Impossible de supprimer le compte admin."); return; }
    if (!confirm("Supprimer ce compte ?")) return;
    try { await api.deleteUser(id); await setData(); } catch(e) { alert(e.message); }
  }

  async function resetPassword(id) {
    if (!newPwd) { alert("Entrez un nouveau mot de passe"); return; }
    try {
      await api.resetPassword(id, newPwd);
      setMsg("Mot de passe reinitialise pour "+id);
      setResetId(null);
      setNewPwd("");
    } catch(e) { alert(e.message); }
  }

  const inp = {background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:12,outline:"none"};

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h3 style={{fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:4}}>Comptes staff</h3>
        <p style={{color:"var(--text2)",fontSize:13}}>{filtered.length} compte(s)</p>
      </div>

      {msg && <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#34d399",fontSize:13}}>{msg}</div>}

      {/* Filtres */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 18px"}}>
        <div style={{position:"relative",flex:2,minWidth:160}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
            style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Nom ou identifiant..."
            style={{...inp,paddingLeft:30,width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","Tous"],...Object.entries(ROLES_CONFIG).map(([r,c])=>[r,c.label])].map(([r,l])=>(
            <button key={r} onClick={()=>{setFilterRole(r);setPage(1);}} style={{
              padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
              background:filterRole===r?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
              border:filterRole===r?"1px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
              color:filterRole===r?"#f0c040":"var(--text3)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.04)"}}>
              {["Identifiant","Nom","Role","Actions"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length===0?(
              <tr><td colSpan={4} style={{padding:"30px",textAlign:"center",color:"var(--text3)"}}>Aucun compte</td></tr>
            ):paged.map(u=>{
              const cfg = ROLES_CONFIG[u.role] || {color:"#94a3b8",bg:"rgba(148,163,184,0.1)",label:u.role};
              return (
                <tr key={u.id} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{fontFamily:"monospace",fontSize:13,color:cfg.color,fontWeight:700}}>{u.id}</span>
                  </td>
                  <td style={{padding:"10px 14px",fontWeight:600,color:"var(--text)",fontSize:13}}>{u.name}</td>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{background:cfg.bg,border:"1px solid "+cfg.color+"40",borderRadius:6,padding:"2px 9px",fontSize:11,color:cfg.color,fontWeight:700}}>
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    {resetId===u.id?(
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          style={{...inp,width:160}}/>
                        <button onClick={()=>resetPassword(u.id)} style={{
                          background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.4)",
                          borderRadius:7,padding:"5px 10px",fontSize:11,color:"#34d399",cursor:"pointer",fontWeight:700,
                        }}>OK</button>
                        <button onClick={()=>{setResetId(null);setNewPwd("");}} style={{
                          background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
                          borderRadius:7,padding:"5px 8px",fontSize:11,color:"var(--text3)",cursor:"pointer",
                        }}>X</button>
                      </div>
                    ):(
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setResetId(u.id);setMsg(null);}} style={{
                          background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",
                          borderRadius:7,padding:"5px 10px",fontSize:11,color:"#f0c040",cursor:"pointer",
                        }}>Reset MDP</button>
                        {u.id!=="admin"&&(
                          <button onClick={()=>deleteUser(u.id)} style={{
                            background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                            borderRadius:7,padding:"5px 8px",fontSize:11,color:"#ef4444",cursor:"pointer",
                          }}>X</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {tot>1&&(
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14,flexWrap:"wrap"}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pg2===1}
            style={{...inp,padding:"6px 14px",cursor:pg2===1?"not-allowed":"pointer",opacity:pg2===1?0.4:1}}>← Prec.</button>
          {Array.from({length:tot},(_,i)=>i+1).filter(p=>p===1||p===tot||Math.abs(p-pg2)<=2)
            .reduce((acc,p,i,arr)=>{if(i>0&&p-arr[i-1]>1)acc.push("...");acc.push(p);return acc;},[])
            .map((p,i)=>p==="..."?<span key={"e"+i} style={{padding:"6px 4px",color:"var(--text3)"}}>…</span>
              :<button key={p} onClick={()=>setPage(p)} style={{...inp,padding:"6px 12px",cursor:"pointer",
                background:p===pg2?"rgba(240,192,64,0.2)":inp.background,
                border:p===pg2?"1px solid rgba(240,192,64,0.5)":inp.border,
                color:p===pg2?"#f0c040":"var(--text2)",fontWeight:p===pg2?700:400}}>{p}</button>
            )}
          <button onClick={()=>setPage(p=>Math.min(tot,p+1))} disabled={pg2===tot}
            style={{...inp,padding:"6px 14px",cursor:pg2===tot?"not-allowed":"pointer",opacity:pg2===tot?0.4:1}}>Suiv. →</button>
        </div>
      )}
    </div>
  );
}
