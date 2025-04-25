'use client';

import { useState } from 'react';
import { Category } from '@/app/types/task';
import CategoryForm from './CategoryForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export default function CategoryManager({ categories, setCategories }: CategoryManagerProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: categoryData.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      const newCategory = await response.json();
      
      if (!newCategory || !newCategory.id) {
        throw new Error('Invalid response from server');
      }

      setCategories([...categories, newCategory]);
      setShowCategoryForm(false);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (categoryData: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    if (!editingCategory) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`http://localhost:4000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: categoryData.name
        })
      });
      const updatedCategory = await response.json();
      setCategories(categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      ));
      setEditingCategory(null);
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      await fetch(`http://localhost:4000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoryForm
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        category={editingCategory || undefined}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        onCancel={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
      />

      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow py-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-4">
              <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingCategory(category);
                    setShowCategoryForm(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 