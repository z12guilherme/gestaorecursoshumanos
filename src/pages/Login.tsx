import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ManualModal } from "@/components/ManualModal";
import hsfBg from "@/assets/hsf.jpeg";

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
    <section className="min-h-screen bg-slate-100 flex items-center justify-center py-10">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-center items-center h-full">
          <div className="w-full max-w-5xl">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex flex-wrap">
                {/* Left Column */}
                <div className="w-full lg:w-1/2">
                  <div className="p-8 md:px-12 md:py-10">
                    <div className="text-center mb-8">
                      <img
                        src="/icone.png"
                        className="mx-auto w-48 md:w-64"
                        alt="logo"
                      />
                      <h4 className="mt-6 mb-2 text-xl font-semibold text-slate-700">Bem-vindo de volta</h4>
                      <p className="text-sm text-slate-500">Gestão de Recursos Humanos REDE DMI</p>
                    </div>

                    <form onSubmit={handleLogin}>
                      

                      <div className="mb-4 relative">
                        <input
                          type="email"
                          id="form2Example11"
                          className="peer w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-transparent text-slate-700 transition-all"
                          placeholder="Phone number or email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <label 
                          htmlFor="form2Example11"
                          className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600"
                        >
                          Email
                        </label>
                      </div>

                      <div className="mb-4 relative">
                        <input
                          type="password"
                          id="form2Example22"
                          className="peer w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-transparent text-slate-700 transition-all"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <label 
                          htmlFor="form2Example22"
                          className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600"
                        >
                          Senha
                        </label>
                      </div>

                      <div className="text-center pt-1 mb-5 pb-1 flex flex-col items-center">
                        <button
                          className="w-full px-4 py-3 text-white font-medium rounded-lg shadow-md mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? "Entrando..." : "Entrar"}
                        </button>
                        <a className="text-slate-500 hover:text-blue-600 text-sm transition-colors" href="#!">
                          Esqueceu a Senha?
                        </a>
                      </div>

                      <div className="flex items-center justify-center mb-4">
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          onClick={() => navigate('/clock-in')}
                        >
                          Acessar Terminal de Ponto
                        </button>
                      </div>

                      <div className="flex justify-center mt-2">
                         <ManualModal />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Column */}
                <div 
                  className="w-full lg:w-1/2 flex items-center relative overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${hsfBg})`
                  }}
                >
                  {/* Overlay com gradiente para garantir leitura do texto */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-indigo-900/70 z-0"></div>

                  {/* Elementos decorativos sutis */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl mix-blend-overlay"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-400 blur-3xl mix-blend-overlay"></div>
                  </div>

                  <div className="text-white px-8 py-12 md:p-16 mx-auto z-10 relative text-center lg:text-left">
                    <h4 className="mb-6 text-4xl font-bold tracking-tight">REDE DMI</h4>
                    <p className="text-lg mb-0 leading-relaxed font-light opacity-95">
                      Cuidado integral e acessível para todos.
                      <br className="hidden lg:block" />
                      Serviços médicos de excelência para sua saúde e bem-estar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}