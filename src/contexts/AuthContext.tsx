import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { USE_MOCK } from '@/lib/mockDatabase';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  display_role?: string;
  role?: string; // 'admin' | 'manager' | 'employee'
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isManager: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInMock?: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isManager: true, // default true para não bloquear no mock
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // 🔀 Desvio Offline (Mock) — Perfil fake do admin
      if (USE_MOCK) {
        setProfile({
          id: userId,
          full_name: 'Administrador Demo',
          avatar_url: '',
          email: 'admin@demo.com',
          display_role: 'Gerente de RH',
          role: 'admin',
        });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signInMock = () => {
    if (!USE_MOCK) return;
    const mockUser = {
      id: 'mock-admin-id',
      email: 'admin@demo.com',
      app_metadata: {},
      user_metadata: { full_name: 'Administrador Demo' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: mockUser,
      expires_in: 999999,
      expires_at: Date.now() / 1000 + 999999,
      token_type: 'bearer',
    } as unknown as Session;

    localStorage.setItem('mock_logged_in', 'true');
    setSession(mockSession);
    setUser(mockUser);
    fetchProfile(mockUser.id);
  };

  useEffect(() => {
    let mounted = true;

    // 🔀 Bypass completo de autenticação no modo Mock (Demo Offline)
    if (USE_MOCK) {
      if (localStorage.getItem('mock_logged_in') === 'true') {
        const mockUser = {
          id: 'mock-admin-id',
          email: 'admin@demo.com',
          app_metadata: {},
          user_metadata: { full_name: 'Administrador Demo' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;

        const mockSession = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          user: mockUser,
          expires_in: 999999,
          expires_at: Date.now() / 1000 + 999999,
          token_type: 'bearer',
        } as unknown as Session;

        setSession(mockSession);
        setUser(mockUser);
        fetchProfile(mockUser.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        if (mounted) setLoading(false);
      }
      return () => { mounted = false; };
    }

    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    });

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        console.log("Auth event:", event);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          }
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
    // 🔀 Desvio Offline (Mock) — Remove apenas a flag de login para manter o BD mockado
    if (USE_MOCK) {
      localStorage.removeItem('mock_logged_in');
      setSession(null);
      setUser(null);
      setProfile(null);
      window.location.replace('/login');
      return;
    }

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
      setProfile(null);

      // 5. Força recarregamento total para a tela de login
      window.location.replace('/login');
    }
  };

  const isManager = profile?.role === 'admin' || profile?.role === 'manager' || USE_MOCK;

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isManager, signOut, refreshProfile, signInMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
