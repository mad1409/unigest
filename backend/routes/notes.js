
const router = require('express').Router();
const pool   = require('../db');

// GET /api/notes?etudiantId=&ueId=&matiereId=
router.get('/', async (req, res) => {
  try {
    let q = 'SELECT * FROM notes WHERE 1=1';
    const params = [];
    if (req.query.etudiantId) { params.push(req.query.etudiantId); q += ' AND etudiant_id=$'+params.length; }
    if (req.query.ueId)       { params.push(req.query.ueId);       q += ' AND ue_id=$'+params.length; }
    if (req.query.matiereId)  { params.push(req.query.matiereId);  q += ' AND matiere_id=$'+params.length; }
    const r = await pool.query(q + ' ORDER BY id', params);
    res.json(r.rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST /api/notes — créer ou mettre à jour
router.post('/', async (req, res) => {
  const { etudiantId, ueId, matiereId, noteClasse, noteExamen, semestre } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO notes (etudiant_id, ue_id, matiere_id, note_classe, note_examen, semestre)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (etudiant_id, matiere_id)
       DO UPDATE SET note_classe=$4, note_examen=$5, semestre=$6, ue_id=$2
       RETURNING *`,
      [etudiantId, ueId, matiereId, noteClasse, noteExamen, semestre||1]
    );
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
    res.json({success:true});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
