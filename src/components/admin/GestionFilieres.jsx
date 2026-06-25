
import { api } from '../../api';
import { useState, useMemo } from "react";
import SearchSelect from '../shared/SearchSelect';

// ── Composants partagés exportés ─────────────────────
export function Modal({ onClose, children }) {
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:1000,padding:16,
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        background:"var(--bg2)",border:"1px solid var(--border)",
        borderRadius:16,padding:"28px 32px",width:"100%",maxWidth:560,
        maxHeight:"90vh",overflowY:"auto",
      }}>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:1,
        textTransform:"uppercase",color:"var(--text3)",marginBottom:7}}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width:"100%",background:"rgba(255,255,255,0.05)",
  border:"1px solid var(--border)",borderRadius:9,
  padding:"11px 14px",color:"var(--text)",
  fontSize:14,outline:"none",boxSizing:"border-box",
};

export const btnPrimary = (color="#f0c040") => ({
  background:color,border:"none",borderRadius:9,
  padding:"10px 22px",color:color==="#f0c040"?"#1a1200":"#fff",
  fontSize:14,fontWeight:700,cursor:"pointer",
});

export const btnSecondary = {
  background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
  borderRadius:9,padding:"10px 22px",color:"var(--text2)",
  fontSize:14,fontWeight:600,cursor:"pointer",
};

export const modalTitle = (color="#f0c040") => ({
  fontSize:18,fontWeight:700,color,marginBottom:20,
});

export const modalFooter = {
  display:"flex",justifyContent:"flex-end",gap:10,marginTop:24,
};

const CYCLES = ["Licence 1","Licence 2","Licence 3","Master 1","Master 2","Doctorat","Autre"];
const CYCLE_COLORS = {
  "Licence 1": { color:"#38bdf8", bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.3)"  },
  "Licence 2": { color:"#06b6d4", bg:"rgba(6,182,212,0.1)",   border:"rgba(6,182,212,0.3)"   },
  "Licence 3": { color:"#0ea5e9", bg:"rgba(14,165,233,0.1)",  border:"rgba(14,165,233,0.3)"  },
  "Master 1":  { color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.3)" },
  "Master 2":  { color:"#8b5cf6", bg:"rgba(139,92,246,0.1)",  border:"rgba(139,92,246,0.3)"  },
  "Doctorat":  { color:"#f472b6", bg:"rgba(244,114,182,0.1)", border:"rgba(244,114,182,0.3)" },
  "Autre":     { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.3)" },
};

export function Th({ children }) {
  return (
    <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,
      textTransform:"uppercase",letterSpacing:1,color:"var(--text3)"}}>
      {children}
    </th>
  );
}

export function Td({ children, style }) {
  return (
    <td style={{padding:"11px 14px",fontSize:13,color:"var(--text)",verticalAlign:"middle",...style}}>
      {children}
    </td>
  );
}

