import { Card } from "@/components/ui/card";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  title: string;
  tasks: Task[];
  showAssignment?: boolean;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onTasksChange: () => void;
}

export const TaskList = ({ 
  title, 
  tasks, 
  showAssignment = true, 
  onStatusChange,
  onTasksChange 
}: TaskListProps) => {
  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          onTasksChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onTasksChange]);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
      </div>
      <div className="p-4 md:p-6 space-y-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            showAssignment={showAssignment}
            onStatusChange={onStatusChange}
            onTasksChange={onTasksChange}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm md:text-base">
            No tasks found
          </div>
        )}
      </div>
    </Card>
  );
};