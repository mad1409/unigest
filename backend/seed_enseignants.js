const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'unigest', user: 'unigest',
  password: process.env.DB_PASSWORD || 'unigest_secret',
});

const TITRES = ['Dr.','Prof.','M.','Mme.','Ing.'];
const PRENOMS = ['Amadou','Fatoumata','Ibrahim','Mariam','Oumar','Aïssata','Moussa','Kadiatou','Sekou','Aminata','Boubacar','Rokia','Modibo','Awa','Demba','Aliou','Mamadou','Youssouf','Ousmane','Cheick','Sidy','Lamine','Binta','Hawa','Kalil'];
const NOMS = ['Coulibaly','Diallo','Traoré','Koné','Keïta','Sissoko','Diarra','Sanogo','Bah','Camara','Sidibé','Touré','Cissé','Dembélé','Maïga','Kouyaté','Bagayoko','Fofana','Dolo','Samaké'];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function tel() { return '+223 ' + (70+Math.floor(Math.random()*10)) + ' ' + String(Math.floor(Math.random()*90+10)) + ' ' + String(Math.floor(Math.random()*90+10)) + ' ' + String(Math.floor(Math.random()*90+10)); }

async function seed() {
  console.log('Création de 100 enseignants...');

  const filieres = await pool.query('SELECT * FROM filieres ORDER BY id');
  const sites    = await pool.query('SELECT * FROM sites ORDER BY id');
  const ues      = await pool.query('SELECT * FROM ues ORDER BY id');

  if (!filieres.rows.length) { console.error('Aucune filière'); pool.end(); return; }

  const hash = await bcrypt.hash('prof123', 10);
  let created = 0;
  const usedIds = new Set();

  for (let i = 0; i < 100; i++) {
    const titre   = rand(TITRES);
    const prenom  = rand(PRENOMS);
    const nomFam  = rand(NOMS);
    const name    = `${titre} ${prenom} ${nomFam}`;
    const site    = sites.rows.length ? sites.rows[i % sites.rows.length] : null;
    const siteCode= site?.code || 'ETU';

    // UEs liées à cette filière
    const filiere  = filieres.rows[i % filieres.rows.length];
    const uesFil   = ues.rows.filter(u => u.filiere_ids && u.filiere_ids.includes(filiere.id));
    const matiereIds = uesFil.slice(0, 3).map(u => u.id);

    // Générer identifiant unique
    let userId = `P-${siteCode}-${String(i+1).padStart(2,'0')}`;
    while (usedIds.has(userId)) userId = `P-${siteCode}-${String(i+100).padStart(2,'0')}`;
    usedIds.add(userId);

    try {
      // Créer professeur
      const r = await pool.query(
        `INSERT INTO professeurs (name, tel, matieres, site_id)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [name, tel(), matiereIds, site?.id||null]
      );
      const profId = r.rows[0].id;

      // Créer compte
      await pool.query(
        `INSERT INTO users (id, password, name, role, prof_id, site_id)
         VALUES ($1,$2,$3,'prof',$4,$5) ON CONFLICT (id) DO NOTHING`,
        [userId, hash, name, profId, site?.id||null]
      );

      created++;
      if (created % 10 === 0) console.log(`${created} enseignants créés...`);
    } catch(e) {
      console.error(`Erreur ${i}:`, e.message);
    }
  }

  console.log(`\nTerminé ! ${created} enseignants créés.`);

  // Stats
  const stats = await pool.query(`
    SELECT s.nom as site, COUNT(p.id) as nb
    FROM professeurs p
    LEFT JOIN sites s ON s.id = p.site_id
    GROUP BY s.nom ORDER BY s.nom
  `);
  console.log('\nRépartition par site :');
  stats.rows.forEach(r => console.log(`  ${r.site||'Sans site'}: ${r.nb} enseignants`));

  console.log('\nMot de passe: prof123');
  console.log('Format ID: P-SITECODE-NUM (ex: P-BLO-01)');

  pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
