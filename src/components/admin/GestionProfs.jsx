
import { useState, useMemo } from "react";
import { api } from "../../api";
import SearchSelect from "../shared/SearchSelect";
import {
  Modal, Field, inputStyle, btnSecondary,
  btnPrimary, modalTitle, modalFooter,
} from "./GestionFilieres";

const initForm = { name:"", tel:"", email:"", ueIds:[], id:null };

export default function GestionProfs({ data, setData }) {
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState(initForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [searchUE, setSearchUE] = useState("");

  const filtered = useMemo(() =>
    (data.professeurs||[]).filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email||"").toLowerCase().includes(search.toLowerCase()) ||
      (p.tel||"").includes(search)
    ), [data.professeurs, search]
  );

  function openNew() {
    setForm(initForm);
    setMsg(null);
    setSearchUE("");
    setModal(true);
  }

  function openEdit(p) {
    setForm({ id:p.id, name:p.name, tel:p.tel||"", email:p.email||"", ueIds:p.matieres||p.ueIds||[] });
    setMsg(null);
    setSearchUE("");
    setModal(true);
  }

  function toggleUE(id) {
    setForm(f => ({
      ...f,
      ueIds: f.ueIds.includes(id) ? f.ueIds.filter(x=>x!==id) : [...f.ueIds, id],
    }));
  }

  async function save() {
    if (!form.name.trim()) { setMsg({type:"error",text:"Le nom est obligatoire."}); return; }
    setLoading(true);
    try {
      const payload = { name:form.name.trim(), tel:form.tel, email:form.email, matieres:form.ueIds };
      if (form.id) {
        await api.updateProf(form.id, payload);
      } else {
        await api.createProf(payload);
      }
      await setData();
      setModal(false);
      setMsg(null);
    } catch(e) {
      setMsg({type:"error", text:e.message});
    } finally {
      setLoading(false);
    }
  }

  async function deleteProf(id) {
    if (!confirm("Supprimer cet enseignant ?")) return;
    try {
      await api.deleteProf(id);
      await setData();
    } catch(e) { alert(e.message); }
  }

  const inp = {
    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)",
    borderRadius:8, padding:"9px 12px", color:"var(--text)",
    fontSize:13, outline:"none", width:"100%", boxSizing:"border-box",
  };

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#34d399"}}>
            Corps Enseignant
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
            {filtered.length} / {(data.professeurs||[]).length} enseignant(s)
          </p>
        </div>
        <button onClick={openNew} style={btnPrimary("#34d399")}>+ Ajouter Enseignant</button>
      </div>

      {/* Barre de recherche */}
      <div style={{
        background:"var(--bg2)",border:"1px solid var(--border)",
        borderRadius:12,padding:"14px 18px",marginBottom:20,
        display:"flex",gap:10,alignItems:"center",
      }}>
        <div style={{position:"relative",flex:1}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
            style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, telephone..."
            style={{...inp,paddingLeft:32}}/>
        </div>
        {search && (
          <button onClick={()=>setSearch("")} style={{
            background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
            borderRadius:8,padding:"8px 14px",color:"var(--text3)",fontSize:12,cursor:"pointer",
          }}>Effacer</button>
        )}
      </div>

      {/* Grille enseignants */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"var(--text3)"}}>
          {search ? "Aucun enseignant ne correspond à la recherche" : "Aucun enseignant enregistré"}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {filtered.map(p => {
            const initials = p.name.split(" ").slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("");
            const ueIds = p.matieres || p.ueIds || [];
            const user = (data.users||[]).find(u=>u.prof_id===p.id||u.profId===p.id);
            return (
              <div key={p.id} style={{
                background:"var(--bg2)",border:"1px solid var(--border)",
                borderRadius:14,padding:"18px",
              }}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{
                    width:48,height:48,borderRadius:"50%",
                    background:"rgba(52,211,153,0.12)",border:"2px solid rgba(52,211,153,0.3)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:16,fontWeight:700,color:"#34d399",flexShrink:0,
                  }}>{initials}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:"#34d399",marginBottom:4}}>
                      {p.name}
                    </div>
                    {p.email && <div style={{color:"var(--text2)",fontSize:12,marginBottom:2}}>{p.email}</div>}
                    {p.tel   && <div style={{color:"var(--text2)",fontSize:12,marginBottom:6}}>{p.tel}</div>}
                    {user && (
                      <div style={{fontSize:11,color:"var(--text3)",marginBottom:8}}>
                        Login : <span style={{color:"#38bdf8",fontFamily:"monospace"}}>{user.id}</span>
                      </div>
                    )}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                      {ueIds.map(uid => {
                        const ue = (data.ues||[]).find(u=>u.id===uid);
                        return ue ? (
                          <span key={uid} style={{
                            background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.2)",
                            borderRadius:6,padding:"2px 9px",fontSize:11,color:"#38bdf8",
                          }}>{ue.code}</span>
                        ) : null;
                      })}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>openEdit(p)} style={{
                        background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",
                        borderRadius:7,padding:"5px 12px",fontSize:12,color:"#38bdf8",cursor:"pointer",
                      }}>Modifier</button>
                      <button onClick={()=>deleteProf(p.id)} style={{
                        background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                        borderRadius:7,padding:"5px 12px",fontSize:12,color:"#ef4444",cursor:"pointer",
                      }}>Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(false)}>
          <h3 style={modalTitle("#34d399")}>{form.id ? "Modifier enseignant" : "Nouvel enseignant"}</h3>
          {msg?.type==="error" && (
            <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:8,padding:"10px 14px",marginBottom:14,color:"#ef4444",fontSize:13}}>
              {msg.text}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Field label="Nom complet *">
              <input style={inputStyle} value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})}
                placeholder="ex: Dr. Konan Yves"/>
            </Field>
            <Field label="Telephone">
              <input style={inputStyle} value={form.tel}
                onChange={e=>setForm({...form,tel:e.target.value})}
                placeholder="+223 07 00 11 22"/>
            </Field>
            <Field label="Email">
              <input style={inputStyle} value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="prof@universite.edu"/>
            </Field>
            <Field label="UE enseignees">
              {/* UEs sélectionnées */}
              {form.ueIds.length > 0 && (
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                  {form.ueIds.map(id => {
                    const ue = (data.ues||[]).find(u=>u.id===id);
                    return ue ? (
                      <span key={id} style={{
                        background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",
                        borderRadius:6,padding:"2px 8px",fontSize:11,color:"#34d399",
                        display:"flex",alignItems:"center",gap:4,
                      }}>
                        {ue.code}
                        <button onClick={()=>toggleUE(id)} style={{background:"none",border:"none",cursor:"pointer",color:"#34d399",fontSize:14,lineHeight:1,padding:0}}>×</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {/* Barre de recherche */}
              <div style={{position:"relative",marginBottom:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
                  style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={searchUE} onChange={e=>setSearchUE(e.target.value)}
                  placeholder="Rechercher une UE..."
                  style={{
                    width:"100%",boxSizing:"border-box",
                    background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
                    borderRadius:8,padding:"8px 10px 8px 28px",
                    color:"var(--text)",fontSize:12,outline:"none",
                  }}/>
              </div>
              {/* Liste résultats */}
              {searchUE && (
                <div style={{border:"1px solid var(--border)",borderRadius:8,maxHeight:160,overflowY:"auto",background:"var(--bg2)"}}>
                  {(data.ues||[]).filter(u=>(u.code+u.intitule).toLowerCase().includes(searchUE.toLowerCase())).map(ue=>{
                    const selected = form.ueIds.includes(ue.id);
                    return (
                      <div key={ue.id} onClick={()=>{toggleUE(ue.id);setSearchUE("");}} style={{
                        display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",
                        background:selected?"rgba(52,211,153,0.08)":"transparent",
                        borderBottom:"1px solid var(--border)",
                      }}>
                        <div style={{
                          width:14,height:14,borderRadius:3,flexShrink:0,
                          background:selected?"#34d399":"transparent",
                          border:selected?"none":"1px solid var(--border)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                          {selected&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div>
                          <span style={{fontSize:12,fontWeight:700,color:selected?"#34d399":"var(--text)"}}>{ue.code}</span>
                          <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{ue.intitule}</span>
                        </div>
                        <span style={{marginLeft:"auto",fontSize:10,color:"#38bdf8"}}>S{ue.semestre}</span>
                      </div>
                    );
                  })}
                  {(data.ues||[]).filter(u=>(u.code+u.intitule).toLowerCase().includes(searchUE.toLowerCase())).length===0&&(
                    <div style={{padding:"12px",textAlign:"center",color:"var(--text3)",fontSize:12}}>Aucune UE trouvee</div>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div style={modalFooter}>
            <button onClick={()=>setModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={save} disabled={loading} style={btnPrimary("#34d399")}>
              {loading ? "Enregistrement..." : (form.id ? "Modifier" : "Ajouter")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
