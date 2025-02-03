import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { IPAccessGuard } from "@/components/IPAccessGuard";
import Index from "@/pages/Index";
import Tasks from "@/pages/Tasks";
import Login from "@/pages/Login";
import SuccessConfirmation from "@/pages/SuccessConfirmation";
import Notifications from "@/pages/Notifications";
import Calendar from "@/pages/Calendar";
import Employees from "@/pages/Employees";
import Performance from "@/pages/Performance";
import Documents from "@/pages/Documents";
import IPManagement from "@/pages/IPManagement";
import Unauthorized from "@/pages/Unauthorized";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <Router>
          <Routes>
            {/* Public routes that don't require IP validation */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/success-confirmation" element={<SuccessConfirmation />} />
            
            {/* Protected routes that require IP validation, including login */}
            <Route
              path="/login"
              element={
                <IPAccessGuard>
                  <Login />
                </IPAccessGuard>
              }
            />
            <Route
              path="/"
              element={
                <IPAccessGuard>
                  <Index />
                </IPAccessGuard>
              }
            />
            <Route
              path="/tasks"
              element={
                <IPAccessGuard>
                  <Tasks />
                </IPAccessGuard>
              }
            />
            <Route
              path="/notifications"
              element={
                <IPAccessGuard>
                  <Notifications />
                </IPAccessGuard>
              }
            />
            <Route
              path="/calendar"
              element={
                <IPAccessGuard>
                  <Calendar />
                </IPAccessGuard>
              }
            />
            <Route
              path="/employees"
              element={
                <IPAccessGuard>
                  <Employees />
                </IPAccessGuard>
              }
            />
            <Route
              path="/performance"
              element={
                <IPAccessGuard>
                  <Performance />
                </IPAccessGuard>
              }
            />
            <Route
              path="/documents"
              element={
                <IPAccessGuard>
                  <Documents />
                </IPAccessGuard>
              }
            />
            <Route
              path="/ip-management"
              element={
                <IPAccessGuard>
                  <IPManagement />
                </IPAccessGuard>
              }
            />
          </Routes>
        </Router>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;