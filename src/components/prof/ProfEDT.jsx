const JOURS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

export default function ProfEDT({ prof, data }) {
  const edts = (data.emploisDuTemps||[]).filter(e => {
    const slots = e.slots || [];
    return slots.some(s => ((s.profNom||s.prof_nom)||s.prof_nom) === prof?.name);
  });

  const jourStyle = {
    background: "rgba(251,191,36,0.1)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: 6, padding: "3px 9px",
    fontSize: 11, color: "#fbbf24", fontWeight: 700,
  };
  const soirStyle = {
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 6, padding: "3px 9px",
    fontSize: 11, color: "#818cf8", fontWeight: 700,
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: 24, fontWeight: 700,
          color: "#38bdf8",
        }}>
          Mon Emploi du Temps
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 5 }}>
          Vos séances planifiées
        </p>
      </div>

      {edts.length === 0 ? (
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "60px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ color: "var(--text3)", fontSize: 14 }}>
            Aucun emploi du temps trouvé.
          </div>
        </div>
      ) : (
        edts.map(edt => {
          const mesSlots = edt.slots.filter(
            s => (s.profNom||s.prof_nom) === prof?.name
          );
          return (
            <div key={edt.id} style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "20px 22px",
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: "#38bdf8", marginBottom: 14,
              }}>
                {edt.name}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                }}>
                  <thead>
                    <tr style={{
                      background: "rgba(255,255,255,0.03)",
                    }}>
                      {["Jour","Horaire","Matière","Salle",
                        "Type","Session"].map(h => (
                        <th key={h} style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          fontSize: 11, fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "var(--text3)",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JOURS.flatMap(jour =>
                      mesSlots
                        .filter(s => s.jour === jour)
                        .map(s => (
                          <tr key={s.id} style={{
                            borderBottom: "1px solid var(--border)",
                          }}>
                            <td style={{
                              padding: "11px 12px",
                              color: "#38bdf8",
                              fontWeight: 700, fontSize: 14,
                            }}>
                              {s.jour}
                            </td>
                            <td style={{
                              padding: "11px 12px", fontSize: 14,
                              color: "var(--text)",
                            }}>
                              {(s.heureDebut||s.heure_debut)} – {(s.heureFin||s.heure_fin)}
                            </td>
                            <td style={{
                              padding: "11px 12px", fontSize: 14,
                              fontWeight: 600, color: "var(--text)",
                            }}>
                              {s.matiere}
                            </td>
                            <td style={{ padding: "11px 12px" }}>
                              <span style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: 12,
                                color: "var(--text2)",
                              }}>
                                {s.salle}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px" }}>
                              <span style={{
                                background: "rgba(56,189,248,0.1)",
                                border: "1px solid rgba(56,189,248,0.25)",
                                borderRadius: 6,
                                padding: "2px 9px",
                                fontSize: 11,
                                color: "#38bdf8",
                                fontWeight: 700,
                              }}>
                                {s.type}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px" }}>
                              {s.session === "soir"
                                ? <span style={soirStyle}>🌙 Soir</span>
                                : <span style={jourStyle}>☀️ Jour</span>
                              }
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
