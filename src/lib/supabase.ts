import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { USE_MOCK } from '@/lib/mockDatabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

type MockResult<T = any> = Promise<{ data: T | null; error: null }>;

const resolved = async <T = any>(data: T | null = null): MockResult<T> => ({ data, error: null });

const mockChain = () => ({
  select: () => mockChain(),
  insert: () => mockChain(),
  update: () => mockChain(),
  upsert: () => mockChain(),
  delete: () => mockChain(),
  eq: () => mockChain(),
  neq: () => mockChain(),
  ilike: () => mockChain(),
  order: () => mockChain(),
  range: () => mockChain(),
  limit: () => mockChain(),
  single: () => resolved(null),
  maybeSingle: () => resolved(null),
  then: (resolve: any) => Promise.resolve({ data: null, error: null }).then(resolve),
});

const mockSupabase = {
  auth: {
    getSession: () => resolved({ session: null }),
    getUser: () => resolved({ user: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => resolved(null),
    signOut: () => resolved(null),
    updateUser: () => resolved(null),
    mfa: {
      getAuthenticatorAssuranceLevel: () => resolved({ currentLevel: 'aal1', nextLevel: 'aal1' }),
      listFactors: () => resolved({ totp: [] }),
      challenge: () => resolved({ id: 'mock-challenge' }),
      verify: () => resolved(null),
      enroll: () => resolved({ id: 'mock-factor' }),
      unenroll: () => resolved(null),
    },
  },
  from: () => mockChain(),
  rpc: () => resolved([]),
  storage: {
    from: () => ({
      upload: () => resolved(null),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      list: () => resolved([]),
      remove: () => resolved(null),
      download: () => resolved(null),
    }),
  },
  functions: {
    invoke: () => resolved({}),
  },
} as unknown as SupabaseClient;

export const supabase = USE_MOCK ? mockSupabase : createClient(supabaseUrl, supabaseKey);
