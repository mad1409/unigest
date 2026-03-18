import { api } from '../../api';
import SearchSelect from '../shared/SearchSelect';
import { useState, useMemo } from "react";
import {
  Modal, Field, inputStyle,
  btnPrimary, btnSecondary,
  modalTitle, modalFooter, Th, Td,
} from "./GestionFilieres";

const CYCLES = ["Licence","Master","Doctorat"];
const SEMESTRES = [1,2,3,4,5,6,7,8];

// Semestres selon le cycle de la filière
function getSemestresForFilieres(filiereIds, filieres) {
  if (!filiereIds || filiereIds.length === 0) return SEMESTRES;
  const cycles = filiereIds.map(id => {
    const f = filieres.find(f => f.id === parseInt(id));
    return f?.cycle || "";
  });
  // Déterminer le niveau depuis le code de la filière
  const codes = filiereIds.map(id => filieres.find(f => f.id === parseInt(id))?.code || "");
  let sems = [];
  codes.forEach(code => {
    const upper = code.toUpperCase();
    if (upper.includes("L1") || upper.includes("-1") || upper.includes("_1")) sems.push(1,2);
    else if (upper.includes("L2") || upper.includes("-2") || upper.includes("_2")) sems.push(3,4);
    else if (upper.includes("L3") || upper.includes("-3") || upper.includes("_3")) sems.push(5,6);
    else if (upper.includes("M1") || upper.includes("MA1")) sems.push(7,8);
    else if (upper.includes("M2") || upper.includes("MA2")) sems.push(9,10);
    else if (upper.includes("D1") || upper.includes("DOC1")) sems.push(11,12);
    else {
      // Fallback selon cycle
      const cycle = filieres.find(f => f.code === code)?.cycle || "";
      if (cycle === "Licence")   sems.push(1,2,3,4,5,6);
      else if (cycle === "Master")    sems.push(7,8,9,10);
      else if (cycle === "Doctorat")  sems.push(11,12);
      else sems.push(...SEMESTRES);
    }
  });
  return sems.length > 0 ? [...new Set(sems)].sort((a,b)=>a-b) : SEMESTRES;
}

