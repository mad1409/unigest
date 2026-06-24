import React, { useState } from 'react';

const inp = { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", width: "100%", marginBottom: 10, fontSize: 14 };
const btnPrimary = { padding: "12px 20px", background: "#f0c040", color: "#1a1200", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnDanger  = { padding: "8px 14px", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 };
const btnEdit    = { padding: "8px 14px", background: "rgba(240,192,64,0.12)", color: "#f0c040", border: "1px solid rgba(240,192,64,0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 };

export default function GestionAnnexes({ data = {}, setData, api, charger = async () => {}, showMsg = (m) => alert(m) }) {
  const [activeTab, setActiveTab] = useState("annexes");
  const [loading, setLoading] = useState(false);
  const [transfert, setTransfert] = useState({ type: "etudiant", id: "", annexe_id: "" });
  const [transfertType, setTransfertType] = useState("etudiant");
  const [filterCycle, setFilterCycle] = useState("Tous");
  const [filterFiliere, setFilterFiliere] = useState("");
  const [filterSession,  setFilterSession]  = useState("Tous");
  const [filterSessionF, setFilterSessionF] = useState("Tous");
  const [tFiliere, setTFiliere] = useState({ filiere_id: "", annexe_id: "" });
  const [tSurv, setTSurv] = useState({ id: "", annexe_id: "" });

  const [showForm, setShowForm] = useState(false);
  const [editAnnexe, setEditAnnexe] = useState(null);
  const [formAnnexe, setFormAnnexe] = useState({ nom: "", adresse: "" });

  const annexes   = data?.annexes   || [];
  const etudiants = data?.etudiants || [];
  const users     = data?.users     || [];

  function getAnnexeName(id) {
    const a = annexes.find(x => String(x.id) === String(id));
    return a ? a.nom : "";
  }

  function openCreate() {
    setEditAnnexe(null);
    setFormAnnexe({ nom: "", adresse: "" });
    setShowForm(true);
  }

  function openEdit(a) {
    setEditAnnexe(a);
    setFormAnnexe({ nom: a.nom || "", adresse: a.adresse || "" });
    setShowForm(true);
  }

  async function saveAnnexe() {
    if (!formAnnexe.nom.trim()) return showMsg("Le nom est obligatoire");
    setLoading(true);
    try {
      if (editAnnexe) {
        await api.updateAnnexe(editAnnexe.id, formAnnexe);
        showMsg("Annexe modifiée avec succès", "success");
      } else {
        await api.createAnnexe(formAnnexe);
        showMsg("Annexe créée avec succès", "success");
      }
      setShowForm(false);
      await charger();
      if (setData) setData();
    } catch (e) { showMsg(e.message || e); }
    setLoading(false);
  }

  async function deleteAnnexe(a) {
    if (!confirm("Supprimer l annexe " + a.nom + " ? Les étudiants/profs liés seront détachés.")) return;
    setLoading(true);
    try {
      await api.deleteAnnexe(a.id);
      showMsg("Annexe supprimée", "success");
      await charger();
      if (setData) setData();
    } catch (e) { showMsg(e.message || e); }
    setLoading(false);
  }

  async function doTransfertFiliere() {
    console.log('TRANSFERT FILIERE:', tFiliere);
    if (!tFiliere.filiere_id || !tFiliere.annexe_id) return showMsg("Sélectionner une filière et une annexe cible");
    if (!confirm("Transférer toute la filière vers cette annexe ? Les identifiants sont conservés.")) return;
    setLoading(true);
    try {
      const r = await api.transferFiliere({ filiere_id: parseInt(tFiliere.filiere_id), annexe_id: parseInt(tFiliere.annexe_id), session: filterSessionF });
      showMsg((r.nb_etudiants || 0) + " étudiant(s) transféré(s) avec succès", "success");
      setTFiliere({ filiere_id: "", annexe_id: "" });
      await charger(); if (setData) setData();
    } catch (e) { showMsg(e.message || e); }
    setLoading(false);
  }

  async function doTransfertSurv() {
    if (!tSurv.id || !tSurv.annexe_id) return showMsg("Sélectionner un surveillant et une annexe cible");
    setLoading(true);
    try {
      await api.transfert({ type: "surveillant", id: tSurv.id, annexe_id: parseInt(tSurv.annexe_id) });
      showMsg("Surveillant transféré avec succès", "success");
      setTSurv({ id: "", annexe_id: "" });
      await charger(); if (setData) setData();
    } catch (e) { showMsg(e.message || e); }
    setLoading(false);
  }

  async function doTransfert() {
    if (!transfert.id || !transfert.annexe_id) return showMsg("Sélectionner une personne et une annexe cible");
    setLoading(true);
    try {
      await api.transfert({ type: transfert.type, id: transfert.id, annexe_id: parseInt(transfert.annexe_id) });
      showMsg(transfert.type + " transféré avec succès", "success");
      setTransfert({ ...transfert, id: "", annexe_id: "" });
      await charger(); if (setData) setData();
    } catch (e) { showMsg(e.message || e); }
    setLoading(false);
  }

  const tabs = [
    { id: "annexes",   label: "Annexes" },
    { id: "etudiants", label: "Étudiants" },
    { id: "transfer",  label: "Transferts" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
            background: activeTab === t.id ? "#f0c040" : "rgba(255,255,255,0.06)",
            color: activeTab === t.id ? "#1a1200" : "var(--text2)"
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === "annexes" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f0c040", margin: 0 }}>Gestion des annexes</h3>
            <button onClick={openCreate} style={{ ...btnPrimary, padding: "10px 18px" }}>
              + Nouvelle annexe
            </button>
          </div>

          {showForm && (
            <div style={{ background: "var(--bg2)", border: "1px solid #f0c040", borderRadius: 12, padding: 22, marginBottom: 24, maxWidth: 500 }}>
              <h4 style={{ color: "#f0c040", marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                {editAnnexe ? "Modifier l annexe" : "Créer une nouvelle annexe"}
              </h4>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Nom *</div>
              <input style={inp} placeholder="Ex: Annexe Nord" value={formAnnexe.nom} onChange={e => setFormAnnexe({ ...formAnnexe, nom: e.target.value })} />
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Adresse</div>
              <input style={inp} placeholder="Ex: 12 rue des Écoles, Dakar" value={formAnnexe.adresse} onChange={e => setFormAnnexe({ ...formAnnexe, adresse: e.target.value })} />
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={saveAnnexe} disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Enregistrement..." : editAnnexe ? "Modifier" : "Créer"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.06)", color: "var(--text2)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {annexes.length === 0 && (
              <div style={{ color: "var(--text3)", fontSize: 14, padding: 20 }}>Aucune annexe. Créez-en une ci-dessus.</div>
            )}
            {annexes.map(a => (
              <div key={a.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.nom}</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12 }}>{a.adresse || "Adresse non renseignée"}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                </svg>
                {a.nb_etudiants || 0} étudiants
              </span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {a.nb_professeurs || 0} profs
              </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(a)} style={btnEdit}>Modifier</button>
                  <button onClick={() => deleteAnnexe(a)} style={btnDanger}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "etudiants" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f0c040", marginBottom: 16 }}>Liste des étudiants</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Nom</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Matricule</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Filière</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Annexe</th>
                </tr>
              </thead>
              <tbody>
                {etudiants.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "var(--text3)" }}>Aucun étudiant</td></tr>}
                {etudiants.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "10px 12px" }}>{e.name}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{e.matricule || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{e.filiere || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{getAnnexeName(e.annexe_id) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "transfer" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { id: "etudiant",    label: "Étudiant" },
              { id: "filiere",     label: "Filière entière" },
              { id: "surveillant", label: "Surveillant" },
            ].map(t => (
              <button key={t.id} onClick={() => setTransfertType(t.id)} style={{
                padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: transfertType === t.id ? "#f0c040" : "rgba(255,255,255,0.05)",
                color: transfertType === t.id ? "#1a1200" : "var(--text2)"
              }}>{t.label}</button>
            ))}
          </div>

          {transfertType === "etudiant" && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 560 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", marginBottom: 4 }}>Transfert d un étudiant</h3>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 18 }}>Identifiant et mot de passe conservés.</p>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Cycle</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Tous", "Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat"].map(cy => (
                    <button key={cy} onClick={() => { setFilterCycle(cy); setFilterFiliere(""); setTransfert({ ...transfert, id: "" }); }} style={{
                      padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12,
                      background: filterCycle === cy ? "rgba(240,192,64,0.2)" : "rgba(255,255,255,0.05)",
                      color: filterCycle === cy ? "#f0c040" : "var(--text3)"
                    }}>{cy}</button>
                  ))}
                </div>
              </div>
              <select style={inp} value={filterFiliere} onChange={e => { setFilterFiliere(e.target.value); setTransfert({ ...transfert, id: "" }); }}>
                <option value="">-- Toutes les filières --</option>
                {(data?.filieres || []).filter(f => {
                  if (filterCycle === "Tous") return true;
                  return f.cycle === filterCycle;
                }).map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
              </select>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {["Tous","jour","soir"].map(s => (
                  <button key={s} onClick={()=>setFilterSession(s)} style={{
                    flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer",
                    fontWeight:600, fontSize:12,
                    background: filterSession===s ? "#f0c040" : "rgba(255,255,255,0.05)",
                    color: filterSession===s ? "#1a1200" : "var(--text2)",
                  }}>
                    {s==="Tous" ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>
                        Tous
                      </span>
                    ) : s==="jour" ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        Jour
                      </span>
                    ) : (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        Soir
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <select style={inp} value={transfert.id} onChange={e => setTransfert({ ...transfert, id: e.target.value })}>
                <option value="">-- Sélectionner un étudiant --</option>
                {etudiants.filter(e => (!filterFiliere || String(e.filiere_id || e.filiereId) === String(filterFiliere)) && (filterSession === 'Tous' || e.session === filterSession)).map(e => (
                  <option key={e.id} value={e.id}>{e.name} · {e.matricule || ""}{e.annexe_id ? " (" + getAnnexeName(e.annexe_id) + ")" : " (sans annexe)"}</option>
                ))}
              </select>
              <select style={inp} value={transfert.annexe_id} onChange={e => setTransfert({ ...transfert, annexe_id: e.target.value })}>
                <option value="">-- Annexe cible --</option>
                {annexes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              <button onClick={doTransfert} disabled={loading || !transfert.id || !transfert.annexe_id} style={{ ...btnPrimary, width: "100%", opacity: (loading || !transfert.id || !transfert.annexe_id) ? 0.5 : 1 }}>
                {loading ? "Transfert en cours..." : "Transférer l étudiant"}
              </button>
            </div>
          )}

          {transfertType === "filiere" && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 560 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", marginBottom: 4 }}>Transfert d une filière entière</h3>
              <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#34d399" }}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Les comptes étudiants sont conservés avec leurs identifiants. Seule l'annexe est mise à jour.
                </span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Cycle</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Tous", "Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat"].map(cy => (
                    <button key={cy} onClick={() => { setFilterCycle(cy); setTFiliere({ ...tFiliere, filiere_id: "" }); }} style={{
                      padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12,
                      background: filterCycle === cy ? "rgba(240,192,64,0.2)" : "rgba(255,255,255,0.05)",
                      color: filterCycle === cy ? "#f0c040" : "var(--text3)"
                    }}>{cy}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {["Tous","jour","soir"].map(s => (
                  <button key={s} onClick={()=>setFilterSessionF(s)} style={{
                    flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer",
                    fontWeight:600, fontSize:12,
                    background: filterSessionF===s ? "#f0c040" : "rgba(255,255,255,0.05)",
                    color: filterSessionF===s ? "#1a1200" : "var(--text2)",
                  }}>
                    {s==="Tous" ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>
                        Tous
                      </span>
                    ) : s==="jour" ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        Jour
                      </span>
                    ) : (
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        Soir
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <select style={inp} value={tFiliere.filiere_id} onChange={e => setTFiliere({ ...tFiliere, filiere_id: e.target.value })}>
                <option value="">-- Sélectionner une filière --</option>
                {(data?.filieres || []).filter(f => {
                  if (filterCycle === "Tous") return true;
                  return f.cycle === filterCycle;
                }).map(f => {
                  const nb = etudiants.filter(e =>
                    String(e.filiere_id || e.filiereId) === String(f.id) &&
                    (filterSessionF === "Tous" || e.session === filterSessionF)
                  ).length;
                  return <option key={f.id} value={f.id}>{f.name} ({f.code}) — {nb} étudiant(s)</option>;
                })}
              </select>
              <select style={inp} value={tFiliere.annexe_id} onChange={e => setTFiliere({ ...tFiliere, annexe_id: e.target.value })}>
                <option value="">-- Annexe cible --</option>
                {annexes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              <button onClick={doTransfertFiliere} disabled={loading || !tFiliere.filiere_id || !tFiliere.annexe_id} style={{ ...btnPrimary, width: "100%", opacity: (loading || !tFiliere.filiere_id || !tFiliere.annexe_id) ? 0.5 : 1 }}>
                {loading ? "Transfert en cours..." : "Transférer la filière"}
              </button>
            </div>
          )}

          {transfertType === "surveillant" && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 560 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", marginBottom: 4 }}>Transfert d un surveillant</h3>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 18 }}>Identifiant et mot de passe conservés.</p>
              <select style={inp} value={tSurv.id} onChange={e => setTSurv({ ...tSurv, id: e.target.value })}>
                <option value="">-- Sélectionner un surveillant --</option>
                {users.filter(u => u.role === "surveillant").map(u => (
                  <option key={u.id} value={u.id}>{u.name} · {u.id}{u.annexe_id ? " (" + getAnnexeName(u.annexe_id) + ")" : " (sans annexe)"}</option>
                ))}
              </select>
              <select style={inp} value={tSurv.annexe_id} onChange={e => setTSurv({ ...tSurv, annexe_id: e.target.value })}>
                <option value="">-- Annexe cible --</option>
                {annexes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              <button onClick={doTransfertSurv} disabled={loading || !tSurv.id || !tSurv.annexe_id} style={{ ...btnPrimary, width: "100%", opacity: (loading || !tSurv.id || !tSurv.annexe_id) ? 0.5 : 1 }}>
                {loading ? "Transfert en cours..." : "Transférer le surveillant"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
