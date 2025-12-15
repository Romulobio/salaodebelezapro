import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, Users, Scissors, DollarSign, Clock, Loader2, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/cards/StatCard';
import { Button } from '@/components/ui/button';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';
import { useAgendamentos, useUpdateAgendamentoStatus } from '@/hooks/useAgendamentos';
import { useServicosBySlug } from '@/hooks/useServicos';

import { useBarbeariaPlan } from '@/hooks/useBarbeariaPlan';

const AdminDashboard = () => {
  const { slug } = useParams<{ slug: string }>();

  // Dados Reais
  const { data: barbearia } = useBarbeariaBySlug(slug);
  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useAgendamentos(barbearia?.id);
  const { data: servicos = [] } = useServicosBySlug(slug);
  const updateStatus = useUpdateAgendamentoStatus();

  const { data: plano } = useBarbeariaPlan(barbearia?.id, barbearia?.plano_tipo);

  // Lógica de Bloqueio WhatsApp
  // Bloqueia se o plano tiver nome 'basico' (case insensitive) ou se for o ID 'basico' legado
  const isBasicPlan =
    (plano?.nome && plano.nome.toLowerCase().includes('básico')) ||
    (plano?.nome && plano.nome.toLowerCase().includes('basico')) ||
    barbearia?.plano_tipo === 'basico';

  const handleWhatsApp = (telefone: string | null, tipo: 'confirmacao' | 'lembrete', agendamento: any) => {
    if (isBasicPlan) {
      // toast.error is not imported but we can import it or just return.
      // Better to disable the button in UI, but safety check here too.
      return;
    }
    if (!telefone) return;
    const tel = telefone.replace(/\D/g, '');
    const dataFormatada = new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR');
    let mensagem = '';

    if (tipo === 'confirmacao') {
      mensagem = `Olá ${agendamento.cliente_nome}, tudo bem? Sou da ${agendamento.barbearia?.nome || 'Barbearia'}. Gostaria de confirmar seu agendamento para ${dataFormatada} às ${agendamento.hora}.`;
    } else {
      mensagem = `Olá ${agendamento.cliente_nome}! Passando para lembrar do seu horário hoje (${dataFormatada}) às ${agendamento.hora} na ${agendamento.barbearia?.nome || 'Barbearia'}.`;
    }

    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  // Cálculos Estatísticas
  const stats = useMemo(() => {
    if (!agendamentos) return null;

    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = new Date().getMonth();

    const _agendamentosHoje = agendamentos.filter(a => a.data === hoje);

    // Total Clientes (Únicos por nome, simplificado)
    const clientesUnicos = new Set(agendamentos.map(a => a.cliente_nome.toLowerCase().trim()));

    // Receita do Mês (Considerando apenas concluídos ou confirmados para previsão)
    const receitaMes = agendamentos
      .filter(a => {
        const itemDate = new Date(a.data + 'T12:00:00');
        return itemDate.getMonth() === mesAtual && (a.status === 'concluido' || a.status === 'confirmado');
      })
      .reduce((acc, curr) => acc + (curr.valor_total || 0), 0);

    return {
      agendamentosHoje: _agendamentosHoje.length,
      totalClientes: clientesUnicos.size,
      totalServicos: servicos?.length || 0,
      receitaMes,
      proximos: agendamentos
        .filter(a => a.status !== 'cancelado' && a.status !== 'concluido')
        .filter(a => a.data >= hoje)
        .sort((a, b) => {
          if (a.data === b.data) return a.hora.localeCompare(b.hora);
          return a.data.localeCompare(b.data);
        })
        .slice(0, 5)
    };
  }, [agendamentos, servicos]);

  const cards = [
    { title: 'Agendamentos Hoje', value: stats?.agendamentosHoje || 0, icon: Calendar, variant: 'default' as const },
    { title: 'Total Clientes', value: stats?.totalClientes || 0, icon: Users, variant: 'purple' as const },
    { title: 'Serviços Ativos', value: stats?.totalServicos || 0, icon: Scissors, variant: 'green' as const },
    { title: 'Receita do Mês', value: `R$ ${(stats?.receitaMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, variant: 'pink' as const },
  ];

  // Status Counter
  const statusCounts = useMemo(() => {
    return {
      confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
      pendente: agendamentos.filter(a => a.status === 'pendente').length,
      cancelado: agendamentos.filter(a => a.status === 'cancelado').length,
      concluido: agendamentos.filter(a => a.status === 'concluido').length,
    };
  }, [agendamentos]);

  // Serviços Populares
  const servicosPopulares = useMemo(() => {
    const counts: Record<string, number> = {};
    agendamentos.forEach(a => {
      if (a.servico?.nome) {
        const nome = a.servico.nome;
        counts[nome] = (counts[nome] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([nome, quantidade]) => ({ nome, quantidade }));
  }, [agendamentos]);


  if (loadingAgendamentos) {
    return (
      <DashboardLayout type="admin" barbeariaSlug={slug}>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold neon-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{barbearia?.nome || 'Minha Barbearia'}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((stat, i) => (
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
          </div>

          <div className="space-y-4">
            {stats?.proximos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum agendamento futuro.</p>
            ) : (
              stats?.proximos.map((ag, index) => (
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
                      <p className="font-semibold text-foreground">{ag.cliente_nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {ag.servico ? ag.servico.nome : 'Serviço excluído'}
                        <span className="ml-2 text-xs opacity-70">
                          ({new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR')})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">Barbeiro</p>
                      <p className="font-medium text-foreground">{ag.barbeiro ? ag.barbeiro.nome : 'N/A'}</p>
                    </div>

                    <div className="flex gap-2">
                      {ag.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 h-8 px-2"
                          title="Confirmar"
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ id: ag.id, status: 'confirmado', barbeariaId: barbearia!.id })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}

                      {(ag.status === 'pendente' || ag.status === 'confirmado') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                          title="Cancelar"
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ id: ag.id, status: 'cancelado', barbeariaId: barbearia!.id })}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}

                      {/* WhatsApp Actions */}
                      {ag.cliente_telefone && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={isBasicPlan ? "text-gray-500 cursor-not-allowed h-8 px-2" : "text-green-500 hover:text-green-400 hover:bg-green-500/10 h-8 px-2"}
                            title={isBasicPlan ? "WhatsApp não disponível no plano Básico" : "WhatsApp Confirmar"}
                            // @ts-ignore
                            onClick={() => {
                              if (isBasicPlan) return;
                              handleWhatsApp(ag.cliente_telefone, 'confirmacao', ag);
                            }}
                            disabled={isBasicPlan}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
            <h3 className="font-display font-semibold mb-4">Status Geral</h3>
            <div className="space-y-3">
              {[
                { label: 'Confirmados', value: statusCounts.confirmado, color: 'neon-green' },
                { label: 'Pendentes', value: statusCounts.pendente, color: 'neon-cyan' },
                { label: 'Concluídos', value: statusCounts.concluido, color: 'primary' },
                { label: 'Cancelados', value: statusCounts.cancelado, color: 'destructive' },
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
            <h3 className="font-display font-semibold mb-4">Serviços Mais Agendados</h3>
            <div className="space-y-3">
              {servicosPopulares.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não há dados suficientes.</p>
              ) : (
                servicosPopulares.map((servico) => (
                  <div key={servico.nome} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{servico.nome}</span>
                    <span className="font-semibold neon-text">{servico.quantidade}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
