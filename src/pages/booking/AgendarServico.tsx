import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Scissors, Clock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockServicos, mockBarbearias } from '@/data/mockData';

const AgendarServico = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(null);

  const barbearia = mockBarbearias.find(b => b.slug === slug);

  const handleContinuar = () => {
    if (servicoSelecionado) {
      localStorage.setItem('agendamento.servico', servicoSelecionado);
      navigate(`/agendar/${slug}/barbeiro`);
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
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="neon-text">{barbearia?.nome || 'Barbearia'}</span>
          </h1>
          <p className="text-muted-foreground">Escolha o serviço desejado</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['Serviço', 'Barbeiro', 'Data', 'Horário', 'Pagamento'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                {i < 4 && <div className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Serviços Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mockServicos.map((servico, index) => (
            <motion.button
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setServicoSelecionado(servico.id)}
              className={`neon-card-hover text-left transition-all ${
                servicoSelecionado === servico.id
                  ? 'border-primary shadow-neon'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Scissors className="w-7 h-7 text-neon-cyan" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-display font-semibold">{servico.nome}</h3>
                    {servicoSelecionado === servico.id && (
                      <CheckCircle className="w-6 h-6 text-neon-green" />
                    )}
                  </div>
                  {servico.descricao && (
                    <p className="text-muted-foreground text-sm mt-1">{servico.descricao}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{servico.duracaoMinutos} min</span>
                    </div>
                    <span className="text-2xl font-display font-bold neon-text">
                      R$ {servico.preco.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

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
            disabled={!servicoSelecionado}
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

export default AgendarServico;
