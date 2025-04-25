const supabase = require('../services/supabaseClient');

exports.getCategories = async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error });
  res.json(data);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error });
  res.json(data);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, user_id: req.user.id }]);

  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select();

  if (error) return res.status(500).json({ error });
  res.json(data[0]);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error });
  res.status(204).send();
};
