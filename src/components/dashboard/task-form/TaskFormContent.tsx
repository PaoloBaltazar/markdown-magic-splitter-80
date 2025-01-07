import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface TaskFormContentProps {
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

export const TaskFormContent = ({ onSuccess, onCancel }: TaskFormContentProps) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [employees, setEmployees] = useState<Profile[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        return;
      }

      setEmployees(data as Profile[]);
    };

    fetchEmployees();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const assignedEmployee = employees.find(emp => emp.id === assignedTo);
    if (!assignedEmployee) {
      toast({
        title: "Error",
        description: "Please select a valid assignee",
        variant: "destructive",
      });
      return;
    }

    // Create new task without specifying an ID
    const newTask = {
      title,
      deadline,
      priority,
      status: "pending" as const,
      created_by: user.email || "Unknown",
      assigned_to: assignedEmployee.email,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return;
    }

    // Type assertion for the returned task
    const taskWithCorrectTypes = {
      ...data,
      priority: data.priority as Task["priority"],
      status: data.status as Task["status"]
    } satisfies Task;

    onSuccess(taskWithCorrectTypes);
    toast({
      title: "Success",
      description: "Task created successfully",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Task Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full transition-colors"
            required
          />
        </div>
        <div className="space-y-2.5">
          <label htmlFor="deadline" className="text-sm font-medium text-foreground">
            Deadline
          </label>
          <Input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full transition-colors"
            required
          />
        </div>
        <div className="space-y-2.5">
          <label htmlFor="priority" className="text-sm font-medium text-foreground">
            Priority
          </label>
          <Select
            value={priority}
            onValueChange={(value: Task["priority"]) => setPriority(value)}
          >
            <SelectTrigger className="w-full transition-colors">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <label htmlFor="assignedTo" className="text-sm font-medium text-foreground">
            Assign To
          </label>
          <Select
            value={assignedTo}
            onValueChange={setAssignedTo}
          >
            <SelectTrigger className="w-full transition-colors">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="transition-colors"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="transition-colors"
        >
          Create Task
        </Button>
      </div>
    </form>
  );
};