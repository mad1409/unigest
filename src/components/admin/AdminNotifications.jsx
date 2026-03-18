
import { useMemo } from "react";

export default function AdminNotifications({ data }) {
  const notifications = useMemo(() => {
    const alerts = [];
    const filieres    = data.filieres    || [];
    const etudiants   = data.etudiants   || [];
    const ues         = data.ues         || [];
    const notes       = data.notes       || [];
    const users       = data.users       || [];
    const edts        = data.emploisDuTemps || [];
    const parametres  = data.parametres  || {};

    // ── 1. Etudiants sans aucune note ──────────────
    const etuSansNotes = etudiants.filter(e => {
      const mesNotes = notes.filter(n => (n.etudiantId||n.etudiant_id) === e.id);
      return mesNotes.length === 0;
    });
    if (etuSansNotes.length > 0) {
      alerts.push({
        type: "warning",
        icon: "!",
        titre: etuSansNotes.length + " etudiant(s) sans aucune note",
        detail: etuSansNotes.slice(0,3).map(e=>e.name).join(", ") + (etuSansNotes.length>3?" ...":""),
        color: "#f59e0b",
      });
    }

    // ── 2. Filières sans EDT ────────────────────────
    const filieresSansEDT = filieres.filter(f => {
      const aEDT = edts.some(e => (e.filiereIds||e.filiere_ids||[]).includes(f.id));
      return !aEDT;
    });
    if (filieresSansEDT.length > 0) {
      alerts.push({
        type: "warning",
        icon: "!",
        titre: filieresSansEDT.length + " filiere(s) sans emploi du temps",
        detail: filieresSansEDT.map(f=>f.code).join(", "),
        color: "#fb923c",
      });
    }

    // ── 3. Filières sans UE ─────────────────────────
    const filieresSansUE = filieres.filter(f => {
      const aUE = ues.some(u => (u.filiereIds||u.filiere_ids||[]).includes(f.id));
      return !aUE;
    });
    if (filieresSansUE.length > 0) {
      alerts.push({
        type: "info",
        icon: "i",
        titre: filieresSansUE.length + " filiere(s) sans UE",
        detail: filieresSansUE.map(f=>f.code).join(", "),
        color: "#38bdf8",
      });
    }

    // ── 4. UEs sans matières ────────────────────────
    const uesSansMatieres = ues.filter(u => !(u.matieres||[]).length);
    if (uesSansMatieres.length > 0) {
      alerts.push({
        type: "warning",
        icon: "!",
        titre: uesSansMatieres.length + " UE(s) sans matieres",
        detail: uesSansMatieres.map(u=>u.code).join(", "),
        color: "#a78bfa",
      });
    }

    // ── 5. Comptes sans enseignant lié ──────────────
    const comptesProfSansLien = users.filter(u =>
      u.role === "prof" && !(u.profId||u.prof_id)
    );
    if (comptesProfSansLien.length > 0) {
      alerts.push({
        type: "info",
        icon: "i",
        titre: comptesProfSansLien.length + " compte(s) enseignant non lies a un professeur",
        detail: comptesProfSansLien.map(u=>u.id).join(", "),
        color: "#34d399",
      });
    }

    // ── 6. Etudiants sans filière valide ────────────
    const etuSansFil = etudiants.filter(e => {
      const fid = e.filiereId || e.filiere_id;
      return !filieres.find(f => f.id === fid);
    });
    if (etuSansFil.length > 0) {
      alerts.push({
        type: "error",
        icon: "X",
        titre: etuSansFil.length + " etudiant(s) avec filiere invalide",
        detail: etuSansFil.slice(0,3).map(e=>e.name).join(", "),
        color: "#ef4444",
      });
    }

    // ── 7. Notes récemment saisies ──────────────────
    if (notes.length > 0) {
      alerts.push({
        type: "success",
        icon: "✓",
        titre: notes.length + " note(s) saisie(s) au total",
        detail: "Annee " + (parametres.anneeActive||"2025/2026"),
        color: "#34d399",
      });
    }

    // ── 8. Tout va bien ─────────────────────────────
    if (alerts.filter(a=>a.type==="error"||a.type==="warning").length === 0) {
      alerts.push({
        type: "success",
        icon: "✓",
        titre: "Tout est en ordre",
        detail: "Aucun probleme detecte sur votre plateforme",
        color: "#34d399",
      });
    }

    return alerts;
  }, [data]);

  const nbProblemes = notifications.filter(n=>n.type==="error"||n.type==="warning").length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:"#f0c040"}}>
            Notifications
          </h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
            {nbProblemes > 0
              ? nbProblemes + " point(s) a surveiller"
              : "Plateforme en bonne sante"}
          </p>
        </div>
        <div style={{
          background:nbProblemes>0?"rgba(251,146,60,0.1)":"rgba(52,211,153,0.1)",
          border:"1px solid "+(nbProblemes>0?"rgba(251,146,60,0.3)":"rgba(52,211,153,0.3)"),
          borderRadius:10,padding:"10px 18px",
          color:nbProblemes>0?"#fb923c":"#34d399",
          fontWeight:700,fontSize:14,
        }}>
          {nbProblemes > 0 ? nbProblemes + " alerte(s)" : "Tout OK"}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {notifications.map((n,i) => (
          <div key={i} style={{
            background:"var(--bg2)",
            border:"1px solid "+n.color+"30",
            borderLeft:"4px solid "+n.color,
            borderRadius:10,padding:"14px 18px",
            display:"flex",alignItems:"center",gap:14,
          }}>
            <div style={{
              width:32,height:32,borderRadius:"50%",flexShrink:0,
              background:n.color+"18",border:"1px solid "+n.color+"40",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,fontWeight:900,color:n.color,
            }}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:2}}>
                {n.titre}
              </div>
              {n.detail && (
                <div style={{fontSize:12,color:"var(--text3)"}}>{n.detail}</div>
              )}
            </div>
            <div style={{
              background:n.color+"18",border:"1px solid "+n.color+"30",
              borderRadius:6,padding:"3px 10px",fontSize:11,color:n.color,fontWeight:700,
              flexShrink:0,
            }}>
              {n.type==="error"?"Critique":n.type==="warning"?"Attention":n.type==="success"?"OK":"Info"}
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginTop:24}}>
        {[
          ["Filieres",   (data.filieres||[]).length,       "#f0c040"],
          ["Etudiants",  (data.etudiants||[]).length,      "#a78bfa"],
          ["Notes",      (data.notes||[]).length,           "#fb923c"],
          ["UEs",        (data.ues||[]).length,             "#38bdf8"],
          ["Enseignants",(data.professeurs||[]).length,    "#34d399"],
          ["EDT",        (data.emploisDuTemps||[]).length, "#f472b6"],
        ].map(([l,v,c]) => (
          <div key={l} style={{
            background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:10,padding:"14px",textAlign:"center",
            borderTop:"3px solid "+c,
          }}>
            <div style={{fontSize:26,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:12,color:"var(--text2)",marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
