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
      
      if (error) throw error;
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
      
      // Primeiro busca a barbearia pelo slug
      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!barbearia) return [];
      
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data as Servico[];
    },
    enabled: !!slug,
  });
};

export const useCreateServico = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('servicos')
        .insert(servico)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicos', variables.barbearia_id] });
      toast.success('Serviço criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar serviço: ' + error.message);
    },
  });
};

export const useUpdateServico = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...servico }: Partial<Servico> & { id: string }) => {
      const { data, error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
