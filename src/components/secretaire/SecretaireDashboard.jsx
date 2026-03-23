import { api } from '../../api';
import SearchSelect from '../shared/SearchSelect';

import { useState, useMemo, useRef, useEffect } from "react";
import Layout from "../shared/Layout";
import ChangerMotDePasse from "../shared/ChangerMotDePasse";

const PER_PAGE = 12;

function genId(name, existingIds) {
  const prefix = "ETU";
  const parts  = name.trim().split(" ");
  const init   = parts.map(p => p[0]?.toUpperCase() || "").join("").slice(0,3);
  let n = 1;
  while (existingIds.includes(prefix + init + String(n).padStart(2,"0"))) n++;
  return prefix + init + String(n).padStart(2,"0");
}

function genMatricule(annee, filiereId, etudiants, filieres) {
  const filiere    = filieres.find(f => f.id === parseInt(filiereId));
  const anneeShort = (annee||"").split("/")[0].slice(-2);
  const count      = etudiants.filter(e =>
    e.anneeAcademique === annee && e.filiereId === parseInt(filiereId)
  ).length + 1;
  return (filiere?.code||"ETU") + "-" + anneeShort + "-" + String(count).padStart(3,"0");
}

export default function SecretaireDashboard({ user, data, setData, onLogout }) {
  const [tab,   setTab]   = useState("inscrire");
  const [sites, setSites] = useState([]);

  useEffect(() => {
    api.getSites().then(r => setSites(Array.isArray(r) ? r : [])).catch(()=>{});
  }, []);
  const nav = [
    { id:"inscrire", label:"Inscrire un etudiant", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
    { id:"cartes",   label:"Imprimer cartes",      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> },
    { id:"liste",    label:"Liste des etudiants",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { id:"profil",   label:"Mon profil",           icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <Layout user={user} role="secretaire" onLogout={onLogout} data={data}
      navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab==="inscrire" && <InscrireEtudiant data={data} setData={setData}/>}
      {tab==="cartes"   && <ImprimerCartes   data={data}/>}
      {tab==="liste"    && <ListeEtudiants   data={data}/>}
      {tab==="profil"   && <div><h2 style={{fontSize:24,fontWeight:700,color:"#34d399",marginBottom:24}}>Mon profil</h2><div style={{maxWidth:500}}><ChangerMotDePasse user={user} data={data} setData={setData} color="#34d399"/></div></div>}
    </Layout>
  );
}

// ── Inscription ───────────────────────────────────────
function InscrireEtudiant({ data, setData }) {
  const annees = data.parametres.anneesDisponibles || ["2024/2025"];
  const initF  = { name:"", email:"", tel:"", filiereId:data.filieres[0]?.id||"", anneeAcademique:data.parametres.anneeActive||annees[0], session:"jour" };
  const [form, setForm] = useState(initF);
  const [msg,  setMsg]  = useState(null);

  async function inscrire() {
    if (!form.name.trim()) { setMsg({type:"error",text:"Le nom est obligatoire."}); return; }
    const filiere   = data.filieres.find(f=>f.id===parseInt(form.filiereId));
    const matricule = genMatricule(form.anneeAcademique, form.filiereId, data.etudiants, data.filieres);
    try {
      const result = await api.createEtudiant({
        name:            form.name.trim(),
        email:           form.email.trim(),
        tel:             form.tel.trim(),
        filiereId:       parseInt(form.filiereId),
        anneeAcademique: form.anneeAcademique,
        session:         form.session,
        matricule,
      });
      await setData();
      setMsg({
        type:"success",
        name:    form.name.trim(),
        matricule,
        userId:  result.userId || "—",
        filiere: filiere?.code,
        session: form.session,
      });
      setForm(initF);
    } catch(e) { setMsg({type:"error", text:e.message}); }
  }

  const inp = { background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };
  const lbl = t => <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)",marginBottom:6}}>{t}</div>;

  return (
    <div style={{maxWidth:600}}>
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:24,fontWeight:700,color:"#34d399"}}>Inscrire un etudiant</h2>
        <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>Identifiant et matricule generes automatiquement.</p>
      </div>

      {msg?.type==="success" && (
        <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:14,padding:"20px 24px",marginBottom:24}}>
          <div style={{fontSize:15,fontWeight:700,color:"#34d399",marginBottom:14}}>Etudiant inscrit avec succes</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Nom",msg.name],["Filiere",msg.filiere],["Matricule",msg.matricule],["Identifiant",msg.userId],["Mot de passe","etu123"],["Session",msg.session==="jour"?"Cours du jour":"Cours du soir"]].map(([l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:3}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:(l==="Identifiant"||l==="Matricule")?"#34d399":"var(--text)"}}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setMsg(null)} style={{marginTop:14,background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.4)",borderRadius:8,padding:"8px 18px",color:"#34d399",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            Nouvelle inscription
          </button>
        </div>
      )}
      {msg?.type==="error" && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#ef4444",fontSize:13}}>{msg.text}</div>}

      {(!msg||msg.type==="error") && (
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"24px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              {lbl("Nom complet *")}
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Prenom Nom" style={inp}/>
              {form.name.trim()&&<div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>
                Identifiant : <strong style={{color:"#34d399"}}>{genId(form.name,data.users.map(u=>u.id))}</strong>
                {" · "}Matricule : <strong style={{color:"#38bdf8"}}>{genMatricule(form.anneeAcademique,form.filiereId,data.etudiants,data.filieres)}</strong>
              </div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>{lbl("Annee scolaire *")}<select value={form.anneeAcademique} onChange={e=>setForm({...form,anneeAcademique:e.target.value})} style={inp}>{annees.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
              <div>{lbl("Filiere *")}<SearchSelect
                value={String(form.filiereId)}
                onChange={v=>setForm({...form,filiereId:v})}
                options={data.filieres.map(f=>({value:String(f.id), label:f.code+" — "+f.name, sub:f.cycle}))}
                placeholder="Choisir une filiere..."
                color="#34d399"
              /></div>
            </div>
            <div>
              {lbl("Session *")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["jour","Cours du Jour","#fbbf24"],["soir","Cours du Soir","#818cf8"]].map(([v,l,c])=>(
                  <button key={v} onClick={()=>setForm({...form,session:v})} style={{padding:"12px",borderRadius:10,cursor:"pointer",background:form.session===v?c+"18":"rgba(255,255,255,0.04)",border:form.session===v?"2px solid "+c:"1px solid var(--border)",color:form.session===v?c:"var(--text2)",fontWeight:form.session===v?700:400,fontSize:14}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>{lbl("Email")}<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="etudiant@email.com" style={inp}/></div>
              <div>{lbl("Telephone")}<input type="tel" value={form.tel} onChange={e=>setForm({...form,tel:e.target.value})} placeholder="+223 XX XX XX" style={inp}/></div>
            </div>
            <button onClick={inscrire} disabled={!form.name.trim()} style={{background:"#34d399",border:"none",borderRadius:10,padding:"14px",color:"#042c1a",fontWeight:700,fontSize:15,cursor:!form.name.trim()?"not-allowed":"pointer",opacity:!form.name.trim()?0.5:1}}>
              Inscrire l'etudiant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Impression cartes identifiants ────────────────────
function ImprimerCartes({ data }) {
  const annees = data.parametres.anneesDisponibles || ["2024/2025"];
  const [fA, setFA] = useState(data.parametres.anneeActive||annees[0]);
  const [fF, setFF] = useState("all");
  const [fS,   setFS]   = useState("all");
  const [fSite,setFSite] = useState("all");
  const [q,    setQ]    = useState("");
  const [sel,  setSel]  = useState([]);
  const printRef = useRef();

  const filtered = useMemo(()=>data.etudiants.filter(e=>{
    const aOk=fA==="all"||e.anneeAcademique===fA;
    const fOk=fF==="all"||e.filiereId===parseInt(fF);
    const sOk=fS==="all"||e.session===fS;
    const sq=q.toLowerCase();
    const qOk=!sq||e.name.toLowerCase().includes(sq)||e.matricule?.toLowerCase().includes(sq);
    return aOk&&fOk&&sOk&&qOk;
  }),[data.etudiants,fA,fF,fS,q]);

  function toggleSel(id) {
    setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  }
  function selAll()   { setSel(filtered.map(e=>e.id)); }
  function deselAll() { setSel([]); }

  const aImprimer = filtered.filter(e=>sel.includes(e.id));

  function imprimer() {
    const w = window.open('','_blank');
    const etab = data.parametres.nomEtablissement || "Universite";
    const cards = aImprimer.map(e=>{
      const fil  = data.filieres.find(f=>f.id===e.filiereId);
      const user = data.users.find(u=>u.etudiantId===e.id);
      return `
        <div class="card">
          <div class="header">
            <div class="etab">${etab}</div>
            <div class="titre">CARTE D'ETUDIANT</div>
            <div class="annee">${e.anneeAcademique||""}</div>
          </div>
          <div class="body">
            <div class="avatar">${e.name.split(" ").slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("")}</div>
            <div class="infos">
              <div class="nom">${e.name}</div>
              <div class="row"><span class="lbl">Matricule</span><span class="val mat">${e.matricule||"—"}</span></div>
              <div class="row"><span class="lbl">Filiere</span><span class="val">${fil?.code||"?"} — ${fil?.name||""}</span></div>
              <div class="row"><span class="lbl">Session</span><span class="val sess">${e.session==="soir"?"Cours du Soir":"Cours du Jour"}</span></div>
              <div class="row"><span class="lbl">Identifiant</span><span class="val id">${user?.id||"—"}</span></div>
              <div class="row"><span class="lbl">Mot de passe</span><span class="val">etu123</span></div>
            </div>
          </div>
          <div class="footer">Valable pour l'annee academique ${e.anneeAcademique||""}</div>
        </div>
      `;
    }).join('');

    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cartes Etudiants</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;background:#f0f0f0;padding:20px;}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:900px;margin:0 auto;}
      .card{background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #ddd;page-break-inside:avoid;}
      .header{background:linear-gradient(135deg,#1a3a6b,#2563eb);color:#fff;padding:12px 16px;}
      .etab{font-size:11px;opacity:0.85;font-weight:600;text-transform:uppercase;letter-spacing:1px;}
      .titre{font-size:15px;font-weight:700;margin:4px 0;}
      .annee{font-size:11px;opacity:0.8;}
      .body{display:flex;gap:12px;padding:14px 16px;align-items:flex-start;}
      .avatar{width:52px;height:52px;border-radius:50%;background:#1a3a6b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;}
      .infos{flex:1;}
      .nom{font-size:15px;font-weight:700;color:#111;margin-bottom:8px;}
      .row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f0f0f0;font-size:12px;}
      .lbl{color:#666;}
      .val{font-weight:600;color:#111;}
      .mat{color:#2563eb;font-family:monospace;}
      .id{color:#059669;font-family:monospace;}
      .sess{color:#7c3aed;}
      .footer{background:#f8f8f8;padding:8px 16px;font-size:10px;color:#888;text-align:center;border-top:1px solid #eee;}
      @media print{body{background:#fff;padding:0;}.grid{gap:10px;}}
    </style></head><body>
    <div class="grid">${cards}</div>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    w.document.close();
  }

  const inp = {background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:12,outline:"none"};

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:24,fontWeight:700,color:"#34d399"}}>Imprimer les cartes</h2>
        <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>Selectionnez les etudiants puis imprimez leurs cartes d'identifiant.</p>
      </div>

      {/* Filtres */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:2,minWidth:160}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Nom, matricule..." style={{...inp,paddingLeft:30,width:"100%",boxSizing:"border-box"}}/>
        </div>
        <select value={fA} onChange={e=>setFA(e.target.value)} style={{...inp,minWidth:130}}>
          <option value="all">Toutes annees</option>
          {annees.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <select value={fF} onChange={e=>setFF(e.target.value)} style={{...inp,minWidth:130}}>
          <option value="all">Toutes filieres</option>
          {data.filieres.map(f=><option key={f.id} value={f.id}>{f.code}</option>)}
        </select>
        <div style={{display:"flex",gap:6}}>
          {[["all","Tous"],["jour","Jour"],["soir","Soir"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFS(v)} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:fS===v?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",border:fS===v?"1px solid rgba(52,211,153,0.5)":"1px solid var(--border)",color:fS===v?"#34d399":"var(--text3)"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Barre sélection + impression */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={selAll} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399"}}>
            Tout selectionner ({filtered.length})
          </button>
          <button onClick={deselAll} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text3)"}}>
            Deselectionner
          </button>
          <span style={{fontSize:12,color:"var(--text3)"}}>{sel.length} selectionne(s)</span>
        </div>
        <button onClick={imprimer} disabled={aImprimer.length===0} style={{
          background:aImprimer.length>0?"#34d399":"rgba(255,255,255,0.05)",
          border:"none",borderRadius:8,padding:"10px 22px",
          color:aImprimer.length>0?"#042c1a":"var(--text3)",
          fontWeight:700,fontSize:14,cursor:aImprimer.length===0?"not-allowed":"pointer",
          display:"flex",alignItems:"center",gap:8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimer {aImprimer.length>0?"("+aImprimer.length+")":""}
        </button>
      </div>

      {/* Grille apercu cartes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {filtered.map(e=>{
          const fil  = data.filieres.find(f=>f.id===e.filiereId);
          const user = data.users.find(u=>u.etudiantId===e.id);
          const isSel = sel.includes(e.id);
          const initials = e.name.split(" ").slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("");
          return (
            <div key={e.id} onClick={()=>toggleSel(e.id)} style={{
              border:isSel?"2px solid #34d399":"1px solid var(--border)",
              borderRadius:12,overflow:"hidden",cursor:"pointer",
              background:isSel?"rgba(52,211,153,0.06)":"var(--bg2)",
              transition:"all 0.15s",
            }}>
              {/* Header carte */}
              <div style={{background:"linear-gradient(135deg,#0f2a5c,#1d4ed8)",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>
                    {data.parametres.nomEtablissement||"Universite"}
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:2}}>Carte d'etudiant</div>
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{e.anneeAcademique}</div>
              </div>
              {/* Corps carte */}
              <div style={{padding:"12px 14px",display:"flex",gap:10}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"#1d4ed8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,flexShrink:0}}>
                  {initials}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--text)",marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                  {[
                    ["Matricule", e.matricule, "#38bdf8"],
                    ["Filiere",   fil?.code,   "#a78bfa"],
                    ["Login",     user?.id,    "#34d399"],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0"}}>
                      <span style={{color:"var(--text3)"}}>{l}</span>
                      <span style={{fontWeight:700,color:c,fontFamily:"monospace"}}>{v||"—"}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Checkbox visuel */}
              <div style={{padding:"6px 14px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:16,height:16,borderRadius:4,border:isSel?"none":"1px solid var(--border)",background:isSel?"#34d399":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {isSel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#042c1a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{fontSize:11,color:isSel?"#34d399":"var(--text3)"}}>{isSel?"Selectionne":"Cliquer pour selectionner"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"60px",color:"var(--text3)"}}>
          Aucun etudiant ne correspond aux filtres
        </div>
      )}
    </div>
  );
}

// ── Liste étudiants ───────────────────────────────────
function ListeEtudiants({ data }) {
  const annees = data.parametres.anneesDisponibles || ["2024/2025"];
  const [fA,setFA]=useState(data.parametres.anneeActive||annees[0]);
  const [fF,setFF]=useState("all");
  const [fS,setFS]=useState("all");
  const [q,setQ]=useState("");
  const [pg,setPg]=useState(1);
  const filtered=useMemo(()=>data.etudiants.filter(e=>{
    const aOk=fA==="all"||e.anneeAcademique===fA;
    const fOk=fF==="all"||e.filiereId===parseInt(fF);
    const sOk=fS==="all"||e.session===fS;
    const sq=q.toLowerCase();
    const qOk=!sq||e.name.toLowerCase().includes(sq)||e.matricule?.toLowerCase().includes(sq);
    return aOk&&fOk&&sOk&&qOk;
  }),[data.etudiants,fA,fF,fS,q]);
  const tot=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  const pg2=Math.min(pg,tot);
  const rows=filtered.slice((pg2-1)*PER_PAGE,pg2*PER_PAGE);
  const inp={background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:12,outline:"none"};
  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:24,fontWeight:700,color:"#34d399"}}>Liste des etudiants</h2>
        <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>{filtered.length} etudiant(s)</p>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 18px"}}>
        <div style={{position:"relative",flex:2,minWidth:160}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={q} onChange={e=>{setQ(e.target.value);setPg(1);}} placeholder="Nom, matricule..." style={{...inp,paddingLeft:30,width:"100%",boxSizing:"border-box"}}/>
        </div>
        <select value={fA} onChange={e=>{setFA(e.target.value);setPg(1);}} style={{...inp,minWidth:130}}>
          <option value="all">Toutes annees</option>
          {annees.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <SearchSelect
          value={fF}
          onChange={v=>{setFF(v);if(typeof setPg==='function')setPg(1);}}
          options={data.filieres.map(f=>({value:String(f.id), label:f.code}))}
          allLabel="Toutes filieres"
          placeholder="Filiere..."
          style={{minWidth:130}}
          color="#34d399"
        />
        <div style={{display:"flex",gap:6}}>
          {[["all","Tous"],["jour","Jour"],["soir","Soir"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setFS(v);setPg(1);}} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:fS===v?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)",border:fS===v?"1px solid rgba(52,211,153,0.5)":"1px solid var(--border)",color:fS===v?"#34d399":"var(--text3)"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
            {["Matricule","Nom","Filiere","Annee","Session","Identifiant"].map(h=>(
              <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text3)"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.length===0?(<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"var(--text3)"}}>Aucun etudiant</td></tr>)
            :rows.map(e=>{
              const fil=data.filieres.find(f=>f.id===e.filiereId);
              const usr=data.users.find(u=>u.etudiantId===e.id);
              return (<tr key={e.id} style={{borderBottom:"1px solid var(--border)"}}>
                <td style={{padding:"10px 14px"}}><span style={{fontFamily:"monospace",fontSize:12,color:"#38bdf8",fontWeight:700}}>{e.matricule}</span></td>
                <td style={{padding:"10px 14px"}}><div style={{fontWeight:600,color:"var(--text)",fontSize:13}}>{e.name}</div>{e.email&&<div style={{fontSize:11,color:"var(--text3)"}}>{e.email}</div>}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:5,padding:"2px 8px",fontSize:11,color:"#a78bfa",fontWeight:700}}>{fil?.code||"?"}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontSize:12,color:"#f0c040",fontWeight:700}}>{e.anneeAcademique||"—"}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{background:e.session==="soir"?"rgba(99,102,241,0.1)":"rgba(251,191,36,0.1)",border:e.session==="soir"?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(251,191,36,0.3)",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700,color:e.session==="soir"?"#818cf8":"#fbbf24"}}>{e.session==="soir"?"Soir":"Jour"}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontFamily:"monospace",fontSize:12,color:"#34d399",fontWeight:700}}>{usr?.id||"—"}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {tot>1&&(
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14,flexWrap:"wrap"}}>
          <button onClick={()=>setPg(p=>Math.max(1,p-1))} disabled={pg2===1} style={{...inp,padding:"6px 14px",cursor:pg2===1?"not-allowed":"pointer",opacity:pg2===1?0.4:1}}>← Prec.</button>
          {Array.from({length:tot},(_,i)=>i+1).filter(p=>p===1||p===tot||Math.abs(p-pg2)<=2).reduce((acc,p,i,arr)=>{if(i>0&&p-arr[i-1]>1)acc.push("...");acc.push(p);return acc;},[]).map((p,i)=>p==="..."?<span key={"e"+i} style={{padding:"6px 4px",color:"var(--text3)"}}>…</span>:<button key={p} onClick={()=>setPg(p)} style={{...inp,padding:"6px 12px",cursor:"pointer",background:p===pg2?"rgba(52,211,153,0.2)":inp.background,border:p===pg2?"1px solid rgba(52,211,153,0.5)":inp.border,color:p===pg2?"#34d399":"var(--text2)",fontWeight:p===pg2?700:400}}>{p}</button>)}
          <button onClick={()=>setPg(p=>Math.min(tot,p+1))} disabled={pg2===tot} style={{...inp,padding:"6px 14px",cursor:pg2===tot?"not-allowed":"pointer",opacity:pg2===tot?0.4:1}}>Suiv. →</button>
        </div>
      )}
    </div>
  );
}
