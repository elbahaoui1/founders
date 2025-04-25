const supabase = require('../services/supabaseClient');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error });
  res.status(201).json({ message: 'User registered', data });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ message: 'Login successful', session: data.session });
};
