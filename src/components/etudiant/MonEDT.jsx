
import { useState } from "react";

const JOURS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const TYPE_COLORS = {
  Cours: { bg:"rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.4)", color:"#38bdf8" },
  TD:    { bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.4)", color:"#34d399" },
  TP:    { bg:"rgba(52,211,153,0.12)",border:"rgba(52,211,153,0.4)",color:"#34d399" },
};

export default function MonEDT({ etudiant, data }) {
  const [filterSession, setFilterSession] = useState("all");
  const [filterJour,    setFilterJour]    = useState("all");
  const [vue,           setVue]           = useState("grille"); // grille | liste

  if (!etudiant) return null;

  const filiereId = etudiant.filiereId || etudiant.filiere_id;
  const edts = (data.emploisDuTemps||[]).filter(e => {
    const ids = e.filiereIds || e.filiere_ids || [];
    return ids.includes(filiereId);
  });

  // Tous les créneaux
  const allSlots = edts.flatMap(edt =>
    (edt.slots||[]).map(s => ({
      ...s,
      heureDebut: s.heureDebut || s.heure_debut || "",
      heureFin:   s.heureFin   || s.heure_fin   || "",
      profNom:    s.profNom    || s.prof_nom     || "",
      edtName:    edt.name,
    }))
  ).filter(s => {
    const sessionOk = filterSession === "all" || s.session === filterSession || !s.session;
    const jourOk    = filterJour    === "all" || s.jour === filterJour;
    return sessionOk && jourOk;
  });

  // Grouper par jour
  const slotsByJour = {};
  JOURS.forEach(j => { slotsByJour[j] = allSlots.filter(s => s.jour === j); });

  const typeStyle = t => TYPE_COLORS[t] || TYPE_COLORS.Cours;

  const filterBtn = (active, color="#34d399") => ({
    padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
    background:active?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",
    border:active?"1.5px solid "+color:"1px solid var(--border)",
    color:active?color:"var(--text2)",
  });

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#34d399"}}>Mon Emploi du Temps</h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>{allSlots.length} creneau(x)</p>
        </div>
        {/* Vue */}
        <div style={{display:"flex",gap:6}}>
          {[["grille","Grille"],["liste","Liste"]].map(([v,l])=>(
            <button key={v} onClick={()=>setVue(v)} style={filterBtn(vue===v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6}}>
          {[["all","Tous"],["jour","Jour"],["soir","Soir"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilterSession(v)} style={filterBtn(filterSession===v,"#fbbf24")}>
              {l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button onClick={()=>setFilterJour("all")} style={filterBtn(filterJour==="all")}>Tous les jours</button>
          {JOURS.map(j=>(
            <button key={j} onClick={()=>setFilterJour(j)} style={filterBtn(filterJour===j)}>
              {j.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {allSlots.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"var(--text3)",background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)"}}>
          Aucun creneau disponible pour votre filiere
        </div>
      ) : vue === "grille" ? (
        // ── Vue Grille ────────────────────────────
        <div style={{overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"80px repeat("+JOURS.filter(j=>filterJour==="all"||j===filterJour).length+",1fr)",gap:2,minWidth:500}}>
            {/* Header jours */}
            <div style={{padding:"10px",background:"var(--bg2)",borderRadius:8}}/>
            {JOURS.filter(j=>filterJour==="all"||j===filterJour).map(j=>(
              <div key={j} style={{
                padding:"10px",textAlign:"center",fontWeight:700,fontSize:13,
                background:slotsByJour[j]?.length?"rgba(52,211,153,0.1)":"var(--bg2)",
                color:slotsByJour[j]?.length?"#34d399":"var(--text3)",
                borderRadius:8,border:"1px solid var(--border)",
              }}>{j}</div>
            ))}

            {/* Lignes créneaux par jour */}
            {JOURS.filter(j=>filterJour==="all"||j===filterJour).some(j=>slotsByJour[j]?.length) && (
              <>
                <div style={{gridColumn:"1/-1",height:4}}/>
                {/* Afficher max des créneaux */}
                {Array.from({length:Math.max(...JOURS.filter(j=>filterJour==="all"||j===filterJour).map(j=>slotsByJour[j]?.length||0))},(_,i)=>i).map(i=>(
                  <>
                    <div key={"h"+i} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"4px",color:"var(--text3)",fontSize:11}}>
                      {i===0?"Créneau "+(i+1):""}
                    </div>
                    {JOURS.filter(j=>filterJour==="all"||j===filterJour).map(j=>{
                      const slot = slotsByJour[j]?.[i];
                      const ts   = slot ? typeStyle(slot.type) : null;
                      return (
                        <div key={j+i} style={{
                          background:slot?ts.bg:"rgba(255,255,255,0.02)",
                          border:"1px solid "+(slot?ts.border:"var(--border)"),
                          borderRadius:10,padding:slot?"12px 10px":"8px",
                          minHeight:80,
                        }}>
                          {slot ? (
                            <>
                              <div style={{fontSize:11,color:ts.color,fontWeight:700,marginBottom:3}}>
                                {slot.heureDebut} – {slot.heureFin}
                              </div>
                              <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:4}}>
                                {slot.matiere}
                              </div>
                              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                                <span style={{background:ts.bg,border:"1px solid "+ts.border,borderRadius:4,padding:"1px 6px",fontSize:10,color:ts.color,fontWeight:700}}>
                                  {slot.type||"Cours"}
                                </span>
                                {slot.session && (
                                  <span style={{background:slot.session==="soir"?"rgba(99,102,241,0.1)":"rgba(251,191,36,0.1)",border:"1px solid "+(slot.session==="soir"?"rgba(99,102,241,0.3)":"rgba(251,191,36,0.3)"),borderRadius:4,padding:"1px 6px",fontSize:10,color:slot.session==="soir"?"#818cf8":"#fbbf24",fontWeight:700}}>
                                    {slot.session==="soir"?"Soir":"Jour"}
                                  </span>
                                )}
                              </div>
                              {slot.salle && <div style={{fontSize:11,color:"var(--text3)"}}>{slot.salle}</div>}
                              {slot.profNom && <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>{slot.profNom}</div>}
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        // ── Vue Liste ─────────────────────────────
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {JOURS.filter(j=>filterJour==="all"||j===filterJour).map(j => {
            const slots = slotsByJour[j] || [];
            if (!slots.length) return null;
            return (
              <div key={j}>
                <div style={{fontSize:13,fontWeight:700,color:"#34d399",marginBottom:6,paddingLeft:4}}>{j}</div>
                {slots.map((s,i) => {
                  const ts = typeStyle(s.type);
                  return (
                    <div key={i} style={{
                      background:"var(--bg2)",border:"1px solid var(--border)",
                      borderLeft:"3px solid "+ts.color,
                      borderRadius:10,padding:"12px 16px",marginBottom:6,
                      display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
                    }}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{s.matiere}</div>
                        <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>
                          {s.heureDebut} – {s.heureFin}
                          {s.salle && " · "+s.salle}
                          {s.profNom && " · "+s.profNom}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span style={{background:ts.bg,border:"1px solid "+ts.border,borderRadius:6,padding:"2px 9px",fontSize:11,color:ts.color,fontWeight:700}}>
                          {s.type||"Cours"}
                        </span>
                        {s.session && (
                          <span style={{
                            background:s.session==="soir"?"rgba(99,102,241,0.1)":"rgba(251,191,36,0.1)",
                            border:"1px solid "+(s.session==="soir"?"rgba(99,102,241,0.3)":"rgba(251,191,36,0.3)"),
                            borderRadius:6,padding:"2px 9px",fontSize:11,
                            color:s.session==="soir"?"#818cf8":"#fbbf24",fontWeight:700,
                          }}>{s.session==="soir"?"Soir":"Jour"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
