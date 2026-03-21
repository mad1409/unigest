
const router  = require('express').Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const adminMw = require('../middleware/admin');

// GET toutes les notes
router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM notes ORDER BY id');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — sauvegarder les notes (upsert)
router.post('/', auth, async (req, res) => {
  const { etudiantId, matiereId, ueId, noteClasse, noteExamen, semestre } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO notes (etudiant_id, matiere_id, ue_id, note_classe, note_examen, semestre)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (etudiant_id, matiere_id)
       DO UPDATE SET note_classe=$4, note_examen=$5, semestre=$6
       RETURNING *`,
      [etudiantId, matiereId, ueId||null, noteClasse, noteExamen, semestre||1]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — modifier une note
router.put('/:id', auth, async (req, res) => {
  const { noteClasse, noteExamen } = req.body;
  try {
    const r = await pool.query(
      'UPDATE notes SET note_classe=$1, note_examen=$2 WHERE id=$3 RETURNING *',
      [noteClasse, noteExamen, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
