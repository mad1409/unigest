import { useState, useEffect } from "react";
import { api } from "../../api";

export default function GestionSites() {
  const [sites,   setSites]   = useState([]);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ nom:"", adresse:"", tel:"" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger() {
    try {
      const r = await api.getSites();
      setSites(Array.isArray(r) ? r : []);
    } catch(e) { console.error(e); }
  }

  function openNew() {
    setForm({ nom:"", adresse:"", tel:"" });
    setEditing(null);
    setModal(true);
  }

  function openEdit(s) {
    setForm({ nom:s.nom, adresse:s.adresse||"", tel:s.tel||"" });
    setEditing(s.id);
    setModal(true);
  }

  async function save() {
    if (!form.nom) return;
    setLoading(true);
    try {
      if (editing) await api.updateSite(editing, form);
      else         await api.createSite(form);
      await charger();
      setModal(false);
    } catch(e) { alert(e.message); }
    setLoading(false);
  }

  async function del(id) {
    if (!confirm("Supprimer ce site ? Les étudiants liés seront déliés.")) return;
    try { await api.deleteSite(id); await charger(); }
    catch(e) { alert(e.message); }
  }

  async function toggleActif(s) {
    try { await api.updateSite(s.id, {...s, actif: !s.actif}); await charger(); }
    catch(e) { alert(e.message); }
  }

  const inp = {
    width:"100%", boxSizing:"border-box",
    background:"rgba(255,255,255,0.05)",
    border:"1px solid var(--border)",
    borderRadius:9, padding:"11px 14px",
    color:"var(--text)", fontSize:13, outline:"none",
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Gestion des Sites
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
            {sites.length} site(s) enregistré(s)
          </p>
        </div>
        <button onClick={openNew} style={{
          background:"#f0c040",border:"none",borderRadius:9,
          padding:"10px 22px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",
        }}>+ Ajouter un site</button>
      </div>

      {sites.length === 0 ? (
        <div style={{
          textAlign:"center",padding:"60px",color:"var(--text3)",
          background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)",
        }}>
          
          <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Aucun site configuré</div>
          <div style={{fontSize:13}}>Ajoutez les sites de votre établissement</div>
          <button onClick={openNew} style={{
            marginTop:20,background:"#f0c040",border:"none",borderRadius:9,
            padding:"10px 22px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",
          }}>+ Ajouter le premier site</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {sites.map(s => (
            <div key={s.id} style={{
              background:"var(--bg2)",
              border:"1px solid "+(s.actif?"var(--border)":"rgba(239,68,68,0.2)"),
              borderRadius:14,padding:"20px",
              borderTop:"3px solid "+(s.actif?"#f0c040":"#ef4444"),
              opacity:s.actif?1:0.7,
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{fontWeight:800,fontSize:16,color:"#f0c040"}}>{s.nom}</div>
                <span style={{
                  background:s.actif?"rgba(52,211,153,0.15)":"rgba(239,68,68,0.15)",
                  border:"1px solid "+(s.actif?"rgba(52,211,153,0.3)":"rgba(239,68,68,0.3)"),
                  borderRadius:6,padding:"2px 10px",fontSize:11,
                  color:s.actif?"#34d399":"#ef4444",fontWeight:700,
                }}>{s.actif?"Actif":"Inactif"}</span>
              </div>

              {s.adresse && (
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:6}}>
                  Adresse : {s.adresse}
                </div>
              )}
              {s.tel && (
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>
                  Tel : {s.tel}
                </div>
              )}

              <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
                <button onClick={()=>openEdit(s)} style={{
                  background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.3)",
                  borderRadius:7,padding:"7px 14px",fontSize:12,color:"#38bdf8",cursor:"pointer",fontWeight:600,
                }}>Modifier</button>
                <button onClick={()=>toggleActif(s)} style={{
                  background:s.actif?"rgba(239,68,68,0.08)":"rgba(52,211,153,0.08)",
                  border:"1px solid "+(s.actif?"rgba(239,68,68,0.2)":"rgba(52,211,153,0.2)"),
                  borderRadius:7,padding:"7px 14px",fontSize:12,
                  color:s.actif?"#ef4444":"#34d399",cursor:"pointer",fontWeight:600,
                }}>{s.actif?"Désactiver":"Activer"}</button>
                <button onClick={()=>del(s.id)} style={{
                  background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",
                  borderRadius:7,padding:"7px 10px",fontSize:12,color:"#ef4444",cursor:"pointer",
                }}>X</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
          display:"flex",alignItems:"center",justifyContent:"center",
          zIndex:1000,padding:16,
        }} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div style={{
            background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:16,padding:"28px 32px",width:"100%",maxWidth:460,
          }}>
            <h3 style={{fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:20}}>
              {editing ? "Modifier le site" : "Nouveau site"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",
                  marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Nom du site *</label>
                <input style={inp} value={form.nom}
                  onChange={e=>setForm({...form,nom:e.target.value})}
                  placeholder="Ex: Direction, Ba Djelika, Korofina..."/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",
                  marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Adresse</label>
                <input style={inp} value={form.adresse}
                  onChange={e=>setForm({...form,adresse:e.target.value})}
                  placeholder="Ex: Rue 123, Bamako"/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--text3)",
                  marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Téléphone</label>
                <input style={inp} value={form.tel}
                  onChange={e=>setForm({...form,tel:e.target.value})}
                  placeholder="Ex: +223 XX XX XX XX"/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:24}}>
              <button onClick={()=>setModal(false)} style={{
                background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",
                borderRadius:10,padding:"10px 20px",color:"var(--text2)",fontSize:14,cursor:"pointer",
              }}>Annuler</button>
              <button onClick={save} disabled={!form.nom||loading} style={{
                background:"#f0c040",border:"none",borderRadius:10,
                padding:"10px 24px",color:"#1a1200",fontSize:14,fontWeight:700,cursor:"pointer",
                opacity:(!form.nom||loading)?0.5:1,
              }}>{loading?"Enregistrement...":editing?"Modifier":"Ajouter"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
