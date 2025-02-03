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
      // Get the assignee's profile to get their ID
      const { data: assigneeProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', task.assigned_to)
        .single();

      if (assigneeProfile) {
        try {
          await createNotification({
            title: "Task Deadline Approaching",
            message: `Task "${task.title}" is due in ${daysDiff} days`,
            type: "deadline",
            task_id: task.id,
            user_id: assigneeProfile.id,
          });
        } catch (error) {
          console.error("Error checking task deadlines:", error);
        }
      }
    }
  }
};

export const handleTaskStatusChange = async (task: Task) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    let notificationType = "";
    let message = "";

    switch (task.status) {
      case "completed":
        notificationType = "completed";
        message = `Task "${task.title}" has been completed by ${userData.user.email}`;
        break;
      case "in-progress":
        notificationType = "status";
        message = `Task "${task.title}" is now in progress, updated by ${userData.user.email}`;
        break;
      default:
        return; // Don't create notification for pending status
    }

    // Get assignee's profile
    const { data: assigneeProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', task.assigned_to)
      .single();

    // Create notification for the task assignee if they're not the one updating
    if (assigneeProfile && task.assigned_to !== userData.user.email) {
      await createNotification({
        title: "Task Status Update",
        message,
        type: notificationType,
        task_id: task.id,
        user_id: assigneeProfile.id,
      });
    }

    // Get creator's profile and create notification if they're different from assignee and current user
    if (task.created_by !== userData.user.email && task.created_by !== task.assigned_to) {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', task.created_by)
        .single();

      if (creatorProfile) {
        await createNotification({
          title: "Task Status Update",
          message,
          type: notificationType,
          task_id: task.id,
          user_id: creatorProfile.id,
        });
      }
    }
  } catch (error) {
    console.error("Error handling task status change:", error);
    throw error;
  }
};

export const handleTaskAssignment = async (task: Task) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    // Get the assignee's profile to get their ID
    const { data: assigneeProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', task.assigned_to)
      .single();

    if (assigneeProfile) {
      // Create notification for the assignee
      await createNotification({
        title: "New Task Assignment",
        message: `You have been assigned to task "${task.title}" by ${task.created_by}`,
        type: "assignment",
        task_id: task.id,
        user_id: assigneeProfile.id,
      });
    }
  } catch (error) {
    console.error("Error handling task assignment:", error);
    throw error;
  }
};