import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        console.log("Auth event:", event);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // 1. Tenta avisar o Supabase (mas não bloqueia se falhar)
      // Adicionado timeout para evitar travamento em caso de erro de rede
      const { error } = await Promise.race([
        supabase.auth.signOut(),
        new Promise<{ error: any }>(resolve => setTimeout(() => resolve({ error: 'timeout' }), 2000))
      ]);
      
      if (error) console.error("Logout warning:", error);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // 2. MATAR SERVICE WORKERS E CACHE (CRÍTICO)
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 3. LIMPEZA NUCLEAR DE STORAGE
      // Remove explicitamente todos os tokens do armazenamento
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpa cookies por garantia
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 4. Limpa estado local
      setSession(null);
      setUser(null);

      // 5. Força recarregamento total para a tela de login
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);