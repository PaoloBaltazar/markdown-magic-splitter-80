import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Mail, Phone, MapPin, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  username: string | null;
  contact_number: string | null;
  location: string | null;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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

      setEmployees(data || []);
    };

    fetchEmployees();
  }, [toast]);

  const filteredEmployees = employees.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.username && employee.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employee Directory</h1>
            <p className="text-gray-600 mt-1">Manage and view employee information</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`}
                  alt={employee.full_name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{employee.full_name}</h3>
                    {employee.username && (
                      <p className="text-sm text-gray-500">@{employee.username}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    
                    {employee.contact_number && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{employee.contact_number}</span>
                      </div>
                    )}
                    
                    {employee.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{employee.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Joined {new Date(employee.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No employees found matching your search criteria
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Employees;