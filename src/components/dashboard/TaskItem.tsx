import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, User, Trash2 } from "lucide-react";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { handleTaskStatusChange } from "@/utils/notificationUtils";

interface TaskItemProps {
  task: Task;
  showAssignment?: boolean;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onTasksChange: () => void;
}

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium":
      return "bg-warning/10 text-warning border-warning/20";
    case "low":
      return "bg-success/10 text-success border-success/20";
  }
};

const getStatusIcon = (status: Task["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case "in-progress":
      return <Clock className="w-5 h-5 text-warning" />;
    case "pending":
      return <AlertCircle className="w-5 h-5 text-destructive" />;
  }
};

export const TaskItem = ({ task, showAssignment = true, onStatusChange, onTasksChange }: TaskItemProps) => {
  const { toast } = useToast();

  const handleStatusClick = async (task: Task) => {
    if (!onStatusChange) return;
    
    const statusOrder: Task["status"][] = ["pending", "in-progress", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', task.id);

      if (updateError) throw updateError;

      const updatedTask = { ...task, status: nextStatus };
      await handleTaskStatusChange(updatedTask);
      
      onStatusChange(task.id, nextStatus);
      toast({
        title: "Success",
        description: `Task marked as ${nextStatus}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      // First, fetch all notifications for this task
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id')
        .eq('task_id', taskId);

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        throw fetchError;
      }

      // Delete notifications if they exist
      if (notifications && notifications.length > 0) {
        const { error: notificationsError } = await supabase
          .from('notifications')
          .delete()
          .eq('task_id', taskId);

        if (notificationsError) {
          console.error("Error deleting notifications:", notificationsError);
          throw notificationsError;
        }
      }

      // After notifications are deleted, delete the task
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) {
        console.error("Error deleting task:", taskError);
        throw taskError;
      }

      onTasksChange();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-primary/20 transition-all hover:shadow-md space-y-2 md:space-y-0">
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={() => handleStatusClick(task)}
          title={`Current status: ${task.status}. Click to change.`}
        >
          {getStatusIcon(task.status)}
        </Button>
        <div>
          <h3 className="font-medium text-sm md:text-base">{task.title}</h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Due {task.deadline}</p>
          {showAssignment && (
            <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Created by: {task.created_by}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Assigned to: {task.assigned_to}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`${getPriorityColor(task.priority)} capitalize text-xs md:text-sm`}>
          {task.priority}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive opacity-70 hover:opacity-100"
          onClick={() => handleDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};