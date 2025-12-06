import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AgendarData = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  // Gerar próximos 14 dias
  const proximosDias = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatarDia = (date: Date) => {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[date.getDay()];
  };

  const formatarData = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleContinuar = () => {
    if (dataSelecionada) {
      localStorage.setItem('agendamento.data', dataSelecionada);
      navigate(`/agendar/${slug}/horario`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Button variant="ghost" onClick={() => navigate(`/agendar/${slug}/barbeiro`)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-display font-bold mb-2 neon-text">
            Escolha a Data
          </h1>
          <p className="text-muted-foreground">Selecione o melhor dia para você</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['Serviço', 'Barbeiro', 'Data', 'Horário', 'Pagamento'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= 2 ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < 2 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${i < 2 ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Calendário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neon-card mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-display font-semibold">Datas Disponíveis</h2>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {proximosDias.map((date, index) => {
              const dataStr = formatarData(date);
              const isSelected = dataSelecionada === dataStr;
              const isSunday = date.getDay() === 0;

              return (
                <motion.button
                  key={dataStr}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  disabled={isSunday}
                  onClick={() => setDataSelecionada(dataStr)}
                  className={`p-4 rounded-xl flex flex-col items-center transition-all ${
                    isSunday
                      ? 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary/20 border-2 border-primary shadow-neon'
                        : 'bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/50'
                  }`}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {formatarDia(date)}
                  </span>
                  <span className={`text-2xl font-display font-bold ${isSelected ? 'neon-text' : ''}`}>
                    {date.getDate()}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {date.toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-neon-green mt-2" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            * Domingos não disponíveis
          </p>
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
            disabled={!dataSelecionada}
            onClick={handleContinuar}
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AgendarData;
