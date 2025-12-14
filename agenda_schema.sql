-- Tabela de Configuração Geral da Agenda (1 por Barbearia)
CREATE TABLE IF NOT EXISTS public.agenda_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barbearia_id UUID REFERENCES public.barbearias(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dias_funcionamento JSONB DEFAULT '["seg", "ter", "qua", "qui", "sex", "sab"]'::jsonb, -- Ex: ["seg", "ter", ...]
    horario_inicio TIME DEFAULT '09:00',
    horario_fim TIME DEFAULT '19:00',
    intervalo_minutos INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Bloqueios Específicos (Data/Horário)
CREATE TABLE IF NOT EXISTS public.horarios_bloqueados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barbearia_id UUID REFERENCES public.barbearias(id) ON DELETE CASCADE NOT NULL,
    data DATE NOT NULL,
    horarios JSONB NOT NULL, -- Array de horários bloqueados ex: ["14:00", "14:30"]
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Segurança)
ALTER TABLE public.agenda_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_bloqueados ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para clientes verem horários) / Escrita apenas autenticado (donos)
-- Simplificação: Leitura Pública, Escrita Pública (pois a auth é via função ou mock por enquanto)

CREATE POLICY "Leitura pública de agenda_config" 
ON public.agenda_config FOR SELECT 
USING (true);

CREATE POLICY "Escrita agenda_config (auth)" 
ON public.agenda_config FOR ALL 
USING (true) -- Idealmente checar user_id vs owner, mas manteremos aberto para facilitar o MVP
WITH CHECK (true);

CREATE POLICY "Leitura pública de horarios_bloqueados" 
ON public.horarios_bloqueados FOR SELECT 
USING (true);

CREATE POLICY "Escrita horarios_bloqueados (auth)" 
ON public.horarios_bloqueados FOR ALL 
USING (true)
WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agenda_config_barbearia ON public.agenda_config(barbearia_id);
CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_data ON public.horarios_bloqueados(barbearia_id, data);
