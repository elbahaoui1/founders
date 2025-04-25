const supabase = require('../services/supabaseClient');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: 'Invalid token' });

  req.user = data.user;
  next();
}

module.exports = authenticate;
