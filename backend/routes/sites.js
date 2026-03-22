const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');

// GET tous les sites
router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM sites ORDER BY nom');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST créer un site
router.post('/', auth, admin, async (req, res) => {
  const { nom, adresse, tel } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  try {
    const r = await pool.query(
      'INSERT INTO sites (nom, adresse, tel) VALUES ($1,$2,$3) RETURNING *',
      [nom, adresse||null, tel||null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT modifier un site
router.put('/:id', auth, admin, async (req, res) => {
  const { nom, adresse, tel, actif } = req.body;
  try {
    const r = await pool.query(
      'UPDATE sites SET nom=$1, adresse=$2, tel=$3, actif=$4 WHERE id=$5 RETURNING *',
      [nom, adresse||null, tel||null, actif!==false, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE supprimer un site
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // Délier les étudiants et EDT avant suppression
    await pool.query('UPDATE etudiants SET site_id=NULL WHERE site_id=$1', [req.params.id]);
    await pool.query('UPDATE emplois_du_temps SET site_id=NULL WHERE site_id=$1', [req.params.id]);
    await pool.query('DELETE FROM sites WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
