-- Ajustar política de SELECT em agendamentos para permitir leitura pública
DROP POLICY IF EXISTS "Agendamentos são visíveis para admins da barbearia" ON public.agendamentos;

CREATE POLICY "Agendamentos são públicos para leitura" 
ON public.agendamentos 
FOR SELECT 
USING (true);