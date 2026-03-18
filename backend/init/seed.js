
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
require('dotenv').config({ path: '/home/ubuntu/unigest/.env' });

const pool = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'unigest',
  user:     process.env.DB_USER     || 'unigest',
  password: process.env.DB_PASSWORD || 'unigest_secret',
});

async function seed() {
  const client = await pool.connect();
  try {
    // Vérifier si déjà initialisé
    const check = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('Base déjà initialisée — seed ignoré');
      return;
    }

    console.log('Initialisation des données de base...');

    // Paramètres
    await client.query(`
      INSERT INTO parametres (nom_etablissement, annee_academique, annee_active, semestre_actif, annees_disponibles)
      VALUES ($1, $2, $2, $3, $4)
    `, [
      process.env.NOM_ETABLISSEMENT || 'Universite',
      process.env.ANNEE_ACADEMIQUE  || '2025/2026',
      parseInt(process.env.SEMESTRE_ACTIF || '1'),
      process.env.ANNEES_DISPONIBLES || '2025/2026',
    ]);

    // Filières par défaut
    const filieres = [
      ['INFO-L1', 'Informatique Licence 1', 'Licence'],
      ['INFO-L2', 'Informatique Licence 2', 'Licence'],
      ['GEST-L1', 'Gestion Licence 1',      'Licence'],
      ['TC-SCI',  'Tronc Commun Sciences',  'Master' ],
    ];
    for (const [code, name, cycle] of filieres) {
      await client.query(
        'INSERT INTO filieres (code, name, cycle) VALUES ($1,$2,$3) ON CONFLICT (code) DO NOTHING',
        [code, name, cycle]
      );
    }

    // Professeurs par défaut
    const profs = [
      ['Dr. Konan Yves',       '+223 70 00 00 01'],
      ['Dr. Diallo Moussa',    '+223 70 00 00 02'],
      ['Dr. Ouattara Aminata', '+223 70 00 00 03'],
      ['Dr. Traoré Seydou',    '+223 70 00 00 04'],
    ];
    const profIds = [];
    for (const [name, tel] of profs) {
      const r = await client.query(
        'INSERT INTO professeurs (name, tel) VALUES ($1,$2) RETURNING id',
        [name, tel]
      );
      profIds.push(r.rows[0].id);
    }

    // Compte admin
    const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await client.query(
      'INSERT INTO users (id, password, role, name) VALUES ($1,$2,$3,$4)',
      [process.env.ADMIN_ID || 'admin', adminPass,
       'admin', process.env.ADMIN_NAME || 'Administration Centrale']
    );

    // Comptes profs
    const profLogins = ['prof1','prof2','prof3','prof4'];
    const profPass   = await bcrypt.hash('prof123', 10);
    for (let i = 0; i < profIds.length; i++) {
      await client.query(
        'INSERT INTO users (id, password, role, name, prof_id) VALUES ($1,$2,$3,$4,$5)',
        [profLogins[i], profPass, 'prof', profs[i][0], profIds[i]]
      );
    }

    // Comptes secrétaire et surveillant
    const secrPass = await bcrypt.hash('secr123', 10);
    const survPass = await bcrypt.hash('surv123', 10);
    await client.query('INSERT INTO users (id,password,role,name) VALUES ($1,$2,$3,$4)',
      ['secr1', secrPass, 'secretaire', 'Secretaire Principal']);
    await client.query('INSERT INTO users (id,password,role,name) VALUES ($1,$2,$3,$4)',
      ['surv1', survPass, 'surveillant', 'Surveillant General']);

    // Groupes par défaut
    const groupesFil = await client.query('SELECT id, code FROM filieres');
    for (const f of groupesFil.rows) {
      await client.query('INSERT INTO groupes (nom, filiere_id, type, effectif) VALUES ($1,$2,$3,$4)',
        [f.code+'-TD1', f.id, 'TD', 30]);
      await client.query('INSERT INTO groupes (nom, filiere_id, type, effectif) VALUES ($1,$2,$3,$4)',
        [f.code+'-TP1', f.id, 'TP', 20]);
    }

    console.log('Seed terminé avec succès');
  } catch (err) {
    console.error('Erreur seed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
