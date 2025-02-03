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
import { Upload, X } from "lucide-react";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (taskId: string) => {
    if (selectedFiles.length === 0) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const uploadedDocuments = [];

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: document, error: documentError } = await supabase
          .from('documents')
          .insert({
            title: file.name,
            file_path: filePath,
            file_type: fileExt || '',
            size: file.size,
            created_by: user.id,
          })
          .select()
          .single();

        if (documentError) throw documentError;

        const { error: linkError } = await supabase
          .from('documents_tasks')
          .insert({
            task_id: taskId,
            document_id: document.id,
          });

        if (linkError) throw linkError;

        uploadedDocuments.push(document);
      }

      return uploadedDocuments;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
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

      const newTask = {
        title,
        deadline,
        priority,
        status: "pending" as const,
        created_by: user.email || "Unknown",
        assigned_to: assignedEmployee.email,
        user_id: user.id,
      };

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (taskError) throw taskError;

      if (selectedFiles.length > 0) {
        await uploadFiles(taskData.id);
      }

      const taskWithCorrectTypes = {
        ...taskData,
        priority: taskData.priority as Task["priority"],
        status: taskData.status as Task["status"]
      } satisfies Task;

      onSuccess(taskWithCorrectTypes);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
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
        <div className="space-y-2.5">
          <label htmlFor="file" className="text-sm font-medium text-foreground">
            Attachments
          </label>
          <div className="space-y-4">
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="w-full transition-colors"
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
              multiple
            />
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="transition-colors"
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="transition-colors"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Creating Task...
            </>
          ) : (
            'Create Task'
          )}
        </Button>
      </div>
    </form>
  );
};