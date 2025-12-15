-- CORREÇÃO CRÍTICA: PERMITIR QUE CLIENTES CRIEM AGENDAMENTOS
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas de insert (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Permitir inserção pública em agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Anon can insert agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.agendamentos;

-- 3. Criar a política correta de INSERT para TODOS (público/anon)
CREATE POLICY "Permitir inserção pública em agendamentos"
ON public.agendamentos
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Criar política de SELECT para TODOS (necessário para verificar horários ocupados)
DROP POLICY IF EXISTS "Permitir leitura pública em agendamentos" ON public.agendamentos;
CREATE POLICY "Permitir leitura pública em agendamentos"
ON public.agendamentos
FOR SELECT
TO public
USING (true);

-- 5. (Opcional) Permitir UPDATE apenas para admin ou dono (já coberto por outras policies provavelmente, mas bom garantir)
-- Se precisar que o cliente Cancele, precisaria de uma policy baseada em algum token, mas por enquanto o foco é salvar.
