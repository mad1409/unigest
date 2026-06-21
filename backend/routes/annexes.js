const router   = require('express').Router();
const pool     = require('../db');
const adminMw  = require('../middleware/admin');

// GET /api/annexes — liste avec stats
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT a.*,
        (SELECT COUNT(*) FROM etudiants   e WHERE e.annexe_id = a.id) AS nb_etudiants,
        (SELECT COUNT(*) FROM professeurs p WHERE p.annexe_id = a.id) AS nb_professeurs,
        (SELECT COUNT(*) FROM emplois_du_temps edt WHERE edt.annexe_id = a.id) AS nb_edts
      FROM annexes a ORDER BY a.nom
    `);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/annexes — créer (admin seulement)
router.post('/', adminMw, async (req, res) => {
  const { nom, adresse } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  try {
    const r = await pool.query(
      'INSERT INTO annexes (nom, adresse, tenant_id) VALUES ($1,$2,$3) RETURNING *',
      [nom, adresse || null, req.user.tenant_id || null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/annexes/transfer — transfert en 1 clic (avant /:id pour éviter conflit)
router.put('/transfer', adminMw, async (req, res) => {
  const { type, id, annexe_id } = req.body;
  if (!type || !id || !annexe_id)
    return res.status(400).json({ error: 'type, id et annexe_id requis' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (type === 'etudiant') {
      await client.query('UPDATE etudiants SET annexe_id=$1 WHERE id=$2', [annexe_id, id]);
      await client.query('UPDATE users SET annexe_id=$1 WHERE etudiant_id=$2', [annexe_id, id]);
    } else if (type === 'professeur') {
      await client.query('UPDATE professeurs SET annexe_id=$1 WHERE id=$2', [annexe_id, id]);
      await client.query('UPDATE users SET annexe_id=$1 WHERE prof_id=$2', [annexe_id, id]);
    } else {
      return res.status(400).json({ error: 'Type invalide — utiliser etudiant ou professeur' });
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

// PUT /api/annexes/:id — modifier
router.put('/:id', adminMw, async (req, res) => {
  const { nom, adresse } = req.body;
  try {
    const r = await pool.query(
      'UPDATE annexes SET nom=$1, adresse=$2 WHERE id=$3 RETURNING *',
      [nom, adresse || null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Annexe introuvable' });
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/annexes/:id
router.delete('/:id', adminMw, async (req, res) => {
  try {
    const unlinks = [
      'UPDATE users            SET annexe_id=NULL WHERE annexe_id=$1',
      'UPDATE etudiants        SET annexe_id=NULL WHERE annexe_id=$1',
      'UPDATE professeurs      SET annexe_id=NULL WHERE annexe_id=$1',
      'UPDATE emplois_du_temps SET annexe_id=NULL WHERE annexe_id=$1',
      'UPDATE edt_slots        SET annexe_id=NULL WHERE annexe_id=$1',
    ];
    for (const q of unlinks) {
      try { await pool.query(q, [req.params.id]); } catch {}
    }
    await pool.query('DELETE FROM annexes WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/annexes/:id/etudiants
router.get('/:id/etudiants', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT e.*, f.name AS filiere_name
       FROM etudiants e LEFT JOIN filieres f ON f.id = e.filiere_id
       WHERE e.annexe_id=$1 ORDER BY e.name`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/annexes/:id/professeurs
router.get('/:id/professeurs', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM professeurs WHERE annexe_id=$1 ORDER BY name',
      [req.params.id]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
