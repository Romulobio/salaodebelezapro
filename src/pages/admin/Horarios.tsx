import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Horarios = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(false);
    const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

    // Estados da Agenda
    const [diaConfig, setDiaConfig] = useState<string[]>(['seg', 'ter', 'qua', 'qui', 'sex', 'sab']);
    const [horarioInicio, setHorarioInicio] = useState('09:00');
    const [horarioFim, setHorarioFim] = useState('19:00');
    const [intervalo, setIntervalo] = useState('30');

    // Break times
    const [almocoInicio, setAlmocoInicio] = useState('');
    const [almocoFim, setAlmocoFim] = useState('');
    const [jantarInicio, setJantarInicio] = useState('');
    const [jantarFim, setJantarFim] = useState('');

    useEffect(() => {
        const fetchBarbearia = async () => {
            if (!slug) return;
            const { data } = await supabase
                .from('barbearias')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();
            if (data) {
                setBarbeariaId(data.id);
            }
        };
        fetchBarbearia();
    }, [slug]);

    useEffect(() => {
        if (barbeariaId) {
            loadAgendaConfig();
        }
    }, [barbeariaId]);

    const loadAgendaConfig = async () => {
        // @ts-ignore
        const { data } = await supabase
            .from('agenda_config')
            .select('*')
            .eq('barbearia_id', barbeariaId)
            .maybeSingle();

        if (data) {
            const dataAny = data as any;
            setDiaConfig((data.dias_funcionamento as string[]) || []);
            setHorarioInicio(data.horario_inicio || '09:00');
            setHorarioFim(data.horario_fim || '19:00');
            setIntervalo(data.intervalo_minutos?.toString() || '30');

            // Breaks
            setAlmocoInicio(dataAny.almoco_inicio || '');
            setAlmocoFim(dataAny.almoco_fim || '');
            setJantarInicio(dataAny.jantar_inicio || '');
            setJantarFim(dataAny.jantar_fim || '');
        }
    };

    const handleSave = async () => {
        if (!barbeariaId) return;
        setLoading(true);

        const payload = {
            barbearia_id: barbeariaId,
            dias_funcionamento: diaConfig,
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            intervalo_minutos: parseInt(intervalo),
            almoco_inicio: almocoInicio || null,
            almoco_fim: almocoFim || null,
            jantar_inicio: jantarInicio || null,
            jantar_fim: jantarFim || null,
        } as any;

        // Usando upsert mas tomando cuidado. 
        // O ideal seria update se já existir, mas upsert resolve se mantermos os outros campos ou se o banco aceitar partial update no upsert.
        // Supabase upsert faz merge por padrão se não especificar ignoreDuplicates ou algo assim?
        // Não, upsert substitui a linha se houver conflito na PK/Constraint.
        // Para evitar apagar o PIX, vamos buscar os dados atuais antes de salvar, ou melhor, usar UPDATE se já existir.

        // Verificando se já existe config
        const { data: existing } = await supabase.from('agenda_config').select('id').eq('barbearia_id', barbeariaId).maybeSingle();

        let error;
        if (existing) {
            // @ts-ignore
            ({ error } = await supabase.from('agenda_config').update(payload).eq('barbearia_id', barbeariaId));
        } else {
            // @ts-ignore
            ({ error } = await supabase.from('agenda_config').insert(payload));
        }

        setLoading(false);
        if (error) {
            toast.error('Erro ao salvar horários');
            console.error(error);
        } else {
            toast.success('Horários atualizados com sucesso!');
        }
    };

    const toggleDia = (dia: string) => {
        if (diaConfig.includes(dia)) {
            setDiaConfig(prev => prev.filter(d => d !== dia));
        } else {
            setDiaConfig(prev => [...prev, dia]);
        }
    };

    return (
        <DashboardLayout type="admin" barbeariaSlug={slug}>
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3 mb-2">
                        <Clock className="w-8 h-8 text-primary" />
                        Horários de Funcionamento
                    </h1>
                    <p className="text-muted-foreground">
                        Defina seus dias e horários de atendimento
                    </p>
                </motion.div>

                <Card className="neon-card">
                    <CardHeader>
                        <CardTitle>Configuração Semanal</CardTitle>
                        <CardDescription>
                            Ajuste sua jornada de trabalho e tempo de serviço
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Horários e Intervalo */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Horário Início</label>
                                    <Input
                                        type="time"
                                        value={horarioInicio}
                                        onChange={(e) => setHorarioInicio(e.target.value)}
                                        className="bg-background border-neon-cyan/50 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Horário Fim</label>
                                    <Input
                                        type="time"
                                        value={horarioFim}
                                        onChange={(e) => setHorarioFim(e.target.value)}
                                        className="bg-background border-neon-cyan/50 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Intervalo (min)</label>
                                    <Input
                                        type="number"
                                        min="15"
                                        step="15"
                                        value={intervalo}
                                        onChange={(e) => setIntervalo(e.target.value)}
                                        className="bg-background border-neon-cyan/50 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Início Almoço (Opcional)</label>
                                    <Input
                                        type="time"
                                        value={almocoInicio}
                                        onChange={(e) => setAlmocoInicio(e.target.value)}
                                        className="bg-background border-neon-cyan/30 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Fim Almoço (Opcional)</label>
                                    <Input
                                        type="time"
                                        value={almocoFim}
                                        onChange={(e) => setAlmocoFim(e.target.value)}
                                        className="bg-background border-neon-cyan/30 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Início Jantar (Opcional)</label>
                                    <Input
                                        type="time"
                                        value={jantarInicio}
                                        onChange={(e) => setJantarInicio(e.target.value)}
                                        className="bg-background border-neon-cyan/30 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Fim Jantar (Opcional)</label>
                                    <Input
                                        type="time"
                                        value={jantarFim}
                                        onChange={(e) => setJantarFim(e.target.value)}
                                        className="bg-background border-neon-cyan/30 text-white"
                                    />
                                </div>
                            </div>

                            {/* Dias da Semana */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Dias de Funcionamento</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'seg', label: 'Seg' },
                                        { id: 'ter', label: 'Ter' },
                                        { id: 'qua', label: 'Qua' },
                                        { id: 'qui', label: 'Qui' },
                                        { id: 'sex', label: 'Sex' },
                                        { id: 'sab', label: 'Sáb' },
                                        { id: 'dom', label: 'Dom' }
                                    ].map((dia) => (
                                        <button
                                            key={dia.id}
                                            onClick={() => toggleDia(dia.id)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${diaConfig.includes(dia.id)
                                                ? 'bg-primary text-primary-foreground shadow-neon'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            {dia.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleSave} disabled={loading} variant="neon" className="w-full sm:w-auto">
                                {loading ? <div className="animate-spin w-4 h-4 rounded-full border-2 border-background border-t-transparent" /> : 'Salvar Horários'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Horarios;
