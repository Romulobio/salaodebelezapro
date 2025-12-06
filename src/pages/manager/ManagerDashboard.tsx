import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, Users, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/cards/StatCard';
import { BarbeariaCard } from '@/components/cards/BarbeariaCard';
import { Button } from '@/components/ui/button';
import { mockBarbearias } from '@/data/mockData';

const ManagerDashboard = () => {
  const stats = [
    { title: 'Total Barbearias', value: mockBarbearias.length, icon: Store, variant: 'default' as const, trend: { value: 12, isPositive: true } },
    { title: 'Clientes Ativos', value: '1.248', icon: Users, variant: 'purple' as const, trend: { value: 8, isPositive: true } },
    { title: 'Receita Total', value: 'R$ 24.580', icon: DollarSign, variant: 'green' as const, trend: { value: 15, isPositive: true } },
    { title: 'Taxa de Crescimento', value: '+23%', icon: TrendingUp, variant: 'pink' as const, trend: { value: 5, isPositive: true } },
  ];

  return (
    <DashboardLayout type="manager">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold neon-text">Painel Gerenciador</h1>
            <p className="text-muted-foreground mt-1">Gerencie todas as barbearias do sistema</p>
          </div>
          <Button variant="neon" asChild>
            <Link to="/manager/barbearias/nova">
              <Plus className="w-5 h-5 mr-2" />
              Nova Barbearia
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* Barbearias Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-semibold">Barbearias Cadastradas</h2>
            <Link to="/manager/barbearias" className="text-primary hover:underline text-sm">
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockBarbearias.map((barbearia, index) => (
              <BarbeariaCard key={barbearia.id} barbearia={barbearia} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
