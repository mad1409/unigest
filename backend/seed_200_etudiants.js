const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD || 'unigest_secret',
});

const PRENOMS = ['Amadou','Fatoumata','Ibrahim','Mariam','Oumar','Aïssata','Moussa','Kadiatou','Sekou','Aminata','Boubacar','Rokia','Modibo','Awa','Demba','Nana','Aliou','Kadidiatou','Mamadou','Aïcha','Youssouf','Salimata','Ousmane','Bintou','Cheick','Oumou','Sidy','Hawa','Lamine','Djeneba'];
const NOMS = ['Coulibaly','Diallo','Traoré','Koné','Keïta','Sissoko','Diarra','Sanogo','Bah','Camara','Sidibé','Touré','Cissé','Dembélé','Maïga','Kouyaté','Bagayoko','Fofana','Dolo','Samaké'];

function prenom() { return PRENOMS[Math.floor(Math.random()*PRENOMS.length)]; }
function nom() { return NOMS[Math.floor(Math.random()*NOMS.length)]; }
function note() { return (Math.random()*14+3).toFixed(2); }

async function seed() {
  console.log('Création de 200 étudiants...');

  const filieres = await pool.query('SELECT * FROM filieres ORDER BY id');
  const sites    = await pool.query('SELECT * FROM sites ORDER BY id');
  const ues      = await pool.query('SELECT * FROM ues ORDER BY id');
  const matieres = await pool.query('SELECT * FROM matieres ORDER BY id');

  if (!filieres.rows.length) { console.error('Aucune filière — créez d\'abord les filières'); pool.end(); return; }

  const hash = await bcrypt.hash('etu123', 10);
  let created = 0;

  for (let i = 0; i < 200; i++) {
    const p       = prenom();
    const n       = nom();
    const name    = p + ' ' + n;
    const filiere = filieres.rows[i % filieres.rows.length];
    const site    = sites.rows.length ? sites.rows[i % sites.rows.length] : null;
    const session = i % 3 === 0 ? 'soir' : 'jour';
    const annee   = '2025/2026';
    const siteCode = site?.code || 'ETU';
    const filCode  = filiere.code.split('-')[0].split(' ')[0].toUpperCase().slice(0,6);
    const num      = String(i+1).padStart(3,'0');
    const matricule = `${siteCode}-${filCode}-25-${num}`;
    const userId    = `${n}-${siteCode}-${filCode}-2025-${i+1}`;

    try {
      // Créer étudiant
      const r = await pool.query(
        `INSERT INTO etudiants (matricule, name, filiere_id, annee_academique, session, site_id)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (matricule) DO NOTHING RETURNING id`,
        [matricule, name, filiere.id, annee, session, site?.id||null]
      );
      if (!r.rows.length) continue;
      const etuId = r.rows[0].id;

      // Créer compte
      await pool.query(
        `INSERT INTO users (id, password, name, role, etudiant_id, site_id)
         VALUES ($1,$2,$3,'etudiant',$4,$5) ON CONFLICT (id) DO NOTHING`,
        [userId, hash, name, etuId, site?.id||null]
      );

      // Ajouter notes pour les matières de la filière
      const matsFil = matieres.rows.filter(m => {
        const ue = ues.rows.find(u => u.id === m.ue_id);
        return ue && ue.filiere_ids && ue.filiere_ids.includes(filiere.id);
      });

      for (const mat of matsFil.slice(0,6)) {
        await pool.query(
          `INSERT INTO notes (etudiant_id, matiere_id, ue_id, note_classe, note_examen, semestre)
           VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [etuId, mat.id, mat.ue_id, note(), note(), 1]
        );
      }

      created++;
      if (created % 20 === 0) console.log(`${created} étudiants créés...`);
    } catch(e) {
      // Ignorer les doublons
    }
  }

  console.log(`\nTerminé ! ${created} étudiants créés avec notes.`);

  // Stats
  const stats = await pool.query(`
    SELECT f.code, COUNT(e.id) as nb
    FROM etudiants e JOIN filieres f ON f.id=e.filiere_id
    GROUP BY f.code ORDER BY f.code
  `);
  console.log('\nRépartition par filière :');
  stats.rows.forEach(r => console.log(`  ${r.code}: ${r.nb} étudiants`));

  const notesStat = await pool.query('SELECT COUNT(*) FROM notes');
  console.log(`\nTotal notes: ${notesStat.rows[0].count}`);

  pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
