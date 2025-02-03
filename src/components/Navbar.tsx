import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Bell, Calendar, Users, BarChart2, FileText, CheckSquare, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: BarChart2, label: "Performance", path: "/performance" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: Shield, label: "IP Management", path: "/ip-management" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const supabase = useSupabaseClient();
  const user = useUser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "justify-start gap-2 w-full",
              isActive && "bg-accent"
            )}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Button>
        );
      })}
      <Button
        variant="ghost"
        className="justify-start gap-2 w-full text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b h-14">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="flex flex-col gap-6">
                <h2 className="font-semibold text-lg">HR Management</h2>
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold">HR Management</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};