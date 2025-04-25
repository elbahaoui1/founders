'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import CategoryManager from '@/app/components/CategoryManager';
import TaskManager from '@/app/components/TaskManager';
import { Task, Category } from '@/app/types/task';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        setTasks([]);
        return;
      }

      const response = await fetch('http://localhost:4000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected an array of tasks, but received:', data);
        setTasks([]);
        return;
      }
      
      const validTasks = data.filter((task: any) => {
        return (
          typeof task.id === 'string' &&
          typeof task.title === 'string' &&
          typeof task.description === 'string' &&
          typeof task.dueDate === 'string' &&
          typeof task.categoryId === 'string' &&
          typeof task.status === 'string' &&
          typeof task.priority === 'number' &&
          typeof task.createdAt === 'string' &&
          typeof task.updatedAt === 'string'
        );
      });
      
      setTasks(validTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        setCategories([]);
        return;
      }

      const response = await fetch('http://localhost:4000/api/categories', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
      });
  console.log("session", session.access_token);      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected an array of categories, but received:', data);
        setCategories([]);
        return;
      }
      
      const validCategories = data.filter((category: any) => {
        return (
          typeof category.id === 'string' &&
          typeof category.name === 'string' 
        );
      });
      
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            
            <CategoryManager
              categories={categories}
              setCategories={setCategories}
            />

            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 