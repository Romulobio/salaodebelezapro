import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Barbearia {
  id: string;
  nome: string;
  proprietario_nome: string;
  email: string;
  telefone?: string;
  plano_tipo: string;
  plano_valor: number;
  endereco?: string;
  descricao?: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useBarbearias = () => {
  return useQuery({
    queryKey: ['barbearias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbearias')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Barbearia[];
    },
  });
};

export const useBarbeariaBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['barbearia', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Barbearia | null;
    },
    enabled: !!slug,
  });
};

export const useCreateBarbearia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (barbearia: Omit<Barbearia, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('barbearias')
        .insert(barbearia)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbearias'] });
      toast.success('Barbearia criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar barbearia: ' + error.message);
    },
  });
};
