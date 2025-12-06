import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de login - substituir por integração real com Supabase
    setTimeout(() => {
      if (email === 'admin@barberpro.com' && senha === 'admin123') {
        toast.success('Login realizado com sucesso!');
        navigate('/manager');
      } else if (email.includes('@')) {
        toast.success('Login realizado com sucesso!');
        navigate('/admin/neon-style');
      } else {
        toast.error('Credenciais inválidas');
      }
      setLoading(false);
    }, 1000);
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
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon">
                <Scissors className="w-6 h-6 text-background" />
              </div>
            </Link>
            <h1 className="text-3xl font-display font-bold neon-text mb-2">Bem-vindo</h1>
            <p className="text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

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

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Não tem uma conta?{' '}
              <Link to="/auth/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center mb-3">Credenciais de teste:</p>
            <div className="text-xs text-center space-y-1 text-muted-foreground">
              <p><span className="text-neon-cyan">Gerenciador:</span> admin@barberpro.com / admin123</p>
              <p><span className="text-neon-purple">Admin Barbearia:</span> qualquer@email.com / qualquer</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
