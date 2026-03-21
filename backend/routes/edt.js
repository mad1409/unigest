
const router  = require('express').Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const adminMw = require('../middleware/admin');

// GET — tous les EDTs avec leurs slots
router.get('/', auth, async (req, res) => {
  try {
    const edts = await pool.query(
      'SELECT * FROM emplois_du_temps ORDER BY id'
    );
    for (const edt of edts.rows) {
      const slots = await pool.query(
        'SELECT * FROM edt_slots WHERE edt_id=$1 ORDER BY jour, heure_debut',
        [edt.id]
      );
      edt.slots = slots.rows;
    }
    res.json(edts.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — créer un EDT
router.post('/', auth, adminMw, async (req, res) => {
  const { name, filiereIds, slots } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'INSERT INTO emplois_du_temps (name, filiere_ids) VALUES ($1,$2) RETURNING *',
      [name, filiereIds || []]
    );
    const edt = r.rows[0];
    edt.slots = [];
    for (const slot of (slots || [])) {
      const s = await client.query(
        `INSERT INTO edt_slots
          (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom, tronc)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [edt.id, slot.jour, slot.session||'jour', slot.heureDebut, slot.heureFin,
         slot.matiere, slot.type||'Cours', slot.salle, slot.profNom, slot.tronc||false]
      );
      edt.slots.push(s.rows[0]);
    }
    await client.query('COMMIT');
    res.json(edt);
  } catch(e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

// PUT — modifier un EDT
router.put('/:id', auth, adminMw, async (req, res) => {
  const { name, filiereIds, slots } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE emplois_du_temps SET name=$1, filiere_ids=$2 WHERE id=$3',
      [name, filiereIds || [], req.params.id]
    );
    await client.query('DELETE FROM edt_slots WHERE edt_id=$1', [req.params.id]);
    const edt = { id: parseInt(req.params.id), name, filiereIds, slots: [] };
    for (const slot of (slots || [])) {
      const s = await client.query(
        `INSERT INTO edt_slots
          (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, prof_nom, tronc)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [req.params.id, slot.jour, slot.session||'jour', slot.heureDebut, slot.heureFin,
         slot.matiere, slot.type||'Cours', slot.salle, slot.profNom, slot.tronc||false]
      );
      edt.slots.push(s.rows[0]);
    }
    await client.query('COMMIT');
    res.json(edt);
  } catch(e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

// DELETE
router.delete('/:id', auth, adminMw, async (req, res) => {
  try {
    await pool.query('DELETE FROM emplois_du_temps WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
