-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins podem gerenciar serviços da sua barbearia" ON public.servicos;
DROP POLICY IF EXISTS "Serviços são públicos para leitura" ON public.servicos;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Serviços são públicos para leitura" 
ON public.servicos 
FOR SELECT 
USING (true);

CREATE POLICY "Serviços podem ser criados publicamente" 
ON public.servicos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Serviços podem ser atualizados publicamente" 
ON public.servicos 
FOR UPDATE 
USING (true);

CREATE POLICY "Serviços podem ser deletados publicamente" 
ON public.servicos 
FOR DELETE 
USING (true);

-- Fix barbeiros policies
DROP POLICY IF EXISTS "Admins podem gerenciar barbeiros da sua barbearia" ON public.barbeiros;
DROP POLICY IF EXISTS "Barbeiros são públicos para leitura" ON public.barbeiros;

CREATE POLICY "Barbeiros são públicos para leitura" 
ON public.barbeiros 
FOR SELECT 
USING (true);

CREATE POLICY "Barbeiros podem ser criados publicamente" 
ON public.barbeiros 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Barbeiros podem ser atualizados publicamente" 
ON public.barbeiros 
FOR UPDATE 
USING (true);

CREATE POLICY "Barbeiros podem ser deletados publicamente" 
ON public.barbeiros 
FOR DELETE 
USING (true);

-- Fix agendamentos INSERT policy (was restrictive)
DROP POLICY IF EXISTS "Clientes podem criar agendamentos" ON public.agendamentos;

CREATE POLICY "Agendamentos podem ser criados publicamente" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (true);