export default function GestionFilieres({ data, setData }) {
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [search,  setSearch]  = useState("");
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterDomaine, setFilterDomaine] = useState("all");
  const [form,      setForm]      = useState({ code:"", name:"", cycle:"Licence 1", domaine:"Technique" });
  const [batchMode, setBatchMode] = useState(false);
  const [batchBase, setBatchBase] = useState({ code:"", name:"" });
  const [batchSelected, setBatchSelected] = useState(["Licence 1","Licence 2","Licence 3"]);

  const filieres = data.filieres || [];

  const filieresFiltrees = useMemo(() => filieres.filter(f => {
    const cycleOk   = filterCycle === "all" || f.cycle === filterCycle;
    const domaineOk = filterDomaine === "all" || f.domaine === filterDomaine;
    const q = search.toLowerCase();
    const searchOk  = !q || f.code.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
    return cycleOk && domaineOk && searchOk;
  }), [filieres, search, filterCycle]);

  function openAdd() {
    setForm({ code:"", name:"", cycle:"Licence 1", domaine:"Technique" });
    setEditing(null);
    setModal(true);
  }

  function openEdit(f) {
    setForm({ code:f.code, name:f.name, cycle:f.cycle||"Licence", domaine:f.domaine||"Technique" });
    setEditing(f.id);
    setModal(true);
  }

  async function saveBatch() {
    if (!batchBase.code.trim() || !batchBase.name.trim()) return;
    const niveaux = [
      { key:"Licence 1", suffix:"L1", sem:"1" },
      { key:"Licence 2", suffix:"L2", sem:"3" },
      { key:"Licence 3", suffix:"L3", sem:"5" },
      { key:"Master 1",  suffix:"M1", sem:"7" },
      { key:"Master 2",  suffix:"M2", sem:"9" },
      { key:"Doctorat",  suffix:"DOC", sem:"11" },
    ];
    const aCreer = niveaux.filter(n => batchSelected.includes(n.key));
    if (!aCreer.length) { alert("Selectionnez au moins un niveau"); return; }
    try {
      for (const n of aCreer) {
        await api.createFiliere({
          code:  batchBase.code.toUpperCase() + "-" + n.suffix,
          name:  batchBase.name + " " + n.key,
          cycle: n.key,
        });
      }
      await setData();
      setModal(false);
      setBatchBase({ code:"", name:"" });
      setBatchSelected(["Licence 1","Licence 2","Licence 3"]);
    } catch(e) { alert(e.message); }
  }

  async function save() {
    if (!form.code.trim() || !form.name.trim()) return;
    try {
      if (editing) {
        await api.updateFiliere(editing, { code:form.code.trim(), name:form.name.trim(), cycle:form.cycle, domaine:form.domaine });
      } else {
        await api.createFiliere({ code:form.code.trim(), name:form.name.trim(), cycle:form.cycle, domaine:form.domaine });
      }
      await setData();
      setModal(false);
    } catch(e) { alert(e.message); }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette filiere et toutes ses donnees ?")) return;
    try { await api.deleteFiliere(id); await setData(); } catch(e) { alert(e.message); }
  }

  // Stats par cycle
  const statsCycles = CYCLES.map(c => ({
    cycle: c,
    count: filieres.filter(f => f.cycle === c).length,
  })).filter(s => s.count > 0);

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Gestion des Filieres
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
            {filieres.length} filiere(s) enregistree(s)
          </p>
        </div>
        <button onClick={openAdd} style={btnPrimary("#f0c040")}>+ Nouvelle Filiere</button>
      </div>

      {/* Stats cycles */}
      {statsCycles.length > 0 && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {statsCycles.map(s => {
            const cc = CYCLE_COLORS[s.cycle] || CYCLE_COLORS.Autre;
            return (
              <div key={s.cycle} style={{
                background:cc.bg,border:"1px solid "+cc.border,
                borderRadius:8,padding:"6px 14px",fontSize:12,
                color:cc.color,fontWeight:700,
              }}>
                {s.cycle} ({s.count})
              </div>
            );
          })}
        </div>
      )}

      {/* Filtres + Recherche */}
      <div style={{
        background:"var(--bg2)",border:"1px solid var(--border)",
        borderRadius:12,padding:"14px 16px",marginBottom:16,
        display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",
      }}>
        {/* Recherche */}
        <div style={{position:"relative",flex:2,minWidth:200}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
            style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher par code ou nom..."
            style={{
              ...inputStyle,paddingLeft:32,
              background:"rgba(255,255,255,0.03)",
            }}/>
          {search && (
            <button onClick={()=>setSearch("")} style={{
              position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:16,
            }}>×</button>
          )}
        </div>

        {/* Filtre domaine */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Domaine:</span>
          {["all","Technique","Gestion"].map(dom => {
            const active = filterDomaine === dom;
            const color  = dom === "Technique" ? "#38bdf8" : dom === "Gestion" ? "#a78bfa" : "#f0c040";
            const label  = dom === "all" ? "Tous" : dom;
            return (
              <button key={dom} onClick={()=>setFilterDomaine(dom)} style={{
                padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
                background:active?"rgba("+(dom==="Technique"?"56,189,248":dom==="Gestion"?"167,139,250":"240,192,64")+",0.15)":"rgba(255,255,255,0.04)",
                border:active?"1px solid "+color+"80":"1px solid var(--border)",
                color:active?color:"var(--text3)",
              }}>{label}</button>
            );
          })}
        </div>
        {/* Filtre cycle */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button onClick={()=>setFilterCycle("all")} style={{
            padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
            background:filterCycle==="all"?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
            border:filterCycle==="all"?"1px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
            color:filterCycle==="all"?"#f0c040":"var(--text3)",
          }}>Tous</button>
          {CYCLES.filter(c=>filieres.some(f=>f.cycle===c)).map(c=>{
            const cc = CYCLE_COLORS[c]||CYCLE_COLORS.Autre;
            return (
              <button key={c} onClick={()=>setFilterCycle(c)} style={{
                padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
                background:filterCycle===c?cc.bg:"rgba(255,255,255,0.04)",
                border:filterCycle===c?"1px solid "+cc.border:"1px solid var(--border)",
                color:filterCycle===c?cc.color:"var(--text3)",
              }}>{c}</button>
            );
          })}
        </div>

        <span style={{fontSize:12,color:"var(--text3)",marginLeft:"auto",flexShrink:0}}>
          {filieresFiltrees.length} resultat(s)
        </span>
      </div>

      {/* Grille Filières */}
      {filieresFiltrees.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"var(--text3)",
          background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)"}}>
          {search || filterCycle!=="all"
            ? "Aucune filiere trouvee — modifiez votre recherche"
            : "Aucune filiere — cliquez + Nouvelle Filiere"}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filieresFiltrees.map(f => {
            const cc      = CYCLE_COLORS[f.cycle] || CYCLE_COLORS.Autre;
            const nbEtu   = (data.etudiants||[]).filter(e=>(e.filiereId||e.filiere_id)===f.id).length;
            const nbUE    = (data.ues||[]).filter(u=>(u.filiereIds||u.filiere_ids||[]).includes(f.id)).length;
            const nbGroupes = (data.groupes||[]).filter(g=>(g.filiereId||g.filiere_id)===f.id).length;
            return (
              <div key={f.id} style={{
                background:"var(--bg2)",border:"1px solid var(--border)",
                borderRadius:14,padding:"18px 20px",
                borderTop:"3px solid "+cc.color,
                transition:"box-shadow 0.2s",
              }}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:900,color:cc.color}}>{f.code}</div>
                    <div style={{fontSize:13,color:"var(--text)",marginTop:3,fontWeight:500}}>{f.name}</div>
                  </div>
                  <span style={{
                    background:cc.bg,border:"1px solid "+cc.border,
                    borderRadius:6,padding:"3px 10px",
                    fontSize:11,color:cc.color,fontWeight:700,flexShrink:0,
                  }}>{f.cycle||"—"}</span>
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
                  {[
                    [nbEtu,   "Etudiants", "#a78bfa"],
                    [nbUE,    "UE",        "#38bdf8"],
                    [nbGroupes,"Groupes",  "#34d399"],
                  ].map(([v,l,c])=>(
                    <div key={l} style={{
                      background:"rgba(255,255,255,0.03)",borderRadius:8,
                      padding:"8px 6px",textAlign:"center",
                    }}>
                      <div style={{fontSize:18,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                      <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(f)} style={{
                    flex:1,background:"rgba(56,189,248,0.1)",
                    border:"1px solid rgba(56,189,248,0.3)",
                    borderRadius:8,padding:"8px",fontSize:12,
                    color:"#38bdf8",cursor:"pointer",fontWeight:600,
                  }}>Modifier</button>
                  <button onClick={()=>remove(f.id)} style={{
                    background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                    borderRadius:8,padding:"8px 14px",fontSize:12,
                    color:"#ef4444",cursor:"pointer",
                  }}>Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(false)}>
          <h3 style={modalTitle("#f0c040")}>{editing ? "Modifier la filiere" : "Nouvelle Filiere"}</h3>

          {/* Toggle mode */}
          {!editing && (
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[["single","Filiere unique"],["batch","Creer plusieurs niveaux"]].map(([v,l])=>(
                <button key={v} onClick={()=>setBatchMode(v==="batch")} style={{
                  flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                  background:((v==="batch")===batchMode)?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
                  border:((v==="batch")===batchMode)?"1.5px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
                  color:((v==="batch")===batchMode)?"#f0c040":"var(--text2)",
                }}>{l}</button>
              ))}
            </div>
          )}

          {/* Mode batch */}
          {!editing && batchMode ? (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <Field label="Code de base *">
                <input style={inputStyle} value={batchBase.code}
                  onChange={e=>setBatchBase({...batchBase,code:e.target.value.toUpperCase()})}
                  placeholder="ex: INFO, GEST, MKT"/>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Le code sera: INFO-L1, INFO-L2, INFO-L3...
                </div>
              </Field>
              <Field label="Nom de base *">
                <input style={inputStyle} value={batchBase.name}
                  onChange={e=>setBatchBase({...batchBase,name:e.target.value})}
                  placeholder="ex: Informatique, Gestion"/>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Le nom sera: Informatique Licence 1, Informatique Licence 2...
                </div>
              </Field>
              <Field label="Niveaux a creer *">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {["Licence 1","Licence 2","Licence 3","Master 1","Master 2","Doctorat"].map(n=>{
                    const cc = CYCLE_COLORS[n]||CYCLE_COLORS.Autre;
                    const sel = batchSelected.includes(n);
                    return (
                      <button key={n} onClick={()=>setBatchSelected(sel
                        ? batchSelected.filter(x=>x!==n)
                        : [...batchSelected,n]
                      )} style={{
                        padding:"10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                        background:sel?cc.bg:"rgba(255,255,255,0.03)",
                        border:sel?"1.5px solid "+cc.color:"1px solid var(--border)",
                        color:sel?cc.color:"var(--text2)",
                        textAlign:"left",
                      }}>
                        <div style={{fontWeight:700}}>{n}</div>
                        <div style={{fontSize:10,color:sel?cc.color:"var(--text3)",marginTop:2}}>
                          {batchBase.code ? batchBase.code.toUpperCase()+"-"+n.replace("Licence ","L").replace("Master ","M").replace("Doctorat","DOC") : "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>
              {batchBase.code && batchBase.name && batchSelected.length > 0 && (
                <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:8,padding:"10px 14px"}}>
                  <div style={{fontSize:11,color:"#34d399",fontWeight:700,marginBottom:6}}>
                    {batchSelected.length} filiere(s) seront creees :
                  </div>
                  {batchSelected.map(n=>(
                    <div key={n} style={{fontSize:11,color:"var(--text2)",marginTop:2}}>
                      • {batchBase.code.toUpperCase()+"-"+n.replace("Licence ","L").replace("Master ","M").replace("Doctorat","DOC")} — {batchBase.name} {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          /* Mode simple */
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Field label="Code *">
              <input style={inputStyle} value={form.code}
                onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}
                placeholder="ex: INFO-L1, GEST-M2"/>
            </Field>
            <Field label="Nom complet *">
              <input style={inputStyle} value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})}
                placeholder="ex: Informatique Licence 1"/>
            </Field>
            <Field label="Cycle *">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {CYCLES.map(cyc=>{
                  const cc = CYCLE_COLORS[cyc]||CYCLE_COLORS.Autre;
                  return (
                    <button key={cyc} onClick={()=>setForm({...form,cycle:cyc})} style={{
                      padding:"9px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                      background:form.cycle===cyc?cc.bg:"rgba(255,255,255,0.03)",
                      border:form.cycle===cyc?"1.5px solid "+cc.color:"1px solid var(--border)",
                      color:form.cycle===cyc?cc.color:"var(--text2)",
                    }}>{cyc}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="Domaine *">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["Technique","Gestion"].map(dom=>{
                  const active = form.domaine === dom;
                  const color  = dom === "Technique" ? "#38bdf8" : "#a78bfa";
                  return (
                    <button key={dom} onClick={()=>setForm({...form,domaine:dom})} style={{
                      padding:"9px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,
                      background:active?"rgba("+( dom==="Technique"?"56,189,248":"167,139,250")+",0.15)":"rgba(255,255,255,0.03)",
                      border:active?"1.5px solid "+color:"1px solid var(--border)",
                      color:active?color:"var(--text2)",
                    }}>{dom}</button>
                  );
                })}
              </div>
            </Field>
          </div>
          )}

          <div style={modalFooter}>
            <button onClick={()=>setModal(false)} style={btnSecondary}>Annuler</button>
            <button
              onClick={(!editing && batchMode) ? saveBatch : save}
              disabled={
                (!editing && batchMode)
                  ? (!batchBase.code.trim()||!batchBase.name.trim()||!batchSelected.length)
                  : (!form.code.trim()||!form.name.trim())
              }
              style={{
                ...btnPrimary("#f0c040"),
                opacity:((!editing&&batchMode)?(!batchBase.code.trim()||!batchBase.name.trim()||!batchSelected.length):(!form.code.trim()||!form.name.trim()))?0.5:1,
              }}>
              {editing ? "Modifier" : (!editing&&batchMode) ? "Creer "+batchSelected.length+" filiere(s)" : "Creer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
