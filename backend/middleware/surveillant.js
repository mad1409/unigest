module.exports = function surveillantMw(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'surveillant') return next();
  return res.status(403).json({ error: 'Accès réservé aux administrateurs et surveillants' });
};
