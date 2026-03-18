const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../db');

async function genId(role, name, pool) {
  const prefixes = { admin:"ADM", prof:"ENS", secretaire:"SEC", surveillant:"SUR", etudiant:"ETU" };
  const prefix   = prefixes[role] || "USR";
  const parts    = (name||"").trim().split(" ").filter(Boolean);
  const init     = parts.map(p => (p[0]||"").toUpperCase()).join("").slice(0,3).padEnd(3,"X");
  let n = 1;
  while (true) {
    const id = prefix + init + String(n).padStart(2,"0");
    const r  = await pool.query('SELECT id FROM users WHERE id=$1', [id]);
    if (!r.rows.length) return id;
    n++;
  }
}

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT id,role,name,prof_id,etudiant_id FROM users ORDER BY role,name');
    res.json(r.rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', async (req, res) => {
  const { id, password, role, name, profId, etudiantId } = req.body;
  try {
    const userId = id || await genId(role, name, pool);
    if (!userId) return res.status(400).json({error:'Impossible de generer un identifiant'});
    const hash = await bcrypt.hash(password || 'pass123', 10);
    const r = await pool.query(
      'INSERT INTO users(id,password,role,name,prof_id,etudiant_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,role,name,prof_id,etudiant_id',
      [userId, hash, role, name, profId||null, etudiantId||null]
    );
    res.json({...r.rows[0], generatedId: userId});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', async (req, res) => {
  const {name, role} = req.body;
  try {
    const r = await pool.query(
      'UPDATE users SET name=$1,role=$2 WHERE id=$3 RETURNING id,role,name',
      [name, role, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id/password', async (req, res) => {
  const {newPassword} = req.body;
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hash, req.params.id]);
    res.json({success:true});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({success:true});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
