import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAgendamentos } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Agendamento } from '@/types/barbershop';

const statusConfig = {
  pendente: { label: 'Pendente', icon: AlertCircle, className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  confirmado: { label: 'Confirmado', icon: CheckCircle, className: 'bg-neon-green/10 text-neon-green border-neon-green/30' },
  concluido: { label: 'Concluído', icon: CheckCircle, className: 'bg-primary/10 text-primary border-primary/30' },
  cancelado: { label: 'Cancelado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const Agenda = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);

  const agendamentosFiltrados = agendamentos.filter(ag => ag.data === data);

  const updateStatus = (id: string, novoStatus: Agendamento['status']) => {
    setAgendamentos(prev => prev.map(ag => 
      ag.id === id ? { ...ag, status: novoStatus } : ag
    ));
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
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="pl-12 w-48"
              />
            </div>
          </div>
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

          {agendamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
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
                    className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
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
                        <span className="font-semibold text-foreground">{ag.clienteNome}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {ag.servicoNome} • {ag.barbeiroNome}
                      </p>
                      <p className="text-lg font-display font-bold neon-text mt-1">
                        R$ {ag.valorTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium",
                      status.className
                    )}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 shrink-0">
                      {ag.status === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(ag.id, 'confirmado')}
                            className="text-neon-green border-neon-green/30 hover:bg-neon-green/10"
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(ag.id, 'cancelado')}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {ag.status === 'confirmado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(ag.id, 'concluido')}
                          className="text-primary border-primary/30 hover:bg-primary/10"
                        >
                          Concluir
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
