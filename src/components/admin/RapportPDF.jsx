
import { useState } from "react";

export default function RapportPDF({ data }) {
  const [filterFiliere, setFilterFiliere] = useState("all");
  const [type, setType] = useState("enseignants");

  const filieres   = data.filieres   || [];
  const profs      = data.professeurs|| [];
  const ues        = data.ues        || [];
  const etudiants  = data.etudiants  || [];
  const notes      = data.notes      || [];

  function imprimer() {
    window.print();
  }

  function exportExcel() {
    let csv = "";
    const BOM = "\uFEFF";

    if (type === "enseignants") {
      csv = "Nom,Telephone,UEs,Nb Matieres\n";
      profs.forEach(p => {
        const ueIds = p.ueIds || p.matieres || [];
        const mesUEs = ues.filter(u => ueIds.includes(u.id));
        csv += [
          p.name,
          p.tel || "",
          mesUEs.map(u => u.code).join(" / "),
          mesUEs.reduce((s,u)=>s+(u.matieres||[]).length, 0),
        ].join(",") + "\n";
      });
    } else if (type === "etudiants") {
      csv = "Matricule,Nom,Filiere,Session,Annee,Identifiant\n";
      etudiantsFiltres.forEach(e => {
        const fil  = filieres.find(f => f.id === (e.filiereId||e.filiere_id));
        const user = (data.users||[]).find(u => (u.etudiantId||u.etudiant_id) === e.id);
        csv += [
          e.matricule,
          e.name,
          fil?.code || "",
          e.session || "jour",
          e.anneeAcademique || e.annee_academique || "",
          user?.id || "",
        ].join(",") + "\n";
      });
    } else if (type === "resultats") {
      csv = "Matricule,Nom,Filiere,Session,Moyenne,Appreciation\n";
      const etus = filterFiliere === "all" ? etudiants : etudiants.filter(e => e.filiereId===parseInt(filterFiliere)||e.filiere_id===parseInt(filterFiliere));
      etus.forEach(e => {
        const fil = filieres.find(f => f.id === (e.filiereId||e.filiere_id));
        const moy = getMoyenne(e.id);
        const appr = moy===null?"":parseFloat(moy)>=16?"Tres bien":parseFloat(moy)>=14?"Bien":parseFloat(moy)>=12?"Assez bien":parseFloat(moy)>=10?"Passable":"Insuffisant";
        csv += [
          e.matricule,
          e.name,
          fil?.code || "",
          e.session || "jour",
          moy ? moy+"/20" : "",
          appr,
        ].join(",") + "\n";
      });
    }

    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = type + "_" + nomEtab.replace(/ /g,"_") + "_" + annee.replace("/","-") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Données enseignants + leurs UEs
  const enseignantsData = profs.map(p => {
    const ueIds = p.ueIds || p.matieres || [];
    const mesUEs = ues.filter(u => ueIds.includes(u.id));
    return { ...p, mesUEs };
  });

  // Données étudiants filtrés
  const etudiantsFiltres = etudiants.filter(e =>
    filterFiliere === "all" || (e.filiereId||e.filiere_id) === parseInt(filterFiliere)
  );

  // Moyennes par étudiant
  function getMoyenne(etudiantId) {
    const mesNotes = notes.filter(n => (n.etudiantId||n.etudiant_id) === etudiantId);
    if (!mesNotes.length) return null;
    const vals = mesNotes.map(n => parseFloat(n.noteClasse??n.note_classe??0)).filter(v=>!isNaN(v));
    if (!vals.length) return null;
    return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
  }

  const nomEtab = data.parametres?.nomEtablissement || "Universite";
  const annee   = data.parametres?.anneeActive || "2025/2026";
  const logo    = data.parametres?.logo || null;

  return (
    <div>
      {/* Controles — cachés à l'impression */}
      <div className="no-print" style={{marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
              Rapports & Exports
            </h2>
            <p style={{color:"var(--text2)",fontSize:13,marginTop:4}}>
              Generez et imprimez les rapports officiels
            </p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={imprimer} style={{
              background:"#f0c040",border:"none",borderRadius:10,
              padding:"12px 20px",color:"#1a1200",fontWeight:700,
              fontSize:13,cursor:"pointer",
            }}>Imprimer PDF</button>
            <button onClick={exportExcel} style={{
              background:"#34d399",border:"none",borderRadius:10,
              padding:"12px 20px",color:"#052e16",fontWeight:700,
              fontSize:13,cursor:"pointer",
            }}>Exporter Excel</button>
          </div>
        </div>

        {/* Choix rapport */}
        <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
          {[
            ["enseignants","Liste Enseignants + UEs"],
            ["etudiants","Liste Etudiants"],
            ["resultats","Resultats par Filiere"],
          ].map(([v,l]) => (
            <button key={v} onClick={()=>setType(v)} style={{
              padding:"9px 18px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",
              background:type===v?"rgba(240,192,64,0.15)":"rgba(255,255,255,0.04)",
              border:type===v?"1.5px solid rgba(240,192,64,0.6)":"1px solid var(--border)",
              color:type===v?"#f0c040":"var(--text2)",
            }}>{l}</button>
          ))}
        </div>

        {(type==="etudiants"||type==="resultats") && (
          <div style={{marginTop:12,maxWidth:280}}>
            <select value={filterFiliere} onChange={e=>setFilterFiliere(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",
                borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none"}}>
              <option value="all">Toutes les filieres</option>
              {filieres.map(f=><option key={f.id} value={f.id}>{f.code} — {f.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ══════ DOCUMENT IMPRIMABLE ══════ */}
      <div id="rapport-print" style={{
        background:"#fff",color:"#1a1a2e",
        borderRadius:12,padding:"32px 36px",
        border:"1px solid rgba(255,255,255,0.1)",
        fontSize:12,
      }}>
        {/* En-tête */}
        <div style={{textAlign:"center",borderBottom:"3px solid #1a1a2e",paddingBottom:16,marginBottom:20}}>
          {logo && <img src={logo} alt="Logo" style={{height:60,objectFit:"contain",marginBottom:8}}/>}
          <div style={{fontSize:20,fontWeight:900}}>{nomEtab}</div>
          <div style={{fontSize:13,color:"#555",marginTop:4}}>Annee academique : {annee}</div>
          <div style={{fontSize:15,fontWeight:800,marginTop:10,letterSpacing:1,textTransform:"uppercase"}}>
            {type==="enseignants" && "Corps Enseignant et Unites d'Enseignement"}
            {type==="etudiants"   && "Liste des Etudiants"}
            {type==="resultats"   && "Resultats des Etudiants"}
          </div>
        </div>

        {/* ── Rapport Enseignants ── */}
        {type==="enseignants" && (
          <div>
            <div style={{marginBottom:16,fontSize:13,color:"#555"}}>
              Total : {profs.length} enseignant(s)
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#1a1a2e",color:"#fff"}}>
                  {["N°","Nom","Telephone","UEs Enseignees","Nb Matieres"].map(h=>(
                    <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,border:"1px solid #333"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enseignantsData.map((p,i) => (
                  <tr key={p.id} style={{background:i%2===0?"#fff":"#f8f9ff"}}>
                    <td style={{padding:"8px 10px",border:"1px solid #ddd",fontWeight:700}}>{i+1}</td>
                    <td style={{padding:"8px 10px",border:"1px solid #ddd",fontWeight:600}}>{p.name}</td>
                    <td style={{padding:"8px 10px",border:"1px solid #ddd"}}>{p.tel||"—"}</td>
                    <td style={{padding:"8px 10px",border:"1px solid #ddd"}}>
                      {p.mesUEs.length > 0
                        ? p.mesUEs.map(u=>u.code+" ("+u.intitule+")").join(" / ")
                        : "—"}
                    </td>
                    <td style={{padding:"8px 10px",border:"1px solid #ddd",textAlign:"center",fontWeight:700}}>
                      {p.mesUEs.reduce((s,u)=>s+(u.matieres||[]).length,0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Détail par enseignant */}
            <div style={{marginTop:24}}>
              <div style={{fontSize:14,fontWeight:800,borderBottom:"2px solid #1a1a2e",paddingBottom:6,marginBottom:12}}>
                Detail des UEs par Enseignant
              </div>
              {enseignantsData.filter(p=>p.mesUEs.length>0).map(p => (
                <div key={p.id} style={{marginBottom:16,pageBreakInside:"avoid"}}>
                  <div style={{background:"#f0f0f0",padding:"6px 10px",fontWeight:700,fontSize:12,marginBottom:6}}>
                    {p.name} {p.tel?"— "+p.tel:""}
                  </div>
                  {p.mesUEs.map(u => (
                    <div key={u.id} style={{marginLeft:16,marginBottom:8}}>
                      <div style={{fontWeight:600,fontSize:11,color:"#1a1a2e"}}>
                        {u.code} — {u.intitule} (S{u.semestre} · {u.creditUE||u.credit_ue} cr.)
                      </div>
                      {(u.matieres||[]).map(m => (
                        <div key={m.id} style={{marginLeft:12,fontSize:10,color:"#555",marginTop:2}}>
                          • {m.name} ({m.creditECUE} cr.)
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Rapport Etudiants ── */}
        {type==="etudiants" && (
          <div>
            <div style={{marginBottom:16,fontSize:13,color:"#555"}}>
              Total : {etudiantsFiltres.length} etudiant(s)
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#1a1a2e",color:"#fff"}}>
                  {["N°","Matricule","Nom","Filiere","Session","Annee","Identifiant"].map(h=>(
                    <th key={h} style={{padding:"7px 8px",textAlign:"left",fontWeight:700,border:"1px solid #333"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {etudiantsFiltres.map((e,i) => {
                  const fil  = filieres.find(f=>f.id===(e.filiereId||e.filiere_id));
                  const user = (data.users||[]).find(u=>(u.etudiantId||u.etudiant_id)===e.id);
                  return (
                    <tr key={e.id} style={{background:i%2===0?"#fff":"#f8f9ff"}}>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd",fontWeight:700}}>{i+1}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd",fontFamily:"monospace",fontSize:10}}>{e.matricule}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd",fontWeight:600}}>{e.name}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd"}}>{fil?.code||"—"}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd",textTransform:"capitalize"}}>{e.session||"jour"}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd"}}>{e.anneeAcademique||e.annee_academique||"—"}</td>
                      <td style={{padding:"7px 8px",border:"1px solid #ddd",fontFamily:"monospace",fontSize:10}}>{user?.id||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Rapport Résultats ── */}
        {type==="resultats" && (
          <div>
            {(filterFiliere==="all" ? filieres : filieres.filter(f=>f.id===parseInt(filterFiliere))).map(fil => {
              const etus = etudiants.filter(e=>(e.filiereId||e.filiere_id)===fil.id);
              if (!etus.length) return null;
              return (
                <div key={fil.id} style={{marginBottom:24,pageBreakInside:"avoid"}}>
                  <div style={{background:"#1a1a2e",color:"#fff",padding:"8px 12px",fontWeight:800,fontSize:13,marginBottom:8}}>
                    {fil.code} — {fil.name} ({etus.length} etudiants)
                  </div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{background:"#f0f0f0"}}>
                        {["N°","Matricule","Nom","Session","Moy. Generale","Appreciation"].map(h=>(
                          <th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,border:"1px solid #ddd"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {etus.map((e,i) => {
                        const moy = getMoyenne(e.id);
                        const appr = moy===null?"—":parseFloat(moy)>=16?"Tres bien":parseFloat(moy)>=14?"Bien":parseFloat(moy)>=12?"Assez bien":parseFloat(moy)>=10?"Passable":"Insuffisant";
                        return (
                          <tr key={e.id} style={{background:i%2===0?"#fff":"#f8f9ff"}}>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd",fontWeight:700}}>{i+1}</td>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd",fontFamily:"monospace",fontSize:10}}>{e.matricule}</td>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd",fontWeight:600}}>{e.name}</td>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd",textTransform:"capitalize"}}>{e.session||"jour"}</td>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd",textAlign:"center",fontWeight:700,color:moy&&parseFloat(moy)>=10?"#166534":"#991b1b"}}>
                              {moy ? moy+"/20" : "—"}
                            </td>
                            <td style={{padding:"6px 8px",border:"1px solid #ddd"}}>{appr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",color:"#888",fontSize:10,borderTop:"1px solid #e5e7eb",paddingTop:10,marginTop:20}}>
          Document genere par UniGest — {nomEtab} — {annee}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        @media print {
          body * { visibility: hidden; }
          #rapport-print, #rapport-print * { visibility: visible; }
          #rapport-print { position: fixed; top:0; left:0; width:100%; border:none !important; padding:20px !important; }
          .no-print { display: none !important; }
        }
      `}}/>
    </div>
  );
}
