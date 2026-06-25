const router = require('express').Router();
const pool   = require('../db');

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM filieres ORDER BY id')).rows); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', async (req, res) => {
  const {code,name,cycle,domaine}=req.body;
  try { res.json((await pool.query(
    'INSERT INTO filieres(code,name,cycle,domaine) VALUES($1,$2,$3,$4) RETURNING *',
    [code,name,cycle||"Licence",domaine||"Technique"]
  )).rows[0]); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', async (req, res) => {
  const {code,name,cycle,domaine}=req.body;
  try { res.json((await pool.query(
    'UPDATE filieres SET code=$1,name=$2,cycle=$3,domaine=$4 WHERE id=$5 RETURNING *',
    [code,name,cycle||"Licence",domaine||"Technique",req.params.id]
  )).rows[0]); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = req.params.id;
    await client.query('DELETE FROM notes WHERE etudiant_id IN (SELECT id FROM etudiants WHERE filiere_id=$1)', [id]);
    await client.query('DELETE FROM users WHERE etudiant_id IN (SELECT id FROM etudiants WHERE filiere_id=$1)', [id]);
    await client.query('DELETE FROM etudiants WHERE filiere_id=$1', [id]);
    await client.query('DELETE FROM groupes WHERE filiere_id=$1', [id]);
    await client.query('UPDATE ues SET filiere_ids = array_remove(filiere_ids, $1::int)', [id]);
    await client.query('UPDATE emplois_du_temps SET filiere_ids = array_remove(filiere_ids, $1::int)', [id]);
    await client.query('DELETE FROM filieres WHERE id=$1', [id]);
    await client.query('COMMIT');
    res.json({success:true});
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({error:e.message});
  } finally {
    client.release();
  }
});

module.exports = router;
