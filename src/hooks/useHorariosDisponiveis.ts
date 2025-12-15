import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HORARIOS_BASE = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

// Helper to add minutes to a time string (HH:MM)
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Helper to check if a time is between start and end (exclusive of end)
const isTimeOccupied = (time: string, start: string, duration: number): boolean => {
  const [th, tm] = time.split(':').map(Number);
  const timeMins = th * 60 + tm;

  const [sh, sm] = start.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = startMins + duration;

  return timeMins >= startMins && timeMins < endMins;
};

interface UseHorariosDisponiveisParams {
  barbeariaSlug: string | undefined;
  barbeiroId: string | undefined;
  data: string | undefined;
  servicoId?: string | null;
}

export const useHorariosDisponiveis = ({ barbeariaSlug, barbeiroId, data, servicoId }: UseHorariosDisponiveisParams) => {
  return useQuery({
    queryKey: ['horarios-disponiveis', barbeariaSlug, barbeiroId, data, servicoId],
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

      // 5. Buscar Agendamentos (Ocupados) com Duração
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select(`
          hora,
          servico:servicos(duracao_minutos)
        `)
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

      // Get duration of requested service (defaults to interval if not found)
      let requestedDuration = agenda.intervalo;
      if (servicoId) {
        const { data: servico } = await supabase
          .from('servicos')
          .select('duracao_minutos')
          .eq('id', servicoId)
          .maybeSingle();
        if (servico?.duracao_minutos) {
          requestedDuration = servico.duracao_minutos;
        }
      }

      // Calculate ALL occupied slots based on existing appointments ranges
      const bloqueados = (bloqueios?.horarios as string[]) || [];
      const ocupadosSet = new Set<string>();

      // Mark blocked slots from manual blocks
      bloqueados.forEach(h => ocupadosSet.add(h));

      // Mark blocked slots from appointments (considering duration)
      agendamentos?.forEach(ag => {
        // @ts-ignore
        const duration = ag.servico?.duracao_minutos || agenda.intervalo;
        const start = ag.hora.slice(0, 5);

        // Add all slots that fall within this appointment
        slots.forEach(slot => {
          if (isTimeOccupied(slot, start, duration)) {
            ocupadosSet.add(slot);
          }
        });
      });

      // Filter available slots
      // A slot is available if:
      // 1. It is not occupied/blocked itself
      // 2. AND sufficient subsequent time is free for the requested service duration
      const disponiveis = slots.filter(slot => {
        if (ocupadosSet.has(slot)) return false;

        // Check if the requested service fits starting at this slot
        // We check sample points every 'interval' minutes.
        // Or strictly: Any time T where slot <= T < slot + requestedDuration must NOT be occupied.
        // Since we deal with discrete slots usually, we check if covering slots are free.

        let currentTime = slot;
        let coveredMinutes = 0;

        // Simple check: check overlapping slots
        // (This assumes we only care about slot alignment)
        while (coveredMinutes < requestedDuration) {
          // Be careful: if duration extends beyond closing time, it's invalid?
          // Implementation choice: allow if it fits within open hours? 
          // Usually yes.

          // If this sub-slot is occupied, then the start 'slot' is invalid.
          // Note: 'isTimeOccupied' logic above was for marking. Here we check logic.
          // We can reuse the set.

          const [h, m] = currentTime.split(':').map(Number);
          const currentMinutes = h * 60 + m;
          const [eh, em] = agenda.horario_fim.split(':').map(Number);
          const endMinutes = eh * 60 + em;

          if (currentMinutes >= endMinutes) return false; // Exceeds closing time

          // Check if specific aligned slot is in set (only works if duration is multiple of interval)
          // For robustness, better to check if 'currentTime' falls into any known occupied range?
          // But we already flattened ranges into 'ocupadosSet'.
          // So we just check if the generated `currentTime` key is in `ocupadosSet`.
          if (ocupadosSet.has(currentTime)) return false;

          // Advance
          currentTime = addMinutes(currentTime, agenda.intervalo);
          coveredMinutes += agenda.intervalo;
        }

        return true;
      });

      return {
        disponiveis,
        ocupados: Array.from(ocupadosSet),
        todosHorarios: slots,
      };
    },
    enabled: !!barbeariaSlug && !!barbeiroId && !!data,
  });
};
