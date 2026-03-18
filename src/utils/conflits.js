// Vérifie si deux créneaux se chevauchent
function seChevauche(s1, s2) {
  if (s1.jour !== s2.jour) return false;
  const d1 = s1.heureDebut, f1 = s1.heureFin;
  const d2 = s2.heureDebut, f2 = s2.heureFin;
  return d1 < f2 && d2 < f1;
}

// Conflits de salle
export function conflitsSalle(slots, salle, jourHeure, excludeId = null) {
  return slots.filter(s =>
    s.id !== excludeId &&
    s.salle === salle &&
    seChevauche(s, jourHeure)
  );
}

// Conflits enseignant
export function conflitsProf(slots, profNom, jourHeure, excludeId = null) {
  return slots.filter(s =>
    s.id !== excludeId &&
    s.profNom === profNom &&
    seChevauche(s, jourHeure)
  );
}

// Conflits filière (même groupe au même moment)
export function conflitsFiliere(slots, groupe, jourHeure, excludeId = null) {
  return slots.filter(s =>
    s.id !== excludeId &&
    s.groupe === groupe &&
    seChevauche(s, jourHeure)
  );
}

// Rapport complet de conflits pour un slot
export function analyserConflits(tousSlots, newSlot, excludeId = null) {
  const conflits = [];

  const cs = conflitsSalle(tousSlots, newSlot.salle, newSlot, excludeId);
  if (cs.length) conflits.push({
    type: "salle",
    message: `Salle ${newSlot.salle} deja occupee (${cs.map(s => s.matiere).join(", ")})`,
    slots: cs,
  });

  if (newSlot.profNom) {
    const cp = conflitsProf(tousSlots, newSlot.profNom, newSlot, excludeId);
    if (cp.length) conflits.push({
      type: "prof",
      message: `${newSlot.profNom} deja en cours (${cp.map(s => s.matiere).join(", ")})`,
      slots: cp,
    });
  }

  if (newSlot.groupe) {
    const cf = conflitsFiliere(tousSlots, newSlot.groupe, newSlot, excludeId);
    if (cf.length) conflits.push({
      type: "filiere",
      message: `Groupe ${newSlot.groupe} deja en cours (${cf.map(s => s.matiere).join(", ")})`,
      slots: cf,
    });
  }

  return conflits;
}
