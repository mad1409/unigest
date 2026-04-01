const { logAudit } = require('../middleware/audit');

const router = require('express').Router();
const auth = require('../middleware/auth');
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
router.post('/', auth, async (req, res) => {
  const { matricule, name, email, tel, filiereId, anneeAcademique, session } = req.body;
  try {
    // SECURITE : Forcer le rattachement au site de l'utilisateur qui cree
    let forcedSiteId = req.body.site_id;
    if (req.user && !forcedSiteId) {
      if (req.user.role === 'secretaire' || req.user.role === 'admin_site') {
        forcedSiteId = req.user.site_id;
      }
    }

    // 1. Creer l'etudiant AVEC le site_id
    const r = await pool.query(
      `INSERT INTO etudiants (matricule,name,email,tel,filiere_id,annee_academique,session,site_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [matricule, name, email||'', tel||'', filiereId, anneeAcademique, session||'jour', forcedSiteId || null]
    );
    const etu = r.rows[0];
    
    // 2. Creer le compte utilisateur AVEC le site_id et un login unique par site
    const parts  = name.trim().split(' ');
    const init   = parts.map(p=>p[0]?.toUpperCase()||'').join('').slice(0,3);
    const count  = await pool.query("SELECT COUNT(*) FROM users WHERE id LIKE 'ETU%' AND (site_id = $1 OR site_id IS NULL)", [forcedSiteId || null]);
    const userId = 'ETU' + init + String(parseInt(count.rows[0].count)+1).padStart(2,'0');
    const hash   = await bcrypt.hash('etu123', 10);
    
    await pool.query(
      'INSERT INTO users (id,password,role,name,etudiant_id,site_id) VALUES ($1,$2,$3,$4,$5,$6)',
      [userId, hash, 'etudiant', name, etu.id, forcedSiteId || null]
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

// POST /api/etudiants/archive-annee
router.post('/archive-annee', async (req, res) => {
  const { anneeAcademique } = req.body;
  if (!anneeAcademique) return res.status(400).json({ error:'Annee requise' });
  try {
    const r = await pool.query(
      'UPDATE etudiants SET archive=TRUE WHERE annee_academique=$1 AND archive IS NOT TRUE RETURNING id',
      [anneeAcademique]
    );
    for (const row of r.rows) {
      await pool.query('UPDATE users SET archive=TRUE WHERE etudiant_id=$1', [row.id]);
    }
    res.json({ success:true, count: r.rowCount });
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
