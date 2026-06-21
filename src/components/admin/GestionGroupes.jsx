
import { useState, useEffect } from "react";
import { api } from "../../api";
import SearchSelect from "../shared/SearchSelect";
import { Modal, Field, inputStyle, btnPrimary, btnSecondary, modalTitle, modalFooter } from "./GestionFilieres";

export default function GestionGroupes({ data, setData }) {
  const [filterFiliere, setFilterFiliere] = useState("all");
  const [sites,  setSites]  = useState([]);

  useEffect(() => {
    api.getAnnexes().then(r => setSites(Array.isArray(r) ? r : [])).catch(()=>{});
  }, []);

  const [modal,         setModal]         = useState(false);
  const [form,          setForm]          = useState({ nom:"", filiereId:"", type:"TD", effectif:30 });
  const [editing,       setEditing]       = useState(null);

  const groupes = data.groupes || [];
  const filtered = groupes.filter(g =>
    filterFiliere === "all" || g.filiere_id === parseInt(filterFiliere) || g.filiereId === parseInt(filterFiliere)
  );

  function openNew() {
    setForm({ nom:"", filiereId: filterFiliere !== "all" ? filterFiliere : "", type:"TD", effectif:30 });
    setEditing(null);
    setModal(true);
  }

  function openEdit(g) {
    setForm({ nom:g.nom, filiereId:g.filiere_id||g.filiereId, type:g.type, effectif:g.effectif });
    setEditing(g.id);
    setModal(true);
  }

  async function save() {
    if (!form.nom || !form.filiereId) { alert("Nom et filiere obligatoires"); return; }
    const payload = {
      nom: form.nom,
      filiereId: parseInt(form.filiereId),
      type: form.type,
      effectif: parseInt(form.effectif)||30,
    };
    try {
      if (editing) {
        await api.updateGroupe(editing, payload);
      } else {
        await api.createGroupe(payload);
      }
      await setData();
      setModal(false);
    } catch(e) { alert(e.message); }
  }

  async function deleteGroupe(id) {
    if (!confirm("Supprimer ce groupe ?")) return;
    try { await api.deleteGroupe(id); await setData(); } catch(e) { alert(e.message); }
  }

  async function autoGenerer() {
    if (filterFiliere === "all") { alert("Selectionnez une filiere d'abord"); return; }
    const filiere = data.filieres.find(f => f.id === parseInt(filterFiliere));
    if (!filiere) return;
    const effectif = filiere.effectif || 60;
    const nbTD = Math.ceil(effectif/30);
    const nbTP = Math.ceil(effectif/20);
    try {
      for (let i=1; i<=nbTD; i++) {
        await api.createGroupe({ nom:filiere.code+"-TD"+i, filiereId:filiere.id, type:"TD", effectif:30 });
      }
      for (let i=1; i<=nbTP; i++) {
        await api.createGroupe({ nom:filiere.code+"-TP"+i, filiereId:filiere.id, type:"TP", effectif:20 });
      }
      await setData();
    } catch(e) { alert(e.message); }
  }

  const typeColor = { TD:"#38bdf8", TP:"#34d399", Cours:"#f0c040" };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:"#a78bfa" }}>
            Groupes TD / TP
          </h2>
          <p style={{ color:"var(--text2)", fontSize:13, marginTop:5 }}>
            {filtered.length} groupe(s)
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={autoGenerer} style={{
            background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)",
            borderRadius:8, padding:"10px 18px", color:"#a78bfa", fontWeight:700, fontSize:13, cursor:"pointer",
          }}>
            Auto-generer
          </button>
          <button onClick={openNew} style={btnPrimary("#a78bfa")}>+ Ajouter groupe</button>
        </div>
      </div>

      {/* Filtre filière */}
      <div style={{
        background:"var(--bg2)", border:"1px solid var(--border)",
        borderRadius:12, padding:"14px 18px", marginBottom:20,
      }}>
        <SearchSelect
          value={filterFiliere}
          onChange={v => setFilterFiliere(v)}
          options={data.filieres.map(f=>({ value:String(f.id), label:f.code+" — "+f.name }))}
          allLabel="Toutes les filieres"
          placeholder="Filtrer par filiere..."
          color="#a78bfa"
        />
      </div>

      {/* Grille groupes */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px", color:"var(--text3)" }}>
          Aucun groupe — utilisez "Auto-generer" ou "Ajouter groupe"
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {filtered.map(g => {
            const fil = data.filieres.find(f => f.id === (g.filiere_id||g.filiereId));
            const tc  = typeColor[g.type] || "#94a3b8";
            return (
              <div key={g.id} style={{
                background:"var(--bg2)", border:"1px solid var(--border)",
                borderRadius:12, padding:"16px",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:tc }}>{g.nom}</div>
                  <span style={{
                    background:tc+"18", border:"1px solid "+tc+"35",
                    borderRadius:5, padding:"2px 8px", fontSize:11, color:tc, fontWeight:700,
                  }}>{g.type}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--text2)", marginBottom:4 }}>
                  {fil?.code} — {fil?.name}
                </div>
                <div style={{ fontSize:12, color:"var(--text3)", marginBottom:12 }}>
                  Effectif : {g.effectif} etudiants
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => openEdit(g)} style={{
                    flex:1, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)",
                    borderRadius:7, padding:"6px", fontSize:12, color:"#38bdf8", cursor:"pointer",
                  }}>Modifier</button>
                  <button onClick={() => deleteGroupe(g.id)} style={{
                    background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                    borderRadius:7, padding:"6px 10px", fontSize:12, color:"#ef4444", cursor:"pointer",
                  }}>X</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 style={modalTitle("#a78bfa")}>{editing ? "Modifier groupe" : "Nouveau groupe"}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label="Site">
              <select style={inputStyle} value={form.siteId||""}
                onChange={e=>setForm({...form,siteId:e.target.value})}>
                <option value="">-- Choisir un site --</option>
                {sites.map(s=>(
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </Field>
          <Field label="Nom du groupe *">
              <input style={inputStyle} value={form.nom}
                onChange={e => setForm({...form, nom:e.target.value})}
                placeholder="ex: INFO-L1-TD1"/>
            </Field>
            <Field label="Filiere *">
              <SearchSelect
                value={String(form.filiereId)}
                onChange={v => setForm({...form, filiereId:v})}
                options={data.filieres.map(f=>({ value:String(f.id), label:f.code+" — "+f.name, sub:f.cycle }))}
                placeholder="Choisir une filiere..."
                color="#a78bfa"
              />
            </Field>
            <Field label="Type *">
              <SearchSelect
                value={form.type}
                onChange={v => setForm({...form, type:v})}
                options={[{value:"TD",label:"TD — Travaux Diriges"},{value:"TP",label:"TP — Travaux Pratiques"},{value:"Cours",label:"Cours"}]}
                placeholder="Choisir un type..."
                color="#a78bfa"
              />
            </Field>
            <Field label="Effectif max">
              <input type="number" style={inputStyle} value={form.effectif}
                onChange={e => setForm({...form, effectif:e.target.value})}
                min={1} max={200}/>
            </Field>
          </div>
          <div style={modalFooter}>
            <button onClick={() => setModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={save} style={btnPrimary("#a78bfa")}>
              {editing ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
