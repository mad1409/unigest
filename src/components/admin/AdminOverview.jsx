
import { useMemo } from "react";

import { useState, useEffect } from "react";
import { api } from "../../api";
export default function AdminOverview({ data }) {
  const [filPage,    setFilPage]    = useState(1);
  const [sites,      setSites]      = useState([]);
  const [filterSite, setFilterSite] = useState("all");

  useEffect(() => {
    api.getAnnexes().then(r => setSites(Array.isArray(r) ? r : [])).catch(()=>{});
  }, []);
  const FIL_PER_PAGE = 8;
  const filieres       = data.filieres       || [];
  const ues            = data.ues            || [];
  const etudiants      = data.etudiants      || [];
  const professeurs    = data.professeurs    || [];
  const emploisDuTemps = data.emploisDuTemps || [];
  const notes          = data.notes          || [];
  const users          = data.users          || [];

  // Stats globales
  // Stats par site
  const statsSites = sites.map(s => ({
    nom: s.nom,
    nbEtu: etudiants.filter(e => String(e.annexe_id) === String(s.id)).length,
    nbJour: etudiants.filter(e => String(e.annexe_id) === String(s.id) && e.session==="jour").length,
    nbSoir: etudiants.filter(e => String(e.annexe_id) === String(s.id) && e.session==="soir").length,
  }));

  const etuFiltres = filterSite === "all"
    ? etudiants
    : etudiants.filter(e => String(e.annexe_id) === String(filterSite));

  const stats = [
    { label:"Filieres",         value:filieres.length,       color:"#f0c040", sub:"cycles d'etude" },
    { label:"UE / Matieres",    value:ues.length,            color:"#38bdf8", sub:ues.reduce((s,u)=>s+(u.matieres||[]).length,0)+" matieres" },
    { label:"Etudiants",        value:etuFiltres.length,      color:"#a78bfa", sub:etuFiltres.filter(e=>e.session==="soir").length+" soir / "+etuFiltres.filter(e=>e.session==="jour").length+" jour" },
    { label:"Enseignants",      value:professeurs.length,    color:"#34d399", sub:"corps enseignant" },
    { label:"EDT",              value:emploisDuTemps.length, color:"#f472b6", sub:emploisDuTemps.reduce((s,e)=>s+(e.slots||[]).length,0)+" creneaux" },
    { label:"Notes saisies",    value:notes.length,          color:"#fb923c", sub:"evaluations" },
  ];

  // Etudiants par filiere
  const etuParFiliere = useMemo(() =>
    filieres.map(f => ({
      ...f,
      nbEtu: etudiants.filter(e=>(e.filiereId||e.filiere_id)===f.id).length,
      nbUE:  ues.filter(u=>(u.filiereIds||u.filiere_ids||[]).includes(f.id)).length,
      nbJour: etudiants.filter(e=>(e.filiereId||e.filiere_id)===f.id&&e.session==="jour").length,
      nbSoir: etudiants.filter(e=>(e.filiereId||e.filiere_id)===f.id&&e.session==="soir").length,
    }))
  , [filieres, etudiants, ues]);

  // Activite recente
  const nbComptes = users.filter(u=>u.role!=="etudiant").length;
  const nbGroupes = (data.groupes||[]).length;

  const cycleColor = { Licence:"#38bdf8", Master:"#a78bfa", Doctorat:"#f0c040" };

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:26,fontWeight:700,color:"#f0c040"}}>
          Tableau de bord
        </h2>
        <p style={{color:"var(--text2)",fontSize:14,marginTop:6}}>
          {data.parametres?.nomEtablissement||"Universite"} — Annee {data.parametres?.anneeActive||"2025/2026"}
          {" · "}Semestre {data.parametres?.semestreActif||1}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
        {/* Filtre site */}
        {sites.length > 0 && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            <button onClick={()=>setFilterSite("all")} style={{
              padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
              background:filterSite==="all"?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
              border:filterSite==="all"?"1.5px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
              color:filterSite==="all"?"#f0c040":"var(--text2)",
            }}>Toutes les annexes</button>
            {sites.map(s=>(
              <button key={s.id} onClick={()=>setFilterSite(s.id)} style={{
                padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
                background:filterSite===s.id?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
                border:filterSite===s.id?"1.5px solid rgba(240,192,64,0.5)":"1px solid var(--border)",
                color:filterSite===s.id?"#f0c040":"var(--text2)",
              }}>{s.nom}</button>
            ))}
          </div>
        )}

        {stats.map(s => (
          <div key={s.label} style={{
            background:"rgba(52,211,153,0.06)",
            border:"1px solid rgba(52,211,153,0.15)",
            borderRadius:14,padding:"18px 16px",
            backdropFilter:"blur(10px)",
          }}>
            <div style={{fontSize:30,fontWeight:900,color:"#34d399",lineHeight:1}}>{s.value}</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600,marginTop:6}}>{s.label}</div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:3}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Informations complémentaires */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"18px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
            Comptes staff
          </div>
          {[
            ["Administrateurs", users.filter(u=>u.role==="admin").length,      "#f0c040"],
            ["Enseignants",     users.filter(u=>u.role==="prof").length,        "#38bdf8"],
            ["Secretaires",     users.filter(u=>u.role==="secretaire").length,  "#34d399"],
            ["Surveillants",    users.filter(u=>u.role==="surveillant").length, "#fb923c"],
          ].map(([l,v,c]) => (
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
              <span style={{color:c,fontWeight:700,fontSize:14}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0"}}>
            <span style={{color:"var(--text2)",fontSize:13}}>Groupes TD/TP</span>
            <span style={{color:"#a78bfa",fontWeight:700,fontSize:14}}>{nbGroupes}</span>
          </div>
        </div>

        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"18px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
            Etudiants par session
          </div>
          {[
            ["Cours du Jour", etuFiltres.filter(e=>e.session==="jour").length, "#fbbf24"],
            ["Cours du Soir", etuFiltres.filter(e=>e.session==="soir").length, "#818cf8"],
            ["Total",         etudiants.length,                                "#a78bfa"],
          ].map(([l,v,c]) => (
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{color:"var(--text2)",fontSize:13}}>{l}</span>
              <span style={{color:c,fontWeight:700,fontSize:14}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:10}}>
            {etudiants.length > 0 && (
              <div style={{height:8,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.05)",display:"flex"}}>
                <div style={{
                  width:(etudiants.filter(e=>e.session==="jour").length/etudiants.length*100)+"%",
                  background:"#fbbf24",transition:"width 0.5s",
                }}/>
                <div style={{
                  width:(etudiants.filter(e=>e.session==="soir").length/etudiants.length*100)+"%",
                  background:"#818cf8",transition:"width 0.5s",
                }}/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filieres */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"22px"}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>
          Filieres et etudiants
        </div>
        {etuParFiliere.length === 0 ? (
          <div style={{textAlign:"center",padding:"30px",color:"rgba(255,255,255,0.3)"}}>
            Aucune filiere — creez des filieres depuis le menu Filieres
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            {/* Pagination */}
            {etuParFiliere.length > FIL_PER_PAGE && (
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {Array.from({length:Math.ceil(etuParFiliere.length/FIL_PER_PAGE)},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setFilPage(p)} style={{
                    padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",
                    background:filPage===p?"rgba(52,211,153,0.2)":"rgba(255,255,255,0.05)",
                    border:filPage===p?"1px solid rgba(52,211,153,0.5)":"1px solid rgba(255,255,255,0.1)",
                    color:filPage===p?"#34d399":"rgba(255,255,255,0.4)",
                  }}>{p}</button>
                ))}
                <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",alignSelf:"center",marginLeft:8}}>
                  {etuParFiliere.length} filieres au total
                </span>
              </div>
            )}
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.04)"}}>
                  {["Code","Nom","Cycle","Etudiants","Jour","Soir","UE"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,
                      fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {etuParFiliere.slice((filPage-1)*FIL_PER_PAGE, filPage*FIL_PER_PAGE).map(f => {
                  const cc = cycleColor[f.cycle] || "#94a3b8";
                  return (
                    <tr key={f.id} style={{borderBottom:"1px solid var(--border)"}}>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{color:"#f0c040",fontWeight:700,fontSize:13}}>{f.code}</span>
                      </td>
                      <td style={{padding:"10px 12px",color:"var(--text)",fontSize:13}}>{f.name}</td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{background:cc+"18",border:"1px solid "+cc+"35",
                          borderRadius:5,padding:"2px 8px",fontSize:11,color:cc,fontWeight:700}}>
                          {f.cycle||"—"}
                        </span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{fontSize:16,fontWeight:800,color:"#a78bfa"}}>{f.nbEtu}</span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{fontSize:13,color:"#fbbf24",fontWeight:600}}>{f.nbJour}</span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{fontSize:13,color:"#818cf8",fontWeight:600}}>{f.nbSoir}</span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{fontSize:13,color:"#38bdf8",fontWeight:600}}>{f.nbUE}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      {/* Stats par site */}
      {statsSites.length > 0 && (
        <div style={{marginTop:24}}>
          <h3 style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:"#f0c040",marginBottom:14}}>
            Repartition par annexe
          </h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
            {statsSites.map(s=>(
              <div key={s.nom} style={{
                background:"var(--bg2)",border:"1px solid var(--border)",
                borderRadius:12,padding:"16px",borderTop:"3px solid #f0c040",
              }}>
                <div style={{fontWeight:700,color:"#f0c040",fontSize:14,marginBottom:8}}>{s.nom}</div>
                <div style={{fontSize:24,fontWeight:900,color:"#fff",marginBottom:4}}>{s.nbEtu}</div>
                <div style={{fontSize:12,color:"var(--text2)"}}>
                  {s.nbJour} jour / {s.nbSoir} soir
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
