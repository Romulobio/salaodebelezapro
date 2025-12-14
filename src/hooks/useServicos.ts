import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Servico {
  id: string;
  barbearia_id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = 'db_servicos';

const getLocalServicos = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
const saveLocalServicos = (data: any[]) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

export const useServicos = (barbeariaId: string | undefined) => {
  return useQuery({
    queryKey: ['servicos', barbeariaId],
    queryFn: async () => {
      if (!barbeariaId) return [];

      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .order('nome');

      if (error) {
        console.warn('Erro Supabase, usando fallback local', error);
        return getLocalServicos().filter((s: Servico) => s.barbearia_id === barbeariaId).sort((a: Servico, b: Servico) => a.nome.localeCompare(b.nome));
      }

      // Merge with local (optional, but good for consistency)
      // For now, prioritizes Supabase if successful, otherwise Local
      return data as Servico[];
    },
    enabled: !!barbeariaId,
  });
};

export const useServicosBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['servicos-slug', slug],
    queryFn: async () => {
      if (!slug) return [];

      let barbeariaId = '';

      // Try to find barbearia ID
      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (barbearia) {
        barbeariaId = barbearia.id;

        const { data, error } = await supabase
          .from('servicos')
          .select('*')
          .eq('barbearia_id', barbeariaId)
          .eq('ativo', true)
          .order('nome');

        if (!error && data) return data as Servico[];
      }

      // Fallback Local
      const localBarbearias = JSON.parse(localStorage.getItem('db_barbearias') || '[]');
      const localBarb = localBarbearias.find((b: any) => b.slug === slug);

      if (localBarb) barbeariaId = localBarb.id;

      if (barbeariaId) {
        return getLocalServicos()
          .filter((s: Servico) => s.barbearia_id === barbeariaId && s.ativo !== false)
          .sort((a: Servico, b: Servico) => a.nome.localeCompare(b.nome));
      }

      return [];
    },
    enabled: !!slug,
  });
};

export const useCreateServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('servicos')
          .insert(servico)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Fallback create servico local', error);
        const newServico = {
          ...servico,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const current = getLocalServicos();
        saveLocalServicos([...current, newServico]);
        return newServico;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicos', variables.barbearia_id] });
      toast.success('Serviço criado com sucesso!');
    },
    onError: (error) => {
      // Should not happen with fallback
      toast.error('Erro ao criar serviço: ' + error.message);
    },
  });
};

export const useUpdateServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...servico }: Partial<Servico> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('servicos')
          .update(servico)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const current = getLocalServicos();
        const updated = current.map((s: Servico) => s.id === id ? { ...s, ...servico, updated_at: new Date().toISOString() } : s);
        saveLocalServicos(updated);
        return updated.find((s: Servico) => s.id === id);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['servicos', data.barbearia_id] });
      toast.success('Serviço atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar serviço: ' + error.message);
    },
  });
};

export const useDeleteServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, barbeariaId }: { id: string; barbeariaId: string }) => {
      try {
        const { error } = await supabase
          .from('servicos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        const current = getLocalServicos();
        saveLocalServicos(current.filter((s: Servico) => s.id !== id));
      }
      return { id, barbeariaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['servicos', data.barbeariaId] });
      toast.success('Serviço removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover serviço: ' + error.message);
    },
  });
};
