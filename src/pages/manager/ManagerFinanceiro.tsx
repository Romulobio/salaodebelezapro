import { motion } from 'framer-motion';
import { DollarSign, Store, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/cards/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBarbearias } from '@/hooks/useBarbearia';
import { Progress } from '@/components/ui/progress';

const ManagerFinanceiro = () => {
  const { data: barbearias, isLoading } = useBarbearias();

  const barbeariasAtivas = barbearias?.filter(b => b.ativo !== false) || [];
  
  // Calcular receitas
  const receitaMensal = barbeariasAtivas.reduce((acc, b) => acc + (b.plano_valor || 0), 0);
  const receitaAnual = receitaMensal * 12;
  
  // Detalhamento por plano
  const planoStats = {
    basico: barbeariasAtivas.filter(b => b.plano_tipo === 'basico'),
    profissional: barbeariasAtivas.filter(b => b.plano_tipo === 'profissional'),
    premium: barbeariasAtivas.filter(b => b.plano_tipo === 'premium'),
  };

  const planoValores = {
    basico: 79.90,
    profissional: 129.90,
    premium: 199.90,
  };

  const stats = [
    { 
      title: 'Receita Mensal', 
      value: `R$ ${receitaMensal.toFixed(2)}`, 
      icon: DollarSign, 
      variant: 'green' as const,
      trend: { value: 12, isPositive: true }
    },
    { 
      title: 'Receita Anual (Projeção)', 
      value: `R$ ${receitaAnual.toFixed(2)}`, 
      icon: TrendingUp, 
      variant: 'purple' as const,
      trend: { value: 15, isPositive: true }
    },
    { 
      title: 'Barbearias Ativas', 
      value: barbeariasAtivas.length.toString(), 
      icon: Store, 
      variant: 'default' as const,
      trend: { value: 8, isPositive: true }
    },
    { 
      title: 'Ticket Médio', 
      value: barbeariasAtivas.length > 0 
        ? `R$ ${(receitaMensal / barbeariasAtivas.length).toFixed(2)}` 
        : 'R$ 0,00', 
      icon: CreditCard, 
      variant: 'pink' as const,
      trend: { value: 5, isPositive: true }
    },
  ];

  // Simular evolução da receita (últimos 6 meses)
  const evolucaoReceita = [
    { mes: 'Jul', valor: receitaMensal * 0.6 },
    { mes: 'Ago', valor: receitaMensal * 0.7 },
    { mes: 'Set', valor: receitaMensal * 0.75 },
    { mes: 'Out', valor: receitaMensal * 0.85 },
    { mes: 'Nov', valor: receitaMensal * 0.95 },
    { mes: 'Dez', valor: receitaMensal },
  ];

  const maxValor = Math.max(...evolucaoReceita.map(e => e.valor), 1);

  if (isLoading) {
    return (
      <DashboardLayout type="manager">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="manager">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold neon-text">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Visão geral das receitas e planos</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Detalhamento por Plano */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Detalhamento por Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plano Básico */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        Básico
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {planoStats.basico.length} barbearias
                      </span>
                    </div>
                    <span className="font-semibold">
                      R$ {(planoStats.basico.length * planoValores.basico).toFixed(2)}/mês
                    </span>
                  </div>
                  <Progress 
                    value={barbeariasAtivas.length > 0 ? (planoStats.basico.length / barbeariasAtivas.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Plano Profissional */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                        Profissional
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {planoStats.profissional.length} barbearias
                      </span>
                    </div>
                    <span className="font-semibold">
                      R$ {(planoStats.profissional.length * planoValores.profissional).toFixed(2)}/mês
                    </span>
                  </div>
                  <Progress 
                    value={barbeariasAtivas.length > 0 ? (planoStats.profissional.length / barbeariasAtivas.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                {/* Plano Premium */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30">
                        Premium
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {planoStats.premium.length} barbearias
                      </span>
                    </div>
                    <span className="font-semibold">
                      R$ {(planoStats.premium.length * planoValores.premium).toFixed(2)}/mês
                    </span>
                  </div>
                  <Progress 
                    value={barbeariasAtivas.length > 0 ? (planoStats.premium.length / barbeariasAtivas.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evolução da Receita */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Evolução da Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-48">
                  {evolucaoReceita.map((item, index) => (
                    <div key={item.mes} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.valor / maxValor) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-neon-cyan to-neon-purple rounded-t-md min-h-[4px]"
                      />
                      <span className="text-xs text-muted-foreground">{item.mes}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Crescimento no período:</span>
                    <span className="text-green-500 font-semibold">+66.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lista de Barbearias por Receita */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="neon-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Barbearias por Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {barbeariasAtivas
                  .sort((a, b) => (b.plano_valor || 0) - (a.plano_valor || 0))
                  .map((barbearia, index) => (
                    <div 
                      key={barbearia.id} 
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                        <div>
                          <p className="font-medium">{barbearia.nome}</p>
                          <p className="text-sm text-muted-foreground">{barbearia.proprietario_nome}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold neon-text">R$ {(barbearia.plano_valor || 0).toFixed(2)}/mês</p>
                        <p className="text-xs text-muted-foreground capitalize">{barbearia.plano_tipo}</p>
                      </div>
                    </div>
                  ))}
                {barbeariasAtivas.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma barbearia cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerFinanceiro;
