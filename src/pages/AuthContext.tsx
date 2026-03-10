import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define o tipo para o perfil do usuário, espelhando a tabela 'profiles'
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

// Define o tipo para o valor do nosso contexto de autenticação
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // O perfil do usuário agora faz parte do contexto
  loading: boolean;
  signOut: () => Promise<void>;
}

// Cria o contexto com um valor padrão inicial
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};

// Componente Provedor que vai envolver a aplicação
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar a sessão e o perfil do usuário logado
    const fetchUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchUserAndProfile();

    // Escuta por mudanças no estado de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Se houver uma sessão, busca o perfil. Se não (logout), limpa o perfil.
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, profile, loading, signOut };

  // Renderiza os filhos apenas quando a autenticação inicial estiver concluída
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};