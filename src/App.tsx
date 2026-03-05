import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReloadPrompt } from "@/components/ReloadPrompt";


// Lazy Loading das Páginas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Performance = lazy(() => import("./pages/Performance"));
const TimeOff = lazy(() => import("./pages/TimeOff"));
const Reports = lazy(() => import("./pages/Reports"));
const Communication = lazy(() => import("./pages/Communication"));
const Payroll = lazy(() => import("./pages/Payroll"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Automations = lazy(() => import("./pages/Automations"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/Login"));
const ClockInPage = lazy(() => import("./pages/ClockIn"));
const TimesheetPage = lazy(() => import("./pages/Timesheet"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Support = lazy(() => import("./pages/Support"));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Suggestions = lazy(() => import("@/pages/Suggestions"));
const PublicSuggestion = lazy(() => import("@/pages/PublicSuggestion"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const PublicEvaluation = lazy(() => import("./pages/PublicEvaluation"));

const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

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
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/clock-in" element={<ClockInPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/sugestoes-publico" element={<PublicSuggestion />} />
              <Route path="/avaliacao/:token" element={<PublicEvaluation />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/recruitment" element={<Recruitment />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/absences" element={<TimeOff />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/timesheet" element={<TimesheetPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/tickets" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
