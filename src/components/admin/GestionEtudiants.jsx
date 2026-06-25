import { useState, useMemo, useEffect } from "react";
import { api } from "../../api";
import SearchSelect from "../shared/SearchSelect";
import { Modal, Field, inputStyle, btnPrimary, btnSecondary, modalTitle, modalFooter } from "./GestionFilieres";

const PER_PAGE = 15;

function genMatricule(annee, filiereId, etudiants, filieres) {
  const filiere    = filieres.find(f => f.id === parseInt(filiereId));
  const anneeShort = (annee||"").split("/")[0].slice(-2);
  const count      = etudiants.filter(e =>
    e.annee_academique === annee && (e.filiere_id||e.filiereId) === parseInt(filiereId)
  ).length + 1;
  return (filiere?.code||"ETU") + "-" + anneeShort + "-" + String(count).padStart(3,"0");
}

export default function GestionEtudiants({ data, setData }) {
  const annees      = data.parametres?.anneesDisponibles || ["2025/2026"];
  const anneeActive = data.parametres?.anneeActive || annees[0];
  const initForm    = {
    id:null, name:"", email:"", tel:"",
    filiereId: data.filieres[0]?.id || "",
    anneeAcademique: anneeActive,
    session:"jour", matricule:"", siteId:"",
  };

  const [modal,         setModal]         = useState(false);
  const [form,          setForm]          = useState(initForm);
  const [editing,       setEditing]       = useState(null);
  const [filterAnnee,   setFilterAnnee]   = useState(anneeActive);
  const [filterFiliere, setFilterFiliere] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [sites,         setSites]         = useState([]);

  useEffect(() => {
    api.getAnnexes().then(r => setSites(Array.isArray(r) ? r : [])).catch(()=>{});
  }, []);
  const [filterSite,    setFilterSite]    = useState("all");
  const [search,        setSearch]        = useState("");
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [showArchives,  setShowArchives]  = useState(false);
  const [archiveMsg,    setArchiveMsg]    = useState(null);

  const etudiants = data.etudiants || [];

  const filtered = useMemo(() => etudiants.filter(e => {
    const anneeOk   = filterAnnee   === "all" || (e.annee_academique||e.anneeAcademique) === filterAnnee;
    const filiereOk = filterFiliere === "all" || (e.filiere_id||e.filiereId) === parseInt(filterFiliere);
    const sessionOk = filterSession === "all" || e.session === filterSession;
    const siteOk    = filterSite === "all" || String(e.site_id) === String(filterSite);
    const q         = search.toLowerCase();
    const searchOk  = !q || e.name.toLowerCase().includes(q) ||
      (e.matricule||"").toLowerCase().includes(q) ||
      (e.email||"").toLowerCase().includes(q);
    return anneeOk && filiereOk && sessionOk && siteOk && searchOk;
  }), [etudiants, filterAnnee, filterFiliere, filterSession, filterSite, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageSafe   = Math.min(page, totalPages);
  const paged      = filtered.slice((pageSafe-1)*PER_PAGE, pageSafe*PER_PAGE);

  function openNew() { setForm(initForm); setEditing(null); setModal(true); }

  function openEdit(e) {
    setForm({
      id: e.id, name: e.name, email: e.email||"", tel: e.tel||"",
      filiereId: e.filiere_id||e.filiereId,
      siteId: e.site_id || "",
      anneeAcademique: e.annee_academique||e.anneeAcademique||anneeActive,
      session: e.session||"jour", matricule: e.matricule||"",
    });
    setEditing(e.id);
    setModal(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const matricule = form.matricule || genMatricule(form.anneeAcademique, form.filiereId, etudiants, data.filieres);
      const payload   = {
        name: form.name.trim(), email: form.email.trim(), tel: form.tel.trim(),
        filiereId: parseInt(form.filiereId), anneeAcademique: form.anneeAcademique,
        session: form.session, matricule,
      };
      if (editing) { await api.updateEtudiant(editing, payload); }
      else         { await api.createEtudiant(payload); }
      await setData();
      setModal(false);
    } catch(e) { alert(e.message); }
    finally { setLoading(false); }
  }

  async function archiver(id) {
    if (!confirm("Archiver cet etudiant ?")) return;
    try { await api.archiveEtudiant(id); await setData(); } catch(e) { alert(e.message); }
  }

  async function restaurer(id) {
    if (!confirm("Restaurer cet étudiant ? Il redeviendra actif.")) return;
    try { await api.restoreEtudiant(id); await setData(); }
    catch(e) { alert(e.message); }
  }

  async function archiverPromotion() {
    const annee = prompt("Quelle annee academique archiver ? (" + annees.join(", ") + ")");
    if (!annee) return;
    if (!confirm("Archiver TOUS les etudiants de l'annee " + annee + " ?")) return;
    try {
      const r = await api.archivePromotion(annee);
      setArchiveMsg(r.count + " etudiant(s) archives avec succes");
      await setData();
      setTimeout(() => setArchiveMsg(null), 5000);
    } catch(e) { alert(e.message); }
  }

  async function del(id) {
    if (!confirm("Supprimer cet etudiant ?")) return;
    try { await api.deleteEtudiant(id); await setData(); } catch(e) { alert(e.message); }
  }

  const sessionBadge = (s) => s === "soir"
    ? { bg:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", color:"#818cf8", label:"Soir" }
    : { bg:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", label:"Jour" };

  const filterBtn = (active) => ({
    padding:"7px 16px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
    background: active ? "rgba(240,192,64,0.15)" : "rgba(255,255,255,0.04)",
    border:     active ? "1.5px solid rgba(240,192,64,0.5)" : "1px solid var(--border)",
    color:      active ? "#f0c040" : "var(--text2)",
  });

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
              {showArchives ? "Archives" : "Etudiants"}
            </h2>
            <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
              {filtered.length} etudiant(s) sur {etudiants.length} total
            </p>
          </div>
          <button onClick={openNew} style={{
            background:"#f0c040",border:"none",borderRadius:10,
            padding:"11px 22px",color:"#1a1200",fontSize:14,fontWeight:700,
            cursor:"pointer",flexShrink:0,
          }}>+ Inscrire etudiant</button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>setShowArchives(!showArchives)} style={{
            padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
            background:showArchives?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.04)",
            border:showArchives?"1px solid rgba(251,146,60,0.4)":"1px solid var(--border)",
            color:showArchives?"#fb923c":"var(--text2)",
          }}>{showArchives ? "Voir actifs" : "Archives"}</button>
          <button onClick={archiverPromotion} style={{
            padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
            background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",
          }}>Archiver promotion</button>
        </div>
      </div>

      {/* Message archive */}
      {archiveMsg && (
        <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",
          borderRadius:10,padding:"12px 16px",marginBottom:12,color:"#34d399",fontSize:13}}>
          {archiveMsg}
        </div>
      )}
      {showArchives && (
        <div style={{background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",
          borderRadius:10,padding:"10px 16px",marginBottom:12,color:"#fb923c",fontSize:12,fontWeight:600}}>
          Mode Archives
        </div>
      )}

      {/* Filtres */}
      <div style={{
        background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
        borderRadius:12,padding:"14px 16px",marginBottom:16,
        display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",
      }}>
        {/* Recherche */}
        <div style={{position:"relative",flex:2,minWidth:180}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
            style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Nom, matricule, email..."
            style={{...inputStyle,paddingLeft:30,background:"rgba(255,255,255,0.03)"}}/>
        </div>

        {/* Année */}
        <select value={filterAnnee} onChange={e=>{setFilterAnnee(e.target.value);setPage(1);}}
          style={{...inputStyle,maxWidth:130}}>
          <option value="all">Toutes annees</option>
          {annees.map(a=><option key={a} value={a}>{a}</option>)}
        </select>

        {/* Filière */}
        <select value={filterFiliere} onChange={e=>{setFilterFiliere(e.target.value);setPage(1);}}
          style={{...inputStyle,maxWidth:160}}>
          <option value="all">Toutes filieres</option>
          {(data.filieres||[]).map(f=><option key={f.id} value={f.id}>{f.code}</option>)}
        </select>

        {/* Session */}
        <div style={{display:"flex",gap:6}}>
          {[["all","Tous"],["jour","Jour"],["soir","Soir"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setFilterSession(v);setPage(1);}}
              style={filterBtn(filterSession===v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",
        borderRadius:14,overflow:"hidden",
      }}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead>
              <tr style={{background:"rgba(52,211,153,0.06)"}}>
                {["Matricule","Nom","Filiere","Annee","Session","Identifiant","Actions"].map(h=>(
                  <th key={h} style={{
                    padding:"12px 14px",textAlign:"left",fontSize:11,
                    fontWeight:700,textTransform:"uppercase",letterSpacing:1,
                    color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"var(--text3)"}}>
                  {search ? "Aucun etudiant trouvé" : "Aucun etudiant"}
                </td></tr>
              ) : paged.map((e,i) => {
                const fil   = (data.filieres||[]).find(f=>f.id===(e.filiere_id||e.filiereId));
                const user  = (data.users||[]).find(u=>(u.etudiant_id||u.etudiantId)===e.id);
                const badge = sessionBadge(e.session);
                return (
                  <tr key={e.id} style={{
                    borderTop:"1px solid var(--border)",
                    background:i%2===0?"transparent":"rgba(255,255,255,0.015)",
                  }}>
                    <td style={{padding:"11px 14px",fontFamily:"monospace",fontSize:12,color:"#34d399",fontWeight:700}}>
                      {e.matricule||"—"}
                    </td>
                    <td style={{padding:"11px 14px",fontWeight:600,color:"var(--text)",fontSize:13}}>
                      {e.name}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      {fil ? (
                        <span style={{
                          background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",
                          borderRadius:5,padding:"2px 8px",fontSize:11,color:"#34d399",fontWeight:700,
                        }}>{fil.code}</span>
                      ) : <span style={{color:"var(--text3)",fontSize:12}}>—</span>}
                    </td>
                    <td style={{padding:"11px 14px",fontSize:12,color:"var(--text2)"}}>
                      {e.annee_academique||e.anneeAcademique||"—"}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{
                        background:badge.bg,border:badge.border,
                        borderRadius:5,padding:"2px 9px",fontSize:11,color:badge.color,fontWeight:700,
                      }}>{badge.label}</span>
                    </td>
                    <td style={{padding:"11px 14px",fontFamily:"monospace",fontSize:11,color:"var(--text3)"}}>
                      {user?.id||"—"}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>openEdit(e)} style={{
                          background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",
                          borderRadius:6,padding:"5px 10px",fontSize:11,color:"#38bdf8",cursor:"pointer",
                        }}>Modifier</button>
                        {showArchives ? (
                          <button onClick={()=>restaurer(e.id)} style={{
                            background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",
                            borderRadius:6,padding:"5px 10px",fontSize:11,color:"#34d399",cursor:"pointer",
                          }}>Restaurer</button>
                        ) : (<>
                          <button onClick={()=>archiver(e.id)} style={{
                            background:"rgba(251,146,60,0.1)",border:"1px solid rgba(251,146,60,0.3)",
                            borderRadius:6,padding:"5px 8px",fontSize:11,color:"#fb923c",cursor:"pointer",
                          }}>Archiver</button>
                          <button onClick={()=>del(e.id)} style={{
                            background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                            borderRadius:6,padding:"5px 8px",fontSize:11,color:"#ef4444",cursor:"pointer",
                          }}>Supprimer</button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display:"flex",justifyContent:"center",gap:6,
            padding:"12px",borderTop:"1px solid var(--border)",flexWrap:"wrap",
          }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pageSafe===1} style={{
              padding:"6px 12px",borderRadius:7,fontSize:12,cursor:"pointer",
              background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
              color:"var(--text2)",opacity:pageSafe===1?0.4:1,
            }}>←</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{
                padding:"6px 12px",borderRadius:7,fontSize:12,cursor:"pointer",
                background:pageSafe===p?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",
                border:pageSafe===p?"1px solid rgba(52,211,153,0.4)":"1px solid var(--border)",
                color:pageSafe===p?"#34d399":"var(--text2)",fontWeight:pageSafe===p?700:400,
              }}>{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={pageSafe===totalPages} style={{
              padding:"6px 12px",borderRadius:7,fontSize:12,cursor:"pointer",
              background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
              color:"var(--text2)",opacity:pageSafe===totalPages?0.4:1,
            }}>→</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(false)}>
          <h3 style={modalTitle("#f0c040")}>{editing ? "Modifier etudiant" : "Inscrire un etudiant"}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Nom complet *">
                <input style={inputStyle} value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})}
                  placeholder="Nom et Prenom"/>
              </Field>
              <Field label="Filiere *">
                <SearchSelect value={String(form.filiereId||"")}
                  onChange={v=>setForm({...form,filiereId:v})}
                  options={(data.filieres||[]).map(f=>({value:String(f.id),label:f.code+" — "+f.name}))}
                  placeholder="Choisir filiere..." color="#34d399"/>
              </Field>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Annee academique *">
                <select style={inputStyle} value={form.anneeAcademique}
                  onChange={e=>setForm({...form,anneeAcademique:e.target.value})}>
                  {annees.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Session">
                <select style={inputStyle} value={form.session}
                  onChange={e=>setForm({...form,session:e.target.value})}>
                  <option value="jour">Jour</option>
                  <option value="soir">Soir</option>
                </select>
              </Field>
              <Field label="Site">
                <select style={inputStyle} value={form.siteId}
                  onChange={e=>setForm({...form,siteId:e.target.value})}>
                  <option value="">-- Choisir un site --</option>
                  {sites.map(s=>(
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Email">
                <input type="email" style={inputStyle} value={form.email}
                  onChange={e=>setForm({...form,email:e.target.value})}
                  placeholder="etudiant@email.com"/>
              </Field>
              <Field label="Telephone">
                <input type="tel" style={inputStyle} value={form.tel}
                  onChange={e=>setForm({...form,tel:e.target.value})}
                  placeholder="+223 XX XX XX XX"/>
              </Field>
            </div>
            {form.name.trim() && !editing && (
              <div style={{fontSize:11,color:"var(--text3)",background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 12px"}}>
                📋 Matricule et identifiant générés automatiquement à la création
              </div>
            )}
          </div>
          <div style={modalFooter}>
            <button onClick={()=>setModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={save} disabled={loading||!form.name.trim()} style={btnPrimary("#f0c040")}>
              {loading ? "Enregistrement..." : (editing ? "Modifier" : "Inscrire")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
