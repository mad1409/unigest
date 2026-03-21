
import { getSemestreDepuisCycles } from "../../utils/calculs";
import { useState } from "react";
import {
  calcNoteMatiere, calcMoyenneUE, calcMoyenneSemestre,
  calcCreditsValides, isUEValidee, getMention, getAppreciation,
} from "../../utils/calculs";

export default function MesNotes({ etudiant, data }) {
  if (!etudiant) return null;

  const filiereId  = etudiant.filiereId || etudiant.filiere_id;
  const mesUEs     = (data.ues||[]).filter(u => (u.filiereIds||u.filiere_ids||[]).includes(filiereId));
  const mesNotes   = (data.notes||[]).filter(n => (n.etudiantId||n.etudiant_id) === etudiant.id);

  // Semestres disponibles
  const semestres  = [...new Set(mesUEs.map(u => u.semestre))].sort((a,b)=>a-b);
  // Semestre actif selon filiere et periode
  const filiere = data.filieres.find(f => f.id === filiereId);
  const semestreAuto = getSemestreDepuisCycles(filiere?.code || "", data.parametres?.semestresCycles);
  const defaultSemestre = semestres.includes(semestreAuto) ? semestreAuto : (semestres[0] || 1);
  const [selectedSemestre, setSelectedSemestre] = useState(defaultSemestre);

  const uesFiltrees = mesUEs.filter(u => u.semestre === selectedSemestre);
  const moyGen      = calcMoyenneSemestre(uesFiltrees, mesNotes);
  const creditsVal  = calcCreditsValides(uesFiltrees, mesNotes);
  const totalCr     = uesFiltrees.reduce((s,u) => s + parseFloat(u.creditUE||u.credit_ue||1), 0);
  const mentionGen  = getMention(moyGen);
  const appreciation = getAppreciation(moyGen);

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#34d399"}}>Mes Notes</h2>
        <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
          {data.filieres.find(f=>f.id===filiereId)?.name||"—"}
        </p>
      </div>

      {/* Filtre semestre */}
      {semestres.length > 0 && (
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {semestres.map(s => (
            <button key={s} onClick={()=>setSelectedSemestre(s)} style={{
              padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",
              background:selectedSemestre===s?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",
              border:selectedSemestre===s?"1.5px solid rgba(52,211,153,0.6)":"1px solid var(--border)",
              color:selectedSemestre===s?"#34d399":"var(--text2)",
            }}>Semestre {s}</button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[
          ["Moyenne", moyGen!==null?Number(moyGen).toFixed(2)+" /20":"—", mentionGen?.color||"#34d399"],
          ["Credits", creditsVal+" / "+totalCr, "#34d399"],
          ["Appreciation", appreciation||"—", "#f0c040"],
        ].map(([l,v,c]) => (
          <div key={l} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",borderLeft:"3px solid "+c}}>
            <div style={{fontSize:11,color:"var(--text3)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
            <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* UEs */}
      {uesFiltrees.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"var(--text3)"}}>
          Aucune UE pour le semestre {selectedSemestre}
        </div>
      ) : uesFiltrees.map(ue => {
        const notesUE = mesNotes.filter(n => (ue.matieres||[]).map(m=>m.id).includes(n.matiereId||n.matiere_id));
        const moyUE   = calcMoyenneUE((ue.matieres||[]), notesUE);
        const valide  = isUEValidee(moyUE);
        const mention = getMention(moyUE);

        return (
          <div key={ue.id} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"18px",marginBottom:12}}>
            {/* Header UE */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <span style={{color:"#34d399",fontWeight:700,fontSize:14}}>{ue.code}</span>
                <span style={{color:"var(--text2)",fontSize:13,marginLeft:8}}>{ue.intitule}</span>
                <span style={{marginLeft:8,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:5,padding:"1px 7px",fontSize:11,color:"#38bdf8"}}>
                  {parseFloat(ue.creditUE||ue.credit_ue||1)} cr.
                </span>
              </div>
              <div style={{textAlign:"right"}}>
                {moyUE !== null ? (
                  <>
                    <div style={{fontSize:22,fontWeight:900,color:mention.color,lineHeight:1}}>{Number(moyUE).toFixed(2)}</div>
                    <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>/ 20</div>
                    <span style={{
                      background:mention.color+"18",border:"1px solid "+mention.color+"35",
                      borderRadius:5,padding:"1px 8px",fontSize:10,color:mention.color,fontWeight:700,
                    }}>{valide?"Valide":"Non valide"}</span>
                  </>
                ) : <span style={{color:"var(--text3)",fontSize:12}}>Notes manquantes</span>}
              </div>
            </div>

            {/* Matieres */}
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.04)"}}>
                  {["Matiere","Credit","Note Devoir","Note Examen","Note Matiere"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(ue.matieres||[]).map(m => {
                  const note = mesNotes.find(n => (n.matiereId||n.matiere_id) === m.id);
                  const nc   = note ? parseFloat(note.noteClasse??note.note_classe) : null;
                  const ne   = note ? parseFloat(note.noteExamen??note.note_examen) : null;
                  const nm   = note ? calcNoteMatiere(nc, ne) : null;
                  const mm   = getMention(nm);
                  return (
                    <tr key={m.id} style={{borderBottom:"1px solid var(--border)"}}>
                      <td style={{padding:"9px 10px",fontSize:13,color:"var(--text)"}}>{m.name}</td>
                      <td style={{padding:"9px 10px"}}>
                        <span style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:5,padding:"1px 7px",fontSize:11,color:"#38bdf8",fontWeight:700}}>{m.creditECUE}</span>
                      </td>
                      <td style={{padding:"9px 10px",fontSize:13}}>
                        {nc!==null&&!isNaN(nc) ? <span style={{fontWeight:700}}>{Number(nc).toFixed(2)}</span> : <span style={{color:"var(--text3)"}}>—</span>}
                      </td>
                      <td style={{padding:"9px 10px",fontSize:13}}>
                        {ne!==null&&!isNaN(ne) ? <span style={{fontWeight:700}}>{Number(ne).toFixed(2)}</span> : <span style={{color:"var(--text3)"}}>—</span>}
                      </td>
                      <td style={{padding:"9px 10px"}}>
                        {nm!==null&&!isNaN(nm)
                          ? <span style={{fontWeight:800,fontSize:15,color:mm.color}}>{Number(nm).toFixed(2)}</span>
                          : <span style={{color:"var(--text3)"}}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
