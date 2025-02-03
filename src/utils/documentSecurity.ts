import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'];

export const validateFile = (file: File): boolean => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "Error",
      description: "File size must be less than 10MB",
      variant: "destructive",
    });
    return false;
  }

  // Check file type
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_FILE_TYPES.includes(fileExt)) {
    toast({
      title: "Error",
      description: "Invalid file type. Only Word documents, PDFs, and images are allowed.",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove non-ASCII characters and common security-sensitive characters
  return fileName.replace(/[^\x00-\x7F]/g, '')
    .replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '_');
};