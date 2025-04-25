export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  priority: number;
  user_id: string;
  created_at: string;
} 