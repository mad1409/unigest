
import { getSemestreDepuisCycles } from "../../utils/calculs";
import {
  calcNoteMatiere, calcMoyenneUE, calcNoteCoeff,
  calcMoyenneSemestre, calcCreditsValides,
  isUEValidee, getMention, getAppreciation,
} from "../../utils/calculs";

export default function Bulletin({ etudiant, data }) {
  if (!etudiant) return null;
  const filiereId = etudiant.filiereId || etudiant.filiere_id;
  const filiere   = data.filieres.find(f => f.id === filiereId);
  const mesUEs    = (data.ues||[]).filter(u => (u.filiereIds||u.filiere_ids||[]).includes(filiereId));
  const mesNotes  = (data.notes||[]).filter(n => (n.etudiantId||n.etudiant_id) === etudiant.id);
  const moyGen    = calcMoyenneSemestre(mesUEs, mesNotes);
  const creditsValides = calcCreditsValides(mesUEs, mesNotes);
  const totalCredits   = mesUEs.reduce((s,u) => s + parseFloat(u.creditUE||u.credit_ue||1), 0);
  const appreciation   = getAppreciation(moyGen);
  let totalNoteCoeff = 0;
  mesUEs.forEach(ue => {
    const notesUE = mesNotes.filter(n => (ue.matieres||[]).map(m=>m.id).includes(n.matiereId||n.matiere_id));
    const moy = calcMoyenneUE((ue.matieres||[]), notesUE);
    if (moy !== null) totalNoteCoeff += calcNoteCoeff(moy, parseFloat(ue.creditUE||ue.credit_ue||1));
  });

  const tdP = { padding:"8px 6px", border:"1px solid #ddd", fontSize:11, verticalAlign:"middle" };

  return (
    <div>
      {/* Bouton imprimer */}
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontSize:24,fontWeight:700,color:"#a78bfa"}}>Bulletin de Notes</h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>Vue officielle — pret a imprimer</p>
        </div>
        <button onClick={() => window.print()} style={{background:"#a78bfa",border:"none",borderRadius:9,padding:"11px 22px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          Imprimer
        </button>
      </div>

      {/* Bulletin imprimable */}
      <div id="bulletin-print" style={{background:"#fff",color:"#1a1a2e",borderRadius:12,padding:"32px 24px",fontSize:13,border:"1px solid rgba(255,255,255,0.1)"}}>

        {/* En-tête */}
        <div style={{textAlign:"center",borderBottom:"3px solid #1a1a2e",paddingBottom:16,marginBottom:16}}>
          <div style={{fontSize:20,fontWeight:900}}>{data.parametres?.nomEtablissement||"Universite"}</div>
          <div style={{fontSize:13,color:"#555",marginTop:4}}>Annee academique : {data.parametres?.anneeActive||"2025/2026"}</div>
          <div style={{fontSize:16,fontWeight:800,marginTop:10,letterSpacing:1,textTransform:"uppercase"}}>Bulletin de Notes</div>
        </div>

        {/* Infos etudiant */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,background:"#f8f9fa",borderRadius:8,padding:"14px 18px",marginBottom:20}}>
          {[
            ["Nom et Prenom(s)", etudiant.name],
            ["Matricule",        etudiant.matricule],
            ["Filiere",          filiere?.name],
            ["Niveau",           filiere?.cycle],
            ["Specialite",       filiere?.code],
            ["Semestre",         "Semestre " + (data.parametres?.semestreActif||1)],
          ].map(([k,v]) => (
            <div key={k} style={{display:"flex",gap:6}}>
              <span style={{color:"#555",fontWeight:600,minWidth:120,fontSize:12}}>{k} :</span>
              <span style={{fontWeight:700,color:"#1a1a2e",fontSize:12}}>{v||"–"}</span>
            </div>
          ))}
        </div>

        {/* Tableau notes */}
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:20}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:680}}>
            <thead>
              <tr style={{background:"#1a1a2e",color:"#fff"}}>
                {["Code UE","Intitule UE","Matiere","Cr.ECUE","Note Devoir","Note Examen","Note Mat.","Cr.UE","Moy.UE","Note Coeff","Resultat"].map(h => (
                  <th key={h} style={{padding:"8px 5px",textAlign:"center",fontWeight:700,fontSize:10,border:"1px solid #333"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesUEs.map((ue, ueIdx) => {
                const notesUE  = mesNotes.filter(n => (ue.matieres||[]).map(m=>m.id).includes(n.matiereId||n.matiere_id));
                const moyUE    = calcMoyenneUE((ue.matieres||[]), notesUE);
                const noteCoef = calcNoteCoeff(moyUE, parseFloat(ue.creditUE||ue.credit_ue||1));
                const valide   = isUEValidee(moyUE);
                const bg       = ueIdx%2===0 ? "#ffffff" : "#f8f9ff";
                return (ue.matieres||[]).map((m, mIdx) => {
                  const note = mesNotes.find(n => (n.matiereId||n.matiere_id) === m.id);
                  const nc   = note ? parseFloat(note.noteClasse ?? note.note_classe) : null;
                  const ne   = note ? parseFloat(note.noteExamen ?? note.note_examen) : null;
                  const nm   = note ? calcNoteMatiere(nc, ne) : null;
                  const isF  = mIdx === 0;
                  const rs   = (ue.matieres||[]).length;
                  return (
                    <tr key={m.id} style={{background:bg}}>
                      {isF && (
                        <>
                          <td rowSpan={rs} style={{...tdP,fontWeight:800,textAlign:"center",background:bg}}>{ue.code}</td>
                          <td rowSpan={rs} style={{...tdP,fontWeight:600,fontSize:10,background:bg}}>{ue.intitule}</td>
                        </>
                      )}
                      <td style={tdP}>{m.name}</td>
                      <td style={{...tdP,textAlign:"center",fontWeight:700}}>{m.creditECUE}</td>
                      <td style={{...tdP,textAlign:"center"}}>{nc !== null && !isNaN(nc) ? Number(nc).toFixed(2) : "–"}</td>
                      <td style={{...tdP,textAlign:"center"}}>{ne !== null && !isNaN(ne) ? Number(ne).toFixed(2) : "–"}</td>
                      <td style={{...tdP,textAlign:"center",fontWeight:800,color:nm!==null?(nm>=10?"#166534":"#991b1b"):"#555"}}>{nm!==null&&!isNaN(nm)?Number(nm).toFixed(2):"–"}</td>
                      {isF && (
                        <>
                          <td rowSpan={rs} style={{...tdP,textAlign:"center",fontWeight:800,background:bg}}>{parseFloat(ue.creditUE||ue.credit_ue||1)}</td>
                          <td rowSpan={rs} style={{...tdP,textAlign:"center",fontWeight:900,fontSize:13,color:moyUE!==null?(moyUE>=10?"#166534":"#991b1b"):"#555",background:bg}}>{moyUE!==null&&!isNaN(moyUE)?Number(moyUE).toFixed(2):"–"}</td>
                          <td rowSpan={rs} style={{...tdP,textAlign:"center",fontWeight:800,background:bg}}>{noteCoef!==null&&!isNaN(noteCoef)?Number(noteCoef).toFixed(2):"–"}</td>
                          <td rowSpan={rs} style={{...tdP,textAlign:"center",fontWeight:800,color:valide?"#166534":"#991b1b",background:bg}}>{moyUE!==null?(valide?"Valide":"Non valide"):"–"}</td>
                        </>
                      )}
                    </tr>
                  );
                });
              })}
              <tr style={{background:"#1a1a2e",color:"#fff"}}>
                <td colSpan={7} style={{padding:"9px 8px",textAlign:"right",fontWeight:800,fontSize:12,border:"1px solid #333"}}>Total</td>
                <td style={{...tdP,textAlign:"center",fontWeight:900,color:"#ffd700",background:"#1a1a2e"}}>{totalCredits}</td>
                <td style={{...tdP,background:"#1a1a2e"}}></td>
                <td style={{...tdP,textAlign:"center",fontWeight:900,color:"#ffd700",background:"#1a1a2e"}}>{Number(totalNoteCoeff).toFixed(2)}</td>
                <td style={{...tdP,background:"#1a1a2e"}}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Résumé */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:20}}>
          <div style={{background:"#f8f9fa",borderRadius:8,padding:"14px 18px"}}>
            {[
              ["Moyenne du Semestre", moyGen!==null ? Number(moyGen).toFixed(2)+" / 20" : "–"],
              ["Credits valides",     creditsValides+" / "+totalCredits],
              ["Appreciation",        appreciation],
            ].map(([k,v]) => (
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #e5e7eb"}}>
                <span style={{color:"#555",fontWeight:600,fontSize:13}}>{k}</span>
                <span style={{fontWeight:800,color:"#1a1a2e",fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#f8f9fa",borderRadius:8,padding:"14px 18px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
            <div style={{fontSize:12,color:"#555",fontWeight:600}}>Le Directeur des Etudes et de la Formation</div>
            <div style={{height:50,borderBottom:"1px solid #ccc",marginTop:8}}/>
            <div style={{fontSize:11,color:"#888",marginTop:6,textAlign:"center"}}>Signature et cachet</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",color:"#888",fontSize:11,borderTop:"1px solid #e5e7eb",paddingTop:12}}>
          Document genere par UniGest — {data.parametres?.nomEtablissement||""} — {data.parametres?.anneeActive||""}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #bulletin-print, #bulletin-print * { visibility: visible; }
          #bulletin-print { position: fixed; top: 0; left: 0; width: 100%; border: none !important; padding: 20px !important; }
          .no-print { display: none !important; }
        }
      `}}/>
    </div>
  );
}
