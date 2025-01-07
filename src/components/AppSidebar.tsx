import { 
  Home, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Bell, 
  Users, 
  BarChart, 
  FileText,
  LogOut,
  Menu
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Tasks", icon: CheckSquare, url: "/tasks" },
  { title: "Calendar", icon: CalendarIcon, url: "/calendar" },
  { title: "Notifications", icon: Bell, url: "/notifications" },
  { title: "Employees", icon: Users, url: "/employees" },
  { title: "Performance", icon: BarChart, url: "/performance" },
  { title: "Documents", icon: FileText, url: "/documents" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
      navigate("/login");
    }
  };

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <SidebarTrigger>
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
      </div>
      <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
        <SidebarContent>
          <div className="p-6 bg-gradient-to-r from-primary/90 to-primary">
            <h1 className="text-2xl font-bold text-white">HR Hub</h1>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          location.pathname === item.url 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
}