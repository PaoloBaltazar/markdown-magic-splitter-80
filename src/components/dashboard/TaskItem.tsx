import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { handleTaskStatusChange } from "@/utils/notificationUtils";
import { CommentList } from "@/components/comments/CommentList";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  showAssignment?: boolean;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onTasksChange: () => void;
}

interface TaskDocument {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  email: string;
}

export const TaskItem = ({ 
  task, 
  showAssignment = true,
  onStatusChange,
  onTasksChange 
}: TaskItemProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<TaskDocument | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetchAssignedUser();
  }, [task.assigned_to]);

  useEffect(() => {
    if (isExpanded) {
      fetchTaskDocuments();
    }
  }, [isExpanded]);

  const fetchAssignedUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .eq('email', task.assigned_to)
        .single();

      if (error) throw error;
      setAssignedUser(data);
    } catch (error) {
      console.error('Error fetching assigned user:', error);
    }
  };

  const fetchTaskDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents_tasks')
        .select(`
          document_id,
          documents:documents (
            id,
            title,
            file_path,
            file_type
          )
        `)
        .eq('task_id', task.id);

      if (error) throw error;

      const docs = data.map(item => item.documents).filter(Boolean);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attached documents",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: TaskDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Downloaded ${document.title}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleView = async (document: TaskDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 300);

      if (error) throw error;

      setSelectedDocument(document);
      setPreviewUrl(data.signedUrl);
      setIsViewOpen(true);
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const formatDeadline = (deadline: string) => {
    try {
      return format(new Date(deadline), 'MMM d, yyyy');
    } catch (error) {
      return deadline;
    }
  };

  const getDisplayName = () => {
    if (!assignedUser) return task.assigned_to;
    return assignedUser.username || assignedUser.full_name || assignedUser.email;
  };

  const getNextStatus = (currentStatus: Task["status"]): Task["status"] => {
    switch (currentStatus) {
      case "pending":
        return "in-progress";
      case "in-progress":
        return "completed";
      case "completed":
        return "pending";
      default:
        return "pending";
    }
  };

  const handleStatusClick = async () => {
    try {
      const nextStatus = getNextStatus(task.status);
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', task.id);

      if (updateError) throw updateError;

      const updatedTask = { ...task, status: nextStatus };
      await handleTaskStatusChange(updatedTask);
      
      if (onStatusChange) {
        onStatusChange(task.id, nextStatus);
      }
      onTasksChange();
      
      toast({
        title: "Success",
        description: "Task status updated successfully",
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

  const isPreviewableImage = (fileType: string) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType.toLowerCase());
  };

  const isPreviewableDocument = (fileType: string) => {
    return ['pdf', 'doc', 'docx', 'docs'].includes(fileType.toLowerCase());
  };

  const renderPreview = (document: TaskDocument, url: string) => {
    const fileType = document.file_type.toLowerCase();

    if (isPreviewableImage(fileType)) {
      return (
        <img 
          src={url} 
          alt={document.title}
          className="max-w-full h-auto rounded-lg"
        />
      );
    }

    if (isPreviewableDocument(fileType)) {
      return (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-[600px] rounded-lg"
          title={document.title}
        />
      );
    }

    return (
      <div className="text-center p-4">
        <p>Preview not available for this file type.</p>
        <Button
          onClick={() => handleDownload(document)}
          className="mt-2"
        >
          Download Instead
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to enable text truncation */}
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</h3>
          <div className="space-y-1 mt-1">
            {showAssignment && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <span className="truncate">Assigned to: {getDisplayName()}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Due: {formatDeadline(task.deadline)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusClick();
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              task.status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : task.status === "in-progress"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            {task.status.replace("-", " ")}
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t p-4">
          {documents.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Attached Documents</h4>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <HoverCard key={doc.id}>
                    <HoverCardTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleView(doc)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1"> {/* Added min-w-0 and flex-1 */}
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm truncate">{doc.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold truncate">{doc.title}</h4>
                        <p className="text-sm text-gray-500">
                          Type: {doc.file_type.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to view the document
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          )}
          <CommentList taskId={task.id} />
        </div>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl w-[95vw]"> {/* Added w-[95vw] for better mobile display */}
          <DialogTitle className="text-lg font-semibold truncate">
            {selectedDocument?.title}
          </DialogTitle>
          {selectedDocument && previewUrl && (
            <div className="mt-4">
              {renderPreview(selectedDocument, previewUrl)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};