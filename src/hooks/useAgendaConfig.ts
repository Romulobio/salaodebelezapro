
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgendaConfig {
    dias_funcionamento: string[];
    horario_inicio: string;
    horario_fim: string;
    intervalo_minutos: number;
}

export const useAgendaConfig = (slug: string | undefined) => {
    return useQuery({
        queryKey: ['agenda-config', slug],
        queryFn: async () => {
            if (!slug) return null;

            const { data: barbearia } = await supabase
                .from('barbearias')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (!barbearia) return null;

            const { data: config } = await supabase
                .from('agenda_config')
                .select('*')
                .eq('barbearia_id', barbearia.id)
                .maybeSingle();

            const defaultConfig: AgendaConfig = {
                dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
                horario_inicio: '09:00',
                horario_fim: '19:00',
                intervalo_minutos: 30,
            };

            if (!config) return defaultConfig;

            return {
                dias_funcionamento: (config.dias_funcionamento as string[]) || defaultConfig.dias_funcionamento,
                horario_inicio: config.horario_inicio || defaultConfig.horario_inicio,
                horario_fim: config.horario_fim || defaultConfig.horario_fim,
                intervalo_minutos: config.intervalo_minutos || defaultConfig.intervalo_minutos,
            } as AgendaConfig;
        },
        enabled: !!slug,
    });
};
