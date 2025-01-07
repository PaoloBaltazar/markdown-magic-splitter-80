import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";

export const createNotification = async (notification: {
  title: string;
  message: string;
  type: string;
  task_id: string;
  user_id: string;
}) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const checkTaskDeadlines = async (tasks: Task[]) => {
  const today = new Date();
  
  for (const task of tasks) {
    const deadline = new Date(task.deadline);
    const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 2 && task.status !== "completed") {
      try {
        await createNotification({
          title: "Task Deadline Approaching",
          message: `Task "${task.title}" is due in ${daysDiff} days`,
          type: "deadline",
          task_id: task.id,
          user_id: task.user_id,
        });
      } catch (error) {
        console.error("Error checking task deadlines:", error);
      }
    }
  }
};

export const handleTaskStatusChange = async (task: Task) => {
  try {
    let notificationType = "";
    let message = "";

    switch (task.status) {
      case "completed":
        notificationType = "completed";
        message = `Task "${task.title}" has been completed`;
        break;
      case "in-progress":
        notificationType = "status";
        message = `Task "${task.title}" is now in progress`;
        break;
      default:
        return; // Don't create notification for pending status
    }

    await createNotification({
      title: "Task Status Update",
      message,
      type: notificationType,
      task_id: task.id,
      user_id: task.user_id,
    });
  } catch (error) {
    console.error("Error handling task status change:", error);
    throw error;
  }
};