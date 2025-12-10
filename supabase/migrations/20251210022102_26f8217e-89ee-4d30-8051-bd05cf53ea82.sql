-- Add password hash column to barbearias
ALTER TABLE public.barbearias ADD COLUMN senha_hash text;

-- Create a function to verify barbershop password (will be used with edge function)
CREATE OR REPLACE FUNCTION public.get_barbearia_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  nome text,
  slug text,
  senha_hash text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome, slug, senha_hash
  FROM public.barbearias
  WHERE slug = p_slug
$$;