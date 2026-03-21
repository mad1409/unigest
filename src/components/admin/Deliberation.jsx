import { useState, useEffect } from "react";
import { api } from "../../api";

const STATUTS = {
  admis:      { label:"Admis",      color:"#34d399", bg:"rgba(52,211,153,0.15)",  border:"rgba(52,211,153,0.4)"  },
  rattrapage: { label:"Rattrapage", color:"#f0c040", bg:"rgba(240,192,64,0.15)",  border:"rgba(240,192,64,0.4)"  },
  ajourne:    { label:"Ajourne",    color:"#ef4444", bg:"rgba(239,68,68,0.15)",   border:"rgba(239,68,68,0.4)"   },
  en_attente: { label:"En attente", color:"#94a3b8", bg:"rgba(148,163,184,0.15)", border:"rgba(148,163,184,0.4)" },
};

export default function Deliberation({ data }) {
  const [deliberations, setDeliberations] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [calculant,     setCalculant]     = useState(false);
  const [juryModal,     setJuryModal]     = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [juryForm,      setJuryForm]      = useState({ statutJury:"admis", observations:"" });
  const [filtre,        setFiltre]        = useState("all");
  const [filtreFiliere, setFiltreFiliere] = useState("all");
  const [config,        setConfig]        = useState({
    semestre: data.parametres?.semestreActif || 1,
    anneeAcademique: data.parametres?.anneeActive || "2025/2026",
    seuilAdmis: 10,
    seuilRattrapage: 8,
  });

  const annees    = data.parametres?.anneesDisponibles || ["2025/2026"];
  const filieres  = data.filieres || [];

  useEffect(() => { charger(); }, []);

  async function charger() {
    setLoading(true);
    try {
      const r = await api.getDeliberations();
      setDeliberations(Array.isArray(r) ? r : []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function calculer() {
    if (!confirm("Calculer les deliberations pour S"+config.semestre+" "+config.anneeAcademique+" ?")) return;
    setCalculant(true);
    try {
      const r = await api.calculerDeliberation(config);
      if (r.success) {
        alert(r.count+" etudiant(s) traite(s)");
        await charger();
      } else {
        alert(r.error || "Erreur");
      }
    } catch(e) { alert(e.message); }
    setCalculant(false);
  }

  async function saveJury() {
    try {
      await api.updateJury(selected.id, juryForm);
      await charger();
      setJuryModal(false);
    } catch(e) { alert(e.message); }
  }

  // Filtrer
  const delibFiltrees = deliberations.filter(d => {
    const statutOk  = filtre === "all" || (d.statut_jury || d.statut) === filtre;
    const filiereOk = filtreFiliere === "all" || d.filiere_code === filtreFiliere;
    const semestreOk = d.semestre === config.semestre &&
                       d.annee_academique === config.anneeAcademique;
    return statutOk && filiereOk && semestreOk;
  });

  // Stats
  const stats = {
    admis:      delibFiltrees.filter(d => (d.statut_jury||d.statut) === "admis").length,
    rattrapage: delibFiltrees.filter(d => (d.statut_jury||d.statut) === "rattrapage").length,
    ajourne:    delibFiltrees.filter(d => (d.statut_jury||d.statut) === "ajourne").length,
    total:      delibFiltrees.length,
  };

  const inp = {
    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)",
    borderRadius:8, padding:"9px 12px", color:"var(--text)",
    fontSize:13, outline:"none", width:"100%", boxSizing:"border-box",
  };

  function imprimer() { window.print(); }

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Deliberation
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
            Resultats officiels — Semestre {config.semestre} — {config.anneeAcademique}
          </p>
        </div>
        <button onClick={imprimer} style={{
          background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",
          borderRadius:9,padding:"10px 18px",color:"var(--text2)",
          fontSize:13,fontWeight:600,cursor:"pointer",
        }}>Imprimer PV</button>
      </div>

      {/* Configuration */}
      <div style={{
        background:"var(--bg2)",border:"1px solid var(--border)",
        borderRadius:12,padding:"18px 20px",marginBottom:20,
      }}>
        <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:14}}>
          Configuration du calcul
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:14}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Semestre</label>
            <select style={inp} value={config.semestre}
              onChange={e=>setConfig({...config,semestre:parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8,9,10].map(s=><option key={s} value={s}>Semestre {s}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Annee</label>
            <select style={inp} value={config.anneeAcademique}
              onChange={e=>setConfig({...config,anneeAcademique:e.target.value})}>
              {annees.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Seuil Admis</label>
            <input type="number" style={inp} value={config.seuilAdmis} min="0" max="20"
              onChange={e=>setConfig({...config,seuilAdmis:parseFloat(e.target.value)})}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Seuil Rattrapage</label>
            <input type="number" style={inp} value={config.seuilRattrapage} min="0" max="20"
              onChange={e=>setConfig({...config,seuilRattrapage:parseFloat(e.target.value)})}/>
          </div>
        </div>
        <button onClick={calculer} disabled={calculant} style={{
          background:"#f0c040",border:"none",borderRadius:9,
          padding:"11px 28px",color:"#1a1200",fontSize:14,fontWeight:700,
          cursor:calculant?"not-allowed":"pointer",
          opacity:calculant?0.7:1,
        }}>
          {calculant ? "Calcul en cours..." : "Calculer les deliberations"}
        </button>
      </div>

      {/* Stats */}
      {delibFiltrees.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
          {[
            ["Total",      stats.total,      "#38bdf8"],
            ["Admis",      stats.admis,      "#34d399"],
            ["Rattrapage", stats.rattrapage, "#f0c040"],
            ["Ajournes",   stats.ajourne,    "#ef4444"],
          ].map(([l,v,c])=>(
            <div key={l} style={{
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12,padding:"16px",borderTop:"3px solid "+c,textAlign:"center",
            }}>
              <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:12,color:"var(--text2)",marginTop:4}}>{l}</div>
              {stats.total > 0 && <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                {Math.round(v/stats.total*100)}%
              </div>}
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","Tous"],["admis","Admis"],["rattrapage","Rattrapage"],["ajourne","Ajournes"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFiltre(v)} style={{
              padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
              background:filtre===v?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
              border:filtre===v?"1px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
              color:filtre===v?"#f0c040":"var(--text2)",
            }}>{l}</button>
          ))}
        </div>
        <select style={{...inp,maxWidth:200}} value={filtreFiliere}
          onChange={e=>setFiltreFiliere(e.target.value)}>
          <option value="all">Toutes les filieres</option>
          {filieres.map(f=><option key={f.id} value={f.code}>{f.code}</option>)}
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div style={{textAlign:"center",padding:"40px",color:"var(--text3)"}}>Chargement...</div>
      ) : delibFiltrees.length === 0 ? (
        <div style={{
          textAlign:"center",padding:"60px",color:"var(--text3)",
          background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)",
        }}>
          {deliberations.length === 0
            ? "Aucune deliberation — cliquez Calculer"
            : "Aucun resultat pour ce filtre"}
        </div>
      ) : (
        <div style={{
          background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",
          borderRadius:14,overflow:"hidden",
        }}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
              <thead>
                <tr style={{background:"rgba(52,211,153,0.06)"}}>
                  {["Matricule","Nom","Filiere","Moyenne","Credits","Statut Auto","Decision Jury","Actions"].map(h=>(
                    <th key={h} style={{
                      padding:"12px 14px",textAlign:"left",fontSize:11,
                      fontWeight:700,textTransform:"uppercase",letterSpacing:1,
                      color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {delibFiltrees.map((d,i) => {
                  const statutFinal = d.statut_jury || d.statut;
                  const s = STATUTS[statutFinal] || STATUTS.en_attente;
                  const sAuto = STATUTS[d.statut] || STATUTS.en_attente;
                  return (
                    <tr key={d.id} style={{
                      borderTop:"1px solid var(--border)",
                      background:i%2===0?"transparent":"rgba(255,255,255,0.015)",
                    }}>
                      <td style={{padding:"11px 14px",fontFamily:"monospace",fontSize:11,color:"#34d399",fontWeight:700}}>
                        {d.matricule||"—"}
                      </td>
                      <td style={{padding:"11px 14px",fontWeight:600,color:"var(--text)",fontSize:13}}>
                        {d.etudiant_name}
                      </td>
                      <td style={{padding:"11px 14px"}}>
                        <span style={{
                          background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",
                          borderRadius:5,padding:"2px 8px",fontSize:11,color:"#34d399",fontWeight:700,
                        }}>{d.filiere_code||"—"}</span>
                      </td>
                      <td style={{padding:"11px 14px",fontWeight:800,fontSize:15,
                        color:parseFloat(d.moyenne_generale)>=10?"#34d399":parseFloat(d.moyenne_generale)>=8?"#f0c040":"#ef4444"}}>
                        {parseFloat(d.moyenne_generale).toFixed(2)}/20
                      </td>
                      <td style={{padding:"11px 14px",fontSize:12,color:"var(--text2)"}}>
                        {d.credits_valides}/{d.credits_total}
                      </td>
                      <td style={{padding:"11px 14px"}}>
                        <span style={{
                          background:sAuto.bg,border:"1px solid "+sAuto.border,
                          borderRadius:6,padding:"3px 10px",fontSize:11,color:sAuto.color,fontWeight:700,
                        }}>{sAuto.label}</span>
                      </td>
                      <td style={{padding:"11px 14px"}}>
                        {d.statut_jury ? (
                          <span style={{
                            background:s.bg,border:"1px solid "+s.border,
                            borderRadius:6,padding:"3px 10px",fontSize:11,color:s.color,fontWeight:700,
                          }}>{s.label}</span>
                        ) : (
                          <span style={{fontSize:11,color:"var(--text3)"}}>—</span>
                        )}
                      </td>
                      <td style={{padding:"11px 14px"}}>
                        <button onClick={()=>{
                          setSelected(d);
                          setJuryForm({
                            statutJury: d.statut_jury || d.statut,
                            observations: d.observations || "",
                          });
                          setJuryModal(true);
                        }} style={{
                          background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",
                          borderRadius:6,padding:"5px 12px",fontSize:11,color:"#f0c040",cursor:"pointer",fontWeight:600,
                        }}>Jury</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Jury */}
      {juryModal && selected && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
          display:"flex",alignItems:"center",justifyContent:"center",
          zIndex:1000,padding:16,
        }} onClick={e=>{if(e.target===e.currentTarget)setJuryModal(false);}}>
          <div style={{
            background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:16,padding:"28px 32px",width:"100%",maxWidth:480,
          }}>
            <h3 style={{fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:6}}>
              Decision du Jury
            </h3>
            <p style={{color:"var(--text2)",fontSize:13,marginBottom:20}}>
              {selected.etudiant_name} — Moyenne: <strong style={{color:"var(--text)"}}>{parseFloat(selected.moyenne_generale).toFixed(2)}/20</strong>
            </p>

            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",
                marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Decision</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {Object.entries(STATUTS).filter(([k])=>k!=="en_attente").map(([k,v])=>(
                  <button key={k} onClick={()=>setJuryForm({...juryForm,statutJury:k})} style={{
                    padding:"10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
                    background:juryForm.statutJury===k?v.bg:"rgba(255,255,255,0.03)",
                    border:juryForm.statutJury===k?"1.5px solid "+v.color:"1px solid var(--border)",
                    color:juryForm.statutJury===k?v.color:"var(--text2)",
                  }}>{v.label}</button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",
                marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Observations</label>
              <textarea value={juryForm.observations}
                onChange={e=>setJuryForm({...juryForm,observations:e.target.value})}
                placeholder="Motif de la decision du jury..."
                style={{...inp,minHeight:80,resize:"vertical"}}/>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
              <button onClick={()=>setJuryModal(false)} style={{
                background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",
                borderRadius:10,padding:"10px 20px",color:"var(--text2)",fontSize:14,cursor:"pointer",
              }}>Annuler</button>
              <button onClick={saveJury} style={{
                background:"#f0c040",border:"none",borderRadius:10,
                padding:"10px 24px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",
              }}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Style impression */}
      <style dangerouslySetInnerHTML={{__html:`
        @media print {
          body * { visibility: hidden; }
          .main-content, .main-content * { visibility: visible; }
          .main-content { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}}/>
    </div>
  );
}
