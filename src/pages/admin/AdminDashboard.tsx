import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, Users, Scissors, DollarSign, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/cards/StatCard';
import { mockDashboard, mockAgendamentos } from '@/data/mockData';

const AdminDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = mockDashboard;

  const stats = [
    { title: 'Agendamentos Hoje', value: data.agendamentosHoje, icon: Calendar, variant: 'default' as const },
    { title: 'Total Clientes', value: data.totalClientes, icon: Users, variant: 'purple' as const },
    { title: 'Serviços Ativos', value: data.totalServicos, icon: Scissors, variant: 'green' as const },
    { title: 'Receita do Mês', value: `R$ ${data.receitaMes.toLocaleString('pt-BR')}`, icon: DollarSign, variant: 'pink' as const },
  ];

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold neon-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{data.barbearia}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* Próximos Agendamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neon-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-neon-cyan" />
              Próximos Horários
            </h2>
            <span className="text-sm text-muted-foreground">Hoje</span>
          </div>

          <div className="space-y-4">
            {data.proximos.map((ag, index) => (
              <motion.div
                key={ag.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shadow-neon">
                    <span className="text-lg font-display font-bold text-neon-cyan">{ag.hora}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{ag.cliente}</p>
                    <p className="text-sm text-muted-foreground">{ag.servico}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Barbeiro</p>
                  <p className="font-medium text-foreground">{ag.barbeiro}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="neon-card"
          >
            <h3 className="font-display font-semibold mb-4">Status dos Agendamentos</h3>
            <div className="space-y-3">
              {[
                { label: 'Confirmados', value: 8, color: 'neon-green' },
                { label: 'Pendentes', value: 3, color: 'neon-cyan' },
                { label: 'Cancelados', value: 1, color: 'destructive' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${item.color}`} />
                    <span className="font-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="neon-card"
          >
            <h3 className="font-display font-semibold mb-4">Serviços Mais Populares</h3>
            <div className="space-y-3">
              {[
                { nome: 'Corte + Barba', quantidade: 45 },
                { nome: 'Degradê', quantidade: 32 },
                { nome: 'Corte Clássico', quantidade: 28 },
              ].map((servico, i) => (
                <div key={servico.nome} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{servico.nome}</span>
                  <span className="font-semibold neon-text">{servico.quantidade}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
