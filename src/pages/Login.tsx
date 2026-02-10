import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ManualModal } from "@/components/ManualModal";

export default function LoginPage() {
  const [email, setEmail] = useState("mguimarcos39@gmail.com");
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
    <section className="min-h-screen bg-gray-200 flex items-center justify-center py-10">
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
                        style={{ width: "285px" }}
                        alt="logo"
                        className="mx-auto"
                      />
                      <h4 className="mt-4 mb-5 pb-1 text-xl font-semibold">Gestão de Recursos Humanos REDE DMI</h4>
                    </div>

                    <form onSubmit={handleLogin}>
                      

                      <div className="mb-4 relative">
                        <input
                          type="email"
                          id="form2Example11"
                          className="peer w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 placeholder-transparent text-black"
                          placeholder="Phone number or email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <label 
                          htmlFor="form2Example11"
                          className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500"
                        >
                          Username
                        </label>
                      </div>

                      <div className="mb-4 relative">
                        <input
                          type="password"
                          id="form2Example22"
                          className="peer w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 placeholder-transparent text-black"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <label 
                          htmlFor="form2Example22"
                          className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500"
                        >
                          Password
                        </label>
                      </div>

                      <div className="text-center pt-1 mb-5 pb-1 flex flex-col items-center">
                        <button
                          className="w-full px-4 py-3 text-white rounded shadow-md mb-3 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:shadow-lg transition-all"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "Log in"}
                        </button>
                        <a className="text-gray-500 hover:text-gray-700 text-sm" href="#!">
                          Esqueceu a Senha?
                        </a>
                      </div>

                      <div className="flex items-center justify-center mb-4">
                        <button
                          type="button"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
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
                <div className="w-full lg:w-1/2 flex items-center bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500">
                  <div className="text-white px-8 py-10 md:p-12 mx-auto">
                    <h4 className="mb-4 text-xl font-semibold">REDE DMI</h4>
                    <p className="text-sm mb-0 leading-relaxed">
                     Cuidado integral e acessível para todos
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