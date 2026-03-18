// ─────────────────────────────────────────
// CALCUL 1 — Note Matière
// (Note Classe + 2 × Note Examen) ÷ 3
// ─────────────────────────────────────────
export function calcNoteMatiere(noteClasse, noteExamen) {
  if (noteClasse === null || noteClasse === undefined) return null;
  const nc = parseFloat(noteClasse);
  if (isNaN(nc)) return null;
  // Si pas de note examen, retourner seulement la note de devoir
  if (noteExamen === null || noteExamen === undefined || noteExamen === "") return Math.round(nc * 100) / 100;
  const ne = parseFloat(noteExamen);
  if (isNaN(ne)) return Math.round(nc * 100) / 100;
  return Math.round(((nc + 2 * ne) / 3) * 100) / 100;
}

// ─────────────────────────────────────────
// CALCUL 2 — Moyenne UE
// Σ(Note Matière × Crédit ECUE) ÷ Σ(Crédits ECUE)
// ─────────────────────────────────────────
export function calcMoyenneUE(matieres, notes) {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const matiere of matieres) {
    const note = notes.find(n => n.matiereId === matiere.id);
    if (!note) return null; // notes manquantes
    const nm = calcNoteMatiere(note.noteClasse, note.noteExamen);
    if (nm === null) continue; // Ignorer les matières sans note valide
    totalPoints += nm * matiere.creditECUE;
    totalCredits += matiere.creditECUE;
  }

  if (totalCredits === 0) return null;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

// ─────────────────────────────────────────
// CALCUL 3 — Note Coefficientée
// Moyenne UE × Crédit UE
// ─────────────────────────────────────────
export function calcNoteCoeff(moyenneUE, creditUE) {
  if (moyenneUE === null) return null;
  return Math.round(moyenneUE * creditUE * 100) / 100;
}

// ─────────────────────────────────────────
// CALCUL 4 — Moyenne Semestre
// Σ(Notes Coeff) ÷ Total Crédits
// ─────────────────────────────────────────
export function calcMoyenneSemestre(ues, notes) {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const ue of ues) {
    const moy = calcMoyenneUE(ue.matieres, notes);
    if (moy === null) continue;
    totalPoints += calcNoteCoeff(moy, ue.creditUE);
    totalCredits += ue.creditUE;
  }

  if (totalCredits === 0) return null;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

// ─────────────────────────────────────────
// VALIDATION UE
// Moyenne UE >= 10 → Validée
// ─────────────────────────────────────────
export function isUEValidee(moyenneUE) {
  if (moyenneUE === null) return false;
  return moyenneUE >= 10;
}

// ─────────────────────────────────────────
// TOTAL CRÉDITS VALIDÉS
// ─────────────────────────────────────────
export function calcCreditsValides(ues, notes) {
  let total = 0;
  for (const ue of ues) {
    const moy = calcMoyenneUE(ue.matieres, notes);
    if (isUEValidee(moy)) total += ue.creditUE;
  }
  return total;
}

// ─────────────────────────────────────────
// MENTION selon la moyenne
// ─────────────────────────────────────────
export function getMention(moyenne) {
  if (moyenne === null) return { label: "–", color: "#6b7280" };
  if (moyenne >= 16) return { label: "Très Bien", color: "#10b981" };
  if (moyenne >= 14) return { label: "Bien", color: "#3b82f6" };
  if (moyenne >= 12) return { label: "Assez Bien", color: "#8b5cf6" };
  if (moyenne >= 10) return { label: "Passable", color: "#f59e0b" };
  return { label: "Insuffisant", color: "#ef4444" };
}

// ─────────────────────────────────────────
// APPRÉCIATION (comme sur le bulletin)
// ─────────────────────────────────────────
export function getAppreciation(moyenne) {
  if (moyenne === null) return "–";
  if (moyenne >= 16) return "Excellent travail";
  if (moyenne >= 14) return "Bon travail";
  if (moyenne >= 12) return "Assez Bon travail";
  if (moyenne >= 10) return "Travail passable";
  return "Travail insuffisant";
}

// Retourne les semestres actifs selon le code filiere et la periode (1 ou 2)
export function getSemestresFiliere(filiereCode) {
  const code = (filiereCode||"").toUpperCase();
  if (code.includes("L1") || code.includes("-L1") || code.includes("LICENCE 1")) return [1,2];
  if (code.includes("L2") || code.includes("-L2") || code.includes("LICENCE 2")) return [3,4];
  if (code.includes("L3") || code.includes("-L3") || code.includes("LICENCE 3")) return [5,6];
  if (code.includes("M1") || code.includes("-M1") || code.includes("MASTER 1")) return [7,8];
  if (code.includes("M2") || code.includes("-M2") || code.includes("MASTER 2")) return [9,10];
  if (code.includes("DOC") || code.includes("DOCTORAT")) return [11,12];
  return [1,2]; // defaut
}

// Retourne le semestre actif selon le code filiere et la periode (1=premier, 2=deuxieme)
export function getSemestreActif(filiereCode, periode) {
  const sems = getSemestresFiliere(filiereCode);
  return periode === 2 ? sems[1] : sems[0];
}

// Retourne le semestre actif pour une filiere donnee
export function getSemestreDepuisCycles(filiereCode, semestresCycles) {
  const cycles = semestresCycles || {"Licence 1":1,"Licence 2":3,"Licence 3":5,"Master 1":7,"Master 2":9};
  const code   = (filiereCode||"").toUpperCase();
  for (const [cycle, sem] of Object.entries(cycles)) {
    if (code.toUpperCase().includes(cycle.toUpperCase())) return sem;
    // Compatibilité anciens codes
    const short = cycle.replace("Licence ","L").replace("Master ","M");
    if (code.includes(short.toUpperCase())) return sem;
  }
  return 1;
}
