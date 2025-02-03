import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Navbar } from "@/components/Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { session } = useSessionContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session && 
        location.pathname !== "/login" && 
        location.pathname !== "/success-confirmation" &&
        location.pathname !== "/unauthorized") {
      navigate("/login");
    }
  }, [session, navigate, location.pathname]);

  // Don't show navbar on login, success confirmation, or unauthorized pages
  if (location.pathname === "/login" || 
      location.pathname === "/success-confirmation" ||
      location.pathname === "/unauthorized") {
    return (
      <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto container py-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden w-full pt-14">
        <main className="flex-1 overflow-y-auto container py-4">
          {children}
        </main>
      </div>
    </div>
  );
};