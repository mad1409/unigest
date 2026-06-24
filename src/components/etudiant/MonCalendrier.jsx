import { useState, useEffect, useMemo } from "react";
import { api } from "../../api";

const TYPES_EVENEMENT = [
  { value:"rentree",      label:"Rentrée académique",  color:"#34d399" },
  { value:"examen",       label:"Examens",             color:"#f0c040" },
  { value:"deliberation", label:"Délibération",        color:"#a78bfa" },
  { value:"vacances",     label:"Vacances",            color:"#38bdf8" },
  { value:"inscription",  label:"Inscriptions",        color:"#fb923c" },
  { value:"autre",        label:"Autre événement",     color:"#94a3b8" },
];

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
               "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function MonCalendrier({ data }) {
  const annee = data.parametres?.anneeActive || "2025/2026";
  const [evenements, setEvenements] = useState([]);
  const [moisActif,  setMoisActif]  = useState(new Date().getMonth());

  useEffect(() => {
    api.getCalendrier(annee)
      .then(r => setEvenements(Array.isArray(r) ? r : []))
      .catch(console.error);
  }, [annee]);

  const evtTries = useMemo(() =>
    [...evenements].sort((a,b) => new Date(a.date_debut) - new Date(b.date_debut)),
    [evenements]
  );

  const evtsMois = useMemo(() =>
    evtTries.filter(e => new Date(e.date_debut).getMonth() === moisActif),
    [evtTries, moisActif]
  );

  function getType(type) { return TYPES_EVENEMENT.find(t => t.value === type) || TYPES_EVENEMENT[5]; }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric"});
  }

  function joursRestants(dateDebut) {
    const diff = Math.ceil((new Date(dateDebut) - new Date()) / (1000*60*60*24));
    if (diff < 0) return null;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    return "Dans "+diff+" jours";
  }

  const prochains = evtTries.filter(e => {
    const diff = Math.ceil((new Date(e.date_debut) - new Date()) / (1000*60*60*24));
    return diff >= 0 && diff <= 30;
  });

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#34d399"}}>
          Calendrier Académique
        </h2>
        <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>Année {annee}</p>
      </div>

      {/* Onglets */}
      <div style={{ borderBottom:"1px solid var(--border)", marginBottom:20 }}>
        {[{id:"calendrier",label:"📅 Calendrier"},{id:"modules",label:"📚 Modules"}].map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            padding:"8px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
            borderRadius:"8px 8px 0 0", marginRight:4,
            background: activeTab===t.id ? "var(--bg2)" : "transparent",
            color: activeTab===t.id ? "#34d399" : "var(--text3)",
            borderBottom: activeTab===t.id ? "2px solid #34d399" : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab==="modules" && (
        <div>
          {modules.length === 0 ? (
            <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Aucun module planifié</div>
          ) : modules.map(m => {
            const statut = m.statut==="en_cours" ? {label:"En cours",color:"#34d399"} : m.statut==="termine" ? {label:"Terminé",color:"#94a3b8"} : {label:"Planifié",color:"#38bdf8"};
            return (
              <div key={m.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderLeft:`4px solid ${statut.color}`,borderRadius:12,padding:"16px 20px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{m.nom}</span>
                  <span style={{padding:"2px 9px",borderRadius:6,fontSize:10,fontWeight:700,background:statut.color+"20",color:statut.color}}>{statut.label}</span>
                </div>
                {m.prof_name && <div style={{fontSize:12,color:"#38bdf8",marginBottom:4}}>👨‍🏫 {m.prof_name}</div>}
                <div style={{fontSize:12,color:"var(--text3)"}}>⏱ {m.heures}h — {new Date(m.date_debut).toLocaleDateString("fr-FR")} → {new Date(m.date_fin).toLocaleDateString("fr-FR")}</div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab==="calendrier" && prochains.length > 0 && (
        <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#34d399",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>
            Prochains événements (30 jours)
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {prochains.map(e => {
              const t = getType(e.type);
              return (
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",borderRadius:8,borderLeft:"3px solid "+t.color}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:"var(--text)",fontSize:13}}>{e.titre}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{formatDate(e.date_debut)}{e.date_fin && e.date_fin!==e.date_debut ? " → "+formatDate(e.date_fin) : ""}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{background:t.color+"18",border:"1px solid "+t.color+"35",borderRadius:5,padding:"2px 8px",fontSize:10,color:t.color,fontWeight:700}}>{t.label}</span>
                    <span style={{fontSize:11,color:"#f0c040",fontWeight:600}}>{joursRestants(e.date_debut)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {MOIS.map((m,i) => {
          const nb = evtTries.filter(e => new Date(e.date_debut).getMonth() === i).length;
          return (
            <button key={i} onClick={()=>setMoisActif(i)} style={{
              padding:"7px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
              background:moisActif===i?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",
              border:moisActif===i?"1.5px solid rgba(52,211,153,0.5)":"1px solid var(--border)",
              color:moisActif===i?"#34d399":"var(--text2)",position:"relative",
            }}>
              {m.slice(0,3)}
              {nb > 0 && <span style={{position:"absolute",top:-4,right:-4,background:"#34d399",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{nb}</span>}
            </button>
          );
        })}
      </div>

      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:12}}>{MOIS[moisActif]}</div>

      {activeTab==="calendrier" && evtsMois.length === 0 ? (
        <div style={{textAlign:"center",padding:"50px",color:"var(--text3)",background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)"}}>
          Aucun événement en {MOIS[moisActif]}
        </div>
      ) : evtsMois.map(e => {
        const t    = getType(e.type);
        const jr   = joursRestants(e.date_debut);
        const past = new Date(e.date_debut) < new Date();
        return (
          <div key={e.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderLeft:"4px solid "+(past?"#374151":t.color),borderRadius:10,padding:"14px 18px",marginBottom:10,opacity:past?0.6:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{background:t.color+"18",border:"1px solid "+t.color+"35",borderRadius:5,padding:"2px 8px",fontSize:10,color:t.color,fontWeight:700}}>{t.label}</span>
              {jr && !past && <span style={{fontSize:11,color:"#f0c040",fontWeight:600}}>{jr}</span>}
              {past && <span style={{fontSize:10,color:"var(--text3)"}}>Passé</span>}
            </div>
            <div style={{fontWeight:700,color:"var(--text)",fontSize:14,marginBottom:4}}>{e.titre}</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>
              {formatDate(e.date_debut)}{e.date_fin && e.date_fin!==e.date_debut ? " → "+formatDate(e.date_fin) : ""}
            </div>
            {e.description && <div style={{fontSize:12,color:"var(--text3)",marginTop:6}}>{e.description}</div>}
          </div>
        );
      })}
    </div>
  );
}
