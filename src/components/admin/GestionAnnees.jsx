import { useState, useEffect } from "react";
import { api } from "../../api";

const inp = { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", width: "100%", marginBottom: 10, fontSize: 14, boxSizing: "border-box" };
const btnPrimary = { padding: "10px 20px", background: "#f0c040", color: "#1a1200", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnDanger  = { padding: "8px 14px", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 };

export default function GestionAnnees({ showMsg = (m) => alert(m) }) {
  const [annees,  setAnnees]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ libelle: "", date_debut: "", date_fin: "" });

  async function charger() {
    try { setAnnees(await api.getAnnees()); } catch(e) { showMsg(e.message); }
  }

  useEffect(() => { charger(); }, []);

  // Générer automatiquement le libellé depuis les dates
  function onDateChange(key, val) {
    const newForm = { ...form, [key]: val };
    if (newForm.date_debut) {
      const year = new Date(newForm.date_debut).getFullYear();
      newForm.libelle = year + "-" + (year + 1);
    }
    setForm(newForm);
  }

  async function creer() {
    if (!form.libelle || !form.date_debut || !form.date_fin)
      return showMsg("Tous les champs sont requis");
    if (new Date(form.date_fin) <= new Date(form.date_debut))
      return showMsg("La date de fin doit être après la date de début");
    setLoading(true);
    try {
      await api.createAnnee(form);
      showMsg("Année créée avec succès", "success");
      setShowForm(false);
      setForm({ libelle: "", date_debut: "", date_fin: "" });
      await charger();
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  async function activer(annee) {
    if (!confirm("Activer l année " + annee.libelle + " ?\n\nCeci va :\n• Archiver les notes de l année en cours\n• Faire passer les étudiants au niveau supérieur (L1→L2, L2→L3, M1→M2)")) return;
    setLoading(true);
    try {
      const r = await api.activerAnnee(annee.id);
      showMsg(r.message || "Année activée avec succès", "success");
      await charger();
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  async function supprimer(annee) {
    if (!confirm("Supprimer l année " + annee.libelle + " ?")) return;
    setLoading(true);
    try {
      await api.deleteAnnee(annee.id);
      showMsg("Année supprimée", "success");
      await charger();
    } catch(e) { showMsg(e.message); }
    setLoading(false);
  }

  const anneeActive = annees.find(a => a.active);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f0c040" }}>Années Académiques</h2>
          {anneeActive && (
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
              Année en cours : <span style={{ color: "#34d399", fontWeight: 700 }}>{anneeActive.libelle}</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
          + Nouvelle année
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div style={{ background: "var(--bg2)", border: "1px solid #f0c040", borderRadius: 12, padding: 22, marginBottom: 24 }}>
          <h4 style={{ color: "#f0c040", marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Créer une nouvelle année académique</h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Date de début *</div>
              <input type="date" style={inp} value={form.date_debut} onChange={e => onDateChange("date_debut", e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Date de fin *</div>
              <input type="date" style={inp} value={form.date_fin} onChange={e => onDateChange("date_fin", e.target.value)} />
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Libellé (généré automatiquement)</div>
          <input style={{ ...inp, color: "#f0c040", fontWeight: 700 }} value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="ex: 2025-2026" />

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={creer} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Création..." : "Créer"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", color: "var(--text2)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des années */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {annees.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Aucune année académique. Créez-en une.</div>
        )}
        {annees.map(a => (
          <div key={a.id} style={{
            background: "var(--bg2)", border: a.active ? "1px solid #34d399" : "1px solid var(--border)",
            borderRadius: 12, padding: "18px 22px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: a.active ? "#34d399" : "var(--text)" }}>{a.libelle}</span>
                {a.active && (
                  <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    EN COURS
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>
                📅 Du {new Date(a.date_debut).toLocaleDateString("fr-FR")} au {new Date(a.date_fin).toLocaleDateString("fr-FR")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!a.active && (
                <button onClick={() => activer(a)} disabled={loading} style={{
                  padding: "8px 16px", background: "rgba(52,211,153,0.12)", color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.3)", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
                }}>
                  ▶ Activer
                </button>
              )}
              {!a.active && (
                <button onClick={() => supprimer(a)} disabled={loading} style={btnDanger}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
