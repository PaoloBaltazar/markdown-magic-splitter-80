import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";
import { TaskFormContent } from "./TaskFormContent";

interface TaskFormDialogProps {
  onTaskCreated: (task: Task) => void;
}

export const TaskFormDialog = ({ onTaskCreated }: TaskFormDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = (task: Task) => {
    onTaskCreated(task);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6 gap-6 animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Create New Task</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Create a new task and assign it to a team member. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-card rounded-lg">
          <TaskFormContent onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};