import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

interface ManagerRouteProps {
  children: React.ReactNode;
}

/**
 * Rota protegida que só permite acesso a usuários com role 'admin' ou 'manager'.
 * Usuários sem permissão são redirecionados ao dashboard com mensagem informativa.
 */
export function ManagerRoute({ children }: ManagerRouteProps) {
  const { isManager, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isManager) {
      toast.error("Acesso restrito à Área de Gestores.", {
        description: "Sua conta não possui permissão de gestor.",
      });
    }
  }, [loading, isManager]);

  if (loading) return null;
  if (!isManager) return <Navigate to="/" replace />;

  return <>{children}</>;
}
