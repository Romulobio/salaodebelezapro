import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HORARIOS_BASE = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

interface UseHorariosDisponiveisParams {
  barbeariaSlug: string | undefined;
  barbeiroId: string | undefined;
  data: string | undefined;
}

export const useHorariosDisponiveis = ({ barbeariaSlug, barbeiroId, data }: UseHorariosDisponiveisParams) => {
  return useQuery({
    queryKey: ['horarios-disponiveis', barbeariaSlug, barbeiroId, data],
    queryFn: async () => {
      if (!barbeariaSlug || !barbeiroId || !data) {
        return { disponiveis: HORARIOS_BASE, ocupados: [] as string[] };
      }

      // Buscar barbearia pelo slug
      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', barbeariaSlug)
        .maybeSingle();

      if (!barbearia) {
        return { disponiveis: HORARIOS_BASE, ocupados: [] as string[] };
      }

      // Buscar agendamentos do barbeiro na data específica que não estão cancelados
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('barbearia_id', barbearia.id)
        .eq('barbeiro_id', barbeiroId)
        .eq('data', data)
        .neq('status', 'cancelado');

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return { disponiveis: HORARIOS_BASE, ocupados: [] as string[] };
      }

      const horariosOcupados = agendamentos?.map(a => a.hora) || [];
      const horariosDisponiveis = HORARIOS_BASE.filter(h => !horariosOcupados.includes(h));

      return {
        disponiveis: horariosDisponiveis,
        ocupados: horariosOcupados,
        todosHorarios: HORARIOS_BASE,
      };
    },
    enabled: !!barbeariaSlug && !!barbeiroId && !!data,
  });
};
