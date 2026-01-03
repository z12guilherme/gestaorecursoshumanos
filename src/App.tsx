import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import ClockInPage from "./pages/ClockIn";
import TimesheetPage from "./pages/Timesheet";
import JobDetails from "./pages/JobDetails";
import { ReloadPrompt } from "@/components/ReloadPrompt";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.title = "GestaoRH";
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ReloadPrompt />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/time-off" element={<ClockInPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/recruitment" element={<Recruitment />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/absences" element={<TimeOff />} />
                <Route path="/timesheet" element={<TimesheetPage />} />
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
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
