-- Permitir que admins excluam barbearias
CREATE POLICY "Admins podem deletar barbearias" 
ON public.barbearias 
FOR DELETE 
USING (true);