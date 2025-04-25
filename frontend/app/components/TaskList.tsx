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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CalendarIcon, CheckCircle, Clock, ListFilter } from "lucide-react";

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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'pending':
        return <CalendarIcon className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''} bg-white border border-gray-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
        <CardTitle className="text-base font-medium line-clamp-1">{task.title}</CardTitle>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-gray-500 hover:text-gray-700" 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-gray-500 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
            Priority: {task.priority}
          </Badge>
          <Badge variant={getStatusVariant(task.status)} className="text-xs flex items-center">
            {getStatusIcon(task.status)}
            {task.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getCategoryName(task.category_id)}
          </Badge>
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
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-manipulation">
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
  const getColumnStyle = (columnId: string) => {
    switch (columnId) {
      case 'priority-1':
        return 'bg-red-50 border-red-200 shadow-sm';
      case 'priority-2':
        return 'bg-yellow-50 border-yellow-200 shadow-sm';
      case 'priority-3':
        return 'bg-green-50 border-green-200 shadow-sm';
      default:
        return 'bg-gray-50 border-gray-200 shadow-sm';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getColumnStyle(id)}`}>
      <h3 className="font-bold text-base mb-4 flex items-center">
        {id === 'priority-1' && <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>}
        {id === 'priority-2' && <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>}
        {id === 'priority-3' && <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>}
        {title}
        <span className="ml-2 text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">{tasks.length}</span>
      </h3>
      
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
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg min-h-56 flex items-center justify-center">
          <p className="text-sm">No tasks with this priority</p>
        </div>
      )}
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="h-full">{children}</div>;
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
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-3">
          <ListFilter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto flex-1">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as Task['status'] | 'all')}
            >
              <SelectTrigger className="w-full text-sm h-9">
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

          <div className="w-full sm:w-auto flex-1">
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-full text-sm h-9">
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
          
          <Button 
            variant="outline" 
            size="sm"
            className="ml-auto h-9"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
            <div className="w-full md:w-64">
              <TaskItem 
                task={activeTask} 
                categories={categories} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      
      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-500">No tasks match your filters</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}