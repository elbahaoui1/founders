'use client';

import { useState } from 'react';
import { Task, Category } from '@/app/types/task';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, newPriority: number) => void;
}

interface TaskItemProps {
  task: Task;
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

function TaskItem({ task, categories, onEdit, onDelete, isDragging = false }: TaskItemProps) {
  const getPriorityVariant = (priority: number) => {
    if (priority === 1) return 'destructive';
    if (priority === 2) return 'secondary';
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
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>Delete</Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={getPriorityVariant(task.priority)}>Priority: {task.priority}</Badge>
          <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
          <Badge variant="outline">{getCategoryName(task.category_id)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableTaskProps {
  task: Task;
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function SortableTask({ task, categories, onEdit, onDelete }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <TaskItem
        task={task}
        categories={categories}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

interface PriorityColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function PriorityColumn({ id, title, tasks, categories, onEdit, onDelete }: PriorityColumnProps) {
  return (
    <div className={`p-4 rounded-lg border ${id === 'priority-1' ? 'bg-red-50 border-red-200' : id === 'priority-2' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      {tasks.length > 0 ? (
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="droppable-area min-h-56">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg min-h-56">
          No tasks with this priority
        </div>
      )}
    </div>
  );
}

// ✅ DROPPABLE COLUMN WRAPPER
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

export default function TaskList({ tasks = [], categories = [], onEdit, onDelete, onPriorityChange }: TaskListProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  
  // Filter tasks based on status and category
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category_id === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Group filtered tasks by priority
  const priority1Tasks = filteredTasks.filter(task => task.priority === 1);
  const priority2Tasks = filteredTasks.filter(task => task.priority === 2);
  const priority3Tasks = filteredTasks.filter(task => task.priority >= 3);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const overId = over.id as string;

    let newPriority: number | null = null;

    if (overId === 'priority-1' || overId.startsWith('priority-1')) {
      newPriority = 1;
    } else if (overId === 'priority-2' || overId.startsWith('priority-2')) {
      newPriority = 2;
    } else if (overId === 'priority-3' || overId.startsWith('priority-3')) {
      newPriority = 3;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newPriority = overTask.priority;
    }

    if (newPriority === null || newPriority === task.priority) return;

    onPriorityChange(taskId, newPriority);

    const priorityLabels: Record<number, string> = {
      1: "High",
      2: "Medium",
      3: "Low"
    };

    toast.success(`Task "${task.title}" moved to ${priorityLabels[newPriority]} priority`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Task['status'] | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DroppableColumn id="priority-1">
            <PriorityColumn
              id="priority-1"
              title="High Priority"
              tasks={priority1Tasks}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </DroppableColumn>

          <DroppableColumn id="priority-2">
            <PriorityColumn
              id="priority-2"
              title="Medium Priority"
              tasks={priority2Tasks}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </DroppableColumn>

          <DroppableColumn id="priority-3">
            <PriorityColumn
              id="priority-3"
              title="Low Priority"
              tasks={priority3Tasks}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </DroppableColumn>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-full">
              <TaskItem task={activeTask} categories={categories} onEdit={onEdit} onDelete={onDelete} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
