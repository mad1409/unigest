const router  = require('express').Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const adminMw = require('../middleware/admin');

router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM professeurs ORDER BY name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, adminMw, async (req, res) => {
  const { name, tel, matieres, siteIds } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO professeurs (name, tel, matieres, site_ids) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, tel||null, matieres||[], siteIds||null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, adminMw, async (req, res) => {
  const { name, tel, matieres, siteIds } = req.body;
  try {
    const r = await pool.query(
      'UPDATE professeurs SET name=$1, tel=$2, matieres=$3, site_ids=$4 WHERE id=$5 RETURNING *',
      [name, tel||null, matieres||[], siteIds||null, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminMw, async (req, res) => {
  try {
    await pool.query('UPDATE users SET prof_id=NULL WHERE prof_id=$1', [req.params.id]);
    await pool.query('DELETE FROM professeurs WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
