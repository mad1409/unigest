import { useState, useEffect } from "react";
import { api } from "../../api";

export default function GestionSites() {
  const [sites, setSites] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", adresse: "", tel: "" });
  const [loading, setLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ id: "", password: "", name: "", site_id: "" });
  const [message, setMessage] = useState("");
  
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => { 
    charger(); 
    fetchAllUsers(); 
  }, []);

  async function charger() {
    try {
      const r = await api.getSites();
      setSites(Array.isArray(r) ? r : []);
    } catch(e) { 
      console.error("Erreur chargement sites:", e);
      setSites([]);
    }
  }

  async function fetchAllUsers() {
    try {
      const users = await api.getUsers();
      
      setAllUsers((Array.isArray(users) ? users : []).filter(u => u.role === "admin_site"));
    } catch(e) {
      alert("ERREUR API Users : " + e.message);
      setAllUsers([]);
    }
  }

  function openNew() {
    setForm({ nom: "", adresse: "", tel: "" });
    setEditing(null);
    setModal(true);
  }

  function openEdit(s) {
    setForm({ nom: s.nom, adresse: s.adresse || "", tel: s.tel || "" });
    setEditing(s.id);
    setModal(true);
  }

  async function save() {
    if (!form.nom) return;
    setLoading(true);
    try {
      if (editing) await api.updateSite(editing, form);
      else await api.createSite(form);
      await charger();
      setModal(false);
    } catch(e) { alert(e.message || "Erreur lors de la sauvegarde"); }
    setLoading(false);
  }

  async function del(id) {
    if (!confirm("Supprimer ce site ?")) return;
    try { await api.deleteSite(id); await charger(); } catch(e) { alert(e.message); }
  }

  async function toggleActif(s) {
    try { await api.updateSite(s.id, { ...s, actif: !s.actif }); await charger(); } catch(e) { alert(e.message); }
  }

  async function createAdminSite() {
    if (!newAdmin.id || !newAdmin.password || !newAdmin.name || !newAdmin.site_id) {
      setMessage("Tous les champs sont requis"); return;
    }
    setLoading(true); setMessage("");
    try {
      await api.createAdminSite({ id: newAdmin.id, password: newAdmin.password, name: newAdmin.name, site_id: newAdmin.site_id });
      setMessage("Administrateur de site créé avec succès");
      setNewAdmin({ id: "", password: "", name: "", site_id: "" });
      await fetchAllUsers();
    } catch (err) { setMessage("Erreur: " + (err.message || "Impossible de créer l'admin")); }
    setLoading(false);
  }

  async function handleChangePassword() {
    if (!newPwd || !pwdTarget) return;
    setLoading(true);
    try {
      await api.resetPassword(pwdTarget, newPwd);
      alert("Mot de passe modifié avec succès !");
      setPwdTarget(null); setNewPwd("");
    } catch (err) { alert("Erreur: " + (err.message || "Impossible de modifier le mot de passe")); }
    setLoading(false);
  }

  const inp = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 9, padding: "11px 14px", color: "var(--text)", fontSize: 14, marginBottom: 12 };
  const btn = { background: "#f0c040", border: "none", borderRadius: 10, padding: "10px 24px", color: "#1a1200", fontSize: 14, fontWeight: 700, cursor: "pointer", height: 42 };
  const styles = {
    container: { padding: 24 }, header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 700, color: "#f0c040" }, grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
    card: { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: "var(--text)" }, cardInfo: { fontSize: 13, color: "var(--text2)", marginBottom: 8 },
    actions: { display: "flex", gap: 8, marginTop: 12 },
    actionBtn: (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: color + "20", color: color }),
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "90%", maxWidth: 400 },
    modalTitle: { fontSize: 18, fontWeight: 700, color: "#f0c040", marginBottom: 20 },
    section: { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: "#f0c040", marginBottom: 16 },
    message: (type) => ({ padding: "12px 16px", borderRadius: 8, marginBottom: 16, background: type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: type === "success" ? "#34d399" : "#ef4444", border: `1px solid ${type === "success" ? "#34d399" : "#ef4444"}` }),
    userRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", marginBottom: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--border)" }
  };

  const getSiteName = (siteId) => { const site = sites.find(s => s.id === siteId); return site ? site.nom : siteId; };

  const getRoleBadge = (role) => {
    const colors = { 'admin': '#ef4444', 'admin_site': '#f0c040', 'secretaire': '#38bdf8', 'surveillant': '#34d399', 'professeur': '#a78bfa', 'etudiant': '#94a3b8' };
    const color = colors[role] || "#94a3b8";
    return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: color + "20", color: color, textTransform: "uppercase" }}>{role}</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestion des Sites & Comptes</h2>
        <button onClick={openNew} style={btn}>+ Nouveau site</button>
      </div>

      <div style={styles.grid}>
        {sites.map(s => (
          <div key={s.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{s.nom}</span>
              <span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 11, background: s.actif ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)", color: s.actif ? "#34d399" : "#ef4444" }}>{s.actif ? "Actif" : "Inactif"}</span>
            </div>
            <div style={styles.cardInfo}>ID: {s.id}</div>
            {s.adresse && <div style={styles.cardInfo}>{s.adresse}</div>}
            {s.tel && <div style={styles.cardInfo}>Tél: {s.tel}</div>}
            <div style={styles.actions}>
              <button onClick={() => openEdit(s)} style={styles.actionBtn("#38bdf8")}>Modifier</button>
              <button onClick={() => toggleActif(s)} style={styles.actionBtn(s.actif ? "#ef4444" : "#34d399")}>{s.actif ? "Désactiver" : "Activer"}</button>
              <button onClick={() => del(s.id)} style={styles.actionBtn("#ef4444")}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Créer un administrateur de site</h3>
        {message && <div style={styles.message(message.includes("succès") ? "success" : "error")}>{message}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
          <select style={inp} value={newAdmin.site_id} onChange={(e) => setNewAdmin({...newAdmin, site_id: e.target.value})}>
            <option value="">Sélectionner un site</option>
            {sites.map(s => (<option key={s.id} value={s.id}>{s.nom}</option>))}
          </select>
          <input style={inp} placeholder="Identifiant admin" value={newAdmin.id} onChange={(e) => setNewAdmin({...newAdmin, id: e.target.value})} />
          <input style={inp} type="password" placeholder="Mot de passe" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} />
          <input style={inp} placeholder="Nom complet" value={newAdmin.name} onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} />
        </div>
        <button onClick={createAdminSite} style={{ ...btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>{loading ? "Création..." : "Créer Admin Site"}</button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Comptes administrateurs de site ({allUsers.length})</h3>
        {allUsers.length === 0 ? (
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Aucun compte utilisateur trouvé.</p>
        ) : (
          <div>
            {allUsers.map(u => (
              <div key={u.id} style={styles.userRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{u.name || u.id}</span>
                    {getRoleBadge(u.role)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>Login : <strong>{u.id}</strong> {u.site_id && `| Site : ${getSiteName(u.site_id)}`}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {pwdTarget === u.id ? (
                    <>
                      <input style={{...inp, width: 180, marginBottom: 0, padding: "8px 12px", fontSize: 13}} type="password" placeholder="Nouveau mot de passe" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()} autoFocus />
                      <button onClick={handleChangePassword} disabled={loading} style={{...styles.actionBtn("#34d399"), opacity: loading ? 0.5 : 1}}>{loading ? "..." : "✓"}</button>
                      <button onClick={() => { setPwdTarget(null); setNewPwd(""); }} style={styles.actionBtn("#ef4444")}>✗</button>
                    </>
                  ) : (
                    <button onClick={() => setPwdTarget(u.id)} style={styles.actionBtn("#f0c040")}>🔑 Mot de passe</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div style={styles.modal} onClick={() => setModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{editing ? "Modifier le site" : "Nouveau site"}</h3>
            <input style={inp} placeholder="Nom du site" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} />
            <input style={inp} placeholder="Adresse" value={form.adresse} onChange={(e) => setForm({...form, adresse: e.target.value})} />
            <input style={inp} placeholder="Téléphone" value={form.tel} onChange={(e) => setForm({...form, tel: e.target.value})} />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(false)} style={{...btn, background: "transparent", color: "var(--text)"}}>Annuler</button>
              <button onClick={save} style={{...btn, opacity: loading ? 0.6 : 1}} disabled={loading}>{loading ? "..." : (editing ? "Modifier" : "Créer")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
