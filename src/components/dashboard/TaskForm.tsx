import { Task } from "@/types/task";
import { TaskFormDialog } from "./task-form/TaskFormDialog";

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
  return <TaskFormDialog onTaskCreated={onTaskCreated} />;
};