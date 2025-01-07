export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  created_by: string;
  assigned_to: string;
  user_id: string;
  created_at?: string;
}