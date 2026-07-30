import { useEffect, lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReloadPrompt } from "@/components/ReloadPrompt";
import { supabase } from "@/lib/supabase";
import { buildAppTitle } from "@/lib/branding";

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
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Suggestions = lazy(() => import("@/pages/Suggestions"));
const PublicSuggestion = lazy(() => import("@/pages/PublicSuggestion"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const PublicEvaluation = lazy(() => import("./pages/PublicEvaluation"));
const ManagerPortal = lazy(() => import("./pages/ManagerPortal"));
import { ManagerRoute } from "@/components/ManagerRoute";

const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const [branding, setBranding] = useState<{ name: string; logo: string | null }>({
    name: "",
    logo: null,
  });

  useEffect(() => {
    async function fetchBranding() {
      try {
        const { data } = await supabase
          .from("settings")
          .select("company_name, avatar_url")
          .maybeSingle();

        if (data) {
          setBranding({
            name: data.company_name || "",
            logo: data.avatar_url || null,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar branding da aba:", error);
      }
    }
    fetchBranding();
  }, []);

  useEffect(() => {
    document.title = buildAppTitle(branding.name);

    if (branding.logo) {
      const link = (document.querySelector("link[rel*='icon']") ||
        document.createElement("link")) as HTMLLinkElement;
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = branding.logo;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
  }, [branding]);

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
                  <Route path="/registro-ponto" element={<ClockInPage />} />
                  <Route path="/entrar" element={<LoginPage />} />
                  <Route path="/vagas/:jobId" element={<JobDetails />} />
                  <Route path="/termos" element={<TermsOfService />} />
                  <Route path="/privacidade" element={<PrivacyPolicy />} />
                  <Route path="/sugestoes-publico" element={<PublicSuggestion />} />
                  <Route path="/avaliacao/:token" element={<PublicEvaluation />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/funcionarios" element={<Employees />} />
                    <Route path="/recrutamento" element={<Recruitment />} />
                    <Route path="/desempenho" element={<Performance />} />
                    <Route path="/ausencias" element={<TimeOff />} />
                    <Route path="/folha-de-pagamento" element={<Payroll />} />
                    <Route path="/ponto" element={<TimesheetPage />} />
                    <Route path="/relatorios" element={<Reports />} />
                    <Route path="/comunicacao" element={<Communication />} />
                    <Route path="/sugestoes" element={<Suggestions />} />
                    <Route path="/assistente-ia" element={<AIAssistant />} />
                    <Route path="/automacoes" element={<Automations />} />
                    <Route path="/chamados" element={<Support />} />
                    <Route path="/configuracoes" element={<Settings />} />
                    <Route path="/logs-auditoria" element={<AuditLogs />} />
                    <Route
                      path="/portal-gestor"
                      element={
                        <ManagerRoute>
                          <ManagerPortal />
                        </ManagerRoute>
                      }
                    />
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
