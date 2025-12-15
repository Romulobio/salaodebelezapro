import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plano } from '@/types/plano';

export const useBarbeariaPlan = (barbeariaId: string | undefined, planoTipo: string | undefined) => {
    return useQuery({
        queryKey: ['plano', barbeariaId, planoTipo],
        queryFn: async () => {
            if (!planoTipo) return null;

            // Se tiver ID de barbearia, tenta buscar o plano associado via ID ou nome
            // Caso planoTipo seja um UUID (novos planos)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planoTipo);

            if (isUUID) {
                const { data, error } = await supabase
                    .from('planos')
                    .select('*')
                    .eq('id', planoTipo)
                    .single();

                if (error) throw error;
                return data as Plano;
            } else {
                // Fallback para planos legados (basico, profissional, premium)
                // Se quisermos mapear para um plano fake ou apenas retornar null
                // O usuário pediu especificamente "Quando o plano for basico".
                // Se for string antiga 'basico', retornamos um mock que satisfaz a condição?
                // Ou tentamos buscar pelo nome?

                // Tenta buscar pelo nome se coincidir com slug antigo
                const { data } = await supabase
                    .from('planos')
                    .select('*')
                    .ilike('nome', `%${planoTipo}%`)
                    .maybeSingle();

                return data as Plano | null;
            }
        },
        enabled: !!planoTipo,
    });
};
