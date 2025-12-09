import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Barbeiro {
  id: string;
  barbearia_id: string;
  nome: string;
  bio?: string;
  foto_url?: string;
  especialidades?: string[];
  avaliacao: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useBarbeiros = (barbeariaId: string | undefined) => {
  return useQuery({
    queryKey: ['barbeiros', barbeariaId],
    queryFn: async () => {
      if (!barbeariaId) return [];
      const { data, error } = await supabase
        .from('barbeiros')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .order('nome');
      
      if (error) throw error;
      return data as Barbeiro[];
    },
    enabled: !!barbeariaId,
  });
};

export const useBarbeirosBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['barbeiros-slug', slug],
    queryFn: async () => {
      if (!slug) return [];
      
      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!barbearia) return [];
      
      const { data, error } = await supabase
        .from('barbeiros')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data as Barbeiro[];
    },
    enabled: !!slug,
  });
};

export const useCreateBarbeiro = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (barbeiro: Omit<Barbeiro, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('barbeiros')
        .insert(barbeiro)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['barbeiros', variables.barbearia_id] });
      toast.success('Barbeiro adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar barbeiro: ' + error.message);
    },
  });
};

export const useUpdateBarbeiro = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...barbeiro }: Partial<Barbeiro> & { id: string }) => {
      const { data, error } = await supabase
        .from('barbeiros')
        .update(barbeiro)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barbeiros', data.barbearia_id] });
      toast.success('Barbeiro atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar barbeiro: ' + error.message);
    },
  });
};

export const useDeleteBarbeiro = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, barbeariaId }: { id: string; barbeariaId: string }) => {
      const { error } = await supabase
        .from('barbeiros')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, barbeariaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barbeiros', data.barbeariaId] });
      toast.success('Barbeiro removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover barbeiro: ' + error.message);
    },
  });
};
