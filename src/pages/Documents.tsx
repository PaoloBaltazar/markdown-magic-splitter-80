import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  FileText, 
  Download, 
  File, 
  FileCheck,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { validateFile, sanitizeFileName } from "@/utils/documentSecurity";

interface Document {
  id: string;
  title: string;
  file_type: string;
  file_path: string;
  size: number;
  created_at: string;
  content: string | null;
  created_by: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const { toast } = useToast();
  const { session } = useSessionContext();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      console.log("Fetching documents...");
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log("Fetched documents:", data);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user) return;

    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${sanitizedFileName.split('.').pop()}`;

      // Simulate progress before actual upload starts
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          upsert: false,
          contentType: file.type,
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Set to 95% after successful upload
      setUploadProgress(95);

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: sanitizedFileName,
          file_path: filePath,
          file_type: sanitizedFileName.split('.').pop()?.toLowerCase() || '',
          size: file.size,
          created_by: session.user.id
        });

      if (dbError) throw dbError;

      // Set to 100% after database update
      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      // Reset after a brief delay to show the 100% state
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleDownload = async (document: Document) => {
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

  const handleView = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 300);

      if (error) throw error;

      if (['doc', 'docx'].includes(document.file_type)) {
        const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(data.signedUrl)}`;
        window.open(officeOnlineUrl, '_blank');
      } else if (['pdf'].includes(document.file_type)) {
        window.open(data.signedUrl, '_blank');
      } else if (['jpg', 'jpeg', 'png'].includes(document.file_type)) {
        setSelectedDocument({ ...document, content: data.signedUrl });
        setIsViewOpen(true);
      }
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent, document: Document) => {
    e.stopPropagation();
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentToDelete.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Document Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage and organize company documents</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileUpload}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload">
              <Button asChild className="whitespace-nowrap">
                <span>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </span>
              </Button>
            </label>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 bg-blue-50">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2" />
            <h3 className="font-semibold text-sm md:text-base">Security Status</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-2">All documents are encrypted and access-logged</p>
          </Card>
          
          <Card className="p-4 md:p-6 bg-green-50">
            <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-sm md:text-base">Word Documents</h3>
            <p className="text-xl md:text-2xl font-bold mt-2">
              {documents.filter(d => ['doc', 'docx'].includes(d.file_type)).length}
            </p>
          </Card>
          
          <Card className="p-4 md:p-6 bg-orange-50">
            <File className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-sm md:text-base">Other Files</h3>
            <p className="text-xl md:text-2xl font-bold mt-2">
              {documents.filter(d => !['doc', 'docx'].includes(d.file_type)).length}
            </p>
          </Card>
        </div>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg md:text-xl font-semibold">Recent Documents</h2>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg hover:border-primary/20 transition-colors gap-3 md:gap-4"
              >
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm md:text-base truncate">{doc.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {doc.file_type.toUpperCase()} • {formatFileSize(doc.size)} • 
                      Last modified: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-9 md:ml-0">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleView(doc)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(e, doc)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          {selectedDocument?.content && (
            <div className="mt-4">
              <img 
                src={selectedDocument.content} 
                alt={selectedDocument.title}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDocumentToDelete(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Documents;