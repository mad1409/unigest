import ParticlesBackground from "./ParticlesBackground";

import { useState } from "react";

export default function LoginEtudiant({ onLogin, onSuccess, parametres }) {
  const couleur = parametres?.couleur_principale || "#34d399";
  const nom     = parametres?.nom_etablissement || parametres?.nomEtablissement || "UniGest";
  const logo    = parametres?.logo || null;

  const [form,    setForm]    = useState({ id:"", password:"" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const result = await onLogin(form.id, form.password, "etudiant");
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
      <ParticlesBackground/>
      
      <style>{`
        @keyframes floatOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes floatOrb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.9)} }
        @keyframes floatOrb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        .orb1 { animation: floatOrb1 8s ease-in-out infinite; }
        .orb2 { animation: floatOrb2 10s ease-in-out infinite; }
        .orb3 { animation: floatOrb3 12s ease-in-out infinite; }
      `}</style>

      {/* Card */}
      <div style={{
        width:"100%", maxWidth:420,
        background:"rgba(255,255,255,0.05)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        borderRadius:24,
        padding:"40px 36px",
        border:"1px solid rgba(255,255,255,0.1)",
        boxShadow:"0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        position:"relative",
        zIndex:1,
      }}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          {logo ? (
            <div style={{
              width:90,height:90,borderRadius:"50%",
              background:"rgba(255,255,255,0.9)",
              margin:"0 auto 16px",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 8px 24px rgba(0,0,0,0.3)",
              overflow:"hidden",
            }}>
              <img src={logo} alt="Logo" style={{width:75,height:75,objectFit:"contain"}}/>
            </div>
          ) : (
            <div style={{fontSize:48,marginBottom:12}}>🏛</div>
          )}
          <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>{nom}</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginTop:4}}>Espace Etudiant</div>
        </div>

        {/* Bouton connexion */}
        <div style={{
          background:"rgba(52,211,153,0.35)",
          border:"1px solid rgba(52,211,153,0.35)",
          borderRadius:14,padding:"12px 20px",
          textAlign:"center",marginBottom:28,
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{color:"#34d399",fontWeight:700,fontSize:14}}>Connexion Etudiant</span>
        </div>

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:1.5,
              textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:8}}>
              Matricule / Identifiant
            </label>
            <div style={{position:"relative"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input value={form.id} onChange={e=>setForm({...form,id:e.target.value})}
                placeholder="Votre identifiant" required
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:12,padding:"13px 14px 13px 42px",
                  color:"#fff",fontSize:14,outline:"none",
                  transition:"border 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor="rgba(52,211,153,0.35)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
              />
            </div>
          </div>

          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:1.5,
              textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:8}}>
              Mot de passe
            </label>
            <div style={{position:"relative"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type={showPwd?"text":"password"} value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})}
                placeholder="••••••••••" required
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:12,padding:"13px 42px 13px 42px",
                  color:"#fff",fontSize:14,outline:"none",
                  transition:"border 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor="rgba(52,211,153,0.35)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
              />
              <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{
                position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",
                color:"rgba(255,255,255,0.3)",padding:0,
              }}>
                {showPwd
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
            background:"linear-gradient(135deg, #059669, #34d399)",
            border:"none",borderRadius:14,padding:"14px",
            color:"#fff",fontSize:15,fontWeight:700,
            cursor:loading?"not-allowed":"pointer",
            marginTop:4,
            boxShadow:"0 4px 15px rgba(52,211,153,0.35)",
            opacity:loading?0.7:1,
            transition:"all 0.2s",
          }}>
            {loading ? "Connexion..." : "SE CONNECTER →"}
          </button>

          <div style={{textAlign:"center",marginTop:4}}>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:13,cursor:"pointer"}}>
              Mot de passe oublié ?
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
