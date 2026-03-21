const { Pool } = require('pg');
require('dotenv').config({ path: '/home/ubuntu/unigest/.env' });

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD,
});

async function seedEDT() {
  console.log('Création EDT fictif Technolab ISTA...');

  const profs    = await pool.query('SELECT * FROM professeurs ORDER BY id');
  const filieres = await pool.query('SELECT * FROM filieres ORDER BY id');
  const ues      = await pool.query('SELECT * FROM ues ORDER BY id');

  const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const TYPES = ['CM','TD','TP'];

  const SITES = [
    'Direction', 'Ba Djelika', 'Maison Blanche',
    'Korofina', 'Sotuba', 'Sabalibougou',
  ];

  const SALLES = {
    'Direction':      ['Amphi 1','Amphi 2','Salle D1','Salle D2','Labo Info D'],
    'Ba Djelika':     ['Salle BD1','Salle BD2','Salle BD3','Labo BD'],
    'Maison Blanche': ['Salle MB1','Salle MB2','Amphi MB','Labo MB'],
    'Korofina':       ['Salle K1','Salle K2','Salle K3'],
    'Sotuba':         ['Salle S1','Salle S2','Labo S'],
    'Sabalibougou':   ['Salle SB1','Salle SB2','Salle SB3'],
  };

  const CRENEAUX_JOUR = [
    { debut:'07:30', fin:'09:30' },
    { debut:'09:30', fin:'11:30' },
    { debut:'11:30', fin:'13:30' },
    { debut:'13:30', fin:'15:30' },
    { debut:'15:30', fin:'17:00' },
  ];

  const CRENEAUX_SOIR = [
    { debut:'17:00', fin:'19:00' },
    { debut:'19:00', fin:'21:00' },
  ];

  // Supprimer les anciens EDT
  await pool.query('DELETE FROM edt_slots');
  await pool.query('DELETE FROM emplois_du_temps');
  console.log('Anciens EDT supprimés');

  let count  = 0;
  let siteIdx = 0;

  for (const fil of filieres.rows) {
    const uesFil = ues.rows.filter(u =>
      u.filiere_ids && u.filiere_ids.includes(fil.id) && u.semestre === 1
    );
    if (!uesFil.length) continue;

    const site   = SITES[siteIdx % SITES.length];
    const salles = SALLES[site];
    siteIdx++;

    console.log(`Filiere ${fil.code} -> Site: ${site}`);

    // Créer l EDT pour cette filière
    const edtR = await pool.query(
      'INSERT INTO emplois_du_temps (name, filiere_ids) VALUES ($1, $2) RETURNING id',
      [fil.code + ' - 2025/2026', [fil.id]]
    );
    const edtId = edtR.rows[0].id;

    // ── Cours JOUR ──
    let jourIdx = 0;
    let crIdx   = 0;

    for (const ue of uesFil) {
      const prof    = profs.rows[count % profs.rows.length];
      const jour    = JOURS[jourIdx % 5];
      const creneau = CRENEAUX_JOUR[crIdx % CRENEAUX_JOUR.length];
      const salle   = site + ' — ' + salles[count % salles.length];
      const type    = TYPES[count % TYPES.length];

      await pool.query(`
        INSERT INTO edt_slots
          (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [edtId, jour, 'jour', creneau.debut, creneau.fin,
          ue.intitule, type, salle, prof.name]);

      count++;
      crIdx++;
      if (crIdx % CRENEAUX_JOUR.length === 0) jourIdx++;
    }

    // ── Cours SOIR ──
    jourIdx = 0;
    crIdx   = 0;

    for (const ue of uesFil) {
      const prof    = profs.rows[(count + 2) % profs.rows.length];
      const jour    = JOURS[jourIdx % 6];
      const creneau = CRENEAUX_SOIR[crIdx % CRENEAUX_SOIR.length];
      const salle   = site + ' — ' + salles[(count + 1) % salles.length];
      const type    = TYPES[(count + 1) % TYPES.length];

      await pool.query(`
        INSERT INTO edt_slots
          (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [edtId, jour, 'soir', creneau.debut, creneau.fin,
          ue.intitule + ' (Soir)', type, salle, prof.name]);

      count++;
      crIdx++;
      if (crIdx % CRENEAUX_SOIR.length === 0) jourIdx++;
    }
  }

  const totalEdt   = await pool.query('SELECT COUNT(*) FROM emplois_du_temps');
  const totalSlots = await pool.query('SELECT COUNT(*) FROM edt_slots');
  console.log('\nEDT créés:', totalEdt.rows[0].count);
  console.log('Créneaux créés:', totalSlots.rows[0].count);

  // Résumé par session
  const parSession = await pool.query(`
    SELECT session, COUNT(*) as nb FROM edt_slots GROUP BY session ORDER BY session
  `);
  console.log('\nRésumé :');
  parSession.rows.forEach(r => console.log(`  ${r.session}: ${r.nb} créneaux`));

  pool.end();
}

seedEDT().catch(e => { console.error(e.message); pool.end(); });
