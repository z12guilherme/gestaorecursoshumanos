import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Recruitment from "./pages/Recruitment";
import Performance from "./pages/Performance";
import TimeOff from "./pages/TimeOff";
import Reports from "./pages/Reports";
import Communication from "./pages/Communication";
import AIAssistant from "./pages/AIAssistant";
import Automations from "./pages/Automations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  useEffect(() => {
    document.title = "GestaoRH";
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/time-off" element={<TimeOff />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
