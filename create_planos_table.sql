-- CRIAÇÃO DA TABELA DE PLANOS
-- Para o Gerenciador criar planos que as barbearias podem assinar.

CREATE TABLE IF NOT EXISTS public.planos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    intervalo_dias INTEGER DEFAULT 30, -- Ex: 30 para mensal, 365 para anual
    max_barbeiros INTEGER, -- NULL = ilimitado
    max_agendamentos INTEGER, -- NULL = ilimitado
    beneficios TEXT[], -- Lista de features
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Políticas (Permissiva para garantir funcionamento, já que Auth Manager é simplificado)
DROP POLICY IF EXISTS "Public Select Planos" ON public.planos;
DROP POLICY IF EXISTS "Public All Planos" ON public.planos;

-- Permitir tudo para simplificar o MVP do Gerenciador
CREATE POLICY "Public All Planos"
ON public.planos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Notificar reload
NOTIFY pgrst, 'reload schema';

-- INSERIR ALGUNS PLANOS PADRÃO (Opcional)
INSERT INTO public.planos (nome, descricao, valor, beneficios)
VALUES 
('Básico', 'Ideal para começar', 29.90, ARRAY['Até 2 Barbeiros', 'Agenda Ilimitada']),
('Pro', 'Para barbearias em crescimento', 59.90, ARRAY['Até 5 Barbeiros', 'Financeiro Completo', 'WhatsApp Grátis']),
('Business', 'Sem limites', 99.90, ARRAY['Barbeiros Ilimitados', 'Múltiplas Unidades', 'Suporte VIP']);
