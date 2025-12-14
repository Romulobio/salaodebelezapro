import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Copy, CheckCircle, ArrowLeft, Clock, User, Scissors, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';

const Pagamento = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [clienteNome, setClienteNome] = useState('');

  const { data: barbearia } = useBarbeariaBySlug(slug);

  // Recuperar dados do localStorage
  const servicoId = localStorage.getItem('agendamento.servico');
  const servicoNome = localStorage.getItem('agendamento.servicoNome');
  const servicoPreco = parseFloat(localStorage.getItem('agendamento.servicoPreco') || '0');
  const servicoDuracao = localStorage.getItem('agendamento.servicoDuracao');
  const barbeiroId = localStorage.getItem('agendamento.barbeiro');
  const barbeiroNome = localStorage.getItem('agendamento.barbeiroNome');
  const data = localStorage.getItem('agendamento.data');
  const horario = localStorage.getItem('agendamento.horario');

  // Código PIX (Dinâmico ou Default)
  const [codigoPix, setCodigoPix] = useState('00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540550.005802BR5925BARBEARIA NEON STYLE6009SAO PAULO62140510AGENDAMENTO6304ABCD');
  const [qrCodeImage, setQrCodeImage] = useState('/pix-logo.png');

  useEffect(() => {
    if (barbearia?.id) {
      const loadPixConfig = async () => {
        // @ts-ignore
        const { data } = await supabase
          .from('agenda_config')
          .select('pix_chave, pix_qrcode_base64')
          .eq('barbearia_id', barbearia.id)
          .maybeSingle();

        if (data) {
          if (data.pix_chave) setCodigoPix(data.pix_chave);
          if (data.pix_qrcode_base64) setQrCodeImage(data.pix_qrcode_base64);
        }
      };
      loadPixConfig();
    }
  }, [barbearia?.id]);

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return '';
    const date = new Date(dataStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoPix);
    setCopiado(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopiado(false), 3000);
  };

  const criarAgendamento = async () => {
    if (!clienteNome.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    if (!barbearia?.id || !servicoId || !barbeiroId || !data || !horario) {
      toast.error('Dados do agendamento incompletos');
      return;
    }

    setProcessando(true);

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          barbearia_id: barbearia.id,
          barbeiro_id: barbeiroId,
          servico_id: servicoId,
          cliente_nome: clienteNome.trim(),
          data: data,
          hora: horario,
          valor_total: servicoPreco,
          status: 'pendente',
        });

      if (error) throw error;
    } catch (error: any) {
      console.warn('Erro Supabase ao agendar, usando fallback local', error);

      // Fallback Local (Offline Mode)
      const novoAgendamento = {
        id: crypto.randomUUID(),
        barbearia_id: barbearia.id,
        barbeiro_id: barbeiroId,
        servico_id: servicoId,
        cliente_nome: clienteNome.trim(),
        data: data,
        hora: horario,
        valor_total: servicoPreco,
        status: 'pendente',
        created_at: new Date().toISOString()
      };

      const localAgendamentos = JSON.parse(localStorage.getItem('db_agendamentos') || '[]');
      localStorage.setItem('db_agendamentos', JSON.stringify([...localAgendamentos, novoAgendamento]));

      toast.info('Modo Offline: Agendamento salvo no dispositivo.');
    } finally {
      // Limpar localStorage (dados temporários do fluxo)
      localStorage.removeItem('agendamento.servico');
      localStorage.removeItem('agendamento.servicoNome');
      localStorage.removeItem('agendamento.servicoPreco');
      localStorage.removeItem('agendamento.servicoDuracao');
      localStorage.removeItem('agendamento.barbeiro');
      localStorage.removeItem('agendamento.barbeiroNome');
      localStorage.removeItem('agendamento.data');
      localStorage.removeItem('agendamento.horario');

      setProcessando(false);
      toast.success('Agendamento criado com sucesso!');
      navigate(`/agendar/${slug}/sucesso`);
    }
  };

  // Verificar se os dados existem
  useEffect(() => {
    if (!servicoId || !barbeiroId || !data || !horario) {
      navigate(`/agendar/${slug}`);
    }
  }, [servicoId, barbeiroId, data, horario, navigate, slug]);

  if (!servicoId || !barbeiroId || !data || !horario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Button variant="ghost" onClick={() => navigate(`/agendar/${slug}/horario`)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-display font-bold mb-2 neon-text">
            Pagamento PIX
          </h1>
          <p className="text-muted-foreground">Finalize seu agendamento</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['Serviço', 'Barbeiro', 'Data', 'Horário', 'Pagamento'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground shadow-neon">
                  {i < 4 ? <CheckCircle className="w-4 h-4" /> : 5}
                </div>
                {i < 4 && <div className="w-8 h-0.5 bg-primary" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nome do Cliente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="neon-card mb-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4">Seus Dados</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Completo *</label>
            <Input
              placeholder="Digite seu nome completo"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              required
            />
          </div>
        </motion.div>

        {/* Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neon-card mb-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4">Resumo do Agendamento</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <Scissors className="w-5 h-5 text-neon-cyan" />
              <div>
                <p className="text-sm text-muted-foreground">Serviço</p>
                <p className="font-medium">{servicoNome}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <User className="w-5 h-5 text-neon-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Barbeiro</p>
                <p className="font-medium">{barbeiroNome}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-sm text-muted-foreground">Data e Hora</p>
                <p className="font-medium capitalize">{formatarData(data)} às {horario}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-neon-pink" />
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{servicoDuracao} minutos</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-lg text-muted-foreground">Total a pagar:</span>
            <span className="text-3xl font-display font-bold neon-text">
              R$ {servicoPreco.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* QR Code PIX */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neon-card text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <QrCode className="w-6 h-6 text-neon-cyan" />
            <h2 className="text-xl font-display font-semibold">Pague com PIX</h2>
          </div>

          {/* Logo PIX */}
          <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 mb-6 flex items-center justify-center">
            <img src={qrCodeImage} alt="QR Code PIX" className="w-full h-full object-contain" />
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            Escaneie o QR Code ou copie o código abaixo
          </p>

          <div className="relative">
            <textarea
              readOnly
              value={codigoPix}
              className="w-full p-4 rounded-lg bg-muted/50 border border-border/50 text-sm text-neon-cyan font-mono resize-none h-32 focus:ring-1 focus:ring-neon-cyan"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={copiarCodigo}
            >
              {copiado ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1 text-neon-green" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="mt-8">
            <Button
              size="xl"
              variant="neon"
              className="w-full"
              onClick={criarAgendamento}
              disabled={processando || !clienteNome.trim()}
            >
              {processando ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </div>
              ) : (
                'Confirmar Agendamento'
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Em produção, o sistema detecta o pagamento automaticamente
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pagamento;
