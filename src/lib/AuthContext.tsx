import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { USE_MOCK } from '@/lib/mockDatabase';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔀 Bypass de autenticação no modo Mock (Demo Offline)
    if (USE_MOCK) {
      const mockUser = {
        id: 'mock-admin-id',
        email: 'admin@empresa.com',
        app_metadata: {},
        user_metadata: { full_name: 'Administrador RH' },
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
      setLoading(false);
      return;
    }

    // Busca sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças na autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (USE_MOCK) {
      // No modo mock, apenas limpa os dados do localStorage mock e recarrega
      localStorage.clear();
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);