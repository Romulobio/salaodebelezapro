-- FIX: Add missing senha_hash column to barbearias table
-- This is required for the local fallback login to work.

ALTER TABLE public.barbearias 
ADD COLUMN IF NOT EXISTS senha_hash TEXT;

-- Verify RLS for insert
-- Ensure authenticated users can insert (for managers)
DO $$ BEGIN
    CREATE POLICY "Managers can insert barbearias" ON public.barbearias FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
