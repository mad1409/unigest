
const router = require('express').Router();
const pool   = require('../db');

router.get('/', async (req, res) => {
  try {
    const ues = (await pool.query('SELECT * FROM ues ORDER BY id')).rows;
    for (const ue of ues) {
      ue.matieres = (await pool.query('SELECT * FROM matieres WHERE ue_id=$1',[ue.id])).rows;
    }
    res.json(ues);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', async (req, res) => {
  const {code,intitule,semestre,creditUE,filiereIds,matieres}=req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'INSERT INTO ues(code,intitule,semestre,credit_ue,filiere_ids) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [code,intitule,semestre,creditUE,filiereIds||[]]
    );
    const ue = r.rows[0];
    ue.matieres = [];
    for (const m of (matieres||[])) {
      const mr = await client.query(
        'INSERT INTO matieres(name,credit_ecue,ue_id) VALUES($1,$2,$3) RETURNING *',
        [m.name,m.creditECUE,ue.id]
      );
      ue.matieres.push(mr.rows[0]);
    }
    await client.query('COMMIT');
    res.json(ue);
  } catch(e){ await client.query('ROLLBACK'); res.status(500).json({error:e.message}); }
  finally { client.release(); }
});

router.put('/:id', async (req, res) => {
  const {code,intitule,semestre,creditUE,filiereIds,matieres}=req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'UPDATE ues SET code=$1,intitule=$2,semestre=$3,credit_ue=$4,filiere_ids=$5 WHERE id=$6 RETURNING *',
      [code,intitule,semestre,creditUE,filiereIds||[],req.params.id]
    );
    const ue = r.rows[0];
    await client.query('DELETE FROM matieres WHERE ue_id=$1',[ue.id]);
    ue.matieres = [];
    for (const m of (matieres||[])) {
      const mr = await client.query(
        'INSERT INTO matieres(name,credit_ecue,ue_id) VALUES($1,$2,$3) RETURNING *',
        [m.name,m.creditECUE,ue.id]
      );
      ue.matieres.push(mr.rows[0]);
    }
    await client.query('COMMIT');
    res.json(ue);
  } catch(e){ await client.query('ROLLBACK'); res.status(500).json({error:e.message}); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res) => {
  try { await pool.query('DELETE FROM ues WHERE id=$1',[req.params.id]); res.json({success:true}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
