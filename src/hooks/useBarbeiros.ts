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

const LOCAL_STORAGE_KEY = 'db_barbeiros';

const getLocalBarbeiros = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
const saveLocalBarbeiros = (data: any[]) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

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

      if (error) {
        console.warn('Erro Supabase, usando fallback local', error);
        return getLocalBarbeiros().filter((b: Barbeiro) => b.barbearia_id === barbeariaId).sort((a: Barbeiro, b: Barbeiro) => a.nome.localeCompare(b.nome));
      }
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

      let barbeariaId = '';

      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (barbearia) {
        barbeariaId = barbearia.id;

        const { data, error } = await supabase
          .from('barbeiros')
          .select('*')
          .eq('barbearia_id', barbeariaId)
          .eq('ativo', true)
          .order('nome');

        if (!error && data) return data as Barbeiro[];
      }

      // Fallback Local
      const localBarbearias = JSON.parse(localStorage.getItem('db_barbearias') || '[]');
      const localBarb = localBarbearias.find((b: any) => b.slug === slug);

      if (localBarb) barbeariaId = localBarb.id;

      if (barbeariaId) {
        return getLocalBarbeiros()
          .filter((b: Barbeiro) => b.barbearia_id === barbeariaId && b.ativo !== false)
          .sort((a: Barbeiro, b: Barbeiro) => a.nome.localeCompare(b.nome));
      }

      return [];
    },
    enabled: !!slug,
  });
};

export const useCreateBarbeiro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (barbeiro: Omit<Barbeiro, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('barbeiros')
          .insert(barbeiro)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Fallback create barbeiro local', error);
        const newBarbeiro = {
          ...barbeiro,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const current = getLocalBarbeiros();
        saveLocalBarbeiros([...current, newBarbeiro]);
        return newBarbeiro;
      }
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
      try {
        const { data, error } = await supabase
          .from('barbeiros')
          .update(barbeiro)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const current = getLocalBarbeiros();
        const updated = current.map((b: Barbeiro) => b.id === id ? { ...b, ...barbeiro, updated_at: new Date().toISOString() } : b);
        saveLocalBarbeiros(updated);
        return updated.find((b: Barbeiro) => b.id === id);
      }
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
      try {
        const { error } = await supabase
          .from('barbeiros')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        const current = getLocalBarbeiros();
        saveLocalBarbeiros(current.filter((b: Barbeiro) => b.id !== id));
      }
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
