
import { api } from '../../api';
import { useState } from "react";

export default function ChangerMotDePasse({ user, data, setData, color }) {
  const [form,    setForm]    = useState({ ancien:"", nouveau:"", confirmer:"" });
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (form.nouveau.length < 6) {
      setMsg({ type:"error", text:"Le nouveau mot de passe doit faire au moins 6 caracteres." });
      return;
    }
    if (form.nouveau !== form.confirmer) {
      setMsg({ type:"error", text:"Les deux mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(user.id, form.ancien, form.nouveau);
      setMsg({ type:"success", text:"Mot de passe modifie avec succes !" });
      setForm({ ancien:"", nouveau:"", confirmer:"" });
      if (setData) await setData();
    } catch(e) {
      setMsg({ type:"error", text: e.message || "Erreur lors du changement de mot de passe." });
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width:"100%", background:"rgba(255,255,255,0.05)",
    border:"1px solid "+(color||"#38bdf8")+"30",
    borderRadius:9, padding:"12px 14px",
    color:"var(--text)", fontSize:14,
    outline:"none", boxSizing:"border-box",
  };
  const lbl = {
    display:"block", fontSize:11, fontWeight:600,
    letterSpacing:1, textTransform:"uppercase",
    color:"var(--text3)", marginBottom:7,
  };

  const force = form.nouveau.length === 0 ? null
    : form.nouveau.length < 6  ? { w:"25%", c:"#ef4444", t:"Trop court" }
    : form.nouveau.length < 10 ? { w:"60%", c:"#f59e0b", t:"Correct"    }
    : { w:"100%", c:"#34d399", t:"Fort" };

  return (
    <div style={{
      background:"var(--bg2)",
      border:"1px solid "+(color||"#38bdf8")+"20",
      borderRadius:14, padding:"24px 28px", maxWidth:480,
    }}>
      <div style={{fontSize:16,fontWeight:700,color:color||"#38bdf8",marginBottom:20}}>
        Changer le mot de passe
      </div>

      <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={lbl}>Ancien mot de passe</label>
          <input type="password" value={form.ancien} required
            onChange={e=>setForm({...form,ancien:e.target.value})}
            placeholder="Votre mot de passe actuel" style={inp}/>
        </div>

        <div style={{height:1,background:"var(--border)",margin:"2px 0"}}/>

        <div>
          <label style={lbl}>Nouveau mot de passe</label>
          <input type="password" value={form.nouveau} required
            onChange={e=>setForm({...form,nouveau:e.target.value})}
            placeholder="Minimum 6 caracteres" style={inp}/>
          {force && (
            <div style={{marginTop:8}}>
              <div style={{height:4,borderRadius:4,background:"var(--border)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,transition:"width 0.3s,background 0.3s",
                  width:force.w,background:force.c}}/>
              </div>
              <div style={{fontSize:11,marginTop:4,color:force.c}}>{force.t}</div>
            </div>
          )}
        </div>

        <div>
          <label style={lbl}>Confirmer le nouveau mot de passe</label>
          <input type="password" value={form.confirmer} required
            onChange={e=>setForm({...form,confirmer:e.target.value})}
            placeholder="Repeter le nouveau mot de passe"
            style={{
              ...inp,
              border: form.confirmer.length > 0
                ? (form.confirmer===form.nouveau?"1px solid #34d39950":"1px solid #ef444450")
                : inp.border,
            }}/>
          {form.confirmer.length > 0 && (
            <div style={{fontSize:11,marginTop:5,color:form.confirmer===form.nouveau?"#34d399":"#ef4444"}}>
              {form.confirmer===form.nouveau ? "Les mots de passe correspondent" : "Ne correspond pas"}
            </div>
          )}
        </div>

        {msg && (
          <div style={{
            background:msg.type==="success"?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.1)",
            border:"1px solid "+(msg.type==="success"?"rgba(52,211,153,0.3)":"rgba(239,68,68,0.3)"),
            borderRadius:8, padding:"10px 14px",
            color:msg.type==="success"?"#34d399":"#ef4444", fontSize:13,
          }}>{msg.text}</div>
        )}

        <button type="submit" disabled={loading} style={{
          background:"linear-gradient(135deg,"+(color||"#38bdf8")+"cc,"+(color||"#38bdf8")+")",
          border:"none", borderRadius:9, padding:"12px",
          color:(color==="#f0c040")?"#1a1200":"#fff",
          fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer",
          opacity:loading?0.7:1, marginTop:4,
        }}>
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}
