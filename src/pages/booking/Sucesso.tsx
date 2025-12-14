import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { CheckCircle, Calendar, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sucesso = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-neon-green/20 flex items-center justify-center shadow-[0_0_40px_hsl(150_100%_50%_/_0.5)]"
        >
          <CheckCircle className="w-12 h-12 text-neon-green" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Pagamento confirmado</span>
            <Sparkles className="w-5 h-5 text-neon-cyan" />
          </div>

          <h1 className="text-4xl font-display font-bold mb-4">
            Agendamento{' '}
            <span className="neon-text">Confirmado!</span>
          </h1>

          <p className="text-muted-foreground text-lg mb-8">
            Seu horário foi reservado com sucesso. Você receberá uma confirmação por email.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neon-card mb-8"
        >
          <div className="flex items-center justify-center gap-3 text-neon-cyan">
            <Calendar className="w-6 h-6" />
            <span className="font-display font-semibold text-lg">Lembrete salvo!</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Enviaremos um lembrete 1 hora antes do seu horário
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" variant="neon" onClick={() => window.close()}>
            Fechar Página
            <X className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-muted-foreground mt-8"
        >
          💈 Obrigado por escolher nossa barbearia!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Sucesso;
