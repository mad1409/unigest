
module.exports = function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acces interdit — role admin requis' });
  }
  next();
};
