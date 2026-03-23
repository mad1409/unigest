
import React, { useState } from "react";
import { api } from "../../api";
import SearchSelect from "../shared/SearchSelect";
import { analyserConflits } from "../../utils/conflits";
import { Modal, Field, inputStyle, btnPrimary, btnSecondary, modalTitle, modalFooter, Th, Td } from "./GestionFilieres";

const JOURS    = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const TYPES    = ["Cours","TD","TP","Amphi","Examen","Autre"];
const TYPES_SANS_SALLE = ["Cours","Amphi"];

// ── Composant recherche prof ──────────────────────────
function ProfSearch({ value, onChange, professeurs }) {
  const [query, setQuery]   = React.useState(value || "");
  const [open,  setOpen]    = React.useState(false);
  const [active,setActive]  = React.useState(-1);
  const ref = React.useRef();

  React.useEffect(() => { setQuery(value || ""); }, [value]);
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const suggestions = (professeurs||[]).filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  function select(p) { setQuery(p.name); onChange(p.name); setOpen(false); setActive(-1); }
  function clear()   { setQuery(""); onChange(""); setOpen(false); }

  function handleKey(e) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a+1, suggestions.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a-1, 0)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); select(suggestions[active]); }
    if (e.key === "Escape") setOpen(false);
  }

  const inp2 = {
    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)",
    borderRadius:8, padding:"9px 36px 9px 12px", color:"var(--text)",
    fontSize:14, outline:"none", width:"100%", boxSizing:"border-box",
  };

  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{position:"relative"}}>
        <input value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Rechercher un enseignant..."
          style={inp2}
        />
        {query && (
          <button onClick={clear} style={{
            position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:16, padding:2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:999,
          background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.4)", maxHeight:280, overflowY:"auto",
        }}>
          {suggestions.map((p, i) => (
            <div key={p.id} onMouseDown={() => select(p)} style={{
              padding:"10px 14px", cursor:"pointer",
              background: i === active ? "rgba(56,189,248,0.12)" : "transparent",
              borderBottom:"1px solid var(--border)",
              display:"flex", alignItems:"center", gap:10,
            }} onMouseEnter={() => setActive(i)}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, color:"#38bdf8", flexShrink:0,
              }}>
                {p.name.split(" ").slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")}
              </div>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:"var(--text)"}}>{p.name}</div>
                {p.tel && <div style={{fontSize:11, color:"var(--text3)"}}>{p.tel}</div>}
              </div>
            </div>
          ))}
          {query && !professeurs.find(p => p.name.toLowerCase() === query.toLowerCase()) && (
            <div onMouseDown={() => { onChange(query); setOpen(false); }} style={{
              padding:"10px 14px", cursor:"pointer", borderTop:"1px solid var(--border)",
              fontSize:12, color:"var(--text3)", fontStyle:"italic",
            }}>
              Utiliser "{query}" (nom libre)
            </div>
          )}
        </div>
      )}
      {open && suggestions.length === 0 && query && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:999,
          background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10,
          padding:"12px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{fontSize:12, color:"var(--text3)", marginBottom:8}}>Aucun enseignant trouve</div>
          <div onMouseDown={() => { onChange(query); setOpen(false); }} style={{
            fontSize:12, color:"#38bdf8", cursor:"pointer", fontStyle:"italic",
          }}>Utiliser "{query}" comme nom libre</div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────
export default function GestionEDT({ data, setData }) {
  const [selectedEDT, setSelectedEDT] = useState(null);
  const [sites,        setSites]        = useState([]);
  const [filterSite,   setFilterSite]   = useState("all");

  useEffect(() => {
    api.getSites().then(r => setSites(Array.isArray(r) ? r : [])).catch(()=>{});
  }, []);
  const [slotModal,   setSlotModal]   = useState(false);
  const [vueGrille,   setVueGrille]   = useState(false);
  const [edtModal,    setEdtModal]    = useState(false);
  const [editSlot,    setEditSlot]    = useState(null);
  const [conflits,    setConflits]    = useState([]);
  const [filterJour,  setFilterJour]  = useState("all");
  const [filterType,  setFilterType]  = useState("all");

  const initSlot = {
    jour:"Lundi", heureDebut:"08:00", heureFin:"10:00",
    matiere:"", salle:"", type:"Cours", session:"jour", siteId:"",
    profNom:"", profTel:"", groupe:"", tronc:false,
  };
  const [slotForm, setSlotForm] = useState(initSlot);
  const [edtForm,      setEdtForm]      = useState({ name:"", filiereIds:[], troncCommun:false });
  const [searchEDTFil, setSearchEDTFil] = useState("");
  const [searchSlotFil, setSearchSlotFil] = useState("");

  const edts    = data.emploisDuTemps || [];
  const groupes = data.groupes || [];
  const tousSlots = edts.flatMap(e => (e.slots||[]).map(s => ({ ...s, edtId: e.id })));

  const conflitColor = { salle:"#f59e0b", prof:"#ef4444", filiere:"#a78bfa" };
  const inp = { ...inputStyle, marginBottom: 0 };

  function openSlot(slot = null) {
    setConflits([]);
    if (slot) {
      setEditSlot(slot.id);
      setSlotForm({ ...initSlot, ...slot });
    } else {
      setEditSlot(null);
      setSlotForm(initSlot);
    }
    setSlotModal(true);
  }

  function checkConflits(form) {
    const c = analyserConflits(tousSlots, form, editSlot);
    setConflits(c);
    return c;
  }

  async function saveSlot() {
    if (!slotForm.jour || !slotForm.matiere) return;
    const payload = {
      jour: slotForm.jour, session: slotForm.session,
      heureDebut: slotForm.heureDebut, heureFin: slotForm.heureFin,
      matiere: slotForm.matiere, type: slotForm.type,
      salle: slotForm.salle, groupe: slotForm.groupe, siteId: slotForm.siteId||null,
      profNom: slotForm.profNom, profTel: slotForm.profTel,
      tronc: slotForm.tronc,
    };
    try {
      if (editSlot) {
        await api.updateSlot(selectedEDT.id, editSlot, payload);
      } else {
        await api.createSlot(selectedEDT.id, payload);
      }
      await setData();
      // Rafraichir selectedEDT
      const edtRefresh = await api.getEDT();
      const updated = edtRefresh.find(e => e.id === selectedEDT.id);
      if (updated) setSelectedEDT({
        ...updated,
        filiereIds: updated.filiere_ids || updated.filiereIds || [],
        slots: (updated.slots||[]).map(s => ({
          ...s,
          heureDebut: s.heure_debut || s.heureDebut || "",
          heureFin:   s.heure_fin   || s.heureFin   || "",
          profNom:    s.prof_nom    || s.profNom     || "",
        })),
      });
      setSlotModal(false);
    } catch(e) { alert(e.message); }
  }

  async function deleteSlot(slotId) {
    if (!confirm("Supprimer ce creneau ?")) return;
    try { await api.deleteSlot(selectedEDT.id, slotId); await setData(); } catch(e) { alert(e.message); }
  }

  async function saveEDT() {
    if (!edtForm.name) return;
    try {
      const payload = { name:edtForm.name, filiereIds:edtForm.filiereIds||[] };
      if (edtForm.id) {
        await api.updateEDT(edtForm.id, payload);
        await setData();
      } else {
        const nouveau = await api.createEDT(payload);
        await setData();
        // Sélectionner automatiquement le nouvel EDT
        if (nouveau && nouveau.id) setSelectedEDT({...nouveau, slots:[]});
      }
      setEdtModal(false);
    } catch(e) { alert(e.message); }
  }

  async function deleteEDT(id) {
    if (!confirm("Supprimer cet EDT ?")) return;
    try { await api.deleteEDT(id); await setData(); setSelectedEDT(null); } catch(e) { alert(e.message); }
  }

  async function dupliquerEDT(edt) {
    try {
      await api.createEDT({ name: edt.name + " (copie)", filiereIds: edt.filiereIds||[] });
      await setData();
    } catch(e) { alert(e.message); }
  }

  const slotsFiltres = (selectedEDT?.slots || []).filter(s =>
    (filterJour === "all" || s.jour === filterJour) &&
    (filterType === "all" || s.type === filterType)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:"#f0c040" }}>
            Emplois du temps
          </h2>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:5 }}>
            {edts.length} EDT — {tousSlots.length} creneaux
          </p>
        </div>
        <button onClick={() => { setEdtForm({ name:"", filiereIds:[] }); setEdtModal(true); }} style={btnPrimary("#f0c040")}>
          + Nouvel EDT
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {/* Liste EDT */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {edts.map(edt => {
            const fils = (edt.filiereIds||edt.filiere_ids||[]).map(id => data.filieres.find(f=>f.id===id)?.code).filter(Boolean);
            const isActive = selectedEDT?.id === edt.id;
            return (
              <div key={edt.id} onClick={() => setSelectedEDT(edt)} style={{
                background: isActive ? "rgba(240,192,64,0.1)" : "var(--bg2)",
                border: isActive ? "1px solid rgba(240,192,64,0.5)" : "1px solid var(--border)",
                borderRadius:12, padding:"14px 16px", cursor:"pointer",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:isActive?"#f0c040":"var(--text)" }}>{edt.name}</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                      {fils.map(f => (
                        <span key={f} style={{
                          background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.25)",
                          borderRadius:5, padding:"1px 7px", fontSize:11, color:"#38bdf8",
                        }}>{f}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>
                      {(edt.slots||[]).length} creneau(x)
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={e => { e.stopPropagation(); setEdtForm({...edt, filiereIds:edt.filiereIds||edt.filiere_ids||[]}); setEdtModal(true); }} style={{
                      background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)",
                      borderRadius:6, padding:"4px 8px", fontSize:11, color:"#38bdf8", cursor:"pointer",
                    }}>Edit</button>
                    <button onClick={e => { e.stopPropagation(); dupliquerEDT(edt); }} style={{
                      background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)",
                      borderRadius:6, padding:"4px 8px", fontSize:11, color:"#34d399", cursor:"pointer",
                    }}>Copier</button>
                    <button onClick={e => { e.stopPropagation(); deleteEDT(edt.id); }} style={{
                      background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                      borderRadius:6, padding:"4px 8px", fontSize:11, color:"#ef4444", cursor:"pointer",
                    }}>X</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creneaux */}
        {/* Filtre site */}
        <select style={{
          background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
          borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:12,
          outline:"none",marginBottom:12,width:"100%",
        }} value={filterSite} onChange={e=>setFilterSite(e.target.value)}>
          <option value="all">Tous les sites</option>
          {sites.map(s=>(
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </select>

        {selectedEDT ? (
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#f0c040" }}>{selectedEDT.name}</div>
              <button onClick={() => openSlot()} style={btnPrimary("#f0c040")}>+ Ajouter creneau</button>
            </div>

            {/* Boutons vue */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              <button onClick={()=>setVueGrille(false)} style={{
                padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
                background:!vueGrille?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
                border:!vueGrille?"1px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
                color:!vueGrille?"#f0c040":"var(--text3)",
              }}>Liste</button>
              <button onClick={()=>setVueGrille(true)} style={{
                padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",
                background:vueGrille?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
                border:vueGrille?"1px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
                color:vueGrille?"#f0c040":"var(--text3)",
              }}>Grille</button>
            </div>

            {/* Filtres */}
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <SearchSelect value={filterJour} onChange={v=>setFilterJour(v)}
                options={JOURS.map(j=>({value:j,label:j}))} allLabel="Tous les jours"
                placeholder="Jour..." style={{minWidth:140}} color="#f0c040"/>
              <SearchSelect value={filterType} onChange={v=>setFilterType(v)}
                options={TYPES.map(t=>({value:t,label:t}))} allLabel="Tous les types"
                placeholder="Type..." style={{minWidth:130}} color="#a78bfa"/>
            </div>

            {vueGrille ? (
              <GrilleHoraire slots={slotsFiltres} onEdit={openSlot} onDelete={deleteSlot}/>
            ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(255,255,255,0.04)" }}>
                    {["Jour","Horaire","Matiere","Salle","Type","Enseignant","Groupe","Actions"].map(h => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slotsFiltres.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding:"30px", textAlign:"center", color:"var(--text3)" }}>
                      Aucun creneau
                    </td></tr>
                  ) : JOURS.flatMap(jour =>
                    slotsFiltres.filter(s => s.jour === jour).map(s => {
                      const tc = { Cours:"#38bdf8", TD:"#a78bfa", TP:"#34d399", Amphi:"#f0c040", Examen:"#fb923c", Autre:"#94a3b8" };
                      const c  = conflits.find(cf => cf.slotId === s.id);
                      return (
                        <tr key={s.id} style={{ borderBottom:"1px solid var(--border)" }}>
                          <Td><span style={{ color:"#f0c040", fontWeight:700 }}>{s.jour}</span></Td>
                          <Td style={{ fontSize:12, color:"var(--text2)" }}>{s.heure_debut||s.heureDebut}–{s.heure_fin||s.heureFin}</Td>
                          <Td>
                            <div style={{ fontWeight:600, color:"var(--text)", fontSize:13 }}>{s.matiere}</div>
                            {s.tronc && <div style={{ fontSize:10, color:"#34d399" }}>Tronc commun</div>}
                          </Td>
                          <Td><span style={{ fontFamily:"monospace", fontSize:12 }}>{s.salle||"—"}</span></Td>
                          <Td>{sites.find(st=>st.id===s.site_id)?.nom||"—"}</Td>
                          <Td>
                            <span style={{
                              background:(tc[s.type]||"#94a3b8")+"18",
                              border:"1px solid "+(tc[s.type]||"#94a3b8")+"35",
                              borderRadius:5, padding:"2px 9px", fontSize:11,
                              color:tc[s.type]||"#94a3b8", fontWeight:700,
                            }}>{s.type}</span>
                          </Td>
                          <Td style={{ fontSize:12, color:"var(--text2)" }}>{s.prof_nom||s.profNom||"—"}</Td>
                          <Td>
                            {(s.groupe) ? (
                              <span style={{
                                background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)",
                                borderRadius:5, padding:"2px 8px", fontSize:11, color:"#a78bfa",
                              }}>{s.groupe}</span>
                            ) : <span style={{ color:"var(--text3)", fontSize:12 }}>Tous</span>}
                          </Td>
                          <Td>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => openSlot(s)} style={{
                                background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)",
                                borderRadius:6, padding:"5px 10px", fontSize:11, color:"#38bdf8", cursor:"pointer",
                              }}>Editer</button>
                              <button onClick={() => deleteSlot(s.id)} style={{
                                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                                borderRadius:6, padding:"5px 8px", fontSize:11, color:"#ef4444", cursor:"pointer",
                              }}>X</button>
                            </div>
                          </Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        ) : (
          <div style={{
            background:"var(--bg2)", border:"1px solid var(--border)",
            borderRadius:14, padding:"60px", textAlign:"center", color:"var(--text3)",
          }}>
            Selectionnez un EDT pour voir les creneaux
          </div>
        )}
      </div>

      {/* Modal EDT */}
      {edtModal && (
        <Modal onClose={() => setEdtModal(false)}>
          <h3 style={modalTitle("#f0c040")}>{edtForm.id ? "Modifier EDT" : "Nouvel EDT"}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label="Nom de l'EDT *">
              <input style={inputStyle} value={edtForm.name}
                onChange={e => setEdtForm({...edtForm, name:e.target.value})}
                placeholder="ex: Licence 1 Informatique S1"/>
            </Field>
            <Field label="Filieres concernees">
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4 }}>
                {data.filieres.map(f => (
                  <label key={f.id} style={{
                    display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 10px",
                    borderRadius:8,
                    background:(edtForm.filiereIds||[]).includes(f.id)?"rgba(240,192,64,0.08)":"rgba(255,255,255,0.03)",
                    border:(edtForm.filiereIds||[]).includes(f.id)?"1px solid rgba(240,192,64,0.3)":"1px solid var(--border)",
                  }}>
                    <input type="checkbox"
                      checked={(edtForm.filiereIds||[]).includes(f.id)}
                      onChange={e => {
                        const ids = e.target.checked
                          ? [...(edtForm.filiereIds||[]), f.id]
                          : (edtForm.filiereIds||[]).filter(x=>x!==f.id);
                        setEdtForm({...edtForm, filiereIds:ids});
                      }}
                      style={{ accentColor:"#f0c040", width:15, height:15 }}/>
                    <span style={{ fontSize:13, color:"var(--text)" }}>{f.code} — {f.name}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <div style={modalFooter}>
            <button onClick={() => setEdtModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={saveEDT} style={btnPrimary("#f0c040")}>
              {edtForm.id ? "Modifier" : "Creer"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Slot */}
      {slotModal && (
        <Modal onClose={() => setSlotModal(false)}>
          <h3 style={modalTitle("#f0c040")}>{editSlot ? "Modifier creneau" : "Nouveau creneau"}</h3>

          {conflits.length > 0 && (
            <div style={{ marginBottom:14 }}>
              {conflits.map((c, i) => (
                <div key={i} style={{
                  background: conflitColor[c.type]+"18",
                  border: "1px solid "+conflitColor[c.type]+"40",
                  borderRadius:8, padding:"8px 12px",
                  color: conflitColor[c.type], fontSize:12, marginBottom:6,
                }}>
                  Conflit {c.type} : {c.message}
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Jour *">
              <SearchSelect value={slotForm.jour}
                onChange={v => { const f={...slotForm,jour:v}; setSlotForm(f); checkConflits(f); }}
                options={JOURS.map(j=>({value:j,label:j}))} placeholder="Choisir un jour..." color="#f0c040"/>
            </Field>
            <Field label="Session">
              <SearchSelect value={slotForm.session}
                onChange={v => setSlotForm({...slotForm,session:v})}
                options={[{value:"jour",label:"Cours du Jour"},{value:"soir",label:"Cours du Soir"}]}
                placeholder="Choisir session..." color="#fbbf24"/>
            </Field>
            <Field label="Heure debut *">
              <input type="time" style={inp} value={slotForm.heureDebut}
                onChange={e => { const f={...slotForm,heureDebut:e.target.value}; setSlotForm(f); checkConflits(f); }}/>
            </Field>
            <Field label="Heure fin *">
              <input type="time" style={inp} value={slotForm.heureFin}
                onChange={e => { const f={...slotForm,heureFin:e.target.value}; setSlotForm(f); checkConflits(f); }}/>
            </Field>
            <Field label="Matiere *">
              <input style={inp} value={slotForm.matiere}
                onChange={e => setSlotForm({...slotForm,matiere:e.target.value})}
                placeholder="ex: Mathematiques 1"/>
            </Field>
            <Field label="Type *">
              <SearchSelect value={slotForm.type}
                onChange={v => setSlotForm({...slotForm,type:v})}
                options={TYPES.map(t=>({value:t,label:t}))} placeholder="Choisir un type..." color="#a78bfa"/>
            </Field>
            <Field label="Site">
                <select style={inp} value={slotForm.siteId||""}
                  onChange={e=>setSlotForm({...slotForm,siteId:e.target.value})}>
                  <option value="">-- Choisir un site --</option>
                  {sites.map(s=>(
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </Field>
            <Field label={TYPES_SANS_SALLE.includes(slotForm.type) ? "Salle (optionnelle)" : "Salle *"}>
              <input style={inp} value={slotForm.salle}
                onChange={e => { const f={...slotForm,salle:e.target.value}; setSlotForm(f); checkConflits(f); }}
                placeholder={TYPES_SANS_SALLE.includes(slotForm.type) ? "Laisser vide si non fixee" : "ex: Salle B12"}/>
            </Field>
            <Field label="Groupe (facultatif)">
              <SearchSelect value={slotForm.groupe}
                onChange={v => { const f={...slotForm,groupe:v}; setSlotForm(f); checkConflits(f); }}
                options={(groupes).filter(g => (selectedEDT?.filiereIds||selectedEDT?.filiere_ids||[]).includes(g.filiere_id||g.filiereId)).map(g=>({
                  value:g.nom, label:g.nom, sub:g.type+" — "+g.effectif+" etu."
                }))} allLabel="Tous les etudiants" placeholder="Rechercher un groupe..." color="#38bdf8"/>
            </Field>
            <Field label="Enseignant">
              <ProfSearch value={slotForm.profNom}
                onChange={val => { const f={...slotForm,profNom:val}; setSlotForm(f); checkConflits(f); }}
                professeurs={data.professeurs}/>
            </Field>
            <Field label="Tel enseignant">
              <input style={inp} value={slotForm.profTel}
                onChange={e => setSlotForm({...slotForm,profTel:e.target.value})}
                placeholder="+223 XX XX XX XX"/>
            </Field>
          </div>

          {/* Tronc commun */}
          <div style={{marginTop:12}}>
            <button onClick={()=>setSlotForm({...slotForm,tronc:!slotForm.tronc,troncFilieres:!slotForm.tronc?[]:undefined})} style={{
              padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%",textAlign:"left",
              background:slotForm.tronc?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
              border:slotForm.tronc?"1.5px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
              color:slotForm.tronc?"#f0c040":"var(--text2)",
            }}>
              {slotForm.tronc ? "Tronc commun — Choisir les filieres" : "Ce cours est un tronc commun"}
            </button>

            {slotForm.tronc && (
              <div style={{marginTop:10,background:"rgba(240,192,64,0.04)",border:"1px solid rgba(240,192,64,0.2)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
                  Filieres concernees — {(slotForm.troncFilieres||[]).length} selectionnee(s)
                </div>

                {/* Tags selectionnés */}
                {(slotForm.troncFilieres||[]).length > 0 && (
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                    {(slotForm.troncFilieres||[]).map(id => {
                      const f = data.filieres.find(f=>f.id===id);
                      return f ? (
                        <span key={id} style={{background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",
                          borderRadius:6,padding:"2px 8px",fontSize:11,color:"#f0c040",
                          display:"flex",alignItems:"center",gap:4}}>
                          {f.code}
                          <button onClick={()=>setSlotForm({...slotForm,troncFilieres:(slotForm.troncFilieres||[]).filter(x=>x!==id)})}
                            style={{background:"none",border:"none",cursor:"pointer",color:"#f0c040",fontSize:14,lineHeight:1,padding:0}}>x</button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Boutons Tout / Aucun */}
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  <button onClick={()=>setSlotForm({...slotForm,troncFilieres:data.filieres.map(f=>f.id)})} style={{
                    padding:"3px 10px",borderRadius:5,fontSize:11,cursor:"pointer",fontWeight:600,
                    background:"rgba(240,192,64,0.1)",border:"1px solid rgba(240,192,64,0.3)",color:"#f0c040",
                  }}>Tout</button>
                  <button onClick={()=>setSlotForm({...slotForm,troncFilieres:[]})} style={{
                    padding:"3px 10px",borderRadius:5,fontSize:11,cursor:"pointer",fontWeight:600,
                    background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text3)",
                  }}>Aucun</button>
                </div>

                {/* Recherche */}
                <div style={{position:"relative",marginBottom:6}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
                    style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)"}}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input value={searchSlotFil} onChange={e=>setSearchSlotFil(e.target.value)}
                    placeholder="Rechercher..."
                    style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",
                      border:"1px solid var(--border)",borderRadius:7,padding:"6px 8px 6px 26px",
                      color:"var(--text)",fontSize:12,outline:"none"}}/>
                </div>

                {/* Liste */}
                <div style={{maxHeight:150,overflowY:"auto",border:"1px solid var(--border)",borderRadius:7}}>
                  {data.filieres
                    .filter(f=>!searchSlotFil||(f.code+f.name).toLowerCase().includes(searchSlotFil.toLowerCase()))
                    .map(f => {
                      const sel = (slotForm.troncFilieres||[]).includes(f.id);
                      return (
                        <div key={f.id} onClick={()=>{
                          const ids = sel
                            ? (slotForm.troncFilieres||[]).filter(x=>x!==f.id)
                            : [...(slotForm.troncFilieres||[]), f.id];
                          setSlotForm({...slotForm, troncFilieres:ids});
                        }} style={{
                          display:"flex",alignItems:"center",gap:8,padding:"7px 10px",cursor:"pointer",
                          background:sel?"rgba(240,192,64,0.06)":"transparent",
                          borderBottom:"1px solid var(--border)",
                        }}>
                          <div style={{width:13,height:13,borderRadius:3,flexShrink:0,
                            background:sel?"#f0c040":"transparent",
                            border:sel?"none":"1px solid var(--border)",
                            display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {sel&&<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{fontSize:12,fontWeight:sel?700:400,color:sel?"#f0c040":"var(--text)"}}>{f.code}</span>
                          <span style={{fontSize:11,color:"var(--text3)"}}>{f.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div style={modalFooter}>
            <button onClick={() => setSlotModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={saveSlot} style={btnPrimary("#f0c040")}>
              {conflits.length > 0 ? "Forcer l'enregistrement" : "Enregistrer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
