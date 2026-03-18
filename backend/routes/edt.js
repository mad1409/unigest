
const router = require('express').Router();
const pool   = require('../db');

router.get('/', async (req, res) => {
  try {
    const edts = (await pool.query('SELECT * FROM emplois_du_temps ORDER BY id')).rows;
    for (const edt of edts) {
      edt.slots = (await pool.query('SELECT * FROM edt_slots WHERE edt_id=$1 ORDER BY id',[edt.id])).rows;
    }
    res.json(edts);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', async (req, res) => {
  const {name,filiereIds}=req.body;
  try {
    const r = await pool.query('INSERT INTO emplois_du_temps(name,filiere_ids) VALUES($1,$2) RETURNING *',[name,filiereIds||[]]);
    res.json({...r.rows[0], slots:[]});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', async (req, res) => {
  const {name,filiereIds}=req.body;
  try {
    const r = await pool.query('UPDATE emplois_du_temps SET name=$1,filiere_ids=$2 WHERE id=$3 RETURNING *',[name,filiereIds||[],req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', async (req, res) => {
  try { await pool.query('DELETE FROM emplois_du_temps WHERE id=$1',[req.params.id]); res.json({success:true}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

// Slots
router.post('/:edtId/slots', async (req, res) => {
  const {jour,session,heureDebut,heureFin,matiere,type,salle,groupe,profNom,profTel,tronc}=req.body;
  try {
    const r = await pool.query(
      `INSERT INTO edt_slots(edt_id,jour,session,heure_debut,heure_fin,matiere,type,salle,groupe,prof_nom,prof_tel,tronc)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.params.edtId,jour,session||'jour',heureDebut,heureFin,matiere,type||'Cours',salle||'',groupe||'',profNom||'',profTel||'',tronc||false]
    );
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:edtId/slots/:slotId', async (req, res) => {
  const {jour,session,heureDebut,heureFin,matiere,type,salle,groupe,profNom,profTel,tronc}=req.body;
  try {
    const r = await pool.query(
      `UPDATE edt_slots SET jour=$1,session=$2,heure_debut=$3,heure_fin=$4,matiere=$5,type=$6,salle=$7,groupe=$8,prof_nom=$9,prof_tel=$10,tronc=$11
       WHERE id=$12 AND edt_id=$13 RETURNING *`,
      [jour,session,heureDebut,heureFin,matiere,type,salle||'',groupe||'',profNom||'',profTel||'',tronc||false,req.params.slotId,req.params.edtId]
    );
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:edtId/slots/:slotId', async (req, res) => {
  try { await pool.query('DELETE FROM edt_slots WHERE id=$1',[req.params.slotId]); res.json({success:true}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
