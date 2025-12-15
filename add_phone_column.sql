-- CORREÇÃO DE COLUNA AUSENTE
-- Execute no SQL Editor do Supabase

-- Adicionar coluna 'cliente_telefone' se ela não existir
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS cliente_telefone TEXT;

-- Opcional: Atualizar o cache do schema (o Supabase faz automático, mas bom saber)
NOTIFY pgrst, 'reload schema';
