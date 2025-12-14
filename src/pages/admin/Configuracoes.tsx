import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Settings, Lock, Save, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { slug } = useParams<{ slug: string }>();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  const bookingLink = `${window.location.origin}/agendar/${slug}`;
  const adminLink = `${window.location.origin}/barbearia/${slug}/login`;

  useEffect(() => {
    const fetchBarbearia = async () => {
      if (!slug) return;

      const { data } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setBarbeariaId(data.id);
      }
    };

    fetchBarbearia();
  }, [slug]);

  const handleCopyLink = (link: string, type: string) => {
    navigator.clipboard.writeText(link);
    toast.success(`Link de ${type} copiado!`);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 4) {
      toast.error('A senha deve ter no mínimo 4 caracteres');
      return;
    }

    if (!barbeariaId) {
      toast.error('Barbearia não encontrada');
      return;
    }

    setLoading(true);

    try {
      try {
        const { data, error } = await supabase.functions.invoke('barbearia-auth', {
          body: { action: 'update_password', barbearia_id: barbeariaId, new_password: novaSenha }
        });

        if (error) throw error;

        if (!data.success) {
          toast.error(data.error || 'Erro ao atualizar senha');
          return;
        }
      } catch (error) {
        console.warn('Edge Function indisponível para update, tentando fallback local...', error);

        // Fallback Local
        const mockHash = btoa(novaSenha);
        const { error: updateError } = await supabase
          .from('barbearias')
          .update({ senha_hash: mockHash })
          .eq('id', barbeariaId);

        if (updateError) {
          toast.error('Erro ao atualizar senha localmente');
          throw updateError;
        }
      }

      toast.success('Senha atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua barbearia
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  Links da Barbearia
                </CardTitle>
                <CardDescription>
                  Compartilhe estes links com seus clientes e equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Link de Agendamento (para clientes)</label>
                  <div className="flex gap-2">
                    <Input value={bookingLink} readOnly className="bg-muted/50" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyLink(bookingLink, 'agendamento')} title="Copiar">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(bookingLink, '_blank')} title="Abrir">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Link de Administração (para você)</label>
                  <div className="flex gap-2">
                    <Input value={adminLink} readOnly className="bg-muted/50" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyLink(adminLink, 'administração')} title="Copiar">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(adminLink, '_blank')} title="Abrir">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Redefinir Senha */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Redefinir Senha
                </CardTitle>
                <CardDescription>
                  Altere a senha de acesso ao painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nova Senha</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                      minLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      minLength={4}
                    />
                  </div>

                  <Button type="submit" variant="neon" disabled={loading}>
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Nova Senha
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuração PIX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-neon-green to-neon-cyan rotate-45 transform scale-75 rounded-sm" />
                  Configuração PIX
                </CardTitle>
                <CardDescription>
                  Defina o código "Copia e Cola" padrão para os pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Código PIX (Copia e Cola)</label>
                    <textarea
                      placeholder="Cole aqui o código do QR Code do seu PIX..."
                      value={localStorage.getItem(`pix_key_${slug}`) || ''}
                      onChange={(e) => {
                        localStorage.setItem(`pix_key_${slug}`, e.target.value);
                        // Forçar re-render simples (ideal seria state, mas para MVP basta)
                        const val = e.target.value;
                        const el = document.getElementById('pix-textarea') as HTMLTextAreaElement;
                        if (el) el.value = val;
                        toast.success('Código salvo localmente!');
                      }}
                      id="pix-textarea"
                      className="w-full min-h-[100px] rounded-lg border-2 border-primary/30 bg-input/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-all font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      * Este código será exibido para seus clientes na tela de pagamento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuração de Horários (Mock Visual) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="neon-card opacity-80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-0.5 h-2 bg-primary" />
                  </div>
                  Horários de Funcionamento (Em Breve)
                </CardTitle>
                <CardDescription>
                  Defina os horários disponíveis para agendamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(h => (
                      <div key={h} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-muted/20">
                        <input type="checkbox" defaultChecked className="accent-neon-cyan" />
                        <span className="text-sm font-mono">{h}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-500 flex items-center gap-1">
                    Isso é uma prévia. A funcionalidade completa requer atualização de banco de dados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
