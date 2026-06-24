const router  = require('express').Router();
const pool    = require('../db');
const bcrypt  = require('bcryptjs');
const auth    = require('../middleware/auth');
const adminMw = require('../middleware/admin');

async function genProfId(name, client) {
  const parts  = (name||"").trim().split(" ").filter(Boolean);
  const prenom = (parts[0]||"X")[0].toUpperCase();
  const nom    = (parts[1]||parts[0]||"XX").slice(0,2).toUpperCase();
  const init   = prenom + nom;
  let n = 1;
  while (true) {
    const id = 'ENS' + init + String(n).padStart(2,"0");
    const r  = await client.query('SELECT id FROM users WHERE id=$1', [id]);
    if (!r.rows.length) return id;
    n++;
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM professeurs ORDER BY name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — crée le professeur + le compte utilisateur automatiquement
router.post('/', auth, adminMw, async (req, res) => {
  const { name, tel, matieres, siteIds, cycle, filiereIds, annexe_id, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Créer le professeur
    const r = await client.query(
      `INSERT INTO professeurs (name, tel, matieres, site_ids, cycle, filiere_ids, annexe_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, tel||null, matieres||[], siteIds||null, cycle||'Licence', filiereIds||[], annexe_id||null]
    );
    const prof = r.rows[0];

    // 2. Générer un identifiant unique
    const userId = await genProfId(name, client);

    // 3. Créer le compte utilisateur (mot de passe par défaut : prof123)
    const hash = await bcrypt.hash(password || 'prof123', 10);
    await client.query(
      'INSERT INTO users (id, password, role, name, prof_id, annexe_id, must_change_password) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [userId, hash, 'prof', name, prof.id, annexe_id||null, true]
    );

    await client.query('COMMIT');
    res.json({ ...prof, userId, defaultPassword: '000000' });
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

router.put('/:id', auth, adminMw, async (req, res) => {
  const { name, tel, matieres, siteIds, cycle, filiereIds, annexe_id, password } = req.body;
  try {
    const r = await pool.query(
      `UPDATE professeurs SET name=$1, tel=$2, matieres=$3, site_ids=$4,
       cycle=$5, filiere_ids=$6, annexe_id=$7 WHERE id=$8 RETURNING *`,
      [name, tel||null, matieres||[], siteIds||null, cycle||'Licence', filiereIds||[], annexe_id||null, req.params.id]
    );
    // Mettre à jour aussi le nom dans users
    await pool.query('UPDATE users SET name=$1 WHERE prof_id=$2', [name, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminMw, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE prof_id=$1', [req.params.id]);
    await pool.query('DELETE FROM professeurs WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
