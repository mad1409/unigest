import { api } from '../../api';
import { useState, useRef } from "react";

const COLONNES = ["name","matricule","email","tel","filiereId","anneeAcademique","session"];
const EXEMPLE = `name,matricule,email,filiereId
Coulibaly Amara,ETU-2025-001,amara@etud.ci,1
Bamba Fatoumata,ETU-2025-002,fato@etud.ci,3
Kone Ibrahim,ETU-2025-003,ibrahim@etud.ci,1`;

const EXEMPLE_EDT = `nom_edt,filiere_code,jour,heure_debut,heure_fin,matiere,type,salle,prof_nom
Tronc Commun S1,INFO-L1,Lundi,08:00,10:00,Mathematiques,Cours,Salle A1,Dr. Konan
Tronc Commun S1,INFO-L1,Mardi,10:00,12:00,Physique,TD,Salle B2,Dr. Traoré
EDT GLT,GLT,Mercredi,08:00,10:00,Economie,Cours,Amphi 1,Dr. Bamba`;

export default function ImportCSV({ data, setData }) {
  const [importType, setImportType] = useState("etudiants");
  const [step,      setStep]      = useState("upload");
  const [rows,      setRows]      = useState([]);
  const [mapping,   setMapping]   = useState({});
  const [headers,   setHeaders]   = useState([]);
  const [preview,   setPreview]   = useState([]);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const fileRef = useRef();

  function parseCSV(text) {
    const lines = text.trim().split("\n").filter(Boolean);
    const heads = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
    const data  = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/"/g,""));
      const obj  = {};
      heads.forEach((h, i) => obj[h] = vals[i] || "");
      return obj;
    });
    return { heads, data };
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { heads, data } = parseCSV(ev.target.result);
        setHeaders(heads);
        setRows(data);
        // Auto-mapping si colonnes identiques
        const auto = {};
        COLONNES.forEach(col => {
          if (heads.includes(col)) auto[col] = col;
        });
        setMapping(auto);
        setPreview(data.slice(0, 5));
        setStep("mapping");
      } catch {
        setError("Fichier CSV invalide. Verifie le format.");
      }
    };
    reader.readAsText(file);
  }

  function handleImport() {
    let ok = 0, skip = 0, errors = [];
    const maxId = Math.max(0, ...data.etudiants.map(e => e.id));
    const maxUserId = data.users.filter(u => u.role === "etudiant").length;
    const nouveaux = [];
    const nouveauxUsers = [];

    rows.forEach((row, i) => {
      const name      = row[mapping.name]      || "";
      const matricule = row[mapping.matricule] || "";
      const email     = row[mapping.email]     || "";
      const tel       = row[mapping.tel]       || "";
      const filiereId = parseInt(row[mapping.filiereId]) || 0;

      if (!name || !matricule) {
        skip++;
        errors.push(`Ligne ${i+2}: nom ou matricule manquant`);
        return;
      }
      // Vérifie doublon matricule
      if (data.etudiants.find(e => e.matricule === matricule)) {
        skip++;
        errors.push(`Ligne ${i+2}: matricule ${matricule} existe deja`);
        return;
      }
      const id = maxId + nouveaux.length + 1;
      const userId = `etu${maxUserId + nouveauxUsers.length + 1}`;

      const anneeAcademique = row[mapping.anneeAcademique] || data.parametres.anneeActive || "";
      const session = row[mapping.session] === "soir" ? "soir" : "jour";
      nouveaux.push({ id, matricule, name, filiereId, email, tel, anneeAcademique, session });
      nouveauxUsers.push({
        id: userId, password: "etudiant123",
        role: "etudiant", name, etudiantId: id,
      });
      ok++;
    });

    setData(d => ({
      ...d,
      etudiants: [...d.etudiants, ...nouveaux],
      users:     [...d.users,     ...nouveauxUsers],
    }));

    setResult({ ok, skip, errors });
    setStep("result");
  }

  function downloadExemple() {
    const blob = new Blob([EXEMPLE], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "modele_import_etudiants.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const card = {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 14, padding: "24px 28px",
  };
  const inp = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(240,192,64,0.3)",
    borderRadius: 8, padding: "9px 12px",
    color: "var(--text)", fontSize: 13, outline: "none",
    width: "100%", boxSizing: "border-box",
  };
  const label = {
    fontSize: 11, fontWeight: 700, letterSpacing: 1,
    textTransform: "uppercase", color: "var(--text3)", marginBottom: 6, display: "block",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f0c040" }}>
          Import CSV — Etudiants en masse
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>
          Importez des centaines d'etudiants en une seule operation
        </p>
      </div>

      {/* Etapes */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["upload","1. Fichier"],["mapping","2. Colonnes"],["result","3. Resultat"]].map(([s,l]) => (
          <div key={s} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: step === s ? "rgba(240,192,64,0.15)" : "rgba(255,255,255,0.04)",
            border: step === s ? "1px solid rgba(240,192,64,0.5)" : "1px solid var(--border)",
            color: step === s ? "#f0c040" : "var(--text3)",
          }}>{l}</div>
        ))}
      </div>

      {/* STEP 1 — Upload */}
      {step === "upload" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", marginBottom: 16 }}>
              Charger votre fichier CSV
            </div>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: "2px dashed rgba(240,192,64,0.4)",
                borderRadius: 12, padding: "40px 20px",
                textAlign: "center", cursor: "pointer",
                background: "rgba(240,192,64,0.04)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div style={{ color: "#f0c040", fontWeight: 700, fontSize: 14 }}>
                Cliquer pour selectionner
              </div>
              <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>
                Fichiers .csv acceptes
              </div>
            </div>
            <input type="file" accept=".csv,.txt" ref={fileRef} style={{ display:"none" }} onChange={handleFile}/>
            {error && (
              <div style={{ marginTop: 12, color:"#ef4444", fontSize:13, background:"rgba(239,68,68,0.1)", borderRadius:8, padding:"8px 12px" }}>{error}</div>
            )}
          </div>

          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginBottom: 16 }}>
              Format attendu
            </div>
            <pre style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              borderRadius: 8, padding: "14px",
              fontSize: 12, color: "var(--text2)",
              overflowX: "auto", lineHeight: 1.7,
            }}>
{`name,matricule,email,filiereId
Coulibaly Amara,ETU-001,a@ci,1
Bamba Fatoumata,ETU-002,b@ci,3`}
            </pre>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text3)", marginBottom: 10 }}>
                Filieres disponibles
              </div>
              {data.filieres.map(f => (
                <div key={f.id} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:12 }}>
                  <span style={{ color:"var(--text2)" }}>{f.name}</span>
                  <span style={{ color:"#f0c040", fontWeight:700 }}>ID: {f.id}</span>
                </div>
              ))}
            </div>
            <button onClick={downloadExemple} style={{
              marginTop: 16, width: "100%",
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: 8, padding: "9px",
              color: "#34d399", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
              Telecharger le modele CSV
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Mapping */}
      {step === "mapping" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", marginBottom: 6 }}>
              Associer les colonnes
            </div>
            <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>
              {rows.length} ligne(s) detectee(s). Associe chaque champ a la colonne de ton fichier.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {COLONNES.map(col => (
                <div key={col}>
                  <label style={label}>
                    {col === "name" ? "Nom complet *"
                   : col === "matricule" ? "Matricule *"
                   : col === "filiereId" ? "ID Filiere *"
                   : col}
                  </label>
                  <select
                    style={inp}
                    value={mapping[col] || ""}
                    onChange={e => setMapping({ ...mapping, [col]: e.target.value })}
                  >
                    <option value="">-- Ignorer --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Apercu */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              Apercu ({Math.min(5, rows.length)} premiere(s) lignes)
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                    {COLONNES.map(col => (
                      <th key={col} style={{ padding:"8px 10px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"var(--text3)" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      {COLONNES.map(col => (
                        <td key={col} style={{ padding:"9px 10px", color:"var(--text)" }}>
                          {mapping[col] ? row[mapping[col]] || "—" : <span style={{ color:"var(--text3)" }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setStep("upload")} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 20px", color: "var(--text2)", cursor: "pointer",
              }}>
                Retour
              </button>
              <button
                onClick={handleImport}
                disabled={!mapping.name || !mapping.matricule}
                style={{
                  flex: 1, background: "#f0c040", border: "none",
                  borderRadius: 8, padding: "10px 20px",
                  color: "#1a1200", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  opacity: (!mapping.name || !mapping.matricule) ? 0.5 : 1,
                }}
              >
                Importer {rows.length} etudiant(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — Resultat */}
      {step === "result" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ ...card, borderColor: "rgba(52,211,153,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#34d399", lineHeight: 1 }}>{result.ok}</div>
              <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 8 }}>Etudiants importes</div>
              <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>Mot de passe : etudiant123</div>
            </div>
            <div style={{ ...card, borderColor: result.skip > 0 ? "rgba(239,68,68,0.3)" : "var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: result.skip > 0 ? "#ef4444" : "var(--text3)", lineHeight: 1 }}>{result.skip}</div>
              <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 8 }}>Lignes ignorees</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ ...card, borderColor: "rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>
                Erreurs detectees
              </div>
              {result.errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "#ef4444", padding: "4px 0", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                  {e}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { setStep("upload"); setResult(null); setRows([]); if(fileRef.current) fileRef.current.value=""; }}
            style={{
              background: "rgba(240,192,64,0.1)", border: "1px solid rgba(240,192,64,0.3)",
              borderRadius: 8, padding: "12px", color: "#f0c040",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Nouvel import
          </button>
        </div>
      )}
    </div>
  );
}


function ImportEDT({ data, setData, onBack }) {
  const [step,    setStep]    = useState("upload");
  const [rows,    setRows]    = useState([]);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  function parseCSV(text) {
    const lines = text.trim().split("\n").filter(Boolean);
    const heads = lines[0].split(",").map(h=>h.trim().replace(/"/g,""));
    return lines.slice(1).map(line => {
      const vals = line.split(",").map(v=>v.trim().replace(/"/g,""));
      const obj  = {};
      heads.forEach((h,i) => obj[h] = vals[i]||"");
      return obj;
    });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        setRows(rows);
        setStep("preview");
        setError("");
      } catch { setError("Fichier CSV invalide."); }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    let ok = 0, skip = 0, errors = [];
    setStep("loading");
    // Grouper par nom_edt
    const edtMap = {};
    rows.forEach(row => {
      const nom = row.nom_edt || row.name || "";
      if (!nom) return;
      if (!edtMap[nom]) edtMap[nom] = { filiereCodes:[], slots:[] };
      if (row.filiere_code && !edtMap[nom].filiereCodes.includes(row.filiere_code)) {
        edtMap[nom].filiereCodes.push(row.filiere_code);
      }
      if (row.jour && row.heure_debut && row.heure_fin) {
        edtMap[nom].slots.push({
          jour:       row.jour,
          heureDebut: row.heure_debut,
          heureFin:   row.heure_fin,
          matiere:    row.matiere||"",
          type:       row.type||"Cours",
          salle:      row.salle||"",
          profNom:    row.prof_nom||"",
        });
      }
    });

    for (const [nom, edt] of Object.entries(edtMap)) {
      try {
        const filiereIds = edt.filiereCodes
          .map(code => data.filieres.find(f=>f.code===code||f.name===code))
          .filter(Boolean).map(f=>f.id);
        const newEdt = await api.createEDT({ name:nom, filiereIds });
        for (const slot of edt.slots) {
          await api.createSlot(newEdt.id, slot);
          ok++;
        }
      } catch(e) {
        skip++;
        errors.push(nom + ": " + e.message);
      }
    }
    await setData();
    setResult({ ok, skip, errors });
    setStep("result");
  }

  function downloadExemple() {
    const blob = new Blob([EXEMPLE_EDT], {type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download="modele_import_edt.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const card = {background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"24px 28px",marginBottom:20};

  return (
    <div style={{maxWidth:700}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:8,padding:"7px 14px",color:"var(--text2)",cursor:"pointer",fontSize:13}}>
          Retour
        </button>
        <div>
          <h2 style={{fontSize:22,fontWeight:700,color:"#f0c040"}}>Import EDT depuis CSV</h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:2}}>Importez plusieurs emplois du temps en une seule fois</p>
        </div>
      </div>

      {step==="loading" && (
        <div style={{textAlign:"center",padding:"60px"}}>
          <div style={{width:40,height:40,border:"4px solid rgba(240,192,64,0.2)",borderTop:"4px solid #f0c040",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
          <div style={{color:"var(--text2)"}}>Import en cours...</div>
          <style>{"@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}"}</style>
        </div>
      )}

      {step==="upload" && (
        <div>
          <div style={card}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#f0c040",marginBottom:12}}>Format CSV requis</h3>
            <div style={{fontFamily:"monospace",fontSize:11,color:"#34d399",background:"rgba(52,211,153,0.05)",borderRadius:8,padding:"12px",marginBottom:12,overflowX:"auto"}}>
              nom_edt,filiere_code,jour,heure_debut,heure_fin,matiere,type,salle,prof_nom
            </div>
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>
              Colonnes obligatoires: nom_edt, jour, heure_debut, heure_fin, matiere. Les autres sont optionnelles.
            </div>
            <button onClick={downloadExemple} style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:8,padding:"8px 18px",color:"#34d399",fontWeight:700,cursor:"pointer",fontSize:13}}>
              Telecharger le modele CSV
            </button>
          </div>
          <div style={{...card,border:"2px dashed rgba(240,192,64,0.3)",textAlign:"center",cursor:"pointer"}}
            onClick={()=>fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleFile}/>
            <div style={{fontSize:14,color:"var(--text2)",marginBottom:8}}>Cliquez pour choisir votre fichier CSV</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>Format .csv uniquement</div>
          </div>
          {error && <div style={{color:"#ef4444",fontSize:13,marginTop:8}}>{error}</div>}
        </div>
      )}

      {step==="preview" && (
        <div>
          <div style={card}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#f0c040",marginBottom:12}}>{rows.length} creneaux a importer</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:"rgba(255,255,255,0.04)"}}>
                    {["EDT","Filiere","Jour","Horaire","Matiere","Type","Salle","Prof"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:"left",color:"var(--text3)",fontWeight:700,fontSize:11}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0,10).map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                      <td style={{padding:"7px 10px",color:"#f0c040",fontWeight:700,fontSize:12}}>{r.nom_edt}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.filiere_code}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.jour}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.heure_debut}–{r.heure_fin}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.matiere}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.type}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.salle}</td>
                      <td style={{padding:"7px 10px",fontSize:12}}>{r.prof_nom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length>10&&<div style={{fontSize:11,color:"var(--text3)",marginTop:6,textAlign:"center"}}>... et {rows.length-10} autres creneaux</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep("upload")} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:9,padding:"11px",color:"var(--text2)",cursor:"pointer",fontWeight:600}}>Retour</button>
            <button onClick={handleImport} style={{flex:2,background:"#f0c040",border:"none",borderRadius:9,padding:"11px",color:"#1a1200",fontWeight:700,fontSize:15,cursor:"pointer"}}>
              Importer {rows.length} creneaux
            </button>
          </div>
        </div>
      )}

      {step==="result" && result && (
        <div style={card}>
          <div style={{fontSize:16,fontWeight:700,color:"#34d399",marginBottom:16}}>Import termine</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:"rgba(52,211,153,0.08)",borderRadius:10,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color:"#34d399"}}>{result.ok}</div>
              <div style={{fontSize:12,color:"var(--text3)"}}>Creneaux importes</div>
            </div>
            <div style={{background:"rgba(239,68,68,0.08)",borderRadius:10,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color:"#ef4444"}}>{result.skip}</div>
              <div style={{fontSize:12,color:"var(--text3)"}}>Erreurs</div>
            </div>
          </div>
          {result.errors.length>0&&(
            <div style={{background:"rgba(239,68,68,0.06)",borderRadius:8,padding:"12px",marginBottom:14}}>
              {result.errors.map((e,i)=><div key={i} style={{fontSize:11,color:"#ef4444",marginBottom:3}}>{e}</div>)}
            </div>
          )}
          <button onClick={()=>{setStep("upload");setResult(null);setRows([]);}} style={{width:"100%",background:"rgba(240,192,64,0.15)",border:"1px solid rgba(240,192,64,0.4)",borderRadius:9,padding:"10px",color:"#f0c040",fontWeight:700,cursor:"pointer"}}>
            Nouvel import
          </button>
        </div>
      )}
    </div>
  );
}
