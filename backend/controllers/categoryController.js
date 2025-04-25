const supabase = require('../services/supabaseClient');

exports.getCategories = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    if (!data) {
      return res.status(404).json({ error: 'No categories found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error in getCategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error in getCategoryById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required and must be a non-empty string' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim(), user_id: req.user.id }])
      .select();

    if (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Failed to create category' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Unexpected error in createCategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required and must be a non-empty string' });
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Failed to update category' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Unexpected error in updateCategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Unexpected error in deleteCategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
