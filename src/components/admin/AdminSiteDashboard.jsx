import { useState, useEffect } from "react";
import Layout from "../shared/Layout";
import { api } from "../../api";

const svg = (paths) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d}/>)}
  </svg>
);

const ICONS = {
  dashboard: svg(["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"]),
  users:     svg(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]),
  profil:    svg(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]),
};

function GestionPersonnel({ user, onMessage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "", password: "", name: "", role: "secretaire", site_id: ""
  });
  
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  
  // On initialise siteId à null, il sera récupéré dynamiquement
  const [siteId, setSiteId] = useState(null);

  useEffect(() => { chargerUsers(); }, []);

  async function chargerUsers() {
    try {
      const allUsers = await api.getUsers();
      
      // SOLUTION : On cherche ton propre compte dans la liste pour trouver ton site_id
      const monCompte = allUsers.find(u => u.id === user?.id);
      const monSiteId = monCompte?.site_id;
      
      // On le sauvegarde dans le state
      setSiteId(monSiteId);
      setForm(prev => ({ ...prev, site_id: monSiteId || "" }));

      // Maintenant on filtre les secrétaires et surveillants qui ont CE site_id
      const siteUsers = allUsers.filter(u => 
        u.site_id === monSiteId && (u.role === "secretaire" || u.role === "surveillant")
      );
      
      setUsers(siteUsers);
    } catch(e) {
      console.error("Erreur chargement users:", e);
      setUsers([]);
    }
  }

  async function createUser(e) {
    e.preventDefault();
    if (!form.id || !form.password || !form.name) {
      onMessage("Tous les champs sont requis", "error"); return;
    }
    setLoading(true);
    try {
      await api.createUser({ ...form, site_id: siteId });
      onMessage(`Compte ${form.role} créé avec succès`, "success");
      setForm({ id: "", password: "", name: "", role: "secretaire", site_id: siteId });
      chargerUsers();
    } catch(err) {
      onMessage("Erreur: " + (err.message || "Impossible de créer"), "error");
    }
    setLoading(false);
  }

  async function deleteUser(userId) {
    if (!confirm("Supprimer ce compte ?")) return;
    try {
      await api.deleteUser(userId);
      chargerUsers();
      onMessage("Utilisateur supprimé", "success");
    } catch(e) { onMessage("Erreur: " + e.message, "error"); }
  }

  async function handleChangePassword() {
    if (!newPwd || !pwdTarget) return;
    setLoading(true);
    try {
      await api.resetPassword(pwdTarget, newPwd);
      alert("Mot de passe modifié !");
      setPwdTarget(null); setNewPwd("");
    } catch (err) { alert("Erreur: " + err.message); }
    setLoading(false);
  }

  const getRoleBadge = (role) => {
    const color = role === "secretaire" ? "#38bdf8" : "#f0c040";
    return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: color + "20", color, textTransform: "uppercase" }}>{role}</span>;
  };

  const styles = {
    form: { background: "var(--bg2)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" },
    input: { width: "100%", padding: "12px", marginBottom: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)" },
    select: { width: "100%", padding: "12px", marginBottom: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)" },
    button: { padding: "12px 24px", background: "#f0c040", border: "none", borderRadius: "8px", color: "#1a1200", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 },
    userRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", marginBottom: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--border)" },
    deleteBtn: { padding: "6px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: "6px", color: "#ef4444", cursor: "pointer", fontSize: "12px" },
    pwdBtn: (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: color + "20", color: color })
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <form onSubmit={createUser} style={styles.form}>
          <h3 style={{ color: "#f0c040", marginBottom: "16px" }}>Créer un compte</h3>
          <div style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "16px" }}>Site ID: <strong>{siteId || "Chargement..."}</strong></div>
          <select style={styles.select} value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
            <option value="secretaire">Secrétaire</option>
            <option value="surveillant">Surveillant</option>
          </select>
          <input style={styles.input} placeholder="Identifiant (login)" value={form.id} onChange={(e) => setForm({...form, id: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
          <input style={styles.input} placeholder="Nom complet" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <button type="submit" style={styles.button} disabled={loading}>{loading ? "Création..." : "Créer le compte"}</button>
        </form>

        <div style={{ background: "var(--bg2)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h3 style={{ color: "#f0c040", marginBottom: "16px" }}>Personnel du site ({users.length})</h3>
          {users.length === 0 ? (
            <p style={{ color: "var(--text2)" }}>Aucun compte créé pour le moment.</p>
          ) : (
            <div>
              {users.map(u => (
                <div key={u.id} style={styles.userRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{u.name}</span>
                      {getRoleBadge(u.role)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>Login : <strong>{u.id}</strong></div>
                    {pwdTarget === u.id ? (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <input style={{...styles.input, width: "60%", marginBottom: 0, padding: "6px 10px", fontSize: 12}} type="password" placeholder="Nouveau mdp" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()} autoFocus />
                        <button onClick={handleChangePassword} disabled={loading} style={{...styles.pwdBtn("#34d399"), opacity: loading ? 0.5 : 1}}>✓</button>
                        <button onClick={() => { setPwdTarget(null); setNewPwd(""); }} style={styles.pwdBtn("#ef4444")}>✗</button>
                      </div>
                    ) : (
                      <button onClick={() => setPwdTarget(u.id)} style={{...styles.pwdBtn("#f0c040"), marginTop: 8, fontSize: 11}}>🔑 Modifier le mot de passe</button>
                    )}
                  </div>
                  <button onClick={() => deleteUser(u.id)} style={styles.deleteBtn}>Supprimer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteOverview({ user }) {
  const [stats, setStats] = useState({ etudiants: 0, siteId: null });
  useEffect(() => { chargerStats(); }, []);
  async function chargerStats() {
    try {
      // Pareil ici : on va chercher le vrai site_id depuis l'API
      const allUsers = await api.getUsers();
      const monCompte = allUsers.find(u => u.id === user?.id);
      const monSiteId = monCompte?.site_id;
      
      const etudiants = await api.getEtudiants();
      setStats({ 
        etudiants: monSiteId ? etudiants.filter(e => e.site_id === monSiteId).length : 0,
        siteId: monSiteId
      });
    } catch(e) { setStats({ etudiants: 0, siteId: null }); }
  }
  const styles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
    card: { background: "var(--bg2)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" },
    value: { fontSize: "32px", fontWeight: 700, color: "#f0c040" },
    label: { fontSize: "13px", color: "var(--text2)", marginTop: "4px" },
    info: { background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.3)", padding: "16px", borderRadius: "8px", color: "var(--text)", lineHeight: "1.8" }
  };
  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.card}><div style={styles.value}>{stats.etudiants}</div><div style={styles.label}>Étudiants du site</div></div>
        <div style={styles.card}><div style={styles.value}>{user?.site_name || stats.siteId || "N/A"}</div><div style={styles.label}>Site</div></div>
      </div>
      <div style={styles.info}>
        <strong style={{ color: "#34d399" }}>Vos responsabilités:</strong>
        <ul style={{ marginTop: "12px", paddingLeft: "20px" }}>
          <li>Créer les comptes <strong>secrétaires</strong> et <strong>surveillants</strong></li>
          <li>La <strong>secrétaire</strong> créera les comptes étudiants</li>
          <li>Le <strong>surveillant</strong> gérera l'emploi du temps</li>
        </ul>
      </div>
    </div>
  );
}

function SiteProfil({ user }) {
  return (
    <div style={{ background: "var(--bg2)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", maxWidth: "500px" }}>
      <h3 style={{ color: "#f0c040", marginBottom: "20px" }}>Mon profil</h3>
      {[["Identifiant", user?.id], ["Nom", user?.name], ["Rôle", user?.role], ["Site", user?.site_name || "N/A"]].map(([label, val]) => (
        <div style={{ marginBottom: "12px" }} key={label}><div style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "4px" }}>{label}</div><div style={{ fontSize: "16px", color: label === "Rôle" ? "#f0c040" : "var(--text)" }}>{val}</div></div>
      ))}
    </div>
  );
}

export default function AdminSiteDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState({ text: "", type: "" });
  const handleMessage = (text, type = "info") => { setMessage({ text, type }); setTimeout(() => setMessage({ text: "", type: "" }), 5000); };
  const nav = [
    { id: "overview", icon: ICONS.dashboard, label: "Vue d'ensemble" },
    { id: "personnel", icon: ICONS.users, label: "Gestion du personnel" },
    { id: "profil", icon: ICONS.profil, label: "Mon profil" },
  ];

  return (
    <Layout user={user} role="admin_site" onLogout={onLogout} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {message.text && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: message.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: message.type === "success" ? "#34d399" : "#ef4444", border: `1px solid ${message.type === "success" ? "#34d399" : "#ef4444"}` }}>{message.text}</div>
      )}
      {tab === "overview" && <SiteOverview user={user} />}
      {tab === "personnel" && <GestionPersonnel user={user} onMessage={handleMessage} />}
      {tab === "profil" && <SiteProfil user={user} />}
    </Layout>
  );
}
