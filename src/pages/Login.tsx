import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver logado, redireciona para o dashboard
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula login com qualquer dado
    if (email && password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/80 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GestaoRH</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo! Acesse sua conta para continuar.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              placeholder="nome@exemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <a href="#" className="text-xs font-medium text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-background/50"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            Entrar no Sistema
          </Button>
        </form>
        <div className="text-center text-xs text-muted-foreground mt-6">
          &copy; 2024 GestaoRH. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}