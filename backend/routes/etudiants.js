const { logAudit } = require('../middleware/audit');

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../db');

// GET /api/etudiants
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM etudiants ORDER BY id');
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/etudiants
router.post('/', async (req, res) => {
  const { matricule, name, email, tel, filiereId, anneeAcademique, session } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO etudiants (matricule,name,email,tel,filiere_id,annee_academique,session)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [matricule, name, email||'', tel||'', filiereId, anneeAcademique, session||'jour']
    );
    const etu = r.rows[0];
    // Créer compte automatiquement
    const parts  = name.trim().split(' ');
    const init   = parts.map(p=>p[0]?.toUpperCase()||'').join('').slice(0,3);
    const count  = await pool.query("SELECT COUNT(*) FROM users WHERE id LIKE 'ETU%'");
    const userId = 'ETU' + init + String(parseInt(count.rows[0].count)+1).padStart(2,'0');
    const hash   = await bcrypt.hash('etu123', 10);
    await pool.query(
      'INSERT INTO users (id,password,role,name,etudiant_id) VALUES ($1,$2,$3,$4,$5)',
      [userId, hash, 'etudiant', name, etu.id]
    );
    res.json({ ...etu, userId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/etudiants/:id
router.put('/:id', async (req, res) => {
  const { name, email, tel, filiereId, anneeAcademique, session } = req.body;
  try {
    const r = await pool.query(
      `UPDATE etudiants SET name=$1,email=$2,tel=$3,filiere_id=$4,annee_academique=$5,session=$6
       WHERE id=$7 RETURNING *`,
      [name, email||'', tel||'', filiereId, anneeAcademique, session||'jour', req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/etudiants/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE etudiant_id=$1', [req.params.id]);
    await pool.query('DELETE FROM etudiants WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/etudiants/:id/archive
router.put('/:id/archive', async (req, res) => {
  try {
    await pool.query('UPDATE etudiants SET archive=TRUE WHERE id=$1', [req.params.id]);
    // Désactiver aussi le compte
    await pool.query('UPDATE users SET archive=TRUE WHERE etudiant_id=$1', [req.params.id]);
    res.json({ success:true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// PUT /api/etudiants/:id/restore
router.put('/:id/restore', async (req, res) => {
  try {
    await pool.query('UPDATE etudiants SET archive=FALSE WHERE id=$1', [req.params.id]);
    await pool.query('UPDATE users SET archive=FALSE WHERE etudiant_id=$1', [req.params.id]);
    res.json({ success:true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST /api/etudiants/archive-annee — archiver toute une promotion
router.post('/archive-annee', async (req, res) => {
  const { anneeAcademique } = req.body;
  if (!anneeAcademique) return res.status(400).json({ error:'Annee requise' });
  try {
    const r = await pool.query(
      'UPDATE etudiants SET archive=TRUE WHERE annee_academique=$1 AND archive IS NOT TRUE RETURNING id',
      [anneeAcademique]
    );
    // Archiver aussi leurs comptes
    for (const row of r.rows) {
      await pool.query('UPDATE users SET archive=TRUE WHERE etudiant_id=$1', [row.id]);
    }
    res.json({ success:true, count: r.rowCount });
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
