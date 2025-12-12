import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, ArrowLeft, CheckCircle, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBarbeirosBySlug } from '@/hooks/useBarbeiros';

const AgendarBarbeiro = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string | null>(null);

  const { data: barbeiros, isLoading } = useBarbeirosBySlug(slug);

  const handleContinuar = () => {
    if (barbeiroSelecionado) {
      const barbeiro = barbeiros?.find(b => b.id === barbeiroSelecionado);
      localStorage.setItem('agendamento.barbeiro', barbeiroSelecionado);
      localStorage.setItem('agendamento.barbeiroNome', barbeiro?.nome || '');
      navigate(`/agendar/${slug}/data`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Button variant="ghost" onClick={() => navigate(`/agendar/${slug}`)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-display font-bold mb-2 neon-text">
            Escolha o Barbeiro
          </h1>
          <p className="text-muted-foreground">Selecione o profissional de sua preferência</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['Serviço', 'Barbeiro', 'Data', 'Horário', 'Pagamento'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= 1 ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${i < 1 ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Barbeiros Grid */}
        {barbeiros && barbeiros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {barbeiros.map((barbeiro, index) => (
              <motion.button
                key={barbeiro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setBarbeiroSelecionado(barbeiro.id)}
                className={`neon-card-hover text-center transition-all ${
                  barbeiroSelecionado === barbeiro.id
                    ? 'border-primary shadow-neon'
                    : ''
                }`}
              >
                <div className="relative inline-block mb-4">
                  {barbeiro.foto_url ? (
                    <img
                      src={barbeiro.foto_url}
                      alt={barbeiro.nome}
                      className="w-24 h-24 rounded-full object-cover mx-auto shadow-neon"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <User className="w-10 h-10 text-neon-cyan" />
                    </div>
                  )}
                  {barbeiroSelecionado === barbeiro.id && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-background" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-display font-semibold mb-2">{barbeiro.nome}</h3>
                
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{barbeiro.avaliacao || 5.0}</span>
                </div>

                {barbeiro.bio && (
                  <p className="text-muted-foreground text-sm mb-4">{barbeiro.bio}</p>
                )}

                {barbeiro.especialidades && barbeiro.especialidades.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {barbeiro.especialidades.slice(0, 2).map((esp) => (
                      <span
                        key={esp}
                        className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="neon-card text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum barbeiro disponível</h3>
            <p className="text-muted-foreground">Esta barbearia ainda não cadastrou barbeiros</p>
          </div>
        )}

        {/* Continuar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            size="xl"
            variant="neon"
            disabled={!barbeiroSelecionado}
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

export default AgendarBarbeiro;
