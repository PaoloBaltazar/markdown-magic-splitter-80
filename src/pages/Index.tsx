import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { TaskForm } from "@/components/dashboard/TaskForm";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
      } else {
        const tasksWithCorrectTypes = (data || []).map(task => ({
          ...task,
          priority: task.priority as Task["priority"],
          status: task.status as Task["status"]
        })) satisfies Task[];
        
        setTasks(tasksWithCorrectTypes);
      }
    }
  };

  useEffect(() => {
    fetchTasks();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const pendingTasks = tasks.filter(task => task.status === "pending").length;
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Welcome back, HR Manager</p>
          </div>
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={<Clock className="w-6 h-6 md:w-8 md:h-8" />}
            description={pendingTasks === 1 ? "1 task pending" : `${pendingTasks} tasks pending`}
          />
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            icon={<AlertCircle className="w-6 h-6 md:w-8 md:h-8" />}
            description={inProgressTasks === 1 ? "1 task in progress" : `${inProgressTasks} tasks in progress`}
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />}
            description={completedTasks === 1 ? "1 task completed" : `${completedTasks} tasks completed`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <TaskList 
            title="My Tasks" 
            tasks={tasks.filter(task => task.status !== "completed")}
            onStatusChange={handleStatusChange}
            onTasksChange={fetchTasks}
          />
          <TaskList 
            title="Completed Tasks" 
            tasks={tasks.filter(task => task.status === "completed")}
            onStatusChange={handleStatusChange}
            onTasksChange={fetchTasks}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;