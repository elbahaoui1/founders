const supabase = require('../services/supabaseClient');

exports.getTasks = async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error });
  res.json(data);
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error });
  res.json(data);
};

exports.createTask = async (req, res) => {
  const { title, category_id, priority, status } = req.body;
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, category_id, priority, status, user_id: req.user.id }]);

  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select();

  if (error) return res.status(500).json({ error });
  res.json(data[0]);
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error });
  res.status(204).send();
};
