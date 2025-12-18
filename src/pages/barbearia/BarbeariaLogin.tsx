import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scissors, Lock, ArrowRight, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop"
          alt="Beauty Salon Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Header - Minimal */}
      <div className="relative z-10 w-full flex justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-3xl font-bold text-white tracking-wide">
            BeautyPro
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold text-white mb-2">
                Painel do Adm
              </h1>
              <p className="text-white/80 text-sm">
                Acesse sua conta para gerenciar o salão
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome do Salão (Visual) */}
              <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10 mb-6">
                <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">Acessando</span>
                <p className="font-display font-bold text-xl text-white mt-1 capitalize">{slug?.replace(/-/g, ' ')}</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-white/90 ml-1">Senha de Acesso</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:bg-white/20 focus:border-primary/50 transition-all rounded-xl"
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-white/40 text-xs">
          © 2024 BeautyPro. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default BarbeariaLogin;
