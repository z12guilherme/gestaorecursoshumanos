import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ManualModal } from "@/components/ManualModal";
import { SecurityBadge } from "@/components/auth/SecurityBadge";
import hsfBg from "@/assets/hsf.jpeg";
import { Mail, Lock, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: "Email ou senha incorretos. Verifique suas credenciais.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row min-h-[600px]">
        
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-3xl bg-blue-50/50 mb-6 shadow-sm ring-1 ring-blue-100">
                    <img src="/icone.png" className="w-12 h-12 object-contain" alt="logo" />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h4>
                <p className="text-slate-500 mt-3 text-sm">Acesse sua conta para gerenciar o RH</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 max-w-sm mx-auto w-full">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 ml-1">E-mail Corporativo</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="email"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 focus:bg-white placeholder:text-slate-400"
                            placeholder="exemplo@rededmi.com.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between ml-1">
                        <label className="text-xs font-medium text-slate-600">Senha</label>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 focus:bg-white placeholder:text-slate-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            "Autenticando..."
                        ) : (
                            <>
                                Entrar no Sistema <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8 relative flex items-center justify-center max-w-sm mx-auto w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                </div>
                <span className="relative bg-white px-4 text-xs text-slate-400 uppercase tracking-wider font-medium">Acesso Rápido</span>
            </div>

            <div className="mt-6 space-y-4 max-w-sm mx-auto w-full">
                <button
                    type="submit"
                    onClick={() => navigate('/clock-in')}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 font-medium flex items-center justify-center gap-2 transition-all group"
                >
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 group-hover:border-blue-200 transition-colors">
                        <Clock className="h-4 w-4" />
                    </div>
                    Área do Funcionário
                </button>
                
                <div className="flex justify-center">
                   <ManualModal />
                </div>

                <div className="flex justify-center pt-8">
                    <SecurityBadge />
                </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-400">© 2026 Rede DMI. Todos os direitos reservados.</p>
            </div>
        </div>

        {/* Right Column - Image */}
        <div className="w-full lg:w-1/2 relative hidden lg:block bg-slate-900">
            <div className="absolute inset-0 bg-blue-400/10 mix-blend-overlay z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent z-20" />
            <img 
                src={hsfBg} 
                alt="Hospital DMI" 
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-12 z-30 text-white">
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Sistema Operacional</span>
                </div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">Excelência em Gestão de Pessoas</h2>
                <p className="text-slate-200 text-lg leading-relaxed max-w-md">
                    Plataforma integrada para otimizar os processos de RH da REDE DMI, garantindo eficiência e cuidado com nossos colaboradores.
                </p>
            </div>
        </div>

      </div>
    </section>
  );
}