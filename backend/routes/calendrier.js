const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');
function adminOrSurv(req, res, next) {
  if (req.user?.role === 'admin' || req.user?.role === 'surveillant') return next();
  return res.status(403).json({ error: 'Accès refusé' });
}

// GET — tous les événements
router.get('/', auth, async (req, res) => {
  try {
    const annee = req.query.annee || '2025/2026';
    const r = await pool.query(
      'SELECT * FROM calendrier WHERE annee_academique=$1 ORDER BY date_debut',
      [annee]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET public — pour les étudiants sans auth
router.get('/public', async (req, res) => {
  try {
    const annee = req.query.annee || '2025/2026';
    const r = await pool.query(
      'SELECT * FROM calendrier WHERE annee_academique=$1 ORDER BY date_debut',
      [annee]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — créer un événement
router.post('/', auth, adminOrSurv, async (req, res) => {
  const { titre, type, dateDebut, dateFin, description, anneeAcademique } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO calendrier (titre, type, date_debut, date_fin, description, annee_academique)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [titre, type||'autre', dateDebut, dateFin||dateDebut, description||null, anneeAcademique||'2025/2026']
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — modifier
router.put('/:id', auth, adminOrSurv, async (req, res) => {
  const { titre, type, dateDebut, dateFin, description } = req.body;
  try {
    const r = await pool.query(
      `UPDATE calendrier SET titre=$1, type=$2, date_debut=$3, date_fin=$4, description=$5
       WHERE id=$6 RETURNING *`,
      [titre, type, dateDebut, dateFin||dateDebut, description||null, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', auth, adminOrSurv, async (req, res) => {
  try {
    await pool.query('DELETE FROM calendrier WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
