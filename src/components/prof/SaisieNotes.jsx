import SearchSelect from '../shared/SearchSelect';
import { api } from '../../api';
import { useState } from "react";
import { calcNoteMatiere, calcMoyenneUE, getMention } from "../../utils/calculs";
import { Modal, Field, inputStyle, btnSecondary, btnPrimary, modalTitle, modalFooter } from "../admin/GestionFilieres";

export default function SaisieNotes({ data, setData, prof }) {
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [modal,           setModal]           = useState(false);
  const [editingNote,     setEditingNote]     = useState(null);
  const [noteForm, setNoteForm] = useState({
    etudiantId: null, matiereId: null,
    noteClasse: "", noteExamen: "", semestre: 1,
  });
  const [filterSession, setFilterSession] = useState("all");

  // IDs des matières assignées au prof par l'admin
  const profMatiereIds = prof ? (prof.matieres || []) : [];

  // Récupérer les objets matières complets depuis les UEs
  const toutesLesMatieres = (data.ues || []).flatMap(ue =>
    (ue.matieres || []).map(m => ({ ...m, ue, semestre: ue.semestre }))
  );

  // Filtrer uniquement les matières assignées au prof
  const mesMatieres = toutesLesMatieres.filter(m =>
    profMatiereIds.includes(m.id)
  );

  // Filières disponibles pour la matière sélectionnée (via l'UE parente)
  const profFiliereIds = prof ? (prof.filiere_ids || prof.filiereIds || []) : [];
  const filieresDispos = selectedMatiere
    ? data.filieres.filter(f => {
        const ueFilieresIds = selectedMatiere.ue.filiereIds || selectedMatiere.ue.filiere_ids || [];
        const inUE   = ueFilieresIds.length === 0 || ueFilieresIds.includes(f.id);
        const inProf = profFiliereIds.length === 0 || profFiliereIds.includes(f.id);
        return inUE && inProf;
      })
    : [];

  const etudiantsBruts = selectedFiliere
    ? data.etudiants.filter(e => (e.filiereId || e.filiere_id) === selectedFiliere.id)
    : [];
  const etudiants = filterSession === "all"
    ? etudiantsBruts
    : etudiantsBruts.filter(e => e.session === filterSession);

  function getNote(etudiantId, matiereId) {
    return data.notes.find(n => n.etudiantId === etudiantId && n.matiereId === matiereId);
  }

  function openModal(etudiantId, matiere, noteExistante) {
    setNoteForm({
      etudiantId,
      matiereId:  matiere.id,
      noteClasse: noteExistante ? noteExistante.noteClasse : "",
      noteExamen: noteExistante ? noteExistante.noteExamen : "",
      semestre:   selectedMatiere.semestre,
    });
    setEditingNote(noteExistante ? noteExistante.id : null);
    setModal(true);
  }

  async function saveNote() {
    const nc = parseFloat(noteForm.noteClasse);
    const ne = noteForm.noteExamen !== "" ? parseFloat(noteForm.noteExamen) : null;
    if (isNaN(nc) || nc < 0 || nc > 20) {
      alert("La note de devoir doit etre entre 0 et 20"); return;
    }
    if (ne !== null && (isNaN(ne) || ne < 0 || ne > 20)) {
      alert("La note d'examen doit etre entre 0 et 20"); return;
    }
    try {
      await api.saveNote({
        etudiantId: noteForm.etudiantId,
        ueId:       selectedMatiere.ue.id,
        matiereId:  noteForm.matiereId,
        noteClasse: nc,
        noteExamen: ne !== null ? ne : null,
        semestre:   noteForm.semestre,
      });
      await setData();
      setModal(false);
    } catch(e) { alert(e.message); }
  }

  async function deleteNote(id) {
    if (!confirm("Supprimer cette note ?")) return;
    try { await api.deleteNote(id); await setData(); } catch(e) { alert(e.message); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: 24, fontWeight: 700, color: "#38bdf8" }}>Saisie des Notes</h2>
        <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>Selectionnez une matiere puis une filiere pour saisir les notes</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Etape 1 — Choisir la matière */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>
            1. Choisir la matiere
          </div>
          {mesMatieres.length === 0 ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>Aucune matiere assignee. Contactez l admin.</div>
          ) : (
            <SearchSelect
              value={selectedMatiere ? String(selectedMatiere.id) : ""}
              onChange={v => {
                const m = mesMatieres.find(x => String(x.id) === v);
                setSelectedMatiere(m || null);
                setSelectedFiliere(null);
              }}
              options={mesMatieres.map(m => ({
                value: String(m.id),
                label: m.name,
                sub:   m.ue.code + " · S" + m.semestre + " · " + (m.creditECUE || m.credit_ecue || 0) + " cr.",
              }))}
              placeholder="Rechercher une matiere..."
              allLabel="Choisir une matiere"
              color="#38bdf8"
            />
          )}
          {selectedMatiere && (
            <div style={{ marginTop: 12, background: "rgba(56,189,248,0.06)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8" }}>{selectedMatiere.name}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                UE : {selectedMatiere.ue.code} — {selectedMatiere.ue.intitule}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                Semestre {selectedMatiere.semestre} · {selectedMatiere.creditECUE || selectedMatiere.credit_ecue || 0} credits
              </div>
            </div>
          )}
        </div>

        {/* Etape 2 — Choisir la filière */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>
            2. Choisir la filiere
          </div>
          {!selectedMatiere ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>← Selectionnez d abord une matiere</div>
          ) : filieresDispos.length === 0 ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>Aucune filiere liee a cette matiere</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filieresDispos.map(f => {
                const nbEtu = data.etudiants.filter(e => (e.filiereId || e.filiere_id) === f.id).length;
                const active = selectedFiliere?.id === f.id;
                return (
                  <button key={f.id} onClick={() => setSelectedFiliere(f)} style={{
                    padding: "12px 14px", borderRadius: 10, textAlign: "left",
                    background: active ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                    border: active ? "2px solid rgba(56,189,248,0.6)" : "1px solid var(--border)",
                    cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#38bdf8" : "var(--text2)" }}>{f.code}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{f.name} — {nbEtu} etudiant(s)</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Etape 3 — Tableau notes */}
      {selectedMatiere && selectedFiliere && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
            {selectedMatiere.name} — {selectedFiliere.code}
          </div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>
            UE : {selectedMatiere.ue.code} • {etudiants.length} etudiant(s)
          </div>
          {etudiants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text3)" }}>Aucun etudiant dans cette filiere</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["Etudiant", "Matricule", "Note Devoir", "Note Examen", "Note Matiere", "Action"].map(h => (
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {etudiants.map(etu => {
                  const note = getNote(etu.id, selectedMatiere.id);
                  const nm   = note ? calcNoteMatiere(note.noteClasse, note.noteExamen) : null;
                  const m    = getMention(nm);
                  return (
                    <tr key={etu.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={tdS}>{etu.name}</td>
                      <td style={{ ...tdS, fontFamily: "monospace", color: "#38bdf8" }}>{etu.matricule || "—"}</td>
                      <td style={tdS}>{note ? <span style={{ fontWeight: 700 }}>{note.noteClasse}/20</span> : <span style={{ color: "var(--text3)" }}>—</span>}</td>
                      <td style={tdS}>{note && note.noteExamen != null ? <span style={{ fontWeight: 700 }}>{note.noteExamen}/20</span> : <span style={{ color: "var(--text3)" }}>—</span>}</td>
                      <td style={tdS}>{nm !== null ? <span style={{ fontWeight: 800, fontSize: 16, color: m.color }}>{nm}/20</span> : <span style={{ color: "var(--text3)" }}>—</span>}</td>
                      <td style={tdS}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openModal(etu.id, selectedMatiere, note)} style={{
                            background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
                            borderRadius: 7, padding: "6px 12px", color: "#38bdf8", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>{note ? "Modifier" : "Saisir"}</button>
                          {note && (
                            <button onClick={() => deleteNote(note.id)} style={{
                              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 7, padding: "6px 10px", color: "#ef4444", fontSize: 12, cursor: "pointer",
                            }}>X</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal saisie note */}
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 style={modalTitle("#38bdf8")}>{editingNote ? "Modifier la note" : "Saisir la note"}</h3>
          <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#38bdf8", fontWeight: 600 }}>
              {data.etudiants.find(e => e.id === noteForm.etudiantId)?.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>
              {selectedMatiere?.name} — {selectedMatiere?.ue?.code}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Note Devoir (controle continu) *">
              <input type="number" min={0} max={20} step={0.25}
                style={{ ...inputStyle, fontSize: 22, textAlign: "center", fontWeight: 700, color: "#38bdf8" }}
                value={noteForm.noteClasse}
                onChange={e => setNoteForm({ ...noteForm, noteClasse: e.target.value })}
                placeholder="0 – 20" />
            </Field>
            <Field label="Note Examen (epreuve finale) — optionnel">
              <input type="number" min={0} max={20} step={0.25}
                style={{ ...inputStyle, fontSize: 22, textAlign: "center", fontWeight: 700, color: "#f472b6" }}
                value={noteForm.noteExamen}
                onChange={e => setNoteForm({ ...noteForm, noteExamen: e.target.value })}
                placeholder="0 – 20" />
            </Field>
            {noteForm.noteClasse !== "" && (() => {
              const ne2 = noteForm.noteExamen !== "" ? parseFloat(noteForm.noteExamen) : null;
              const nm  = ne2 !== null ? calcNoteMatiere(parseFloat(noteForm.noteClasse), ne2) : null;
              const m   = getMention(nm);
              return nm !== null && !isNaN(nm) ? (
                <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Note Matiere calculee</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>
                    ({noteForm.noteClasse} + 2 x {noteForm.noteExamen}) / 3
                  </div>
                  <span style={{ fontSize: 32, fontWeight: 900, color: m.color }}>{nm}</span>
                  <span style={{ fontSize: 14, color: "var(--text3)" }}>/20</span>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ background: m.color + "20", color: m.color, border: "1px solid " + m.color + "40", borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                      {m.label}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
          <div style={modalFooter}>
            <button onClick={() => setModal(false)} style={btnSecondary}>Annuler</button>
            <button onClick={saveNote} style={btnPrimary("#38bdf8")}>
              {editingNote ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const thS = { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)" };
const tdS = { padding: "11px 12px", fontSize: 14, color: "var(--text)", verticalAlign: "middle" };
