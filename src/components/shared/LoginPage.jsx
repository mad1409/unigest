import { useState } from "react";

export default function LoginPage({ onLogin, onSuccess }) {
  const [form, setForm] = useState({
    id: "", password: "", role: "etudiant"
  });
  const [error, setError] = useState("");

  const roles = [
    { value: "etudiant", icon: "🎓", label: "Étudiant"       },
    { value: "prof",     icon: "📚", label: "Enseignant"      },
    { value: "admin",    icon: "🏛️", label: "Administration"  },
  ];

  const colors = {
    etudiant: "#a78bfa",
    prof:     "#38bdf8",
    admin:    "#f0c040",
  };
  const color = colors[form.role];

  function handleSubmit(e) {
    e.preventDefault();
    const result = onLogin(form.id, form.password, form.role);
    if (result.success) {
      setError("");
      onSuccess(result.user);
    } else {
      setError("Identifiant, mot de passe ou rôle incorrect.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 60% 20%, #1a1f3a 0%, #0a0d14 60%)",
      padding: 20,
    }}>
      <div style={{
        width: 440,
        background: "rgba(17,21,32,0.95)",
        borderRadius: 22,
        padding: "44px 38px",
        border: `1px solid ${color}28`,
        boxShadow: `0 0 60px ${color}12`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>

        {/* Entête */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏛️</div>
          <h1 style={{
            fontSize: 26, fontWeight: 700,
            color: color,
            transition: "color 0.3s",
          }}>
            UniGest
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 6 }}>
            Plateforme de Gestion Universitaire
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            letterSpacing: 1, textTransform: "uppercase",
            color: "var(--text3)", marginBottom: 10,
          }}>
            Je suis...
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}>
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  padding: "14px 8px",
                  borderRadius: 10,
                  border: form.role === r.value
                    ? `2px solid ${colors[r.value]}`
                    : "1px solid var(--border)",
                  background: form.role === r.value
                    ? colors[r.value] + "14"
                    : "rgba(255,255,255,0.03)",
                  transition: "all 0.18s",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>
                  {r.icon}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: form.role === r.value
                    ? colors[r.value]
                    : "var(--text2)",
                }}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div>
            <label style={{
              display: "block",
              fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase",
              color: "var(--text3)", marginBottom: 7,
            }}>
              Identifiant
            </label>
            <input
              value={form.id}
              onChange={e => setForm({ ...form, id: e.target.value })}
              placeholder="Votre identifiant"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${color}30`,
                borderRadius: 9,
                padding: "12px 14px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase",
              color: "var(--text3)", marginBottom: 7,
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${color}30`,
                borderRadius: 9,
                padding: "12px 14px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#ef4444",
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: `linear-gradient(135deg, ${color}cc, ${color})`,
              border: "none",
              borderRadius: 9,
              padding: "13px",
              color: form.role === "admin" ? "#1a1200" : "#fff",
              fontSize: 15,
              fontWeight: 700,
              marginTop: 4,
              cursor: "pointer",
              transition: "opacity 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Se connecter →
          </button>
        </form>
      </div>
    </div>
  );
}