export default function GestionUE({ data, setData }) {
  const [filterCycle,   setFilterCycle]   = useState("all");
  const [filterFiliere, setFilterFiliere] = useState("all");
  const [filterSearch,  setFilterSearch]  = useState("");
  const [modal,         setModal]         = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [searchFiliere, setSearchFiliere] = useState("");

  const initForm = {
    code:"", intitule:"", semestre:1, creditUE:3,
    filiereIds:[], matieres:[],
  };
  const [form, setForm] = useState(initForm);

  // ── Filtrage ──────────────────────────────────────
  const uesFiltrees = useMemo(() => {
    return (data.ues || []).filter(ue => {
      const filieres = (ue.filiereIds || []).map(id => data.filieres.find(f => f.id === id)).filter(Boolean);

      const cycleOk = filterCycle === "all" ||
        filieres.some(f => f.cycle === filterCycle);

      const filiereOk = filterFiliere === "all" ||
        (ue.filiereIds || []).includes(parseInt(filterFiliere));

      const q = filterSearch.toLowerCase().trim();
      const searchOk = !q ||
        ue.code.toLowerCase().includes(q) ||
        ue.intitule.toLowerCase().includes(q) ||
        filieres.some(f => f.code.toLowerCase().includes(q));

      return cycleOk && filiereOk && searchOk;
    });
  }, [data.ues, filterCycle, filterFiliere, filterSearch, data.filieres]);

  // ── Stats ─────────────────────────────────────────
  const statsCycle = useMemo(() => {
    const counts = {};
    CYCLES.forEach(c => {
      counts[c] = (data.ues || []).filter(ue =>
        (ue.filiereIds || []).some(fid => data.filieres.find(f => f.id === fid)?.cycle === c)
      ).length;
    });
    return counts;
  }, [data.ues, data.filieres]);

  // ── CRUD ──────────────────────────────────────────
  function open(ue = null) {
    setSearchFiliere("");
    if (ue) {
      setEditing(ue.id);
      setForm({
        code:       ue.code,
        intitule:   ue.intitule,
        semestre:   ue.semestre,
        creditUE:   ue.creditUE,
        filiereIds: ue.filiereIds || [],
        matieres:   (ue.matieres || []).map(m => ({...m})),
      });
    } else {
      setEditing(null);
      setForm(initForm);
    }
    setModal(true);
  }

  async function save() {
    if (!form.code || !form.intitule) return;
    if (saving) return;  // Eviter double clic
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        intitule: form.intitule,
        semestre: parseInt(form.semestre),
        creditUE: parseInt(form.creditUE),
        filiereIds: form.filiereIds,
        matieres: form.matieres,
      };
      if (editing) {
        await api.updateUE(editing, payload);
      } else {
        await api.createUE(payload);
      }
      await setData();
      setModal(false);
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Supprimer cette UE ?")) return;
    try { await api.deleteUE(id); await setData(); } catch(e) { alert(e.message); }
  }

  function addMatiere() {
    setForm(f => ({
      ...f,
      matieres: [...f.matieres, {
        id: Date.now(), name: "", creditECUE: 1,
      }],
    }));
  }

  function updateMatiere(idx, key, val) {
    setForm(f => ({
      ...f,
      matieres: f.matieres.map((m, i) => i === idx ? {...m, [key]: val} : m),
    }));
  }

  function removeMatiere(idx) {
    setForm(f => ({...f, matieres: f.matieres.filter((_,i) => i !== idx)}));
  }

  // ── UI helpers ────────────────────────────────────
  const cycleColor = {
    Licence:  { color:"#38bdf8", bg:"rgba(56,189,248,0.12)",  border:"rgba(56,189,248,0.3)"  },
    Master:   { color:"#a78bfa", bg:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.3)" },
    Doctorat: { color:"#f0c040", bg:"rgba(240,192,64,0.12)",  border:"rgba(240,192,64,0.3)"  },
  };

  const cycleBtn = (c, active) => {
    const cfg = c === "all"
      ? { color:"#f0c040", bg:"rgba(240,192,64,0.12)", border:"rgba(240,192,64,0.3)" }
      : cycleColor[c] || cycleColor.Licence;
    return {
      padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
      background: active ? cfg.bg   : "rgba(255,255,255,0.04)",
      border:     active ? `1px solid ${cfg.border}` : "1px solid var(--border)",
      color:      active ? cfg.color : "var(--text3)",
    };
  };

  const inp = {
    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)",
    borderRadius:8, padding:"9px 12px", color:"var(--text)", fontSize:13, outline:"none",
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <h2 style={{fontSize:24,fontWeight:700,color:"#f0c040"}}>UE / Matieres</h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
            {uesFiltrees.length} UE affichee(s) sur {(data.ues||[]).length} total
          </p>
        </div>
        <button onClick={() => open()} style={{
          background:"#f0c040",border:"none",borderRadius:8,
          padding:"10px 20px",color:"#1a1200",fontWeight:700,fontSize:13,cursor:"pointer",
        }}>+ Nouvelle UE</button>
      </div>

      {/* ── FILTRES ── */}
      <div style={{
        background:"var(--bg2)",border:"1px solid var(--border)",
        borderRadius:14,padding:"18px 22px",marginBottom:20,
      }}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)",marginBottom:14}}>
          Filtres
        </div>

        <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end"}}>
          {/* Recherche */}
          <div style={{flex:2,minWidth:200,position:"relative"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
              style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={filterSearch} onChange={e => { setFilterSearch(e.target.value); }}
              placeholder="Code UE, intitule, filiere..."
              style={{...inp,width:"100%",paddingLeft:34,boxSizing:"border-box"}}
            />
          </div>

          {/* Filiere */}
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>
              Filiere
            </div>
            <SearchSelect
              value={filterFiliere}
              onChange={v => setFilterFiliere(v)}
              options={data.filieres.map(f=>({value:String(f.id), label:f.code+" — "+f.name, sub:f.cycle}))}
              allLabel="Toutes les filieres"
              placeholder="Rechercher filiere..."
              style={{minWidth:200}}
            />
          </div>
        </div>

        {/* Filtres cycle */}
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>
            Cycle
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button onClick={() => setFilterCycle("all")} style={cycleBtn("all", filterCycle==="all")}>
              Tous ({(data.ues||[]).length})
            </button>
            {CYCLES.map(c => statsCycle[c] > 0 && (
              <button key={c} onClick={() => setFilterCycle(c)} style={cycleBtn(c, filterCycle===c)}>
                {c} ({statsCycle[c]})
              </button>
            ))}
          </div>
        </div>

        {/* Stats par semestre */}
        <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
          {SEMESTRES.map(s => {
            const n = uesFiltrees.filter(u => u.semestre === s).length;
            if (!n) return null;
            return (
              <div key={s} style={{
                background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
                borderRadius:8,padding:"6px 12px",textAlign:"center",
              }}>
                <div style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>{n}</div>
                <div style={{fontSize:10,color:"var(--text3)"}}>S{s}</div>
              </div>
            );
          })}
          {(filterCycle !== "all" || filterFiliere !== "all" || filterSearch !== "") && (
            <button
              onClick={() => { setFilterCycle("all"); setFilterFiliere("all"); setFilterSearch(""); }}
              style={{
                marginLeft:"auto",alignSelf:"center",
                background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:8,padding:"6px 14px",color:"#ef4444",
                fontSize:12,fontWeight:600,cursor:"pointer",
              }}
            >Reinitialiser</button>
          )}
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.04)"}}>
              <Th>Code</Th>
              <Th>Intitule</Th>
              <Th>Cycle</Th>
              <Th>Filieres</Th>
              <Th>S.</Th>
              <Th>Credits</Th>
              <Th>Matieres</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {uesFiltrees.length === 0 ? (
              <tr><td colSpan={8} style={{padding:"50px",textAlign:"center",color:"var(--text3)"}}>
                Aucune UE ne correspond aux filtres
              </td></tr>
            ) : uesFiltrees.map(ue => {
              const filieres = (ue.filiereIds||[])
                .map(id => data.filieres.find(f => f.id === id))
                .filter(Boolean);
              const cycle = filieres[0]?.cycle;
              const cfg   = cycleColor[cycle] || cycleColor.Licence;
              return (
                <tr key={ue.id} style={{borderBottom:"1px solid var(--border)"}}>
                  <Td>
                    <span style={{fontFamily:"monospace",fontSize:12,color:"#38bdf8",fontWeight:700}}>
                      {ue.code}
                    </span>
                  </Td>
                  <Td>
                    <div style={{fontWeight:600,color:"var(--text)",fontSize:13}}>{ue.intitule}</div>
                  </Td>
                  <Td>
                    {cycle && (
                      <span style={{
                        background:cfg.bg,border:`1px solid ${cfg.border}`,
                        borderRadius:6,padding:"2px 9px",fontSize:11,color:cfg.color,fontWeight:700,
                      }}>{cycle}</span>
                    )}
                  </Td>
                  <Td>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {filieres.map(f => (
                        <span key={f.id} style={{
                          background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",
                          borderRadius:5,padding:"1px 7px",fontSize:11,color:"#a78bfa",fontWeight:600,
                        }}>{f.code}</span>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <span style={{
                      background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.25)",
                      borderRadius:6,padding:"2px 8px",fontSize:12,color:"#f0c040",fontWeight:700,
                    }}>S{ue.semestre}</span>
                  </Td>
                  <Td>
                    <span style={{fontWeight:700,color:"var(--text)"}}>{ue.creditUE}</span>
                    <span style={{color:"var(--text3)",fontSize:11}}> cr.</span>
                  </Td>
                  <Td>
                    <div style={{fontSize:12,color:"var(--text2)"}}>
                      {(ue.matieres||[]).length} matiere(s)
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                        {(ue.matieres||[]).map(m=>m.name).join(", ").slice(0,40)}
                        {(ue.matieres||[]).map(m=>m.name).join(", ").length > 40 && "…"}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={() => open(ue)} style={{
                        background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",
                        borderRadius:7,padding:"6px 12px",color:"#38bdf8",fontSize:12,cursor:"pointer",
                      }}>Modifier</button>
                      <button onClick={() => del(ue.id)} style={{
                        background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                        borderRadius:7,padding:"6px 10px",color:"#ef4444",fontSize:12,cursor:"pointer",
                      }}>X</button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 style={modalTitle("#f0c040")}>{editing ? "Modifier l'UE" : "Nouvelle UE"}</h3>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Field label="Code UE *">
              <input style={inputStyle} value={form.code}
                onChange={e => setForm({...form,code:e.target.value})} placeholder="ex: UE-INFO-301"/>
            </Field>
            <Field label="Semestre">
              <SearchSelect
                value={String(form.semestre)}
                onChange={v => setForm({...form, semestre:parseInt(v)})}
                options={getSemestresForFilieres(form.filiereIds, data.filieres).map(s=>({value:String(s), label:"Semestre "+s}))}
                placeholder="Choisir un semestre..."
                color="#f0c040"
              />
              {form.filiereIds.length === 0 && (
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Selectionnez une filiere pour voir les semestres correspondants.
                </div>
              )}
            </Field>
            <Field label="Intitule *" style={{gridColumn:"1/-1"}}>
              <input style={inputStyle} value={form.intitule}
                onChange={e => setForm({...form,intitule:e.target.value})} placeholder="ex: Algorithmique avancee"/>
            </Field>
            <Field label="Credits UE">
              <input type="number" style={inputStyle} value={form.creditUE}
                onChange={e => setForm({...form,creditUE:e.target.value})} placeholder="ex: 3"/>
            </Field>
          </div>

          {/* Filieres */}
          <div style={{marginTop:14}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)",marginBottom:8}}>
              Filieres concernees *
            </div>
            <div style={{position:"relative",marginBottom:10}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
                style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={searchFiliere||""}
                onChange={e => setSearchFiliere(e.target.value)}
                placeholder="Rechercher une filiere..."
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid var(--border)",
                  borderRadius:8,padding:"8px 10px 8px 28px",
                  color:"var(--text)",fontSize:12,outline:"none",
                }}
              />
            </div>
            {form.filiereIds.length > 0 && (
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {form.filiereIds.map(id => {
                  const f = data.filieres.find(f=>f.id===id);
                  return f ? (
                    <span key={id} style={{
                      background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",
                      borderRadius:6,padding:"2px 8px",fontSize:11,color:"#f0c040",
                      display:"flex",alignItems:"center",gap:4,
                    }}>
                      {f.code}
                      <button onClick={()=>setForm({...form,filiereIds:form.filiereIds.filter(x=>x!==id)})}
                        style={{background:"none",border:"none",cursor:"pointer",color:"#f0c040",fontSize:14,lineHeight:1,padding:0}}>×</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
{searchFiliere && (
              <div style={{
                border:"1px solid var(--border)",borderRadius:8,
                maxHeight:180,overflowY:"auto",background:"var(--bg2)",
              }}>
                {data.filieres.filter(f=>(f.code+f.name).toLowerCase().includes(searchFiliere.toLowerCase())).map(f => {
                  const cfg = cycleColor[f.cycle] || cycleColor.Licence;
                  const checked = form.filiereIds.includes(f.id);
                  return (
                    <div key={f.id} onClick={()=>{
                      if (checked) setForm({...form,filiereIds:form.filiereIds.filter(id=>id!==f.id)});
                      else setForm({...form,filiereIds:[...form.filiereIds,f.id]});
                      setSearchFiliere("");
                    }} style={{
                      display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",
                      background:checked?cfg.bg:"transparent",
                      borderBottom:"1px solid var(--border)",
                    }}>
                      <div style={{
                        width:16,height:16,borderRadius:4,flexShrink:0,
                        background:checked?cfg.color:"transparent",
                        border:checked?"none":"1px solid var(--border)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>
                        {checked&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div>
                        <span style={{fontWeight:700,fontSize:12,color:checked?cfg.color:"var(--text)"}}>{f.code}</span>
                        <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{f.name}</span>
                      </div>
                      <span style={{marginLeft:"auto",fontSize:10,color:cfg.color,background:cfg.bg,borderRadius:4,padding:"1px 6px"}}>{f.cycle}</span>
                    </div>
                  );
                })}
                {data.filieres.filter(f=>(f.code+f.name).toLowerCase().includes(searchFiliere.toLowerCase())).length===0&&(
                  <div style={{padding:"16px",textAlign:"center",color:"var(--text3)",fontSize:12}}>Aucune filiere trouvee</div>
                )}
              </div>
            )}
          </div>

          {/* Matieres */}
          <div style={{marginTop:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)"}}>
                Matieres / ECUE
              </div>
              <button onClick={addMatiere} style={{
                background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",
                borderRadius:7,padding:"5px 12px",color:"#34d399",fontSize:12,cursor:"pointer",
              }}>+ Ajouter</button>
            </div>
            {form.matieres.length === 0 && (
              <div style={{color:"var(--text3)",fontSize:12,textAlign:"center",padding:"16px",
                background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px dashed var(--border)"}}>
                Aucune matiere. Cliquez sur "+ Ajouter".
              </div>
            )}
            {form.matieres.map((m, idx) => (
              <div key={idx} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <input
                  style={{...inputStyle,flex:3}}
                  value={m.name} placeholder={`Matiere ${idx+1}`}
                  onChange={e => updateMatiere(idx,"name",e.target.value)}
                />
                <input
                  type="number" style={{...inputStyle,width:70}}
                  value={m.creditECUE} placeholder="Cr."
                  onChange={e => updateMatiere(idx,"creditECUE",e.target.value)}
                />
                <button onClick={() => removeMatiere(idx)} style={{
                  background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                  borderRadius:7,padding:"7px 10px",color:"#ef4444",fontSize:12,cursor:"pointer",
                }}>X</button>
              </div>
            ))}
          </div>

          <div style={modalFooter}>
            <button onClick={() => setModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={save} style={btnPrimary("#f0c040")}>Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
