import { useState, useEffect, useMemo } from "react";
import { api } from "../../api";

const TYPES_EVENEMENT = [
  { value:"rentree",      label:"Rentrée académique",  color:"#34d399" },
  { value:"examen",       label:"Examens",             color:"#f0c040" },
  { value:"deliberation", label:"Délibération",        color:"#a78bfa" },
  { value:"vacances",     label:"Vacances",            color:"#38bdf8" },
  { value:"inscription",  label:"Inscriptions",        color:"#fb923c" },
  { value:"autre",        label:"Autre événement",     color:"#94a3b8" },
];

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
               "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function CalendrierAcademique({ data }) {
  const annee = data.parametres?.anneeActive || "2025/2026";
  const [evenements, setEvenements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [viewMode,   setViewMode]   = useState("liste");
  const [moisActif,  setMoisActif]  = useState(new Date().getMonth());
  const [form,       setForm]       = useState({
    titre:"", type:"rentree", dateDebut:"", dateFin:"", description:"", filiereId:"",
  });

  useEffect(() => { charger(); }, [annee]);

  async function charger() {
    setLoading(true);
    try {
      const r = await api.getCalendrier(annee);
      setEvenements(Array.isArray(r) ? r : []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  function openNew() {
    setForm({ titre:"", type:"rentree", dateDebut:"", dateFin:"", description:"", filiereId:"" });
    setEditing(null);
    setModal(true);
  }

  function openEdit(e) {
    setForm({
      titre: e.titre,
      type: e.type,
      dateDebut: e.date_debut?.split("T")[0] || "",
      dateFin: e.date_fin?.split("T")[0] || "",
      filiereId: e.filiere_id || "",
      description: e.description || "",
    });
    setEditing(e.id);
    setModal(true);
  }

  async function save() {
    if (!form.titre || !form.dateDebut) return;
    if ((form.type==="rentree"||form.type==="examen") && !form.dateFin) {
      alert("La date de fin est obligatoire pour ce type d événement");
      return;
    }
    try {
      const payload = { ...form, anneeAcademique: annee };
      if (editing) await api.updateEvenement(editing, payload);
      else         await api.createEvenement(payload);
      await charger();
      setModal(false);
    } catch(e) { alert(e.message); }
  }

  async function del(id) {
    if (!confirm("Supprimer cet événement ?")) return;
    try { await api.deleteEvenement(id); await charger(); }
    catch(e) { alert(e.message); }
  }

  const evtTries = useMemo(() =>
    [...evenements].sort((a,b) => new Date(a.date_debut) - new Date(b.date_debut)),
    [evenements]
  );

  const evtsMois = useMemo(() =>
    evtTries.filter(e => new Date(e.date_debut).getMonth() === moisActif),
    [evtTries, moisActif]
  );

  function getType(type) {
    return TYPES_EVENEMENT.find(t => t.value === type) || TYPES_EVENEMENT[5];
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric"});
  }

  function joursRestants(dateDebut) {
    const diff = Math.ceil((new Date(dateDebut) - new Date()) / (1000*60*60*24));
    if (diff < 0) return null;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    return "Dans "+diff+" jours";
  }

  const inp = {
    width:"100%", boxSizing:"border-box",
    background:"rgba(255,255,255,0.05)",
    border:"1px solid var(--border)",
    borderRadius:9, padding:"11px 14px",
    color:"var(--text)", fontSize:13, outline:"none",
  };

  const prochains = evtTries.filter(e => {
    const diff = Math.ceil((new Date(e.date_debut) - new Date()) / (1000*60*60*24));
    return diff >= 0 && diff <= 30;
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Calendrier Académique
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
            Année {annee} — {evenements.length} événement(s)
          </p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setViewMode(v=>v==="liste"?"mois":"liste")} style={{
            padding:"10px 16px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",
            background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",color:"var(--text2)",
          }}>{viewMode==="liste"?"Vue mois":"Vue liste"}</button>
          <button onClick={openNew} style={{
            background:"#f0c040",border:"none",borderRadius:9,
            padding:"10px 22px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",
          }}>+ Ajouter</button>
        </div>
      </div>

      {/* Prochains événements */}
      {prochains.length > 0 && (
        <div style={{background:"rgba(240,192,64,0.06)",border:"1px solid rgba(240,192,64,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#f0c040",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>
            Événements dans les 30 prochains jours
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {prochains.map(e => {
              const t = getType(e.type);
              return (
                <div key={e.id} style={{background:t.color+"15",border:"1px solid "+t.color+"30",borderRadius:8,padding:"8px 12px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:t.color}}>{e.titre}</div>
                  <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{joursRestants(e.date_debut)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{textAlign:"center",padding:"40px",color:"var(--text3)"}}>Chargement...</div>
      ) : viewMode === "mois" ? (
        <div>
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            {MOIS.map((m,i) => {
              const nb = evtTries.filter(e => new Date(e.date_debut).getMonth() === i).length;
              return (
                <button key={i} onClick={()=>setMoisActif(i)} style={{
                  padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
                  background:moisActif===i?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
                  border:moisActif===i?"1.5px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
                  color:moisActif===i?"#f0c040":"var(--text2)",position:"relative",
                }}>
                  {m.slice(0,3)}
                  {nb > 0 && <span style={{position:"absolute",top:-4,right:-4,background:"#f0c040",color:"#1a1200",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{nb}</span>}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:12}}>{MOIS[moisActif]}</div>
          {evtsMois.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px",color:"var(--text3)",background:"var(--bg2)",borderRadius:12,border:"1px solid var(--border)"}}>
              Aucun événement en {MOIS[moisActif]}
            </div>
          ) : evtsMois.map(e => {
            const t = getType(e.type);
            return (
              <div key={e.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderLeft:"4px solid "+t.color,borderRadius:10,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{background:t.color+"18",border:"1px solid "+t.color+"35",borderRadius:5,padding:"2px 8px",fontSize:10,color:t.color,fontWeight:700}}>{t.label}</span>
                    {joursRestants(e.date_debut) && <span style={{fontSize:11,color:"#f0c040",fontWeight:600}}>{joursRestants(e.date_debut)}</span>}
                  </div>
                  <div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>{e.titre}</div>
                  <div style={{fontSize:12,color:"var(--text2)",marginTop:3}}>
                    {formatDate(e.date_debut)}{e.date_fin && e.date_fin!==e.date_debut ? " → "+formatDate(e.date_fin) : ""}
                  </div>
                  {e.description && <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{e.description}</div>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>openEdit(e)} style={{background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#38bdf8",cursor:"pointer"}}>Modifier</button>
                  <button onClick={()=>del(e.id)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"6px 8px",fontSize:11,color:"#ef4444",cursor:"pointer"}}>X</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {evtTries.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px",color:"var(--text3)",background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)"}}>
              Aucun événement — cliquez + Ajouter
            </div>
          ) : evtTries.map(e => {
            const t    = getType(e.type);
            const jr   = joursRestants(e.date_debut);
            const past = new Date(e.date_debut) < new Date();
            return (
              <div key={e.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderLeft:"4px solid "+(past?"#374151":t.color),borderRadius:10,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,opacity:past?0.6:1}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{background:t.color+"18",border:"1px solid "+t.color+"35",borderRadius:5,padding:"2px 8px",fontSize:10,color:t.color,fontWeight:700}}>{t.label}</span>
                    {jr && !past && <span style={{fontSize:11,color:"#f0c040",fontWeight:600}}>{jr}</span>}
                    {past && <span style={{fontSize:10,color:"var(--text3)"}}>Passé</span>}
                  </div>
                  <div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>{e.titre}</div>
                  <div style={{fontSize:12,color:"var(--text2)",marginTop:3}}>
                    {formatDate(e.date_debut)}{e.date_fin && e.date_fin!==e.date_debut ? " → "+formatDate(e.date_fin) : ""}
                  </div>
                  {e.description && <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{e.description}</div>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>openEdit(e)} style={{background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#38bdf8",cursor:"pointer"}}>Modifier</button>
                  <button onClick={()=>del(e.id)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"6px 8px",fontSize:11,color:"#ef4444",cursor:"pointer"}}>X</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}
          onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:"28px 32px",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:20}}>
              {editing ? "Modifier l'événement" : "Nouvel événement"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Titre *</label>
                <input style={inp} value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Ex: Rentrée académique"/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Type *</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {TYPES_EVENEMENT.map(t => (
                    <button key={t.value} onClick={()=>setForm({...form,type:t.value})} style={{
                      padding:"9px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                      background:form.type===t.value?t.color+"18":"rgba(255,255,255,0.03)",
                      border:form.type===t.value?"1.5px solid "+t.color:"1px solid var(--border)",
                      color:form.type===t.value?t.color:"var(--text2)",textAlign:"left",
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Date début *</label>
                  <input type="date" style={inp} value={form.dateDebut} onChange={e=>setForm({...form,dateDebut:e.target.value})}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>
                    Date fin {(form.type==="rentree"||form.type==="examen"||form.type==="vacances") ? "*" : ""}
                  </label>
                  <input type="date" style={{...inp,borderColor:(form.type==="rentree"||form.type==="examen")&&!form.dateFin?"#ef4444":undefined}} value={form.dateFin} onChange={e=>setForm({...form,dateFin:e.target.value})}/>
                  {(form.type==="rentree"||form.type==="examen")&&!form.dateFin&&(
                    <div style={{fontSize:10,color:"#ef4444",marginTop:3}}>Obligatoire pour ce type</div>
                  )}
                </div>
              </div>
              {/* Filières pour examens */}
              {form.type==="examen" && (
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Classe / Filière concernée</label>
                  <select style={{...inp,cursor:"pointer"}} value={form.filiereId||""} onChange={e=>setForm({...form,filiereId:e.target.value})}>
                    <option value="">-- Toutes les filières --</option>
                    {(data?.filieres||[]).map(f=>(
                      <option key={f.id} value={f.id}>{f.code} — {f.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Description</label>
                <textarea style={{...inp,minHeight:70,resize:"vertical"}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Détails..."/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:24}}>
              <button onClick={()=>setModal(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 20px",color:"var(--text2)",fontSize:14,cursor:"pointer"}}>Annuler</button>
              <button onClick={save} disabled={!form.titre||!form.dateDebut} style={{background:"#f0c040",border:"none",borderRadius:10,padding:"10px 24px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",opacity:(!form.titre||!form.dateDebut)?0.5:1}}>
                {editing ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
