import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';

const AgendarHorario = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Recuperar dados do localStorage
  const barbeiroId = localStorage.getItem('agendamento.barbeiro');
  const dataSelecionada = localStorage.getItem('agendamento.data');
  const servicoId = localStorage.getItem('agendamento.servico');

  const { data: horariosData, isLoading } = useHorariosDisponiveis({
    barbeariaSlug: slug,
    barbeiroId: barbeiroId || undefined,
    data: dataSelecionada || undefined,
    servicoId: servicoId || undefined,
  });

  const todosHorarios = horariosData?.todosHorarios || [];
  const horariosOcupados = horariosData?.ocupados || [];

  const handleContinuar = () => {
    if (horarioSelecionado) {
      localStorage.setItem('agendamento.horario', horarioSelecionado);
      navigate(`/agendar/${slug}/pagamento`);
    }
  };

  // Verificar se os dados anteriores existem
  useEffect(() => {
    if (!barbeiroId || !dataSelecionada) {
      navigate(`/agendar/${slug}`);
    }
  }, [barbeiroId, dataSelecionada, navigate, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não houver horários (por exemplo, dia fechado ou erro)
  const noSlots = todosHorarios.length === 0;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Button variant="ghost" onClick={() => navigate(`/agendar/${slug}/data`)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-display font-bold mb-2 neon-text">
            Escolha o Horário
          </h1>
          <p className="text-muted-foreground">Selecione o horário disponível</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['Serviço', 'Barbeiro', 'Data', 'Horário', 'Pagamento'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= 3 ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                  }`}>
                  {i < 3 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${i < 3 ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Horários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neon-card mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-display font-semibold">Horários Disponíveis</h2>
          </div>

          {noSlots ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>Nenhum horário disponível para este dia.</p>
              <Button variant="link" onClick={() => navigate(`/agendar/${slug}/data`)} className="mt-2 text-primary">
                Escolher outra data
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {todosHorarios.map((horario, index) => {
                const isOcupado = horariosOcupados.includes(horario);
                const isSelected = horarioSelecionado === horario;

                return (
                  <motion.button
                    key={horario}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    disabled={isOcupado}
                    onClick={() => setHorarioSelecionado(horario)}
                    className={`p-4 rounded-xl text-center transition-all ${isOcupado
                      ? 'bg-muted/30 text-muted-foreground cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-primary/20 border-2 border-primary shadow-neon'
                        : 'bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/50'
                      }`}
                  >
                    <span className={`text-lg font-display font-bold ${isSelected ? 'neon-text' : ''}`}>
                      {horario}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-neon-green mx-auto mt-2" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {!noSlots && (
            <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/50 border border-border/50" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/30" />
                <span>Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary" />
                <span>Selecionado</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Continuar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="xl"
            variant="neon"
            disabled={!horarioSelecionado}
            onClick={handleContinuar}
          >
            Continuar para Pagamento
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AgendarHorario;
