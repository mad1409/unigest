export default function PageSuspension({ parametres }) {
  const nom  = parametres?.nomEtablissement || parametres?.nom_etablissement || "votre etablissement";
  const logo = parametres?.logo || null;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #0a0500 0%, #1a0a00 50%, #0a0500 100%)",
      padding:20, position:"relative", overflow:"hidden",
    }}>
      {/* Fond rouge sombre */}
      <div style={{
        position:"absolute", width:600, height:600, borderRadius:"50%",
        top:"-10%", left:"-10%",
        background:"radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", width:400, height:400, borderRadius:"50%",
        bottom:"-5%", right:"-5%",
        background:"radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>

      <div style={{
        width:"100%", maxWidth:500,
        background:"rgba(255,255,255,0.04)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        borderRadius:24, padding:"48px 40px",
        border:"1px solid rgba(239,68,68,0.2)",
        boxShadow:"0 25px 50px rgba(0,0,0,0.6), 0 0 60px rgba(239,68,68,0.05)",
        textAlign:"center",
        position:"relative", zIndex:1,
      }}>
        {/* Logo */}
        {logo && (
          <div style={{
            width:80, height:80, borderRadius:"50%",
            background:"rgba(255,255,255,0.9)",
            margin:"0 auto 20px",
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden",
            boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
          }}>
            <img src={logo} alt="Logo" style={{width:66, height:66, objectFit:"contain"}}/>
          </div>
        )}

        {/* Icone alerte */}
        <div style={{
          width:70, height:70, borderRadius:"50%",
          background:"rgba(239,68,68,0.15)",
          border:"2px solid rgba(239,68,68,0.4)",
          margin: logo ? "0 auto 20px" : "0 auto 24px",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <div style={{fontSize:22, fontWeight:800, color:"#fff", marginBottom:8}}>
          Acces Suspendu
        </div>
        <div style={{fontSize:15, color:"rgba(255,255,255,0.6)", marginBottom:24}}>
          {nom}
        </div>

        <div style={{
          background:"rgba(239,68,68,0.08)",
          border:"1px solid rgba(239,68,68,0.2)",
          borderRadius:14, padding:"20px",
          marginBottom:28,
        }}>
          <p style={{color:"rgba(255,255,255,0.8)", fontSize:14, lineHeight:1.7, margin:0}}>
            L'acces a la plateforme pour votre etablissement a ete
            <strong style={{color:"#ef4444"}}> suspendu </strong>
            en raison d'un abonnement impaye ou expire.
          </p>
        </div>

        <div style={{
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:12, padding:"16px",
          marginBottom:24,
        }}>
          <p style={{color:"rgba(255,255,255,0.5)", fontSize:13, margin:"0 0 8px"}}>
            Pour reactiver votre acces, contactez :
          </p>
          <div style={{fontSize:14, fontWeight:700, color:"#f0c040"}}>
            UniGest Support
          </div>
          <div style={{fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:4}}>
            support@unigest.ml
          </div>
        </div>

        <div style={{fontSize:11, color:"rgba(255,255,255,0.25)"}}>
          Vos donnees sont conservees et seront restaurees apres regularisation.
        </div>
      </div>
    </div>
  );
}
