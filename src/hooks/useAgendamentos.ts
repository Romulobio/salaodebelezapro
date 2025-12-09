import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Agendamento {
  id: string;
  barbearia_id: string;
  cliente_id?: string;
  barbeiro_id: string;
  servico_id: string;
  cliente_nome: string;
  data: string;
  hora: string;
  valor_total: number;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  barbeiro?: { nome: string; foto_url?: string };
  servico?: { nome: string; preco: number };
}

export const useAgendamentos = (barbeariaId: string | undefined, data?: string) => {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!barbeariaId) return;

    const channel = supabase
      .channel('agendamentos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `barbearia_id=eq.${barbeariaId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agendamentos', barbeariaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [barbeariaId, queryClient]);

  return useQuery({
    queryKey: ['agendamentos', barbeariaId, data],
    queryFn: async () => {
      if (!barbeariaId) return [];
      
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          barbeiro:barbeiros(nome, foto_url),
          servico:servicos(nome, preco)
        `)
        .eq('barbearia_id', barbeariaId)
        .order('hora');

      if (data) {
        query = query.eq('data', data);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      return result as Agendamento[];
    },
    enabled: !!barbeariaId,
  });
};

export const useAgendamentosConcluidos = (barbeariaId: string | undefined) => {
  return useQuery({
    queryKey: ['agendamentos-concluidos', barbeariaId],
    queryFn: async () => {
      if (!barbeariaId) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          barbeiro:barbeiros(nome, foto_url),
          servico:servicos(nome, preco)
        `)
        .eq('barbearia_id', barbeariaId)
        .eq('status', 'concluido')
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as Agendamento[];
    },
    enabled: !!barbeariaId,
  });
};

export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at' | 'barbeiro' | 'servico'>) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert(agendamento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', variables.barbearia_id] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar agendamento: ' + error.message);
    },
  });
};

export const useUpdateAgendamentoStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, barbeariaId }: { id: string; status: Agendamento['status']; barbeariaId: string }) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, barbeariaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', data.barbeariaId] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos-concluidos', data.barbeariaId] });
      
      const statusMessages = {
        confirmado: 'Agendamento confirmado!',
        concluido: 'Atendimento concluído!',
        cancelado: 'Agendamento cancelado.',
        pendente: 'Agendamento reaberto.',
      };
      toast.success(statusMessages[data.status as keyof typeof statusMessages]);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
};
