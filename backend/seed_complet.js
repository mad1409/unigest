const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD || 'unigest_secret',
});

const PRENOMS = ['Amadou','Fatoumata','Ibrahim','Mariam','Oumar','Aïssata','Moussa','Kadiatou','Sekou','Aminata','Boubacar','Rokia','Modibo','Awa','Demba','Nana','Aliou','Mamadou','Youssouf','Ousmane'];
const NOMS = ['Coulibaly','Diallo','Traoré','Koné','Keïta','Sissoko','Diarra','Sanogo','Bah','Camara','Sidibé','Touré','Cissé','Dembélé','Maïga'];
const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const TYPES = ['CM','TD','TP'];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function note() { return parseFloat((Math.random()*14+3).toFixed(2)); }
function tel() { return '+223 7' + Math.floor(Math.random()*9) + ' ' + Math.floor(10+Math.random()*90) + ' ' + Math.floor(10+Math.random()*90) + ' ' + Math.floor(10+Math.random()*90); }

async function seed() {
  console.log('=== SEED COMPLET UNIGEST ===\n');

  const filieres = (await pool.query('SELECT * FROM filieres ORDER BY id')).rows;
  const sites    = (await pool.query('SELECT * FROM sites ORDER BY id')).rows;
  const ues      = (await pool.query('SELECT * FROM ues ORDER BY id')).rows;
  const matieres = (await pool.query('SELECT * FROM matieres ORDER BY id')).rows;
  const profs    = (await pool.query('SELECT * FROM professeurs ORDER BY id')).rows;

  if (!filieres.length) { console.error('Créez d\'abord les filières !'); pool.end(); return; }

  const hashEtu  = await bcrypt.hash('etu123', 10);
  const hashProf = await bcrypt.hash('prof123', 10);

  // ── 1. ÉTUDIANTS (50 jour + 50 soir) ──
  console.log('1. Création étudiants...');
  let nbEtu = 0;

  for (let i = 0; i < 100; i++) {
    const prenom  = rand(PRENOMS);
    const nom     = rand(NOMS);
    const name    = prenom + ' ' + nom;
    const filiere = filieres[i % filieres.length];
    const site    = sites.length ? sites[i % sites.length] : null;
    const session = i < 50 ? 'jour' : 'soir';
    const annee   = '2025/2026';
    const siteCode = site?.code || 'ETU';
    const filCode  = (filiere.code || 'ETU').split('-')[0].replace(/\s/g,'').slice(0,6);
    const abrev    = nom.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase();
    const num      = String(i+1).padStart(3,'0');
    const matricule = `${siteCode}-${filCode}-25-${num}`;
    const userId   = `${filCode}-${siteCode}-${abrev}-2025-${i+1}`;

    try {
      const r = await pool.query(
        `INSERT INTO etudiants (matricule, name, filiere_id, annee_academique, session, site_id)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (matricule) DO NOTHING RETURNING id`,
        [matricule, name, filiere.id, annee, session, site?.id||null]
      );
      if (!r.rows.length) continue;
      const etuId = r.rows[0].id;

      await pool.query(
        `INSERT INTO users (id, password, name, role, etudiant_id, site_id, must_change_password)
         VALUES ($1,$2,$3,'etudiant',$4,$5,TRUE) ON CONFLICT (id) DO NOTHING`,
        [userId, hashEtu, name, etuId, site?.id||null]
      );

      // Notes pour les matières de la filière
      const matsFil = matieres.filter(m => {
        const ue = ues.find(u => u.id === m.ue_id);
        return ue && Array.isArray(ue.filiere_ids) && ue.filiere_ids.includes(filiere.id);
      });

      for (const mat of matsFil.slice(0,8)) {
        const ue = ues.find(u => u.id === mat.ue_id);
        await pool.query(
          `INSERT INTO notes (etudiant_id, matiere_id, ue_id, note_classe, note_examen, semestre)
           VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [etuId, mat.id, mat.ue_id, note(), note(), ue?.semestre||1]
        );
      }

      nbEtu++;
    } catch(e) { /* ignorer doublons */ }
  }
  console.log(`   ${nbEtu} étudiants créés (jour + soir) avec notes`);

  // ── 2. EMPLOIS DU TEMPS ──
  console.log('\n2. Création emplois du temps...');
  let nbEDT = 0;
  let nbSlots = 0;

  const CRENEAUX_JOUR = [
    {debut:'07:30',fin:'09:30'},
    {debut:'09:30',fin:'11:30'},
    {debut:'11:30',fin:'13:30'},
    {debut:'13:30',fin:'15:30'},
    {debut:'15:30',fin:'17:00'},
  ];
  const CRENEAUX_SOIR = [
    {debut:'17:00',fin:'19:00'},
    {debut:'19:00',fin:'21:00'},
  ];

  const SALLES_SITE = {
    default: ['Salle A','Salle B','Salle C','Amphi 1','Labo Info'],
  };

  for (const filiere of filieres) {
    const uesFil = ues.filter(u => Array.isArray(u.filiere_ids) && u.filiere_ids.includes(filiere.id));
    if (!uesFil.length) continue;

    // EDT Jour
    const edtJour = await pool.query(
      `INSERT INTO emplois_du_temps (name, filiere_ids, site_id)
       VALUES ($1,$2,$3) RETURNING id`,
      [`${filiere.code} - Jour 2025/2026`, [filiere.id], sites[0]?.id||null]
    );
    nbEDT++;

    let jourIdx = 0, crIdx = 0;
    for (const ue of uesFil.slice(0,15)) {
      const prof   = profs.length ? profs[nbSlots % profs.length] : null;
      const jour   = JOURS[jourIdx % 5];
      const cr     = CRENEAUX_JOUR[crIdx % CRENEAUX_JOUR.length];
      const salles = SALLES_SITE.default;
      const salle  = salles[nbSlots % salles.length];

      await pool.query(
        `INSERT INTO edt_slots (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom, site_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [edtJour.rows[0].id, jour, 'jour', cr.debut, cr.fin,
         ue.intitule, rand(TYPES), salle, prof?.name||null, sites[0]?.id||null]
      );
      nbSlots++;
      crIdx++;
      if (crIdx % CRENEAUX_JOUR.length === 0) jourIdx++;
    }

    // EDT Soir
    const edtSoir = await pool.query(
      `INSERT INTO emplois_du_temps (name, filiere_ids, site_id)
       VALUES ($1,$2,$3) RETURNING id`,
      [`${filiere.code} - Soir 2025/2026`, [filiere.id], sites[0]?.id||null]
    );
    nbEDT++;

    jourIdx = 0; crIdx = 0;
    for (const ue of uesFil.slice(0,10)) {
      const prof = profs.length ? profs[(nbSlots+3) % profs.length] : null;
      const jour = JOURS[jourIdx % 6];
      const cr   = CRENEAUX_SOIR[crIdx % CRENEAUX_SOIR.length];

      await pool.query(
        `INSERT INTO edt_slots (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom, site_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [edtSoir.rows[0].id, jour, 'soir', cr.debut, cr.fin,
         ue.intitule, rand(TYPES), 'Salle Soir', prof?.name||null, sites[0]?.id||null]
      );
      nbSlots++;
      crIdx++;
      if (crIdx % CRENEAUX_SOIR.length === 0) jourIdx++;
    }
  }
  console.log(`   ${nbEDT} EDT créés (${nbSlots} créneaux)`);

  // ── 3. GROUPES ──
  console.log('\n3. Création groupes...');
  let nbGroupes = 0;
  for (const fil of filieres.slice(0,5)) {
    for (const type of ['TD','TP']) {
      for (let g = 1; g <= 2; g++) {
        await pool.query(
          `INSERT INTO groupes (nom, filiere_id, type, effectif, site_id)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
          [`Groupe ${type}${g} - ${fil.code}`, fil.id, type, 25, sites[0]?.id||null]
        );
        nbGroupes++;
      }
    }
  }
  console.log(`   ${nbGroupes} groupes créés`);

  // ── RÉSUMÉ ──
  console.log('\n=== RÉSUMÉ ===');
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM etudiants WHERE archive IS NOT TRUE) as etudiants,
      (SELECT COUNT(*) FROM users WHERE role='etudiant') as comptes_etu,
      (SELECT COUNT(*) FROM notes) as notes,
      (SELECT COUNT(*) FROM emplois_du_temps) as edts,
      (SELECT COUNT(*) FROM edt_slots) as creneaux,
      (SELECT COUNT(*) FROM groupes) as groupes
  `);
  const s = stats.rows[0];
  console.log(`Etudiants : ${s.etudiants} (${s.comptes_etu} comptes)`);
  console.log(`Notes     : ${s.notes}`);
  console.log(`EDTs      : ${s.edts} (${s.creneaux} créneaux)`);
  console.log(`Groupes   : ${s.groupes}`);
  console.log('\nMot de passe étudiants : etu123');

  pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
