import { useState } from "react";
import { Layout } from "@/components/Layout";
import { TaskList } from "@/components/dashboard/TaskList";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { taskService } from "@/services/taskService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

const Tasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        return [];
      }
      return data as Profile[];
    },
  });

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" ? true : task.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
    const matchesEmployee = employeeFilter === "all" ? true : 
                          task.assigned_to === employeeFilter || task.created_by === employeeFilter;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesEmployee;
  });

  const handleTasksChange = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  if (tasksLoading || employeesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600 mt-1">View and manage all tasks</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Tasks</label>
            <Input
              placeholder="Search by title, creator, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee</label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.email}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TaskList 
            title="All Tasks" 
            tasks={filteredTasks}
            onStatusChange={(taskId, newStatus) => {
              console.log("Status changed:", taskId, newStatus);
            }}
            onTasksChange={handleTasksChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;