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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="py-6 px-6 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-background" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="neon-text">BarberPro</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
            <Shield className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium text-muted-foreground">Área Administrativa</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="neon-card p-8 border-primary/20 bg-card/60 backdrop-blur-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold neon-text mb-2">
                Painel da Barbearia
              </h1>
              <p className="text-muted-foreground">
                Entre com sua senha de administrador para gerenciar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome da Barbearia (Visual Apenas) */}
              <div className="bg-muted/30 p-3 rounded-lg text-center border border-border/50 mb-6">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Acessando</span>
                <p className="font-display font-semibold text-lg text-foreground mt-1 capitalize">{slug?.replace(/-/g, ' ')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-12 bg-background/50 border-input/50 focus:border-neon-cyan/50 focus:ring-neon-cyan/20"
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" variant="neon" className="w-full font-bold shadow-neon hover:shadow-neon-hover transition-all" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Painel
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <Scissors className="w-5 h-5 text-neon-cyan" />
            <span className="font-display text-lg">BarberPro</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 BarberPro. Sistema de Gestão de Barbearias.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BarbeariaLogin;
