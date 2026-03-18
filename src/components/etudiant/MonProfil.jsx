
import { api } from '../../api';
import { useState } from "react";
import ChangerMotDePasse from "../shared/ChangerMotDePasse";

export default function MonProfil({ user, etudiant, data, setData }) {
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState({
    name:  etudiant?.name  || "",
    email: etudiant?.email || "",
    tel:   etudiant?.tel   || "",
  });
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  if (!etudiant) return null;

  const filiereId = etudiant.filiereId || etudiant.filiere_id;
  const filiere   = data.filieres.find(f => f.id === filiereId);
  const initials  = (etudiant.name||"").split(" ").map(p=>p[0]?.toUpperCase()||"").join("").slice(0,2);

  async function saveProfile() {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await api.updateEtudiant(etudiant.id, {
        name:            form.name.trim(),
        email:           form.email.trim(),
        tel:             form.tel.trim(),
        filiereId:       filiereId,
        anneeAcademique: etudiant.anneeAcademique || etudiant.annee_academique,
        session:         etudiant.session,
        matricule:       etudiant.matricule,
      });
      await setData();
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { alert(e.message); }
    finally { setLoading(false); }
  }

  const inp = {
    width:"100%", background:"rgba(255,255,255,0.05)",
    border:"1px solid rgba(167,139,250,0.3)", borderRadius:8,
    padding:"10px 12px", color:"var(--text)", fontSize:14,
    outline:"none", boxSizing:"border-box",
  };
  const lbl = t => (
    <label style={{display:"block",fontSize:11,fontWeight:600,letterSpacing:1,
      textTransform:"uppercase",color:"var(--text3)",marginBottom:6}}>{t}</label>
  );

  return (
    <div>
      <h2 style={{fontSize:24,fontWeight:700,color:"#a78bfa",marginBottom:24}}>Mon Profil</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>

        {/* Carte infos */}
        <div style={{background:"var(--bg2)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:"24px 28px"}}>

          {/* Avatar */}
          <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:24}}>
            <div style={{
              width:60,height:60,borderRadius:"50%",
              background:"rgba(167,139,250,0.12)",border:"2px solid rgba(167,139,250,0.35)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,fontWeight:700,color:"#a78bfa",flexShrink:0,
            }}>{initials}</div>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:"#a78bfa"}}>{etudiant.name}</div>
              <div style={{color:"var(--text3)",fontSize:12,marginTop:3,fontFamily:"monospace"}}>{etudiant.matricule}</div>
            </div>
          </div>

          {saved && (
            <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",
              borderRadius:8,padding:"8px 12px",color:"#34d399",fontSize:13,marginBottom:16}}>
              Profil mis a jour avec succes
            </div>
          )}

          {editMode ? (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[["Nom complet","name","text","Votre nom"],["Email","email","email","votre@email.com"],["Telephone","tel","tel","+223 XX XX XX XX"]].map(([label,field,type,ph]) => (
                <div key={field}>
                  {lbl(label)}
                  <input type={type} value={form[field]}
                    onChange={e=>setForm({...form,[field]:e.target.value})}
                    placeholder={ph} style={inp}/>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button onClick={saveProfile} disabled={loading} style={{
                  flex:1,background:"#a78bfa",border:"none",borderRadius:8,
                  padding:"10px",color:"#fff",fontWeight:700,cursor:"pointer",
                }}>{loading?"Enregistrement...":"Enregistrer"}</button>
                <button onClick={()=>setEditMode(false)} style={{
                  flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
                  borderRadius:8,padding:"10px",color:"var(--text2)",cursor:"pointer",
                }}>Annuler</button>
              </div>
            </div>
          ) : (
            <>
              {[
                ["Email",      etudiant.email],
                ["Telephone",  etudiant.tel],
                ["Filiere",    filiere?.name],
                ["Cycle",      filiere?.cycle],
                ["Session",    etudiant.session==="soir"?"Cours du Soir":"Cours du Jour"],
                ["Annee",      etudiant.anneeAcademique||etudiant.annee_academique],
              ].map(([k,v]) => (
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{color:"var(--text2)",fontSize:13}}>{k}</span>
                  <span style={{color:v?"var(--text)":"var(--text3)",fontSize:13,fontWeight:v?500:400}}>
                    {v||"Non renseigne"}
                  </span>
                </div>
              ))}
              <button onClick={()=>setEditMode(true)} style={{
                marginTop:18,width:"100%",background:"rgba(167,139,250,0.1)",
                border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"10px",
                color:"#a78bfa",fontWeight:600,cursor:"pointer",fontSize:14,
              }}>Modifier le profil</button>
            </>
          )}
        </div>

        {/* Changer MDP */}
        <ChangerMotDePasse user={user} data={data} setData={setData} color="#a78bfa"/>
      </div>
    </div>
  );
}
