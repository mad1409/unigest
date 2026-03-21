
const pool = require('../db');

async function logAudit(req, action, tableName, recordId, details) {
  try {
    await pool.query(`
      INSERT INTO audit_logs (user_id, user_role, action, table_name, record_id, details, ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      req.user?.id || 'anonymous',
      req.user?.role || 'unknown',
      action,
      tableName || null,
      recordId ? String(recordId) : null,
      details ? JSON.stringify(details) : null,
      req.ip || req.headers['x-forwarded-for'] || null,
    ]);
  } catch(e) {
    console.error('Audit log error:', e.message);
  }
}

module.exports = { logAudit };
