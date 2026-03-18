
export default function ProfProfil({ prof, data }) {
  if (!prof) return null;

  const initials = (prof.name||"").split(" ").map(p=>p[0]?.toUpperCase()||"").join("").slice(0,2);
  const ueIds = prof.ueIds || prof.matieres || [];

  return (
    <div>
      <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#38bdf8",marginBottom:24}}>
        Mon Profil
      </h2>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"28px",maxWidth:500}}>

        {/* Avatar */}
        <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:24}}>
          <div style={{
            width:60,height:60,borderRadius:"50%",
            background:"rgba(56,189,248,0.12)",border:"2px solid rgba(56,189,248,0.35)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,fontWeight:700,color:"#38bdf8",flexShrink:0,
          }}>{initials}</div>
          <div>
            <div style={{fontSize:19,fontWeight:700,color:"#38bdf8"}}>{prof.name}</div>
            <div style={{color:"var(--text2)",fontSize:13,marginTop:3}}>Enseignant</div>
          </div>
        </div>

        {/* Infos */}
        {[
          ["Email",     prof.email],
          ["Telephone", prof.tel],
        ].map(([k,v]) => (
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{color:"var(--text2)",fontSize:14}}>{k}</span>
            <span style={{color:"var(--text)",fontSize:14}}>{v||"—"}</span>
          </div>
        ))}

        {/* UE enseignées */}
        <div style={{marginTop:20}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)",marginBottom:10}}>
            UE Enseignees ({ueIds.length})
          </div>
          {ueIds.length === 0 ? (
            <div style={{color:"var(--text3)",fontSize:13}}>Aucune UE assignee</div>
          ) : (
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ueIds.map(uid => {
                const ue = (data.ues||[]).find(u => u.id === uid);
                return ue ? (
                  <div key={uid} style={{
                    background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",
                    borderRadius:8,padding:"8px 14px",
                  }}>
                    <div style={{color:"#38bdf8",fontSize:12,fontWeight:700}}>{ue.code}</div>
                    <div style={{color:"var(--text2)",fontSize:11,marginTop:2}}>{ue.intitule}</div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
