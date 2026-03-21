const { Pool } = require('pg');
require('dotenv').config({ path: '/home/ubuntu/unigest/.env' });

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD,
});

async function seedCalendrier() {
  console.log('Création calendrier fictif 2025/2026...');

  const evenements = [
    // Rentrée
    { titre: "Rentrée académique 2025/2026", type: "rentree", dateDebut: "2025-10-01", dateFin: "2025-10-01", description: "Début officiel de l'année académique 2025/2026" },
    { titre: "Dépôt des dossiers d'inscription", type: "inscription", dateDebut: "2025-09-01", dateFin: "2025-09-30", description: "Période d'inscription pour les nouveaux étudiants" },
    { titre: "Réinscription anciens étudiants", type: "inscription", dateDebut: "2025-09-15", dateFin: "2025-10-15", description: "Réinscription des étudiants déjà inscrits" },

    // Semestre 1
    { titre: "Début Semestre 1", type: "rentree", dateDebut: "2025-10-06", dateFin: "2025-10-06", description: "Début des cours du semestre 1" },
    { titre: "Vacances de Tabaski", type: "vacances", dateDebut: "2025-11-05", dateFin: "2025-11-07", description: "Congé à l'occasion de la fête de Tabaski" },
    { titre: "Examens de Semestre 1 — Session 1", type: "examen", dateDebut: "2026-01-12", dateFin: "2026-01-24", description: "Examens de fin de semestre 1, première session" },
    { titre: "Délibération Semestre 1", type: "deliberation", dateDebut: "2026-01-28", dateFin: "2026-01-30", description: "Réunion du jury de délibération pour le semestre 1" },
    { titre: "Affichage des résultats S1", type: "deliberation", dateDebut: "2026-02-02", dateFin: "2026-02-02", description: "Publication officielle des résultats du semestre 1" },

    // Rattrapage S1
    { titre: "Examens de rattrapage S1", type: "examen", dateDebut: "2026-02-09", dateFin: "2026-02-14", description: "Session de rattrapage pour les étudiants du semestre 1" },
    { titre: "Délibération rattrapage S1", type: "deliberation", dateDebut: "2026-02-16", dateFin: "2026-02-17", description: "Jury de délibération session de rattrapage S1" },

    // Semestre 2
    { titre: "Début Semestre 2", type: "rentree", dateDebut: "2026-02-23", dateFin: "2026-02-23", description: "Début des cours du semestre 2" },
    { titre: "Vacances de Korité", type: "vacances", dateDebut: "2026-03-30", dateFin: "2026-04-01", description: "Congé à l'occasion de la fête de Korité" },
    { titre: "Vacances de Pâques", type: "vacances", dateDebut: "2026-04-03", dateFin: "2026-04-06", description: "Congé de Pâques" },
    { titre: "Fête du Travail", type: "vacances", dateDebut: "2026-05-01", dateFin: "2026-05-01", description: "Congé fête du Travail" },
    { titre: "Examens de Semestre 2 — Session 1", type: "examen", dateDebut: "2026-05-25", dateFin: "2026-06-06", description: "Examens de fin de semestre 2, première session" },
    { titre: "Délibération Semestre 2", type: "deliberation", dateDebut: "2026-06-10", dateFin: "2026-06-12", description: "Réunion du jury de délibération pour le semestre 2" },
    { titre: "Affichage des résultats S2", type: "deliberation", dateDebut: "2026-06-15", dateFin: "2026-06-15", description: "Publication officielle des résultats du semestre 2" },

    // Rattrapage S2
    { titre: "Examens de rattrapage S2", type: "examen", dateDebut: "2026-06-22", dateFin: "2026-06-27", description: "Session de rattrapage pour les étudiants du semestre 2" },
    { titre: "Délibération rattrapage S2", type: "deliberation", dateDebut: "2026-06-29", dateFin: "2026-06-30", description: "Jury de délibération session de rattrapage S2" },

    // Fin d'année
    { titre: "Vacances d'été", type: "vacances", dateDebut: "2026-07-01", dateFin: "2026-09-30", description: "Vacances de fin d'année académique" },
    { titre: "Cérémonie de remise des diplômes", type: "autre", dateDebut: "2026-07-15", dateFin: "2026-07-15", description: "Cérémonie officielle de remise des diplômes promotion 2025/2026" },
    { titre: "Réunion pédagogique de bilan", type: "autre", dateDebut: "2026-07-20", dateFin: "2026-07-20", description: "Réunion de l'équipe pédagogique pour le bilan de l'année" },
  ];

  // Sauvegarder dans localStorage via un fichier JSON
  // (le calendrier est stocké dans localStorage du navigateur)
  const annee = "2025/2026";
  const data = evenements.map((e, i) => ({
    id: Date.now() + i,
    titre: e.titre,
    type: e.type,
    dateDebut: e.dateDebut,
    dateFin: e.dateFin || e.dateDebut,
    description: e.description,
    filieres: "all",
  }));

  // Créer un fichier JS à exécuter dans le navigateur
  const script = `
// Script à exécuter dans la console du navigateur
// Copier-coller dans F12 -> Console
localStorage.setItem("calendrier_2025/2026", JSON.stringify(${JSON.stringify(data)}));
console.log("Calendrier chargé :", ${data.length}, "événements");
`;

  require('fs').writeFileSync('/home/ubuntu/unigest/seed_calendrier_browser.js', script);
  console.log('Script navigateur créé : seed_calendrier_browser.js');
  console.log('Événements créés :', data.length);
  console.log('\nInstructions :');
  console.log('1. Ouvrir le navigateur sur http://13.38.166.249:5173/administration');
  console.log('2. Se connecter en admin');
  console.log('3. Appuyer sur F12 -> Console');
  console.log('4. Copier-coller le contenu du fichier seed_calendrier_browser.js');
  console.log('5. Appuyer sur Entrée');

  pool.end();
}

seedCalendrier().catch(e => { console.error(e.message); pool.end(); });
