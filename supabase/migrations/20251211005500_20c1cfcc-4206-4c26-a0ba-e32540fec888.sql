-- Adicionar campo ativo para poder bloquear barbearias
ALTER TABLE public.barbearias ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;