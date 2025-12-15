-- Enable RLS on tables if not already enabled
ALTER TABLE public.barbearias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies to ensure update works for "Manager" (Public for now)
DROP POLICY IF EXISTS "Public Access Barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Public Access Planos" ON public.planos;

-- Create permissive policies for MVP (Manager actions)
-- Allow Select, Insert, Update, Delete for all on Barbearias
CREATE POLICY "Public Access Barbearias"
ON public.barbearias
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Allow Select, Insert, Update, Delete for all on Planos
CREATE POLICY "Public Access Planos"
ON public.planos
FOR ALL
TO public
USING (true)
WITH CHECK (true);
