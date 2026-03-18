export const INITIAL_DATA = {

  // ─────────────────────────────────────
  // PARAMÈTRES GÉNÉRAUX
  // ─────────────────────────────────────
  parametres: {
    nomEtablissement: "UniGest Université",
    anneeAcademique: "2023/2024",
    semestreActif: 1,
    anneeActive: "2024/2025",
    anneesDisponibles: ["2022/2023","2023/2024","2024/2025","2025/2026"],
  },

  // ─────────────────────────────────────
  // FILIÈRES
  // ─────────────────────────────────────
  filieres: [
    { id: 1, cycle: "Licence", code: "INFO-L1", name: "Informatique – Licence 1", annee: "Licence 1" },
    { id: 2, cycle: "Licence", code: "INFO-L2", name: "Informatique – Licence 2", annee: "Licence 2" },
    { id: 3, cycle: "Licence", code: "GEST-L1", name: "Sciences de Gestion – L1", annee: "Licence 1" },
    { id: 4, cycle: "Master",  code: "TC-SCI",  name: "Tronc Commun Sciences",    annee: "Licence 1" },
  ],

  // ─────────────────────────────────────
  // UNITÉS D'ENSEIGNEMENT (UE)
  // Chaque UE contient ses matières (ECUE)
  // ─────────────────────────────────────
  ues: [
    {
      id: 1,
      code: "TEC1201",
      intitule: "Techniques de Communication",
      semestre: 1,
      filiereIds: [3],
      creditUE: 4,
      matieres: [
        { id: 1, name: "Français 2",  creditECUE: 2 },
        { id: 2, name: "Anglais 2",   creditECUE: 2 },
      ],
    },
    {
      id: 2,
      code: "ENJ1202",
      intitule: "Enseignement Juridique",
      semestre: 1,
      filiereIds: [3],
      creditUE: 4,
      matieres: [
        { id: 3, name: "Droit commercial",   creditECUE: 2 },
        { id: 4, name: "Droit des transports", creditECUE: 2 },
      ],
    },
    {
      id: 3,
      code: "TQG1103",
      intitule: "Techniques Quantitatives et de Gestion",
      semestre: 1,
      filiereIds: [3],
      creditUE: 6,
      matieres: [
        { id: 5, name: "Mathématiques financières", creditECUE: 3 },
        { id: 6, name: "Statistiques 2",            creditECUE: 3 },
      ],
    },
    {
      id: 4,
      code: "MAI1204",
      intitule: "Management et Informatique",
      semestre: 1,
      filiereIds: [3],
      creditUE: 5,
      matieres: [
        { id: 7, name: "Comptabilité générale 2", creditECUE: 3 },
        { id: 8, name: "Informatique 2",          creditECUE: 2 },
      ],
    },
    {
      id: 5,
      code: "EEI1204",
      intitule: "Environnement Économique International",
      semestre: 1,
      filiereIds: [3],
      creditUE: 5,
      matieres: [
        { id: 9,  name: "Initiation au Transport",             creditECUE: 3 },
        { id: 10, name: "Initiation au commerce international", creditECUE: 2 },
      ],
    },
    {
      id: 6,
      code: "LOG1205",
      intitule: "Logistique",
      semestre: 1,
      filiereIds: [3],
      creditUE: 6,
      matieres: [
        { id: 11, name: "Initiation à la Logistique", creditECUE: 6 },
      ],
    },
    // UE Informatique
    {
      id: 7,
      code: "INFO1101",
      intitule: "Fondamentaux Informatique",
      semestre: 1,
      filiereIds: [1, 4],
      creditUE: 6,
      matieres: [
        { id: 12, name: "Algorithmique",  creditECUE: 3 },
        { id: 13, name: "Programmation",  creditECUE: 3 },
      ],
    },
    {
      id: 8,
      code: "MAT1101",
      intitule: "Mathématiques",
      semestre: 1,
      filiereIds: [1, 2, 4],
      creditUE: 4,
      matieres: [
        { id: 14, name: "Mathématiques 1", creditECUE: 4 },
      ],
    },
  ],

  // ─────────────────────────────────────
  // PROFESSEURS
  // ─────────────────────────────────────
  professeurs: [
    { id: 1, name: "Dr. Konan Yves",       tel: "+223 07 00 11 22", email: "konan.y@univ.ci",    ueIds: [8, 7] },
    { id: 2, name: "Prof. Diabaté Moussa", tel: "+223 05 44 55 66", email: "diabate.m@univ.ci",  ueIds: [7] },
    { id: 3, name: "Dr. Ouattara Aminata", tel: "+223 01 77 88 99", email: "ouattara.a@univ.ci", ueIds: [1, 2, 3] },
    { id: 4, name: "Dr. Traoré Seydou",    tel: "+223 07 33 44 55", email: "traore.s@univ.ci",   ueIds: [4, 5, 6] },
  ],

  // ─────────────────────────────────────
  // ÉTUDIANTS
  // ─────────────────────────────────────
  etudiants: [
    { id: 1, matricule: "ETU-2024-001", name: "Coulibaly Amara",    filiereId: 3, email: "amara.c@etud.ci",    anneeAcademique: "2023/2024", session: "jour" },
    { id: 2, matricule: "ETU-2024-002", name: "Bamba Fatoumata",    filiereId: 3, email: "fatoumata.b@etud.ci", anneeAcademique: "2023/2024", session: "soir" },
    { id: 3, matricule: "ETU-2024-003", name: "Kone Ibrahim",       filiereId: 1, email: "ibrahim.k@etud.ci",   anneeAcademique: "2023/2024", session: "jour" },
    { id: 4, matricule: "ETU-2024-004", name: "Toure Mariama",      filiereId: 1, email: "mariama.t@etud.ci",   anneeAcademique: "2024/2025", session: "soir" },
    { id: 5, matricule: "ETU-2024-005", name: "Diallo Seydou",      filiereId: 4, email: "seydou.d@etud.ci",   anneeAcademique: "2024/2025", session: "jour" },
  ],

  // ─────────────────────────────────────
  // NOTES
  // Une note = { etudiantId, matiereId, ueId,
  //              noteClasse, noteExamen, semestre }
  // ─────────────────────────────────────
  notes: [
    // Coulibaly Amara — GEST-L1 — Semestre 1
    { id: 1,  etudiantId: 1, ueId: 1, matiereId: 1,  noteClasse: 16.00, noteExamen: 12.00, semestre: 1 },
    { id: 2,  etudiantId: 1, ueId: 1, matiereId: 2,  noteClasse: 14.00, noteExamen: 13.50, semestre: 1 },
    { id: 3,  etudiantId: 1, ueId: 2, matiereId: 3,  noteClasse: 16.00, noteExamen: 12.00, semestre: 1 },
    { id: 4,  etudiantId: 1, ueId: 2, matiereId: 4,  noteClasse: 16.00, noteExamen: 6.00,  semestre: 1 },
    { id: 5,  etudiantId: 1, ueId: 3, matiereId: 5,  noteClasse: 9.00,  noteExamen: 14.50, semestre: 1 },
    { id: 6,  etudiantId: 1, ueId: 3, matiereId: 6,  noteClasse: 9.00,  noteExamen: 14.50, semestre: 1 },
    { id: 7,  etudiantId: 1, ueId: 4, matiereId: 7,  noteClasse: 15.50, noteExamen: 10.00, semestre: 1 },
    { id: 8,  etudiantId: 1, ueId: 4, matiereId: 8,  noteClasse: 15.50, noteExamen: 15.50, semestre: 1 },
    { id: 9,  etudiantId: 1, ueId: 5, matiereId: 9,  noteClasse: 15.00, noteExamen: 15.00, semestre: 1 },
    { id: 10, etudiantId: 1, ueId: 5, matiereId: 10, noteClasse: 15.00, noteExamen: 15.00, semestre: 1 },
    { id: 11, etudiantId: 1, ueId: 6, matiereId: 11, noteClasse: 12.50, noteExamen: 12.00, semestre: 1 },
    // Bamba Fatoumata — GEST-L1 — Semestre 1
    { id: 12, etudiantId: 2, ueId: 1, matiereId: 1,  noteClasse: 14.00, noteExamen: 11.00, semestre: 1 },
    { id: 13, etudiantId: 2, ueId: 1, matiereId: 2,  noteClasse: 12.00, noteExamen: 10.00, semestre: 1 },
    { id: 14, etudiantId: 2, ueId: 2, matiereId: 3,  noteClasse: 13.00, noteExamen: 9.00,  semestre: 1 },
    { id: 15, etudiantId: 2, ueId: 2, matiereId: 4,  noteClasse: 11.00, noteExamen: 8.00,  semestre: 1 },
  ],

  // ─────────────────────────────────────
  // EMPLOIS DU TEMPS
  // ─────────────────────────────────────
  emploisDuTemps: [
    {
      id: 1,
      name: "EDT GEST-L1 Semestre 1",
      filiereIds: [3],
      slots: [
        { id: 1, jour: "Lundi",    heureDebut: "08:00", heureFin: "10:00", matiere: "Français 2",            salle: "Salle 101", type: "Cours", session: "jour", profNom: "Dr. Ouattara Aminata", profTel: "+223 01 77 88 99" },
        { id: 2, jour: "Lundi",    heureDebut: "10:00", heureFin: "12:00", matiere: "Droit commercial",      salle: "Amphi A",   type: "Cours", session: "jour", profNom: "Dr. Ouattara Aminata", profTel: "+223 01 77 88 99" },
        { id: 3, jour: "Mardi",    heureDebut: "08:00", heureFin: "10:00", matiere: "Comptabilité générale 2", salle: "Salle 204", type: "TD",    session: "jour", profNom: "Dr. Traoré Seydou",    profTel: "+223 07 33 44 55" },
        { id: 4, jour: "Mercredi", heureDebut: "18:00", heureFin: "20:00", matiere: "Statistiques 2",        salle: "Amphi B",   type: "Cours", session: "soir", profNom: "Dr. Ouattara Aminata", profTel: "+223 01 77 88 99" },
        { id: 5, jour: "Jeudi",    heureDebut: "14:00", heureFin: "16:00", matiere: "Informatique 2",        salle: "Labo Info", type: "TP",    session: "jour", profNom: "Dr. Traoré Seydou",    profTel: "+223 07 33 44 55" },
        { id: 6, jour: "Vendredi", heureDebut: "18:00", heureFin: "20:00", matiere: "Logistique",            salle: "Salle 301", type: "Cours", session: "soir", profNom: "Dr. Traoré Seydou",    profTel: "+223 07 33 44 55" },
      ],
    },
    {
      id: 2,
      name: "EDT INFO-L1 + TC Sciences S1",
      filiereIds: [1, 4],
      slots: [
        { id: 1, jour: "Lundi",    heureDebut: "08:00", heureFin: "10:00", matiere: "Algorithmique",   salle: "Labo Info", type: "Cours", session: "jour", profNom: "Prof. Diabaté Moussa", profTel: "+223 05 44 55 66" },
        { id: 2, jour: "Mardi",    heureDebut: "08:00", heureFin: "10:00", matiere: "Mathématiques 1", salle: "Amphi A",   type: "Cours", session: "jour", profNom: "Dr. Konan Yves",       profTel: "+223 07 00 11 22" },
        { id: 3, jour: "Jeudi",    heureDebut: "18:00", heureFin: "20:00", matiere: "Programmation",   salle: "Labo Info", type: "TP",    session: "soir", profNom: "Prof. Diabaté Moussa", profTel: "+223 05 44 55 66" },
      ],
    },
  ],

  // ─────────────────────────────────────
  // UTILISATEURS
  // ─────────────────────────────────────
  users: [
    { id: "secr1",   password: "secr123",   role: "secretaire",  name: "Secretaire Principal" },
    { id: "surv1",   password: "surv123",   role: "surveillant", name: "Surveillant General" },
    { id: "admin",  password: "admin123", role: "admin",    name: "Administration Centrale" },
    { id: "prof1",  password: "prof123",  role: "prof",     name: "Dr. Ouattara Aminata",  profId: 3 },
    { id: "prof2",  password: "prof123",  role: "prof",     name: "Dr. Traoré Seydou",     profId: 4 },
    { id: "prof3",  password: "prof123",  role: "prof",     name: "Dr. Konan Yves",        profId: 1 },
    { id: "etu1",   password: "etu123",   role: "etudiant", name: "Coulibaly Amara",       etudiantId: 1 },
    { id: "etu2",   password: "etu123",   role: "etudiant", name: "Bamba Fatoumata",       etudiantId: 2 },
    { id: "etu3",   password: "etu123",   role: "etudiant", name: "Koné Ibrahim",          etudiantId: 3 },
  ],
};

// Export groupes par défaut (ajout dynamique)
export const GROUPES_DEFAUT = [
  { id: 1, nom: "Groupe A", filiereId: 1, type: "TD", effectif: 25 },
  { id: 2, nom: "Groupe B", filiereId: 1, type: "TD", effectif: 25 },
  { id: 3, nom: "Groupe C", filiereId: 3, type: "TD", effectif: 25 },
  { id: 4, nom: "Groupe D", filiereId: 3, type: "TD", effectif: 25 },
  { id: 5, nom: "Groupe TP1", filiereId: 1, type: "TP", effectif: 15 },
  { id: 6, nom: "Groupe TP2", filiereId: 1, type: "TP", effectif: 15 },
];
