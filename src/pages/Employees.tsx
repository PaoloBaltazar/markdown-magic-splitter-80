import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Mail, Phone, MapPin, Calendar, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  username: string | null;
  contact_number: string | null;
  location: string | null;
  role: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

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

    setEmployees(data || []);
  };

  const handleDeleteEmployees = async () => {
    if (selectedEmployees.length === 0) {
      setDeleteError("Please select at least one employee to delete");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const { data, error } = await supabase.functions.invoke('delete-users', {
        body: {
          userIds: selectedEmployees,
          adminUsername,
          adminPassword,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete employees');
      }

      toast({
        title: "Success",
        description: `${selectedEmployees.length} employee(s) have been removed`,
      });

      // Reset state and close modal
      setIsDeleteModalOpen(false);
      setSelectedEmployees([]);
      setAdminUsername("");
      setAdminPassword("");
      setDeleteError("");
      
      // Refresh employee list
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employees:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete employees');
      toast({
        title: "Error",
        description: "Failed to delete employees",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.username && employee.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Employee Directory</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage and view employee information</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Employees
            </Button>
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <img
                  src={employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`}
                  alt={employee.full_name}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full"
                />
                <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                  <div>
                    <h3 className="font-semibold text-base md:text-lg truncate">{employee.full_name}</h3>
                    {employee.username && (
                      <p className="text-xs md:text-sm text-gray-500 truncate">@{employee.username}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    
                    {employee.contact_number && (
                      <div className="flex items-center text-xs md:text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{employee.contact_number}</span>
                      </div>
                    )}
                    
                    {employee.location && (
                      <div className="flex items-center text-xs md:text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{employee.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Joined {new Date(employee.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employees</DialogTitle>
            <DialogDescription>
              Select the employees you want to delete. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4 max-h-[200px] overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => {
                      setSelectedEmployees(
                        checked
                          ? [...selectedEmployees, employee.id]
                          : selectedEmployees.filter(id => id !== employee.id)
                      );
                    }}
                  />
                  <label htmlFor={employee.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {employee.full_name}
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Admin Username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              {deleteError && (
                <p className="text-sm text-red-500">{deleteError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedEmployees([]);
              setAdminUsername("");
              setAdminPassword("");
              setDeleteError("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEmployees}
              disabled={selectedEmployees.length === 0 || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Employees;
