
const router  = require('express').Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const adminMw = require('../middleware/admin');

router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM groupes ORDER BY nom');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, adminMw, async (req, res) => {
  const { nom, filiereId, type, effectif } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO groupes (nom, filiere_id, type, effectif) VALUES ($1,$2,$3,$4) RETURNING *',
      [nom, filiereId||null, type||'TD', effectif||30]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, adminMw, async (req, res) => {
  const { nom, filiereId, type, effectif } = req.body;
  try {
    const r = await pool.query(
      'UPDATE groupes SET nom=$1, filiere_id=$2, type=$3, effectif=$4 WHERE id=$5 RETURNING *',
      [nom, filiereId||null, type||'TD', effectif||30, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminMw, async (req, res) => {
  try {
    await pool.query('DELETE FROM groupes WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
