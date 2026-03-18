import ParticlesBackground from "./ParticlesBackground";

import { useState } from "react";

const ROLES = [
  { id:"admin",       label:"Administrateur", color:"#f0c040", icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id:"prof",        label:"Enseignant",     color:"#4f8ef7", icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id:"secretaire",  label:"Secretaire",     color:"#34d399", icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" },
  { id:"surveillant", label:"Surveillant",    color:"#fb923c", icon:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
];

export default function LoginStaff({ onLogin, onSuccess, parametres }) {
  const nom  = parametres?.nom_etablissement || parametres?.nomEtablissement || "UniGest";
  const logo = parametres?.logo || null;

  const [form,    setForm]    = useState({ id:"", password:"", role:"admin" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const roleActif = ROLES.find(r => r.id === form.role) || ROLES[0];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const result = await onLogin(form.id, form.password, form.role);
    setLoading(false);
    if (result.success) {
      setError(""); onSuccess(result.user);
    } else {
      setError("Identifiant ou mot de passe incorrect.");
    }
  }

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center",
      background:"transparent",
    padding:20, position:"relative", overflow:"hidden",
    }}>
      {/* Orbes animés */}
      <div  style={{position:"absolute",width:500,height:500,borderRadius:"50%",top:"-15%",right:"-10%",background:"radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 70%)",pointerEvents:"none"}}/>
      <div  style={{position:"absolute",width:400,height:400,borderRadius:"50%",bottom:"-10%",left:"-5%",background:"radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,opacity:0.15,backgroundImage:"linear-gradient(rgba(52,211,153,0.35) 1px, transparent 1px),linear-gradient(90deg, rgba(52,211,153,0.35) 1px, transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
      

      {/* Card */}
      <div style={{
        width:"100%", maxWidth:460,
        background:"rgba(255,255,255,0.05)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        borderRadius:24, padding:"40px 36px",
        border:"1px solid rgba(255,255,255,0.1)",
        boxShadow:"0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        position:"relative", zIndex:1,
      }}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          {logo ? (
            <div style={{
              width:80,height:80,borderRadius:"50%",
              background:"rgba(255,255,255,0.9)",
              margin:"0 auto 14px",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 8px 24px rgba(0,0,0,0.3)",overflow:"hidden",
            }}>
              <img src={logo} alt="Logo" style={{width:66,height:66,objectFit:"contain"}}/>
            </div>
          ) : (
            <div style={{fontSize:42,marginBottom:12}}>🏛</div>
          )}
          <div style={{fontSize:20,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{nom}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:3}}>Espace Administration</div>
        </div>

        {/* Choix rôle */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
          {ROLES.map(r => (
            <button key={r.id} onClick={()=>setForm({...form,role:r.id})} style={{
              padding:"10px 8px",borderRadius:12,cursor:"pointer",textAlign:"center",
              background:form.role===r.id?r.color+"18":"rgba(255,255,255,0.04)",
              border:form.role===r.id?"1.5px solid "+r.color+"50":"1px solid rgba(255,255,255,0.08)",
              color:form.role===r.id?r.color:"rgba(255,255,255,0.4)",
              fontWeight:form.role===r.id?700:400,fontSize:12,
              transition:"all 0.15s",
            }}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Identifiant */}
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:1.5,
              textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:7}}>
              Identifiant
            </label>
            <div style={{position:"relative"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"
                style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input value={form.id} onChange={e=>setForm({...form,id:e.target.value})}
                placeholder="Votre identifiant" required
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:12,padding:"12px 14px 12px 40px",
                  color:"#fff",fontSize:14,outline:"none",transition:"border 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor=roleActif.color+"60"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:1.5,
              textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:7}}>
              Mot de passe
            </label>
            <div style={{position:"relative"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"
                style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type={showPwd?"text":"password"} value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})}
                placeholder="••••••••••" required
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:12,padding:"12px 42px 12px 40px",
                  color:"#fff",fontSize:14,outline:"none",transition:"border 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor=roleActif.color+"60"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
              />
              <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{
                position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",
                color:"rgba(255,255,255,0.3)",padding:0,
              }}>
                {showPwd
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",
              borderRadius:10,padding:"10px 14px",
              color:"#fca5a5",fontSize:13,textAlign:"center",
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            background:"linear-gradient(135deg, "+roleActif.color+"99, "+roleActif.color+")",
            border:"none",borderRadius:14,padding:"14px",
            color:roleActif.id==="admin"?"#1a1200":"#fff",
            fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",
            marginTop:4,
            boxShadow:"0 4px 15px "+roleActif.color+"30",
            opacity:loading?0.7:1,transition:"all 0.2s",
          }}>
            {loading ? "Connexion..." : "SE CONNECTER →"}
          </button>
        </form>
      </div>
    </div>
  );
}
