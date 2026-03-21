const { Pool } = require('pg');
require('dotenv').config({ path: '/home/ubuntu/unigest/.env' });
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD,
});

async function seed() {
  console.log('Debut du remplissage...');

  // ── 1. Filières déjà créées — récupérer les IDs ──
  const filieres = await pool.query('SELECT * FROM filieres ORDER BY id');
  console.log('Filieres:', filieres.rows.length);

  // ── 2. Professeurs fictifs ──
  const profs = [
    { name:'Dr. Amadou Coulibaly',   tel:'+223 76 12 34 56', specialite:'Informatique' },
    { name:'Prof. Fatoumata Diallo', tel:'+223 77 98 76 54', specialite:'Gestion' },
    { name:'Dr. Ibrahim Traoré',     tel:'+223 65 43 21 09', specialite:'Mathematiques' },
    { name:'Prof. Mariam Koné',      tel:'+223 79 11 22 33', specialite:'Communication' },
    { name:'Dr. Oumar Sidibé',       tel:'+223 66 55 44 33', specialite:'Logistique' },
  ];

  const profIds = [];
  for (const p of profs) {
    const r = await pool.query(
      'INSERT INTO professeurs (name, tel) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING id',
      [p.name, p.tel]
    );
    if (r.rows.length) profIds.push(r.rows[0].id);
    else {
      const r2 = await pool.query('SELECT id FROM professeurs WHERE name=$1', [p.name]);
      if (r2.rows.length) profIds.push(r2.rows[0].id);
    }
  }
  console.log('Professeurs:', profIds.length);

  // ── 3. Comptes prof ──
  const hash = await bcrypt.hash('prof123', 10);
  for (let i = 0; i < profIds.length; i++) {
    const userId = 'PROF00'+(i+1);
    await pool.query(
      'INSERT INTO users (id, password, name, role, prof_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [userId, hash, profs[i].name, 'prof', profIds[i]]
    );
  }

  // ── 4. UEs et Matières pour GLT-L1 ──
  const fil_glt_l1 = filieres.rows.find(f => f.code === 'GLT-L1');
  if (fil_glt_l1) {
    const uesGLT = [
      { code:'GLT-UE1', intitule:'Fondamentaux de la Logistique', semestre:1, credit:6,
        matieres:[
          { name:'Introduction à la logistique', credit:3 },
          { name:'Gestion des stocks', credit:3 },
        ]
      },
      { code:'GLT-UE2', intitule:'Transport et Distribution', semestre:1, credit:4,
        matieres:[
          { name:'Modes de transport', credit:2 },
          { name:'Réseaux de distribution', credit:2 },
        ]
      },
      { code:'GLT-UE3', intitule:'Mathématiques pour la Logistique', semestre:1, credit:4,
        matieres:[
          { name:'Statistiques descriptives', credit:2 },
          { name:'Recherche opérationnelle', credit:2 },
        ]
      },
      { code:'GLT-UE4', intitule:'Communication Professionnelle', semestre:2, credit:3,
        matieres:[
          { name:'Français professionnel', credit:2 },
          { name:'Anglais des affaires', credit:1 },
        ]
      },
      { code:'GLT-UE5', intitule:'Informatique de Gestion', semestre:2, credit:5,
        matieres:[
          { name:'Bureautique avancée', credit:2 },
          { name:'ERP et logiciels logistiques', credit:3 },
        ]
      },
    ];

    for (const ue of uesGLT) {
      const r = await pool.query(
        `INSERT INTO ues (code, intitule, semestre, credit_ue, filiere_ids)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING id`,
        [ue.code, ue.intitule, ue.semestre, ue.credit, [fil_glt_l1.id]]
      );
      if (r.rows.length) {
        const ueId = r.rows[0].id;
        for (const m of ue.matieres) {
          await pool.query(
            'INSERT INTO matieres (name, ue_id, credit_ecue) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
            [m.name, ueId, m.credit]
          );
        }
      }
    }
    console.log('UEs GLT-L1 créées');
  }

  // ── 5. Étudiants fictifs ──
  const etudiants = [
    { name:'Aminata Diarra',    filiere:'GLT-L1', session:'jour' },
    { name:'Boubacar Touré',    filiere:'GLT-L1', session:'jour' },
    { name:'Cissé Fatoumata',   filiere:'GLT-L1', session:'soir' },
    { name:'Demba Coulibaly',   filiere:'GLT-L1', session:'jour' },
    { name:'Awa Keïta',         filiere:'GLT-L1', session:'jour' },
    { name:'Modibo Traoré',     filiere:'GLT-L2', session:'jour' },
    { name:'Kadiatou Diallo',   filiere:'GLT-L2', session:'soir' },
    { name:'Sekou Sanogo',      filiere:'INFO GESTION-L1', session:'jour' },
    { name:'Mariam Sissoko',    filiere:'INFO GESTION-L1', session:'jour' },
    { name:'Ousmane Bah',       filiere:'INFO GESTION-L1', session:'soir' },
    { name:'Aïssata Camara',    filiere:'INFO GESTION-L2', session:'jour' },
    { name:'Youssouf Dembélé',  filiere:'AST-L1', session:'jour' },
    { name:'Rokia Kouyaté',     filiere:'AST-L1', session:'soir' },
    { name:'Ibrahim Maïga',     filiere:'AST-L1', session:'jour' },
    { name:'Nana Coulibaly',    filiere:'GLT-L3', session:'jour' },
  ];

  const etuHash = await bcrypt.hash('etu123', 10);
  let etuCount = 10; // continuer depuis le dernier numéro

  for (const etu of etudiants) {
    const fil = filieres.rows.find(f => f.code === etu.filiere);
    if (!fil) continue;

    etuCount++;
    const annee = '2025/2026';
    const anneeShort = '25';
    const matricule = etu.filiere.replace(' ','-') + '-' + anneeShort + '-' + String(etuCount).padStart(3,'0');

    const r = await pool.query(
      `INSERT INTO etudiants (name, filiere_id, annee_academique, session, matricule)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING id`,
      [etu.name, fil.id, annee, etu.session, matricule]
    );

    if (r.rows.length) {
      const etuId = r.rows[0].id;
      const userId = 'ETU' + String(etuCount).padStart(4,'0');
      await pool.query(
        'INSERT INTO users (id, password, name, role, etudiant_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [userId, etuHash, etu.name, 'etudiant', etuId]
      );
    }
  }
  console.log('Etudiants créés:', etudiants.length);

  // ── 6. Notes fictives pour GLT-L1 ──
  const etusGLT = await pool.query(
    `SELECT e.id FROM etudiants e
     JOIN filieres f ON f.id = e.filiere_id
     WHERE f.code = 'GLT-L1' AND e.annee_academique = '2025/2026'`
  );
  const matieres = await pool.query(
    `SELECT m.id FROM matieres m
     JOIN ues u ON u.id = m.ue_id
     WHERE u.semestre = 1`
  );

  for (const etu of etusGLT.rows) {
    for (const mat of matieres.rows) {
      const nc = (Math.random() * 8 + 7).toFixed(2); // 7-15
      const ne = (Math.random() * 8 + 7).toFixed(2); // 7-15
      await pool.query(
        `INSERT INTO notes (etudiant_id, matiere_id, note_classe, note_examen, semestre)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [etu.id, mat.id, nc, ne, 1]
      );
    }
  }
  console.log('Notes créées pour GLT-L1 S1');

  // ── 7. Groupes TD/TP ──
  const fil_glt = filieres.rows.find(f => f.code === 'GLT-L1');
  if (fil_glt) {
    await pool.query(
      `INSERT INTO groupes (nom, type, filiere_id) VALUES
       ('Groupe A', 'TD', $1),
       ('Groupe B', 'TD', $1),
       ('Groupe TP1', 'TP', $1)
       ON CONFLICT DO NOTHING`,
      [fil_glt.id]
    );
    console.log('Groupes créés');
  }

  console.log('\nRemplissage termine !');
  pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
