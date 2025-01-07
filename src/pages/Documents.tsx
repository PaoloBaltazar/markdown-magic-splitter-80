import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Download, 
  File, 
  FileCheck,
  Search
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  category: string;
  lastModified: string;
  status: "draft" | "published";
  size: string;
}

const Documents = () => {
  const [documents] = useState<Document[]>([
    {
      id: "1",
      title: "Employee Handbook 2024",
      category: "Policies",
      lastModified: "2024-02-15",
      status: "published",
      size: "2.5 MB",
    },
    {
      id: "2",
      title: "Onboarding Checklist",
      category: "Templates",
      lastModified: "2024-02-10",
      status: "published",
      size: "1.2 MB",
    },
    {
      id: "3",
      title: "Performance Review Template",
      category: "Templates",
      lastModified: "2024-02-08",
      status: "draft",
      size: "890 KB",
    },
  ]);

  const { toast } = useToast();

  const handleDownload = (document: Document) => {
    toast({
      title: "Download Started",
      description: `Downloading ${document.title}...`,
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-gray-600 mt-1">Manage and organize company documents</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-50">
            <FileText className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold">Total Documents</h3>
            <p className="text-2xl font-bold mt-2">{documents.length}</p>
          </Card>
          
          <Card className="p-6 bg-green-50">
            <FileCheck className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Published</h3>
            <p className="text-2xl font-bold mt-2">
              {documents.filter(d => d.status === "published").length}
            </p>
          </Card>
          
          <Card className="p-6 bg-orange-50">
            <File className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold">Drafts</h3>
            <p className="text-2xl font-bold mt-2">
              {documents.filter(d => d.status === "draft").length}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.category} • Last modified: {doc.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{doc.size}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Documents;