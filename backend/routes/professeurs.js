const router = require('express').Router();
const pool   = require('../db');

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM professeurs ORDER BY id')).rows); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', async (req, res) => {
  const {name,tel,matieres}=req.body;
  try { res.json((await pool.query('INSERT INTO professeurs(name,tel,matieres) VALUES($1,$2,$3) RETURNING *',[name,tel||'',matieres||[]])).rows[0]); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', async (req, res) => {
  const {name,tel,matieres}=req.body;
  try { res.json((await pool.query('UPDATE professeurs SET name=$1,tel=$2,matieres=$3 WHERE id=$4 RETURNING *',[name,tel||'',matieres||[],req.params.id])).rows[0]); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = req.params.id;
    // Supprimer le compte utilisateur lié
    await client.query('DELETE FROM users WHERE prof_id=$1', [id]);
    // Supprimer le professeur
    await client.query('DELETE FROM professeurs WHERE id=$1', [id]);
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
