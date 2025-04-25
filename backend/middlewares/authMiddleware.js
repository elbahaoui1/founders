const supabase = require('../services/supabaseClient');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { data: { session }, error } = await supabase.auth.getSession(token);
  if (error || !session) return res.status(401).json({ message: 'Invalid token' });

  req.user = session.user;
  next();
}

module.exports = authenticate;
