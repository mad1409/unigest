
// Brute force protection
const loginAttempts = new Map();
const MAX_ATTEMPTS  = 5;
const BLOCK_TIME    = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(id) {
  const now = Date.now();
  const attempts = loginAttempts.get(id) || { count:0, firstAttempt:now, blocked:false };
  
  if (attempts.blocked && (now - attempts.firstAttempt) < BLOCK_TIME) {
    const restant = Math.ceil((BLOCK_TIME - (now - attempts.firstAttempt)) / 60000);
    return { blocked: true, restant };
  }
  
  if ((now - attempts.firstAttempt) > BLOCK_TIME) {
    loginAttempts.delete(id);
    return { blocked: false };
  }
  
  return { blocked: false };
}

function recordFailedAttempt(id) {
  const now = Date.now();
  const attempts = loginAttempts.get(id) || { count:0, firstAttempt:now, blocked:false };
  attempts.count++;
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blocked = true;
    attempts.firstAttempt = now;
    console.error('[SECURITE] Compte bloque apres', MAX_ATTEMPTS, 'tentatives:', id);
  }
  loginAttempts.set(id, attempts);
  return attempts.count;
}

function clearAttempts(id) {
  loginAttempts.delete(id);
}
const { logAudit } = require('../middleware/audit');
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

const tokenBlacklist = new Set();
module.exports.tokenBlacklist = tokenBlacklist;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { id, password, role } = req.body;

  if (!id || !password || !role)
    return res.status(400).json({ error: 'Champs manquants' });
  if (typeof id !== 'string' || id.length > 50)
    return res.status(400).json({ error: 'Identifiant invalide' });
  if (typeof password !== 'string' || password.length > 100)
    return res.status(400).json({ error: 'Mot de passe invalide' });
  const rolesValides = ['admin','prof','etudiant','secretaire','surveillant'];
  if (!rolesValides.includes(role))
    return res.status(400).json({ error: 'Role invalide' });

  try {
    const r = await pool.query('SELECT * FROM users WHERE id=$1 AND role=$2', [id, role]);
    if (!r.rows.length)
      return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    const user = r.rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok) {
      const count = recordFailedAttempt(id);
      const restants = MAX_ATTEMPTS - count;
      return res.status(401).json({ 
        error: restants > 0 
          ? `Identifiant ou mot de passe incorrect. ${restants} tentative(s) restante(s)`
          : 'Compte bloque pendant 15 minutes'
      });
    }
    clearAttempts(id);
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name,
        profId: user.prof_id, etudiantId: user.etudiant_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    await logAudit(req, 'LOGIN', 'users', user.id, { role: user.role });
    res.json({ token, user: {
      id: user.id, role: user.role, name: user.name,
      profId: user.prof_id, etudiantId: user.etudiant_id
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const r = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!r.rows.length)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    const user = r.rows[0];
    const ok   = await bcrypt.compare(oldPassword, user.password);
    if (!ok)
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Mot de passe trop court — minimum 6 caracteres' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hash, userId]);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh — renouveler le token
router.post('/refresh', async (req, res) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  const token = header.split(' ')[1];
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    // Générer un nouveau token
    const newToken = require('jsonwebtoken').sign(
      { id:decoded.id, role:decoded.role, name:decoded.name,
        profId:decoded.profId, etudiantId:decoded.etudiantId,
        tenantId:decoded.tenantId, tenantCode:decoded.tenantCode },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Blacklister l'ancien token
    tokenBlacklist.add(token);
    res.json({ token: newToken });
  } catch(e) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    tokenBlacklist.add(header.split(' ')[1]);
  }
  res.json({ success: true });
});

// POST /api/auth/reset-etudiant — reset par secretaire/admin
router.post('/reset-etudiant', async (req, res) => {
  const { etudiantId, newPassword } = req.body;
  if (!etudiantId || !newPassword) return res.status(400).json({ error: 'Champs requis' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (min 6)' });
  try {
    // Trouver le compte user lié à l'étudiant
    const r = await pool.query('SELECT * FROM users WHERE etudiant_id=$1', [etudiantId]);
    if (!r.rows.length) return res.status(404).json({ error: 'Aucun compte trouvé pour cet étudiant' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE etudiant_id=$2', [hash, etudiantId]);
    res.json({ success: true, userId: r.rows[0].id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
