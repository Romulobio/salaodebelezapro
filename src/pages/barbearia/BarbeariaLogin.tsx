import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Scissors, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BarbeariaLogin = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug) {
      toast.error('Barbearia não encontrada');
      return;
    }

    setLoading(true);

    try {
      let success = false;
      let barbeariaData = null;
      let sessionToken = '';

      try {
        const { data, error } = await supabase.functions.invoke('barbearia-auth', {
          body: { action: 'login', slug, password: senha }
        });

        if (error) throw error;

        if (!data.success) {
          toast.error(data.error || 'Erro ao fazer login');
          return;
        }

        success = true;
        barbeariaData = data.barbearia;
        sessionToken = data.session_token;
      } catch (error) {
        console.warn('Login Edge Function falhou, tentando fallback local...', error);

        // Fallback Local
        const { data: localBarbearia, error: localError } = await supabase
          .from('barbearias')
          .select('*')
          .eq('slug', slug)
          .single();

        if (localError || !localBarbearia) {
          // Tenta buscar do localStorage (Modo Offline)
          const localData = JSON.parse(localStorage.getItem('db_barbearias') || '[]');
          const offlineBarbearia = localData.find((b: any) => b.slug === slug);

          if (!offlineBarbearia) {
            toast.error('Barbearia não encontrada');
            return;
          }

          // Usa a barbearia encontrada no localStorage
          if (offlineBarbearia.senha_hash === btoa(senha)) {
            success = true;
            barbeariaData = offlineBarbearia;
            sessionToken = 'mock-token-' + Date.now();
          } else {
            toast.error('Erro ao conectar com servidor (e senha local incorreta).');
            return;
          }
        } else {
          // Barbearia encontrada no Supabase
          if (localBarbearia.ativo === false) {
            toast.error('Esta barbearia foi bloqueada pelo administrador.');
            return;
          }

          if (localBarbearia.senha_hash === btoa(senha)) {
            success = true;
            barbeariaData = localBarbearia;
            sessionToken = 'mock-token-' + Date.now();
          } else {
            toast.error('Senha incorreta.');
            return;
          }
        }
      }

      if (success && barbeariaData) {
        // Double check for blocked status (in case Edge Function is outdated or didn't catch it)
        if (barbeariaData.ativo === false) {
          toast.error('Esta barbearia foi bloqueada pelo administrador.');
          return;
        }

        // Se o ativo não veio (undefined), faz uma checagem de segurança no banco
        if (barbeariaData.ativo === undefined) {
          const { data: statusCheck } = await supabase.from('barbearias').select('ativo').eq('slug', slug).single();
          if (statusCheck && statusCheck.ativo === false) {
            toast.error('Esta barbearia foi bloqueada pelo administrador.');
            return;
          }
        }

        // Store session in sessionStorage
        sessionStorage.setItem('barbearia_session', JSON.stringify({
          ...barbeariaData,
          token: sessionToken,
          timestamp: Date.now()
        }));

        toast.success('Login realizado com sucesso!');
        navigate(`/admin/${slug}`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="neon-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon">
                <Scissors className="w-6 h-6 text-background" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold neon-text mb-2">
              Acesso Admin
            </h1>
            <p className="text-muted-foreground">
              Entre com a senha da sua barbearia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-12"
                  required
                  minLength={4}
                />
              </div>
            </div>

            <Button type="submit" size="lg" variant="neon" className="w-full" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BarbeariaLogin;
