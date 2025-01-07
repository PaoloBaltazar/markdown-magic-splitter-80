import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import Index from "@/pages/Index";
import Tasks from "@/pages/Tasks";
import Login from "@/pages/Login";
import Notifications from "@/pages/Notifications";
import Calendar from "@/pages/Calendar";
import Employees from "@/pages/Employees";
import Performance from "@/pages/Performance";
import Documents from "@/pages/Documents";

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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/documents" element={<Documents />} />
          </Routes>
        </Router>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;