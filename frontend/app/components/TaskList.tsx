'use client';

import { Task, Category } from '@/app/types/task';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ tasks = [], categories = [], onEdit, onDelete }: TaskListProps) {
  const getPriorityVariant = (priority: number) => {
    if (priority >= 4) return 'destructive';
    if (priority >= 3) return 'secondary';
    return 'default';
  };

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = Array.isArray(categories) ? categories.find((c) => c.id === categoryId) : null;
    return category?.name || 'Uncategorized';
  };

  const handleDelete = (taskId: string) => {
    toast.promise(
      new Promise((resolve) => {
        onDelete(taskId);
        resolve(true);
      }),
      {
        loading: 'Deleting task...',
        success: 'Task deleted successfully',
        error: 'Failed to delete task',
      }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.isArray(tasks) && tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={getPriorityVariant(task.priority)}>
                Priority: {task.priority}
              </Badge>
              <Badge variant={getStatusVariant(task.status)}>
                {task.status}
              </Badge>
              <Badge variant="outline">
                {getCategoryName(task.category_id)}
              </Badge>
            </div>
          </CardContent>
          
        </Card>
      ))}
    </div>
  );
} 