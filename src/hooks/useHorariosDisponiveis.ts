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

      // 1. Buscar barbearia
      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', barbeariaSlug)
        .maybeSingle();

      if (!barbearia) {
        return { disponiveis: HORARIOS_BASE, ocupados: [] as string[] };
      }

      // 2. Buscar Configuração da Agenda
      // @ts-ignore
      const { data: config } = await supabase
        .from('agenda_config')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .maybeSingle();

      // Configuração Padrão se não existir no banco
      const agenda = {
        horario_inicio: config?.horario_inicio || '08:00',
        horario_fim: config?.horario_fim || '19:00',
        intervalo: config?.intervalo_minutos || 30,
        dias: (config?.dias_funcionamento as string[]) || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
      };

      // 3. Verificar se o dia da semana está ativo
      const diaDaSemana = new Date(data + 'T12:00:00').getDay();
      const diasMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
      const diaSlug = diasMap[diaDaSemana];

      if (!agenda.dias.includes(diaSlug)) {
        return { disponiveis: [], ocupados: [], fechado: true, motivo: 'Barbearia fechada neste dia' };
      }

      // 4. Gerar Slots de Horário Base
      const slots = [];
      const [startHour, startMin] = agenda.horario_inicio.split(':').map(Number);
      const [endHour, endMin] = agenda.horario_fim.split(':').map(Number);

      let current = new Date();
      current.setHours(startHour, startMin, 0, 0);

      const end = new Date();
      end.setHours(endHour, endMin, 0, 0);

      while (current < end) {
        slots.push(
          current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        current.setMinutes(current.getMinutes() + agenda.intervalo);
      }

      // 5. Buscar Agendamentos (Ocupados)
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('barbearia_id', barbearia.id)
        .eq('barbeiro_id', barbeiroId)
        .eq('data', data)
        .neq('status', 'cancelado');

      // 6. Buscar Bloqueios Específicos
      // @ts-ignore
      const { data: bloqueios } = await supabase
        .from('horarios_bloqueados')
        .select('horarios')
        .eq('barbearia_id', barbearia.id)
        .eq('data', data)
        .maybeSingle();

      const agendados = agendamentos?.map(a => a.hora.slice(0, 5)) || [];
      const bloqueados = (bloqueios?.horarios as string[]) || [];

      const ocupadosTotal = [...new Set([...agendados, ...bloqueados])];
      const disponiveis = slots.filter(h => !ocupadosTotal.includes(h));

      return {
        disponiveis,
        ocupados: ocupadosTotal,
        todosHorarios: slots,
      };
    },
    enabled: !!barbeariaSlug && !!barbeiroId && !!data,
  });
};
