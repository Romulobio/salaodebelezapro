import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Calendar, CreditCard, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-muted-foreground">Sistema de Salão de Beleza Futurista</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="neon-text animate-glow">BeautyPro</span>
              <br />
              <span className="text-foreground/90">Gestão Inteligente</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              O sistema mais avançado para gerenciar seu salão de beleza.
              Agendamentos, pagamentos PIX e gestão completa em uma única plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="neon" asChild>
                <Link to="/auth/login">
                  Painel Gerenciador
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Calendar, title: 'Agendamento Online', desc: 'Sistema inteligente de horários' },
              { icon: CreditCard, title: 'Pagamento PIX', desc: 'Receba instantaneamente' },
              { icon: Scissors, title: 'Gestão Completa', desc: 'Serviços, barbeiros e clientes' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="neon-card-hover text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-neon">
                  <item.icon className="w-7 h-7 text-neon-cyan" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Tudo que você <span className="neon-text">precisa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sistema completo para gerenciar múltiplos salões de beleza com painel exclusivo para cada um
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Multi-Unidades', desc: 'Cadastre e gerencie vários salões com links exclusivos para cada um', color: 'cyan' },
              { icon: Shield, title: 'Painel Admin', desc: 'Cada salão tem seu próprio painel completo de gestão', color: 'purple' },
              { icon: Clock, title: 'Tempo Real', desc: 'Agenda atualizada em tempo real com notificações', color: 'green' },
              { icon: CreditCard, title: 'Pagamento PIX', desc: 'Integração com Mercado Pago para pagamentos instantâneos', color: 'pink' },
              { icon: Calendar, title: 'Fluxo Completo', desc: 'Do agendamento à confirmação em poucos cliques', color: 'cyan' },
              { icon: Scissors, title: 'CRUD Completo', desc: 'Gestão de serviços, barbeiros e clientes', color: 'purple' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neon-card-hover group"
              >
                <div className={`w-12 h-12 rounded-xl bg-neon-${feature.color}/10 flex items-center justify-center mb-4 group-hover:shadow-neon transition-all`}>
                  <feature.icon className={`w-6 h-6 text-neon-${feature.color}`} />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="neon-card p-12 border-2 border-primary/30">
            <Scissors className="w-16 h-16 mx-auto mb-6 text-neon-cyan animate-pulse" />
            <h2 className="text-4xl font-display font-bold mb-4">
              Comece <span className="neon-text">Agora</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Acesse o painel gerenciador e cadastre seu primeiro salão em minutos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="neon" asChild>
                <Link to="/auth/login">
                  Acessar Painel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-neon-cyan" />
            <span className="font-display text-lg">BeautyPro</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 BeautyPro. Sistema de Gestão de Salões de Beleza.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
