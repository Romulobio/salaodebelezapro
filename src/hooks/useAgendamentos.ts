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

const LOCAL_KEY = 'db_agendamentos';
const getLocalAgendamentos = () => JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
const saveLocalAgendamentos = (data: any[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

// Helper para fazer join manual com serviços e barbeiros locais
const enrichAgendamentosLocal = (agendamentos: Agendamento[]) => {
  const servicos = JSON.parse(localStorage.getItem('db_servicos') || '[]');
  const barbeiros = JSON.parse(localStorage.getItem('db_barbeiros') || '[]');

  return agendamentos.map(a => {
    const servico = servicos.find((s: any) => s.id === a.servico_id);
    const barbeiro = barbeiros.find((b: any) => b.id === a.barbeiro_id);
    return {
      ...a,
      servico: servico ? { nome: servico.nome, preco: servico.preco } : undefined,
      barbeiro: barbeiro ? { nome: barbeiro.nome, foto_url: barbeiro.foto_url } : undefined
    };
  });
};

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

      if (error) {
        console.warn('Erro Supabase Agendamentos, fallback local', error);
        let local = getLocalAgendamentos().filter((a: Agendamento) => a.barbearia_id === barbeariaId);
        if (data) {
          local = local.filter((a: Agendamento) => a.data === data);
        }
        return enrichAgendamentosLocal(local).sort((a: any, b: any) => a.hora.localeCompare(b.hora));
      }
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

      if (error) {
        console.warn('Fallback local para agendamentos concluídos');
        const local = getLocalAgendamentos().filter((a: Agendamento) => a.barbearia_id === barbeariaId && a.status === 'concluido');
        return enrichAgendamentosLocal(local).sort((a: any, b: any) => b.data.localeCompare(a.data));
      }
      return data as Agendamento[];
    },
    enabled: !!barbeariaId,
  });
};

export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at' | 'barbeiro' | 'servico'>) => {
      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .insert(agendamento)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Fallback create agendamento local', error);
        const newAgendamento = {
          ...agendamento,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const current = getLocalAgendamentos();
        saveLocalAgendamentos([...current, newAgendamento]);
        return newAgendamento;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos', variables.barbearia_id] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      // Should not happen with fallback
      toast.error('Erro ao criar agendamento: ' + error.message);
    },
  });
};

export const useUpdateAgendamentoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, barbeariaId }: { id: string; status: Agendamento['status']; barbeariaId: string }) => {
      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { ...data, barbeariaId };
      } catch (error) {
        const current = getLocalAgendamentos();
        const updated = current.map((a: Agendamento) => a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a);
        saveLocalAgendamentos(updated);
        return { ...updated.find((a: Agendamento) => a.id === id), barbeariaId };
      }
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
    onError: (error: any) => {
      console.error('Erro Update Status:', error);
      toast.error(`Erro ao atualizar status: ${error.message} (Cód: ${error.code || 'N/A'}) - Verifique se rodou o script SQL!`);
    },
  });
};
