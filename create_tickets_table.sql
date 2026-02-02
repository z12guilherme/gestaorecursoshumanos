-- Copie e cole este código no Editor SQL do seu projeto no Supabase para criar a tabela de chamados

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_num TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  hr_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar segurança a nível de linha (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Public Read Access" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Update Access" ON public.tickets FOR UPDATE USING (auth.role() = 'authenticated');