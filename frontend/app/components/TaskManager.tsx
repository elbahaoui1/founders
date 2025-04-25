'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/services/supabaseClient';
import { Task, Category } from '@/app/types/task';
import TaskForm from './TaskForm';
import CategoryForm from './CategoryForm';
import TaskList from './TaskList';
import { toast } from 'sonner';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: Category[];
}

export default function TaskManager({ tasks, setTasks, categories }: TaskManagerProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const fetchCategories = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: taskData.title,
        category_id: taskData.category_id,
        priority: taskData.priority,
        user_id: session.user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return;
    }

    setTasks([data, ...tasks]);
    setShowTaskForm(false);
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: taskData.title,
        category_id: taskData.category_id,
        priority: taskData.priority,
        status: taskData.status
      })
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    setTasks(tasks.map(task => task.id === taskId ? data : task));
    setEditingTask(undefined);
    setShowTaskForm(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return;
    }

    setShowCategoryForm(false);
  };

  const handlePriorityChange = async (taskId: string, newPriority: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('tasks')
      .update({ priority: newPriority })
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task priority:', error);
      toast.error('Failed to update task priority');
      return;
    }

    setTasks(tasks.map(task => task.id === taskId ? data : task));
    toast.success('Task priority updated successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Task
          </button>
          
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          categories={categories}
          onSubmit={(taskData) => {
            if (editingTask) {
              handleUpdateTask(editingTask.id, taskData);
            } else {
              handleCreateTask(taskData);
            }
          }}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      <TaskList
        tasks={tasks}
        categories={categories}
        onEdit={(task) => {
          setEditingTask(task);
          setShowTaskForm(true);
        }}
        onDelete={handleDeleteTask}
        onPriorityChange={handlePriorityChange}
      />
    </div>
  );
} 