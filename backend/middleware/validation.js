function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/javascript:/gi, '')
    .trim();
}

function validateBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof val === 'string') {
        req.body[key] = sanitize(val);
      }
    }
  }
  next();
}

module.exports = { sanitize, validateBody };
