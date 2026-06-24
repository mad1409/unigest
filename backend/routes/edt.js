const router        = require('express').Router();
const pool          = require('../db');
const auth          = require('../middleware/auth');
const surveillantMw = require('../middleware/surveillant');

// GET — admin voit tout, surveillant voit son annexe seulement
router.get('/', auth, async (req, res) => {
  try {
    let query  = 'SELECT * FROM emplois_du_temps ORDER BY id';
    let params = [];
    if (req.user.role === 'surveillant') {
      query  = 'SELECT * FROM emplois_du_temps WHERE annexe_id=$1 ORDER BY id';
      params = [req.user.annexe_id];
    }
    const edts = await pool.query(query, params);
    for (const edt of edts.rows) {
      const slots = await pool.query(
        'SELECT * FROM edt_slots WHERE edt_id=$1 ORDER BY jour, heure_debut', [edt.id]
      );
      edt.slots = slots.rows;
    }
    res.json(edts.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — admin ou surveillant
router.post('/', auth, surveillantMw, async (req, res) => {
  const { name, filiereIds, slots, annexe_id } = req.body;
  const targetAnnexe = req.user.role === 'surveillant' ? req.user.annexe_id : (annexe_id || null);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'INSERT INTO emplois_du_temps (name, filiere_ids, annexe_id) VALUES ($1,$2,$3) RETURNING *',
      [name, filiereIds || [], targetAnnexe]
    );
    const edt = r.rows[0];
    edt.slots = [];
    for (const slot of (slots || [])) {
      const s = await client.query(
        `INSERT INTO edt_slots
           (edt_id,jour,session,heure_debut,heure_fin,matiere,type,salle,prof_nom,tronc,annexe_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [edt.id, slot.jour, slot.session||'jour', slot.heureDebut, slot.heureFin,
         slot.matiere, slot.type||'Cours', slot.salle, slot.profNom, slot.tronc||false, targetAnnexe]
      );
      edt.slots.push(s.rows[0]);
    }
    await client.query('COMMIT');
    res.json(edt);
  } catch(e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

// PUT — surveillant vérifie son annexe
router.put('/:id', auth, surveillantMw, async (req, res) => {
  if (req.user.role === 'surveillant') {
    const check = await pool.query(
      'SELECT annexe_id FROM emplois_du_temps WHERE id=$1', [req.params.id]
    );
    if (!check.rows.length || check.rows[0].annexe_id != req.user.annexe_id)
      return res.status(403).json({ error: "Cet EDT n'appartient pas à votre annexe" });
  }
  const { name, filiereIds, slots, annexe_id } = req.body;
  const targetAnnexe = req.user.role === 'surveillant' ? req.user.annexe_id : (annexe_id || null);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE emplois_du_temps SET name=$1, filiere_ids=$2, annexe_id=$3 WHERE id=$4',
      [name, filiereIds || [], targetAnnexe, req.params.id]
    );
    await client.query('DELETE FROM edt_slots WHERE edt_id=$1', [req.params.id]);
    const edt = { id: parseInt(req.params.id), name, filiereIds, slots: [] };
    for (const slot of (slots || [])) {
      const s = await client.query(
        `INSERT INTO edt_slots
           (edt_id,jour,session,heure_debut,heure_fin,matiere,type,salle,prof_nom,tronc,annexe_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [req.params.id, slot.jour, slot.session||'jour', slot.heureDebut, slot.heureFin,
         slot.matiere, slot.type||'Cours', slot.salle, slot.profNom, slot.tronc||false, targetAnnexe]
      );
      edt.slots.push(s.rows[0]);
    }
    await client.query('COMMIT');
    res.json(edt);
  } catch(e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

// DELETE
router.delete('/:id', auth, surveillantMw, async (req, res) => {
  if (req.user.role === 'surveillant') {
    const check = await pool.query(
      'SELECT annexe_id FROM emplois_du_temps WHERE id=$1', [req.params.id]
    );
    if (!check.rows.length || check.rows[0].annexe_id != req.user.annexe_id)
      return res.status(403).json({ error: "Cet EDT n'appartient pas à votre annexe" });
  }
  try {
    await pool.query('DELETE FROM emplois_du_temps WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

// POST /api/edt/:id/slots
router.post('/:id/slots', auth, async (req, res) => {
  const { jour, session, heureDebut, heureFin, matiere, type, salle, groupe, profNom, tronc, siteId } = req.body;
  try {
    const r = await pool.query(`
      INSERT INTO edt_slots (edt_id, jour, session, heure_debut, heure_fin, matiere, type, salle, groupe, prof_nom, tronc, site_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.params.id, jour, session||'jour', heureDebut, heureFin,
       matiere, type||'Cours', salle||null, groupe||null, profNom||null, tronc||false, siteId||null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/edt/:id/slots/:slotId
router.put('/:id/slots/:slotId', auth, async (req, res) => {
  const { jour, session, heureDebut, heureFin, matiere, type, salle, groupe, profNom, tronc, siteId } = req.body;
  try {
    const r = await pool.query(`
      UPDATE edt_slots SET jour=$1, session=$2, heure_debut=$3, heure_fin=$4,
        matiere=$5, type=$6, salle=$7, groupe=$8, prof_nom=$9, tronc=$10, site_id=$11
      WHERE id=$12 AND edt_id=$13 RETURNING *`,
      [jour, session||'jour', heureDebut, heureFin, matiere, type||'Cours',
       salle||null, groupe||null, profNom||null, tronc||false, siteId||null,
       req.params.slotId, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/edt/:id/slots/:slotId
router.delete('/:id/slots/:slotId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM edt_slots WHERE id=$1 AND edt_id=$2', [req.params.slotId, req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
