import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Filter, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBarbeariaBySlug } from '@/hooks/useBarbearia';
import { useAgendamentos, useUpdateAgendamentoStatus, Agendamento } from '@/hooks/useAgendamentos';
import { cn } from '@/lib/utils';

type StatusFiltro = 'todos' | 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

const statusConfig = {
  pendente: { label: 'Pendente', icon: AlertCircle, className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  confirmado: { label: 'Confirmado', icon: CheckCircle, className: 'bg-neon-green/10 text-neon-green border-neon-green/30' },
  concluido: { label: 'Concluído', icon: CheckCircle, className: 'bg-primary/10 text-primary border-primary/30' },
  cancelado: { label: 'Cancelado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const filtrosStatus: { value: StatusFiltro; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'cancelado', label: 'Cancelados' },
];

const Agenda = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');

  const { data: barbearia } = useBarbeariaBySlug(slug);
  const { data: agendamentos = [], isLoading } = useAgendamentos(barbearia?.id, data);
  const updateStatus = useUpdateAgendamentoStatus();

  const agendamentosFiltrados = agendamentos.filter(ag => {
    return statusFiltro === 'todos' || ag.status === statusFiltro;
  });

  const handleUpdateStatus = (id: string, novoStatus: Agendamento['status']) => {
    if (!barbearia?.id) return;
    updateStatus.mutate({ id, status: novoStatus, barbeariaId: barbearia.id });
  };

  // Contagem por status
  const contagens = {
    todos: agendamentos.length,
    pendente: agendamentos.filter(ag => ag.status === 'pendente').length,
    confirmado: agendamentos.filter(ag => ag.status === 'confirmado').length,
    concluido: agendamentos.filter(ag => ag.status === 'concluido').length,
    cancelado: agendamentos.filter(ag => ag.status === 'cancelado').length,
  };

  return (
    <DashboardLayout type="admin" barbeariaSlug={slug}>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold neon-text">Agenda</h1>
            <p className="text-muted-foreground mt-1">Visualize e gerencie os agendamentos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="pl-12 w-48 bg-background border-neon-cyan/50 text-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan/20 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Filtros de Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar:</span>
          </div>
          {filtrosStatus.map((filtro) => (
            <button
              key={filtro.value}
              onClick={() => setStatusFiltro(filtro.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                statusFiltro === filtro.value
                  ? "bg-primary text-primary-foreground shadow-neon"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {filtro.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                statusFiltro === filtro.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {contagens[filtro.value]}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="neon-card"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border/50">
            <h2 className="text-xl font-display font-semibold">
              Agendamentos do Dia
            </h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {agendamentosFiltrados.length} horários
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {statusFiltro === 'todos'
                  ? 'Nenhum agendamento para esta data'
                  : `Nenhum agendamento ${filtrosStatus.find(f => f.value === statusFiltro)?.label.toLowerCase()} para esta data`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentosFiltrados.map((ag, index) => {
                const status = statusConfig[ag.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={ag.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    {/* Hora */}
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex flex-col items-center justify-center shadow-neon shrink-0">
                      <Clock className="w-5 h-5 text-neon-cyan mb-1" />
                      <span className="text-lg font-display font-bold text-neon-cyan">{ag.hora}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{ag.cliente_nome}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {ag.servico?.nome || 'Serviço'} • {ag.barbeiro?.nome || 'Barbeiro'}
                      </p>
                      <p className="text-lg font-display font-bold neon-text mt-1">
                        R$ {Number(ag.valor_total).toFixed(2)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium shrink-0",
                      status.className
                    )}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {ag.status === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(ag.id, 'confirmado')}
                            disabled={updateStatus.isPending}
                            className="text-neon-green border-neon-green/30 hover:bg-neon-green/10"
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(ag.id, 'cancelado')}
                            disabled={updateStatus.isPending}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {ag.status === 'confirmado' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(ag.id, 'concluido')}
                            disabled={updateStatus.isPending}
                            className="text-primary border-primary/30 hover:bg-primary/10"
                          >
                            Concluir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(ag.id, 'cancelado')}
                            disabled={updateStatus.isPending}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {ag.status === 'concluido' && (
                        <span className="text-sm text-muted-foreground italic">Atendimento finalizado</span>
                      )}
                      {ag.status === 'cancelado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(ag.id, 'pendente')}
                          disabled={updateStatus.isPending}
                          className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                        >
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Legenda */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-4"
        >
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className={cn("w-4 h-4", config.className.split(' ')[1])} />
                {config.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Agenda;