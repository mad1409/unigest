
const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');

// GET /api/audit — récupérer les logs (admin seulement)
router.get('/', auth, admin, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 50;
    const offset = parseInt(req.query.offset) || 0;
    const action = req.query.action || null;
    const userId = req.query.userId || null;

    let where = [];
    let params = [];
    if (action) { params.push(action); where.push('action=$'+params.length); }
    if (userId) { params.push(userId); where.push('user_id=$'+params.length); }

    const whereStr = where.length ? 'WHERE '+where.join(' AND ') : '';
    params.push(limit, offset);

    const r = await pool.query(`
      SELECT * FROM audit_logs
      ${whereStr}
      ORDER BY created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);

    const total = await pool.query('SELECT COUNT(*) FROM audit_logs '+whereStr, params.slice(0,-2));

    res.json({ logs: r.rows, total: parseInt(total.rows[0].count) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/audit — nettoyer les vieux logs
router.delete('/clean', auth, admin, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days'");
    res.json({ deleted: r.rowCount });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
