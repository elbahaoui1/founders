const supabase = require('../services/supabaseClient');

exports.getTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    if (!data) {
      return res.status(404).json({ error: 'No tasks found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error in getTasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Unexpected error in getTaskById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { title, category_id, priority, status } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Task title is required and must be a non-empty string' });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be one of: low, medium, high' });
    }

    // Validate status if provided
    if (status && !['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: todo, in-progress, done' });
    }

    // Check if category exists if category_id is provided
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', req.user.id)
        .single();

      if (categoryError || !category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: title.trim(), 
        category_id, 
        priority, 
        status: status || 'todo',
        user_id: req.user.id 
      }])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Failed to create task' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Unexpected error in createTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const { title, category_id, priority, status } = req.body;

    // Validate title if provided
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      return res.status(400).json({ error: 'Task title must be a non-empty string' });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be one of: low, medium, high' });
    }

    // Validate status if provided
    if (status && !['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: todo, in-progress, done' });
    }

    // Check if category exists if category_id is provided
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', req.user.id)
        .single();

      if (categoryError || !category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    const updates = {
      ...(title && { title: title.trim() }),
      ...(category_id && { category_id }),
      ...(priority && { priority }),
      ...(status && { status })
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Unexpected error in updateTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Check if task exists before deleting
    const { data: existingTask, error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Unexpected error in deleteTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
