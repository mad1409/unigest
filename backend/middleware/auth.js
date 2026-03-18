
const jwt = require('jsonwebtoken');

const authRoute = require('../routes/auth');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  // Vérifier si token révoqué
  if (authRoute.tokenBlacklist && authRoute.tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Session expirée — reconnectez-vous' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Token invalide ou expire' });
  }
};
