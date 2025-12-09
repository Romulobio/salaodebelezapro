import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Users, Scissors, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAgendamentos, mockBarbeiros, mockServicos } from '@/data/mockData';
import { cn } from '@/lib/utils';

type PeriodoFiltro = 'diario' | 'semanal' | 'mensal' | 'anual' | 'total';

const Financeiro = () => {
  const { slug } = useParams<{ slug: string }>();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mensal');

  // Filtrar apenas agendamentos concluídos para cálculo de receita
  const agendamentosConcluidos = mockAgendamentos.filter(ag => ag.status === 'concluido');

  // Calcular receita total
  const receitaTotal = agendamentosConcluidos.reduce((acc, ag) => acc + ag.valorTotal, 0);

  // Simular receitas por período (em produção viria do backend)
  const receitaPorPeriodo = {
    diario: receitaTotal * 0.05,
    semanal: receitaTotal * 0.25,
    mensal: receitaTotal * 0.7,
    anual: receitaTotal * 2.5,
    total: receitaTotal,
  };

  // Receita por profissional
  const receitaPorBarbeiro = mockBarbeiros.map(barbeiro => {
    const agendamentosBarbeiro = agendamentosConcluidos.filter(ag => ag.barbeiroId === barbeiro.id);
    const receita = agendamentosBarbeiro.reduce((acc, ag) => acc + ag.valorTotal, 0);
    const quantidade = agendamentosBarbeiro.length;
    return {
      ...barbeiro,
      receita,
      quantidade,
    };
  });

  // Receita por serviço
  const receitaPorServico = mockServicos.map(servico => {
    const agendamentosServico = agendamentosConcluidos.filter(ag => ag.servicoId === servico.id);
    const receita = agendamentosServico.reduce((acc, ag) => acc + ag.valorTotal, 0);
    const quantidade = agendamentosServico.length;
    return {
      ...servico,
      receita,
      quantidade,
    };
  });

  const periodos: { value: PeriodoFiltro; label: string }[] = [
    { value: 'diario', label: 'Diário' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'anual', label: 'Anual' },
    { value: 'total', label: 'Total' },
  ];

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold neon-text">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Acompanhe suas receitas e métricas financeiras</p>
        </motion.div>

        {/* Filtros de Período */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {periodos.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                periodo === p.value
                  ? "bg-primary text-primary-foreground shadow-neon"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {p.label}
            </button>
          ))}
        </motion.div>

        {/* Cards de Receita Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="neon-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-neon-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita {periodos.find(p => p.value === periodo)?.label}</p>
                <p className="text-2xl font-display font-bold neon-text">
                  R$ {receitaPorPeriodo[periodo].toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="neon-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-display font-bold text-primary">
                  R$ {receitaTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="neon-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-neon-cyan" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atendimentos</p>
                <p className="text-2xl font-display font-bold text-neon-cyan">
                  {agendamentosConcluidos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="neon-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-neon-purple/10 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-neon-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-display font-bold text-neon-purple">
                  R$ {agendamentosConcluidos.length > 0 
                    ? (receitaTotal / agendamentosConcluidos.length).toFixed(2) 
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Receita por Profissional */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="neon-card"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <Users className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-xl font-display font-semibold">Receita por Profissional</h2>
            </div>

            <div className="space-y-4">
              {receitaPorBarbeiro.map((barbeiro, index) => {
                const porcentagem = receitaTotal > 0 ? (barbeiro.receita / receitaTotal) * 100 : 0;
                return (
                  <motion.div
                    key={barbeiro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={barbeiro.fotoUrl}
                          alt={barbeiro.nome}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                        />
                        <div>
                          <p className="font-medium">{barbeiro.nome}</p>
                          <p className="text-xs text-muted-foreground">{barbeiro.quantidade} atendimentos</p>
                        </div>
                      </div>
                      <p className="font-display font-bold neon-text">
                        R$ {barbeiro.receita.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentagem}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}

              {receitaPorBarbeiro.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </motion.div>

          {/* Receita por Serviço */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="neon-card"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <Scissors className="w-5 h-5 text-neon-purple" />
              <h2 className="text-xl font-display font-semibold">Receita por Serviço</h2>
            </div>

            <div className="space-y-4">
              {receitaPorServico.map((servico, index) => {
                const porcentagem = receitaTotal > 0 ? (servico.receita / receitaTotal) * 100 : 0;
                return (
                  <motion.div
                    key={servico.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{servico.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {servico.quantidade} atendimentos • R$ {servico.preco.toFixed(2)}/un
                        </p>
                      </div>
                      <p className="font-display font-bold text-neon-purple">
                        R$ {servico.receita.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentagem}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}

              {receitaPorServico.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Financeiro;
